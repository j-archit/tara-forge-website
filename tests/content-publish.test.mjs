import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { editorFixture } from "./helpers/content-manager.mjs";
import { createStore } from "../tools/content-manager/storage.mjs";
import { createPublisher } from "../tools/content-manager/publish.mjs";
import { startContentManager } from "../tools/content-manager/server.mjs";

const run = promisify(execFile);
async function git(cwd, ...args) {
  const { stdout } = await run("git", ["-c", `safe.directory=${cwd.replaceAll("\\", "/")}`, ...args], { cwd, windowsHide: true });
  return stdout.trim();
}
async function fixture(t) {
  const site = await editorFixture();
  const remote = await mkdtemp(join(tmpdir(), "taraforge-remote-"));
  t.after(async () => { await site.cleanup(); await rm(remote, { recursive: true, force: true }); });
  await git(site.root, "init", "--initial-branch=main");
  await git(site.root, "config", "user.name", "Content Test");
  await git(site.root, "config", "user.email", "content-test@example.invalid");
  await git(remote, "init", "--bare", "--initial-branch=main");
  await git(site.root, "remote", "add", "origin", remote);
  await git(site.root, "add", "--", "content/gallery.json", "content/products.json");
  await git(site.root, "commit", "-m", "initial content");
  await git(site.root, "push", "-u", "origin", "main");
  const store = await createStore(site.root);
  return { ...site, remote, store, publisher: createPublisher(store) };
}

test("publish is restricted to main and requires a fresh reviewed state", async t => {
  const item = await fixture(t);
  await git(item.root, "switch", "-c", "feature");
  const loaded = await item.store.load("gallery");
  loaded.document.items[0].title = "Updated on feature";
  await item.store.save("gallery", loaded.document, loaded.revision);
  const feature = await item.publisher.review();
  assert.equal(feature.canPublish, false);
  await assert.rejects(item.publisher.publish(feature.reviewId), /only on main/);
  await git(item.root, "switch", "main");
  const review = await item.publisher.review();
  assert.equal(review.canPublish, true);
  await assert.rejects(item.publisher.publish("wrong"), /changed/);
  const changed = await item.store.load("gallery");
  changed.document.items[0].title = "Changed after review";
  await item.store.save("gallery", changed.document, changed.revision);
  await assert.rejects(item.publisher.publish(review.reviewId), /changed/);
  assert.equal(await git(item.root, "rev-parse", "HEAD"), await git(item.root, "rev-parse", "refs/remotes/origin/main"));
});

test("publish commits only managed documents and referenced new photos, preserving unrelated staged files", async t => {
  const item = await fixture(t);
  await writeFile(join(item.root, "unrelated.txt"), "keep me staged\n");
  await git(item.root, "add", "--", "unrelated.txt");
  const upload = await item.store.upload(item.png);
  const gallery = await item.store.load("gallery");
  gallery.document.items[0].image = { ...upload, alt: "A test print", fit: "contain" };
  gallery.document.items[0].title = "Published print";
  await item.store.save("gallery", gallery.document, gallery.revision);
  const review = await item.publisher.review();
  assert.equal(review.branch, "main");
  assert.deepEqual(review.changedDocuments, ["content/gallery.json"]);
  assert.equal(review.newAssets.length, 1);
  assert.match(review.diff, /Published print/);
  const result = await item.publisher.publish(review.reviewId);
  assert.equal(result.pushed, true);
  assert.equal(await git(item.root, "rev-parse", "HEAD"), await git(item.root, "ls-remote", "origin", "refs/heads/main").then(value => value.split(/\s+/)[0]));
  const committed = (await git(item.root, "show", "--pretty=format:", "--name-only", "HEAD")).split(/\r?\n/).filter(Boolean).sort();
  assert.deepEqual(committed, ["content/gallery.json", ...review.newAssets].sort());
  assert.equal(await git(item.root, "diff", "--cached", "--name-only"), "unrelated.txt");
  assert.equal(JSON.parse(await readFile(join(item.root, "content", "gallery.json"))).items[0].title, "Published print");
  assert.equal((await item.publisher.review()).canPublish, false);
});

test("publish refuses a remote main that moved before committing", async t => {
  const item = await fixture(t);
  const gallery = await item.store.load("gallery");
  gallery.document.items[0].title = "Local edit";
  await item.store.save("gallery", gallery.document, gallery.revision);
  const review = await item.publisher.review();
  const before = await git(item.root, "rev-parse", "HEAD");
  const other = await mkdtemp(join(tmpdir(), "taraforge-other-"));
  t.after(() => rm(other, { recursive: true, force: true }));
  await git(other, "clone", item.remote, ".");
  await git(other, "config", "user.name", "Other Test");
  await git(other, "config", "user.email", "other@example.invalid");
  await writeFile(join(other, "remote.txt"), "remote edit\n");
  await git(other, "add", "remote.txt");
  await git(other, "commit", "-m", "remote change");
  await git(other, "push", "origin", "main");
  await assert.rejects(item.publisher.publish(review.reviewId), /not up to date/);
  assert.equal(await git(item.root, "rev-parse", "HEAD"), before);
});

test("failed push leaves one content commit and a retry pushes that same commit", async t => {
  const item = await fixture(t);
  const gallery = await item.store.load("gallery");
  gallery.document.items[0].title = "Publish after retry";
  await item.store.save("gallery", gallery.document, gallery.revision);
  const review = await item.publisher.review();
  await git(item.root, "remote", "set-url", "--push", "origin", join(item.root, "missing-remote"));
  const first = await item.publisher.publish(review.reviewId);
  assert.equal(first.committed, true);
  assert.equal(first.pushed, false);
  const pending = await item.publisher.review();
  assert.equal(pending.pending.commit, first.commit);
  await git(item.root, "remote", "set-url", "--push", "origin", item.remote);
  const second = await item.publisher.publish(pending.reviewId);
  assert.equal(second.pushed, true);
  assert.equal(second.commit, first.commit);
  assert.equal(await git(item.root, "rev-list", "--count", "HEAD"), "2");
});

test("publish routes require the private session token", async t => {
  const item = await fixture(t);
  const manager = await startContentManager({ repoRoot: item.root, port: 0 });
  t.after(() => manager.close());
  const unauthorized = await fetch(`${manager.origin}/api/publish/review`);
  assert.equal(unauthorized.status, 403);
  const authorized = await fetch(`${manager.origin}/api/publish/review`, { headers: { "x-content-token": manager.token } });
  assert.equal(authorized.status, 200);
  const noReview = await fetch(`${manager.origin}/api/publish`, { method: "POST", headers: { "x-content-token": manager.token, "content-type": "application/json" }, body: "{}" });
  assert.equal(noReview.status, 400);
});

test("authenticated publish API commits and pushes reviewed content", async t => {
  const item = await fixture(t);
  const gallery = await item.store.load("gallery");
  gallery.document.items[0].title = "Published by API";
  await item.store.save("gallery", gallery.document, gallery.revision);
  const manager = await startContentManager({ repoRoot: item.root, port: 0 });
  t.after(() => manager.close());
  const headers = { "x-content-token": manager.token };
  const review = await (await fetch(`${manager.origin}/api/publish/review`, { headers })).json();
  const response = await fetch(`${manager.origin}/api/publish`, { method: "POST", headers: { ...headers, "content-type": "application/json" }, body: JSON.stringify({ reviewId: review.reviewId }) });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).pushed, true);
  assert.equal(await git(item.root, "rev-parse", "HEAD"), (await git(item.root, "ls-remote", "origin", "refs/heads/main")).split(/\s+/)[0]);
});

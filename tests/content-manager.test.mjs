import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, writeFile, mkdir, symlink, rename } from "node:fs/promises";
import { join } from "node:path";
import { request } from "node:http";
import sharp from "sharp";
import { validateDocument } from "../tools/content-manager/schema.mjs";
import { createStore, hash, MAX_IMAGE_BYTES } from "../tools/content-manager/storage.mjs";
import { startContentManager } from "../tools/content-manager/server.mjs";
import { editorFixture } from "./helpers/content-manager.mjs";

const gallery = () => ({ schemaVersion: 1, items: [{ id: "test-print", title: "Print", category: "Test", description: "A print", tags: [], theme: "blue", published: true, image: null }] });
const product = () => ({ schemaVersion: 1, items: [{ id: "tf-test", title: "Print", category: "Test", description: "A print", price: 12.5, currency: "₹", tag: "", theme: "blue", published: false, image: null }] });

test("schema accepts valid content, empty collections and plain-text punctuation", () => {
  validateDocument("gallery", gallery()); validateDocument("products", product());
  validateDocument("gallery", { schemaVersion: 1, items: [] });
  const doc = gallery(); doc.items[0].title = '<img src=x onerror="alert(1)">';
  validateDocument("gallery", doc); // Rendering, not string sanitisation, prevents XSS.
});

const badGallery = [
  ["schema version", doc => { doc.schemaVersion = 2; }],
  ["unknown fields", doc => { doc.items[0].html = "unsafe"; }],
  ["missing image", doc => { delete doc.items[0].image; }],
  ["duplicate IDs", doc => { doc.items.push({ ...doc.items[0] }); }],
  ["unsafe ID", doc => { doc.items[0].id = "../other"; }],
  ["empty title", doc => { doc.items[0].title = " "; }],
  ["long description", doc => { doc.items[0].description = "x".repeat(1201); }],
  ["control characters", doc => { doc.items[0].title = "bad\u0000value"; }],
  ["invalid theme", doc => { doc.items[0].theme = "arbitrary-css"; }],
  ["string visibility", doc => { doc.items[0].published = "false"; }],
  ["too many tags", doc => { doc.items[0].tags = Array(9).fill("tag"); }],
  ["blank tag", doc => { doc.items[0].tags = [""]; }],
  ["duplicate tags", doc => { doc.items[0].tags = ["PLA", "PLA"]; }],
  ["too many entries", doc => { doc.items = Array(201).fill(doc.items[0]); }],
];
for (const [name, mutate] of badGallery) test(`schema rejects ${name}`, () => { const doc = gallery(); mutate(doc); assert.throws(() => validateDocument("gallery", doc)); });
for (const price of [-1, Infinity, NaN, 0.001, 10000001, "123"]) test(`schema rejects price ${price}`, () => { const doc = product(); doc.items[0].price = price; assert.throws(() => validateDocument("products", doc)); });
test("schema rejects remote/traversing images, missing alt text and invalid dimensions", () => {
  const valid = { src: `/images/content/${"a".repeat(64)}.webp`, alt: "A print", width: 30, height: 20, fit: "contain" };
  for (const image of [{ ...valid, src: "https://example.com/a.webp" }, { ...valid, src: "/images/content/../a.webp" }, { ...valid, alt: "" }, { ...valid, width: 1601 }, { ...valid, height: 0 }, { ...valid, fit: "unsafe" }, { ...valid, width: 1.5 }]) {
    const doc = gallery(); doc.items[0].image = image;
    assert.throws(() => validateDocument("gallery", doc));
  }
  assert.throws(() => validateDocument("unknown", gallery()));
});

test("save writes versioned JSON atomically and retains a recovery backup", async t => {
  const fixture = await editorFixture(); t.after(fixture.cleanup);
  const store = await createStore(fixture.root);
  const before = await store.load("gallery");
  before.document.items[0].title = "Updated print";
  const saved = await store.save("gallery", before.document, before.revision);
  assert.notEqual(saved.revision, before.revision);
  assert.equal((await store.load("gallery")).document.items[0].title, "Updated print");
  const backups = await readdir(join(fixture.root, ".content-manager", "backups"));
  assert.equal(backups.length, 1);
  assert.notEqual(JSON.parse(await readFile(join(fixture.root, ".content-manager", "backups", backups[0]), "utf8")).items[0].title, "Updated print");
  assert.ok(!(await readdir(join(fixture.root, "content"))).some(name => name.endsWith(".tmp")));
  await store.save("gallery", saved.document, saved.revision);
  assert.equal((await readdir(join(fixture.root, ".content-manager", "backups"))).length, 1);
});

test("stale and invalid saves leave existing content untouched", async t => {
  const fixture = await editorFixture(); t.after(fixture.cleanup);
  const store = await createStore(fixture.root);
  const loaded = await store.load("products");
  const original = await readFile(join(fixture.root, "content", "products.json"));
  await assert.rejects(store.save("products", loaded.document, "stale"), /changed on disk/);
  loaded.document.items[0].price = -1;
  await assert.rejects(store.save("products", loaded.document, loaded.revision), /price/);
  assert.deepEqual(await readFile(join(fixture.root, "content", "products.json")), original);
  await assert.rejects(store.load("../../package"), /Unknown collection/);
});

test("simultaneous saves cannot overwrite one another", async t => {
  const fixture = await editorFixture(); t.after(fixture.cleanup);
  const store = await createStore(fixture.root);
  const loaded = await store.load("gallery");
  const one = structuredClone(loaded.document); one.items[0].title = "First save";
  const two = structuredClone(loaded.document); two.items[0].title = "Second save";
  const results = await Promise.allSettled([store.save("gallery", one, loaded.revision), store.save("gallery", two, loaded.revision)]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
  assert.equal((await store.load("gallery")).document.items[0].title, "First save");
});

test("image imports are content-addressed, resized and stripped of metadata", async t => {
  const fixture = await editorFixture(); t.after(fixture.cleanup);
  const store = await createStore(fixture.root);
  const large = await sharp({ create: { width: 2400, height: 1800, channels: 3, background: "white" } }).withMetadata().jpeg().toBuffer();
  const image = await store.upload(large);
  assert.equal(image.width, 1600); assert.equal(image.height, 1200);
  const bytes = await readFile(await store.asset(image.src));
  assert.ok(image.src.includes(hash(bytes)));
  const metadata = await sharp(bytes).metadata();
  assert.equal(metadata.format, "webp"); assert.equal(metadata.exif, undefined);
  assert.deepEqual(await store.upload(large), image);
  assert.equal((await readdir(join(fixture.root, "public", "images", "content"))).length, 1);
  const doc = (await store.load("gallery")).document;
  image.alt = "A replacement print"; doc.items[0].image = image;
  await store.validateAssets(doc);
  doc.items[0].image.width = 2;
  await assert.rejects(store.validateAssets(doc), /dimensions/);
});

test("uploads reject empty, oversized, SVG, GIF, corrupt and excessive-pixel inputs", async t => {
  const fixture = await editorFixture(); t.after(fixture.cleanup);
  const store = await createStore(fixture.root);
  for (const bytes of [Buffer.alloc(0), Buffer.alloc(MAX_IMAGE_BYTES + 1), Buffer.from('<svg onload="alert(1)"></svg>'), Buffer.from("GIF89a"), Buffer.from([255, 216, 255, 0])]) await assert.rejects(store.upload(bytes));
  const huge = await sharp({ create: { width: 6000, height: 5000, channels: 3, background: "white" } }).png().toBuffer();
  await assert.rejects(store.upload(huge), /decoded safely/);
});

test("save rejects missing or tampered image assets", async t => {
  const fixture = await editorFixture(); t.after(fixture.cleanup);
  const store = await createStore(fixture.root);
  const loaded = await store.load("gallery");
  const image = await store.upload(fixture.png); image.alt = "Print"; loaded.document.items[0].image = image;
  await writeFile(await store.asset(image.src), fixture.png);
  await assert.rejects(store.save("gallery", loaded.document, loaded.revision), /checksum/);
  image.src = `/images/content/${"a".repeat(64)}.webp`;
  await assert.rejects(store.save("gallery", loaded.document, loaded.revision));
});

test("write boundaries reject symlink/junction directories", async t => {
  const fixture = await editorFixture(); t.after(fixture.cleanup);
  const other = await editorFixture(); t.after(other.cleanup);
  await mkdir(join(fixture.root, ".content-manager"));
  await symlink(other.root, join(fixture.root, ".content-manager", "backups"), process.platform === "win32" ? "junction" : "dir");
  await symlink(other.root, join(fixture.root, "public", "images", "content"), process.platform === "win32" ? "junction" : "dir");
  const store = await createStore(fixture.root);
  const loaded = await store.load("gallery"); loaded.document.items[0].title = "Update";
  await assert.rejects(store.save("gallery", loaded.document, loaded.revision), /Symlinks/);
  await assert.rejects(store.upload(fixture.png), /Symlinks/);
  assert.deepEqual((await readdir(other.root)).sort(), ["content", "public"]);
});

test("content reads and saves reject a redirected content directory", async t => {
  const fixture = await editorFixture(); t.after(fixture.cleanup);
  const other = await editorFixture(); t.after(other.cleanup);
  const store = await createStore(fixture.root);
  const loaded = await store.load("gallery");
  await rename(join(fixture.root, "content"), join(fixture.root, "original-content"));
  await symlink(join(other.root, "content"), join(fixture.root, "content"), process.platform === "win32" ? "junction" : "dir");
  await assert.rejects(store.load("gallery"), /Symlinks/);
  await assert.rejects(store.save("gallery", loaded.document, loaded.revision), /Symlinks/);
});

async function apiFixture(t) {
  const fixture = await editorFixture(); t.after(fixture.cleanup);
  const manager = await startContentManager({ repoRoot: fixture.root, port: 0 }); t.after(manager.close);
  const headers = { "x-content-token": manager.token, "Content-Type": "application/json", Origin: manager.origin };
  const fetchApi = (path, options = {}) => fetch(`${manager.origin}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  return { ...fixture, ...manager, fetchApi, headers };
}

test("API reads and saves authorised content, uploads images and preserves optimistic revisions", async t => {
  const manager = await apiFixture(t);
  const loaded = await (await manager.fetchApi("/api/content/gallery")).json();
  loaded.document.items[0].title = "API update";
  const saved = await manager.fetchApi("/api/content/gallery", { method: "PUT", body: JSON.stringify(loaded) });
  assert.equal(saved.status, 200);
  const stale = await manager.fetchApi("/api/content/gallery", { method: "PUT", body: JSON.stringify(loaded) });
  assert.equal(stale.status, 409);
  const image = await manager.fetchApi("/api/upload", { method: "POST", body: JSON.stringify({ data: manager.png.toString("base64") }) });
  assert.equal(image.status, 200);
  const src = (await image.json()).src;
  const asset = await fetch(`${manager.origin}${src}`); assert.equal(asset.headers.get("content-type"), "image/webp");
  assert.equal((await fetch(`${manager.origin}/images/content/${"a".repeat(64)}.webp`)).status, 404);
});

test("API denies missing sessions, hostile origins, DNS rebinding and cross-site requests", async t => {
  const manager = await apiFixture(t);
  assert.equal((await fetch(`${manager.origin}/api/content/gallery`)).status, 403);
  for (const headers of [{ "x-content-token": "bad" }, { Origin: "https://evil.example" }, { Origin: "null" }, { "Sec-Fetch-Site": "cross-site" }, { "Sec-Fetch-Site": "same-site" }]) assert.equal((await manager.fetchApi("/api/content/gallery", { headers })).status, 403);
  const rebound = await new Promise((resolve, reject) => {
    const req = request(manager.origin, { headers: { Host: "evil.example" } }, res => { res.resume(); resolve(res.statusCode); }); req.on("error", reject); req.end();
  });
  assert.equal(rebound, 403);
  assert.equal((await fetch(manager.origin, { headers: { "Sec-Fetch-Site": "cross-site" } })).status, 403);
});

test("forged browser writes cannot modify the repository", async t => {
  const manager = await apiFixture(t);
  const loaded = await manager.store.load("gallery");
  const before = await readFile(join(manager.root, "content", "gallery.json"));
  loaded.document.items[0].title = "Forged edit";
  for (const headers of [{ "x-content-token": "" }, { Origin: "https://evil.example" }, { Origin: "null" }, { "Sec-Fetch-Site": "cross-site" }]) {
    const response = await manager.fetchApi("/api/content/gallery", { method: "PUT", headers, body: JSON.stringify(loaded) });
    assert.equal(response.status, 403);
  }
  assert.deepEqual(await readFile(join(manager.root, "content", "gallery.json")), before);
});

test("API rejects malformed writes, oversized bodies and arbitrary filesystem routes", async t => {
  const manager = await apiFixture(t);
  for (const [body, headers, status] of [["not-json", {}, 400], ["[]", {}, 400], ["{}", { "Content-Type": "text/plain" }, 415], [JSON.stringify({ x: "x".repeat(512 * 1024) }), {}, 413]]) {
    assert.equal((await manager.fetchApi("/api/content/gallery", { method: "PUT", body, headers })).status, status);
  }
  assert.equal((await manager.fetchApi("/api/upload", { method: "POST", body: JSON.stringify({ data: "%%%" }) })).status, 400);
  assert.equal((await manager.fetchApi("/api/content/unknown")).status, 404);
  for (const path of ["/package.json", "/content/gallery.json", "/.git/config", "/api/publish", "/api/git"]) assert.equal((await manager.fetchApi(path)).status, 404);
  assert.equal((await fetch(manager.origin, { method: "POST" })).status, 405);
});

test("editor responses have restrictive headers and never expose the launch capability", async t => {
  const manager = await apiFixture(t);
  const response = await fetch(manager.origin);
  assert.ok(response.headers.get("content-security-policy").includes("frame-ancestors 'none'"));
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  const html = await response.text(); assert.ok(!html.includes(manager.token));
  assert.ok(manager.launchUrl.endsWith(`#session=${manager.token}`));
});

test("API tokens are different per launch and cannot authorise another instance", async t => {
  const fixture = await editorFixture(); t.after(fixture.cleanup);
  const first = await startContentManager({ repoRoot: fixture.root, port: 0 }); t.after(first.close);
  const second = await startContentManager({ repoRoot: fixture.root, port: 0 }); t.after(second.close);
  assert.notEqual(first.token, second.token);
  const response = await fetch(`${second.origin}/api/content/gallery`, { headers: { "x-content-token": first.token } });
  assert.equal(response.status, 403);
});

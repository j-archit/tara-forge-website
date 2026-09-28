import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { ContentError } from "./storage.mjs";

const execFileAsync = promisify(execFile);
const DOCUMENTS = ["content/gallery.json", "content/products.json"];
const ASSET_PREFIX = "public/images/content/";
const PUBLISH_SUBJECT = "content: publish ";

export function createPublisher(store) {
  const root = store.root;
  let publishing = false;

  async function git(args, timeout = 15000) {
    const { stdout } = await execFileAsync("git", ["-c", `safe.directory=${root.replaceAll("\\", "/")}`, ...args], {
      cwd: root,
      windowsHide: true,
      timeout,
      maxBuffer: 12 * 1024 * 1024,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "never" },
    });
    return stdout;
  }

  async function repoState() {
    let top;
    try { top = (await git(["rev-parse", "--show-toplevel"])).trim(); }
    catch { throw new ContentError("This editor must run inside its Git repository.", 409); }
    if (resolve(top).toLowerCase() !== resolve(root).toLowerCase()) throw new ContentError("The editor is not at the Git repository root.", 409);
    let branch;
    try { branch = (await git(["symbolic-ref", "--quiet", "--short", "HEAD"])).trim(); }
    catch { branch = "(detached HEAD)"; }
    const head = (await git(["rev-parse", "HEAD"])).trim();
    return { branch, head };
  }

  async function referencedAssets() {
    const references = new Set();
    for (const collection of ["gallery", "products"]) {
      const { document } = await store.load(collection);
      await store.validateAssets(document);
      for (const item of document.items) {
        for (const image of [item.image, ...(item.presentation?.photos || [])]) {
          if (image) references.add(`${ASSET_PREFIX}${image.src.split("/").at(-1)}`);
        }
      }
    }
    return [...references].sort();
  }

  async function pendingCommit(head, references) {
    const subject = (await git(["log", "-1", "--format=%s"])).trim();
    if (!subject.startsWith(PUBLISH_SUBJECT)) return null;
    try { if ((await git(["rev-parse", "--verify", "refs/remotes/origin/main"])).trim() === head) return null; }
    catch { /* A missing tracking ref is checked against the remote before any push. */ }
    const files = (await git(["diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD"])).trim().split(/\r?\n/).filter(Boolean);
    if (!files.length || files.some(file => !DOCUMENTS.includes(file) && !references.includes(file))) return null;
    const parent = (await git(["rev-parse", "HEAD^"])).trim();
    return { commit: head, parent, files };
  }

  async function review() {
    const { branch, head } = await repoState();
    const references = await referencedAssets();
    const tracked = new Set((await git(["ls-files", "-z", "--cached", "--", ASSET_PREFIX])).split("\0").filter(Boolean));
    const newAssets = references.filter(file => !tracked.has(file));
    const changedDocuments = (await git(["diff", "--no-ext-diff", "--no-textconv", "--name-only", "HEAD", "--", ...DOCUMENTS])).trim().split(/\r?\n/).filter(Boolean);
    const files = [...changedDocuments, ...newAssets];
    let diff = await git(["diff", "--no-ext-diff", "--no-textconv", "--no-color", "HEAD", "--", ...DOCUMENTS]);
    let pending = null;
    if (!files.length) {
      pending = await pendingCommit(head, references);
      if (pending) diff = await git(["show", "--format=", "--no-ext-diff", "--no-textconv", "--no-color", "HEAD", "--", ...DOCUMENTS]);
    }
    const reviewId = createHash("sha256").update(JSON.stringify({ branch, head, files, diff, pending })).digest("hex");
    const canPublish = branch === "main" && (files.length > 0 || pending !== null);
    const reason = branch !== "main" ? "Publishing is available only on main. This branch can be previewed, but it cannot publish the live site." : !canPublish ? "No saved content changes are ready to publish." : null;
    return { reviewId, branch, files, changedDocuments, newAssets, diff, pending, canPublish, reason, destination: "origin/main" };
  }

  async function remoteMain() {
    try {
      const output = await git(["ls-remote", "--exit-code", "origin", "refs/heads/main"], 60000);
      const hash = output.trim().split(/\s+/)[0];
      if (!/^[a-f0-9]{40}$/.test(hash)) throw new Error("Invalid remote hash");
      return hash;
    } catch { throw new ContentError("Could not verify origin/main. Check your connection and GitHub sign-in, then retry.", 409); }
  }

  async function push(commit) {
    try { await git(["push", "origin", `${commit}:refs/heads/main`], 120000); }
    catch { return { committed: true, pushed: false, commit, message: "Committed locally, but GitHub did not accept the push. Leave the editor open and retry Publish; the commit will not be repeated." }; }
    return { committed: true, pushed: true, commit, message: "Published to origin/main. GitHub Pages will deploy after its checks pass." };
  }

  async function publish(reviewId) {
    if (publishing) throw new ContentError("A publish is already in progress.", 409);
    publishing = true;
    try {
      const proposed = await review();
      if (typeof reviewId !== "string" || reviewId !== proposed.reviewId) throw new ContentError("Saved content or Git state changed. Open Publish review again.", 409);
      if (!proposed.canPublish) throw new ContentError(proposed.reason, 409);
      const { head } = await repoState();
      const remote = await remoteMain();
      if (proposed.pending) {
        if (head !== proposed.pending.commit) throw new ContentError("Git state changed. Open Publish review again.", 409);
        if (remote === head) return { committed: true, pushed: true, commit: head, message: "This content commit is already on origin/main." };
        if (remote !== proposed.pending.parent) throw new ContentError("origin/main has moved. The local content commit needs a safe sync before pushing.", 409);
        return push(head);
      }
      if (remote !== head) throw new ContentError("Local main is not up to date with origin/main. Sync it before publishing; no commit was made.", 409);
      const fresh = await review();
      if (fresh.reviewId !== reviewId) throw new ContentError("Saved content or Git state changed. Open Publish review again.", 409);
      if (fresh.newAssets.length) await git(["add", "--", ...fresh.newAssets]);
      const subject = `${PUBLISH_SUBJECT}${fresh.changedDocuments.map(file => file.includes("gallery") ? "gallery" : "catalogue").join(" and ") || "image assets"}`;
      try { await git(["commit", "--only", "-m", subject, "--", ...fresh.files], 60000); }
      catch { throw new ContentError("Git could not create the content commit. Check your Git author configuration and retry.", 409); }
      const commit = (await git(["rev-parse", "HEAD"])).trim();
      return push(commit);
    } finally { publishing = false; }
  }

  return { review, publish, isPublishing: () => publishing };
}

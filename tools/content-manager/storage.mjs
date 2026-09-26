import { createHash, randomUUID } from "node:crypto";
import { lstat, mkdir, open, readFile, realpath, rename, unlink, link } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import sharp from "sharp";
import { COLLECTIONS, validateDocument } from "./schema.mjs";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const hash = bytes => createHash("sha256").update(bytes).digest("hex");
export class ContentError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export async function createStore(repoRoot) {
  const root = await realpath(repoRoot);
  // Every writable path is chosen by this service, never by a request.
  async function safePath(parts, makeDirectories = false) {
    let current = root;
    for (const [index, part] of parts.entries()) {
      if (!part || part === "." || part === ".." || /[\\/:]/.test(part)) throw new ContentError("Unsafe path");
      current = join(current, part);
      try {
        const info = await lstat(current);
        if (info.isSymbolicLink()) throw new ContentError("Symlinks and junctions are not supported", 409);
        if (index < parts.length - 1 && !info.isDirectory()) throw new ContentError("Expected a directory", 409);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        if (makeDirectories && index < parts.length - 1) await mkdir(current);
      }
      const rel = relative(root, current);
      if (rel.startsWith(`..${sep}`) || rel === "..") throw new ContentError("Unsafe path");
    }
    return current;
  }
  function collectionParts(collection) {
    if (!COLLECTIONS.includes(collection)) throw new ContentError("Unknown collection", 404);
    return ["content", `${collection}.json`];
  }
  async function load(collection) {
    const bytes = await readFile(await safePath(collectionParts(collection)));
    const document = JSON.parse(bytes.toString("utf8"));
    validateDocument(collection, document);
    return { document, revision: hash(bytes) };
  }
  async function asset(src) {
    if (!/^\/images\/content\/[a-f0-9]{64}\.webp$/.test(src)) throw new ContentError("Invalid asset path");
    return safePath(["public", "images", "content", src.split("/").at(-1)]);
  }
  async function validateAssets(document) {
    const checked = new Map();
    for (const { image } of document.items) {
      if (!image) continue;
      if (!checked.has(image.src)) {
        const bytes = await readFile(await asset(image.src));
        if (hash(bytes) !== image.src.split("/").at(-1).slice(0, -5)) throw new ContentError("Image checksum does not match its filename");
        const metadata = await sharp(bytes, { limitInputPixels: 25000000 }).metadata();
        if (metadata.format !== "webp" || (metadata.pages ?? 1) !== 1) throw new ContentError("Expected a still WebP image");
        checked.set(image.src, metadata);
      }
      const metadata = checked.get(image.src);
      if (image.width !== metadata.width || image.height !== metadata.height) throw new ContentError("Image dimensions do not match the file");
    }
  }
  let writing = false;
  async function save(collection, document, revision) {
    if (writing) throw new ContentError("Another save is in progress. Please retry.", 409);
    writing = true;
    let temp;
    try {
      validateDocument(collection, document);
      await validateAssets(document);
      const current = await load(collection);
      if (typeof revision !== "string" || revision !== current.revision) throw new ContentError("Content changed on disk. Reload before saving; your edits have not been written.", 409);
      const destination = await safePath(collectionParts(collection));
      const previous = await readFile(destination);
      const bytes = Buffer.from(`${JSON.stringify(document, null, 2)}\n`);
      if (bytes.equals(previous)) return current;
      const backup = await safePath([".content-manager", "backups", `${collection}-${Date.now()}-${randomUUID()}.json`], true);
      await exclusiveWrite(backup, previous);
      temp = await safePath(["content", `.${collection}-${randomUUID()}.tmp`]);
      await exclusiveWrite(temp, bytes);
      // Recheck immediately before replacing, including symlink safety.
      if (hash(await readFile(await safePath(collectionParts(collection)))) !== revision) throw new ContentError("Content changed on disk. Reload before saving.", 409);
      await rename(temp, destination);
      temp = undefined;
      return { document, revision: hash(bytes) };
    } finally {
      if (temp) await unlink(temp).catch(() => {});
      writing = false;
    }
  }
  async function upload(bytes) {
    if (!Buffer.isBuffer(bytes) || !bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new ContentError("Choose a non-empty PNG, JPEG or WebP image up to 8 MB", 413);
    const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
    if (!png && !jpeg && !webp) throw new ContentError("Only PNG, JPEG and WebP images are accepted (no SVG or GIF)");
    let result;
    try {
      const input = sharp(bytes, { limitInputPixels: 25000000, failOn: "warning" });
      const metadata = await input.metadata();
      if (!['png', 'jpeg', 'webp'].includes(metadata.format) || (metadata.pages ?? 1) !== 1) throw new Error("Not a supported still image");
      // Re-encode pixels rather than retaining metadata or trusting an extension.
      result = await input.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    } catch {
      throw new ContentError("Image could not be decoded safely. Use a still PNG, JPEG or WebP under 25 megapixels.");
    }
    const filename = `${hash(result.data)}.webp`;
    const destination = await safePath(["public", "images", "content", filename], true);
    const temp = await safePath(["public", "images", "content", `.upload-${randomUUID()}.tmp`]);
    try {
      await exclusiveWrite(temp, result.data);
      // Linking an already-flushed file is atomic and cannot replace an asset.
      try { await link(temp, destination); }
      catch (error) {
        if (error.code !== "EEXIST") throw error;
        if (!(await readFile(await safePath(["public", "images", "content", filename]))).equals(result.data)) throw new ContentError("Existing asset is inconsistent", 409);
      }
    } finally { await unlink(temp).catch(() => {}); }
    return { src: `/images/content/${filename}`, width: result.info.width, height: result.info.height, alt: "", fit: "contain" };
  }
  return { root, load, save, upload, asset, validateAssets };
}

async function exclusiveWrite(path, bytes) {
  const file = await open(path, "wx", 0o600);
  try { await file.writeFile(bytes); await file.sync(); }
  finally { await file.close(); }
}

import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export async function editorFixture({ website = false } = {}) {
  // Next/webpack must resolve its dependencies on the same Windows drive.
  const base = website ? fileURLToPath(new URL("../../.content-manager/test-workspaces/", import.meta.url)) : tmpdir();
  if (website) await mkdir(base, { recursive: true });
  const root = await mkdtemp(join(base, "taraforge-content-test-"));
  await mkdir(join(root, "content"));
  await mkdir(join(root, "public", "images"), { recursive: true });
  for (const name of ["gallery", "products"]) {
    const seed = await readFile(fileURLToPath(new URL(`../fixtures/${name}.json`, import.meta.url)));
    await writeFile(join(root, "content", `${name}.json`), seed);
  }
  const png = await sharp({ create: { width: 32, height: 24, channels: 4, background: "#c9a84c" } }).png().toBuffer();
  return { root, png, cleanup: () => rm(root, { recursive: true, force: true }) };
}

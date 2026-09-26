import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const source = new URL("../../workdir/brand-bundle-review/taraforge3d-brand/", import.meta.url);
const target = new URL("../../public/brand/", import.meta.url);
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true, force: false });
const lockup = await readFile(new URL("lockup/png/taraforge3d-lockup-stacked-on-dark-800w.png", target));
// Deterministic code-native social composition; never alter supplied masters.
const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><pattern id="dots" width="44" height="44" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#CAD5E2" opacity=".16"/></pattern></defs><path fill="#050A1F" d="M0 0h1200v630H0z"/><path fill="url(#dots)" d="M0 0h1200v630H0z"/></svg>`);
const mark = await sharp(lockup).resize({ height: 360 }).png().toBuffer();
const { width } = await sharp(mark).metadata();
await sharp(background).composite([{ input: mark, left: Math.round((1200 - width) / 2), top: 135 }]).png().toFile(fileURLToPath(new URL("../../public/og-image.png", import.meta.url)));
await writeFile(new URL("../../src/app/favicon.ico", import.meta.url), await readFile(new URL("ico/favicon.ico", target)));
console.log("Installed full brand folder, favicon and 1200×630 social image.");

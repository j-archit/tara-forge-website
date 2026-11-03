// Generate static responsive variants without modifying the source artwork.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const destination = new URL("public/images/performance/", root);
await mkdir(destination, { recursive: true });
const images = [
  ["sith-lord-model-generated.png", "hero-model", [400, 640, 941]],
  ["sith-lord-print-hero.png", "hero-print", [375]],
  ["b2b/bcc-bag-tag-cutout.webp", "bcc-bag-tag", [256, 384]],
];
for (const [source, name, widths] of images) {
  for (const width of widths) {
    const output = new URL(name + "-" + width + ".webp", destination);
    const result = await sharp(fileURLToPath(new URL("public/images/" + source, root)))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 100, effort: 6 })
      .toFile(fileURLToPath(output));
    console.log(name + "-" + width + ".webp: " + result.size + " bytes");
  }
}

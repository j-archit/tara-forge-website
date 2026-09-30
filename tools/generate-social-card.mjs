import sharp from "sharp";
import { fileURLToPath } from "node:url";

const logo = await sharp(fileURLToPath(new URL("../public/brand/svg/taraforge3d-mark-gold-tight.svg", import.meta.url)))
  .resize({ height: 104 }).png().toBuffer();
const card = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><radialGradient id="sky"><stop stop-color="#12254b"/><stop offset="1" stop-color="#020617"/></radialGradient>
    <linearGradient id="colour"><stop stop-color="#C9A84C"/><stop offset=".4" stop-color="#38bdf8"/><stop offset=".75" stop-color="#a78bfa"/><stop offset="1" stop-color="#fb7185"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#sky)"/>
  <g fill="#cbd5e1" opacity=".25">${Array.from({ length: 90 }, (_, i) => `<circle cx="${(i * 149 + 31) % 1200}" cy="${(i * 83 + 29) % 630}" r="${i % 9 === 0 ? 1.8 : .8}"/>`).join("")}</g>
  <g font-family="Arial, sans-serif"><text x="196" y="128" fill="#C9A84C" font-size="45" font-weight="700">TaraForge3D</text>
    <text x="196" y="165" fill="#cbd5e1" font-size="20" letter-spacing="3">YOUR IDEA, IN 3D</text>
    <text x="76" y="310" fill="#f8fafc" font-size="60" font-weight="700">Custom 3D printing</text>
    <text x="76" y="386" fill="url(#colour)" font-size="60" font-weight="700">Tangible and tough.</text>
    <text x="78" y="462" fill="#cbd5e1" font-size="27">Prototypes · Functional parts · Figurines · Small batches</text>
    <text x="78" y="552" fill="#C9A84C" font-size="24">Bangalore · Shipping across India</text>
    <text x="1122" y="552" text-anchor="end" fill="#94a3b8" font-size="22">taraforge3d.in</text>
  </g>
</svg>`);
await sharp(card).composite([{ input: logo, left: 78, top: 78 }]).png()
  .toFile(fileURLToPath(new URL("../public/og-image.png", import.meta.url)));
console.log("Generated public/og-image.png (1200×630)");

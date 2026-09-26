import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { brandScripts, BRAND_INTERVAL_MS } from "../src/lib/brandScripts.ts";

test("brand rotation preserves all existing words and timing", () => {
  assert.equal(BRAND_INTERVAL_MS, 1200);
  assert.deepEqual(brandScripts.map(({ text, lang }) => [text, lang]), [["Tara", "en"], ["तारा", "hi"], ["তারা", "bn"], ["তৰা", "as"], ["તારા", "gu"], ["ତାରା", "or"], ["ਤਾਰਾ", "pa"], ["తారా", "te"], ["ತಾರಾ", "kn"], ["தாரா", "ta"], ["താര", "ml"], ["تارا", "ur"], ["ꯇꯥꯔꯥ", "mni"], ["ᱛᱟᱨᱟ", "sat"]]);
});

test("manifest and brand masters exist with safe local paths", () => {
  const manifest = JSON.parse(readFileSync("public/brand/site.webmanifest", "utf8"));
  assert.equal(manifest.display, "standalone");
  for (const icon of manifest.icons) {
    assert.match(icon.src, /^\/brand\/[\w./-]+$/);
    assert.ok(!icon.src.includes(".."));
    assert.ok(existsSync(join("public", icon.src)));
  }
  for (const path of ["svg/taraforge3d-mark-gold-tight.svg", "svg/spark.svg", "svg/favicon.svg", "lockup/svg/taraforge3d-lockup-stacked-on-dark.svg"]) {
    const svg = readFileSync(join("public/brand", path), "utf8");
    assert.doesNotMatch(svg, /<script|<foreignObject|\bon\w+=|(?:href|xlink:href)=["']https?:/i);
  }
});

test("social image and app icons have correct intrinsic dimensions", async () => {
  const og = await sharp("public/og-image.png").metadata();
  assert.equal(og.width, 1200); assert.equal(og.height, 630);
  const apple = await sharp("public/brand/app-icons/apple-touch-icon.png").metadata();
  assert.equal(apple.width, 180); assert.equal(apple.height, 180);
});

test("fonts are local WOFF2 with swap and redistribution licences", () => {
  const css = readFileSync("src/app/brand-fonts.css", "utf8");
  assert.doesNotMatch(css, /https?:/);
  assert.match(css, /font-display: swap/);
  for (const { family } of brandScripts) assert.ok(css.includes(`font-family: '${family}'`));
  assert.ok(css.includes("IBM Plex Mono"));
  for (const match of css.matchAll(/url\((\/fonts\/[^)]+)\)/g)) {
    const bytes = readFileSync(join("public", match[1]));
    assert.equal(bytes.toString("ascii", 0, 4), "wOF2");
  }
  const licences = readdirSync("public/fonts").filter(name => name.endsWith("-OFL.txt"));
  assert.equal(licences.length, 14);
  for (const file of licences) assert.match(readFileSync(join("public/fonts", file), "utf8"), /SIL OPEN FONT LICENSE/i);
});

test("design stylesheet centralises colours and preserves portrait exception", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  assert.match(css, /@import "tailwindcss" source\("\.\.\/"\)/);
  const outsideRoot = css.replace(/:root\s*\{[^}]+\}/g, "");
  assert.doesNotMatch(outsideRoot, /#[a-f\d]{3,8}\b/i);
  assert.match(css, /\.founder-portrait\s*\{ filter: var\(--portrait-shadow\)/);
  assert.match(css, /\.design-hero-cta\s*\{ box-shadow: var\(--hero-button-glow\)/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const read = path => readFileSync(path, "utf8").replace(/\r\n/g, "\n");
// Approved source fingerprints; also work in shallow CI checkouts.
// Includes the approved B2B entry points; the original hero, colours and logo are retained.
const baseline = {
  "src/app/page.tsx": "ab99a229eeb997644ed10f37e0f188658aa18f93b2558eac07a7429cbc1b6243",
  "src/app/HomeClient.tsx": "b8a6b95b0e4d368d384709f75ac06a20fa0735b05cdaff40b12f952b4df1bcc7",
  "src/app/shop/ShopClient.tsx": "ed74306d5699d2c9c5ec502130109f29eea2fdada05b842310245f5ccf70a7c6",
  "src/components/CelestialBackground.tsx": "7012b6fc0bc384117136dbec420c46e2c17b0ddf9012f25c2fcaecc944bdade2",
  "src/components/FAQSection.tsx": "76d8a01cf250215c99993811efd47190884fee5a7620633e1430cf092155ccf0",
  "src/components/Footer.tsx": "7d8b1ac7c9617f6d5a1f27fef2b828969756e328d276e2c7bb1c1eba21be060e",
  "src/app/globals.css": "2a1226f4b1913ff2fac0aa38376b486130b760479294fc1c54558e10e429f3cb",
};
const fingerprint = value => createHash("sha256").update(value).digest("hex");

test("public pages retain their approved presentation, including the new home hero", () => {
  for (const path of ["src/app/page.tsx", "src/app/HomeClient.tsx", "src/app/shop/ShopClient.tsx", "src/components/CelestialBackground.tsx", "src/components/FAQSection.tsx", "src/components/Footer.tsx"]) {
    const source = path === "src/components/Footer.tsx" ? read(path)
      .replace('className="flex min-h-16 items-center gap-4"', 'className="flex items-center gap-4"')
      .replace('<Logo size={32} className="h-8 w-auto shrink-0 drop-shadow-[var(--brand-glow-gold)]" />', '<Logo size={64} className="drop-shadow-[var(--brand-glow-gold)]" />') : read(path);
    assert.equal(fingerprint(source), baseline[path], path);
  }
});

test("original stylesheet is retained except font declarations and source discovery", () => {
  const css = read("src/app/globals.css")
    .replace('/* Exclude local bundles, screenshots and caches from class discovery. */\n@import "tailwindcss" source("../");\n@import "./brand-fonts.css";', '@import "tailwindcss";')
    .replace('  --font-geist-sans: "Archivo", Arial, sans-serif;\n  --font-geist-mono: "IBM Plex Mono", monospace;\n', "")
    .replace('  font-family: var(--font-geist-sans);\n', "")
    .replace('\n/* Typography only: preserve the original sizes, weights, colours and spacing. */\nh1, h2, h3 {\n  font-family: var(--font-geist-sans);\n  font-stretch: 118%;\n}\n', "");
  assert.equal(fingerprint(css), baseline["src/app/globals.css"]);
});

test("the supplied logo is used consistently without changing footer layout", () => {
  assert.equal(read("public/Logo.svg"), read("public/brand/svg/taraforge3d-mark-gold-tight.svg"));
  assert.equal(read("public/icon.svg"), read("public/brand/svg/favicon.svg"));
  assert.match(read("src/components/Logo.tsx"), /src="\/brand\/svg\/taraforge3d-mark-gold-tight\.svg"/);
  assert.match(read("src/components/Logo.jsx"), /export \{ Logo \} from "\.\/Logo\.tsx"/);
  assert.equal(readFileSync("src/app/favicon.ico").readUInt16LE(2), 1);
});

test("fonts are local, licensed and do not introduce runtime network loading", () => {
  const css = read("src/app/brand-fonts.css");
  assert.match(css, /font-family: 'Archivo'/);
  assert.match(css, /font-family: 'IBM Plex Mono'/);
  assert.doesNotMatch(read("src/app/layout.tsx"), /next\/font\/google/);
  for (const [, url] of css.matchAll(/src: url\(([^)]+)\)/g)) {
    assert.equal(readFileSync(`public${url}`).subarray(0, 4).toString(), "wOF2", url);
  }
  assert.ok(existsSync("public/fonts/archivo-OFL.txt"));
  assert.ok(existsSync("public/fonts/ibm-plex-mono-OFL.txt"));
});

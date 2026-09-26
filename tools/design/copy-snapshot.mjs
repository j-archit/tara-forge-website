import { chromium } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";

const origin = "http://127.0.0.1:8765";
const routes = ["/", "/services/", "/gallery/", "/shop/", "/team/", "/quote/", "/shipping-returns/"];
const browser = await chromium.launch({ channel: process.platform === "win32" ? "msedge" : undefined });
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.route(/googletagmanager|google-analytics/, route => route.abort());
  const snapshot = {};
  for (const route of routes) {
    const response = await page.goto(origin + route);
    assert.equal(response.status(), 200, route);
    // Wait for client hydration and reduced-motion effects before sampling.
    // The baseline intentionally excludes motion-only testimonial controls.
    await page.waitForFunction(() => {
      const brand = document.querySelector(".brand__tara");
      const hydrated = brand?.style.width;
      const motionControl = [...document.querySelectorAll("button")].some(button => /^(Pause|Play) testimonials$/.test(button.textContent.trim()));
      return hydrated && !motionControl;
    });
    snapshot[route] = await page.locator("main").evaluate(main => {
      const copy = main.cloneNode(true);
      // The explicitly redesigned header wordmark is the sole branding exception.
      copy.querySelector("header a[href='/']")?.remove();
      copy.querySelectorAll("script, style, svg").forEach(node => node.remove());
      return copy.textContent.replace(/\s+/g, " ").trim();
    });
  }
  const file = new URL("../../tests/fixtures/design-copy.json", import.meta.url);
  if (process.argv.includes("--capture")) {
    await mkdir(new URL("../../tests/fixtures/", import.meta.url), { recursive: true });
    // Test fixture generation: deliberately invoked only against pre-design output.
    await writeFile(file, JSON.stringify(snapshot, null, 2) + "\n", { flag: "wx" });
    console.log("Captured all seven routes, including closed FAQs and the inert quote form.");
  } else {
    assert.deepEqual(snapshot, JSON.parse(await readFile(file, "utf8")));
    console.log("Exact copy preserved across all seven routes.");
  }
} finally { await browser.close(); }

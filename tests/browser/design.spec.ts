import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { brandScripts } from "../../src/lib/brandScripts";

const baseline = JSON.parse(readFileSync("tests/fixtures/design-copy.json", "utf8"));
for (const route of Object.keys(baseline)) {
  test(`design retains all copy on ${route}`, async ({ page }) => {
    test.skip(process.env.VERIFY_DESIGN_COPY !== "1", "Migration-only freeze: run npm run design:test:browser; normal CMS publishing must allow approved content edits.");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    // Hydration can briefly render the marquee pause control before Framer's
    // reduced-motion hook settles. Compare the settled DOM, not that transient.
    await expect.poll(() => page.locator("main").evaluate(main => {
      const clone = main.cloneNode(true) as HTMLElement;
      clone.querySelector("header a[href='/']")?.remove();
      clone.querySelectorAll("script, style, svg").forEach(node => node.remove());
      return clone.textContent!.replace(/\s+/g, " ").trim();
    }), { timeout: 10000 }).toBe(baseline[route]);
  });
}

test("rotating brand uses local fonts, stable width and live reduced-motion preferences", async ({ page }) => {
  await page.goto("/");
  const brand = page.getByRole("link", { name: "TaraForge3D home", exact: true });
  await expect(brand).toHaveCount(1);
  await expect(brand.locator(".brand__tara")).toHaveAttribute("aria-hidden", "true");
  await expect(brand.locator(".brand__word")).toHaveCount(14);
  await page.evaluate(() => document.fonts.ready);
  const slot = brand.locator(".brand__tara");
  const widths = await slot.evaluate(element => ({
    slot: element.getBoundingClientRect().width,
    words: [...element.children].map(word => word.getBoundingClientRect().width),
  }));
  expect(widths.slot).toBe(Math.ceil(Math.max(...widths.words)) + 4);
  const original = await brand.locator(".brand__3d").boundingBox();
  for (const word of brandScripts) {
    const script = brand.locator(`[lang='${word.lang}']`);
    await expect(script).toHaveText(word.text);
    const loaded = await script.evaluate(element => {
      const style = getComputedStyle(element);
      return document.fonts.check(`700 15px ${style.fontFamily}`, element.textContent!);
    });
    expect(loaded).toBe(true);
  }
  await expect.poll(() => brand.locator(".brand__word[data-active=true]").getAttribute("lang"), { timeout: 4000 }).not.toBe("en");
  expect((await brand.locator(".brand__3d").boundingBox())!.x).toBe(original!.x);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(brand.locator(".brand__word[data-active=true]")).toHaveAttribute("lang", "en");
  await page.waitForTimeout(1300);
  await expect(brand.locator(".brand__word[data-active=true]")).toHaveAttribute("lang", "en");
});

test("mobile dialog traps focus, preserves inert quote inputs and restores scroll/focus", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/quote/");
  const toggle = page.getByRole("button", { name: "Toggle navigation" });
  await toggle.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await expect(page.getByRole("heading", { name: /Request a Quote/ })).toHaveCount(0);
  const last = page.locator("#mobile-navigation").getByRole("link", { name: "Get a quote" });
  await last.focus(); await last.press("Tab");
  await expect(page.getByRole("link", { name: "TaraForge3D home" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#mobile-navigation")).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  await expect(page.locator('main [inert][aria-hidden="true"] form')).toHaveCount(1);
  await expect(page.getByRole("heading", { name: /Request a Quote/ })).toBeVisible();
  await toggle.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("#mobile-navigation")).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("native FAQ permits one open answer and works with Enter and Space", async ({ page }) => {
  await page.goto("/");
  const first = page.locator("#faq-question-0"), second = page.locator("#faq-question-1");
  await first.focus(); await first.press("Enter");
  await expect(page.locator("#faq details[open]")).toHaveCount(1);
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await second.focus(); await second.press("Space");
  await expect(second).toHaveAttribute("aria-expanded", "true");
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#faq details[open]")).toHaveCount(1);
  await second.press("Enter");
  await expect(page.locator("#faq details[open]")).toHaveCount(0);
});

test("brand metadata, static footer and font files are served from the export", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("link[rel=manifest]")).toHaveAttribute("href", "/brand/site.webmanifest");
  await expect(page.locator("meta[name=theme-color]")).toHaveAttribute("content", "#050A1F");
  await expect(page.locator("footer img")).toHaveAttribute("src", "/brand/lockup/svg/taraforge3d-lockup-stacked-on-dark.svg");
  expect((await page.request.get("/brand/site.webmanifest")).headers()["content-type"]).toContain("manifest");
  expect((await page.request.get("/fonts/archivo-5.woff2")).headers()["content-type"]).toBe("font/woff2");
  await expect(page.locator('img[src*="workdir"], img[src="/Logo.svg"], img[src="/icon.svg"]')).toHaveCount(0);
  expect((await page.request.get("/Logo.svg")).status()).toBe(404);
  expect((await page.request.get("/icon.svg")).status()).toBe(404);
});

for (const route of ["/", "/shop/"]) {
  for (const width of [360, 768, 1440]) {
    test(`${route} preview fits at ${width}px with accessible targets and restrained effects`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      if (width === 1440) await expect(page.locator('header nav').getByRole("link", { name: route === "/" ? "Home" : "Shop", exact: true }).first()).toHaveAttribute("aria-current", "page");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      const targets = await page.locator("a, button, summary").evaluateAll(elements => elements.filter(element => element.getClientRects().length > 0).map(element => ({ text: element.textContent?.trim(), height: element.getBoundingClientRect().height })));
      for (const target of targets) expect(target.height, target.text).toBeGreaterThanOrEqual(44);
      const shadows = await page.locator("main *").evaluateAll(elements => elements.filter(element => getComputedStyle(element).boxShadow !== "none" && !element.classList.contains("design-hero-cta")).map(element => element.className));
      expect(shadows).toEqual([]);
      await expect(page.locator(".hero-gradient-text")).toHaveCount(route === "/" ? 1 : 0);
      const secondary = page.locator(".design-button.design-secondary").first();
      await secondary.focus();
      await expect(secondary).toHaveCSS("outline-width", "2px");
      if (width !== 768) {
        // Full-page captures must include lazy photos/branding below the fold.
        await page.locator("img").evaluateAll(images => images.forEach(element => { (element as HTMLImageElement).loading = "eager"; }));
        await expect.poll(() => page.locator("img").evaluateAll(images => images.every(element => {
          const image = element as HTMLImageElement;
          return image.complete && image.naturalWidth > 0;
        }))).toBe(true);
        await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); });
        await page.screenshot({ path: `output/playwright/design-${route === "/" ? "home" : "shop"}-${width}.png`, fullPage: true });
      }
    });
  }
}

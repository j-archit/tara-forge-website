import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const products = JSON.parse(readFileSync(resolve("content/products.json"), "utf8"));
const publishedProductCount = products.items.filter((item: { published: boolean }) => item.published).length;

for (const width of [390, 1440]) {
  test(`header and footer marks match adjacent text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/gallery/");
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.locator("header img, footer img").evaluateAll(images => images.every(element => (element as HTMLImageElement).complete))).toBe(true);
    for (const selector of ['header a[aria-label="TaraForge3D"] > img', 'footer img']) {
      const dimensions = await page.locator(selector).evaluate(image => {
        const mark = image.getBoundingClientRect();
        const text = image.nextElementSibling!.getBoundingClientRect();
        return { height: mark.height, textHeight: text.height, centerDifference: Math.abs(mark.top + mark.height / 2 - text.top - text.height / 2), ratio: mark.width / mark.height };
      });
      // Match the visible letter block, excluding the fonts' line-box leading.
      expect(dimensions.height).toBe(selector.startsWith("footer") ? 32 : width === 390 ? 20 : 24);
      expect(dimensions.textHeight - dimensions.height).toBeGreaterThan(0);
      expect(dimensions.textHeight - dimensions.height).toBeLessThan(9);
      expect(dimensions.centerDifference).toBeLessThan(0.5);
      expect(dimensions.ratio).toBeCloseTo(156 / 190, 2);
    }
    expect(await page.locator("header").evaluate(element => element.getBoundingClientRect().height)).toBeCloseTo(width === 390 ? 77 : 75, 0);
  });
}

for (const width of [390, 1440]) {
  for (const route of ["/", "/services/", "/gallery/", "/shop/", "/team/", "/quote/", "/shipping-returns/"]) {
    test(`original presentation with typography/logo only: ${route} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.route(/googletagmanager|google-analytics/, request => request.abort());
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.locator("body").evaluate(element => getComputedStyle(element).fontFamily)).toContain("Archivo");
      await expect(page.locator('header img[src="/brand/svg/taraforge3d-mark-gold-tight.svg"]')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      await expect(page.locator(".design-page, .design-section, details[name='studio-faq']")).toHaveCount(0);
      if (route === "/shop/") {
        await expect(page.locator("article")).toHaveCount(publishedProductCount);
        if (publishedProductCount > 0) {
          expect(await page.locator("article > div").first().evaluate(element => getComputedStyle(element).backgroundImage)).toContain("gradient");
        } else {
          await expect(page.getByText("New products will be shared here soon.")).toBeVisible();
        }
      }
    });
  }
}

import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { brandScripts } from "../../src/lib/brandScripts";

const baseline = JSON.parse(readFileSync("tests/fixtures/design-copy.json", "utf8"));
for (const route of Object.keys(baseline)) {
  test(`design retains all copy on ${route}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    const copy = await page.locator("main").evaluate(main => {
      const clone = main.cloneNode(true) as HTMLElement;
      clone.querySelector("header a[href='/']")?.remove();
      clone.querySelectorAll("script, style, svg").forEach(node => node.remove());
      return clone.textContent!.replace(/\s+/g, " ").trim();
    });
    expect(copy).toBe(baseline[route]);
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
});

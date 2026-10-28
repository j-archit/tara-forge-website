import { expect, test } from "@playwright/test";

const carriageTitle = "Horse-Drawn Carriage";
const carriageSelector = '[data-gallery-entry="horse-drawn-carriage"]';

test("card navigation stays independent and the modal opens on the selected full photo with project details", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/gallery/");
  const card = page.locator('[data-gallery-entry="lotus-ring-holder"]');
  await card.getByRole("button", { name: "Show photo 3 of Lotus Ring Holder" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const selectedSource = await card.locator("img").getAttribute("src");
  await card.getByRole("button", { name: "View photos and details of Lotus Ring Holder" }).click();
  const dialog = page.getByRole("dialog", { name: "Lotus Ring Holder" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Lotus Ring Holder", exact: true })).toBeVisible();
  await expect(dialog).toContainText("A lotus-inspired ring holder with layered red petals");
  await expect(dialog.getByText("Home Decor", { exact: true })).toBeVisible();
  await expect(dialog.getByRole("status")).toHaveText("Photo 3 of 4");
  const image = dialog.locator("[data-gallery-modal-image] img");
  await expect(image).toHaveAttribute("src", selectedSource!);
  await expect(image).toHaveCSS("object-fit", "contain");
  await expect(image).toHaveCSS("transform", "none");
  await image.evaluate((node: HTMLImageElement) => node.decode());
  await expect(dialog.getByRole("link", { name: "Discuss a similar project" })).toHaveAttribute("href", "/quote/");
  await dialog.getByRole("button", { name: "Next project photo" }).click();
  await expect(dialog.getByRole("status")).toHaveText("Photo 4 of 4");
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByRole("status")).toHaveText("Photo 1 of 4");
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.getByRole("status")).toHaveText("Photo 4 of 4");
  await dialog.getByRole("button", { name: "Previous project photo" }).click();
  await expect(dialog.getByRole("status")).toHaveText("Photo 3 of 4");
  await dialog.getByRole("button", { name: "View project photo 2", exact: true }).click();
  await expect(dialog.getByRole("status")).toHaveText("Photo 2 of 4");
  await expect(dialog.getByRole("button", { name: "View project photo 2", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(5200);
  await expect(card.locator("img")).toHaveAttribute("src", selectedSource!);
  await expect(dialog.getByRole("status")).toHaveText("Photo 2 of 4");
  expect(errors).toEqual([]);
});

test("keyboard focus stays in the modal and Escape restores the trigger and scroll position", async ({ page }) => {
  await page.goto("/gallery/");
  const opener = page.locator(carriageSelector).getByRole("button", { name: carriageTitle, exact: true });
  await opener.scrollIntoViewIfNeeded();
  await opener.focus();
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: carriageTitle });
  const close = dialog.getByRole("button", { name: "Close project details" });
  await expect(close).toBeFocused();
  await expect(page.locator("body")).toHaveCSS("position", "fixed");
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("link", { name: "Discuss a similar project" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
  expect(Math.abs(await page.evaluate(() => window.scrollY) - scrollBefore)).toBeLessThanOrEqual(1);
});

test("backdrop dismissal ignores drags that begin inside and all close paths support reopening", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/gallery/");
  const opener = page.locator(carriageSelector).getByRole("button", { name: `View photos and details of ${carriageTitle}` });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: carriageTitle });
  await expect(dialog).toBeVisible();
  const box = (await dialog.boundingBox())!;
  await page.mouse.move(box.x + 30, box.y + 25);
  await page.mouse.down();
  await page.mouse.move(2, 2);
  await page.mouse.up();
  await expect(dialog).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await opener.click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close project details" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await page.locator(carriageSelector).getByText("A white horse-drawn carriage display model", { exact: false }).click();
  await expect(dialog).toBeVisible();
});

test("the quote link closes the modal and releases the page scroll lock", async ({ page }) => {
  await page.goto("/gallery/");
  await page.locator(carriageSelector).getByRole("button", { name: `View photos and details of ${carriageTitle}` }).click();
  const dialog = page.getByRole("dialog", { name: carriageTitle });
  await dialog.getByRole("link", { name: "Discuss a similar project" }).click();
  await expect(page).toHaveURL(/\/quote\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Bring your ideas to life/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
});

test.describe("touch gallery details", () => {
  test.use({ hasTouch: true, isMobile: true });

  for (const size of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
    test(`modal fits and remains dismissible at ${size.width}×${size.height}`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto("/gallery/");
      await page.locator(carriageSelector).getByRole("button", { name: `View photos and details of ${carriageTitle}` }).tap();
      const dialog = page.getByRole("dialog", { name: carriageTitle });
      await expect(dialog).toBeVisible();
      const bounds = (await dialog.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(size.width);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(size.height);
      expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
      const content = dialog.locator("[data-gallery-modal-content]");
      await content.evaluate(node => { node.scrollTop = node.scrollHeight; });
      await expect(dialog.getByRole("link", { name: "Discuss a similar project" })).toBeVisible();
      const close = dialog.getByRole("button", { name: "Close project details" });
      const closeBounds = (await close.boundingBox())!;
      expect(closeBounds.y).toBeGreaterThanOrEqual(0);
      expect(closeBounds.y + closeBounds.height).toBeLessThanOrEqual(size.height);
      await close.tap();
      await expect(dialog).toHaveCount(0);
      await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
    });
  }

  test("horizontal touch swipes change photos while vertical gestures do not", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/gallery/");
    await page.locator(carriageSelector).getByRole("button", { name: `View photos and details of ${carriageTitle}` }).tap();
    const dialog = page.getByRole("dialog", { name: carriageTitle });
    const stage = dialog.locator("[data-gallery-modal-image]");
    await expect(dialog.getByRole("status")).toHaveText("Photo 1 of 2");
    await stage.dispatchEvent("pointerdown", { pointerType: "touch", clientX: 250, clientY: 150 });
    await stage.dispatchEvent("pointerup", { pointerType: "touch", clientX: 100, clientY: 160 });
    await expect(dialog.getByRole("status")).toHaveText("Photo 2 of 2");
    await stage.dispatchEvent("pointerdown", { pointerType: "touch", clientX: 120, clientY: 150 });
    await stage.dispatchEvent("pointerup", { pointerType: "touch", clientX: 125, clientY: 300 });
    await expect(dialog.getByRole("status")).toHaveText("Photo 2 of 2");
    await stage.dispatchEvent("pointerdown", { pointerType: "touch", clientX: 100, clientY: 150 });
    await stage.dispatchEvent("pointerup", { pointerType: "touch", clientX: 250, clientY: 160 });
    await expect(dialog.getByRole("status")).toHaveText("Photo 1 of 2");
  });

  test("real touch input can swipe photos and scroll details independently", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/gallery/");
    await page.locator(carriageSelector).getByRole("button", { name: `View photos and details of ${carriageTitle}` }).tap();
    const dialog = page.getByRole("dialog", { name: carriageTitle });
    const stage = dialog.locator("[data-gallery-modal-image]");
    const box = (await stage.boundingBox())!;
    const client = await page.context().newCDPSession(page);
    async function swipe(fromX: number, fromY: number, toX: number, toY: number) {
      await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: fromX, y: fromY }] });
      for (let step = 1; step <= 8; step++) {
        await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: fromX + (toX - fromX) * step / 8, y: fromY + (toY - fromY) * step / 8 }] });
      }
      await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    }
    await swipe(box.x + box.width * 0.8, box.y + box.height / 2, box.x + box.width * 0.2, box.y + box.height / 2);
    await expect(dialog.getByRole("status")).toHaveText("Photo 2 of 2");
    await swipe(box.x + box.width / 2, box.y + box.height * 0.8, box.x + box.width / 2, box.y + box.height * 0.2);
    await expect(dialog.getByRole("status")).toHaveText("Photo 2 of 2");
    const content = dialog.locator("[data-gallery-modal-content]");
    await expect.poll(() => content.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
    await expect(page.locator("body")).toHaveCSS("position", "fixed");
    await client.detach();
  });
});

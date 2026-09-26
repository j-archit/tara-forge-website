import { test, expect } from "@playwright/test";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { startContentManager } from "../../tools/content-manager/server.mjs";
import { editorFixture } from "../helpers/content-manager.mjs";

async function withEditor(page, callback) {
  const fixture = await editorFixture();
  const manager = await startContentManager({ repoRoot: fixture.root, port: 0 });
  try {
    await page.goto(manager.launchUrl);
    await expect(page.getByText("Saved on disk", { exact: true })).toBeVisible();
    await callback({ ...fixture, ...manager });
  } finally { await manager.close(); await fixture.cleanup(); }
}

test("editor saves edits and reordering as local JSON, retains hidden entries and reloads", async ({ page }) => {
  await withEditor(page, async ({ root }) => {
    const first = page.locator(".entry").first();
    await first.getByLabel("Title", { exact: true }).fill("My actual print");
    await first.getByLabel("Visible on website after publishing").uncheck();
    await first.getByRole("button", { name: "Move down" }).click();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText("Saved locally");
    const saved = JSON.parse(await readFile(join(root, "content", "gallery.json"), "utf8"));
    expect(saved.items[1].title).toBe("My actual print");
    expect(saved.items[1].published).toBe(false);
    await page.reload();
    await expect(page.locator(".entry").nth(1).getByLabel("Title", { exact: true })).toHaveValue("My actual print");
    expect((await readdir(root)).sort()).toEqual([".content-manager", "content", "public"]);
  });
});

test("editor adds and deletes catalogue entries and validates prices", async ({ page }) => {
  await withEditor(page, async ({ root }) => {
    await page.getByRole("button", { name: "Catalogue", exact: true }).click();
    await expect(page.locator(".entry")).toHaveCount(6);
    await page.getByRole("button", { name: "Add entry" }).click();
    const added = page.locator(".entry").last();
    await added.getByLabel("Title", { exact: true }).fill("New product");
    await added.getByLabel("Category", { exact: true }).fill("Custom");
    await added.getByLabel("Description", { exact: true }).fill("A real print");
    await added.getByLabel("Indicative price (₹)").fill("19.95");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText("Saved locally");
    const saved = JSON.parse(await readFile(join(root, "content", "products.json"), "utf8"));
    expect(saved.items.at(-1).price).toBe(19.95);
    expect(saved.items.at(-1).published).toBe(false);
    page.once("dialog", dialog => dialog.accept());
    await added.getByRole("button", { name: "Delete entry" }).click();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText("Saved locally");
    expect(JSON.parse(await readFile(join(root, "content", "products.json"), "utf8")).items).toHaveLength(6);
  });
});

test("editor uploads and replaces images, saves alt text and removes references without deleting assets", async ({ page }) => {
  await withEditor(page, async ({ root, png }) => {
    const first = page.locator(".entry").first();
    await first.getByLabel("Upload image").setInputFiles({ name: "print.png", mimeType: "image/png", buffer: png });
    await expect(first.locator("img")).toBeVisible();
    await first.getByLabel("Image description (alt text)").fill("Gold test print");
    await first.getByLabel("Image fitting").selectOption("cover");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText("Saved locally");
    const saved = JSON.parse(await readFile(join(root, "content", "gallery.json"), "utf8"));
    expect(saved.items[0].image.alt).toBe("Gold test print");
    expect(saved.items[0].image.fit).toBe("cover");
    await first.getByLabel("Replace image").setInputFiles({ name: "same.png", mimeType: "image/png", buffer: png });
    await expect(page.getByRole("status")).toContainText("Image saved locally");
    await first.getByRole("button", { name: "Remove image" }).click();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText("Saved locally");
    expect(JSON.parse(await readFile(join(root, "content", "gallery.json"), "utf8")).items[0].image).toBeNull();
    expect(await readdir(join(root, "public", "images", "content"))).toHaveLength(1);
  });
});

test("editor preserves unsaved edits after disk conflicts and protects against accidental discard", async ({ page }) => {
  await withEditor(page, async ({ root }) => {
    await page.locator(".entry").first().getByLabel("Title", { exact: true }).fill("Unsaved owner edit");
    page.once("dialog", dialog => dialog.dismiss());
    await page.getByRole("button", { name: "Catalogue", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Gallery", exact: true })).toBeVisible();
    const path = join(root, "content", "gallery.json");
    const doc = JSON.parse(await readFile(path, "utf8")); doc.items[0].title = "External disk edit";
    await writeFile(path, JSON.stringify(doc));
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("alert")).toContainText("changed on disk");
    await expect(page.locator(".entry").first().getByLabel("Title", { exact: true })).toHaveValue("Unsaved owner edit");
    expect(JSON.parse(await readFile(path, "utf8")).items[0].title).toBe("External disk edit");
    page.once("dialog", dialog => dialog.accept());
    await page.getByRole("button", { name: "Reload from disk" }).click();
    await expect(page.locator(".entry").first().getByLabel("Title", { exact: true })).toHaveValue("External disk edit");
  });
});

test("editor renders hostile content as text and rejects invalid uploads", async ({ page }) => {
  await withEditor(page, async ({ root }) => {
    const path = join(root, "content", "gallery.json");
    const doc = JSON.parse(await readFile(path, "utf8")); doc.items[0].title = '<img src=x onerror="window.hacked=true">';
    await writeFile(path, JSON.stringify(doc));
    await page.getByRole("button", { name: "Reload from disk" }).click();
    await expect(page.locator(".entry").first().getByRole("heading")).toContainText("<img");
    expect(await page.evaluate(() => window.hacked)).toBeUndefined();
    expect(await page.locator(".entry img").count()).toBe(0);
    await page.locator(".entry").first().getByLabel("Upload image").setInputFiles({ name: "fake.png", mimeType: "image/png", buffer: Buffer.from("not an image") });
    await expect(page.getByRole("alert")).toContainText("Only PNG");
  });
});

test("editor fits on mobile and supports keyboard save", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await withEditor(page, async () => {
    const title = page.locator(".entry").first().getByLabel("Title", { exact: true });
    await title.fill("Keyboard edit");
    await page.getByRole("button", { name: "Save changes" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status")).toContainText("Saved locally");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  });
});

test("editor disables fields while reloading to prevent losing in-flight edits", async ({ page }) => {
  await withEditor(page, async () => {
    let release;
    const paused = new Promise(resolve => { release = resolve; });
    await page.route("**/api/content/gallery", async route => { await paused; await route.continue(); });
    await page.getByRole("button", { name: "Reload from disk" }).click();
    const title = page.locator(".entry").first().getByLabel("Title", { exact: true });
    await expect(title).toBeDisabled();
    release();
    await expect(title).toBeEnabled();
  });
});

test("plain localhost access cannot edit; the private launch link authenticates only its tab", async ({ page, context }) => {
  await withEditor(page, async ({ origin }) => {
    await expect(page).toHaveURL(`${origin}/`);
    await page.reload();
    await expect(page.locator(".entry")).toHaveCount(6);
    const anonymous = await context.newPage();
    try {
      await anonymous.goto(origin);
      await expect(anonymous.getByRole("alert")).toContainText("private launch link");
      await expect(anonymous.locator(".entry")).toHaveCount(0);
      await expect(anonymous.getByRole("button", { name: "Save changes" })).toBeDisabled();
    } finally { await anonymous.close(); }
  });
});

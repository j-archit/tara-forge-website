import { test, expect } from "@playwright/test";
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { startContentManager } from "../../tools/content-manager/server.mjs";
import { editorFixture } from "../helpers/content-manager.mjs";

async function withEditor(page, callback) {
  const fixture = await editorFixture();
  const manager = await startContentManager({ repoRoot: fixture.root, port: 0 });
  try {
    await page.goto(manager.launchUrl);
    await expect(page.locator("#dirty-state")).toHaveText("Saved on disk");
    await callback({ ...fixture, ...manager });
  } finally { await manager.close(); await fixture.cleanup(); }
}
const title = page => page.getByLabel("Title", { exact: true });
const save = async page => {
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.locator("#status")).toContainText("Saved locally");
};
const readContent = async (root, name) => JSON.parse(await readFile(join(root, "content", `${name}.json`), "utf8"));

test("studio edits and reorders selected entries without losing selection, then saves locally", async ({ page }) => {
  await withEditor(page, async ({ root }) => {
    await expect(page.locator(".content-row")).toHaveCount(6);
    await expect(page.locator(".entry")).toHaveCount(1);
    await title(page).fill("My actual print");
    await page.getByLabel("Visible on website after publishing").uncheck();
    await page.getByRole("button", { name: "Move down", exact: true }).click();
    await expect(title(page)).toHaveValue("My actual print");
    await expect(page.getByRole("button", { name: "Move down", exact: true })).toBeFocused();
    await save(page);
    const saved = await readContent(root, "gallery");
    expect(saved.items[1].title).toBe("My actual print");
    expect(saved.items[1].published).toBe(false);
    await page.reload();
    await page.getByRole("button", { name: "Edit My actual print", exact: true }).click();
    await expect(title(page)).toHaveValue("My actual print");
    expect((await readdir(root)).sort()).toEqual([".content-manager", "content", "public"]);
  });
});

test("catalogue supports adding, validating, duplicating and deleting products", async ({ page }) => {
  await withEditor(page, async ({ root }) => {
    await page.getByRole("button", { name: "Catalogue", exact: true }).click();
    await page.getByRole("button", { name: "+ Add entry", exact: true }).click();
    await title(page).fill("New product");
    await page.getByLabel("Category", { exact: true }).fill("Custom");
    await page.getByLabel("Description", { exact: true }).fill("A real print");
    const price = page.getByLabel("Indicative price (₹)");
    await price.fill("-1");
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.locator("#error")).toContainText("price");
    expect((await readContent(root, "products")).items).toHaveLength(6);
    await price.fill("19.95");
    await save(page);
    expect((await readContent(root, "products")).items.at(-1).price).toBe(19.95);
    await page.getByRole("button", { name: "Duplicate", exact: true }).click();
    await expect(title(page)).toHaveValue("New product (copy)");
    await expect(page.getByLabel("Visible on website after publishing")).not.toBeChecked();
    await save(page);
    const saved = await readContent(root, "products");
    expect(saved.items).toHaveLength(8);
    expect(new Set(saved.items.map(item => item.id)).size).toBe(8);
    page.once("dialog", dialog => dialog.accept());
    await page.getByRole("button", { name: "Delete entry" }).click();
    await save(page);
    expect((await readContent(root, "products")).items).toHaveLength(7);
  });
});

test("collection switching retains both drafts and saves only the selected collection", async ({ page }) => {
  await withEditor(page, async ({ root }) => {
    await title(page).fill("Unsaved gallery title");
    await page.getByRole("button", { name: "Catalogue", exact: true }).click();
    await title(page).fill("Saved catalogue title");
    await expect(page.locator("#save-scope")).toContainText("Gallery also has unsaved changes");
    await save(page);
    expect((await readContent(root, "products")).items[0].title).toBe("Saved catalogue title");
    expect((await readContent(root, "gallery")).items[0].title).not.toBe("Unsaved gallery title");
    await page.getByRole("button", { name: "Gallery", exact: true }).click();
    await expect(title(page)).toHaveValue("Unsaved gallery title");
    await expect(page.locator("#dirty-state")).toHaveText("Unsaved changes");
    await save(page);
    expect((await readContent(root, "gallery")).items[0].title).toBe("Unsaved gallery title");
  });
});

test("search and visibility filters work, and invalid off-screen drafts are surfaced on save", async ({ page }) => {
  await withEditor(page, async ({ root }) => {
    await page.getByLabel("Search entries").fill("gear");
    await expect(page.locator(".content-row")).toHaveCount(1);
    await page.getByRole("button", { name: "Edit Mechanical Gear Assembly" }).click();
    await page.getByLabel("Visible on website after publishing").uncheck();
    await page.getByLabel("Search entries").fill("");
    await page.getByLabel("Show", { exact: true }).selectOption("hidden");
    await expect(page.locator(".content-row")).toHaveCount(1);
    await expect(page.locator("#hidden-count")).toHaveText("1");
    await title(page).fill("");
    await page.getByLabel("Show", { exact: true }).selectOption("visible");
    await page.locator(".content-row").first().click();
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.locator("#error")).toContainText("Item 2 title");
    await expect(title(page)).toHaveValue("");
    await expect(title(page)).toBeFocused();
    expect((await readContent(root, "gallery")).items[1].title).toBe("Mechanical Gear Assembly");
    await title(page).fill("Updated gear");
    await save(page);
  });
});

test("tag chips preserve commas and prevent duplicate tags", async ({ page }) => {
  await withEditor(page, async ({ root }) => {
    const input = page.getByRole("textbox", { name: "New tag", exact: true });
    await input.fill("PETG, reinforced"); await input.press("Enter");
    await input.fill("PETG, reinforced"); await page.getByRole("button", { name: "Add tag", exact: true }).click();
    await expect(page.getByText("That tag is already added.")).toBeVisible();
    await input.clear();
    await save(page);
    expect((await readContent(root, "gallery")).items[0].tags).toEqual(["PLA+", "0.12mm Layer", "PETG, reinforced"]);
    await page.reload();
    await expect(page.getByRole("button", { name: "Remove tag PETG, reinforced", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Remove tag PETG, reinforced", exact: true }).click();
    await expect(input).toBeFocused();
    await save(page);
    expect((await readContent(root, "gallery")).items[0].tags).toHaveLength(2);
  });
});

test("unfinished tags stay in the draft across entries and collections, then save", async ({ page }) => {
  await withEditor(page, async ({ root }) => {
    const input = page.getByRole("textbox", { name: "New tag", exact: true });
    await input.fill("Pending material");
    await expect(page.locator("#dirty-state")).toHaveText("Unsaved changes");
    await expect(page.getByRole("button", { name: "Save changes", exact: true })).toBeEnabled();
    expect(await page.evaluate(() => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    })).toBe(true);
    await page.locator(".content-row").nth(1).click();
    await input.fill("Second material");
    await page.locator(".content-row").first().click();
    await expect(input).toHaveValue("Pending material");
    await page.getByRole("button", { name: "Catalogue", exact: true }).click();
    await expect(page.locator("#save-scope")).toContainText("Gallery also has unsaved changes");
    await page.getByRole("button", { name: "Gallery", exact: true }).click();
    await expect(input).toHaveValue("Pending material");
    await save(page);
    expect((await readContent(root, "gallery")).items[0].tags).toContain("Pending material");
    expect((await readContent(root, "gallery")).items[1].tags).toContain("Second material");
    await expect(input).toHaveValue("");
    await expect(page.locator("#dirty-state")).toHaveText("Saved on disk");
  });
});

test("invalid unfinished tags stay editable and reload asks before discarding them", async ({ page }) => {
  await withEditor(page, async ({ root }) => {
    const input = page.getByRole("textbox", { name: "New tag", exact: true });
    await input.fill("PLA+");
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.locator("#error")).toContainText("already added");
    await expect(input).toHaveValue("PLA+");
    expect((await readContent(root, "gallery")).items[0].tags).toEqual(["PLA+", "0.12mm Layer"]);
    page.once("dialog", dialog => dialog.dismiss());
    await page.getByRole("button", { name: "Reload from disk" }).click();
    await expect(input).toHaveValue("PLA+");
    await input.fill("Unique material");
    await save(page);
    expect((await readContent(root, "gallery")).items[0].tags).toContain("Unique material");
  });
});

test("editing fields preserves library rows and thumbnails while relevant filters still update", async ({ page }) => {
  await withEditor(page, async ({ png }) => {
    await page.getByLabel("Add photos", { exact: true }).setInputFiles({ name: "print.png", mimeType: "image/png", buffer: png });
    await expect(page.locator(".content-row").first().locator("img")).toHaveCount(1);
    await page.evaluate(() => {
      window.reviewRows = [...document.querySelectorAll(".content-row")];
      window.reviewThumbnail = window.reviewRows[0].querySelector("img");
    });
    await page.getByLabel("Description", { exact: true }).fill("Updated description without rebuilding the library");
    await title(page).fill("Changed library title");
    expect(await page.evaluate(() => window.reviewRows.every((row, index) => row === document.querySelectorAll(".content-row")[index]))).toBe(true);
    expect(await page.evaluate(() => window.reviewThumbnail === document.querySelector(".content-row img"))).toBe(true);
    await expect(page.locator(".content-row").first()).toHaveAttribute("aria-label", "Edit Changed library title");
    await page.getByLabel("Search entries").fill("changed library title");
    await expect(page.locator(".content-row")).toHaveCount(1);
    await title(page).fill("Another title");
    await expect(page.locator(".content-row")).toHaveCount(0);
    await title(page).fill("Changed library title");
    await expect(page.locator(".content-row")).toHaveCount(1);
  });
});

test("studio saves independent spans, image placement, framing and multiple ordered photos", async ({ page }) => {
  await withEditor(page, async ({ root, png }) => {
    await page.getByLabel("Card width").selectOption("2");
    await page.getByLabel("Card height").selectOption("3");
    await page.getByLabel("Automatically advance photos").check();
    await page.getByLabel("Add photos", { exact: true }).setInputFiles([{ name: "front.png", mimeType: "image/png", buffer: png }, { name: "side.png", mimeType: "image/png", buffer: png }]);
    await expect(page.locator("#photo-preview")).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit photo 2" })).toBeVisible();
    await page.getByRole("button", { name: "Edit photo 1" }).click();
    await page.getByLabel("Image description (alt text)").fill("Gold test print, front");
    await page.getByLabel("Image fitting").selectOption("cover");
    await page.getByLabel("Photo frame").selectOption("false");
    for (const [label, value] of [["Horizontal position", "25"], ["Vertical position", "70"], ["Zoom", "1.25"]]) {
      await page.getByLabel(label).evaluate((input, next) => { input.value = next; input.dispatchEvent(new Event("input", { bubbles: true })); }, value);
    }
    await page.getByLabel("Soften photo edges").check();
    await expect(page.locator("#photo-preview")).toHaveClass(/cover/);
    await save(page);
    const presentation = (await readContent(root, "gallery")).items[0].presentation;
    expect(presentation.widthSpan).toBe(2); expect(presentation.heightSpan).toBe(3); expect(presentation.autoplay).toBe(true);
    expect(presentation.photos).toHaveLength(2);
    expect(presentation.photos[0]).toMatchObject({ alt: "Gold test print, front", fit: "cover", framed: false, focusX: 25, focusY: 70, zoom: 1.25, edgeFade: true });
    await page.reload();
    await expect(page.getByLabel("Card width")).toHaveValue("2");
    await expect(page.getByLabel("Photo frame")).toHaveValue("false");
    await page.getByRole("button", { name: "Later →" }).click();
    await page.getByRole("button", { name: "Edit photo 2" }).click();
    await expect(page.getByLabel("Image description (alt text)")).toHaveValue("Gold test print, front");
    await page.getByRole("button", { name: "Remove photo", exact: true }).click();
    await save(page);
    expect((await readContent(root, "gallery")).items[0].presentation.photos).toHaveLength(1);
    expect(await readdir(join(root, "public", "images", "content"))).toHaveLength(1);
  });
});

test("layout preview updates immediately and dragging a photo changes its saved position", async ({ page }) => {
  await withEditor(page, async ({ root, png }) => {
    await page.getByLabel("Card width").selectOption("3");
    await page.getByLabel("Card height").selectOption("2");
    await expect(page.locator(".layout-preview")).toHaveAttribute("aria-label", "Card occupies 3 of 3 columns and 2 of 3 rows on desktop");
    await page.getByLabel("Add photos", { exact: true }).setInputFiles({ name: "view.png", mimeType: "image/png", buffer: png });
    const stage = page.locator("#photo-stage");
    const wideRatio = await stage.evaluate(node => node.clientWidth / node.clientHeight);
    await page.getByLabel("Card width").selectOption("1");
    expect(await stage.evaluate(node => node.clientWidth / node.clientHeight)).toBeLessThan(wideRatio);
    await page.getByLabel("Card width").selectOption("3");
    await page.getByLabel("Card height").selectOption("1");
    expect(await stage.evaluate(node => node.clientWidth / node.clientHeight)).toBeGreaterThan(wideRatio);
    await page.getByLabel("Card height").selectOption("2");
    await page.getByLabel("Photo frame").selectOption("false");
    await expect(stage).toHaveCSS("overflow", "visible");
    await page.getByLabel("Zoom").evaluate(input => { input.value = "2"; input.dispatchEvent(new Event("input", { bubbles: true })); });
    await stage.scrollIntoViewIfNeeded(); const box = await stage.boundingBox();
    const imageLeft = (await page.locator("#photo-preview").boundingBox()).x;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2 + 20); await page.mouse.up();
    expect(Number(await page.getByLabel("Horizontal position").inputValue())).toBeLessThan(50);
    expect((await page.locator("#photo-preview").boundingBox()).x).toBeGreaterThan(imageLeft);
    await save(page);
    const item = (await readContent(root, "gallery")).items[0];
    expect(item.presentation).toMatchObject({ widthSpan: 3, heightSpan: 2 });
    expect(item.presentation.photos[0].focusX).not.toBe(50);
  });
});

test("dropping multiple photos imports all slides but rejects more than the project limit", async ({ page }) => {
  await withEditor(page, async ({ png, root }) => {
    const transfer = await page.evaluateHandle(bytes => {
      const data = new DataTransfer();
      data.items.add(new File([new Uint8Array(bytes)], "dropped.png", { type: "image/png" }));
      data.items.add(new File([new Uint8Array(bytes)], "another.png", { type: "image/png" }));
      return data;
    }, [...png]);
    await page.locator(".dropzone").dispatchEvent("drop", { dataTransfer: transfer });
    await expect(page.locator("#photo-preview")).toBeVisible();
    await save(page);
    expect((await readContent(root, "gallery")).items[0].presentation.photos).toHaveLength(2);
    await transfer.evaluate((data, bytes) => { for (let i = 0; i < 11; i++) data.items.add(new File([new Uint8Array(bytes)], `extra-${i}.png`, { type: "image/png" })); }, [...png]);
    await page.locator(".dropzone").dispatchEvent("drop", { dataTransfer: transfer });
    await expect(page.locator("#error")).toContainText("up to 12 photos");
    expect(await readdir(join(root, "public", "images", "content"))).toHaveLength(1);
    await transfer.dispose();
  });
});

test("failed uploads can retry the same file without reloading or losing edits", async ({ page }) => {
  await withEditor(page, async ({ png }) => {
    await title(page).fill("Preserved draft");
    await page.route("**/api/upload", route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Temporary upload failure" }) }), { times: 1 });
    const file = { name: "print.png", mimeType: "image/png", buffer: png };
    await page.getByLabel("Add photos", { exact: true }).setInputFiles(file);
    await expect(page.locator("#error")).toContainText("Temporary upload failure");
    await expect(title(page)).toHaveValue("Preserved draft");
    await page.getByLabel("Add photos", { exact: true }).setInputFiles(file);
    await expect(page.locator("#photo-preview")).toBeVisible();
    await save(page);
  });
});

test("disk conflicts preserve drafts and reload requires confirmation", async ({ page }) => {
  await withEditor(page, async ({ root }) => {
    await title(page).fill("Unsaved owner edit");
    const path = join(root, "content", "gallery.json"); const doc = await readContent(root, "gallery"); doc.items[0].title = "External disk edit";
    await writeFile(path, JSON.stringify(doc));
    await page.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect(page.locator("#error")).toContainText("changed on disk");
    await expect(title(page)).toHaveValue("Unsaved owner edit");
    page.once("dialog", dialog => dialog.dismiss());
    await page.getByRole("button", { name: "Reload from disk" }).click();
    await expect(title(page)).toHaveValue("Unsaved owner edit");
    page.once("dialog", dialog => dialog.accept());
    await page.getByRole("button", { name: "Reload from disk" }).click();
    await expect(title(page)).toHaveValue("External disk edit");
    await expect(page.locator("#dirty-state")).toHaveText("Saved on disk");
  });
});

test("untrusted content remains text in the library, editor and preview", async ({ page }) => {
  await withEditor(page, async ({ root }) => {
    const doc = await readContent(root, "gallery"); doc.items[0].title = '<img src=x onerror="window.hacked=true">';
    await writeFile(join(root, "content", "gallery.json"), JSON.stringify(doc));
    await page.getByRole("button", { name: "Reload from disk" }).click();
    await expect(page.locator("#editor-title")).toContainText("<img");
    await expect(page.locator("#card-preview h3")).toContainText("<img");
    expect(await page.evaluate(() => window.hacked)).toBeUndefined();
    expect(await page.locator("#editor img").count()).toBe(0);
    await page.getByLabel("Add photos", { exact: true }).setInputFiles({ name: "fake.png", mimeType: "image/png", buffer: Buffer.from("not an image") });
    await expect(page.locator("#error")).toContainText("Only PNG");
  });
});

test("preview settings accept local ports, persist and reject external or script URLs", async ({ page }) => {
  await withEditor(page, async () => {
    await page.getByRole("button", { name: "Preview settings" }).click();
    for (const value of ["javascript:alert(1)", "https://example.com", "http://localhost.evil.example:3000", "http://user@localhost:3000"]) {
      await page.getByLabel("Preview address", { exact: true }).fill(value);
      await page.getByRole("button", { name: "Apply preview address" }).click();
      await expect(page.locator("#settings-error")).toContainText("local HTTP address");
    }
    await page.getByLabel("Preview address", { exact: true }).fill("http://127.0.0.1:8765");
    await page.getByRole("button", { name: "Apply preview address" }).click();
    await expect(page.locator("#preview")).toHaveAttribute("href", "http://127.0.0.1:8765/gallery/");
    await page.getByRole("button", { name: "Catalogue", exact: true }).click();
    await expect(page.locator("#preview")).toHaveAttribute("href", "http://127.0.0.1:8765/shop/");
    await page.reload();
    await expect(page.locator("#preview")).toHaveAttribute("href", "http://127.0.0.1:8765/gallery/");
  });
});

test("busy operations block editing and navigation until the request completes", async ({ page }) => {
  await withEditor(page, async () => {
    let release; const paused = new Promise(resolve => { release = resolve; });
    await page.route("**/api/content/gallery", async route => { await paused; await route.continue(); });
    await page.getByRole("button", { name: "Reload from disk" }).click();
    await expect(title(page)).toBeDisabled();
    await expect(page.getByRole("button", { name: "Catalogue", exact: true })).toBeDisabled();
    await expect(page.getByLabel("Search entries")).toBeDisabled();
    release(); await expect(title(page)).toBeEnabled();
  });
});

test("anonymous and expired sessions never claim the workspace is saved", async ({ page, context }) => {
  await withEditor(page, async ({ origin }) => {
    const anonymous = await context.newPage();
    try {
      await anonymous.goto(origin);
      await expect(anonymous.locator("#error")).toContainText("private launch link");
      await expect(anonymous.locator("#dirty-state")).toHaveText("Workspace not loaded");
      await expect(anonymous.locator("#save")).toBeDisabled();
      await anonymous.goto(`${origin}/#session=${"a".repeat(64)}`);
      await anonymous.reload();
      await expect(anonymous.locator("#error")).toContainText("Invalid editor session");
      await expect(anonymous.locator(".entry")).toHaveCount(0);
    } finally { await anonymous.close(); }
  });
});

test("empty collections have a usable create flow", async ({ page }) => {
  await withEditor(page, async ({ root }) => {
    await writeFile(join(root, "content", "gallery.json"), JSON.stringify({ schemaVersion: 1, items: [] }));
    await page.getByRole("button", { name: "Reload from disk" }).click();
    await expect(page.getByRole("heading", { name: "A fresh canvas." })).toBeVisible();
    await page.locator("#editor").getByRole("button", { name: "+ Add entry" }).click();
    await expect(title(page)).toBeFocused();
    await title(page).fill("First print");
    await page.getByLabel("Category", { exact: true }).fill("Prototypes");
    await page.getByLabel("Description", { exact: true }).fill("A new prototype.");
    await save(page);
    expect((await readContent(root, "gallery")).items).toHaveLength(1);
  });
});

test("studio works on desktop and mobile with keyboard saving", async ({ page }) => {
  await withEditor(page, async () => {
    await mkdir("output/playwright/content-studio", { recursive: true });
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.screenshot({ path: "output/playwright/content-studio/desktop.png", fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await title(page).fill("Keyboard edit");
    await title(page).press("ControlOrMeta+s");
    await expect(page.locator("#status")).toContainText("Saved locally");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: "output/playwright/content-studio/mobile.png", fullPage: true });
  });
});

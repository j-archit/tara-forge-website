import { test, expect } from "@playwright/test";
import { editorFixture } from "../helpers/content-manager.mjs";
import { startFixtureWebsite } from "../helpers/public-site.mjs";
import { createStore } from "../../tools/content-manager/storage.mjs";

test("public gallery and shop render managed photos, hide drafts, retain order and handle empty collections", async ({ page }) => {
  test.setTimeout(240000);
  const fixture = await editorFixture({ website: true });
  let website;
  try {
    const store = await createStore(fixture.root);
    const image = await store.upload(fixture.png); image.alt = "Managed test print";
    const gallery = await store.load("gallery");
    gallery.document.items[0].image = image;
    gallery.document.items[1].published = false;
    gallery.document.items[2].title = "<script>not HTML</script>";
    gallery.document.items[3].title = "t".repeat(120);
    gallery.document.items[3].category = "c".repeat(80);
    gallery.document.items[3].description = "x".repeat(1200);
    gallery.document.items[3].tags = Array.from({ length: 8 }, (_, i) => `${i}${"z".repeat(39)}`);
    gallery.document.items.reverse();
    await store.save("gallery", gallery.document, gallery.revision);
    const products = await store.load("products"); products.document.items[0].image = { ...image, fit: "cover" }; products.document.items[1].published = false;
    await store.save("products", products.document, products.revision);
    website = await startFixtureWebsite(fixture.root);
    await page.route(/googletagmanager|google-analytics/, route => route.abort());
    await page.goto(`${website.origin}/gallery/`);
    const photo = page.getByRole("img", { name: "Managed test print" });
    await expect(photo).toBeVisible();
    expect(await photo.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    const photoBox = await photo.boundingBox();
    expect(photoBox.width / photoBox.height).toBeCloseTo(4 / 3, 1);
    await expect(page.getByRole("heading", { name: "Mechanical Gear Assembly" })).toHaveCount(0);
    await expect(page.locator("main h3").first()).toHaveText("Ergonomic Mouse Shell");
    await expect(page.getByRole("heading", { name: "<script>not HTML</script>" })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    const longCard = page.locator('[data-gallery-entry="architectural-scaled-model"]');
    expect(await longCard.evaluate(card => card.scrollHeight - card.clientHeight)).toBeLessThanOrEqual(1);
    await page.goto(`${website.origin}/shop/`);
    await expect(page.getByRole("img", { name: "Managed test print" })).toBeVisible();
    const shopPhotoBox = await page.getByRole("img", { name: "Managed test print" }).boundingBox();
    expect(shopPhotoBox.width / shopPhotoBox.height).toBeCloseTo(1, 1);
    await expect(page.locator("article")).toHaveCount(5);
    await expect(page.getByRole("heading", { name: "Celestial Planter" })).toHaveCount(0);
    for (const collection of ["gallery", "products"]) {
      const loaded = await store.load(collection);
      await store.save(collection, { schemaVersion: 1, items: [] }, loaded.revision);
      expect((await store.load(collection)).document.items).toHaveLength(0);
    }
    // A real development preview recompiles asynchronously after filesystem saves.
    for (const [path, message] of [["gallery", "New projects will be shared here soon."], ["shop", "New products will be shared here soon."]]) {
      await expect.poll(async () => {
        const response = await page.goto(`${website.origin}/${path}/`);
        return response?.status() === 200 && await page.getByText(message).count() === 1;
      }, { timeout: 45000, intervals: [500, 1000, 2000] }).toBe(true);
      await expect(page.getByText(message)).toBeVisible();
    }
  } finally { if (website) await website.close(); await fixture.cleanup(); }
});

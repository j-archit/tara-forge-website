import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const origin = "https://taraforge3d.in";
const routes = ["/", "/services/", "/b2b/", "/gallery/", "/shop/", "/team/", "/quote/", "/shipping-returns/"];

test("production metadata and business schema consistently identify the public domain", async ({ page }) => {
  for (const path of routes) {
    await page.goto(path);
    const title = await page.title();
    if (path === "/") expect(title).toBe("Custom 3D Prints Bangalore & Across India | TaraForge3D");
    expect(title.endsWith(" | TaraForge3D")).toBe(true);
    expect(title.match(/TaraForge3D/g)).toHaveLength(1);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toMatch(/Bangalore/);
    expect(description).toMatch(/India/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", description!);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", description!);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${origin}${path}`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `${origin}${path}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", `${origin}/og-image.png`);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const nodes = scripts.flatMap(text => { const schema = JSON.parse(text); return schema["@graph"] ?? [schema]; });
    const business = nodes.filter(node => node["@type"] === "LocalBusiness");
    expect(business).toHaveLength(1);
    expect(business[0]["@id"]).toBe(`${origin}/#business`);
    expect(business[0].email).toBe("taraforge3d@gmail.com");
    expect(business[0].telephone).toBe("+917042337788");
    expect(business[0].address.addressLocality).toBe("Bangalore");
    expect(business[0].areaServed).toEqual({ "@type": "Country", name: "India" });
    expect(scripts.join(" ")).not.toContain("https://taraforge.in");
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain(path === "/shop/" ? "noindex" : "index");
    if (path === "/shop/") {
      await expect(page.locator('meta[name="googlebot"]')).toHaveAttribute("content", /noindex/);
    }
  }
  const response = await page.request.get("/og-image.png");
  expect(response.ok()).toBe(true);
  const bytes = await response.body();
  expect(bytes.readUInt32BE(16)).toBe(1200);
  expect(bytes.readUInt32BE(20)).toBe(630);
});

test("crawl files advertise only the live, indexable canonical routes", async ({ request }) => {
  expect((await request.get("/CNAME")).ok()).toBe(true);
  expect((await (await request.get("/CNAME")).text()).trim()).toBe("taraforge3d.in");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain(`Sitemap: ${origin}/sitemap.xml`);
  expect(robots).toContain("Allow: /");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("https://taraforge.in");
  expect(sitemap).not.toContain("<lastmod>");
  expect(sitemap).not.toContain(`${origin}/shop/`);
  expect(sitemap).not.toContain(`${origin}/b2b/terms/`);
  const terms = await (await request.get("/b2b/terms/")).text();
  expect(terms).toMatch(/<meta name="robots" content="noindex, follow"/);
  expect(terms).toMatch(/<meta name="googlebot" content="noindex, follow"/);
  for (const path of routes) {
    const html = await (await request.get(path)).text();
    const incoming = [...html.matchAll(/<a\b[^>]*href="\/b2b\/terms\/?"/g)];
    expect(incoming).toHaveLength(path === "/b2b/" ? 1 : 0);
  }
  for (const path of routes.filter(path => path !== "/shop/")) expect(sitemap).toContain(`<loc>${origin}${path}</loc>`);
});

test("all published gallery photos are discoverable without carousel interactions", async ({ page, request }) => {
  const document = JSON.parse(readFileSync("content/gallery.json", "utf8"));
  const entries = document.items.filter((entry: { published: boolean }) => entry.published);
  await page.goto("/gallery/");
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  const collection = scripts.map(text => JSON.parse(text)).find(schema => schema["@type"] === "CollectionPage");
  expect(collection.mainEntity.itemListElement).toHaveLength(entries.length);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const [index, entry] of entries.entries()) {
    const photos = entry.presentation?.photos ?? (entry.image ? [entry.image] : []);
    const item = collection.mainEntity.itemListElement[index].item;
    expect(item.name).toBe(entry.title);
    expect(item.description).toBe(entry.description);
    expect(item.image).toHaveLength(photos.length);
    for (const [photoIndex, photo] of photos.entries()) {
      expect(item.image[photoIndex].contentUrl).toBe(`${origin}${photo.src}`);
      expect(item.image[photoIndex].caption).toBe(photo.alt);
      expect(sitemap).toContain(`<image:loc>${origin}${photo.src}</image:loc>`);
      expect((await request.get(photo.src)).ok()).toBe(true);
    }
  }
});

test("service schema reflects the existing visible offering", async ({ page }) => {
  await page.goto("/services/");
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  const catalog = scripts.map(text => JSON.parse(text)).find(schema => schema["@type"] === "OfferCatalog");
  expect(catalog.itemListElement).toHaveLength(4);
  for (const offer of catalog.itemListElement) {
    expect(offer.itemOffered.provider["@id"]).toBe(`${origin}/#business`);
    await expect(page.getByText(offer.itemOffered.description, { exact: true })).toBeAttached();
  }
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Specialized Capabilities");
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateDocument } from "../tools/content-manager/schema.mjs";
import { canonicalUrl, createPageMetadata, SITE_URL } from "../src/lib/siteMetadata.ts";
import { businessSchema, BUSINESS_ID, galleryImageUrls, gallerySchema, serializeJsonLd, serviceCatalogSchema } from "../src/lib/structuredData.ts";
import { MAX_DESIGN_FILE_SIZE_BYTES, validateDesignFile } from "../src/lib/intakeFile.ts";
import { QUOTE_EMAIL, productInquiryHref, quoteMailtoHref } from "../src/lib/contact.ts";
import { PAYMENT_TERMS } from "../src/data/siteContent.ts";
import { fadeIn } from "../src/lib/animations.ts";

test("card reveals preserve six-card timing and cap delays across 200 entries", () => {
  assert.equal(fadeIn().transition.delay, 0);
  assert.equal(fadeIn(0.05).transition.delay, 0.05);
  for (let index = 0; index < 200; index++) {
    const animation = fadeIn(index * 0.1);
    assert.equal(animation.transition.delay, index < 6 ? index * 0.1 : 0.5);
    assert.equal(animation.transition.duration, 0.7);
    assert.equal(animation.whileInView.opacity, 1);
    assert.equal(animation.viewport.once, true);
  }
});

test("page metadata uses its own canonical and social URL", () => {
  const metadata = createPageMetadata("Services", "Service description", "/services");
  assert.equal(metadata.alternates.canonical, `${SITE_URL}/services/`);
  assert.equal(metadata.openGraph.url, `${SITE_URL}/services/`);
  assert.equal(metadata.openGraph.title, "Services | TaraForge3D");
  assert.equal(metadata.twitter.description, "Service description");
});

test("canonical URLs use the live host and normalize trailing slashes", () => {
  assert.equal(SITE_URL, "https://taraforge3d.in");
  for (const path of ["/services", "/services/", "/services/?source=test#quote"]) {
    assert.equal(canonicalUrl(path), "https://taraforge3d.in/services/");
  }
  assert.equal(canonicalUrl(), `${SITE_URL}/`);
  assert.throws(() => canonicalUrl("https://example.com/services"), /public site origin/);
});

test("coming-soon metadata stays followable but out of search results", () => {
  const metadata = createPageMetadata("Shop", "Preview", "/shop", { index: false });
  assert.equal(metadata.robots.index, false);
  assert.equal(metadata.robots.follow, true);
  assert.equal(metadata.robots.googleBot.index, false);
});

test("business identity is unique and JSON-LD cannot escape its script", () => {
  const schema = businessSchema();
  const business = schema["@graph"].filter(node => node["@type"] === "LocalBusiness");
  assert.equal(business.length, 1);
  assert.equal(business[0]["@id"], BUSINESS_ID);
  assert.equal(business[0].telephone, "+917042337788");
  assert.equal(schema["@graph"][1].publisher["@id"], BUSINESS_ID);
  const text = { name: '</script><script>alert("x")</script>\u2028\u2029' };
  const serialized = serializeJsonLd(text);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), text);
});

test("gallery discovery includes all published photos, supports legacy entries and excludes drafts", () => {
  const photo = (src, alt = "Existing photo") => ({ src, alt, width: 640, height: 800 });
  const entries = [
    { id: "published", title: "Existing project", category: "Display", description: "Existing description", published: true, image: null, presentation: { photos: [photo("/images/first.webp"), photo("/images/second.webp", '</script><script>bad</script>')] } },
    { id: "legacy", title: "Legacy project", category: "Display", description: "Legacy description", published: true, image: photo("/images/first.webp") },
    { id: "draft", title: "Private draft", category: "Display", description: "Draft description", published: false, image: photo("/images/draft.webp") },
  ];
  assert.deepEqual(galleryImageUrls(entries), [`${SITE_URL}/images/first.webp`, `${SITE_URL}/images/second.webp`]);
  const schema = gallerySchema(entries);
  assert.equal(schema.mainEntity.itemListElement.length, 2);
  assert.equal(schema.mainEntity.itemListElement[0].item.image.length, 2);
  assert.equal(schema.mainEntity.itemListElement[0].item.description, entries[0].description);
  assert.equal(schema.mainEntity.itemListElement[1].position, 2);
  assert.ok(!serializeJsonLd(schema).includes("<script>"));
  assert.ok(!serializeJsonLd(schema).includes("Private draft"));
  assert.deepEqual(galleryImageUrls([]), []);
  assert.equal(gallerySchema([]).mainEntity.itemListElement.length, 0);
});

test("service schema uses existing labels and descriptions and the single business identity", () => {
  const schema = serviceCatalogSchema([{ id: "parts", label: "Custom Functional Parts", description: "Existing description" }]);
  const service = schema.itemListElement[0].itemOffered;
  assert.equal(service.name, "Custom Functional Parts");
  assert.equal(service.description, "Existing description");
  assert.equal(service.provider["@id"], BUSINESS_ID);
  assert.equal(service.url, `${SITE_URL}/services/`);
});

test("design files accept supported extensions regardless of case", () => {
  for (const name of ["model.STL", "model.step", "model.STP", "model.3mf"]) {
    assert.equal(validateDesignFile({ name, size: 1024 }), null);
  }
});

test("design files reject unsupported types", () => {
  assert.match(validateDesignFile({ name: "model.obj", size: 1024 }), /STL, STEP, STP, or 3MF/);
});

test("design files reject empty or oversized files", () => {
  assert.match(validateDesignFile({ name: "model.stl", size: 0 }), /empty/);
  assert.equal(validateDesignFile({ name: "model.stl", size: MAX_DESIGN_FILE_SIZE_BYTES }), null);
  assert.match(validateDesignFile({ name: "model.stl", size: MAX_DESIGN_FILE_SIZE_BYTES + 1 }), /25 MB/);
});

test("quote email asks for details and reminds the sender to attach a file", () => {
  const url = new URL(quoteMailtoHref());
  assert.equal(url.pathname, QUOTE_EMAIL);
  const body = url.searchParams.get("body");
  for (const field of ["Material:", "Quantity:", "Approximate dimensions:", "Intended use:"]) {
    assert.ok(body.includes(field));
  }
  assert.match(body, /Please attach your design file before sending/);
  assert.doesNotMatch(body, /I've attached/);
});

test("payment terms identify UPI and both project milestones", () => {
  assert.match(PAYMENT_TERMS, /UPI only/);
  assert.match(PAYMENT_TERMS, /50%.*confirm the project/);
  assert.match(PAYMENT_TERMS, /remaining 50%.*before shipping/);
});

test("product inquiry email includes the item and SKU", () => {
  const url = new URL(productInquiryHref({ id: "tf-test", title: "Sample Print" }));
  assert.equal(url.pathname, QUOTE_EMAIL);
  assert.match(url.searchParams.get("subject"), /Sample Print/);
  assert.match(url.searchParams.get("body"), /Sample Print \(SKU: tf-test\)/);
});

test("versioned website content conforms to the editor schema", () => {
  for (const collection of ["gallery", "products"]) {
    const document = JSON.parse(readFileSync(new URL(`../content/${collection}.json`, import.meta.url), "utf8"));
    validateDocument(collection, document);
  }
});

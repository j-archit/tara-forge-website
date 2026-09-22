import test from "node:test";
import assert from "node:assert/strict";
import { createPageMetadata, SITE_URL } from "../src/lib/siteMetadata.ts";
import { MAX_DESIGN_FILE_SIZE_BYTES, validateDesignFile } from "../src/lib/intakeFile.ts";
import { QUOTE_EMAIL, quoteMailtoHref } from "../src/lib/contact.ts";
import { PAYMENT_TERMS } from "../src/lib/paymentTerms.ts";

test("page metadata uses its own canonical and social URL", () => {
  const metadata = createPageMetadata("Services", "Service description", "/services");
  assert.equal(metadata.alternates.canonical, `${SITE_URL}/services`);
  assert.equal(metadata.openGraph.url, `${SITE_URL}/services`);
  assert.equal(metadata.openGraph.title, "Services | TaraForge3D");
  assert.equal(metadata.twitter.description, "Service description");
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

import { CONTACT } from "../data/siteContent.ts";

export const QUOTE_EMAIL = CONTACT.email;

export const QUOTE_EMAIL_BODY = [
  "Hi TaraForge3D Team,",
  "",
  "I'd like a quote for a 3D printing project.",
  "",
  "Material: ",
  "Quantity: ",
  "Approximate dimensions: ",
  "Intended use: ",
  "Additional details: ",
  "",
  "Please attach your design file before sending.",
].join("\n");

export function quoteMailtoHref(): string {
  return `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent("New Project Quote Request")}&body=${encodeURIComponent(QUOTE_EMAIL_BODY)}`;
}

export function productInquiryHref(product: { readonly id: string; readonly title: string }): string {
  const subject = encodeURIComponent(`Availability Inquiry: ${product.title}`);
  const body = encodeURIComponent(`Hello TaraForge3D,\n\nI'm interested in the ${product.title} (SKU: ${product.id}). Could you confirm availability, final pricing, and shipping options?\n\nThank you!`);
  return `mailto:${QUOTE_EMAIL}?subject=${subject}&body=${body}`;
}

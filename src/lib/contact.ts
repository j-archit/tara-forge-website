export const QUOTE_EMAIL = "taraforge3d@gmail.com";

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

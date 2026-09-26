export const COLLECTIONS = ["gallery", "products"];
export const THEMES = ["blue", "green", "purple", "cyan", "gold", "rose", "slate"];
export const ASSET_PATTERN = /^\/images\/content\/[a-f0-9]{64}\.webp$/;

function fail(message) { throw new Error(message); }
function object(value, keys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  if (Object.keys(value).some(key => !keys.includes(key))) fail(`${label} contains unsupported fields`);
}
function string(value, max, label, required = true) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) fail(`${label} is missing or invalid (maximum ${max} characters)`);
}

export function validateDocument(collection, document) {
  if (!COLLECTIONS.includes(collection)) fail("Unknown collection");
  object(document, ["schemaVersion", "items"], "Document");
  if (document.schemaVersion !== 1) fail("Unsupported schema version");
  if (!Array.isArray(document.items) || document.items.length > 200) fail("Items must be an array with at most 200 entries");
  const ids = new Set();
  for (const [index, item] of document.items.entries()) {
    const label = `Item ${index + 1}`;
    object(item, ["id", "title", "category", "description", "theme", "published", "image", ...(collection === "gallery" ? ["tags"] : ["price", "currency", "tag"])], label);
    string(item.id, 80, `${label} ID`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || ids.has(item.id)) fail(`${label} ID must be a unique lowercase slug`);
    ids.add(item.id);
    string(item.title, 120, `${label} title`);
    string(item.category, 80, `${label} category`);
    string(item.description, 1200, `${label} description`);
    if (!THEMES.includes(item.theme)) fail(`${label} theme is invalid`);
    if (typeof item.published !== "boolean") fail(`${label} published flag must be boolean`);
    if (collection === "gallery") {
      if (!Array.isArray(item.tags) || item.tags.length > 8) fail(`${label} needs at most 8 tags`);
      item.tags.forEach(tag => string(tag, 40, `${label} tag`));
    } else {
      if (!Number.isFinite(item.price) || item.price < 0 || item.price > 10000000 || Math.abs(item.price * 100 - Math.round(item.price * 100)) > 0.000001) fail(`${label} price must be between 0 and 10000000 with at most two decimal places`);
      if (item.currency !== "₹") fail(`${label} currency must be ₹`);
      string(item.tag, 40, `${label} badge`, false);
    }
    if (item.image !== null) {
      object(item.image, ["src", "alt", "width", "height", "fit"], `${label} image`);
      if (typeof item.image.src !== "string" || !ASSET_PATTERN.test(item.image.src)) fail(`${label} image must be a managed WebP asset`);
      string(item.image.alt, 240, `${label} image alt text`);
      for (const dimension of ["width", "height"]) {
        if (!Number.isInteger(item.image[dimension]) || item.image[dimension] < 1 || item.image[dimension] > 1600) fail(`${label} image dimensions are invalid`);
      }
      if (!["contain", "cover"].includes(item.image.fit)) fail(`${label} image fit is invalid`);
    }
  }
  return document;
}

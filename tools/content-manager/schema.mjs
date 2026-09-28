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
function validateImage(image, label, galleryPhoto = false) {
  object(image, ["src", "alt", "width", "height", "fit", ...(galleryPhoto ? ["framed", "focusX", "focusY", "zoom", "edgeFade"] : [])], label);
  if (typeof image.src !== "string" || !ASSET_PATTERN.test(image.src)) fail(`${label} must be a managed WebP asset`);
  string(image.alt, 240, `${label} alt text`);
  for (const dimension of ["width", "height"]) {
    if (!Number.isInteger(image[dimension]) || image[dimension] < 1 || image[dimension] > 1600) fail(`${label} dimensions are invalid`);
  }
  if (!["contain", "cover"].includes(image.fit)) fail(`${label} fit is invalid`);
  if (galleryPhoto) {
    if (typeof image.framed !== "boolean" || typeof image.edgeFade !== "boolean") fail(`${label} framing is invalid`);
    for (const axis of ["focusX", "focusY"]) if (!Number.isInteger(image[axis]) || image[axis] < 0 || image[axis] > 100) fail(`${label} position is invalid`);
    if (!Number.isFinite(image.zoom) || image.zoom < 1 || image.zoom > 2 || Math.abs(Math.round(image.zoom * 100) - image.zoom * 100) > 0.000001) fail(`${label} zoom is invalid`);
  }
}

export function validateDocument(collection, document) {
  if (!COLLECTIONS.includes(collection)) fail("Unknown collection");
  object(document, ["schemaVersion", "items"], "Document");
  if (document.schemaVersion !== 1) fail("Unsupported schema version");
  if (!Array.isArray(document.items) || document.items.length > 200) fail("Items must be an array with at most 200 entries");
  const ids = new Set();
  for (const [index, item] of document.items.entries()) {
    const label = `Item ${index + 1}`;
    object(item, ["id", "title", "category", "description", "theme", "published", "image", ...(collection === "gallery" ? ["tags", "presentation"] : ["price", "currency", "tag"])], label);
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
      if (new Set(item.tags).size !== item.tags.length) fail(`${label} tags must be unique`);
      if (item.presentation !== undefined) {
        object(item.presentation, ["widthSpan", "heightSpan", "autoplay", "photos"], `${label} presentation`);
        for (const axis of ["widthSpan", "heightSpan"]) if (![1, 2, 3].includes(item.presentation[axis])) fail(`${label} ${axis} must be 1, 2 or 3`);
        if (typeof item.presentation.autoplay !== "boolean") fail(`${label} autoplay must be boolean`);
        if (!Array.isArray(item.presentation.photos) || item.presentation.photos.length > 12) fail(`${label} supports at most 12 photos`);
        item.presentation.photos.forEach((photo, photoIndex) => validateImage(photo, `${label} photo ${photoIndex + 1}`, true));
        if (item.image !== null) fail(`${label} cannot combine a legacy image with presentation photos`);
      }
    } else {
      if (!Number.isFinite(item.price) || item.price < 0 || item.price > 10000000 || Math.abs(item.price * 100 - Math.round(item.price * 100)) > 0.000001) fail(`${label} price must be between 0 and 10000000 with at most two decimal places`);
      if (item.currency !== "₹") fail(`${label} currency must be ₹`);
      string(item.tag, 40, `${label} badge`, false);
    }
    if (item.image !== null) validateImage(item.image, `${label} image`);
  }
  return document;
}

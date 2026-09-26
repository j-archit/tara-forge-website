/* Local editor only. All content is rendered as text, never as HTML. */
// The launch capability arrives in the URL fragment, never in an HTTP URL.
// Keep it for reloads in this tab only; the public HTML contains no token.
const suppliedToken = new URLSearchParams(location.hash.slice(1)).get("session");
const sessionKey = "taraforge-editor-session";
let token = "";
try {
  if (suppliedToken && /^[a-f0-9]{64}$/.test(suppliedToken)) sessionStorage.setItem(sessionKey, suppliedToken);
  token = sessionStorage.getItem(sessionKey) || suppliedToken || "";
} catch { token = suppliedToken || ""; }
if (location.hash) history.replaceState(null, "", location.pathname);
const $ = id => document.getElementById(id);
const themes = ["blue", "green", "purple", "cyan", "gold", "rose", "slate"];
let collection = "gallery";
let content;
let revision;
let dirty = false;
let busy = false;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function changed() { dirty = true; updateToolbar(); }
function updateToolbar() {
  $("dirty-state").textContent = dirty ? "Unsaved changes" : "Saved on disk";
  for (const id of ["save", "reload", "add", "gallery-tab", "products-tab"]) $(id).disabled = busy || !content;
  for (const id of ["reload", "gallery-tab", "products-tab"]) $(id).disabled = busy;
  $("save").disabled = busy || !content || !dirty;
  document.querySelectorAll(".actions button, input[type=file]").forEach(node => { node.disabled = busy || node.dataset.unavailable === "true"; });
  document.querySelectorAll(".entry input, .entry textarea, .entry select").forEach(node => { node.disabled = busy; });
}
async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { "x-content-token": token, ...(options.body ? { "Content-Type": "application/json" } : {}) } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed");
  return result;
}
async function operation(callback) {
  busy = true;
  $("error").textContent = "";
  $("status").textContent = "";
  updateToolbar();
  try { await callback(); }
  catch (error) { $("error").textContent = error.message; }
  finally { busy = false; updateToolbar(); }
}
async function load() {
  await operation(async () => {
    const result = await api(`/api/content/${collection}`);
    content = result.document;
    revision = result.revision;
    dirty = false;
    render();
  });
}
function field(parent, item, key, label, { type = "text", max = 120, optional = false, options } = {}) {
  const wrapper = element("label", label);
  const input = element(options ? "select" : type === "textarea" ? "textarea" : "input");
  if (options) options.forEach(value => { const option = element("option", value); option.value = value; input.append(option); });
  else if (type !== "textarea") input.type = type;
  input.required = !optional;
  input.maxLength = max;
  if (type === "number") { input.min = "0"; input.max = "10000000"; input.step = "0.01"; }
  input.value = key === "tags" ? item.tags.join(", ") : item[key];
  input.addEventListener("input", () => {
    item[key] = key === "tags" ? input.value.split(",").map(tag => tag.trim()).filter(Boolean) : type === "number" ? Number(input.value) : input.value;
    changed();
  });
  wrapper.append(input);
  parent.append(wrapper);
  return input;
}
function button(parent, text, callback, disabled = false) {
  const node = element("button", text);
  node.type = "button";
  node.disabled = disabled;
  node.dataset.unavailable = String(disabled);
  node.addEventListener("click", callback);
  parent.append(node);
  return node;
}
function render() {
  $("entries").replaceChildren();
  $("collection-heading").textContent = collection === "gallery" ? "Gallery" : "Catalogue";
  $("preview").href = `http://localhost:3000/${collection === "gallery" ? "gallery" : "shop"}`;
  for (const name of ["gallery", "products"]) $(`${name}-tab`).setAttribute("aria-pressed", String(name === collection));
  if (!content.items.length) $("entries").append(element("p", "No entries yet. Add an entry to get started."));
  content.items.forEach((item, index) => {
    const card = element("section", undefined, "entry");
    card.id = `entry-${item.id}`;
    card.append(element("h3", `${index + 1}. ${item.title || "New entry"}`), element("p", `ID: ${item.id}`, "hint"));
    const actions = element("div", undefined, "actions");
    button(actions, "Move up", () => move(index, -1), index === 0);
    button(actions, "Move down", () => move(index, 1), index === content.items.length - 1);
    button(actions, "Delete entry", () => {
      if (!confirm(`Remove ${item.title || "this entry"}? Its image file will be kept. Save to apply this change.`)) return;
      content.items.splice(index, 1); changed(); render();
    });
    card.append(actions);
    const fields = element("div", undefined, "fields");
    const visible = element("label", "Visible on website after publishing", "checkbox");
    const checkbox = element("input"); checkbox.type = "checkbox"; checkbox.checked = item.published;
    checkbox.addEventListener("change", () => { item.published = checkbox.checked; changed(); });
    visible.prepend(checkbox); fields.append(visible);
    field(fields, item, "title", "Title");
    field(fields, item, "category", "Category", { max: 80 });
    field(fields, item, "description", "Description", { type: "textarea", max: 1200 });
    field(fields, item, "theme", "Placeholder theme", { options: themes });
    if (collection === "gallery") field(fields, item, "tags", "Tags (comma-separated, up to 8)", { optional: true, max: 334 });
    else {
      field(fields, item, "price", "Indicative price (₹)", { type: "number" });
      field(fields, item, "tag", "Badge (optional)", { optional: true, max: 40 });
    }
    card.append(fields);
    if (item.image) {
      const img = element("img"); img.src = item.image.src; img.alt = item.image.alt; img.className = "thumbnail"; img.style.objectFit = item.image.fit;
      card.append(img, element("p", `${item.image.width} × ${item.image.height} · ${item.image.src.split("/").at(-1)}`, "hint"));
      field(card, item.image, "alt", "Image description (alt text)", { max: 240 });
      field(card, item.image, "fit", "Image fitting", { options: ["contain", "cover"] }).addEventListener("input", () => { img.style.objectFit = item.image.fit; });
      const imageActions = element("div", undefined, "actions");
      button(imageActions, "Remove image", () => { item.image = null; changed(); render(); });
      card.append(imageActions);
    }
    const uploadLabel = element("label", item.image ? "Replace image" : "Upload image");
    const upload = element("input"); upload.type = "file"; upload.accept = "image/png,image/jpeg,image/webp";
    upload.addEventListener("change", () => {
      const file = upload.files[0];
      if (!file) return;
      operation(async () => {
        if (!file.size || file.size > 8 * 1024 * 1024) throw new Error("Choose a non-empty image up to 8 MB.");
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = () => reject(new Error("Image could not be read."));
          reader.readAsDataURL(file);
        });
        const image = await api("/api/upload", { method: "POST", body: JSON.stringify({ data }) });
        image.alt = item.image?.alt || item.title;
        image.fit = item.image?.fit || "contain";
        item.image = image;
        changed(); render();
        $("status").textContent = "Image saved locally. Check its alt text, then save the entry to reference it.";
      });
    });
    uploadLabel.append(upload); card.append(uploadLabel); $("entries").append(card);
  });
  updateToolbar();
}
function move(index, direction) {
  const destination = index + direction;
  if (destination < 0 || destination >= content.items.length) return;
  [content.items[index], content.items[destination]] = [content.items[destination], content.items[index]];
  changed(); render();
}
$("add").addEventListener("click", () => {
  if (content.items.length >= 200) { $("error").textContent = "Maximum 200 entries per collection."; return; }
  const item = { id: `${collection === "gallery" ? "print" : "tf"}-${crypto.randomUUID()}`, title: "", category: "", description: "", theme: "blue", published: false, image: null };
  if (collection === "gallery") item.tags = [];
  else { item.price = 0; item.currency = "₹"; item.tag = ""; }
  content.items.push(item); changed(); render();
  $(`entry-${item.id}`).scrollIntoView({ behavior: "smooth", block: "start" });
});
$("save").addEventListener("click", () => {
  const invalid = [...document.querySelectorAll("#entries input:not([type=file]), #entries textarea")].find(input => !input.checkValidity());
  if (invalid) { invalid.reportValidity(); return; }
  operation(async () => {
    // Submit a snapshot; never mark a newer document as saved accidentally.
    const snapshot = JSON.stringify(content);
    const result = await api(`/api/content/${collection}`, { method: "PUT", body: JSON.stringify({ document: JSON.parse(snapshot), revision }) });
    revision = result.revision;
    dirty = snapshot !== JSON.stringify(content);
    $("status").textContent = dirty ? "Saved the submitted version. You still have newer unsaved changes." : "Saved locally. Review, commit and push your changes to publish.";
  });
});
$("reload").addEventListener("click", () => { if (!dirty || confirm("Discard unsaved edits and reload from disk? Uploaded files will be kept.")) load(); });
for (const name of ["gallery", "products"]) $(`${name}-tab`).addEventListener("click", async () => {
  if (name === collection || (dirty && !confirm("Discard unsaved edits before switching collections?"))) return;
  const previous = collection;
  collection = name;
  await load();
  // A failed read must not leave the old document under a different collection.
  if ($("error").textContent) collection = previous;
});
window.addEventListener("beforeunload", event => { if (dirty || busy) { event.preventDefault(); event.returnValue = ""; } });
if (/^[a-f0-9]{64}$/.test(token)) load();
else {
  $("error").textContent = "Open the private launch link printed by npm run content:manage to access the editor.";
  updateToolbar();
}

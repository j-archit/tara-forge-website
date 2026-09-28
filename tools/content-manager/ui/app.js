import { THEMES, validateDocument } from "/schema.js";

// The launch capability is kept in this tab, never in the repository or a URL request.
const suppliedToken = new URLSearchParams(location.hash.slice(1)).get("session");
let token = suppliedToken || "";
try {
  if (suppliedToken && /^[a-f0-9]{64}$/.test(suppliedToken)) sessionStorage.setItem("taraforge-editor-session", suppliedToken);
  token = sessionStorage.getItem("taraforge-editor-session") || token;
} catch { /* Tab storage can be disabled; the launch link still works. */ }
if (location.hash) history.replaceState(null, "", location.pathname);
const $ = id => document.getElementById(id);
const names = { gallery: "Gallery", products: "Catalogue" };
const drafts = {};
let collection = "gallery";
let busy = false;
let previewOrigin = "http://localhost:3000";
let publishReview = null;
const current = () => drafts[collection];
const selected = () => current()?.document.items.find(item => item.id === current().selected);
const galleryPhotos = item => item.presentation?.photos || (item.image ? [{ ...item.image, framed: true, focusX: 50, focusY: 50, zoom: 1, edgeFade: false }] : []);
const primaryImage = item => collection === "gallery" ? galleryPhotos(item)[0] : item.image;
function ensurePresentation(item) {
  if (!item.presentation) {
    item.presentation = { widthSpan: 1, heightSpan: 1, autoplay: false, photos: galleryPhotos(item) };
    item.image = null;
  }
  return item.presentation;
}
function selectedPhotoIndex(item) { return Math.min(current().photoSelection?.get(item.id) || 0, Math.max(0, galleryPhotos(item).length - 1)); }
const dirty = draft => !!draft && (draft.pendingTags.size > 0 || JSON.stringify(draft.document) !== draft.baseline);
const anyDirty = () => Object.values(drafts).some(dirty);

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function button(parent, text, callback, { label, className = "", unavailable = false } = {}) {
  const node = element("button", text, className);
  node.type = "button";
  if (label) node.setAttribute("aria-label", label);
  node.dataset.unavailable = String(unavailable);
  node.addEventListener("click", () => { if (!busy) callback(); });
  parent.append(node);
  return node;
}
function updateToolbar() {
  const draft = current();
  $("dirty-state").textContent = busy ? "Working…" : !draft ? "Workspace not loaded" : dirty(draft) ? "Unsaved changes" : "Saved on disk";
  $("dirty-state").classList.toggle("unsaved", dirty(draft));
  const otherDirty = Object.entries(drafts).filter(([key, value]) => key !== collection && dirty(value)).map(([key]) => names[key]);
  $("save-scope").textContent = otherDirty.length ? `${otherDirty.join(" and ")} also has unsaved changes.` : `Save ${names[collection]} locally, preview, then Publish.`;
  $("save").disabled = busy || !dirty(draft);
  $("save").textContent = busy ? "Working…" : "Save changes";
  $("publish-open").disabled = busy || !draft;
  $("add").disabled = busy || !draft || draft.document.items.length >= 200;
  for (const id of ["reload", "gallery-tab", "products-tab"]) $(id).disabled = busy;
  for (const id of ["search", "visibility"]) $(id).disabled = busy || !draft;
  document.querySelectorAll("#editor button, #editor input, #editor textarea, #editor select, .content-row").forEach(node => {
    node.disabled = busy || node.dataset.unavailable === "true";
  });
  for (const key of Object.keys(names)) {
    $(`${key}-tab`).setAttribute("aria-pressed", String(key === collection));
    $(`${key}-count`).textContent = drafts[key] ? `${drafts[key].document.items.length}${dirty(drafts[key]) ? " •" : ""}` : "—";
  }
  const items = draft?.document.items || [];
  $("total-count").textContent = draft ? items.length : "—";
  $("visible-count").textContent = draft ? items.filter(item => item.published).length : "—";
  $("hidden-count").textContent = draft ? items.filter(item => !item.published).length : "—";
}
async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { "x-content-token": token, ...(options.body ? { "Content-Type": "application/json" } : {}) } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed");
  return result;
}
async function operation(callback) {
  if (busy) return;
  busy = true;
  $("error").textContent = "";
  $("status").textContent = "";
  updateToolbar();
  try { await callback(); }
  catch (error) { $("error").textContent = error.message; }
  finally { busy = false; updateToolbar(); }
}
async function fetchCollection(name) {
  const result = await api(`/api/content/${name}`);
  validateDocument(name, result.document);
  const old = drafts[name];
  drafts[name] = { ...result, baseline: JSON.stringify(result.document), pendingTags: new Map(), selected: result.document.items.some(item => item.id === old?.selected) ? old.selected : result.document.items[0]?.id, query: old?.query || "", filter: old?.filter || "all" };
}
async function switchCollection(name) {
  if (busy) return;
  if (drafts[name]) { collection = name; $("error").textContent = ""; $("status").textContent = ""; render(); return; }
  await operation(async () => { await fetchCollection(name); collection = name; render(); });
}
function updatePreviewLink() {
  $("preview").href = `${previewOrigin}/${collection === "gallery" ? "gallery" : "shop"}/`;
}
function render() {
  $("collection-heading").textContent = names[collection];
  $("collection-description").textContent = collection === "gallery" ? "The projects that tell your story." : "Shape your collection. Make every detail count.";
  $("search").value = current()?.query || "";
  $("visibility").value = current()?.filter || "all";
  updatePreviewLink(); renderList(); renderEditor(); updateToolbar();
}
function matchesItem(item, draft) {
  const query = draft.query.trim().toLocaleLowerCase();
  const matches = `${item.title} ${item.category} ${item.id} ${(item.tags || []).join(" ")}`.toLocaleLowerCase().includes(query);
  return matches && (draft.filter === "all" || (draft.filter === "visible" && item.published) || (draft.filter === "hidden" && !item.published) || (draft.filter === "no-image" && !(collection === "gallery" ? galleryPhotos(item).length : item.image)));
}
function visibleItems() {
  const draft = current();
  return draft ? draft.document.items.filter(item => matchesItem(item, draft)) : [];
}
function renderList() {
  const activeId = document.activeElement?.closest(".content-row")?.dataset.id;
  const list = $("entry-list");
  const scroll = list.scrollTop;
  list.replaceChildren();
  const items = visibleItems();
  $("results-count").textContent = `${items.length} of ${current()?.document.items.length || 0} entries`;
  for (const item of items) {
    const row = button(list, "", () => {
      current().selected = item.id; renderList(); renderEditor(); updateToolbar();
      $("entry-title").focus({ preventScroll: true });
      if (matchMedia("(max-width: 650px)").matches) $("editor").scrollIntoView({ block: "start" });
    }, { className: "content-row", label: `Edit ${item.title || "Untitled entry"}` });
    row.dataset.id = item.id;
    row.setAttribute("aria-pressed", String(item.id === current().selected));
    const cover = primaryImage(item);
    const thumb = element("span", cover ? undefined : "◇", "row-thumb");
    if (cover) { const image = element("img"); image.src = cover.src; image.alt = ""; image.loading = "lazy"; thumb.append(image); }
    thumb.setAttribute("aria-hidden", "true");
    const copy = element("span", undefined, "row-copy");
    copy.append(element("span", item.title || "Untitled entry", "row-title"), element("span", item.category || "No category", "row-meta"), element("span", item.published ? "● Visible" : "○ Hidden", `row-state${item.published ? "" : " hidden-state"}`));
    row.append(thumb, copy);
  }
  if (!items.length) {
    const empty = element("div", undefined, "empty");
    empty.append(element("p", current()?.document.items.length ? "No entries match your filters." : "Your next creation starts here."));
    if (current()?.document.items.length) button(empty, "Clear filters", () => { current().query = ""; current().filter = "all"; render(); $("search").focus(); });
    list.append(empty);
  }
  list.scrollTop = scroll;
  if (activeId) [...list.querySelectorAll(".content-row")].find(row => row.dataset.id === activeId)?.focus({ preventScroll: true });
}
function syncSelectedRow() {
  const item = selected();
  if (!item) return;
  const row = [...document.querySelectorAll(".content-row")].find(node => node.dataset.id === item.id);
  if (Boolean(row) !== matchesItem(item, current())) { renderList(); return; }
  if (!row) return;
  row.setAttribute("aria-label", `Edit ${item.title || "Untitled entry"}`);
  row.querySelector(".row-title").textContent = item.title || "Untitled entry";
  row.querySelector(".row-meta").textContent = item.category || "No category";
  const state = row.querySelector(".row-state");
  state.textContent = item.published ? "● Visible" : "○ Hidden";
  state.classList.toggle("hidden-state", !item.published);
  const thumb = row.querySelector(".row-thumb");
  const image = thumb.querySelector("img");
  const cover = primaryImage(item);
  if (cover && image?.getAttribute("src") !== cover.src) {
    const replacement = element("img"); replacement.src = cover.src; replacement.alt = ""; replacement.loading = "lazy"; thumb.replaceChildren(replacement);
  } else if (!cover && image) thumb.textContent = "◇";
}
function changed({ list = false } = {}) {
  $("status").textContent = "";
  updateToolbar(); if (list) syncSelectedRow(); renderCardPreview();
  if ($("editor-title")) $("editor-title").textContent = selected()?.title || "Untitled entry";
}
function section(parent, title, detail) {
  const node = element("section", undefined, "form-section");
  const heading = element("div", undefined, "section-heading"); heading.append(element("h3", title));
  if (detail) heading.append(element("span", detail));
  node.append(heading); parent.append(node); return node;
}
function field(parent, object, key, label, { type = "text", max = 120, optional = false, options, wide = false } = {}) {
  const wrapper = element("label", undefined, wide ? "wide" : "");
  wrapper.append(element("span", label));
  const input = element(options ? "select" : type === "textarea" ? "textarea" : "input");
  input.setAttribute("aria-label", label);
  if (options) for (const value of options) { const option = element("option", value); option.value = value; input.append(option); }
  else if (type !== "textarea") input.type = type;
  if (!options) input.maxLength = max;
  input.required = !optional;
  if (type === "number") { input.min = "0"; input.max = "10000000"; input.step = "0.01"; }
  input.value = object[key] ?? "";
  if (key === "title") input.id = "entry-title";
  const counter = element("span", `${String(input.value).length}/${max}`);
  input.addEventListener("input", () => {
    object[key] = type === "number" ? (input.value === "" ? NaN : Number(input.value)) : input.value;
    counter.textContent = `${input.value.length}/${max}`;
    input.setCustomValidity(""); changed({ list: key === "title" || key === "category" });
    if (key === "fit") $("photo-preview")?.classList.toggle("cover", input.value === "cover");
    if (key === "alt" && $("photo-preview")) $("photo-preview").alt = input.value;
  });
  wrapper.append(input);
  if (type === "textarea") { const note = element("span", undefined, "field-note"); note.append(element("span", "Plain text"), counter); wrapper.append(note); }
  parent.append(wrapper); return input;
}
function renderEditor() {
  const editor = $("editor"); editor.replaceChildren();
  const item = selected();
  if (!item) {
    const empty = element("div", undefined, "empty");
    empty.append(element("span", "▧"), element("h2", "A fresh canvas."), element("p", "Add an entry or select one from your library."));
    if (current()) button(empty, "+ Add entry", addEntry, { className: "primary" });
    editor.append(empty); return;
  }
  const card = element("div", undefined, "entry");
  const heading = element("div", undefined, "entry-heading");
  const title = element("div"); const h2 = element("h2", item.title || "Untitled entry"); h2.id = "editor-title";
  title.append(h2, element("p", `ENTRY ${current().document.items.indexOf(item) + 1} / ${current().document.items.length}`, "hint"));
  const actions = element("div", undefined, "entry-actions");
  const index = current().document.items.indexOf(item);
  button(actions, "↑", () => move(-1), { label: "Move up", unavailable: index === 0 });
  button(actions, "↓", () => move(1), { label: "Move down", unavailable: index === current().document.items.length - 1 });
  button(actions, "Duplicate", duplicateEntry, { unavailable: current().document.items.length >= 200 });
  button(actions, "Delete", deleteEntry, { label: "Delete entry", className: "danger" });
  heading.append(title, actions); card.append(heading);
  const details = section(card, "Entry details", "Make it easy to discover");
  const fields = element("div", undefined, "fields");
  field(fields, item, "title", "Title", { wide: true });
  field(fields, item, "category", "Category", { max: 80 });
  field(fields, item, "theme", "Placeholder theme", { options: THEMES });
  field(fields, item, "description", "Description", { type: "textarea", max: 1200, wide: true });
  if (collection === "products") {
    field(fields, item, "price", "Indicative price (₹)", { type: "number" });
    field(fields, item, "tag", "Badge (optional)", { max: 40, optional: true });
  }
  details.append(fields);
  const visibility = element("label", undefined, "visibility-toggle");
  const checkbox = element("input"); checkbox.type = "checkbox"; checkbox.checked = item.published; checkbox.setAttribute("aria-label", "Visible on website after publishing");
  checkbox.addEventListener("change", () => { item.published = checkbox.checked; changed({ list: true }); });
  const visibilityText = element("span", "Visible on website after publishing"); visibilityText.append(element("small", "Turn off to keep this entry out of the public collection."));
  visibility.append(checkbox, visibilityText); details.append(visibility);
  if (collection === "gallery") {
    renderTags(section(card, "Tags", "Up to 8 · 40 characters each"), item);
    renderGalleryMedia(section(card, "Gallery layout", "Size and photos for this project"), item);
  } else renderPhoto(section(card, "Photograph", "One photo per entry"), item);
  const preview = section(card, "Content preview", "Text and theme · unsaved edits included");
  const previewCard = element("div", undefined, "card-preview"); previewCard.id = "card-preview"; preview.append(previewCard);
  card.append(element("p", `Reference: ${item.id}`, "hint"));
  editor.append(card); renderCardPreview(); updatePhotoStage();
}
function renderCardPreview() {
  const node = $("card-preview"); const item = selected(); if (!node || !item) return;
  node.className = `card-preview theme-${item.theme}`; node.replaceChildren();
  if (collection === "gallery") {
    const layout = item.presentation || { widthSpan: 1, heightSpan: 1, photos: galleryPhotos(item) };
    const caption = element("span", `${layout.widthSpan}× wide · ${layout.heightSpan}× tall · ${layout.photos.length} photo${layout.photos.length === 1 ? "" : "s"}`, "preview-layout-caption");
    const map = element("div", undefined, "layout-preview"); map.setAttribute("aria-label", `Card occupies ${layout.widthSpan} of 3 columns and ${layout.heightSpan} of 3 rows on desktop`);
    const tile = element("span", item.title || "This project", "layout-preview-tile"); tile.style.width = `${layout.widthSpan / 3 * 100}%`; tile.style.height = `${layout.heightSpan / 3 * 100}%`; map.append(tile);
    node.append(caption, map);
  }
  node.append(element("span", item.category || "CATEGORY", "preview-category"), element("h3", item.title || "Your entry title"), element("p", item.description || "Your description will appear here."));
  node.append(element("div", collection === "gallery" ? item.tags.join(" · ") : `Indicative: ₹${Number.isFinite(item.price) ? item.price.toLocaleString("en-IN") : "—"}${item.tag ? ` · ${item.tag}` : ""}`, "preview-tags"));
}
function renderTags(parent, item) {
  const chips = element("div", undefined, "tag-list"); parent.append(chips);
  const controls = element("div", undefined, "tag-input");
  const input = element("input"); input.id = "new-tag"; input.type = "text"; input.maxLength = 40; input.placeholder = "Add a material or detail…"; input.setAttribute("aria-label", "New tag");
  const error = element("p", "", "error-text"); error.setAttribute("role", "alert");
  input.value = current().pendingTags.get(item.id) || "";
  input.addEventListener("input", () => {
    if (input.value) current().pendingTags.set(item.id, input.value);
    else current().pendingTags.delete(item.id);
    error.textContent = ""; $("error").textContent = ""; $("status").textContent = ""; updateToolbar();
  });
  function refresh() {
    chips.replaceChildren();
    for (const [index, tag] of item.tags.entries()) {
      const chip = element("span", undefined, "tag-chip"); chip.append(element("span", tag));
      button(chip, "×", () => { item.tags.splice(index, 1); refresh(); changed({ list: true }); input.focus(); }, { label: `Remove tag ${tag}` }); chips.append(chip);
    }
  }
  function addTag() {
    const value = input.value.trim();
    error.textContent = "";
    if (!value) { input.focus(); return; }
    if (item.tags.length >= 8 || item.tags.includes(value)) { error.textContent = item.tags.includes(value) ? "That tag is already added." : "Use up to 8 tags."; return; }
    item.tags.push(value); input.value = ""; current().pendingTags.delete(item.id); refresh(); changed({ list: true }); input.focus();
  }
  controls.append(input); button(controls, "Add tag", addTag);
  input.addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); addTag(); } });
  parent.append(controls, error); refresh();
}
function mediaSelect(parent, label, options, value, onChange) {
  const wrapper = element("label"); wrapper.append(element("span", label));
  const input = element("select"); input.setAttribute("aria-label", label);
  for (const [key, text] of options) { const option = element("option", text); option.value = String(key); input.append(option); }
  input.value = String(value);
  input.addEventListener("change", () => { onChange(input.value); changed(); });
  wrapper.append(input); parent.append(wrapper); return input;
}
function mediaToggle(parent, label, checked, onChange) {
  const wrapper = element("label", undefined, "visibility-toggle");
  const input = element("input"); input.type = "checkbox"; input.checked = checked; input.setAttribute("aria-label", label);
  input.addEventListener("change", () => { onChange(input.checked); changed(); });
  wrapper.append(input, element("span", label)); parent.append(wrapper); return input;
}
function mediaRange(parent, label, min, max, step, value, onChange) {
  const wrapper = element("label"); const caption = element("span", `${label}: ${value}${label === "Zoom" ? "×" : "%"}`);
  const input = element("input"); input.type = "range"; input.min = String(min); input.max = String(max); input.step = String(step); input.value = String(value); input.setAttribute("aria-label", label);
  input.addEventListener("input", () => { onChange(Number(input.value)); caption.textContent = `${label}: ${input.value}${label === "Zoom" ? "×" : "%"}`; updatePhotoStage(); changed(); });
  wrapper.append(caption, input); parent.append(wrapper); return input;
}
function updatePhotoStage() {
  const item = selected(); if (!item || collection !== "gallery") return;
  const photo = galleryPhotos(item)[selectedPhotoIndex(item)]; const stage = $("photo-stage"); const image = $("photo-preview");
  if (!photo || !stage || !image) return;
  // Model the media area of the desktop gallery card, including its grid spans.
  const widthSpan = item.presentation?.widthSpan || 1;
  const heightSpan = item.presentation?.heightSpan || 1;
  const cardWidth = ((1120 - 32 - 48) / 3) * widthSpan + 24 * (widthSpan - 1);
  const cardHeight = 360 * heightSpan + 24 * (heightSpan - 1);
  const mediaWidth = cardWidth - 48;
  const mediaHeight = Math.max(180, cardHeight - 48 - 20 - 160);
  stage.parentElement.style.setProperty("--photo-ratio", String(mediaWidth / mediaHeight));
  stage.classList.toggle("unframed", !photo.framed);
  image.classList.toggle("cover", photo.fit === "cover");
  image.style.objectPosition = `${photo.focusX}% ${photo.focusY}%`;
  image.style.transformOrigin = `${photo.focusX}% ${photo.focusY}%`;
  image.style.transform = `scale(${photo.zoom})`;
  image.style.maskImage = photo.edgeFade ? "radial-gradient(ellipse 74% 76% at center, black 58%, transparent 100%)" : "";
}
function renderGalleryMedia(parent, item) {
  if (item.image) ensurePresentation(item);
  const presentation = item.presentation || { widthSpan: 1, heightSpan: 1, autoplay: false, photos: galleryPhotos(item) };
  const layout = element("div", undefined, "fields");
  const spans = [[1, "1×"], [2, "2×"], [3, "3×"]];
  mediaSelect(layout, "Card width", spans, presentation.widthSpan, value => { ensurePresentation(item).widthSpan = Number(value); updatePhotoStage(); renderCardPreview(); });
  mediaSelect(layout, "Card height", spans, presentation.heightSpan, value => { ensurePresentation(item).heightSpan = Number(value); updatePhotoStage(); renderCardPreview(); });
  parent.append(layout, element("p", "Desktop uses three columns. Width reduces to two columns on tablets and one on phones; extra height stacks naturally on smaller screens.", "hint"));
  mediaToggle(parent, "Automatically advance photos", presentation.autoplay, value => { ensurePresentation(item).autoplay = value; });
  const photos = galleryPhotos(item);
  if (photos.length) {
    const list = element("div", undefined, "photo-list"); list.setAttribute("aria-label", "Project photos");
    photos.forEach((photo, index) => {
      const choice = button(list, "", () => { current().photoSelection ??= new Map(); current().photoSelection.set(item.id, index); renderEditor(); }, { label: `Edit photo ${index + 1}`, className: "photo-choice" });
      choice.setAttribute("aria-pressed", String(index === selectedPhotoIndex(item)));
      const thumb = element("img"); thumb.src = photo.src; thumb.alt = ""; choice.append(thumb, element("span", String(index + 1)));
    });
    parent.append(list);
    const index = selectedPhotoIndex(item); const photo = photos[index];
    const frame = element("div", undefined, "photo-card-frame");
    const stage = element("div", undefined, `photo-stage${photo.framed ? "" : " unframed"}`); stage.id = "photo-stage";
    const image = element("img"); image.id = "photo-preview"; image.src = photo.src; image.alt = photo.alt; image.draggable = false; image.className = `thumbnail${photo.fit === "cover" ? " cover" : ""}`;
    stage.append(image); frame.append(stage); parent.append(frame); updatePhotoStage();
    stage.addEventListener("pointerdown", event => {
      if (event.button !== 0) return;
      const start = { x: event.clientX, y: event.clientY, focusX: photo.focusX, focusY: photo.focusY };
      stage.setPointerCapture(event.pointerId); stage.classList.add("dragging-photo");
      const move = pointer => {
        const fitScale = photo.fit === "cover"
          ? Math.max(stage.clientWidth / photo.width, stage.clientHeight / photo.height)
          : Math.min(stage.clientWidth / photo.width, stage.clientHeight / photo.height);
        const remainingX = stage.clientWidth - photo.width * fitScale * photo.zoom;
        const remainingY = stage.clientHeight - photo.height * fitScale * photo.zoom;
        const reposition = (startFocus, delta, remaining) => Math.abs(remaining) < 1
          ? startFocus : Math.max(0, Math.min(100, Math.round(startFocus + delta / remaining * 100)));
        photo.focusX = reposition(start.focusX, pointer.clientX - start.x, remainingX);
        photo.focusY = reposition(start.focusY, pointer.clientY - start.y, remainingY);
        $("focus-x").value = String(photo.focusX); $("focus-y").value = String(photo.focusY);
        $("focus-x").closest("label").firstChild.textContent = `Horizontal position: ${photo.focusX}%`;
        $("focus-y").closest("label").firstChild.textContent = `Vertical position: ${photo.focusY}%`;
        updatePhotoStage(); changed();
      };
      const end = () => { stage.classList.remove("dragging-photo"); stage.removeEventListener("pointermove", move); stage.removeEventListener("pointerup", end); stage.removeEventListener("pointercancel", end); };
      stage.addEventListener("pointermove", move); stage.addEventListener("pointerup", end); stage.addEventListener("pointercancel", end);
    });
    parent.append(element("p", `Photo ${index + 1} of ${photos.length} · ${photo.width} × ${photo.height} WebP · drag to reposition. Preview approximates desktop card proportions; check the website preview for the final crop.`, "hint"));
    const controls = element("div", undefined, "image-controls");
    button(controls, "← Earlier", () => moveGalleryPhoto(item, index, -1), { unavailable: index === 0, className: "quiet small" });
    button(controls, "Later →", () => moveGalleryPhoto(item, index, 1), { unavailable: index === photos.length - 1, className: "quiet small" });
    button(controls, "Remove photo", () => { ensurePresentation(item).photos.splice(index, 1); current().photoSelection?.set(item.id, Math.max(0, index - 1)); renderEditor(); changed({ list: true }); }, { className: "quiet small danger" });
    parent.append(controls);
    const fields = element("div", undefined, "fields");
    field(fields, photo, "alt", "Image description (alt text)", { max: 240, wide: true });
    mediaSelect(fields, "Image fitting", [["contain", "Show full image"], ["cover", "Fill area (crop)" ]], photo.fit, value => { ensurePresentation(item).photos[index].fit = value; updatePhotoStage(); });
    mediaSelect(fields, "Photo frame", [["true", "Framed"], ["false", "Unframed / 3D" ]], photo.framed, value => { ensurePresentation(item).photos[index].framed = value === "true"; updatePhotoStage(); });
    const x = mediaRange(fields, "Horizontal position", 0, 100, 1, photo.focusX, value => { ensurePresentation(item).photos[index].focusX = value; }); x.id = "focus-x";
    const y = mediaRange(fields, "Vertical position", 0, 100, 1, photo.focusY, value => { ensurePresentation(item).photos[index].focusY = value; }); y.id = "focus-y";
    mediaRange(fields, "Zoom", 1, 2, 0.01, photo.zoom, value => { ensurePresentation(item).photos[index].zoom = value; });
    parent.append(fields);
    mediaToggle(parent, "Soften photo edges", photo.edgeFade, value => { ensurePresentation(item).photos[index].edgeFade = value; updatePhotoStage(); });
  } else parent.append(element("p", "No photos yet. Add up to 12 images of this project.", "hint"));
  const zone = element("div", undefined, "dropzone"); const label = element("label");
  const input = element("input"); input.id = "upload-image"; input.type = "file"; input.multiple = true; input.accept = "image/png,image/jpeg,image/webp"; input.setAttribute("aria-label", "Add photos");
  label.append(element("span", "+", "upload-symbol"), element("span", "Add project photos"), element("span", "PNG, JPEG or WebP · up to 8 MB each · 12 photos max", "hint"), input); zone.append(label);
  input.addEventListener("change", () => { const files = [...input.files]; input.value = ""; if (files.length) uploadGalleryPhotos(files, item); });
  for (const type of ["dragenter", "dragover"]) zone.addEventListener(type, event => { event.preventDefault(); if (!busy) zone.classList.add("dragging"); });
  for (const type of ["dragleave", "drop"]) zone.addEventListener(type, event => { event.preventDefault(); zone.classList.remove("dragging"); });
  zone.addEventListener("drop", event => { if (!busy && event.dataTransfer.files.length) uploadGalleryPhotos([...event.dataTransfer.files], item); });
  parent.append(zone, element("p", "Uploads save image files immediately; removing a photo leaves its asset on disk. Save changes to update this project.", "hint"));
}
function moveGalleryPhoto(item, index, direction) {
  const photos = ensurePresentation(item).photos; const destination = index + direction;
  if (destination < 0 || destination >= photos.length) return;
  [photos[index], photos[destination]] = [photos[destination], photos[index]];
  current().photoSelection ??= new Map(); current().photoSelection.set(item.id, destination); renderEditor(); changed({ list: true });
}
async function uploadGalleryPhotos(files, item) {
  await operation(async () => {
    if (galleryPhotos(item).length + files.length > 12) throw new Error("Use up to 12 photos per project.");
    if (files.some(file => !file.size || file.size > 8 * 1024 * 1024)) throw new Error("Choose non-empty photos up to 8 MB each.");
    let added = 0;
    try {
      for (const file of files) {
        const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(",")[1]); reader.onerror = () => reject(new Error("Image could not be read.")); reader.readAsDataURL(file); });
        const image = await api("/api/upload", { method: "POST", body: JSON.stringify({ data }) });
        ensurePresentation(item).photos.push({ ...image, alt: item.title || "Project photo", fit: "contain", framed: true, focusX: 50, focusY: 50, zoom: 1, edgeFade: false });
        added++;
      }
    } finally {
      if (added) { current().photoSelection ??= new Map(); current().photoSelection.set(item.id, galleryPhotos(item).length - 1); renderEditor(); changed({ list: true }); }
    }
    $("status").textContent = `${added} photo${added === 1 ? "" : "s"} imported. Adjust each photo, then save changes.`;
  });
}
function renderPhoto(parent, item) {
  if (item.image) {
    const frame = element("div", undefined, "image-preview"); const image = element("img"); image.id = "photo-preview"; image.src = item.image.src; image.alt = item.image.alt; image.className = `thumbnail${item.image.fit === "cover" ? " cover" : ""}`; frame.append(image); parent.append(frame);
    const actions = element("div", undefined, "image-controls"); actions.append(element("span", `${item.image.width} × ${item.image.height} · WebP`, "hint"));
    button(actions, "Remove image", () => { item.image = null; renderEditor(); changed({ list: true }); $("upload-image").focus(); }, { className: "quiet small" }); parent.append(actions);
    const fields = element("div", undefined, "fields");
    field(fields, item.image, "alt", "Image description (alt text)", { max: 240 });
    field(fields, item.image, "fit", "Image fitting", { options: ["contain", "cover"] }); parent.append(fields);
  }
  const zone = element("div", undefined, "dropzone"); const label = element("label");
  const input = element("input"); input.id = "upload-image"; input.type = "file"; input.accept = "image/png,image/jpeg,image/webp"; input.setAttribute("aria-label", item.image ? "Replace image" : "Upload image");
  label.append(element("span", "↑", "upload-symbol"), element("span", item.image ? "Drop a replacement photo here" : "Drop your photo here"), element("span", "PNG, JPEG or WebP · up to 8 MB", "hint"), input); zone.append(label);
  input.addEventListener("change", () => { const file = input.files[0]; input.value = ""; if (file) uploadPhoto(file, item); });
  for (const type of ["dragenter", "dragover"]) zone.addEventListener(type, event => { event.preventDefault(); if (!busy) zone.classList.add("dragging"); });
  for (const type of ["dragleave", "drop"]) zone.addEventListener(type, event => { event.preventDefault(); zone.classList.remove("dragging"); });
  zone.addEventListener("drop", event => {
    if (busy) return;
    if (event.dataTransfer.files.length !== 1) { $("error").textContent = "Choose one photograph at a time."; return; }
    uploadPhoto(event.dataTransfer.files[0], item);
  });
  parent.append(zone, element("p", "Photos are saved immediately, resized to 1600 px and converted to WebP. Removing a photo keeps its file. Up to 25 megapixels.", "hint"));
}
async function uploadPhoto(file, item) {
  await operation(async () => {
    if (!file.size || file.size > 8 * 1024 * 1024) throw new Error("Choose a non-empty image up to 8 MB.");
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(",")[1]); reader.onerror = () => reject(new Error("Image could not be read.")); reader.readAsDataURL(file);
    });
    const image = await api("/api/upload", { method: "POST", body: JSON.stringify({ data }) });
    item.image = { ...image, alt: item.image?.alt || item.title, fit: item.image?.fit || "contain" };
    renderEditor(); changed({ list: true }); $("status").textContent = "Image saved locally. Check its description, then save your changes.";
  });
}
function resetFilters() { current().query = ""; current().filter = "all"; }
function newId() { return `${collection === "gallery" ? "print" : "tf"}-${crypto.randomUUID()}`; }
function addEntry() {
  if (busy || !current() || current().document.items.length >= 200) return;
  const item = { id: newId(), title: "", category: "", description: "", theme: "blue", published: false, image: null, ...(collection === "gallery" ? { tags: [], presentation: { widthSpan: 1, heightSpan: 1, autoplay: false, photos: [] } } : { price: 0, currency: "₹", tag: "" }) };
  current().document.items.push(item); current().selected = item.id; resetFilters(); render(); $("entry-title").focus();
}
function duplicateEntry() {
  if (current().document.items.length >= 200) return;
  const item = structuredClone(selected()); item.id = newId(); item.title = `${item.title.slice(0, 113)} (copy)`; item.published = false;
  current().document.items.splice(current().document.items.indexOf(selected()) + 1, 0, item);
  current().selected = item.id; resetFilters(); render(); $("entry-title").focus();
}
function move(direction) {
  const items = current().document.items; const index = items.indexOf(selected()); const destination = index + direction;
  if (destination < 0 || destination >= items.length) return;
  [items[index], items[destination]] = [items[destination], items[index]];
  render();
  const control = document.querySelector(`[aria-label="Move ${direction < 0 ? "up" : "down"}"]`);
  (control?.disabled ? $("entry-title") : control)?.focus({ preventScroll: true });
}
function deleteEntry() {
  const item = selected(); if (!item || !confirm(`Delete ${item.title || "this untitled entry"}? Save changes to apply. Its image file will be kept.`)) return;
  const items = current().document.items; const index = items.indexOf(item); items.splice(index, 1); current().pendingTags.delete(item.id);
  current().selected = items[Math.min(index, items.length - 1)]?.id; render(); ($("entry-title") || $("add")).focus();
}
function commitPendingTags(draft) {
  for (const [id, raw] of draft.pendingTags) {
    const item = draft.document.items.find(entry => entry.id === id);
    if (!item) continue;
    const value = raw.trim();
    if (!value) return { id, message: "Enter a tag or clear the field before saving." };
    if (item.tags.includes(value)) return { id, message: "That tag is already added." };
    if (item.tags.length >= 8) return { id, message: "Use up to 8 tags." };
  }
  for (const [id, raw] of draft.pendingTags) draft.document.items.find(entry => entry.id === id)?.tags.push(raw.trim());
  draft.pendingTags.clear();
  return null;
}
async function save() {
  if (busy || !dirty(current())) return;
  const hadPendingTags = current().pendingTags.size > 0;
  const pendingError = commitPendingTags(current());
  if (pendingError) {
    current().selected = pendingError.id; resetFilters(); render();
    $("error").textContent = pendingError.message; $("new-tag").focus(); return;
  }
  if (hadPendingTags) { renderList(); renderEditor(); updateToolbar(); }
  if (!dirty(current())) return;
  // Validate the whole collection, including entries outside the current filter.
  try { validateDocument(collection, current().document); }
  catch (error) {
    const index = Number(/^Item (\d+)/.exec(error.message)?.[1]) - 1;
    if (current().document.items[index]) { current().selected = current().document.items[index].id; resetFilters(); render(); }
    $("error").textContent = error.message;
    const invalid = [...document.querySelectorAll("#editor input:not([type=file]), #editor textarea, #editor select")].find(input => !input.checkValidity());
    if (invalid) invalid.reportValidity(); else $("entry-title")?.focus();
    return;
  }
  await operation(async () => {
    const draft = current(); const snapshot = JSON.stringify(draft.document);
    const result = await api(`/api/content/${collection}`, { method: "PUT", body: JSON.stringify({ document: JSON.parse(snapshot), revision: draft.revision }) });
    draft.revision = result.revision; draft.baseline = snapshot;
    $("status").textContent = `Saved locally. ${names[collection]} is ready to preview and publish.`;
  });
}
async function openPublish() {
  if (anyDirty()) { $("error").textContent = "Save changes in both collections before publishing."; return; }
  await operation(async () => {
    publishReview = await api("/api/publish/review");
    $("publish-summary").textContent = publishReview.pending
      ? `A content commit is waiting to be pushed. Branch: ${publishReview.branch}.`
      : `${publishReview.files.length} managed file${publishReview.files.length === 1 ? "" : "s"} ready. Branch: ${publishReview.branch}.`;
    const list = $("publish-files"); list.replaceChildren();
    for (const file of publishReview.files.length ? publishReview.files : publishReview.pending?.files || []) {
      const entry = element("li", `${publishReview.newAssets.includes(file) ? "New photo: " : ""}${file}`);
      list.append(entry);
    }
    if (!list.children.length) list.append(element("li", "No saved content changes."));
    $("publish-diff").textContent = publishReview.diff || "No text changes. New image files are listed above.";
    $("publish-diff").hidden = true;
    $("publish-diff-toggle").textContent = "View text diff";
    $("publish-error").textContent = publishReview.reason || "";
    $("publish-confirm").disabled = !publishReview.canPublish;
    $("publish-confirm").textContent = publishReview.pending ? "Retry push to main" : "Commit and push to main";
    $("publish-preview").href = $("preview").href;
    $("publish-dialog").showModal();
  });
}
async function confirmPublish() {
  if (!publishReview?.canPublish || anyDirty() || busy) return;
  $("publish-error").textContent = "";
  $("publish-confirm").disabled = true;
  $("publish-confirm").textContent = "Publishing…";
  try {
    const result = await api("/api/publish", { method: "POST", body: JSON.stringify({ reviewId: publishReview.reviewId }) });
    if (!result.pushed) {
      $("publish-error").textContent = result.message;
      publishReview = await api("/api/publish/review");
      $("publish-confirm").disabled = !publishReview.canPublish;
      $("publish-confirm").textContent = "Retry push to main";
      return;
    }
    $("publish-dialog").close();
    $("status").textContent = result.message;
    publishReview = null;
  } catch (error) {
    $("publish-error").textContent = error.message;
    publishReview = null;
    $("publish-confirm").textContent = "Open a fresh review to retry";
  }
}
function localOrigin(value) {
  const url = new URL(value);
  if (url.protocol !== "http:" || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("Enter a local HTTP address, for example http://127.0.0.1:8765.");
  return url.origin;
}
try { const value = localStorage.getItem("taraforge-preview-origin"); if (value) previewOrigin = localOrigin(value); } catch { /* Invalid/blocked preferences use the default. */ }
$("settings").addEventListener("click", () => { $("preview-address").value = previewOrigin; $("settings-error").textContent = ""; $("settings-dialog").showModal(); });
$("save-settings").addEventListener("click", () => {
  try { previewOrigin = localOrigin($("preview-address").value.trim()); }
  catch { $("settings-error").textContent = "Enter a local HTTP address, for example http://127.0.0.1:8765."; return; }
  try { localStorage.setItem("taraforge-preview-origin", previewOrigin); } catch { /* Preference still works for this visit. */ }
  updatePreviewLink(); $("settings-dialog").close();
});
$("help").addEventListener("click", () => $("help-dialog").showModal());
document.querySelectorAll("[data-close]").forEach(node => node.addEventListener("click", () => $(node.dataset.close).close()));
$("add").addEventListener("click", addEntry);
$("save").addEventListener("click", save);
$("publish-open").addEventListener("click", openPublish);
$("publish-confirm").addEventListener("click", confirmPublish);
$("publish-diff-toggle").addEventListener("click", () => {
  const diff = $("publish-diff"); diff.hidden = !diff.hidden;
  $("publish-diff-toggle").textContent = diff.hidden ? "View text diff" : "Hide text diff";
});
$("reload").addEventListener("click", () => {
  if (dirty(current()) && !confirm(`Discard unsaved ${names[collection]} edits and reload from disk? Uploaded images will be kept.`)) return;
  operation(async () => { await fetchCollection(collection); render(); $("status").textContent = `${names[collection]} reloaded from disk.`; });
});
for (const name of Object.keys(names)) $(`${name}-tab`).addEventListener("click", () => switchCollection(name));
$("search").addEventListener("input", () => { if (current()) { current().query = $("search").value; renderList(); updateToolbar(); } });
$("visibility").addEventListener("change", () => { if (current()) { current().filter = $("visibility").value; renderList(); updateToolbar(); } });
window.addEventListener("beforeunload", event => { if (anyDirty() || busy) { event.preventDefault(); event.returnValue = ""; } });
document.addEventListener("keydown", event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); if (!document.querySelector("dialog[open]")) save(); } });
if (/^[a-f0-9]{64}$/.test(token)) {
  try { const config = await api("/api/config"); if (config.previewOrigin) previewOrigin = localOrigin(config.previewOrigin); }
  catch { /* The editor still works if preview startup is unavailable. */ }
  await switchCollection("gallery");
}
else { $("error").textContent = "Open the private launch link printed by npm run content:manage to access the editor."; updateToolbar(); }

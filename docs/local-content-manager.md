# Local content manager

## Launch and publish

From the repository root, install the locked dependencies with `npm ci` (Node.js 24), then run:

```powershell
npm run content:manage
```

This starts a localhost-only editor at `http://127.0.0.1:4317` and opens its private launch link in your default browser. Keep that link private: it grants access for this launch. The link's secret is a URL fragment, not sent in HTTP requests, and is removed from the address bar after loading. Keep the terminal open; Ctrl+C stops the editor. If the browser does not open, use the complete printed launch link, not just the localhost address. `npm run content:manage -- --no-open` starts without opening a browser. A second launch on the same port fails rather than binding a different network address.

1. Choose **Gallery** or **Catalogue**.
2. Search the library by title, category, tag or ID, or filter by visibility/missing photos. Select an entry to edit. Add, duplicate, reorder or delete entries using the editor controls. New entries and duplicates start hidden. IDs are stable, automatically generated and not editable in the UI. Add tags individually; commas remain part of a tag. Text still in a **New tag** field remains an unsaved draft when you switch entries or collections and is added when you save. Duplicate or excess tags must be corrected before saving.
3. Click **Save changes** (or Ctrl/Cmd+S) for the selected collection. Save validates the entire collection and writes `content/gallery.json` or `content/products.json`. Invalid entries are selected automatically so you can fix them. It does not commit or publish anything. Unsaved edits in both collections are retained when you switch; each collection must be saved separately. Drafts remain in memory only: save before closing or reloading the tab. Reload from disk asks before discarding the selected collection's edits.
4. For the actual website preview, run `npm run dev` in another terminal. Set its local HTTP address in **Preview settings** if it uses a different port (for example `http://127.0.0.1:8765`). The preference is stored in your browser; only loopback addresses are allowed. Save, open **Website preview**, and refresh it. The in-editor content preview shows unsaved text and theme changes, not an exact rendering of the public page.
5. Run `npm run content:validate`, `npm test`, `npm run lint`, `npm run build`, and `npm run test:browser`.
6. Review `git diff` and `git status`. Stage only the intended `content/` changes and their referenced assets under `public/images/content/`. Review existing unrelated changes before committing. Commit and push **main** to publish; a push to a feature branch does not deploy the website. GitHub Pages publishes only after the existing CI checks succeed.

The editor never runs Git or shell commands from requests. It is not a CRM, order manager, checkout or general page builder. It does not change policies, contact details, the homepage engine image or other website layouts.

## Content and photographs

- Each collection has at most 200 entries. Catalogue entries support one photograph; gallery projects support up to 12 ordered photos. Array order is website order; `published: false` hides the card. Hidden content is **not confidential** and must not contain customer/personal/private information; content may be present in build inputs or client bundles.
- Titles, categories, descriptions, tags and badges are plain text. They are never interpreted as HTML. Catalogue prices are indicative, non-negative INR values with up to two decimal places. Existing inquiry/payment/shipping behaviour is unchanged.
- Drag photos into the gallery upload area or use its multi-file picker; catalogue uploads remain single-image. PNG, JPEG and WebP files up to 8 MB each and 25 megapixels are decoded, auto-oriented, resized to at most 1600 × 1600 pixels, stripped of metadata and re-encoded as WebP. SVG, GIF, animation, unreadable images and unsupported formats are rejected. A content hash supplies the filename; original filenames never supply filesystem paths. Importing the same processed image reuses its asset.
- **Uploads save their image file immediately**, even before the entry is saved. An abandoned upload can therefore leave an untracked asset. Removing a photo or deleting an entry only removes its reference; no asset files are automatically deleted. This protects shared images. Inspect unused files manually before committing or deleting them.
- Every committed file under `public/` is publicly accessible after deployment, even if it is not referenced by a visible card. Do not commit private images or assume a hidden entry protects its photograph.
- Meaningful image alt text is required. `contain` shows the whole photograph; `cover` fills the image area and may crop it. Review both on mobile. The editor initially uses the entry title as alt text; improve it where necessary.
- Gallery card width and height are set independently to 1×, 2× or 3× in the editor. Width is capped at the available columns on smaller screens, and height spans apply on desktop. Each gallery photo has its own fit, framing, horizontal/vertical position, zoom and optional soft edge. Drag the editor preview to reposition, or use the sliders for precision. A soft edge fades pixels at the image boundary; it cannot reconstruct missing portions of a cropped source photo.
- Gallery photos can be reordered. Optional automatic advancement runs every five seconds only while the card is visible and the page is active; it pauses on pointer/focus interaction and for reduced-motion preferences. Visitors can use the previous/next buttons. All settings live in `content/gallery.json` and are published with the normal commit-and-push workflow.
- Content documents and referenced images are validated before every production build. Missing/tampered assets, incorrect dimensions, duplicate IDs, invalid fields or prices stop publishing. Empty collections display a friendly message.

## Safe saves and recovery

- Every loaded document carries a revision of its on-disk bytes. A save rejects a stale revision, leaving your edits in the browser so you can copy them before reloading. The editor does not merge changes from different windows, manual edits or Git operations. Stop editing before switching branches.
- Writes use an exclusive temporary file, flush it, and replace the selected content document by rename. The original is backed up under `.content-manager/backups/` before replacement. Backups are local and Git-ignored; no automatic pruning is performed. They contain public content, not credentials.
- To recover an earlier document, stop the editor, inspect the relevant backup, copy it back to the corresponding `content/*.json`, validate and restart. Backups cover JSON, not images; immutable imported image files are retained separately. Git history remains the recovery mechanism for published versions.
- A tiny external-write race remains possible if another program edits a file at the exact instant it is replaced. Revision checks prevent ordinary stale edits, not arbitrary simultaneous filesystem modification by a trusted local process. Use one editor and avoid manual edits during saves.
- To undo published content, make and push a normal Git revert. Do not rewrite shared history.

## Security boundary

The editor is a trusted-owner **local tool**, not an internet-ready admin service:

- Binds explicitly to `127.0.0.1`; there is no option to bind a public/LAN address. Do not tunnel or reverse-proxy it.
- Exact Host validation rejects DNS-rebinding hosts; foreign/null Origins and cross-site/same-site fetch contexts are rejected. No CORS access is enabled.
- Every API read/write requires a random token generated per launch. The HTML does not reveal it: the launcher supplies it in a private URL fragment. It is held in memory and tab-scoped session storage for reloads, not Git, cookies or persistent local storage. Restarting invalidates old tokens; use the new printed launch link. Do not share launch links, terminal logs containing them, or authenticated browser sessions.
- CSP, frame denial, same-origin resource policy, `nosniff`, no-referrer and no-store headers protect the browser surface. Content is created through text/DOM APIs, not `innerHTML`.
- Only named collections and fixed UI files are routed. No arbitrary file read/write, file deletion, Git, command execution, proxy fetch or publish endpoint exists. Managed path components reject symlinks/junctions. Request sizes/timeouts and image size/pixel/format limits constrain processing; image imports are serialised and overlapping saves are rejected.
- Image paths and dimensions are verified from file bytes, not user-supplied extensions. Original EXIF data (including GPS metadata) is not retained.
- Someone who already controls your local account, terminal logs or browser extensions can obtain the launch capability or modify the repo directly. This tool does not defend against that threat. Do not run it with elevated privileges. Keep Node.js and dependencies patched.
- The editor lives in `tools/`, outside Next.js routes and `public/`. Tests assert that editor routes, tooling and backups are absent from the static export. Only public content and referenced public images are intended to publish.

## Tests

`npm test` covers schema boundaries, hostile/invalid input, image processing and checksums, filesystem restrictions, safe writes, backups, concurrent/stale saves and API security. `npm run test:browser` covers the editor's user workflows, keyboard/mobile access and actual gallery/shop rendering using an isolated temporary repository. Tests do not write to your real content files.

The public rendering test starts a temporary Next.js development server. Its server and temporary directory are cleaned up after the test. The existing public-site tests use the built static export. Fonts are vendored locally. Local tools are never installed or served as a separate hosted backend.

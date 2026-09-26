# Design-language bundle: reconciliation and implementation plan

Status: **implementation approved; Home + Shop preview gate before remaining-page rollout**.

Owner approved on 26 September 2026: no extra Featured Work section; rotating live-text header / static stacked footer; hero CTA glow only; existing portrait silhouette shadows are an explicit exception. Proceed from the written brief because design boards were not supplied. Preserve all copy and behaviour.

Reviewed on 26 September 2026 against `design-lang-update` at `4287dd1`, tagged `v1.0.0`. This baseline includes the rebased local content manager; it is not identical to the currently deployed `main` branch.

## 1. Conclusion

The bundle plus the updated **Brand & Website Update Brief** now provide a concrete website specification: Nozzle T identity, Archivo / IBM Plex Mono / script-specific Noto fonts, colour and spacing tokens, component treatments, and acceptance criteria. The brief's referenced brand, Home desktop/mobile and Shop design boards are still missing from the supplied files. We can plan from the written specification, but cannot claim visual fidelity to boards we have not seen.

Reviewed brief: `workdir/TaraForge3D — Brand & Website Update Brief.md`, dated 26 September 2026, SHA-256 `48c61de3b93915ba64b40dc8fa7532bc4b0f0b3edce8b44118fa05619c173d16`.

The current website mixes an orbital logo, a multilingual cycling wordmark, gold accents, blue/purple nebulae, rainbow headings, and multicoloured product/service cards. Merely replacing the navbar logo would leave these competing visual systems intact.

Recommended scope: implement the brief's **Night + Tara Gold design language**, keeping every existing copy string, section order, route, contact destination, product, price and payment/shipping term unchanged. Preserve the multilingual header and quote overlay. Show Home and Shop on desktop/mobile before the remaining page-specific rollout. The local content manager and static hosting remain unchanged.

This updated report supersedes the original asset-only recommendations. Implementation is now authorised on `design-lang-update`; publication to `main` remains a separate approval.

## 2. Bundle inventory and inspection

Source: `workdir/taraforge3d-brand_1.zip`.

SHA-256: `37416efbdf1655da27e41d78f0c585d0d47cab1eb94684bf00860e452e371ead`.

Extracted only for inspection into `workdir/brand-bundle-review/taraforge3d-brand/`. Nothing in the website should reference that location.

| Format | Files | Purpose |
| --- | ---: | --- |
| SVG | 22 | Marks, spark, browser icons, horizontal/stacked lockups |
| PNG | 67 | Marks/lockups, app icons, social avatars |
| WebP | 60 | Transparent marks/lockups and social avatars |
| AVIF | 58 | Alternative mark/lockup raster exports |
| PDF / EPS | 14 / 14 | Print/vector delivery exports |
| ICO | 1 | Browser favicon fallback |
| TXT / webmanifest | 1 / 1 | Supplier README and application manifest |
| **Total** | **238** | **4,893,722 uncompressed bytes** |

Inspection results:

- All 22 SVGs parsed with external XML resolution disabled. No script elements, foreign objects, event-handler attributes, external image references, or remote CSS URLs were found. This is a bounded static inspection, not a blanket security certification.
- All 185 PNG/WebP/AVIF headers parsed successfully. 176 have alpha channels; the app icons and social avatars intentionally have opaque backgrounds. Representative lockups/icons were visually inspected. Every raster was not fully pixel-decoded.
- All three manifest icon references resolve within the supplied bundle. Apple icon: 180×180; application icons: 192×192, 512×512 and 1024×1024 as named.
- The ten lockup SVGs have outlined glyphs, no text nodes, and repeated internal IDs. They do not require a runtime Archivo font. Follow the supplier's instruction to load them through an image element rather than inlining multiple copies.
- Twelve mark/icon/spark SVGs include content-credential metadata. Preserve the originals; any future optimised web derivative should be deliberate rather than blindly stripping provenance.
- Size suffixes are not always exact dimensions: the horizontal `on-dark-800w.webp` is **798×249**. Use measured intrinsic dimensions, not filename assumptions.
- Print PDFs/EPS and the ICO were inventoried, not exhaustively rendered/validated. No executables or implementation scripts were included or run.

## 3. Requirements reconciled from the updated brief

### Supplied by the bundle

- Tara Gold: `#C9A84C`.
- Night: `#050A1F`.
- Print bronze: `#7E6220`; print ink: `#0A0F24`. These are labelled print colours, not mandatory interactive UI colours.
- Gold/bronze/ink/white marks; horizontal and stacked wordmarks, including on-dark/on-light variants.
- Tight-cropped marks for composition; padded square marks for icons/avatars.
- Archivo wordmark converted to vector outlines. No font files or complete body-typography specification are supplied.
- WebP/AVIF raster alternatives for websites, PNG alternatives for other uses, and SVG masters.
- Browser icon/manifest examples assume deployment under `/brand/`.

### Brief takes precedence over earlier report suggestions

| Area | Implementation requirement |
| --- | --- |
| Copy and structure | Freeze all existing text, punctuation, prices, fields and section order. Capture a per-route baseline before editing. No new Featured Work section or product content without separate approval. |
| Header identity | Tight gold Nozzle T SVG plus **live-text** TARA / FORGE / 3D. Preserve the current word list and 1,200 ms timing; use matching Noto 700, per-word language tags, a fixed-width slot and 200 ms crossfade. Reduced motion shows English; accessible home name is `TaraForge3D home`. No outlined lockup in the header. |
| Fonts | Archivo variable 300–800 / width 62–125%, including italic; IBM Plex Mono 400/500; only Noto families used by the existing words. Use `display=swap`. Default to Archivo body and headings, not the report's former Geist recommendation. |
| Palette | Night, Raised, Line, Gold, Gold Light, Starlight, Mist, Dusk, Sky and Nebula exactly as specified. Centralise styling colours in root tokens. Sky only for active navigation / inline links, apart from its explicit hero-gradient stop. |
| Hero and backgrounds | One gradient-text treatment on “Tangible and tough.”, Gold → Gold Light → Sky → Nebula. Continuous 44 px dot grid; one soft hero nebula glow. Constellation only at hero edges / empty panels. No parchment sections or extra rainbow headings. |
| Layout | 1280 px content maximum; 20 px mobile gutters; responsive desktop spacing, 24 px grid gutters, 112 / 56 px section padding. Pills for controls, 6 px cards/images and the specified 12 px trust-badge exception. |
| Controls | Shared buttons, cards, badges, labels, fields and focus styles. Minimum 44 px tap targets, 48 px inputs, 2 px Gold Light focus ring. Full-screen mobile navigation and native FAQ details/summary require interaction tests, not just CSS changes. |
| Assets / browser identity | Copy the **whole supplied folder** into `public/brand/`, preserving subfolders, README and manifest. Replace active old marks, favicon and social identity; create a correctly sized 1200×630 OG image. No production links to `workdir/`. |
| Photography | Keep real existing photographs, transparent WebPs, sharp portrait and left/bottom fades. No AI work presented as real prints; no new photo content or multi-image content schema under this visual-only scope. |
| Architecture | Static export, GitHub Pages, content-manager data/security and manual intake remain unchanged. No backend, checkout, PWA/offline system or hosting migration. |

The earlier recommendations for a fixed header lockup, dropping multilingual rotation, retaining Geist, removing every gradient and installing only a curated asset subset are withdrawn. The updated brief explicitly resolves those choices.

## 4. Current-site reconciliation

| Area | Current implementation | Required reconciliation |
| --- | --- | --- |
| Brand mark | Procedural orbital SVG in `src/components/Logo.tsx`; another `Logo.jsx`; orbital `public/Logo.svg` and `public/icon.svg` | One authoritative nozzle/spark mark system; audit actual imports before removing obsolete alternatives |
| Navbar/footer | Separate live text wordmarks; navbar cycles 14 language entries | Preserve header rotation/live text; footer presentation needs the brief conflict below resolved. Preserve all navigation, email and WhatsApp destinations |
| Browser identity | `layout.tsx` points icon/shortcut/apple entries to `/Logo.svg`; also `src/app/favicon.ico` | Reconcile file-based favicon and metadata so old icons do not survive alongside new ones; use the real PNG Apple icon |
| Structured/social metadata | Organization logo/image point to `/Logo.svg`; social metadata uses `/og-image.png` | Update Organization references; prepare a matching social card and verify dimensions |
| Global styling | `globals.css` has two overlapping celestial/brand palettes; Night is not the page base; rainbow `.celestial-gradient-text` | Introduce semantic tokens and deliberately migrate hard-coded colours, not a blind global substitution |
| Background | `CelestialBackground.tsx` hard-codes `#020617`, blue/indigo/purple clouds, a nozzle constellation, and repeating stars | Apply the specified dots/hero glow and limited constellation; preserve continuous page-height background, reduced-motion support and overflow protection |
| Services/testimonials | Presentation colours live in `src/data/services.ts` and `src/data/testimonials.ts` | Update presentation separately from customer-facing text/testimonials |
| Gallery/catalogue | Seven theme keys in `src/data/managedContent.ts`, stored in content JSON and editor options | Keep existing keys/schema valid; change mappings or add an approved migration, never silently invalidate saved entries |
| Quote page | `IntakeForm` remains visible underneath `ManualIntake`, but is inert and hidden from assistive technology | Restyle only with explicit overlay preservation; do not flatten the page or activate submission |
| Team page | Transparent WebP portrait with left/bottom fades and silhouette shadows | Preserve sharp face, transparency and frameless portrait; no perspective/blur on the photograph |

### Specification gaps and proposed resolutions

| Gap / conflict | Proposed handling for owner review |
| --- | --- |
| Referenced design canvas missing | Supply the brand / Home desktop-mobile / Shop boards, or approve using the written brief alone. No screenshot-perfect promise until those references exist. |
| “22 scheduled languages, as now” | Current header contains **14 entries**, across 13 scripts including Latin, not 22. The explicit instruction to preserve words/timing wins: keep all 14 unchanged. Do not add languages or alter spellings/capitalisation. |
| “Featured Work” home band | Current Home is Hero → Specialized Services → Our Craft & Ethos → Why TaraForge3D? (including engine image) → FAQ → Stellar Collection → Footer. No separate Featured Work block exists. Preserve this order and apply bands to these existing sections; do not move the engine image out or add a block. |
| Footer stacked lockup versus mark/live text | Logo-system table says header/footer use tight mark; component table says footer uses stacked lockup. Recommend live rotating header and static outlined stacked footer, with existing footer prose/links unchanged. Needs confirmation. |
| Spark replaces ✶ versus frozen ✶ copy | Preserve every literal ✶ in copy, including “Your Idea, in 3D ✶”. Use SVG sparks only for decorative bullets/dots; the later page-level instruction explicitly says text ✶ stays. Preserve testimonial emoji that are part of quoted copy; do not add emoji icons. |
| Hero-only shadow versus all primary buttons | Layout prohibits other shadows, but button table includes a glow. Recommend hero CTA glow only; other primary buttons share its shape/colours without shadow. Never glow/shadow the mark. |
| Existing approved portrait shadows | **Owner-approved exception:** retain current silhouette drop-shadows, sharpness, transparency and edge fades. No image blur or perspective transforms. |
| SEO out of scope versus explicit head/OG changes | Limit metadata edits to approved brand icon, manifest, theme colour, Organization logo/image references and OG image replacement/dimensions. Preserve titles, descriptions, canonical URLs and other SEO content. Brief says `taraforge3d.in`; repository uses `taraforge.in`. Do not migrate domains. |
| “Live” text versus feature-branch baseline | `v1.0.0` includes unpublished content-manager integration. Capture deployed/main copy and branch rendering, reconcile any differences explicitly before styling. Capture expanded FAQs, all catalogue/gallery entries and quote overlay, not just initial viewport text. Branding artwork/rotation need a narrowly documented comparison rule; never use a blanket exemption for other text. |
| Tokens contain small inconsistencies | Add the explicitly specified `#2A3656` input/secondary border as a root token; 56 px as mobile-section token; 12 px badge radius as the stated exception. Use component-specific 14 px hero eyebrow and 12 px smaller labels. Values in vetted SVG artwork/manifest are not component styling and must not be rewritten merely to satisfy a hex scan. |
| Figurine close-up plus full piece | This requires another real photo and potentially new content representation. Do not fabricate images, add entries, or change the content schema. Flag separately if requested for a future content pass. |

**Social-image mismatch:** existing `public/og-image.png` is 640×640 despite metadata declaring 1200×630. The brief now explicitly requires creating the missing 1200×630 Night/dot-grid/stacked-lockup card. Keep the current OG URL where possible rather than changing routing.

**Manifest:** retain the provided manifest as requested, including `display: standalone`. This is launch presentation only; it is not offline support and does not justify adding a service worker.

**Font/performance risk:** 12 non-Latin Noto families plus Archivo/Plex are more involved than a font-name swap. Subset to the exact existing logo characters, verify glyph shaping (particularly Urdu), reserve the slot for fallback and loaded fonts, and test slow/font-failure conditions. Avoid unnecessarily preloading all families. Fixed-width measurements must use final styling and include the specified 4 px allowance; test all words and runtime reduced-motion changes. The byte-size claim in the brief is a target to measure, not a guaranteed result.

`Logo.jsx`, `quote/hidden-intake.tsx`, and the shared `ui/button.tsx` have no importing consumers in the inspected TS/TSX source. Confirm usage before cleanup; do not spend the redesign effort styling an unused alternative and expect the live page to change.

## 5. Accessibility and asset-handling constraints

Calculated contrast for opaque supplied colours:

| Foreground / background | Ratio | Design implication |
| --- | ---: | --- |
| Gold / Night | 8.59:1 | Strong main accent/text pairing |
| Bronze / Night | 3.42:1 | Avoid for ordinary small text |
| Ink / Night | 1.03:1 | Not a usable text pairing |
| White / gold | 2.29:1 | Do not use ordinary white button text on gold; use dark text |

Ordinary text targets at least 4.5:1, and large text 3:1 under [W3C's contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Logo artwork has an exception; surrounding UI does not. These calculations are not a full accessibility audit: opacity, actual surfaces, states and font sizes must also be checked.

- Copy the complete reviewed brand folder into `public/brand/` as the updated brief requests, including public print exports. This deliberately makes those brand files downloadable; it does not require loading them on every page. Never publish the ZIP, review brief, inspection directory or private source photos, or link production files to `workdir/`.
- Use opaque app-icon variants only where an opaque tile is intended. Use transparent marks/lockups for page branding.
- Keep lockups external through an image element, with explicit dimensions and meaningful accessible naming. Avoid distorted aspect ratios and oversized raster downloads.
- Use the `currentColor` spark through a vetted decorative component or CSS mask when colour control is needed. Do not inline the complete lockup SVGs.
- Privileged brand-asset installation is separate from user image uploads. Keep the content manager's PNG/JPEG/WebP-only upload boundary, schema validation and local security protections intact.
- Do not change image processing, secrets, analytics destinations, external contact URLs or backend routes as a side effect of styling.

## 6. Proposed implementation phases

Each implementation phase follows **implement → test → fix → retest → review → small commit**. Push only reviewed changes to `design-lang-update`; do not merge/publish to `main` before final approval.

| Phase | Work and edit surface | Exit/review gate |
| --- | --- | --- |
| 0 — Specification / baseline | Resolve missing boards and decisions below; capture per-route text, routes/contact/metadata and screenshots; establish Node 24 test/build baseline | Owner approves reconciled plan; copy source agreed; no website implementation yet |
| 1 — Assets, fonts and tokens | Full `public/brand/` folder; favicon/manifest and bounded metadata edits; 1200×630 social card; Archivo/Plex/Noto loading; root colour/type/spacing tokens | Static asset paths verified; font glyphs/widths measured; no raw workdir exposure; targeted tests pass |
| 2 — Shared shell / primitives | Live multilingual header, approved footer, full-screen mobile menu; buttons/cards/badges/form styles; native FAQ; continuous background and focus/motion rules | Focus management, Escape/close, scroll locking/restoration, FAQ keyboard/analytics/IDs and one-open behaviour preserved; no inaccessible inert overlay inputs |
| 3 — Home + Shop preview | `app/page.tsx`, `HomeClient.tsx`, existing home sections and Shop; reuse existing content without additions | **Owner reviews desktop/mobile Home and Shop before remaining page-specific rollout**; copy diff empty, engine sharp/transparent; shared-shell effects on other routes disclosed |
| 4 — Remaining public pages | Services, gallery, shop, team, quote overlay/form and shipping/returns; service/theme/testimonial presentation data | Every page matches the approved language; all existing functional/content contracts preserved |
| 5 — Regression/release gate | Brand-asset tests, browser/visual baselines, integration tests, build/export review and documentation | Full checks pass, screenshots reviewed, no unapproved content changes; only then seek merge/publication approval |

Suggested commit prefixes: `feat(design phase 1): ...`, `refactor(design phase 2): ...`, `feat(design phase 3): ...`, and `test(design phase 5): ...`. Keep assets/metadata, shared styling, homepage and remaining-page groups at separate reviewable boundaries.

Expected source edit surface: approximately **20–25 existing frontend/presentation files**, plus the 238 supplied assets, font-loading configuration, shared primitives where useful, and tests. FAQ/menu changes are explicit semantic/interaction work within the brief, not an excuse to alter copy or page structure. No backend rewrite, routing migration, content schema rewrite or hosting change is needed.

Updated planning estimate, not a delivery promise: **28–48 engineering hours** for the full brief, including multilingual font/width work, accessible menu/FAQ changes, exact-copy checks, previews and regression/performance work. This replaces the earlier 24–40 hour estimate for the looser direction; it is not additive. Missing board requirements or repeated revisions may change it. Owner-review waiting time and any separately requested content/schema work are excluded.

## 7. Non-negotiable regression coverage

Preserve and test:

- All seven public routes, internal links, metadata, contact actions and analytics hooks.
- Quote overlay over the underlying visible form; inert inputs; no `/api/relay` submission.
- Quote response within 24 hours; conditional typical 48-hour production timing; UPI-only 50% advance / 50% before dispatch.
- Pan-India shipping at actuals, pre-dispatch images, unboxing video requirement, case-by-case remedies, seller-paid return postage when required, and the existing refund timing/copy.
- Footer FAQs and WhatsApp links, keyboard/mobile navigation, FAQ interactions and reduced-motion behaviour.
- Portrait transparency, sharp/untransformed face and left/bottom fades; transparent engine image.
- Managed gallery/catalogue order, visibility, image fitting, empty collections and long text/tags without clipping. Keep stable IDs and indicative-price inquiries.
- Editor security and exclusion from the public export; no confidential/raw assets or `workdir` URLs in published output.

Add checks for selected brand asset existence/parseability, intrinsic dimensions, favicon/manifest paths, SVG reference safety, correct social-image dimensions, focus/contrast states, and no remaining active orbital logo references. Capture reviewed visual baselines at **360**, 390, 768 and 1440 px after disabling nonessential animations for deterministic comparisons.

New brief-specific gates: zero unexplained per-route copy differences (including punctuation, expanded FAQs and prices); no section additions/reordering; only one gradient-text instance; root-token styling scan with explicit static-artwork exclusions; every rotating word's glyph rendering, fixed slot and reduced-motion behaviour; native FAQ keyboard/one-open behaviour; full-screen menu focus restoration and no hidden focusable controls. Run Lighthouse against the production static export with mobile Performance ≥85 / Accessibility ≥95; investigate failures rather than merely suppressing checks. Audit rendered contrast at actual opacity/surfaces, 44 px targets and image intrinsic/layout dimensions. Shared palette changes must not invalidate managed-content theme enums.

Existing suites contain 44 unit/API/security tests and 30 browser tests in this combined branch. This review did **not** rerun them: no application code changed. Before implementation, resolve the previous local lint/build stalls and establish a reproducible Node 24 verification baseline; do not count an interrupted run as passing. A clean dependency environment or isolated checkout is an option after diagnosing the local issue, not permission to delete unrelated working files.

Overall release risk: **medium for the full visual migration**, chiefly because shared styles affect all routes and the quote/background/portrait have deliberate constraints. Low operational risk while work stays on the feature branch; production is unaffected until an approved merge to `main`.

## 8. Decisions requested before implementation

The brief already decides the new mark, multilingual header, fonts, palette and gradient. Do not ask the owner to re-decide those.

1. Provide the referenced design boards, or approve proceeding from the written brief alone. Confirm preserving the current home sections with **no added Featured Work block**.
2. Confirm the recommended footer interpretation: **static stacked lockup**, with rotating live text only in the header and existing footer prose/links unchanged.
3. Confirm hero-only button glow and retaining portrait drop-shadows as an exception, while keeping the approved sharp, transparent, frameless portrait and edge fades.

These choices are now approved. The missing visual boards are not a blocker to the written-brief preview; no extra section will be added.

Before code changes, also agree the text baseline reconciliation between deployed/main and `v1.0.0`; any existing differences must be reported, not silently corrected or allowed to bypass the freeze. All other small inconsistencies have proposed resolutions in section 4.

Recommended scope boundary: public website first; optional editor visual alignment later. Keep all routes, customer copy, quote-overlay behaviour, static hosting and content-manager data/security unchanged unless separately agreed.

## 9. What changed during this review

This report was updated to reconcile the newly supplied brief and supersede its earlier recommendations. The previously extracted bundle remains in the untracked inspection directory. No website code, content, live assets, branch history or deployment was changed. No application tests were rerun for this documentation-only update. No commit, push or publication was performed.

## 10. Implementation progress (after approval)

- Phase 0: approved scope and seven-route copy fixture committed as `6b2fd24`. Captured pre-design branch output, including hidden FAQ answers and the protected intake form. Header wordmark presentation is the sole explicit branding exception in the text comparison.
- Phase 1: full 238-file brand folder, licensed local fonts, root tokens, favicon/manifest and correctly sized social card committed as `a388b58`. Fonts are now vendored: static builds and visitors do not need Google Fonts API access. Only existing logo characters are included in Noto subsets. Upright Archivo retains its weight/width ranges; italic uses the specified 500 weight / normal width to avoid downloading unused axes.
- Phase 2: shared live header, static stacked footer, accessible full-screen mobile navigation and native one-open FAQ committed as `7282ab3`. Removed obsolete `Logo.jsx`, `public/Logo.svg` and `public/icon.svg`; these remain recoverable from Git history. Replaced the existing favicon rather than leaving both identities active. All seven routes retained their text; menu focus/scroll/reduced-motion and quote/portrait regressions were tested.
- Phase 3: Home and Shop are the first page-specific visual previews. No new Featured Work block, section movement, product changes, prices or schema changes. Shared shell/font effects are already visible on other routes, but their page-specific redesign is intentionally pending owner review.

The supplied design boards remain unavailable. These previews follow the written specification and the owner's agreed exceptions. `main`, GitHub Pages hosting, backend behaviour and editor UI/security remain unchanged. Final all-page rollout and publication require the next review gate.

Verification notes, 27 September:

- 49 unit/API/security/design tests passed; lint and TypeScript checks passed. The original default Node 24 production build (Turbopack) and Webpack export both passed after restricting Tailwind's scan to application sources. No compiler-mode change remains in the build script. An old generated Webpack cache was archived under untracked `output/` during diagnosis, not deleted.
- All 47 browser tests passed with migration copy checks enabled, including editor security/interaction, managed-content rendering, quote overlay, portrait and responsive Home/Shop checks. Exact text comparison passed on all seven routes. Copy checks wait for hydration/reduced-motion effects rather than sampling a transient testimonial control. Copy-freeze browser checks are opt-in through `npm run design:test:browser`; normal publishing does not freeze future content-manager changes against this migration fixture.
- Mobile Lighthouse 13.5 against the final **gzip-served local production export**, analytics blocked and no concurrent build: Home **Performance 98 / Accessibility 100**, Shop **96 / 98**. These are local measurements, not a guarantee of identical deployed-network scores. Reports are under untracked `output/playwright/`.
- Preview server checks passed for normal reads, rejected write methods, hostile Host headers, traversal and secret-file requests. It binds only to localhost and serves only the resolved `out/` directory.
- Full-page captures deliberately load lazy images before capture and reset scroll/focus so the sticky header is not misplaced and the engine/footer artwork is not falsely shown as blank.

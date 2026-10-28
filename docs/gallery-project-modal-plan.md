# Gallery project modal

Status: implementation reviewed and approved on 28 October 2026. The owner requested final tests, commit and push.

## Interaction plan

- Mobile: tap an image, project title or non-control card area to open the project.
- Desktop: hover/focus reveals a View project cue. Click or keyboard activation opens the modal. Hover alone does not take focus or interrupt browsing.
- The modal starts on the card's selected photo, pauses background card autoplay and displays the full image with `contain`, independent of the card's crop, zoom and edge fade.
- Show the existing title, category, description and tags, plus a link to discuss a similar project through the existing quote page. Do not invent price, dimensions, material or production details.
- Support previous/next controls, thumbnails, arrow keys and horizontal touch swipes. Vertical gestures retain scrolling. No automatic slideshow inside the modal.
- Use the browser's native modal dialog/top layer, with accessible labelling, keyboard focus containment, Escape dismissal, visible close control and backdrop dismissal. Restore background scroll and the opening control's focus on close.
- Desktop: image and details side by side. Mobile: image above details in an internally scrollable panel with the close control always available. Respect reduced motion and small/landscape viewports.
- Existing card slideshow controls remain independent: changing a card photo does not open the modal.
- Items without photos still show their details and quote action; one-photo items do not show unnecessary navigation controls.

## Edit surface

| File | Change |
| --- | --- |
| `src/app/gallery/GalleryClient.tsx` | Selected project/photo state, modal integration and background-autoplay pause |
| `src/app/gallery/GalleryCard.tsx` | Accessible opening controls, hover/touch cue and selected-photo handoff |
| `src/app/gallery/GalleryProjectModal.tsx` | New responsive dialog, image navigation, details, focus and scroll lifecycle |
| `src/data/gallery.ts` | Shared gallery item type |
| `src/lib/galleryPhotos.ts` | Reuse current and legacy photo normalization in cards and modal |
| `tests/browser/gallery-modal.spec.ts` | Interaction, keyboard, focus, dismissal, scrolling, swipe and responsive regression tests |
| `tests/frontend.test.mjs` | Legacy/empty/single-photo normalization checks |
| `tests/seo-content-preservation.test.mjs` | Refresh only the two gallery interaction fingerprints for this intentional feature; preserve the other UI baselines |

No managed gallery JSON, image files, backend, public URLs, metadata, dependencies or content-manager schema changes are required. Gallery SEO continues to use the existing server-rendered content and image schema.

## Verification

Build, lint, existing frontend tests and gallery/SEO browser regressions. Dedicated checks cover opening from card and title, initial selected photo, previous/next and wraparound, thumbnails, keyboard focus, Escape/button/backdrop dismissal, drag-outside safety, scroll restoration, touch swipes, 320–390px mobile and desktop/landscape fit. Capture desktop and mobile screenshots for review. Commit and push after approval.

## Verification record

- Static build and lint passed.
- All 67 frontend/content-manager tests passed.
- All 40 modal/journey/SEO browser checks passed, including modal interactions, quote-link cleanup and real touch input.
- The modal fits 320×568, 390×844 and 844×390 mobile viewports. Native touch swipes change the photo; vertical touch gestures scroll the modal details without changing the photo.
- Existing card slideshow controls, gallery order/spans, SEO metadata, shipping policy and quote overlay regressions passed.

Local preview: `http://127.0.0.1:8771/gallery/`. Tap/click a gallery project.

Screenshots:

- `output/playwright/gallery-modal-desktop.png`
- `output/playwright/gallery-modal-desktop-rear.png`
- `output/playwright/gallery-modal-mobile.png`
- `output/playwright/gallery-modal-mobile-details.png`
- `output/playwright/gallery-modal-mobile-anatomy.png`

The desktop and mobile preview was approved before the final commit-and-push workflow.

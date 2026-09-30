# SEO and AI search improvements

Reviewed baseline: `main` at `310debf`. Primary public host: `https://taraforge3d.in/`.

Scope correction: the owner explicitly requires all page-visible copy to remain unchanged. The original visible-copy edits were restored before any implementation commit. The phases below cover only metadata, structured data, crawl files and sharing assets; there are no new public pages or UI/animation changes.

## Phase 1 — Domain, metadata and business identity

- Make `src/lib/siteMetadata.ts` the source of the public origin and canonical URL normalization.
- Use trailing-slash canonicals throughout layout, page metadata, robots and sitemap; align `public/CNAME`, README and deployment documentation.
- Represent the studio once as a LocalBusiness (an Organization subtype), with the existing public email, WhatsApp number, Bangalore location and India service area. Connect WebSite and services to that identity.
- Serialize JSON-LD safely, including managed text containing HTML-like strings.
- Generate a real 1200×630 Open Graph image from the existing vector mark and palette with `tools/generate-social-card.mjs`.
- Omit sitemap modification dates rather than reporting every build as a content update.
- Keep the coming-soon catalogue available to visitors but set `noindex,follow` and exclude it from the sitemap until real product photographs and availability are confirmed.

## Phase 2 — Service and portfolio discovery without UI changes

- Improve search-result titles and descriptions only. Headings, paragraphs, cards, links and customer-facing copy remain exactly as reviewed.
- Add Service/OfferCatalog JSON-LD from the existing service labels and descriptions, connected to the single business identity.
- Add CollectionPage/CreativeWork/ImageObject JSON-LD from published managed gallery entries only. Encode all existing photos and alt text without adding or changing content.
- Include all published gallery photos in the gallery page's image sitemap entry, so secondary photographs can be discovered without carousel interactions.

## Deferred content/UI recommendations

- New service/project pages, material comparisons, rewritten promotional claims, richer case studies and altered animation defaults are not part of this implementation.
- Measurements, material details and settings require confirmed owner input. No details are invented or hidden in structured data.
- The existing no-JavaScript animation limitation remains documented; preserving the approved UI takes precedence in this scope.

## Phase 4 — Verification and commits

- Test public origin/canonical normalization, safe JSON-LD serialization and gallery draft filtering.
- Validate the production export's canonical/social/schema URLs, sharing-image dimensions, sitemap membership and noindex catalogue.
- Browser-check all existing routes, sitemap image resources and the existing customer journey/content-manager tests.
- Keep the original presentation regression tests unmodified and add fingerprints covering untouched content/UI files. Review the diff and commit at phase boundaries. This request authorizes local commits, not a push or deployment.

## Edit surface and risk

| Area | Files | Risk |
| --- | --- | --- |
| Discovery | `src/lib/siteMetadata.ts`, `src/lib/structuredData.ts`, `src/app/layout.tsx`, `src/app/{robots,sitemap}.ts`, `public/CNAME` | Medium: affects canonical selection and future deployment domain |
| Sharing | `tools/generate-social-card.mjs`, `public/og-image.png`, npm script | Low: generated static asset |
| Services | `src/app/services/page.tsx`, shared structured-data helper | Low: metadata and JSON-LD only; client UI and service data unchanged |
| Portfolio | `src/app/gallery/page.tsx`, shared structured-data helper, image sitemap | Medium: must exclude drafts and use existing asset/description data only |
| Verification | frontend/browser tests, content-preservation fingerprints | Low/medium: existing presentation checks remain intact |
| Documentation | README, workflow comment, this plan | Low |

## Work outside the repository

- The domain owner must confirm any alternate-domain redirects and TLS through the registrar/hosting provider. No DNS or hosting settings are changed by these commits.
- After deployment, submit the corrected sitemap and request homepage indexing in Search Console. Search Console/Business Profile access and rankings/Core Web Vitals are outside this implementation.
- Future project measurements, material details and catalogue availability need real owner-provided information. No facts or customer testimonials will be invented.

## Completed verification

- Production build and lint passed.
- All 65 unit tests and 66 browser tests passed, including the existing content-manager, gallery, hero and quote-overlay checks.
- The production sitemap includes every published gallery photo, including secondary/original photographs; drafts are excluded.
- A Git comparison against `310debf` confirmed no changes to page-visible copy, client components, managed content, shared UI components, styles or animations.
- New regression fingerprints protect the additional untouched UI files; managed content remains freely editable through the existing manager.

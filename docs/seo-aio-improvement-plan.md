# SEO and AI search improvements

Reviewed baseline: `main` at `310debf`. Primary public host: `https://taraforge3d.in/`.

## Phase 1 — Domain, metadata and business identity

- Make `src/lib/siteMetadata.ts` the source of the public origin and canonical URL normalization.
- Use trailing-slash canonicals throughout layout, page metadata, robots and sitemap; align `public/CNAME`, README and deployment documentation.
- Represent the studio once as a LocalBusiness (an Organization subtype), with the existing public email, WhatsApp number, Bangalore location and India service area. Connect WebSite and services to that identity.
- Serialize JSON-LD safely, including managed text containing HTML-like strings.
- Generate a real 1200×630 Open Graph image from the existing vector mark and palette with `tools/generate-social-card.mjs`.
- Omit sitemap modification dates rather than reporting every build as a content update.
- Keep the coming-soon catalogue available to visitors but set `noindex,follow` and exclude it from the sitemap until real product photographs and availability are confirmed.

## Phase 2 — Useful service information

- Improve homepage/services titles and factual location/service copy while retaining the approved design and hero.
- Add four static `/services/[slug]/` pages generated from the existing service records, with specific requirements, quote process, relevant portfolio links and Service/BreadcrumbList schema.
- Add a concise PLA/PETG comparison using existing advertised capabilities, without inventing tolerances, temperatures, machine capacity or guarantees.
- Soften unsupported absolute claims (perfection, unbeatable pricing, guaranteed tolerances) into statements about the actual quote/review process.

## Phase 3 — Project and photo discovery; resilient rendering

- Add static `/gallery/[slug]/` pages for published entries only, using the same JSON edited by the local content manager.
- Render every project photo with its existing alt text and a direct image link. Preserve framed/unframed treatment; show whole photographs on detail pages.
- Link gallery cards to project pages and include the pages in the sitemap. Provide page-specific metadata, CreativeWork/ImageObject and breadcrumb schema.
- Keep measurements, materials and settings out of descriptions unless supplied by the owner. Explain how to enrich existing description/tag fields in the content manager; no new schema or editor controls are required.
- Ensure the hero, service text, gallery and quote contact overlay are visible before JavaScript runs. Keep interaction, layout, colours and quote overlay intact.

## Phase 4 — Verification and commits

- Test public origin/canonical normalization, safe JSON-LD serialization and project draft filtering.
- Validate the production export's canonical/social/schema URLs, sharing-image dimensions, sitemap membership and noindex catalogue.
- Browser-check all new detail routes, all linked images, mobile overflow, carousel controls, static no-JavaScript visibility and the existing customer journey/content-manager tests.
- Capture desktop/mobile previews for visual review. Review the diff and commit at phase boundaries. This request authorizes local commits, not a push or deployment.

## Edit surface and risk

| Area | Files | Risk |
| --- | --- | --- |
| Discovery | `src/lib/siteMetadata.ts`, `src/lib/structuredData.ts`, `src/app/layout.tsx`, `src/app/{robots,sitemap}.ts`, `public/CNAME` | Medium: affects canonical selection and future deployment domain |
| Sharing | `tools/generate-social-card.mjs`, `public/og-image.png`, npm script | Low: generated static asset |
| Service content | `src/data/services.ts`, homepage and services components, new service detail route | Low/medium: copy, internal links and static generation |
| Portfolio | `src/data/gallery.ts`, gallery card, new project detail route | Medium: published/draft isolation and managed-content rebuilds |
| Progressive rendering | animation defaults, quote overlay's entrance animation | Medium: must preserve visibility and interactions without JS |
| Verification | frontend/browser tests, branding regression expectations | Medium: retain presentation checks while accepting intentional copy changes |
| Documentation | README, workflow comment, this plan | Low |

## Work outside the repository

- The domain owner must confirm any alternate-domain redirects and TLS through the registrar/hosting provider. No DNS or hosting settings are changed by these commits.
- After deployment, submit the corrected sitemap and request homepage indexing in Search Console. Search Console/Business Profile access and rankings/Core Web Vitals are outside this implementation.
- Future project measurements, material details and catalogue availability need real owner-provided information. No facts or customer testimonials will be invented.

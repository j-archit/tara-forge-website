# TaraForge3D public site status

## Current release

- [x] Static Next.js export on GitHub Pages with a custom domain.
- [x] Public services, gallery, shop preview, team, and quote pages.
- [x] Manual quote intake by email and WhatsApp, with the inactive form visible beneath the original overlay.
- [x] UPI-only 50/50 payment milestones shown on the site.
- [x] Publish shipping, returns, and refunds terms with pan-India shipping at actual cost and a damage-claim path.
- [x] Customer journey, quote response time, conditional production timing, and indicative shop pricing explained.
- [x] Editable business content grouped in typed files under `src/data/`.
- [x] Lint, Node tests, and production build in the deployment workflow.
- [x] Retire the old standalone dashboard; no admin UI is deployed with the public static site.

## Decisions and next work

- [ ] Decide remaining cancellation, revision, non-transit return-postage, and warranty details from `docs/customer-policy-draft.md`.
- [ ] Add genuine project case studies as photographs and customer permission become available. Do not use invented counts or claims.
- [ ] Implement the browser tests described in `docs/browser-testing-plan.md`.
- [ ] Audit catalogue items, indicative prices, and shipping promises against current availability.
- [ ] Decide the API contract and hosting for future functional intake and admin applications.

The public `main` branch remains static. The old dashboard is retired. `feat/full-stack-rewrite` is separate experimental backend and admin work and is not deployed from `main`.

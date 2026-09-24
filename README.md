# TaraForge3D website

The public TaraForge3D site is a Next.js application exported as static files and hosted on GitHub Pages at [taraforge.in](https://taraforge.in). It presents services, a gallery, a preview catalogue, and a manual quote path. The old standalone dashboard has been retired. `main` is the public static site; it does not deploy an admin interface or a functional intake backend.

## Customer journey today

1. A customer emails a design file and project details, or contacts the studio on WhatsApp.
2. TaraForge3D responds within 24 hours to discuss the file, material, quantity, price, and estimated production time.
3. Once the quote and 3D files are final, the customer pays a 50% advance by UPI to confirm the project.
4. Production begins after the final files and advance arrive. Typical projects are completed within 48 hours from that point, subject to print time and project requirements.
5. The finished print is inspected. The remaining 50% is due before shipping; dispatch details are then shared with the customer.

The quote page deliberately shows an inactive form behind a contact overlay. The overlay's email and WhatsApp actions are the active intake paths. The form is inert and hidden from assistive technology so it cannot submit on the static site.

The [shipping, returns and refunds page](https://taraforge.in/shipping-returns/) explains pan-India shipping at actual cost, pre-dispatch images, delivery-damage claims, custom-print returns, and refund processing. The shop and quote pages link to it.

## Local development

Use Node.js 24 and npm.

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`. For a production export:

```powershell
npm run lint
npm test
npm run build
npm run test:browser
npx serve out
```

Install a Playwright browser once with `npx playwright install chromium` (Windows test runs use installed Edge by default). Browser tests serve `out/` on port 8766. Open the local URL printed by `serve` for manual review. The build downloads Geist fonts through `next/font/google`, so it needs network access.

## Edit content

| Content | Source |
| --- | --- |
| Contact details, payment terms, quote timing, customer journey, shop notice | `src/data/siteContent.ts` |
| Services and their presentation data | `src/data/services.ts` |
| Preview catalogue and indicative prices | `src/data/products.ts` |
| Home page FAQ | `src/data/faqs.ts` |
| Customer testimonials | `src/data/testimonials.ts` |
| Quote email template | `src/lib/contact.ts` |
| Shipping, returns and refunds policy | `src/app/shipping-returns/page.tsx` |

These files are versioned content, not an admin editor. The product cards are inquiries, not a checkout. Check every product description and indicative price against what can actually be supplied before publishing it.

## Deployment and current boundary

`next.config.ts` sets `output: "export"` and `trailingSlash: true`. Pushing `main` runs `.github/workflows/deploy-pages.yml`: it installs dependencies, lints, runs tests, builds `out/`, and deploys that directory to GitHub Pages. `public/CNAME` defines the custom domain.

`src/app/api/relay/route.ts` is legacy server-side code. GitHub Pages does not run it. Its `PI_RELAY_URL` and `PI_AUTH_TOKEN` variables are relevant only to an actual Next.js server deployment, and they are not required for this static deployment. Do not publish those secrets to browser code. The visible quote form remains disabled until a separate backend and upload flow are ready.

Experimental backend and admin work remains on `feat/full-stack-rewrite`; it is not part of the production site on `main` and should not be treated as a replacement for the retired dashboard yet.

## Future integration

Keep the public site and intake system independently deployable. Before activating the form, agree on an API contract for customer details, project requirements, file uploads, consent, quote status, and errors. The backend should issue a safe upload method for large files, validate submissions, store files in object storage, and expose authenticated admin endpoints. The public site should call that API through a configured HTTPS origin. A later AWS deployment could serve the public site from S3 and CloudFront and run the API and admin app separately with PostgreSQL and object storage.

See [the browser test plan](docs/browser-testing-plan.md) for the next quality phase and [the policy draft](docs/customer-policy-draft.md) for remaining cancellation, revision, and warranty decisions.

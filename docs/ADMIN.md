# Administration edit surface

`/admin` is one responsive Next.js workspace backed exclusively by the private FastAPI service. Next.js route handlers only preserve the same-origin browser boundary; business rules, sessions, validation, persistence, uploads, and audit events live in FastAPI.

## Workspace sections

- **Overview** — open inquiry, published-content, store-availability, and failed-job summaries.
- **Inquiries** — search submissions, inspect production state, queue slicing, and prepare estimate email.
- **Customers** — search contacts and review their consolidated project history.
- **Prior prints** — create, edit, order, publish/hide, and delete public gallery cards. Each card controls title, category, description, tags, image, gradient, and accent.
- **Store** — create, edit, order, publish/hide, and delete listings. Each listing controls its stable SKU/slug, copy, price, currency, badge, image, visual treatment, and whether it is available to buy or inquiry-only.
- **Production** — create a new slicer-profile version and edit the estimate email template.
- **System** — inspect durable jobs and explicitly retry incomplete work.

Gallery and store editors accept either a root-relative/HTTPS image URL or a PNG, JPEG, or WebP upload. Uploaded images are validated, stored under the persistent model vault, served through `/api/content/media`, and included in normal backup archives. Publication changes are reflected by the public gallery and shop without a frontend rebuild.

All admin mutations require the server-side admin session and matching CSRF cookie/header. Content mutations and image uploads create audit events. Public content endpoints return published records only.

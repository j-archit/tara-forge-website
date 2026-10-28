# Website measurement

## Collection boundary

The production tag runs only on HTTPS `taraforge3d.in` or `www.taraforge3d.in`.
Localhost, IP previews, staging domains and browser automation (`navigator.webdriver`)
do not load Google Analytics or send custom events to the production property.

For manual testing on the public site, staff can opt their browser out before
reloading the page:

```js
localStorage.setItem("taraforge.analytics.disabled", "true");
location.reload();
```

To resume collection, remove that key and reload. This is a per-browser choice;
it does not remove historical events. Historical reviews must continue to use
the production hostname filter.

## Page views

Google's initial `config` sends the initial page view. GA4 enhanced measurement
tracks subsequent browser-history changes. The stream's settings were read and
confirmed on 28 October 2026: `streamEnabled` and `pageChangesEnabled` are true.

There are no manual route-change `config` or `page_view` calls. Do not add a
second page-view implementation without first changing and validating the GA4
enhanced-measurement settings. Google queues commands while its network script
loads, and interaction listeners mount after that queue is initialized.

## Contact intent only

The active customer path is email or WhatsApp. The upload form stays inactive.
Confirmed enquiries are not currently recorded; this is an explicit scope choice.

| Event | Trigger | Interpretation |
|---|---|---|
| `contact_email_click` | A public email link is activated | Intent to compose an email, not proof it was sent |
| `contact_whatsapp_click` | A WhatsApp link is activated | Intent to open a conversation, not proof of a message |
| `contact_email_copy` | The quote-page email is successfully copied | Contact intent, not a confirmed enquiry |

Each event includes `contact_method`, `contact_action`, `contact_placement`,
`page_path`, and a measurement version. It does not include the contact URL,
message body, phone number, copied value or customer details. Event names plus
GA4's standard page dimensions support the weekly analysis without new custom
dimensions or Analytics write access.

Do not mark these intent events as `generate_lead`, `qualify_lead`,
`close_convert_lead` or `purchase`. Existing key-event counts do not measure the
manual contact journey. Confirmed-lead and sales attribution is deferred until
there is a reliable record of received enquiries and their outcomes.

## Weekly review

The Codex review runs in the existing analytics chat every Monday at 10:00 AM
Asia/Calcutta. It compares complete 28-day windows ending at least three days
before the run, with a separate data-quality check after the fix.

Check production/local hostname separation, page-view and landing-page coverage,
search acquisition and the three contact-intent events. Do not describe an intent
rate as a lead conversion rate. Distinguish the pre-fix baseline from post-fix
collection because measurement changes affect comparisons.

The local computer and Codex app must be available for local MCP connections.
The current Google OAuth app's External/Testing authorizations expire after seven
days. Persistent authentication is still pending. A dedicated service account
with property access can support unattended reviews without publishing the OAuth
consent app. Keep any downloaded credential JSON outside this website repository.
Report authentication failures instead of silently using old data.

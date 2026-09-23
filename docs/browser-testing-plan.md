# Browser testing plan

The current `npm test` suite checks small data and helper functions. The next phase should test the exported site in a real browser, using the files in `out/` served locally after `npm run build`.

## Priority 1: protect the ordering path

1. Open every published route and assert its main heading appears without a page error.
2. On `/quote/`, assert the project form is present beneath the manual contact overlay, is inert, and cannot receive focus or submit. Assert that email and WhatsApp actions remain reachable.
3. Check that the email action includes the quote fields and attachment reminder. Check the product inquiry action includes that product's title and SKU.
4. At phone, tablet, and desktop widths, check the quote overlay remains in its intended position and no horizontal overflow appears.
5. Check the customer journey, 24-hour response wording, conditional 48-hour production wording, and UPI 50/50 terms appear in the exported pages.

## Priority 2: interaction and accessibility

1. Open and close the mobile navigation with keyboard and pointer input.
2. Open FAQ items with keyboard and confirm their expanded state and answer visibility.
3. Verify testimonial controls and reduced-motion behaviour.
4. Run an automated accessibility scan, then inspect headings, focus order, link names, and contrast manually.

## Priority 3: deployment contract

1. Check that `out/` contains the expected pages, sitemap, robots file, images, and custom domain file.
2. Scan internal links in the exported output for broken destinations.
3. Check the static site never sends a request to `/api/relay` while the manual overlay is active.

Use Playwright with installed Edge or Chromium and run the browser suite after the production build in GitHub Actions. Keep unit tests for logic such as file validation and mailto construction. Prefer visible behaviour and exported output over tests that merely search source files for words.

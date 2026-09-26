import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: /Your best ideas.*Tangible and tough/i },
  { path: "/services/", heading: /Specialized Capabilities/i },
  { path: "/gallery/", heading: /The Gallery/i },
  { path: "/shop/", heading: /The Shop/i },
  { path: "/team/", heading: /The Team.*Behind the Forge/i },
  { path: "/quote/", heading: /Bring your ideas to life/i },
  { path: "/shipping-returns/", heading: /Shipping, returns & refunds/i },
];

for (const route of routes) {
  test(`${route.path} renders its main heading`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.heading);
    expect(pageErrors).toEqual([]);
  });
}

test("footer FAQs link reaches the home FAQ section from another page", async ({ page }) => {
  await page.goto("/shipping-returns/");
  await page.locator("footer").getByRole("link", { name: "FAQs" }).click();
  await expect(page).toHaveURL(/\/#faq$/);
  await expect(page.locator("#faq")).toBeVisible();
});

test("footer offers the studio WhatsApp contact", async ({ page }) => {
  await page.goto("/shipping-returns/");
  const whatsapp = page.locator("footer").getByRole("link", { name: "WhatsApp" });
  await expect(whatsapp).toHaveAttribute("href", "https://wa.me/917042337788");
  await expect(whatsapp).toHaveAttribute("target", "_blank");
  await expect(whatsapp).toHaveAttribute("rel", "noopener noreferrer");
});

test("the quote overlay protects the inactive form", async ({ page }) => {
  const relayRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/relay") relayRequests.push(request.url());
  });
  await page.goto("/quote/");

  const inactive = page.locator('main [inert][aria-hidden="true"]');
  await expect(inactive.locator("form")).toHaveCount(1);
  await expect(inactive.getByRole("button", { name: "Send to the Forge", includeHidden: true })).toHaveCount(1);
  const canFocus = await inactive.locator("#name").evaluate((input: HTMLElement) => {
    input.focus();
    return document.activeElement === input;
  });
  expect(canFocus).toBe(false);

  const overlayCard = page.getByRole("heading", { name: /Request a Quote/i }).locator("xpath=..");
  await expect(overlayCard).toBeVisible();
  const formBox = await inactive.boundingBox();
  const overlayBox = await overlayCard.boundingBox();
  expect(formBox).not.toBeNull();
  expect(overlayBox).not.toBeNull();
  expect(Math.min(formBox!.x + formBox!.width, overlayBox!.x + overlayBox!.width) - Math.max(formBox!.x, overlayBox!.x)).toBeGreaterThan(0);
  expect(Math.min(formBox!.y + formBox!.height, overlayBox!.y + overlayBox!.height) - Math.max(formBox!.y, overlayBox!.y)).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Copy email address" }).click();
  expect(relayRequests).toEqual([]);
});

test("quote contact actions contain the details customers need", async ({ page }) => {
  await page.goto("/quote/");
  const emailHref = await page.getByRole("link", { name: "Send Email" }).getAttribute("href");
  const email = new URL(emailHref!);
  expect(email.protocol).toBe("mailto:");
  expect(email.pathname).toBe("taraforge3d@gmail.com");
  expect(email.searchParams.get("subject")).toContain("Project Quote Request");
  for (const detail of ["Material:", "Quantity:", "Approximate dimensions:", "Intended use:", "Please attach your design file"]) {
    expect(email.searchParams.get("body")).toContain(detail);
  }

  const whatsapp = page.getByRole("link", { name: "WhatsApp Us" });
  await expect(whatsapp).toHaveAttribute("target", "_blank");
  const whatsappUrl = new URL((await whatsapp.getAttribute("href"))!);
  expect(whatsappUrl.hostname).toBe("wa.me");
  expect(whatsappUrl.pathname).toBe("/917042337788");
  expect(whatsappUrl.searchParams.get("text")).toContain("get a quote");
});

test("product inquiry identifies the item and SKU", async ({ page }) => {
  await page.goto("/shop/");
  const document = JSON.parse(readFileSync(resolve("content/products.json"), "utf8"));
  const product = document.items.find((item: { published: boolean }) => item.published);
  if (!product) {
    await expect(page.getByText("New products will be shared here soon.")).toBeVisible();
    return;
  }
  const card = page.locator("article").filter({ has: page.getByRole("heading", { name: product.title, exact: true }) }).first();
  const href = await card.getByRole("link", { name: "Ask About Availability" }).getAttribute("href");
  const inquiry = new URL(href!);
  expect(inquiry.pathname).toBe("taraforge3d@gmail.com");
  expect(inquiry.searchParams.get("subject")).toContain(product.title);
  expect(inquiry.searchParams.get("body")).toContain(`SKU: ${product.id}`);
  await expect(page.getByText(/Prices shown are indicative/)).toBeVisible();
});

test("quote page states the journey, timing, and UPI milestones", async ({ page }) => {
  await page.goto("/quote/");
  await expect(page.getByRole("heading", { name: "What happens next?" })).toBeVisible();
  for (const step of ["Send your project", "Finalise the quote", "Confirm and print", "Final payment and shipping"]) {
    await expect(page.getByRole("heading", { name: step })).toBeVisible();
  }
  await expect(page.getByText("We respond to quote requests within 24 hours.", { exact: true })).toBeVisible();
  await expect(page.getByText(/Typical projects are completed within 48 hours after the quote and 3D files are finalised/i)).toBeVisible();
  await expect(page.getByText(/UPI only.*50%.*confirm the project.*remaining 50%.*before shipping/i)).toBeVisible();
});

test("shipping and returns policy states the agreed terms", async ({ page }) => {
  await page.goto("/shipping-returns/");
  await expect(page.getByText(/ship pan-India.*charged separately at the actual carrier cost/i)).toBeVisible();
  await expect(page.getByText(/images of the finished product and its shipping package before dispatch/i)).toBeVisible();
  await expect(page.getByText(/do not accept change-of-mind returns for a custom print/i)).toBeVisible();
  await expect(page.getByText(/Please include an unboxing video with your claim; we need it to verify shipping damage/i)).toBeVisible();
  await expect(page.getByText(/Start recording before opening the shipping package/i)).toBeVisible();
  await expect(page.getByText(/defective or materially different from the agreed specification for a reason other than shipping damage/i)).toBeVisible();
  await expect(page.getByText(/If we require a return as part of resolving your claim, TaraForge3D covers the postage.*return-to-origin or RTO postage/i)).toBeVisible();
  await expect(page.getByText(/review each claim case by case.*correction, replacement, or refund, depending on the circumstances/i)).toBeVisible();
  await expect(page.getByText(/process the refund within 2–4 business days/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Email taraforge3d@gmail.com/i })).toHaveAttribute("href", /mailto:taraforge3d@gmail.com/);
});

for (const width of [390, 768, 1440]) {
  test(`quote overlay fits without horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/quote/");
    await expect(page.getByRole("heading", { name: /Request a Quote/i })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    const dimensions = await page.evaluate(() => ({
      sky: document.querySelector("body > div.absolute")?.getBoundingClientRect().height ?? 0,
      body: document.body.scrollHeight,
    }));
    expect(dimensions.sky).toBeGreaterThanOrEqual(dimensions.body - 1);
  });
}

test("mobile navigation and FAQ work with keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Toggle navigation" });
  await menu.focus();
  await menu.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#mobile-navigation")).toBeVisible();
  await menu.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "false");

  const question = page.locator("#faq-question-0");
  await question.focus();
  await question.press("Enter");
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#faq-answer-0")).toHaveAttribute("aria-hidden", "false");
});

test("static export contains every linked public route", async ({ page }) => {
  const output = resolve("out");
  for (const file of ["CNAME", "robots.txt", "sitemap.xml", "images/jet-engine.webp", "images/archit-portrait.webp"]) {
    expect(existsSync(resolve(output, file)), `${file} is missing from the export`).toBe(true);
  }
  for (const path of ["content-manager", "tools", "api/content", "api/upload", ".content-manager"]) {
    expect(existsSync(resolve(output, path)), `Local editor leaked into export: ${path}`).toBe(false);
  }

  for (const route of routes) {
    await page.goto(route.path);
    const links = await page.locator('a[href^="/"]').evaluateAll((anchors) =>
      anchors.map((anchor) => (anchor as HTMLAnchorElement).getAttribute("href")!).filter(Boolean)
    );
    for (const href of links) {
      const path = new URL(href, "http://127.0.0.1:8766").pathname;
      const file = path.endsWith("/") ? `${path}index.html` : `${path}/index.html`;
      expect(existsSync(resolve(output, `.${file}`)), `Broken internal link ${href} on ${route.path}`).toBe(true);
    }
  }
});

for (const width of [390, 1440]) {
  test(`WebP engine and founder portrait load at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const image of [
      { route: "/", alt: "3D Printed Jet Engine Model", src: "/images/jet-engine.webp" },
      { route: "/team/", alt: "Archit, founder of TaraForge3D", src: "/images/archit-portrait.webp" },
    ]) {
      await page.goto(image.route);
      const photo = page.getByRole("img", { name: image.alt, exact: true });
      await photo.scrollIntoViewIfNeeded();
      await expect(photo).toBeVisible();
      await expect(photo).toHaveAttribute("src", image.src);
      await expect.poll(() => photo.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
      const response = await page.request.get(image.src);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("image/webp");
      if (image.route === "/team/") {
        const portrait = page.locator(".founder-portrait");
        await expect(portrait).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await expect(portrait).toHaveCSS("border-top-width", "0px");
        await expect(portrait).toHaveCSS("border-radius", "0px");
        await expect(portrait).toHaveCSS("overflow", "visible");
        expect(await portrait.evaluate(element => getComputedStyle(element).filter)).toContain("drop-shadow");
        const mask = await photo.evaluate(element => ({ image: getComputedStyle(element).maskImage, composite: getComputedStyle(element).maskComposite }));
        expect(mask.image).toMatch(/linear-gradient\((?:90deg|to right),/);
        expect(mask.image).toContain("12%");
        expect(mask.image).toContain("85%");
        expect(mask.composite).toContain("intersect");
        await expect(portrait).toHaveCSS("transform", "none");
        await expect(photo).toHaveCSS("filter", "none");
        await portrait.hover();
        await expect(portrait).toHaveCSS("transform", "none");
        await page.emulateMedia({ reducedMotion: "reduce" });
        await expect(portrait).toHaveCSS("transform", "none");
        await expect(portrait).toHaveCSS("transition-duration", "0s");
        await page.emulateMedia({ reducedMotion: "no-preference" });
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    }
  });
}

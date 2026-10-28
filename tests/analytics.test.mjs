import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  ANALYTICS_OPTOUT_KEY,
  contactMethodFromHref,
  isAnalyticsAllowed,
  isProductionAnalyticsHost,
  safeGtag,
  trackContactIntent,
  trackEvent,
} from "../src/lib/analytics.ts";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
afterEach(() => {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else delete globalThis.window;
});

function browser({ hostname = "taraforge3d.in", protocol = "https:", automated = false, optedOut = false } = {}) {
  const commands = [];
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: { hostname, protocol, pathname: "/quote/" },
    navigator: { webdriver: automated },
    localStorage: { getItem: key => key === ANALYTICS_OPTOUT_KEY && optedOut ? "true" : null },
    gtag: (...args) => commands.push(args),
  } });
  return commands;
}

test("production collection uses an exact hostname allowlist", () => {
  for (const host of ["taraforge3d.in", "www.taraforge3d.in"]) assert.equal(isProductionAnalyticsHost(host), true);
  for (const host of ["localhost", "127.0.0.1", "::1", "preview.taraforge3d.in", "taraforge3d.in.example.com", "example.com"]) {
    const commands = browser({ hostname: host });
    assert.equal(isAnalyticsAllowed(), false, host);
    assert.equal(trackEvent("cta_click"), false);
    assert.equal(safeGtag("config", "G-C0HLNVX14Q"), false);
    assert.deepEqual(commands, []);
  }
});

test("automated browsers, insecure previews and staff opt-outs cannot collect", () => {
  for (const options of [{ automated: true }, { protocol: "http:" }, { optedOut: true }]) {
    const commands = browser(options);
    assert.equal(isAnalyticsAllowed(), false);
    assert.equal(trackContactIntent("email", "click", "quote"), false);
    assert.deepEqual(commands, []);
  }
});

test("server rendering, blocked storage and a missing tag are safe", () => {
  delete globalThis.window;
  assert.equal(isAnalyticsAllowed(), false);
  assert.equal(safeGtag("event", "cta_click"), false);
  browser();
  window.localStorage.getItem = () => { throw new Error("Storage unavailable"); };
  assert.equal(isAnalyticsAllowed(), false);
  browser();
  delete window.gtag;
  assert.equal(trackEvent("cta_click"), false);
});

test("contact detection accepts email and HTTPS WhatsApp, but rejects unrelated URLs", () => {
  assert.equal(contactMethodFromHref("mailto:studio@example.com?body=private%20message"), "email");
  assert.equal(contactMethodFromHref("https://wa.me/123?text=private"), "whatsapp");
  assert.equal(contactMethodFromHref("https://api.whatsapp.com/send?phone=123"), "whatsapp");
  for (const href of ["/quote/", "#contact", "https://example.com/wa.me", "https://wa.me.example.com/123", "http://wa.me/123", "javascript:void(0)"]) {
    assert.equal(contactMethodFromHref(href), null, href);
  }
});

test("contact intent is reportable by event name and contains no recipient or message data", () => {
  const commands = browser();
  assert.equal(trackContactIntent("email", "click", "quote"), true);
  assert.equal(trackContactIntent("whatsapp", "click", "footer"), true);
  assert.equal(trackContactIntent("email", "copy", "quote"), true);
  assert.equal(trackContactIntent("whatsapp", "copy", "quote"), false);
  assert.deepEqual(commands.map(command => command[1]), [
    "contact_email_click", "contact_whatsapp_click", "contact_email_copy",
  ]);
  for (const [, event, params] of commands) {
    assert.equal(params.event_category, "contact_intent");
    assert.equal(params.page_path, "/quote/");
    assert.ok(!["generate_lead", "qualify_lead", "purchase"].includes(event));
    assert.ok(!Object.keys(params).some(key => /href|address|message|file|phone/i.test(key)));
  }
  assert.equal(commands[1][2].contact_placement, "footer");
  assert.equal(commands[2][2].contact_action, "copy");
});

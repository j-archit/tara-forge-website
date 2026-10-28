export const GA_MEASUREMENT_ID = "G-C0HLNVX14Q";
export const ANALYTICS_OPTOUT_KEY = "taraforge.analytics.disabled";
export const MEASUREMENT_VERSION = "2026-10-28";

export const isProductionAnalyticsHost = (hostname: string) =>
  hostname === "taraforge3d.in" || hostname === "www.taraforge3d.in";

// Declare the window.gtag type
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Keep the production property free of local previews, browser tests and opted-out staff browsers.
export const isAnalyticsAllowed = () => {
  if (typeof window === "undefined" || !isProductionAnalyticsHost(window.location.hostname)) return false;
  if (window.location.protocol !== "https:" || window.navigator.webdriver) return false;
  try {
    return window.localStorage.getItem(ANALYTICS_OPTOUT_KEY) !== "true";
  } catch {
    return false;
  }
};

// The Google bootstrap queues commands while its network script loads. Never bypass the host guard.
export const safeGtag = (...args: unknown[]) => {
  if (isAnalyticsAllowed() && typeof window.gtag === "function") {
    window.gtag(...args);
    return true;
  }
  return false;
};

// Page views have one owner: Google's initial config + enabled history-change enhanced measurement.
// Do not add manual page_view/config calls on route changes; those would duplicate enhanced measurement.

// 2. Generic custom event wrapper
export const trackEvent = (action: string, category?: string, label?: string, value?: number, extraParams?: Record<string, unknown>) => {
  return safeGtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
    measurement_version: MEASUREMENT_VERSION,
    ...extraParams,
  });
};

export type ContactMethod = "email" | "whatsapp";
export type ContactPlacement = "quote" | "footer" | "page";

export const contactMethodFromHref = (href: string): ContactMethod | null => {
  if (/^mailto:/i.test(href)) return "email";
  try {
    const url = new URL(href, "https://taraforge3d.in");
    if (url.protocol === "https:" && ["wa.me", "api.whatsapp.com"].includes(url.hostname)) return "whatsapp";
  } catch {
    // Ignore malformed or non-contact links.
  }
  return null;
};

// These are intent events, never confirmed leads or purchases. Distinct event names are reportable
// immediately without custom-dimension setup. Do not send mail/WhatsApp URLs or message contents.
export const trackContactIntent = (
  method: ContactMethod,
  action: "click" | "copy",
  placement: ContactPlacement,
) => {
  if (method === "whatsapp" && action === "copy") return false;
  return trackEvent(`contact_${method}_${action}`, "contact_intent", method, undefined, {
    contact_method: method,
    contact_action: action,
    contact_placement: placement,
    page_path: typeof window === "undefined" ? undefined : window.location.pathname,
  });
};

// 3. CTA Clicks
export const trackCTA = (ctaName: string, destination: string) => {
  trackEvent("cta_click", "engagement", ctaName, undefined, { destination });
};

// 4. Navigation Links
export const trackNavigation = (linkLabel: string, fromPath: string) => {
  trackEvent("nav_click", "navigation", linkLabel, undefined, { from_path: fromPath });
};

// 5. Form Funnel
export type FormStep = 'form_start' | 'field_focus' | 'field_filled' | 'form_submit' | 'form_success' | 'form_error';
export const trackFormStep = (step: FormStep, params?: { field?: string; error?: string }) => {
  trackEvent("form_funnel", "conversion", step, undefined, params);
};

// 6. Shop Product Interest
export const trackProductInterest = (productId: string, productName: string, price: number, action: 'view' | 'inquiry_click') => {
  trackEvent("product_interest", "ecommerce", productName, price, { product_id: productId, action });
};

// 7. FAQ Interaction
export const trackFAQInteraction = (question: string, action: 'open' | 'close') => {
  trackEvent("faq_interaction", "engagement", question, undefined, { action });
};

// 8. Section View (Intersection Observer)
export const trackSectionView = (sectionId: string) => {
  trackEvent("section_view", "engagement", sectionId);
};

// 9. Social/External Clicks
export const trackSocialClick = (platform: string) => {
  trackEvent("social_click", "engagement", platform);
};

// 10. File Uploads
export const trackFileUpload = (fileName: string, fileSizeMb: number) => {
  trackEvent("file_upload", "engagement", fileName, fileSizeMb);
};

// 11. Mobile Menu
export const trackMobileMenu = (action: 'open' | 'close') => {
  trackEvent("mobile_menu", "navigation", action);
};

// 12. Scroll Depth
export const trackScrollDepth = (percent: number) => {
  trackEvent("scroll_depth", "engagement", `${percent}%`, percent);
};

// 13. Time on Page
export const trackTimeOnPage = (seconds: number, path: string) => {
  trackEvent("time_on_page", "engagement", path, seconds);
};

// 14. Global Click Heatmap
export const trackClickHeatmap = (tag: string, text: string, id: string, trackData: string, x: number, y: number, path: string) => {
  trackEvent("click_heatmap", "interaction", trackData || tag, undefined, {
    element_tag: tag,
    element_text: text,
    element_id: id,
    data_track: trackData,
    x,
    y,
    page_path: path
  });
};

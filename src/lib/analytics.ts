export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Declare the window.gtag type
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Ensure gtag exists before calling it (prevents errors on server-side or if script blocked)
export const safeGtag = (...args: any[]) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  } else if (process.env.NODE_ENV === "development") {
    console.log("[GA4 Offline Event]", args);
  }
};

// 1. Pageview
export const pageview = (url: string) => {
  if (!GA_MEASUREMENT_ID) return;
  safeGtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// 2. Generic custom event wrapper
export const trackEvent = (action: string, category?: string, label?: string, value?: number, extraParams?: Record<string, any>) => {
  safeGtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
    ...extraParams,
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
export const trackProductInterest = (productId: string, productName: string, price: number, action: 'view' | 'buy_click') => {
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

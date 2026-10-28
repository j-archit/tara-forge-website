"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { 
  GA_MEASUREMENT_ID, 
  isAnalyticsAllowed,
  MEASUREMENT_VERSION,
  contactMethodFromHref,
  trackContactIntent,
  trackClickHeatmap, 
  trackScrollDepth, 
  trackSectionView, 
  trackTimeOnPage 
} from "@/lib/analytics";

const subscribeToBrowserPolicy = () => () => {};
const serverAnalyticsPolicy = () => false;

function AnalyticsInner() {
  const pathname = usePathname();

  // GA4 enhanced measurement owns initial and history-based page views.

  // 2. Global Click Tracker
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const closestLinkOrBtn = target.closest('a, button') as HTMLElement | null;
      const elementToTrack = closestLinkOrBtn || target;

      const link = target.closest('a[href]');
      const method = link ? contactMethodFromHref(link.getAttribute('href') || '') : null;
      if (method) {
        const placement = link!.closest('footer') ? 'footer'
          : window.location.pathname.replace(/\/$/, '') === '/quote' ? 'quote' : 'page';
        trackContactIntent(method, 'click', placement);
      }

      const tag = elementToTrack.tagName.toLowerCase();
      // Only track notable clicks (links, buttons, or elements with explicit data-track attrs)
      const dataTrack = elementToTrack.getAttribute('data-track') || '';
      
      if (tag !== 'a' && tag !== 'button' && !dataTrack) {
        return; // Skip mundane clicks on paragraphs/divs unless explicitly tagged
      }

      const text = elementToTrack.textContent?.trim().substring(0, 50) || '';
      const id = elementToTrack.id || '';
      const x = Math.round((e.pageX / window.innerWidth) * 100); // % width
      const y = Math.round((e.pageY / document.documentElement.scrollHeight) * 100); // % document height

      trackClickHeatmap(tag, text, id, dataTrack, x, y, window.location.pathname);
    };

    document.addEventListener('click', handleGlobalClick, { passive: true });
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // 3. Scroll Depth Tracking
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const reached = new Set<number>();

    const handleScroll = () => {
      if (reached.size === milestones.length) return;
      
      const scrollTop = window.scrollY;
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      
      // Calculate scroll percentage
      const percent = Math.round((scrollTop + winHeight) / docHeight * 100);
      
      milestones.forEach(m => {
        if (!reached.has(m) && percent >= m) {
          reached.add(m);
          trackScrollDepth(m);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]); // Reset milestones map when route changes

  // 4. Section Visibility Tracking
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5 // Trigger when 50% in view
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          trackSectionView(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all main sections with an ID after a short delay
    const timer = window.setTimeout(() => {
      document.querySelectorAll('section[id], footer[id]').forEach(section => {
        sectionObserver.observe(section);
      });
    }, 500);

    return () => {
      window.clearTimeout(timer);
      sectionObserver.disconnect();
    };
  }, [pathname]); // Re-observe when route changes

  // 5. Time on Page Heartbeat
  useEffect(() => {
    let seconds = 0;
    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      seconds += 15; // Track every 15s
      trackTimeOnPage(seconds, window.location.pathname);
    }, 15000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}

export function Analytics() {
  const enabled = useSyncExternalStore(subscribeToBrowserPolicy, isAnalyticsAllowed, serverAnalyticsPolicy);
  const [ready, setReady] = useState(false);

  if (!enabled || !GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              send_page_view: true,
              measurement_version: '${MEASUREMENT_VERSION}',
            });
          `,
        }}
      />
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Suspense fallback={null}>
        {ready && <AnalyticsInner />}
      </Suspense>
    </>
  );
}

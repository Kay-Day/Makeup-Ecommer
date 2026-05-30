const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

export function initAnalytics() {
  if (!GA_MEASUREMENT_ID || initialized || typeof window === 'undefined') return;

  initialized = true;
  window.dataLayer = window.dataLayer || [];

  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
  }
}

export function trackPageView(path: string, title = document.title) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

  initAnalytics();
  window.gtag?.('event', 'page_view', {
    page_title: title,
    page_location: window.location.href,
    page_path: path,
  });
}

import { getAnalyticsConsent } from "@/lib/analytics-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    __pointintAnalyticsInitialized?: boolean;
  }
}

export type AnalyticsEventName =
  | "page_view"
  | "studio_entry"
  | "workflow_selected"
  | "explore_opened"
  | "sample_bundle_downloaded"
  | "download_completed"
  | "install_guide_opened";

function hasAcceptedConsent() {
  return getAnalyticsConsent() === "accepted";
}

function getGaId() {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";
}

function getClarityId() {
  return process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() || "";
}

function appendScriptOnce(provider: "ga4" | "clarity", src: string) {
  if (typeof document === "undefined") return null;

  const existing = document.querySelector<HTMLScriptElement>(
    `script[data-analytics-provider="${provider}"]`
  );
  if (existing) return existing;

  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  script.dataset.analyticsProvider = provider;
  document.head.appendChild(script);
  return script;
}

function initGa4(gaId: string) {
  appendScriptOnce("ga4", `https://www.googletagmanager.com/gtag/js?id=${gaId}`);

  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId);
  }
}

function initClarity(clarityId: string) {
  appendScriptOnce("clarity", `https://www.clarity.ms/tag/${clarityId}`);

  if (!window.clarity) {
    window.clarity = function clarity(..._args: unknown[]) {
      return undefined;
    };
  }
}

export function initAnalytics() {
  if (typeof window === "undefined") return;
  if (!hasAcceptedConsent()) return;

  const gaId = getGaId();
  const clarityId = getClarityId();

  if (!gaId && !clarityId) return;

  if (gaId) {
    initGa4(gaId);
  }

  if (clarityId) {
    initClarity(clarityId);
  }

  window.__pointintAnalyticsInitialized = true;
}

export function trackPageView(path: string) {
  initAnalytics();
  if (typeof window === "undefined") return;
  if (!hasAcceptedConsent()) return;
  if (!window.gtag || !getGaId()) return;

  window.gtag("event", "page_view", {
    page_path: path,
  });
}

export function trackEvent(
  name: AnalyticsEventName,
  params?: Record<string, string | number | boolean>
) {
  initAnalytics();
  if (typeof window === "undefined") return;
  if (!hasAcceptedConsent()) return;
  if (!window.gtag || !getGaId()) return;

  window.gtag("event", name, params ?? {});
}

import { beforeEach, describe, expect, it, vi } from "vitest";

import { setAnalyticsConsent } from "@/lib/analytics-consent";
import { initAnalytics, trackEvent, trackPageView } from "@/lib/analytics";

function clearAnalyticsCookie() {
  document.cookie =
    "analytics-consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

describe("analytics helper", () => {
  beforeEach(() => {
    clearAnalyticsCookie();
    document.head.innerHTML = "";
    delete (window as Window & { dataLayer?: unknown[] }).dataLayer;
    delete (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    delete (window as Window & { clarity?: (...args: unknown[]) => void })
      .clarity;
    delete (
      window as Window & { __pointintAnalyticsInitialized?: boolean }
    ).__pointintAnalyticsInitialized;
    vi.unstubAllEnvs();
  });

  it("does nothing when consent is not accepted", () => {
    const gtag = vi.fn();
    (window as Window & { gtag: typeof gtag }).gtag = gtag;

    trackEvent("studio_entry");

    expect(gtag).not.toHaveBeenCalled();
    expect(
      document.querySelector('script[data-analytics-provider="ga4"]')
    ).toBeNull();
  });

  it("does not load providers when env vars are missing", () => {
    setAnalyticsConsent("accepted");

    initAnalytics();
    trackPageView("/studio");

    expect(
      document.querySelector('script[data-analytics-provider="ga4"]')
    ).toBeNull();
    expect(
      document.querySelector('script[data-analytics-provider="clarity"]')
    ).toBeNull();
  });

  it("loads GA4 and forwards custom events after consent", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST123");
    setAnalyticsConsent("accepted");

    initAnalytics();

    const gtag = vi.fn();
    (window as Window & { gtag: typeof gtag }).gtag = gtag;

    trackEvent("sample_bundle_downloaded", { sample_id: "aurora" });

    expect(
      document.querySelector('script[data-analytics-provider="ga4"]')
    ).not.toBeNull();
    expect(gtag).toHaveBeenCalledWith("event", "sample_bundle_downloaded", {
      sample_id: "aurora",
    });
  });

  it("loads Clarity after consent when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_CLARITY_PROJECT_ID", "clarity-test");
    setAnalyticsConsent("accepted");

    initAnalytics();

    expect(
      document.querySelector('script[data-analytics-provider="clarity"]')
    ).not.toBeNull();
  });
});

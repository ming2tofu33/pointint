import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ANALYTICS_CONSENT_COOKIE,
  getAnalyticsConsent,
} from "@/lib/analytics-consent";
import ConsentBanner from "@/components/ConsentBanner";

const { initAnalyticsMock, trackPageViewMock } = vi.hoisted(() => ({
  initAnalyticsMock: vi.fn(),
  trackPageViewMock: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  initAnalytics: initAnalyticsMock,
  trackPageView: trackPageViewMock,
}));

const messages = {
  consent: {
    title: "Analytics preferences",
    body: "We use analytics to understand how Pointint is used.",
    details: "Learn more",
    essentialOnly: "Only essential",
    acceptAll: "Accept all",
  },
};

describe("ConsentBanner", () => {
  beforeEach(() => {
    document.cookie = `${ANALYTICS_CONSENT_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    initAnalyticsMock.mockReset();
    trackPageViewMock.mockReset();
  });

  it("renders when consent is unknown", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ConsentBanner initialConsent="unknown" />
      </NextIntlClientProvider>
    );

    const banner = screen.getByRole("complementary", {
      name: "Analytics preferences",
    });

    expect(banner).toHaveStyle({
      width: "min(52rem, calc(100% - 2rem))",
      padding: "0.75rem 0.9rem",
      display: "flex",
      alignItems: "center",
    });
    expect(
      screen.getByRole("heading", { level: 2, name: "Analytics preferences" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Learn more" })).toHaveAttribute(
      "href",
      "/cookie-policy"
    );
    expect(screen.getByRole("button", { name: "Only essential" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept all" })).toBeInTheDocument();
  });

  it("stores declined consent and hides the banner", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ConsentBanner initialConsent="unknown" />
      </NextIntlClientProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Only essential" }));

    expect(getAnalyticsConsent()).toBe("declined");
    expect(
      screen.queryByRole("heading", { level: 2, name: "Analytics preferences" })
    ).toBeNull();
    expect(initAnalyticsMock).not.toHaveBeenCalled();
  });

  it("stores accepted consent, initializes analytics, and hides the banner", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ConsentBanner initialConsent="unknown" />
      </NextIntlClientProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));

    expect(getAnalyticsConsent()).toBe("accepted");
    expect(initAnalyticsMock).toHaveBeenCalledTimes(1);
    expect(trackPageViewMock).toHaveBeenCalledWith("/");
    expect(
      screen.queryByRole("heading", { level: 2, name: "Analytics preferences" })
    ).toBeNull();
  });
});

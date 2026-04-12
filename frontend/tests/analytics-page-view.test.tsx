import React from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { trackPageViewMock, initAnalyticsMock, pathnameState } = vi.hoisted(
  () => ({
    trackPageViewMock: vi.fn(),
    initAnalyticsMock: vi.fn(),
    pathnameState: { current: "/" },
  })
);

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameState.current,
}));

vi.mock("@/lib/analytics", () => ({
  initAnalytics: initAnalyticsMock,
  trackPageView: trackPageViewMock,
}));

import AnalyticsPageView from "@/components/AnalyticsPageView";

describe("AnalyticsPageView", () => {
  beforeEach(() => {
    pathnameState.current = "/";
    initAnalyticsMock.mockReset();
    trackPageViewMock.mockReset();
  });

  it("initializes analytics and tracks the current pathname", () => {
    render(<AnalyticsPageView />);

    expect(initAnalyticsMock).toHaveBeenCalledTimes(1);
    expect(trackPageViewMock).toHaveBeenCalledWith("/");
  });

  it("tracks again when the pathname changes", () => {
    const { rerender } = render(<AnalyticsPageView />);

    pathnameState.current = "/studio";
    rerender(<AnalyticsPageView />);

    expect(trackPageViewMock).toHaveBeenCalledWith("/studio");
  });
});

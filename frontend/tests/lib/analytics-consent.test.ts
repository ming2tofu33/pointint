import { beforeEach, describe, expect, it } from "vitest";

import {
  ANALYTICS_CONSENT_COOKIE,
  getAnalyticsConsent,
  setAnalyticsConsent,
} from "@/lib/analytics-consent";

describe("analytics consent", () => {
  beforeEach(() => {
    document.cookie = `${ANALYTICS_CONSENT_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  it("returns unknown when the consent cookie is missing", () => {
    expect(getAnalyticsConsent()).toBe("unknown");
  });

  it("writes and reads accepted consent", () => {
    setAnalyticsConsent("accepted");

    expect(document.cookie).toContain(
      `${ANALYTICS_CONSENT_COOKIE}=accepted`
    );
    expect(getAnalyticsConsent()).toBe("accepted");
  });

  it("writes and reads declined consent", () => {
    setAnalyticsConsent("declined");

    expect(document.cookie).toContain(
      `${ANALYTICS_CONSENT_COOKIE}=declined`
    );
    expect(getAnalyticsConsent()).toBe("declined");
  });
});

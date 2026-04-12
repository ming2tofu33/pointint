export const ANALYTICS_CONSENT_COOKIE = "analytics-consent";

export type AnalyticsConsent = "accepted" | "declined" | "unknown";

function readCookie(name: string) {
  if (typeof document === "undefined") return null;

  const target = `${name}=`;
  const cookies = document.cookie.split(";").map((part) => part.trim());
  const match = cookies.find((cookie) => cookie.startsWith(target));

  return match ? decodeURIComponent(match.slice(target.length)) : null;
}

export function getAnalyticsConsent(): AnalyticsConsent {
  const consent = readCookie(ANALYTICS_CONSENT_COOKIE);

  if (consent === "accepted" || consent === "declined") {
    return consent;
  }

  return "unknown";
}

export function setAnalyticsConsent(consent: Exclude<AnalyticsConsent, "unknown">) {
  if (typeof document === "undefined") return;

  document.cookie =
    `${ANALYTICS_CONSENT_COOKIE}=${encodeURIComponent(consent)}; path=/; max-age=31536000; samesite=lax`;
}

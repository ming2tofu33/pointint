"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  type AnalyticsConsent,
  setAnalyticsConsent,
} from "@/lib/analytics-consent";
import { initAnalytics, trackPageView } from "@/lib/analytics";

interface ConsentBannerProps {
  initialConsent: AnalyticsConsent;
}

export default function ConsentBanner({
  initialConsent,
}: ConsentBannerProps) {
  const t = useTranslations("consent");
  const [consent, setConsent] = useState<AnalyticsConsent>(initialConsent);

  if (consent !== "unknown") {
    return null;
  }

  function handleDecline() {
    setAnalyticsConsent("declined");
    setConsent("declined");
  }

  function handleAccept() {
    setAnalyticsConsent("accepted");
    setConsent("accepted");
    initAnalytics();
    trackPageView(window.location.pathname || "/");
  }

  return (
    <aside
      aria-label={t("title")}
      role="complementary"
      style={{
        position: "fixed",
        inset: "auto 1rem 1rem 1rem",
        zIndex: 120,
        margin: "0 auto",
        width: "min(52rem, calc(100% - 2rem))",
        border: "1px solid var(--landing-surface-border)",
        borderRadius: "18px",
        background:
          "linear-gradient(180deg, var(--landing-surface-fill-strong), var(--landing-surface-fill))",
        boxShadow: "0 12px 28px rgba(4, 10, 22, 0.22)",
        backdropFilter: "blur(14px)",
        padding: "0.75rem 0.9rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
          flex: "1 1 22rem",
          minWidth: 0,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "0.78rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            whiteSpace: "nowrap",
          }}
        >
          {t("title")}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "0.74rem",
            lineHeight: 1.45,
            color: "var(--color-text-secondary)",
            flex: "0 1 auto",
          }}
        >
          {t("body")}
        </p>
        <Link
          href="/cookie-policy"
          style={{
            fontSize: "0.74rem",
            fontWeight: 600,
            color: "var(--color-accent)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          {t("details")}
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          justifyContent: "flex-end",
          alignItems: "center",
          flex: "0 0 auto",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={handleDecline}
          style={{
            minHeight: "2.15rem",
            padding: "0 0.78rem",
            borderRadius: "999px",
            border: "1px solid var(--landing-surface-border)",
            background: "rgba(255, 255, 255, 0.06)",
            color: "var(--color-text-primary)",
            fontSize: "0.74rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {t("essentialOnly")}
        </button>
        <button
          type="button"
          onClick={handleAccept}
          style={{
            minHeight: "2.15rem",
            padding: "0 0.78rem",
            borderRadius: "999px",
            border: "1px solid var(--landing-surface-border)",
            background: "var(--color-accent)",
            color: "#fff",
            fontSize: "0.74rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 8px 18px rgba(232, 73, 106, 0.16)",
          }}
        >
          {t("acceptAll")}
        </button>
      </div>
    </aside>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const LOCALES = ["en", "ko"] as const;
type Locale = (typeof LOCALES)[number];

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  ko: "KO",
};

function getLocaleFromCookie(): Locale {
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=(\w+)/);
  const val = match?.[1];
  if (val === "ko" || val === "en") return val;
  return "en";
}

export default function LocaleToggle() {
  const [locale, setLocale] = useState<Locale>("en");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setLocale(getLocaleFromCookie());
  }, []);

  function toggleLocale() {
    const next = locale === "en" ? "ko" : "en";
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    setLocale(next);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      aria-label={`Language: ${LOCALE_LABELS[locale]}`}
      style={{
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "50%",
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-card)",
        color: "var(--color-text-secondary)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.6875rem",
        fontWeight: 700,
        letterSpacing: "0.02em",
        transition: "border-color 0.2s, color 0.2s",
        opacity: isPending ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-accent)";
        e.currentTarget.style.color = "var(--color-accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.color = "var(--color-text-secondary)";
      }}
    >
      {LOCALE_LABELS[locale]}
    </button>
  );
}

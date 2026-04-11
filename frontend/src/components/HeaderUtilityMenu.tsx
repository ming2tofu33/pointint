"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

type Locale = "en" | "ko";

const LOCALES: Array<{ code: Locale; label: string; translationKey: "english" | "korean" }> = [
  { code: "en", label: "EN", translationKey: "english" },
  { code: "ko", label: "KO", translationKey: "korean" },
];

function getLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return "en";

  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=(\w+)/);
  const value = match?.[1];
  return value === "ko" ? "ko" : "en";
}

function UtilityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="5" cy="12" r="1.75" fill="currentColor" />
      <circle cx="12" cy="12" r="1.75" fill="currentColor" />
      <circle cx="19" cy="12" r="1.75" fill="currentColor" />
    </svg>
  );
}

export default function HeaderUtilityMenu() {
  const t = useTranslations("nav");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocale(getLocaleFromCookie());
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function selectLocale(next: Locale) {
    if (next === locale) {
      setOpen(false);
      return;
    }

    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    setLocale(next);
    setOpen(false);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        aria-label={open ? t("closeUtilityMenu") : t("openUtilityMenu")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
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
          transition: "border-color 0.2s, color 0.2s",
        }}
      >
        <UtilityIcon />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={t("openUtilityMenu")}
          style={{
            position: "absolute",
            top: "calc(100% + 0.625rem)",
            right: 0,
            minWidth: "14rem",
            padding: "0.875rem",
            borderRadius: "1rem",
            border: "1px solid var(--landing-divider)",
            background:
              "linear-gradient(180deg, var(--landing-header-highlight), var(--landing-header-backdrop))",
            boxShadow:
              "inset 0 1px 0 var(--landing-header-highlight), 0 18px 40px var(--landing-header-shadow)",
            backdropFilter: "blur(20px) saturate(1.1)",
            display: "grid",
            gap: "0.875rem",
            zIndex: 60,
          }}
        >
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              {t("language")}
            </span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "0.375rem",
              }}
            >
              {LOCALES.map((option) => {
                const active = option.code === locale;

                return (
                  <button
                    key={option.code}
                    type="button"
                    aria-pressed={active}
                    aria-label={t(option.translationKey)}
                    disabled={isPending}
                    onClick={() => selectLocale(option.code)}
                    style={{
                      minHeight: "2.375rem",
                      borderRadius: "999px",
                      border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
                      backgroundColor: active
                        ? "var(--color-accent-subtle)"
                        : "rgba(255, 255, 255, 0.04)",
                      color: active
                        ? "var(--color-accent)"
                        : "var(--color-text-secondary)",
                      cursor: isPending ? "default" : "pointer",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      opacity: isPending ? 0.6 : 1,
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid var(--landing-divider)",
              paddingTop: "0.875rem",
              display: "grid",
              gap: "0.5rem",
            }}
          >
            <button
              type="button"
              aria-label={t("login")}
              disabled
              style={{
                width: "100%",
                minHeight: "2.5rem",
                borderRadius: "0.875rem",
                border: "1px solid var(--color-border)",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                color: "var(--color-text-secondary)",
                opacity: 0.6,
                cursor: "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 0.875rem",
                fontSize: "0.8125rem",
                fontWeight: 600,
              }}
            >
              <span>{t("login")}</span>
              <span
                aria-hidden="true"
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {t("comingSoon")}
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

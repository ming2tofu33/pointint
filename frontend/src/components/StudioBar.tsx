"use client";

import { useTranslations } from "next-intl";

interface StudioBarProps {
  onDownload?: () => void;
  onSecondaryDownload?: () => void;
  downloading?: boolean;
  canDownload?: boolean;
  canSecondaryDownload?: boolean;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

export default function StudioBar({
  onDownload,
  onSecondaryDownload,
  downloading,
  canDownload,
  canSecondaryDownload,
  primaryActionLabel,
  secondaryActionLabel,
}: StudioBarProps) {
  const t = useTranslations("studio");

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.625rem 1.25rem",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-secondary)",
        height: "3rem",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          {t("title")}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button
          onClick={onSecondaryDownload}
          disabled={!canSecondaryDownload || downloading}
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            padding: "0.375rem 0.875rem",
            backgroundColor: "transparent",
            color: canSecondaryDownload
              ? "var(--color-text-primary)"
              : "var(--color-text-muted)",
            border: "1px solid var(--color-border)",
            cursor: canSecondaryDownload ? "pointer" : "default",
            transition: "background-color 0.2s, opacity 0.2s",
            opacity: downloading ? 0.7 : 1,
          }}
        >
          {secondaryActionLabel ?? t("downloadCurrentSlot")}
        </button>

        <button
          onClick={onDownload}
          disabled={!canDownload || downloading}
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            padding: "0.375rem 1rem",
            backgroundColor: canDownload
              ? "var(--color-accent)"
              : "var(--color-border)",
            color: canDownload ? "#fff" : "var(--color-text-muted)",
            border: "none",
            cursor: canDownload ? "pointer" : "default",
            transition: "background-color 0.2s, opacity 0.2s",
            opacity: downloading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (canDownload)
              e.currentTarget.style.backgroundColor =
                "var(--color-accent-hover)";
          }}
          onMouseLeave={(e) => {
            if (canDownload)
              e.currentTarget.style.backgroundColor = "var(--color-accent)";
          }}
        >
          {downloading ? t("generating") : primaryActionLabel ?? t("downloadAllRoles")}
        </button>
      </div>
    </header>
  );
}

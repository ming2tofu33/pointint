"use client";

import { useTranslations } from "next-intl";
import SideMenu from "./SideMenu";

interface StudioBarProps {
  onDownload?: () => void;
  downloading?: boolean;
  canDownload?: boolean;
}

export default function StudioBar({
  onDownload,
  downloading,
  canDownload,
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
        <SideMenu />
        <span
          style={{
            width: "1px",
            height: "1rem",
            backgroundColor: "var(--color-border)",
          }}
        />
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
        {downloading ? t("generating") : t("download")}
      </button>
    </header>
  );
}

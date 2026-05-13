"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface StudioBarProps {
  onSaveProject?: () => void;
  onDownload?: () => void;
  onSecondaryDownload?: () => void;
  onTertiaryDownload?: () => void;
  canSaveProject?: boolean;
  downloading?: boolean;
  canDownload?: boolean;
  canSecondaryDownload?: boolean;
  canTertiaryDownload?: boolean;
  saveProjectLabel?: string;
  saveProjectDescription?: string;
  saveProjectStatusLabel?: string;
  projectTitleLabel?: string;
  primaryActionLabel?: string;
  primaryActionDescription?: string;
  secondaryActionLabel?: string;
  secondaryActionDescription?: string;
  tertiaryActionLabel?: string;
  tertiaryActionDescription?: string;
  hideDownloadActions?: boolean;
}

export default function StudioBar({
  onSaveProject,
  onDownload,
  onSecondaryDownload,
  onTertiaryDownload,
  canSaveProject,
  downloading,
  canDownload,
  canSecondaryDownload,
  canTertiaryDownload,
  saveProjectLabel,
  saveProjectDescription,
  saveProjectStatusLabel,
  projectTitleLabel,
  primaryActionLabel,
  primaryActionDescription,
  secondaryActionLabel,
  secondaryActionDescription,
  tertiaryActionLabel,
  tertiaryActionDescription,
  hideDownloadActions = false,
}: StudioBarProps) {
  const t = useTranslations("studio");
  const [secondaryMenuOpen, setSecondaryMenuOpen] = useState(false);
  const secondaryMenuRef = useRef<HTMLDivElement>(null);
  const hasNestedExportOption = Boolean(tertiaryActionLabel);
  const canUseSaveProject =
    Boolean(canSaveProject) && Boolean(onSaveProject) && !downloading;
  const canUseSecondaryAction = Boolean(canSecondaryDownload) && !downloading;
  const canUseTertiaryAction = Boolean(canTertiaryDownload) && !downloading;
  const canUseSecondaryTrigger = hasNestedExportOption
    ? canUseSecondaryAction || canUseTertiaryAction
    : canUseSecondaryAction;

  useEffect(() => {
    if (!secondaryMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (secondaryMenuRef.current?.contains(event.target as Node)) {
        return;
      }
      setSecondaryMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSecondaryMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [secondaryMenuOpen]);

  useEffect(() => {
    if (downloading) {
      setSecondaryMenuOpen(false);
    }
  }, [downloading]);

  const handleSecondaryTriggerClick = () => {
    if (!canUseSecondaryTrigger) return;

    if (hasNestedExportOption) {
      setSecondaryMenuOpen((open) => !open);
      return;
    }

    onSecondaryDownload?.();
  };

  const handleSaveProjectClick = () => {
    if (!canUseSaveProject) return;
    onSaveProject?.();
  };

  const handleSecondaryMenuAction = () => {
    if (!canUseSecondaryAction) return;
    setSecondaryMenuOpen(false);
    onSecondaryDownload?.();
  };

  const handleTertiaryMenuAction = () => {
    if (!canUseTertiaryAction) return;
    setSecondaryMenuOpen(false);
    onTertiaryDownload?.();
  };

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          minWidth: 0,
        }}
      >
        <span
          title={projectTitleLabel ?? t("untitledProject")}
          style={{
            minWidth: 0,
            maxWidth: "18rem",
            overflow: "hidden",
            color: "var(--color-text-primary)",
            fontSize: "0.8125rem",
            fontWeight: 700,
            letterSpacing: "0.005em",
            lineHeight: 1,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {projectTitleLabel ?? t("untitledProject")}
        </span>
        <span
          aria-hidden="true"
          style={{
            height: "1rem",
            width: "1px",
            backgroundColor: "var(--color-border)",
            opacity: 0.72,
          }}
        />
        <button
          type="button"
          aria-disabled={!canUseSaveProject}
          aria-label={saveProjectDescription ?? t("saveProjectDescription")}
          title={saveProjectDescription ?? t("saveProjectDescription")}
          onClick={handleSaveProjectClick}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.32rem",
            minHeight: "1.75rem",
            border: "1px solid transparent",
            borderRadius: "0.5rem",
            backgroundColor: "transparent",
            color: canUseSaveProject
              ? "var(--color-text-primary)"
              : "var(--color-text-muted)",
            cursor: canUseSaveProject ? "pointer" : "default",
            fontSize: "0.72rem",
            fontWeight: 700,
            lineHeight: 1,
            opacity: downloading ? 0.55 : 0.82,
            padding: "0 0.35rem",
            transition:
              "background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, opacity 0.18s ease",
          }}
        >
          <SaveIcon />
          <span>{saveProjectLabel ?? t("saveProject")}</span>
        </button>
        {saveProjectStatusLabel ? (
          <>
            <span
              aria-hidden="true"
              style={{
                color: "var(--color-text-muted)",
                fontSize: "0.6875rem",
                opacity: 0.7,
              }}
            >
              ·
            </span>
            <span
              style={{
                color: "var(--color-text-muted)",
                fontSize: "0.6875rem",
                fontWeight: 650,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {saveProjectStatusLabel}
            </span>
          </>
        ) : null}
      </div>

      {!hideDownloadActions ? (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div
          ref={secondaryMenuRef}
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <button
            onClick={handleSecondaryTriggerClick}
            disabled={!canUseSecondaryTrigger}
            title={secondaryActionDescription}
            aria-label={secondaryActionDescription}
            aria-haspopup={hasNestedExportOption ? "menu" : undefined}
            aria-expanded={hasNestedExportOption ? secondaryMenuOpen : undefined}
            aria-controls={
              hasNestedExportOption ? "studio-current-download-menu" : undefined
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.375rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              padding: "0.375rem 0.875rem",
              backgroundColor: "transparent",
              color: canUseSecondaryTrigger
                ? "var(--color-text-primary)"
                : "var(--color-text-muted)",
              border: "1px solid var(--color-border)",
              cursor: canUseSecondaryTrigger ? "pointer" : "default",
              transition: "background-color 0.2s, opacity 0.2s",
              opacity: downloading ? 0.7 : 1,
            }}
          >
            <DownloadArrowIcon />
            <span>{secondaryActionLabel ?? t("downloadCurrentSlot")}</span>
            {hasNestedExportOption ? (
              <ChevronDownIcon open={secondaryMenuOpen} />
            ) : null}
          </button>

          {hasNestedExportOption && secondaryMenuOpen ? (
            <div
              id="studio-current-download-menu"
              role="menu"
              aria-label={secondaryActionDescription}
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 0.45rem)",
                zIndex: 80,
                display: "grid",
                gap: "0.2rem",
                minWidth: "12.25rem",
                padding: "0.32rem",
                border: "1px solid color-mix(in srgb, var(--color-border) 86%, white 5%)",
                borderRadius: "0.85rem",
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--color-bg-secondary) 92%, white 4%), color-mix(in srgb, var(--color-bg-secondary) 96%, black 8%))",
                boxShadow:
                  "0 18px 42px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05)",
                animation: "studio-download-menu-in 150ms ease-out",
              }}
            >
              <DownloadMenuItem
                label={secondaryActionLabel ?? t("downloadCurrentSlot")}
                description={secondaryActionDescription}
                disabled={!canUseSecondaryAction}
                onClick={handleSecondaryMenuAction}
              />
              <DownloadMenuItem
                label={tertiaryActionLabel}
                description={tertiaryActionDescription}
                disabled={!canUseTertiaryAction}
                onClick={handleTertiaryMenuAction}
              />
            </div>
          ) : null}
        </div>

        <button
          onClick={onDownload}
          disabled={!canDownload || downloading}
          title={primaryActionDescription}
          aria-label={primaryActionDescription}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.375rem",
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
          {downloading ? null : <DownloadArrowIcon />}
          <span>
            {downloading
              ? t("generating")
              : primaryActionLabel ?? t("downloadAllRoles")}
          </span>
        </button>
      </div>
      ) : null}
      <style>{`
        @keyframes studio-download-menu-in {
          from {
            opacity: 0;
            transform: translateY(-0.3rem) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </header>
  );
}

function DownloadMenuItem({
  label,
  description,
  disabled,
  onClick,
}: {
  label?: string;
  description?: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      aria-label={description}
      title={description}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        minHeight: "2.25rem",
        border: "none",
        borderRadius: "0.62rem",
        backgroundColor: "transparent",
        color: disabled ? "var(--color-text-muted)" : "var(--color-text-primary)",
        cursor: disabled ? "default" : "pointer",
        fontSize: "0.8125rem",
        fontWeight: 700,
        lineHeight: 1,
        opacity: disabled ? 0.48 : 1,
        padding: "0.55rem 0.65rem",
        textAlign: "left",
        transition: "background-color 0.16s ease, color 0.16s ease",
      }}
    >
      <span>{label}</span>
      <DownloadArrowIcon />
    </button>
  );
}

function DownloadArrowIcon() {
  return (
    <svg
      data-testid="studio-download-icon"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      style={{
        width: "0.8125rem",
        height: "0.8125rem",
        display: "block",
        flexShrink: 0,
      }}
    >
      <path
        d="M8 2.5v7M5.25 7.25 8 10l2.75-2.75M3 12.5h10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      style={{
        width: "0.84rem",
        height: "0.84rem",
        display: "block",
        flexShrink: 0,
      }}
    >
      <path
        d="M3.25 2.75h7.4L12.75 4.9v8.35h-9.5V2.75Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.35"
      />
      <path
        d="M5.25 2.85v3.2h5.5M5.3 13.15V9.3h5.4v3.85"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.35"
      />
    </svg>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 12 12"
      style={{
        width: "0.72rem",
        height: "0.72rem",
        display: "block",
        flexShrink: 0,
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.16s ease",
      }}
    >
      <path
        d="M3 4.6 6 7.4l3-2.8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

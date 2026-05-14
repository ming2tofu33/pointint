"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

interface StudioHeaderControlsProps {
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

export default function StudioHeaderControls({
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
}: StudioHeaderControlsProps) {
  const t = useTranslations("studio");
  const [projectTarget, setProjectTarget] = useState<HTMLElement | null>(null);
  const [actionsTarget, setActionsTarget] = useState<HTMLElement | null>(null);
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
    setProjectTarget(document.getElementById("studio-header-project-meta"));
    setActionsTarget(document.getElementById("studio-header-actions"));
  }, []);

  useEffect(() => {
    if (!secondaryMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (!secondaryMenuRef.current?.contains(target)) {
        setSecondaryMenuOpen(false);
      }
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

  const handleSaveProjectClick = () => {
    if (!canUseSaveProject) return;
    onSaveProject?.();
  };

  const handleSecondaryTriggerClick = () => {
    if (!canUseSecondaryTrigger) return;

    if (hasNestedExportOption) {
      setSecondaryMenuOpen((open) => !open);
      return;
    }

    onSecondaryDownload?.();
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
    <>
      {projectTarget
        ? createPortal(
            <div
              data-testid="studio-header-project-controls"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.55rem",
                minWidth: 0,
              }}
            >
              <span
                className="app-header-project-title"
                title={projectTitleLabel ?? t("untitledProject")}
              >
                {projectTitleLabel ?? t("untitledProject")}
              </span>
              <span aria-hidden="true" className="app-header-muted-separator">
                ·
              </span>
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
                  backgroundColor: "transparent",
                  color: canUseSaveProject
                    ? "var(--color-text-primary)"
                    : "var(--color-text-muted)",
                  cursor: canUseSaveProject ? "pointer" : "default",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  lineHeight: 1,
                  opacity: downloading ? 0.55 : 0.82,
                  padding: 0,
                }}
              >
                <SaveIcon />
                <span>{saveProjectLabel ?? t("saveProject")}</span>
              </button>
              {saveProjectStatusLabel ? (
                <>
                  <span
                    aria-hidden="true"
                    className="app-header-muted-separator"
                  >
                    ·
                  </span>
                  <span className="app-header-save-status">
                    {saveProjectStatusLabel}
                  </span>
                </>
              ) : null}
            </div>,
            projectTarget
          )
        : null}

      {actionsTarget && !hideDownloadActions
        ? createPortal(
            <div
              data-testid="studio-header-download-actions"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "0.5rem",
                minWidth: 0,
              }}
            >
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
                  aria-expanded={
                    hasNestedExportOption ? secondaryMenuOpen : undefined
                  }
                  aria-controls={
                    hasNestedExportOption
                      ? "studio-header-current-download-menu"
                      : undefined
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.375rem",
                    minHeight: "2rem",
                    padding: "0 0.7rem",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "transparent",
                    color: canUseSecondaryTrigger
                      ? "var(--color-text-primary)"
                      : "var(--color-text-muted)",
                    cursor: canUseSecondaryTrigger ? "pointer" : "default",
                    fontSize: "0.75rem",
                    fontWeight: 650,
                    lineHeight: 1,
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
                    id="studio-header-current-download-menu"
                    role="menu"
                    aria-label={secondaryActionDescription}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 0.45rem)",
                      zIndex: 90,
                      display: "grid",
                      gap: "0.2rem",
                      minWidth: "12.25rem",
                      padding: "0.32rem",
                      border: "1px solid var(--color-border)",
                      backgroundColor:
                        "var(--studio-chrome-bg, var(--color-bg-card))",
                      boxShadow:
                        "0 18px 42px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05)",
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
                  minHeight: "2rem",
                  padding: "0 0.85rem",
                  backgroundColor: canDownload
                    ? "var(--color-accent)"
                    : "var(--color-border)",
                  color: canDownload ? "#fff" : "var(--color-text-muted)",
                  border: "none",
                  cursor: canDownload ? "pointer" : "default",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  lineHeight: 1,
                  opacity: downloading ? 0.6 : 1,
                }}
              >
                {downloading ? null : <DownloadArrowIcon />}
                <span>
                  {downloading
                    ? t("generating")
                    : primaryActionLabel ?? t("downloadAllRoles")}
                </span>
              </button>
            </div>,
            actionsTarget
          )
        : null}
    </>
  );
}

function SaveIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2.5h8l2 2v9H3z" />
      <path d="M5.5 2.5v4h5v-4" />
      <path d="M5.5 11h5" />
    </svg>
  );
}

function DownloadArrowIcon() {
  return (
    <svg
      data-testid="studio-download-icon"
      aria-hidden="true"
      focusable="false"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2.5v7" />
      <path d="m5.25 7.25 2.75 2.75 2.75-2.75" />
      <path d="M3 12.5h10" />
    </svg>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: open ? "rotate(180deg)" : undefined,
        transition: "transform 140ms ease",
      }}
    >
      <path d="m4.5 6.5 3.5 3 3.5-3" />
    </svg>
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
      onClick={onClick}
      style={{
        display: "grid",
        gap: "0.16rem",
        width: "100%",
        minHeight: "2.55rem",
        padding: "0.45rem 0.55rem",
        border: "1px solid transparent",
        backgroundColor: "transparent",
        color: disabled ? "var(--color-text-muted)" : "var(--color-text-primary)",
        cursor: disabled ? "default" : "pointer",
        textAlign: "left",
        opacity: disabled ? 0.56 : 1,
      }}
    >
      <span style={{ fontSize: "0.75rem", fontWeight: 760, lineHeight: 1.2 }}>
        {label}
      </span>
      {description ? (
        <span
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.68rem",
            fontWeight: 600,
            lineHeight: 1.25,
          }}
        >
          {description}
        </span>
      ) : null}
    </button>
  );
}

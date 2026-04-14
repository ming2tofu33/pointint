"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { STUDIO_INTERACTION_TRANSITION } from "@/components/StudioSurfaceCard";

type ReplacementKind = "static" | "animated";

type SlotReplacementSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  onStaticFile: (file: File) => void;
  onAnimatedFile: (file: File) => void;
};

export default function SlotReplacementSurface({
  children,
  onStaticFile,
  onAnimatedFile,
  style,
  ...props
}: SlotReplacementSurfaceProps) {
  const t = useTranslations("studio");
  const [dragActive, setDragActive] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const pendingKind = pendingFile ? getReplacementKind(pendingFile) : null;

  const queueReplacement = (file: File | null | undefined) => {
    if (!file) return;
    if (!getReplacementKind(file)) return;
    setPendingFile(file);
    setDragActive(false);
  };

  const confirmReplacement = () => {
    if (!pendingFile || !pendingKind) return;

    if (pendingKind === "animated") {
      onAnimatedFile(pendingFile);
    } else {
      onStaticFile(pendingFile);
    }

    setPendingFile(null);
  };

  return (
    <div
      {...props}
      data-testid="slot-replacement-surface"
      onDragOver={(event) => {
        event.preventDefault();
        if (!dragActive) setDragActive(true);
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDragActive(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        queueReplacement(event.dataTransfer.files?.[0]);
      }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        borderRadius: "1rem",
        border: dragActive
          ? "1px solid color-mix(in srgb, var(--color-accent-primary) 56%, white 8%)"
          : "1px solid transparent",
        backgroundColor: dragActive
          ? "rgba(255,255,255,0.025)"
          : "transparent",
        transition: STUDIO_INTERACTION_TRANSITION,
        ...style,
      }}
    >
      {pendingFile ? (
        <div
          data-testid="slot-replacement-confirm"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "0.75rem 0.875rem",
            marginBottom: "0.875rem",
            border: "1px solid var(--color-border)",
            borderRadius: "0.875rem",
            backgroundColor: "rgba(255,255,255,0.035)",
          }}
        >
          <div style={{ display: "grid", gap: "0.25rem", minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              {t("replaceSlotPrompt")}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
              }}
            >
              {t("replaceSlotWarning")}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setPendingFile(null)}
              aria-label={t("cancelReplace")}
              style={actionButtonStyle}
            >
              {t("cancelReplace")}
            </button>
            <button
              type="button"
              onClick={confirmReplacement}
              aria-label={t("confirmReplace")}
              style={{
                ...actionButtonStyle,
                borderColor: "var(--color-accent)",
                backgroundColor: "var(--color-accent-subtle)",
                color: "var(--color-accent)",
              }}
            >
              {t("confirmReplace")}
            </button>
          </div>
        </div>
      ) : null}

      {children}

      {dragActive ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px dashed color-mix(in srgb, var(--color-accent-primary) 68%, white 12%)",
            borderRadius: "0.875rem",
            backgroundColor: "rgba(255,255,255,0.045)",
            color: "var(--color-accent-primary)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            letterSpacing: "0.02em",
            pointerEvents: "none",
          }}
        >
          {t("dropToReplace")}
        </div>
      ) : null}
    </div>
  );
}

function getReplacementKind(file: File): ReplacementKind | null {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (type === "image/gif" || name.endsWith(".gif")) {
    return "animated";
  }

  if (
    type === "image/png" ||
    type === "image/jpeg" ||
    type === "image/webp" ||
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".webp")
  ) {
    return "static";
  }

  return null;
}

const actionButtonStyle = {
  fontSize: "0.6875rem",
  color: "var(--color-text-muted)",
  background: "none",
  border: "1px solid var(--color-border)",
  borderRadius: "0.5rem",
  padding: "0.375rem 0.625rem",
  cursor: "pointer",
  transition: STUDIO_INTERACTION_TRANSITION,
} as const;

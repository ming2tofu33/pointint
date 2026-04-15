"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import SlotSourceChoiceCard from "@/components/SlotSourceChoiceCard";
import { type SlotId } from "@/lib/cursorThemeProject";
import { STUDIO_INTERACTION_TRANSITION } from "@/components/StudioSurfaceCard";

interface StudioSlotEmptyStateProps {
  slotId: SlotId;
  onStaticFile: (file: File) => void;
  onAnimatedFile: (file: File) => void;
  width?: string;
  minHeight?: string;
  boxed?: boolean;
}

export default function StudioSlotEmptyState({
  slotId,
  onStaticFile,
  onAnimatedFile,
  width = "min(56rem, 100%)",
  minHeight,
  boxed = false,
}: StudioSlotEmptyStateProps) {
  const t = useTranslations("studio");
  const slotLabel = t(`slot${capitalizeSlotId(slotId)}`);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  return (
    <div
      data-testid="studio-empty-slot-state"
      style={{
        width,
        minHeight,
        border: boxed ? "1px solid var(--color-border)" : undefined,
        borderRadius: boxed ? "1.25rem" : undefined,
        backgroundColor: boxed ? "rgba(255,255,255,0.02)" : undefined,
        padding: boxed ? "1.5rem" : undefined,
        display: "grid",
        gap: "1.25rem",
        color: "var(--color-text-muted)",
        textAlign: "left",
        lineHeight: 1.6,
      }}
    >
      <div style={{ display: "grid", gap: "0.375rem" }}>
        <div
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {boxed ? t("slotEmptyTitle") : `${slotLabel} ${t("slotLabelSuffix")}`}
        </div>
        {boxed ? (
          <>
            <div
              style={{ fontSize: "0.875rem", color: "var(--color-text-primary)" }}
            >
              {slotLabel}
            </div>
            <div style={{ fontSize: "0.8125rem" }}>{t("slotEmptySub")}</div>
          </>
        ) : (
          <div
            style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}
          >
            {t("emptySlotDescription")}
          </div>
        )}
      </div>

      <div
        data-testid="studio-empty-slot-source-cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
          gap: "1rem",
          padding: boxed ? undefined : "1.125rem",
          border: boxed ? undefined : "1px solid var(--color-border)",
          borderRadius: boxed ? undefined : "1rem",
          backgroundColor: boxed ? undefined : "rgba(255,255,255,0.02)",
        }}
      >
        <SlotSourceChoiceCard
          dataTestId="studio-empty-slot-source-static"
          title={t("slotStaticUpload")}
          description={t("slotStaticUploadSub")}
          ariaLabel={t("emptySlotStaticStart")}
          mode="cur"
          onFile={onStaticFile}
        />
        <SlotSourceChoiceCard
          dataTestId="studio-empty-slot-source-animated"
          title={t("slotAniUpload")}
          description={t("slotAniUploadSub")}
          ariaLabel={t("emptySlotAnimatedStart")}
          mode="ani"
          onFile={onAnimatedFile}
        />
      </div>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        <button
          type="button"
          onClick={() => setShowMoreOptions((current) => !current)}
          style={{
            alignSelf: "flex-start",
            background: "none",
            border: "none",
            color: "var(--color-text-secondary)",
            fontSize: "0.75rem",
            cursor: "pointer",
            padding: 0,
            transition: STUDIO_INTERACTION_TRANSITION,
          }}
        >
          {t("moreSourceOptions")}
        </button>

        {showMoreOptions ? (
          <div
            style={{
              display: "grid",
              gap: "0.625rem",
              borderTop: "1px solid var(--color-border)",
              paddingTop: "0.875rem",
            }}
          >
            <SoonSourceRow
              title={t("emptySlotMultiplePngs")}
              badge={t("soon")}
            />
            <SoonSourceRow
              title={t("emptySlotAiGenerate")}
              badge={t("soon")}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SoonSourceRow({
  title,
  badge,
}: {
  title: string;
  badge: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        border: "1px solid var(--color-border)",
        borderRadius: "0.75rem",
        padding: "0.75rem 0.875rem",
        backgroundColor: "rgba(255,255,255,0.02)",
      }}
    >
      <span style={{ fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>
        {title}
      </span>
      <span
        style={{
          fontSize: "0.625rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: "var(--color-text-muted)",
        }}
      >
        {badge}
      </span>
    </div>
  );
}

function capitalizeSlotId(slotId: string | undefined) {
  if (!slotId) return "Slot";
  return `${slotId.slice(0, 1).toUpperCase()}${slotId.slice(1)}`;
}

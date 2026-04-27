"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import SlotSourceChoiceCard from "@/components/SlotSourceChoiceCard";
import { type SlotId } from "@/lib/cursorThemeProject";
import { STUDIO_INTERACTION_TRANSITION } from "@/components/StudioSurfaceCard";

interface StudioSlotEmptyStateProps {
  slotId: SlotId;
  onStaticFile: (file: File) => void;
  onAnimatedFile: (file: File) => void;
  onImageSequenceFiles: (files: File[]) => void;
  width?: string;
  minHeight?: string;
  boxed?: boolean;
}

export default function StudioSlotEmptyState({
  slotId,
  onStaticFile,
  onAnimatedFile,
  onImageSequenceFiles,
  width = "min(56rem, 100%)",
  minHeight,
  boxed = false,
}: StudioSlotEmptyStateProps) {
  const t = useTranslations("studio");
  const slotLabel = t(`slot${capitalizeSlotId(slotId)}`);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const imageSequenceMinimumError = t("imageSequenceMinimumError");
  const extraSourcesId = useId();

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
          onImageSequenceFiles={onImageSequenceFiles}
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
          aria-controls={extraSourcesId}
          aria-expanded={showMoreOptions}
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
            id={extraSourcesId}
            style={{
              display: "grid",
              gap: "0.625rem",
              borderTop: "1px solid var(--color-border)",
              paddingTop: "0.875rem",
            }}
          >
            <AvailableSourceRow
              title={t("emptySlotMultiplePngs")}
              onFiles={onImageSequenceFiles}
              minimumError={imageSequenceMinimumError}
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

const IMAGE_SEQUENCE_ACCEPT = ".png,.jpg,.jpeg,.webp";
const IMAGE_SEQUENCE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

function isImageSequenceFrame(file: File) {
  if (file.type) {
    return IMAGE_SEQUENCE_TYPES.has(file.type);
  }

  return /\.(png|jpe?g|webp)$/i.test(file.name);
}

function AvailableSourceRow({
  title,
  onFiles,
  minimumError,
}: {
  title: string;
  onFiles: (files: File[]) => void;
  minimumError: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInteractiveActive = isHovered || isDragActive;

  const handleFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(isImageSequenceFrame);

    if (validFiles.length < 2) {
      setError(minimumError);
      return;
    }

    setError(null);
    onFiles(validFiles);
  };

  return (
    <div style={{ display: "grid", gap: "0.375rem" }}>
      <button
        type="button"
        data-testid="studio-empty-slot-source-gif-maker"
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isDragActive) {
            setIsDragActive(true);
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDragActive(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragActive(false);
          handleFiles(event.dataTransfer.files);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          border: isInteractiveActive
            ? "1px solid color-mix(in srgb, var(--color-accent-primary) 64%, white 10%)"
            : "1px solid color-mix(in srgb, var(--color-accent-primary) 48%, var(--color-border))",
          borderRadius: "0.75rem",
          padding: "0.75rem 0.875rem",
          backgroundColor: isInteractiveActive
            ? "rgba(255,255,255,0.055)"
            : "rgba(255,255,255,0.035)",
          color: "var(--color-text-primary)",
          cursor: "pointer",
          textAlign: "left",
          transition: STUDIO_INTERACTION_TRANSITION,
        }}
      >
        <span style={{ fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>
          {title}
        </span>
        <span
          aria-hidden="true"
          style={{
            fontSize: "1rem",
            lineHeight: 1,
            color: isInteractiveActive
              ? "var(--color-accent-primary)"
              : "var(--color-text-muted)",
          }}
        >
          +
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={IMAGE_SEQUENCE_ACCEPT}
        onChange={(event) => {
          if (event.target.files) {
            handleFiles(event.target.files);
          }
          event.currentTarget.value = "";
        }}
        style={{ display: "none" }}
      />
      {error ? (
        <div
          role="alert"
          style={{
            fontSize: "0.6875rem",
            color: "var(--color-text-secondary)",
          }}
        >
          {error}
        </div>
      ) : null}
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

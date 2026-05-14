"use client";

import { STUDIO_INTERACTION_TRANSITION } from "@/components/StudioSurfaceCard";
import InteractiveDotBackground from "@/components/InteractiveDotBackground";

interface StudioQuickResultProps {
  title: string;
  description: string;
  previewUrl: string;
  displayPreviewUrl?: string;
  cursorName: string;
  cursorSize: number;
  hotspotLabel: string;
  typeLabel: string;
  actualSizeLabel: string;
  lightPreviewAlt: string;
  darkPreviewAlt: string;
  downloading: boolean;
  canDownload: boolean;
  downloadLabel: string;
  downloadDescription: string;
  advancedLabel: string;
  onDownload: () => void;
  onOpenAdvanced: () => void;
  fullSetLabel?: string;
  fullSetDescription?: string;
  canDownloadFullSet?: boolean;
  onDownloadFullSet?: () => void;
}

export default function StudioQuickResult({
  title,
  description,
  previewUrl,
  displayPreviewUrl,
  cursorName,
  cursorSize,
  hotspotLabel,
  typeLabel,
  actualSizeLabel,
  lightPreviewAlt,
  darkPreviewAlt,
  downloading,
  canDownload,
  downloadLabel,
  downloadDescription,
  advancedLabel,
  onDownload,
  onOpenAdvanced,
  fullSetLabel,
  fullSetDescription,
  canDownloadFullSet = false,
  onDownloadFullSet,
}: StudioQuickResultProps) {
  const canUseDownload = canDownload && !downloading;
  const canUseFullSet = Boolean(canDownloadFullSet && onDownloadFullSet);
  const heroPreviewUrl = displayPreviewUrl ?? previewUrl;

  return (
    <section
      data-testid="studio-quick-result"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
          "--mouse-x",
          `${event.clientX - rect.left}px`
        );
        event.currentTarget.style.setProperty(
          "--mouse-y",
          `${event.clientY - rect.top}px`
        );
      }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
          "--mouse-x",
          `${event.clientX - rect.left}px`
        );
        event.currentTarget.style.setProperty(
          "--mouse-y",
          `${event.clientY - rect.top}px`
        );
      }}
      style={{
        width: "100%",
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: "minmax(18rem, 1fr) minmax(18rem, 28rem)",
        alignItems: "center",
        gap: "clamp(1rem, 3vw, 2rem)",
        padding: "clamp(1rem, 3vw, 2rem)",
        background: "var(--color-bg-primary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <InteractiveDotBackground
        layerTestId="studio-quick-result-dots"
        baseColor="color-mix(in srgb, var(--color-text-primary) 13%, transparent)"
      />
      <div
        style={{
          minHeight: "min(33rem, 68vh)",
          border: "1px solid color-mix(in srgb, var(--color-border) 82%, white 5%)",
          background:
            "color-mix(in srgb, var(--color-bg-secondary) 92%, transparent)",
          display: "grid",
          placeItems: "center",
          boxShadow: "none",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "min(16rem, 54vw)",
            aspectRatio: "1 / 1",
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(45deg, var(--color-bg-tertiary) 25%, transparent 25%), linear-gradient(-45deg, var(--color-bg-tertiary) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--color-bg-tertiary) 75%), linear-gradient(-45deg, transparent 75%, var(--color-bg-tertiary) 75%)",
            backgroundSize: "1.25rem 1.25rem",
            backgroundPosition: "0 0, 0 0.625rem, 0.625rem -0.625rem, -0.625rem 0",
          }}
        >
          <img
            src={heroPreviewUrl}
            alt={cursorName}
            style={{
              width: "min(11rem, 68%)",
              height: "auto",
              maxHeight: "min(11rem, 68%)",
              imageRendering: "auto",
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gap: "1rem", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gap: "0.55rem" }}>
          <div
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.72rem",
              fontWeight: 760,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <span>{typeLabel}</span>
            <span aria-hidden="true"> / </span>
            <span>{hotspotLabel}</span>
          </div>
          <h1
            style={{
              margin: 0,
              color: "var(--color-text-primary)",
              fontSize: "1.75rem",
              lineHeight: 1.08,
              letterSpacing: "0",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: 0,
              color: "var(--color-text-secondary)",
              fontSize: "0.9rem",
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        </div>

        <div
          aria-label={actualSizeLabel}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 4.75rem)",
            gap: "0.65rem",
          }}
        >
          <ActualSizePreview
            alt={lightPreviewAlt}
            background="#fff"
            previewUrl={previewUrl}
            cursorSize={cursorSize}
          />
          <ActualSizePreview
            alt={darkPreviewAlt}
            background="#101216"
            previewUrl={previewUrl}
            cursorSize={cursorSize}
          />
        </div>

        <div style={{ display: "grid", gap: "0.65rem" }}>
          <button
            type="button"
            disabled={!canUseDownload}
            title={downloadDescription}
            aria-label={downloadDescription}
            onClick={onDownload}
            style={{
              minHeight: "2.85rem",
              border: "1px solid color-mix(in srgb, var(--color-accent) 82%, white 8%)",
              backgroundColor: "var(--color-accent)",
              color: "#0d1016",
              fontSize: "0.95rem",
              fontWeight: 820,
              cursor: canUseDownload ? "pointer" : "default",
              opacity: canUseDownload ? 1 : 0.46,
              transition: STUDIO_INTERACTION_TRANSITION,
            }}
          >
            {downloadLabel}
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: canUseFullSet ? "1fr 1fr" : "1fr",
              gap: "0.55rem",
            }}
          >
            <button
              type="button"
              onClick={onOpenAdvanced}
              style={secondaryButtonStyle}
            >
              {advancedLabel}
            </button>
            {fullSetLabel && fullSetDescription && onDownloadFullSet ? (
              <button
                type="button"
                disabled={!canUseFullSet}
                title={fullSetDescription}
                aria-label={fullSetDescription}
                onClick={onDownloadFullSet}
                style={{
                  ...secondaryButtonStyle,
                  opacity: canUseFullSet ? 1 : 0.46,
                  cursor: canUseFullSet ? "pointer" : "default",
                }}
              >
                {fullSetLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ActualSizePreview({
  alt,
  background,
  previewUrl,
  cursorSize,
}: {
  alt: string;
  background: string;
  previewUrl: string;
  cursorSize: number;
}) {
  return (
    <div
      style={{
        width: "4.75rem",
        height: "4.75rem",
        display: "grid",
        placeItems: "center",
        border: "1px solid var(--color-border)",
        backgroundColor: background,
      }}
    >
      <img
        src={previewUrl}
        alt={alt}
        style={{
          width: `${cursorSize}px`,
          height: `${cursorSize}px`,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}

const secondaryButtonStyle = {
  minHeight: "2.5rem",
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-bg-secondary)",
  color: "var(--color-text-primary)",
  fontSize: "0.82rem",
  fontWeight: 740,
  cursor: "pointer",
  transition: STUDIO_INTERACTION_TRANSITION,
};

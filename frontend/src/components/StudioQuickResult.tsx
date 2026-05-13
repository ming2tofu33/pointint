"use client";

import { STUDIO_INTERACTION_TRANSITION } from "@/components/StudioSurfaceCard";

interface StudioQuickResultProps {
  title: string;
  description: string;
  previewUrl: string;
  cursorName: string;
  cursorSize: number;
  hotspotLabel: string;
  typeLabel: string;
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
  cursorName,
  cursorSize,
  hotspotLabel,
  typeLabel,
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

  return (
    <section
      data-testid="studio-quick-result"
      style={{
        width: "100%",
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: "minmax(18rem, 1fr) minmax(18rem, 28rem)",
        alignItems: "center",
        gap: "clamp(1.5rem, 4vw, 3.5rem)",
        padding: "clamp(1.5rem, 4vw, 3rem)",
        background:
          "radial-gradient(circle at 36% 20%, color-mix(in srgb, var(--color-accent) 15%, transparent), transparent 34%), var(--color-bg-primary)",
      }}
    >
      <div
        style={{
          minHeight: "min(32rem, 66vh)",
          border: "1px solid color-mix(in srgb, var(--color-border) 82%, white 5%)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 24px 90px rgba(0,0,0,0.28)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "min(18rem, 58vw)",
            aspectRatio: "1 / 1",
            display: "grid",
            placeItems: "center",
            background:
              "linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.05) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.05) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.05) 75%)",
            backgroundSize: "1.25rem 1.25rem",
            backgroundPosition: "0 0, 0 0.625rem, 0.625rem -0.625rem, -0.625rem 0",
          }}
        >
          <img
            src={previewUrl}
            alt={cursorName}
            style={{
              width: "min(9rem, 42%)",
              height: "min(9rem, 42%)",
              imageRendering: "pixelated",
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gap: "1.15rem" }}>
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
              fontSize: "clamp(2rem, 4vw, 3.4rem)",
              lineHeight: 0.98,
              letterSpacing: "-0.055em",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: 0,
              color: "var(--color-text-secondary)",
              fontSize: "0.95rem",
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>
        </div>

        <div
          aria-label="Actual size preview"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 4.75rem)",
            gap: "0.65rem",
          }}
        >
          <ActualSizePreview
            alt="Light background preview"
            background="#fff"
            previewUrl={previewUrl}
            cursorSize={cursorSize}
          />
          <ActualSizePreview
            alt="Dark background preview"
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
              minHeight: "3rem",
              border: "1px solid color-mix(in srgb, var(--color-accent) 82%, white 8%)",
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--color-accent) 92%, white 8%), var(--color-accent))",
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
  backgroundColor: "rgba(255,255,255,0.025)",
  color: "var(--color-text-primary)",
  fontSize: "0.82rem",
  fontWeight: 740,
  cursor: "pointer",
  transition: STUDIO_INTERACTION_TRANSITION,
};

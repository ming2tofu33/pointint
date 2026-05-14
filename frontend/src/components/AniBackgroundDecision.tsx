"use client";

import { useId } from "react";

import InteractiveDotBackground from "@/components/InteractiveDotBackground";
import { STUDIO_INTERACTION_TRANSITION } from "@/components/StudioSurfaceCard";

interface AniBackgroundDecisionProps {
  title: string;
  description: string;
  keepLabel: string;
  removeLabel: string;
  framePreviewUrls: string[];
  onKeep: () => void;
  onRemove: () => void;
  processing?: boolean;
  processingTitle?: string;
  processingDescription?: string;
  progress?: {
    completed: number;
    total: number;
  } | null;
}

export default function AniBackgroundDecision({
  title,
  description,
  keepLabel,
  removeLabel,
  framePreviewUrls,
  onKeep,
  onRemove,
  processing = false,
  processingTitle,
  processingDescription,
  progress,
}: AniBackgroundDecisionProps) {
  const titleId = useId();
  const progressPercent =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.completed / progress.total) * 100))
      : 0;

  return (
    <section
      data-testid="ani-background-decision"
      aria-labelledby={titleId}
      style={{
        width: "100%",
        flex: 1,
        minHeight: 0,
        display: "grid",
        placeItems: "center",
        padding: "clamp(1rem, 3vw, 2rem)",
        background: "var(--color-bg-primary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <InteractiveDotBackground
        baseColor="color-mix(in srgb, var(--color-text-primary) 13%, transparent)"
      />
      <div
        style={{
          width: "min(100%, 42rem)",
          display: "grid",
          gap: "1.05rem",
          border: "1px solid color-mix(in srgb, var(--color-border) 88%, white 4%)",
          backgroundColor:
            "color-mix(in srgb, var(--color-bg-secondary) 94%, transparent)",
          padding: "clamp(1rem, 3vw, 1.5rem)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "grid", gap: "0.42rem", textAlign: "center" }}>
          <h1
            id={titleId}
            style={{
              margin: 0,
              color: "var(--color-text-primary)",
              fontSize: "1.35rem",
              lineHeight: 1.12,
              letterSpacing: "0",
            }}
          >
            {processing && processingTitle ? processingTitle : title}
          </h1>
          <p
            style={{
              margin: 0,
              color: "var(--color-text-secondary)",
              fontSize: "0.88rem",
              lineHeight: 1.55,
            }}
          >
            {processing && processingDescription
              ? processingDescription
              : description}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "0.55rem",
          }}
        >
          {framePreviewUrls.slice(0, 3).map((url, index) => (
            <div
              key={`${url}-${index}`}
              style={{
                minHeight: "6rem",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-primary)",
                backgroundImage:
                  "linear-gradient(45deg, rgba(148,163,184,0.13) 25%, transparent 25%), linear-gradient(-45deg, rgba(148,163,184,0.13) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(148,163,184,0.13) 75%), linear-gradient(-45deg, transparent 75%, rgba(148,163,184,0.13) 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                display: "grid",
                placeItems: "center",
                padding: "0.6rem",
              }}
            >
              <img
                src={url}
                alt={`Frame ${index + 1}`}
                style={{
                  width: "100%",
                  height: "5rem",
                  objectFit: "contain",
                  imageRendering: "pixelated",
                }}
              />
            </div>
          ))}
        </div>

        {processing ? (
          <div
            role="status"
            aria-label={processingDescription}
            style={{
              display: "grid",
              gap: "0.55rem",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg-primary)",
              padding: "0.85rem",
            }}
          >
            <div
              style={{
                height: "0.45rem",
                backgroundColor: "var(--color-bg-secondary)",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: `${progressPercent}%`,
                  height: "100%",
                  backgroundColor: "var(--color-accent)",
                  transition: "width 180ms ease",
                }}
              />
            </div>
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.65rem",
          }}
        >
          <DecisionButton disabled={processing} onClick={onKeep}>
            {keepLabel}
          </DecisionButton>
          <DecisionButton accent disabled={processing} onClick={onRemove}>
            {removeLabel}
          </DecisionButton>
        </div>
      </div>
    </section>
  );
}

function DecisionButton({
  accent,
  disabled,
  children,
  onClick,
}: {
  accent?: boolean;
  disabled?: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        minHeight: "3.2rem",
        border: `1px solid ${accent ? "var(--color-accent)" : "var(--color-border)"}`,
        backgroundColor: accent
          ? "var(--color-accent-subtle)"
          : "var(--color-bg-primary)",
        color: accent ? "var(--color-accent)" : "var(--color-text-primary)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.58 : 1,
        fontSize: "0.86rem",
        fontWeight: 760,
        padding: "0.85rem",
        transition: STUDIO_INTERACTION_TRANSITION,
      }}
    >
      {children}
    </button>
  );
}

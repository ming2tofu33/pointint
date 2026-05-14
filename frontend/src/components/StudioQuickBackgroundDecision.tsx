"use client";

import { useId } from "react";

import InteractiveDotBackground from "@/components/InteractiveDotBackground";
import { STUDIO_INTERACTION_TRANSITION } from "@/components/StudioSurfaceCard";

interface StudioQuickBackgroundDecisionProps {
  title: string;
  description: string;
  removeLabel: string;
  keepLabel: string;
  processing?: boolean;
  previewUrl?: string;
  cursorName?: string;
  onRemove: () => void;
  onKeep: () => void;
}

export default function StudioQuickBackgroundDecision({
  title,
  description,
  removeLabel,
  keepLabel,
  processing = false,
  previewUrl,
  cursorName = "cursor",
  onRemove,
  onKeep,
}: StudioQuickBackgroundDecisionProps) {
  const titleId = useId();

  return (
    <section
      data-testid="studio-quick-background-decision"
      aria-labelledby={titleId}
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
        gridTemplateColumns: "minmax(16rem, 1fr) minmax(18rem, 30rem)",
        alignItems: "center",
        gap: "clamp(1rem, 3vw, 2rem)",
        padding: "clamp(1rem, 3vw, 2rem)",
        background: "var(--color-bg-primary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <InteractiveDotBackground
        layerTestId="studio-quick-background-dots"
        baseColor="color-mix(in srgb, var(--color-text-primary) 13%, transparent)"
      />
      <div
        style={{
          minHeight: "min(32rem, 66vh)",
          border: "1px solid color-mix(in srgb, var(--color-border) 82%, white 5%)",
          backgroundColor:
            "color-mix(in srgb, var(--color-bg-secondary) 92%, transparent)",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={cursorName}
            style={{
              width: "min(12rem, 42%)",
              height: "min(12rem, 42%)",
              objectFit: "contain",
              imageRendering: "pixelated",
            }}
          />
        ) : null}
      </div>

      <div
        style={{
          minHeight: "17rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "1rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "grid", gap: "0.45rem" }}>
          <h1
            id={titleId}
            style={{
              margin: 0,
              color: "var(--color-text-primary)",
              fontSize: "1.65rem",
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
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
        </div>

        {processing ? (
          <div
            data-testid="studio-quick-background-processing"
            role="status"
            style={{
              minHeight: "7.5rem",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
              padding: "1rem",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: "1.2rem",
                height: "1.2rem",
                borderRadius: "999px",
                border: "2px solid color-mix(in srgb, var(--color-border) 88%, white 8%)",
                borderTopColor: "var(--color-accent)",
                animation: "studio-quick-bg-spin 0.8s linear infinite",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: "var(--color-text-primary)",
                fontSize: "0.86rem",
                fontWeight: 720,
              }}
            >
              {description}
            </span>
            <style>{`@keyframes studio-quick-bg-spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : (
          <div
            style={{
              minHeight: "7.5rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.65rem",
            }}
          >
            <QuickDecisionButton accent onClick={onRemove}>
              {removeLabel}
            </QuickDecisionButton>
            <QuickDecisionButton onClick={onKeep}>{keepLabel}</QuickDecisionButton>
          </div>
        )}
      </div>
    </section>
  );
}

function QuickDecisionButton({
  accent,
  children,
  onClick,
}: {
  accent?: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${accent ? "var(--color-accent)" : "var(--color-border)"}`,
        backgroundColor: accent
          ? "var(--color-accent-subtle)"
          : "var(--color-bg-secondary)",
        color: accent ? "var(--color-accent)" : "var(--color-text-primary)",
        cursor: "pointer",
        fontSize: "0.86rem",
        fontWeight: 760,
        padding: "0.9rem",
        textAlign: "center",
        transition: STUDIO_INTERACTION_TRANSITION,
      }}
    >
      {children}
    </button>
  );
}

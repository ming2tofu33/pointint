"use client";

import { type CSSProperties, type ReactNode } from "react";

export type CursorSceneZone = "neutral" | "text" | "link" | "button";

interface CursorSceneProps {
  onZoneChange?: (zone: CursorSceneZone) => void;
  children?: ReactNode;
}

export default function CursorScene({
  onZoneChange,
  children,
}: CursorSceneProps) {
  return (
    <div
      data-testid="cursor-scene"
      style={{
        display: "grid",
        gap: "0.75rem",
        padding: "1.5rem",
        minHeight: "18rem",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {children ?? (
        <>
          <div
            data-testid="cursor-scene-zone-neutral"
            onMouseEnter={() => onZoneChange?.("neutral")}
            style={zoneStyle("neutral")}
          >
            Neutral space
          </div>

          <p
            data-testid="cursor-scene-zone-text"
            onMouseEnter={() => onZoneChange?.("text")}
            style={zoneStyle("text")}
          >
            Sample body text to exercise a text cursor state.
          </p>

          <a
            data-testid="cursor-scene-zone-link"
            href="#"
            onClick={(event) => event.preventDefault()}
            onMouseEnter={() => onZoneChange?.("link")}
            style={zoneStyle("link")}
          >
            Sample link target
          </a>

          <button
            data-testid="cursor-scene-zone-button"
            type="button"
            onMouseEnter={() => onZoneChange?.("button")}
            style={zoneButtonStyle}
          >
            Sample action
          </button>
        </>
      )}
    </div>
  );
}

function zoneStyle(kind: CursorSceneZone) {
  const base = {
    border: "1px solid var(--color-border)",
    borderRadius: "0.75rem",
    padding: "0.875rem 1rem",
    backgroundColor: "var(--color-bg-primary)",
    color: "var(--color-text-primary)",
  } as const;

  if (kind === "neutral") {
    return {
      ...base,
      minHeight: "4rem",
      display: "flex",
      alignItems: "center",
    };
  }

  if (kind === "text") {
    return {
      ...base,
      lineHeight: 1.5,
      minHeight: "4rem",
    };
  }

  if (kind === "link") {
    return {
      ...base,
      color: "var(--color-accent)",
      textDecoration: "underline",
      textUnderlineOffset: "0.2em",
      cursor: "pointer",
    };
  }

  return base;
}

const zoneButtonStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  padding: "0.875rem 1rem",
  backgroundColor: "var(--color-accent-subtle)",
  color: "var(--color-accent)",
  cursor: "pointer",
  textAlign: "left" as const,
} satisfies CSSProperties;

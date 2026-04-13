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
          <div data-testid="cursor-scene-browser-chrome" style={chromeStyle}>
            <div style={chromeDotsStyle}>
              <span style={{ ...chromeDotStyle, backgroundColor: "#ff5f57" }} />
              <span style={{ ...chromeDotStyle, backgroundColor: "#ffbd2f" }} />
              <span style={{ ...chromeDotStyle, backgroundColor: "#28c840" }} />
            </div>
            <div data-testid="cursor-scene-browser-address" style={addressBarStyle}>
              docs.pointint.app/windows/cursor-theme
            </div>
          </div>

          <div
            data-testid="cursor-scene-zone-neutral"
            onMouseEnter={() => onZoneChange?.("neutral")}
            style={browserSurfaceStyle}
          >
            <div style={browserToolbarStyle}>
              <div style={tabActiveStyle}>Documentation</div>
              <div style={tabMutedStyle}>Downloads</div>
              <div style={tabMutedStyle}>Support</div>
            </div>

            <div style={browserContentStyle}>
              <section style={articleStyle}>
                <h3 style={titleStyle}>Installing a custom cursor theme</h3>
                <p
                  data-testid="cursor-scene-zone-text"
                  onMouseEnter={() => onZoneChange?.("text")}
                  style={bodyTextStyle}
                >
                  Open Mouse settings, switch to the Pointer tab, and replace the
                  default scheme with the files exported from Pointint.
                </p>
                <div style={metaRowStyle}>
                  <span style={metaBadgeStyle}>Windows 11</span>
                  <span style={metaTextStyle}>4 minute setup</span>
                </div>
              </section>

              <aside style={sideCardStyle}>
                <div style={sideCardLabelStyle}>Quick actions</div>
                <a
                  data-testid="cursor-scene-zone-link"
                  href="#"
                  onClick={(event) => event.preventDefault()}
                  onMouseEnter={() => onZoneChange?.("link")}
                  style={linkStyle}
                >
                  Open cursor settings
                </a>
                <button
                  data-testid="cursor-scene-zone-button"
                  type="button"
                  onMouseEnter={() => onZoneChange?.("button")}
                  style={zoneButtonStyle}
                >
                  Apply theme
                </button>
                <label style={inputLabelStyle}>
                  Search settings
                  <input
                    data-testid="cursor-scene-browser-input"
                    onMouseEnter={() => onZoneChange?.("text")}
                    readOnly
                    value="pointer scheme"
                    style={inputStyle}
                  />
                </label>
              </aside>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const chromeStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  border: "1px solid var(--color-border)",
  borderRadius: "1rem 1rem 0.75rem 0.75rem",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
};

const chromeDotsStyle: CSSProperties = {
  display: "flex",
  gap: "0.375rem",
  alignItems: "center",
};

const chromeDotStyle: CSSProperties = {
  width: "0.625rem",
  height: "0.625rem",
  borderRadius: "999px",
  display: "inline-block",
};

const addressBarStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  fontSize: "0.75rem",
  color: "var(--color-text-muted)",
  border: "1px solid var(--color-border)",
  borderRadius: "999px",
  padding: "0.375rem 0.75rem",
  backgroundColor: "var(--color-bg-primary)",
};

const browserSurfaceStyle: CSSProperties = {
  border: "1px solid var(--color-border)",
  borderRadius: "1rem",
  backgroundColor: "var(--color-bg-primary)",
  color: "var(--color-text-primary)",
  display: "grid",
  minHeight: "11rem",
  overflow: "hidden",
};

const browserToolbarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.875rem 1rem",
  borderBottom: "1px solid var(--color-border)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
};

const tabBaseStyle: CSSProperties = {
  fontSize: "0.75rem",
  padding: "0.35rem 0.65rem",
  borderRadius: "999px",
};

const tabActiveStyle: CSSProperties = {
  ...tabBaseStyle,
  backgroundColor: "rgba(255,255,255,0.08)",
  color: "var(--color-text-primary)",
};

const tabMutedStyle: CSSProperties = {
  ...tabBaseStyle,
  backgroundColor: "transparent",
  color: "var(--color-text-muted)",
};

const browserContentStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.4fr) minmax(15rem, 0.9fr)",
  gap: "1rem",
  padding: "1rem",
  alignItems: "start",
};

const articleStyle: CSSProperties = {
  display: "grid",
  gap: "0.875rem",
  alignContent: "start",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1rem",
  fontWeight: 600,
  lineHeight: 1.3,
};

const bodyTextStyle: CSSProperties = {
  margin: 0,
  lineHeight: 1.6,
  fontSize: "0.875rem",
  color: "var(--color-text-secondary)",
};

const metaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  flexWrap: "wrap",
};

const metaBadgeStyle: CSSProperties = {
  fontSize: "0.6875rem",
  padding: "0.2rem 0.45rem",
  borderRadius: "999px",
  backgroundColor: "rgba(38, 132, 255, 0.12)",
  color: "var(--color-accent)",
};

const metaTextStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--color-text-muted)",
};

const sideCardStyle: CSSProperties = {
  border: "1px solid var(--color-border)",
  borderRadius: "0.875rem",
  padding: "0.875rem",
  display: "grid",
  gap: "0.875rem",
  backgroundColor: "rgba(255,255,255,0.02)",
};

const sideCardLabelStyle: CSSProperties = {
  fontSize: "0.6875rem",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const linkStyle: CSSProperties = {
  color: "var(--color-accent)",
  textDecoration: "underline",
  textUnderlineOffset: "0.2em",
  cursor: "pointer",
  fontSize: "0.8125rem",
};

const zoneButtonStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  padding: "0.625rem 0.875rem",
  backgroundColor: "var(--color-accent-subtle)",
  color: "var(--color-accent)",
  cursor: "pointer",
  textAlign: "left" as const,
  fontSize: "0.8125rem",
} satisfies CSSProperties;

const inputLabelStyle: CSSProperties = {
  display: "grid",
  gap: "0.375rem",
  fontSize: "0.75rem",
  color: "var(--color-text-muted)",
};

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  padding: "0.625rem 0.75rem",
  backgroundColor: "transparent",
  color: "var(--color-text-primary)",
  fontSize: "0.8125rem",
};

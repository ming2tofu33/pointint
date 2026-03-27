"use client";

import StudioBar from "@/components/StudioBar";
import ThemeToggle from "@/components/ThemeToggle";
import UploadZone from "@/components/UploadZone";
import { useStudio } from "@/lib/useStudio";

export default function StudioPage() {
  const { state, cursor, error, upload, setHotspot, setOffset, setScale, reset } =
    useStudio();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <StudioBar />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Toolbar */}
        <aside
          style={{
            width: "3.5rem",
            borderRight: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-secondary)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "1rem",
            gap: "0.5rem",
            flexShrink: 0,
          }}
        >
          {state === "editing" && (
            <>
              <ToolButton label="Move" active />
              <ToolButton label="Size" />
              <ToolButton label="Hot" />
              <ToolButton label="Rot" />
              <div style={{ flex: 1 }} />
              <ToolButton label="New" onClick={reset} />
            </>
          )}
        </aside>

        {/* Canvas Area */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--color-bg-primary)",
            position: "relative",
            gap: "1rem",
          }}
        >
          {state === "idle" && (
            <UploadZone onFile={upload} processing={false} />
          )}

          {state === "processing" && (
            <UploadZone onFile={upload} processing={true} />
          )}

          {state === "editing" && cursor && (
            <div
              style={{
                position: "relative",
                width: "256px",
                height: "256px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-tertiary)",
                backgroundImage:
                  "linear-gradient(45deg, var(--color-bg-secondary) 25%, transparent 25%, transparent 75%, var(--color-bg-secondary) 75%), linear-gradient(45deg, var(--color-bg-secondary) 25%, transparent 25%, transparent 75%, var(--color-bg-secondary) 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 8px 8px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={cursor.processedUrl}
                alt="Cursor preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  imageRendering: "pixelated",
                }}
                draggable={false}
              />
              {/* Hotspot marker */}
              <div
                style={{
                  position: "absolute",
                  left: `calc(50% + ${cursor.hotspotX}px)`,
                  top: `calc(50% + ${cursor.hotspotY}px)`,
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-accent)",
                  border: "1.5px solid #fff",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  boxShadow: "0 0 4px var(--color-accent-glow)",
                }}
              />
            </div>
          )}

          {error && (
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-error)",
              }}
            >
              {error}
            </p>
          )}
        </main>

        {/* Right Panel */}
        <aside
          style={{
            width: "16rem",
            borderLeft: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-secondary)",
            padding: "1.25rem",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {state === "editing" && cursor ? (
            <>
              <PanelSection title="Cursor">
                <PanelRow label="Original" value={`${cursor.width} × ${cursor.height}`} />
                <PanelRow label="Output" value="32 × 32" />
                <PanelRow
                  label="Hotspot"
                  value={`${cursor.hotspotX}, ${cursor.hotspotY}`}
                />
              </PanelSection>

              <PanelSection title="Preview">
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <PreviewChip label="Normal" active />
                  <PreviewChip label="Text" />
                  <PreviewChip label="Link" />
                </div>
              </PanelSection>

              <PanelSection title="Size">
                <input
                  type="range"
                  min="0.25"
                  max="3"
                  step="0.05"
                  value={cursor.scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  style={{
                    width: "100%",
                    accentColor: "var(--color-accent)",
                  }}
                />
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--color-text-muted)",
                    textAlign: "right",
                    marginTop: "0.25rem",
                  }}
                >
                  {Math.round(cursor.scale * 100)}%
                </div>
              </PanelSection>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text-muted)",
                fontSize: "0.8125rem",
              }}
            >
              Upload an image to start
            </div>
          )}
        </aside>
      </div>

      {/* Bottom Bar — Simulation */}
      <footer
        style={{
          height: "8rem",
          borderTop: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
          fontSize: "0.8125rem",
          flexShrink: 0,
        }}
      >
        {state === "editing" && cursor ? (
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <SimBox label="Normal" imageUrl={cursor.processedUrl} />
            <SimBox label="Text" imageUrl={cursor.processedUrl} />
            <SimBox label="Link" imageUrl={cursor.processedUrl} />
          </div>
        ) : (
          "Simulation preview"
        )}
      </footer>

      <ThemeToggle />
    </div>
  );
}

function ToolButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{
        width: "2.25rem",
        height: "2.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.625rem",
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        backgroundColor: active ? "var(--color-accent-subtle)" : "transparent",
        color: active ? "var(--color-accent)" : "var(--color-text-muted)",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "0.75rem",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function PanelRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.8125rem",
        marginBottom: "0.375rem",
      }}
    >
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--color-text-primary)" }}>{value}</span>
    </div>
  );
}

function PreviewChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      style={{
        fontSize: "0.6875rem",
        padding: "0.25rem 0.625rem",
        backgroundColor: active ? "var(--color-accent-subtle)" : "transparent",
        color: active ? "var(--color-accent)" : "var(--color-text-muted)",
        border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
        cursor: "pointer",
      }}
    >
      {label}
    </span>
  );
}

function SimBox({ label, imageUrl }: { label: string; imageUrl: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <div
        style={{
          width: "4rem",
          height: "4rem",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={imageUrl}
          alt={label}
          style={{
            width: "32px",
            height: "32px",
            objectFit: "contain",
            imageRendering: "pixelated",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "0.625rem",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

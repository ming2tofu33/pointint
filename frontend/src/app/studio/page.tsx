"use client";

import { useEffect, useState } from "react";
import CursorCanvas from "@/components/CursorCanvas";
import GuideModal from "@/components/GuideModal";
import HealthCheck from "@/components/HealthCheck";
import Simulation from "@/components/Simulation";
import StudioBar from "@/components/StudioBar";
import ThemeToggle from "@/components/ThemeToggle";
import UploadZone from "@/components/UploadZone";
import { useStudio } from "@/lib/useStudio";

type Tool = "move" | "hotspot";

export default function StudioPage() {
  const {
    state,
    cursor,
    error,
    downloading,
    showGuide,
    upload,
    setHotspot,
    setOffset,
    setScale,
    reset,
    download,
    closeGuide,
  } = useStudio();
  const [activeTool, setActiveTool] = useState<Tool>("move");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "v" || e.key === "V") setActiveTool("move");
      if (e.key === "h" || e.key === "H") setActiveTool("hotspot");
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <StudioBar
        onDownload={download}
        downloading={downloading}
        canDownload={state === "editing"}
      />

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
            gap: "0.25rem",
            flexShrink: 0,
          }}
        >
          {state === "editing" && (
            <>
              <ToolButton
                label="Move"
                shortcut="V"
                active={activeTool === "move"}
                onClick={() => setActiveTool("move")}
              />
              <ToolButton
                label="Hot"
                shortcut="H"
                active={activeTool === "hotspot"}
                onClick={() => setActiveTool("hotspot")}
              />
              <div style={{ flex: 1 }} />
              <ToolButton label="New" shortcut="" onClick={reset} />
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
          {state === "idle" && <UploadZone onFile={upload} processing={false} />}
          {state === "processing" && <UploadZone onFile={upload} processing={true} />}

          {state === "editing" && cursor && (
            <>
              <CursorCanvas
                imageUrl={cursor.processedUrl}
                offsetX={cursor.offsetX}
                offsetY={cursor.offsetY}
                scale={cursor.scale}
                hotspotX={cursor.hotspotX}
                hotspotY={cursor.hotspotY}
                onOffsetChange={setOffset}
                onHotspotChange={setHotspot}
                activeTool={activeTool}
              />
              <div
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--color-text-muted)",
                  display: "flex",
                  gap: "1.5rem",
                }}
              >
                <span>
                  {activeTool === "move" ? "Drag to move" : "Click to set hotspot"}
                </span>
                <span>V: Move</span>
                <span>H: Hotspot</span>
              </div>
            </>
          )}

          {error && (
            <p style={{ fontSize: "0.8125rem", color: "var(--color-error)" }}>
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
            overflowY: "auto",
          }}
        >
          {state === "editing" && cursor ? (
            <>
              <PanelSection title="Cursor">
                <PanelRow
                  label="Original"
                  value={`${cursor.width} × ${cursor.height}`}
                />
                <PanelRow label="Output" value="32 × 32" />
              </PanelSection>

              <PanelSection title="Hotspot">
                <PanelRow
                  label="Position"
                  value={`${cursor.hotspotX}, ${cursor.hotspotY}`}
                />
                <button
                  onClick={() => setHotspot(0, 0)}
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--color-text-muted)",
                    background: "none",
                    border: "1px solid var(--color-border)",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                    marginTop: "0.25rem",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-border)")
                  }
                >
                  Reset to 0, 0
                </button>
              </PanelSection>

              <PanelSection title="Scale">
                <input
                  type="range"
                  min="0.25"
                  max="3"
                  step="0.05"
                  value={cursor.scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--color-accent)" }}
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

              <PanelSection title="Position">
                <PanelRow label="Offset X" value={`${cursor.offsetX}`} />
                <PanelRow label="Offset Y" value={`${cursor.offsetY}`} />
                <button
                  onClick={() => setOffset(0, 0)}
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--color-text-muted)",
                    background: "none",
                    border: "1px solid var(--color-border)",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                    marginTop: "0.25rem",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-border)")
                  }
                >
                  Center
                </button>
              </PanelSection>

              <HealthCheck
                imageBlob={cursor.processedBlob}
                hotspotX={cursor.hotspotX}
                hotspotY={cursor.hotspotY}
              />
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
          height: "10rem",
          borderTop: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-secondary)",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {state === "editing" && cursor ? (
          <Simulation imageUrl={cursor.processedUrl} />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-muted)",
              fontSize: "0.8125rem",
            }}
          >
            Simulation preview
          </div>
        )}
      </footer>

      <ThemeToggle />
      <GuideModal open={showGuide} onClose={closeGuide} />
    </div>
  );
}

function ToolButton({
  label,
  shortcut,
  active,
  onClick,
}: {
  label: string;
  shortcut: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      title={shortcut ? `${label} (${shortcut})` : label}
      onClick={onClick}
      style={{
        width: "2.5rem",
        height: "2.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.5625rem",
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        backgroundColor: active ? "var(--color-accent-subtle)" : "transparent",
        color: active ? "var(--color-accent)" : "var(--color-text-muted)",
        transition: "all 0.15s",
        gap: "1px",
      }}
    >
      <span>{label}</span>
      {shortcut && (
        <span style={{ fontSize: "0.5rem", opacity: 0.6 }}>{shortcut}</span>
      )}
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


"use client";

import { CSSProperties, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import CursorCanvas from "@/components/CursorCanvas";
import GuideModal from "@/components/GuideModal";
import HealthCheck from "@/components/HealthCheck";
import MobileGuard from "@/components/MobileGuard";
import NameInput from "@/components/NameInput";
import Simulation from "@/components/Simulation";
import StudioBar from "@/components/StudioBar";
import UploadZone from "@/components/UploadZone";
import WorkflowPicker from "@/components/WorkflowPicker";
import { trackEvent } from "@/lib/analytics";
import { FitMode } from "@/lib/cursorFrame";
import { clearLandingFile, getLandingFile } from "@/lib/landingStore";
import { CursorSize, useStudio } from "@/lib/useStudio";

type Tool = "move" | "hotspot";

export default function StudioPage() {
  const {
    state,
    cursor,
    error,
    downloading,
    showGuide,
    showOriginal,
    previewUrl,
    selectFile,
    selectWorkflow,
    processBgRemoval,
    skipBgRemoval,
    toggleOriginal,
    retryBgRemoval,
    setHotspot,
    setOffset,
    setScale,
    setFitMode,
    setCursorSize,
    setCursorName,
    recommendHotspot,
    reset,
    download,
    closeGuide,
  } = useStudio();
  const [activeTool, setActiveTool] = useState<Tool>("move");
  const t = useTranslations("studio");
  const tp = useTranslations("panel");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    trackEvent("studio_entry", {
      source: "studio_page",
    });
  }, []);

  useEffect(() => {
    if (searchParams.get("fromLanding") !== "true") return;

    const file = getLandingFile();
    if (file) {
      selectFile(file);
      clearLandingFile();
    }

    router.replace("/studio");
  }, [searchParams, selectFile, router]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "v" || e.key === "V") setActiveTool("move");
      if (e.key === "h" || e.key === "H") setActiveTool("hotspot");
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const displayUrl =
    state === "editing" && cursor
      ? showOriginal
        ? cursor.originalUrl
        : cursor.processedUrl
      : "";

  return (
    <MobileGuard>
      <StudioBar
        onDownload={download}
        downloading={downloading}
        canDownload={state === "editing"}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
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
                label={t("move")}
                shortcut="V"
                active={activeTool === "move"}
                onClick={() => setActiveTool("move")}
              />
              <ToolButton
                label={t("hotspotShort")}
                shortcut="H"
                active={activeTool === "hotspot"}
                onClick={() => setActiveTool("hotspot")}
              />
              <div style={{ flex: 1 }} />
              <ToolButton label={t("new")} shortcut="" onClick={reset} />
            </>
          )}
        </aside>

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
          {state === "workflow-pick" && (
            <WorkflowPicker onSelectWorkflow={selectWorkflow} />
          )}

          {state === "cur-upload" && (
            <UploadZone onFile={selectFile} processing={false} />
          )}

          {state === "uploaded" && cursor && (
            <UploadZone
              onFile={selectFile}
              processing={false}
              showChoice
              previewUrl={cursor.originalUrl}
              onRemoveBg={processBgRemoval}
              onSkipBg={skipBgRemoval}
            />
          )}

          {state === "processing" && (
            <UploadZone onFile={selectFile} processing={true} />
          )}

          {state === "editing" && cursor && (
            <>
              <CursorCanvas
                imageUrl={displayUrl}
                sourceWidth={cursor.sourceWidth}
                sourceHeight={cursor.sourceHeight}
                fitMode={cursor.fitMode}
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
                  alignItems: "center",
                }}
              >
                <span>
                  {activeTool === "move"
                    ? t("dragToMove")
                    : t("clickToSetHotspot")}
                </span>
                <span>{t("shortcutMove")}</span>
                <span>{t("shortcutHotspot")}</span>

                <button
                  onClick={toggleOriginal}
                  style={{
                    fontSize: "0.6875rem",
                    color: showOriginal
                      ? "var(--color-accent)"
                      : "var(--color-text-muted)",
                    background: "none",
                    border: "1px solid var(--color-border)",
                    padding: "0.125rem 0.5rem",
                    cursor: "pointer",
                  }}
                >
                  {showOriginal ? t("showProcessed") : t("showOriginal")}
                </button>

                <button
                  onClick={retryBgRemoval}
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--color-text-muted)",
                    background: "none",
                    border: "1px solid var(--color-border)",
                    padding: "0.125rem 0.5rem",
                    cursor: "pointer",
                  }}
                >
                  {t("retryBg")}
                </button>
              </div>
            </>
          )}

          {error && (
            <p
              role="alert"
              style={{ fontSize: "0.8125rem", color: "var(--color-error)" }}
            >
              {error}
            </p>
          )}
        </main>

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
              {previewUrl && (
                <PanelSection title={tp("actualSize")}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <ActualSizePreview
                      background="#ffffff"
                      border="1px solid var(--color-border)"
                      alt={tp("lightPreview")}
                      previewUrl={previewUrl}
                      cursorSize={cursor.cursorSize}
                    />
                    <ActualSizePreview
                      background="#1a1a1a"
                      border="1px solid var(--color-border)"
                      alt={tp("darkPreview")}
                      previewUrl={previewUrl}
                      cursorSize={cursor.cursorSize}
                    />
                  </div>
                </PanelSection>
              )}

              <PanelSection title={tp("cursor")}>
                <PanelRow
                  label={tp("original")}
                  value={`${cursor.sourceWidth} × ${cursor.sourceHeight}`}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.8125rem",
                    marginBottom: "0.375rem",
                  }}
                >
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    {tp("output")}
                  </span>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    {([32, 48, 64] as CursorSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => setCursorSize(size)}
                        style={{
                          fontSize: "0.6875rem",
                          padding: "0.125rem 0.375rem",
                          border: `1px solid ${cursor.cursorSize === size ? "var(--color-accent)" : "var(--color-border)"}`,
                          backgroundColor:
                            cursor.cursorSize === size
                              ? "var(--color-accent-subtle)"
                              : "transparent",
                          color:
                            cursor.cursorSize === size
                              ? "var(--color-accent)"
                              : "var(--color-text-muted)",
                          cursor: "pointer",
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </PanelSection>

              <PanelSection title={tp("framing")}>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
                >
                  <FitModeButton
                    mode="contain"
                    active={cursor.fitMode === "contain"}
                    onClick={() => setFitMode("contain")}
                  />
                  <FitModeButton
                    mode="cover"
                    active={cursor.fitMode === "cover"}
                    onClick={() => setFitMode("cover")}
                  />
                </div>
              </PanelSection>

              <PanelSection title={tp("name")}>
                <NameInput
                  value={cursor.cursorName}
                  onChange={setCursorName}
                  placeholder={tp("namePlaceholder")}
                />
              </PanelSection>

              <PanelSection title={tp("hotspot")}>
                <PanelRow
                  label={tp("position")}
                  value={`${cursor.hotspotX}, ${cursor.hotspotY}`}
                />
                <PanelRow
                  label={tp("status")}
                  value={
                    cursor.hotspotMode === "auto"
                      ? tp("recommended")
                      : tp("manual")
                  }
                />
                <button
                  onClick={recommendHotspot}
                  style={panelActionButtonStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-border)")
                  }
                >
                  {cursor.hotspotMode === "auto"
                    ? tp("recommendHotspotAgain")
                    : tp("recommendHotspot")}
                </button>
                <button
                  onClick={() => setHotspot(0, 0)}
                  style={panelActionButtonStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-border)")
                  }
                >
                  {tp("resetHotspot")}
                </button>
              </PanelSection>

              <PanelSection title={tp("scale")}>
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

              <PanelSection title={tp("position")}>
                <PanelRow label={tp("offsetX")} value={`${cursor.offsetX}`} />
                <PanelRow label={tp("offsetY")} value={`${cursor.offsetY}`} />
                <button
                  onClick={() => setOffset(0, 0)}
                  style={panelActionButtonStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-border)")
                  }
                >
                  {tp("center")}
                </button>
              </PanelSection>

              <HealthCheck
                imageBlob={cursor.renderedBlob}
                hotspotX={cursor.renderedHotspotX}
                hotspotY={cursor.renderedHotspotY}
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
              {t("uploadToStart")}
            </div>
          )}
        </aside>
      </div>

      <footer
        style={{
          height: "10rem",
          borderTop: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-secondary)",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {state === "editing" && cursor && previewUrl && cursor.renderedBlob ? (
          <Simulation
            imageUrl={previewUrl}
            hotspotX={cursor.renderedHotspotX}
            hotspotY={cursor.renderedHotspotY}
          />
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
            {t("simulationPreview")}
          </div>
        )}
      </footer>

      <GuideModal open={showGuide} onClose={closeGuide} />
    </MobileGuard>
  );
}

function ActualSizePreview({
  background,
  border,
  alt,
  previewUrl,
  cursorSize,
}: {
  background: string;
  border: string;
  alt: string;
  previewUrl: string;
  cursorSize: CursorSize;
}) {
  return (
    <div
      style={{
        width: "4rem",
        height: "4rem",
        backgroundColor: background,
        border,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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

function FitModeButton({
  mode,
  active,
  onClick,
}: {
  mode: FitMode;
  active: boolean;
  onClick: () => void;
}) {
  const t = useTranslations("panel");
  const label = mode === "contain" ? t("fitContain") : t("fitCover");
  const sub = mode === "contain" ? t("fitContainSub") : t("fitCoverSub");

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.125rem",
        width: "100%",
        padding: "0.625rem 0.75rem",
        backgroundColor: active
          ? "var(--color-accent-subtle)"
          : "transparent",
        border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
        color: active ? "var(--color-accent)" : "var(--color-text-primary)",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>
        {sub}
      </span>
    </button>
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
      aria-label={shortcut ? `${label} (${shortcut})` : label}
      onClick={onClick}
      style={{
        width: "2.75rem",
        height: "2.75rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.5625rem",
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
        backgroundColor: active
          ? "var(--color-accent-subtle)"
          : "transparent",
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

const panelActionButtonStyle: CSSProperties = {
  fontSize: "0.6875rem",
  color: "var(--color-text-muted)",
  background: "none",
  border: "1px solid var(--color-border)",
  padding: "0.25rem 0.5rem",
  cursor: "pointer",
  marginTop: "0.25rem",
  transition: "border-color 0.15s",
};

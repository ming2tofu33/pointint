"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import CursorCanvas from "@/components/CursorCanvas";
import GuideModal from "@/components/GuideModal";
import HealthCheck from "@/components/HealthCheck";
import Simulation from "@/components/Simulation";
import StudioBar from "@/components/StudioBar";
import MobileGuard from "@/components/MobileGuard";
import SettingsBar from "@/components/SettingsBar";
import UploadZone from "@/components/UploadZone";
import { useStudio, CursorSize } from "@/lib/useStudio";

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
    processBgRemoval,
    skipBgRemoval,
    toggleOriginal,
    retryBgRemoval,
    setHotspot,
    setOffset,
    setScale,
    setCursorSize,
    setCursorName,
    reset,
    download,
    closeGuide,
  } = useStudio();
  const [activeTool, setActiveTool] = useState<Tool>("move");
  const t = useTranslations("studio");
  const tp = useTranslations("panel");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "v" || e.key === "V") setActiveTool("move");
      if (e.key === "h" || e.key === "H") setActiveTool("hotspot");
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // 편집 모드에서 보여줄 이미지 URL (UX-4: 원본/결과 토글)
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
          {/* UX-1: idle → 업로드 존 */}
          {state === "idle" && (
            <UploadZone onFile={selectFile} processing={false} />
          )}

          {/* UX-1: uploaded → 배경 제거 선택 */}
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

          {/* 배경 제거 처리 중 */}
          {state === "processing" && (
            <UploadZone onFile={selectFile} processing={true} />
          )}

          {/* 편집 모드 */}
          {state === "editing" && cursor && (
            <>
              <CursorCanvas
                imageUrl={displayUrl}
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

                {/* UX-4: 원본/결과 토글 */}
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

                {/* UX-4: 배경 제거 재시도 */}
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
              {/* UX-3: 실제 크기 미리보기 */}
              {previewUrl && (
                <PanelSection title={tp("actualSize")}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <div
                      style={{
                        width: "4rem",
                        height: "4rem",
                        backgroundColor: "#ffffff",
                        border: "1px solid var(--color-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={previewUrl}
                        alt={tp("lightPreview")}
                        style={{
                          width: `${cursor.cursorSize}px`,
                          height: `${cursor.cursorSize}px`,
                          imageRendering: "pixelated",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        width: "4rem",
                        height: "4rem",
                        backgroundColor: "#1a1a1a",
                        border: "1px solid var(--color-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={previewUrl}
                        alt={tp("darkPreview")}
                        style={{
                          width: `${cursor.cursorSize}px`,
                          height: `${cursor.cursorSize}px`,
                          imageRendering: "pixelated",
                        }}
                      />
                    </div>
                  </div>
                </PanelSection>
              )}

              <PanelSection title={tp("cursor")}>
                <PanelRow
                  label={tp("original")}
                  value={`${cursor.width} × ${cursor.height}`}
                />
                {/* UX-5: 커서 크기 선택 */}
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
                    {([32, 48, 64] as CursorSize[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setCursorSize(s)}
                        style={{
                          fontSize: "0.6875rem",
                          padding: "0.125rem 0.375rem",
                          border: `1px solid ${cursor.cursorSize === s ? "var(--color-accent)" : "var(--color-border)"}`,
                          backgroundColor:
                            cursor.cursorSize === s
                              ? "var(--color-accent-subtle)"
                              : "transparent",
                          color:
                            cursor.cursorSize === s
                              ? "var(--color-accent)"
                              : "var(--color-text-muted)",
                          cursor: "pointer",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </PanelSection>

              {/* UX-6: 파일명 */}
              <PanelSection title={tp("name")}>
                <input
                  type="text"
                  value={cursor.cursorName}
                  onChange={(e) => setCursorName(e.target.value)}
                  placeholder={tp("namePlaceholder")}
                  style={{
                    width: "100%",
                    fontSize: "0.8125rem",
                    padding: "0.375rem 0.5rem",
                    backgroundColor: "var(--color-input-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                />
              </PanelSection>

              <PanelSection title={tp("hotspot")}>
                <PanelRow
                  label={tp("position")}
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
                  {tp("center")}
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
              {t("uploadToStart")}
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
          <Simulation
            imageUrl={previewUrl || cursor.processedUrl}
            hotspotX={cursor.hotspotX}
            hotspotY={cursor.hotspotY}
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

      <SettingsBar />
      <GuideModal open={showGuide} onClose={closeGuide} />
    </MobileGuard>
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

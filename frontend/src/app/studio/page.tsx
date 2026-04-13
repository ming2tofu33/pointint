"use client";

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import CursorCanvas from "@/components/CursorCanvas";
import AniEditorShell from "@/components/AniEditorShell";
import AniSimulation from "@/components/AniSimulation";
import GuideModal from "@/components/GuideModal";
import HealthCheck from "@/components/HealthCheck";
import MobileGuard from "@/components/MobileGuard";
import NameInput from "@/components/NameInput";
import SlotRail from "@/components/SlotRail";
import Simulation from "@/components/Simulation";
import SimulationFooter from "@/components/SimulationFooter";
import StudioBar from "@/components/StudioBar";
import UploadZone from "@/components/UploadZone";
import { trackEvent } from "@/lib/analytics";
import { FitMode } from "@/lib/cursorFrame";
import { clearLandingFile, getLandingFile } from "@/lib/landingStore";
import { buildProjectSlotSimulationSources } from "@/lib/slotSimulationSources";
import { CursorSize, useStudio } from "@/lib/useStudio";

type Tool = "move" | "hotspot";

export default function StudioPage() {
  const {
    state,
    project,
    selectedSlotId,
    cursor,
    ani,
    error,
    downloading,
    showGuide,
    showOriginal,
    previewUrl,
    selectFile,
    selectAniFile,
    selectSlot,
    selectSelectedSlotStaticFile,
    selectSelectedSlotAnimatedFile,
    processBgRemoval,
    skipBgRemoval,
    toggleOriginal,
    retryBgRemoval,
    setHotspot,
    setOffset,
    setScale,
    setFitMode,
    setCursorSize,
    setAniCursorSize,
    setCursorName,
    recommendHotspot,
    reset,
    download,
    closeGuide,
  } = useStudio();
  const [activeTool, setActiveTool] = useState<Tool>("move");
  const [simulationCollapsed, setSimulationCollapsed] = useState(false);
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
  const selectedSlot = project.slots[selectedSlotId];
  const selectedSlotBound = Boolean(
    selectedSlot.asset.originalUrl ||
      selectedSlot.asset.previewUrl ||
      cursor ||
      ani
  );
  const normalSlot = project.slots.normal;
  const normalSlotBound = Boolean(
    normalSlot.asset.originalUrl ||
      normalSlot.asset.previewUrl ||
      (selectedSlotId === "normal" && (cursor || ani))
  );
  const slotSimulationSources = useMemo(
    () => buildProjectSlotSimulationSources(project),
    [project]
  );
  const showSlotSourceEntry =
    state !== "uploaded" && state !== "processing" && !selectedSlotBound;
  const showToolRail =
    selectedSlotBound && (state === "editing" || state === "ani-editing");

  return (
    <MobileGuard>
      <div data-testid="studio-theme-scope" style={studioThemeScopeStyle}>
        <StudioBar
          onDownload={download}
          downloading={downloading}
          canDownload={
            (state === "editing" || state === "ani-editing") &&
            selectedSlotBound &&
            normalSlotBound
          }
          actionLabel={state === "ani-editing" ? t("exportAni") : undefined}
        />

        {state === "ani-editing" ? (
          <AniEditorShell
            ani={ani}
            imageUrl={ani?.originalUrl ?? ""}
            project={project}
            selectedSlotId={selectedSlotId}
            error={error}
            activeTool={activeTool}
            onSetActiveTool={setActiveTool}
            onSelectSlot={selectSlot}
            onSelectSlotStaticFile={selectSelectedSlotStaticFile}
            onSelectSlotAnimatedFile={selectSelectedSlotAnimatedFile}
            onOffsetChange={setOffset}
            onHotspotChange={setHotspot}
            onScaleChange={setScale}
            onFitModeChange={setFitMode}
            onAniCursorSizeChange={setAniCursorSize}
            onAniNameChange={setCursorName}
            onRecommendHotspot={recommendHotspot}
            onResetHotspot={() => setHotspot(0, 0)}
            onReset={reset}
          />
        ) : (
          <>
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
          {showToolRail && (
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
            alignItems:
              state === "uploaded" ||
              state === "processing"
                ? "center"
                : "stretch",
            justifyContent:
              state === "uploaded" ||
              state === "processing"
                ? "center"
                : "flex-start",
            backgroundColor: "var(--color-bg-primary)",
            position: "relative",
            minWidth: 0,
          }}
        >
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

      {state === "editing" && (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                width: "100%",
                display: "flex",
                flexDirection: "row",
                overflow: "hidden",
              }}
            >
              <SlotRail
                project={project}
                selectedSlotId={selectedSlotId}
                onSelectSlot={selectSlot}
              />

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showSlotSourceEntry ? (
                  <SlotEmptyState
                    slotId={selectedSlotId}
                    onStaticFile={selectSelectedSlotStaticFile}
                    onAnimatedFile={selectSelectedSlotAnimatedFile}
                  />
                ) : selectedSlotBound && cursor ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "1rem",
                      flex: "1 1 58%",
                      minHeight: 0,
                    }}
                  >
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
                        flexWrap: "wrap",
                        justifyContent: "center",
                        padding: "0 1rem 1rem",
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
                  </div>
                ) : null}

                {selectedSlotBound && cursor && previewUrl && cursor.renderedBlob ? (
                  <SimulationFooter
                    collapsed={simulationCollapsed}
                    onToggle={() => setSimulationCollapsed((current) => !current)}
                  >
                    <Simulation
                      imageUrl={previewUrl}
                      cursorSize={cursor.cursorSize}
                      hotspotX={cursor.renderedHotspotX}
                      hotspotY={cursor.renderedHotspotY}
                      slotSources={slotSimulationSources}
                      selectedSlotId={selectedSlotId}
                    />
                  </SimulationFooter>
                ) : null}
              </div>
            </div>
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
          {state === "editing" && cursor && selectedSlotBound ? (
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
        </>
      )}

      <GuideModal
        open={showGuide}
        onClose={closeGuide}
      />
      </div>
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

function SlotEmptyState({
  slotId,
  onStaticFile,
  onAnimatedFile,
}: {
  slotId: "normal" | "text" | "link" | "button";
  onStaticFile: (file: File) => void;
  onAnimatedFile: (file: File) => void;
}) {
  const t = useTranslations("studio");
  const slotLabel = t(`slot${capitalizeSlotId(slotId)}`);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  return (
    <div
      data-testid="studio-empty-slot-state"
      style={{
        width: "min(52rem, 100%)",
        minHeight: "20rem",
        border: "1px solid var(--color-border)",
        borderRadius: "1rem",
        backgroundColor: "rgba(255,255,255,0.025)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1.5rem",
        color: "var(--color-text-muted)",
        textAlign: "left",
        lineHeight: 1.6,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <div
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {slotLabel} {t("slotLabelSuffix")}
        </div>
        <div
          style={{ fontSize: "0.8125rem" }}
        >
          {t("emptySlotDescription")}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
          gap: "1rem",
        }}
      >
        <SlotUploadChoice
          title={t("emptySlotStaticStart")}
          description={t("slotStaticUploadSub")}
          mode="cur"
          onFile={onStaticFile}
        />
        <SlotUploadChoice
          title={t("emptySlotAnimatedStart")}
          description={t("slotAniUploadSub")}
          mode="ani"
          onFile={onAnimatedFile}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <button
          type="button"
          onClick={() => setShowMoreOptions((current) => !current)}
          style={{
            alignSelf: "flex-start",
            background: "none",
            border: "none",
            color: "var(--color-text-secondary)",
            fontSize: "0.75rem",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {t("moreSourceOptions")}
        </button>

        {showMoreOptions ? (
          <div
            style={{
              display: "grid",
              gap: "0.625rem",
              borderTop: "1px solid var(--color-border)",
              paddingTop: "0.875rem",
            }}
          >
            <SoonSourceRow
              title={t("emptySlotMultiplePngs")}
              badge={t("soon")}
            />
            <SoonSourceRow
              title={t("emptySlotAiGenerate")}
              badge={t("soon")}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SlotUploadChoice({
  title,
  description,
  mode,
  onFile,
}: {
  title: string;
  description: string;
  mode: "cur" | "ani";
  onFile: (file: File) => void;
}) {
  const tu = useTranslations("upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const accept = mode === "ani" ? ".gif" : ".png,.jpg,.jpeg,.webp";
  const isInteractiveActive = isDragActive || isHovered;
  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFile(file);
    }
  };

  return (
    <button
      type="button"
      aria-label={title}
      onClick={() => inputRef.current?.click()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={(event) => {
        event.preventDefault();
        if (!isDragActive) {
          setIsDragActive(true);
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDragActive(false);
        }
      }}
      onDrop={handleDrop}
      style={{
        border: isInteractiveActive
          ? "1px solid color-mix(in srgb, var(--color-accent-primary) 56%, white 8%)"
          : "1px solid var(--color-border)",
        borderRadius: "0.875rem",
        minHeight: "15rem",
        padding: "1.125rem",
        backgroundColor: isInteractiveActive ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "flex-start",
        textAlign: "left",
        cursor: "pointer",
        transition: "border-color 160ms ease, background-color 160ms ease",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
          {title}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
          {description}
        </div>
      </div>

      <div
        style={{
          width: "100%",
          minHeight: "9.75rem",
          border: isInteractiveActive
            ? "1px dashed color-mix(in srgb, var(--color-accent-primary) 68%, white 12%)"
            : "1px dashed var(--color-border)",
          backgroundColor: isInteractiveActive ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.02)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.625rem",
          padding: "1.125rem",
          transition: "border-color 160ms ease, background-color 160ms ease",
        }}
      >
        <div
          style={{
            fontSize: "1.75rem",
            lineHeight: 1,
            color: isInteractiveActive ? "var(--color-accent-primary)" : "var(--color-text-muted)",
          }}
        >
          +
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {mode === "ani" ? tu("aniDropOrClick") : tu("dropOrClick")}
        </div>
        <div
          style={{
            fontSize: "0.6875rem",
            color: "var(--color-text-muted)",
          }}
        >
          {mode === "ani" ? tu("aniFormats") : tu("formats")}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFile(file);
          }
          event.currentTarget.value = "";
        }}
        style={{ display: "none" }}
      />
    </button>
  );
}

function SoonSourceRow({
  title,
  badge,
}: {
  title: string;
  badge: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        border: "1px solid var(--color-border)",
        borderRadius: "0.75rem",
        padding: "0.75rem 0.875rem",
        backgroundColor: "rgba(255,255,255,0.02)",
      }}
    >
      <span style={{ fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>
        {title}
      </span>
      <span
        style={{
          fontSize: "0.625rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: "var(--color-text-muted)",
        }}
      >
        {badge}
      </span>
    </div>
  );
}

function capitalizeSlotId(slotId: "normal" | "text" | "link" | "button" | undefined) {
  if (!slotId) return "Slot";
  return `${slotId.slice(0, 1).toUpperCase()}${slotId.slice(1)}`;
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

const studioThemeScopeStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: "calc(100dvh - var(--app-header-height, 4.25rem))",
  backgroundColor: "var(--studio-bg-primary)",
  ["--color-bg-primary" as string]: "var(--studio-bg-primary)",
  ["--color-bg-secondary" as string]: "var(--studio-bg-secondary)",
  ["--color-bg-tertiary" as string]: "var(--studio-bg-tertiary)",
  ["--color-bg-card" as string]: "var(--studio-bg-secondary)",
  ["--color-input-surface" as string]: "var(--studio-bg-tertiary)",
  ["--color-border" as string]: "var(--studio-border)",
  ["--color-text-primary" as string]: "var(--studio-text-primary)",
  ["--color-text-secondary" as string]: "var(--studio-text-secondary)",
  ["--color-text-muted" as string]: "var(--studio-text-muted)",
  ["--color-shadow" as string]: "rgba(0, 0, 0, 0.42)",
};

"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import CursorCanvas from "@/components/CursorCanvas";
import AniEditorShell from "@/components/AniEditorShell";
import AniSimulation from "@/components/AniSimulation";
import GuideModal from "@/components/GuideModal";
import HealthCheck from "@/components/HealthCheck";
import MobileGuard from "@/components/MobileGuard";
import NameInput from "@/components/NameInput";
import SimulationBackgroundModeSwitch from "@/components/SimulationBackgroundModeSwitch";
import SlotRail from "@/components/SlotRail";
import SlotSourceChoiceCard from "@/components/SlotSourceChoiceCard";
import Simulation from "@/components/Simulation";
import SimulationFooter from "@/components/SimulationFooter";
import SlotReplacementSurface from "@/components/SlotReplacementSurface";
import StudioBar from "@/components/StudioBar";
import StudioInspector, {
  StudioInspectorCompactGuidance,
  StudioInspectorEmptyNotice,
  StudioInspectorRow,
  StudioInspectorSecondaryButton,
  StudioInspectorSection,
  StudioInspectorSegmentedControl,
} from "@/components/StudioInspector";
import StudioStageActionBar from "@/components/StudioStageActionBar";
import StudioStageHeader from "@/components/StudioStageHeader";
import UploadZone from "@/components/UploadZone";
import {
  STUDIO_INTERACTION_TRANSITION,
  StudioShellInteractionStyles,
} from "@/components/StudioSurfaceCard";
import type { BackgroundMode } from "@/components/CursorSimulationSurface";
import { trackEvent } from "@/lib/analytics";
import { FitMode } from "@/lib/cursorFrame";
import { clearLandingFile, getLandingFile } from "@/lib/landingStore";
import {
  buildProjectSlotSimulationSources,
  hasNormalSlotSimulationSource,
} from "@/lib/slotSimulationSources";
import { CursorSize, useStudio } from "@/lib/useStudio";

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
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    canDownloadAll,
    canDownload,
    downloadAll,
    download,
    closeGuide,
  } = useStudio();
  const [hotspotPickActive, setHotspotPickActive] = useState(false);
  const [simulationCollapsed, setSimulationCollapsed] = useState(false);
  const [simulationBackgroundMode, setSimulationBackgroundMode] =
    useState<BackgroundMode>("dark");
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
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      const isCommandModifier = e.ctrlKey || e.metaKey;

      if (isCommandModifier && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
          return;
        }
        undo();
        return;
      }

      if (isCommandModifier && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redo();
        return;
      }

      if (e.key === "h" || e.key === "H") {
        setHotspotPickActive(true);
      }
      if (e.key === "Escape") {
        setHotspotPickActive(false);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [redo, undo]);

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
  const stageSlotLabel = t(`slot${capitalizeSlotId(selectedSlotId)}`);
  const stageTypeLabel = selectedSlot.kind ? selectedSlot.kind.toUpperCase() : "CUR";
  const stageHotspotBadge =
    state === "editing" && cursor
      ? cursor.hotspotMode === "auto"
        ? t("recommended")
        : t("manual")
      : null;
  const stageGuidance = cursor
    ? [
        hotspotPickActive ? t("clickToSetHotspot") : t("dragToMove"),
        t("shortcutHotspot"),
      ]
    : [t("emptySlotDescription")];
  const stageActions = [
    {
      id: "studio-undo",
      label: t("undo"),
      onClick: undo,
      disabled: !canUndo,
      title: t("undoShortcut"),
      ariaLabel: t("undoShortcut"),
    },
    {
      id: "studio-redo",
      label: t("redo"),
      onClick: redo,
      disabled: !canRedo,
      title: t("redoShortcut"),
      ariaLabel: t("redoShortcut"),
    },
    {
      id: "studio-pick-hotspot",
      label: hotspotPickActive ? t("clickToSetHotspot") : tp("hotspot"),
      onClick: () => setHotspotPickActive((current) => !current),
      disabled: !cursor,
      title: hotspotPickActive ? t("clickToSetHotspot") : tp("hotspot"),
      ariaLabel: hotspotPickActive ? t("clickToSetHotspot") : tp("hotspot"),
    },
    {
      id: "studio-toggle-original",
      label: showOriginal ? t("showProcessed") : t("showOriginal"),
      onClick: toggleOriginal,
      disabled: !cursor,
      title: showOriginal ? t("showProcessed") : t("showOriginal"),
      ariaLabel: showOriginal ? t("showProcessed") : t("showOriginal"),
    },
    {
      id: "studio-retry-bg",
      label: t("retryBg"),
      onClick: retryBgRemoval,
      disabled: !cursor,
      title: t("retryBg"),
      ariaLabel: t("retryBg"),
    },
  ];
  const slotSimulationSources = useMemo(
    () => buildProjectSlotSimulationSources(project),
    [project]
  );
  const hasSimulationNormal = hasNormalSlotSimulationSource(slotSimulationSources);
  const showSlotSourceEntry =
    state !== "uploaded" && state !== "processing" && !selectedSlotBound;
  const showCompactInspectorGuidance =
    !selectedSlotBound || state === "uploaded" || state === "processing";

  return (
    <MobileGuard>
      <div
        data-testid="studio-theme-scope"
        data-studio-shell
        style={studioThemeScopeStyle}
      >
        <StudioShellInteractionStyles />
        <StudioBar
          onDownload={downloadAll}
          onSecondaryDownload={download}
          downloading={downloading}
          canDownload={canDownloadAll}
          canSecondaryDownload={canDownload}
          primaryActionLabel="Download all roles"
          secondaryActionLabel="Download current slot"
        />

        {state === "ani-editing" ? (
          <AniEditorShell
            ani={ani}
            imageUrl={ani?.originalUrl ?? ""}
            project={project}
            selectedSlotId={selectedSlotId}
            error={error}
            hotspotPickActive={hotspotPickActive}
            onSetHotspotPickActive={setHotspotPickActive}
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
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onResetHotspot={() => setHotspot(0, 0)}
            onReset={reset}
          />
        ) : (
          <>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
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
                  backgroundColor: "var(--color-bg-primary)",
                }}
              >
                {showSlotSourceEntry ? (
                  <div
                    style={{
                      flex: 1,
                      minHeight: 0,
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "2rem 2.25rem",
                    }}
                  >
                    <SlotEmptyState
                      slotId={selectedSlotId}
                      onStaticFile={selectSelectedSlotStaticFile}
                      onAnimatedFile={selectSelectedSlotAnimatedFile}
                    />
                  </div>
                ) : selectedSlotBound && cursor ? (
                  <SlotReplacementSurface
                    onStaticFile={selectSelectedSlotStaticFile}
                    onAnimatedFile={selectSelectedSlotAnimatedFile}
                    style={{
                      flex: 1,
                      minHeight: 0,
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      padding: "1.25rem 1.25rem 0.875rem",
                      gap: "1rem",
                    }}
                  >
                    <StudioStageHeader
                      slotLabel={stageSlotLabel}
                      typeLabel={stageTypeLabel}
                      cursorName={cursor.cursorName}
                      statusBadge={stageHotspotBadge}
                      style={{ padding: 0 }}
                    />

                    <div
                      style={{
                        flex: 1,
                        minHeight: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
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
                          hotspotPickActive={hotspotPickActive}
                          onHotspotPickComplete={() => setHotspotPickActive(false)}
                        />
                      </div>
                    </div>

                    <div
                      data-testid="studio-stage-actions"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                        borderTop: "1px solid var(--color-border)",
                        paddingTop: "0.875rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--color-text-muted)",
                          display: "flex",
                          gap: "1rem",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        {stageGuidance.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>

                      <StudioStageActionBar actions={stageActions} />
                    </div>
                  </SlotReplacementSurface>
                ) : null}

                {hasSimulationNormal ? (
                  <SimulationFooter
                    collapsed={simulationCollapsed}
                    onToggle={() => setSimulationCollapsed((current) => !current)}
                    headerControls={
                      <SimulationBackgroundModeSwitch
                        value={simulationBackgroundMode}
                        onChange={setSimulationBackgroundMode}
                      />
                    }
                  >
                    <Simulation
                      imageUrl={selectedSlotBound && cursor && previewUrl ? previewUrl : null}
                      cursorSize={selectedSlotBound && cursor ? cursor.cursorSize : 32}
                      hotspotX={
                        selectedSlotBound && cursor ? cursor.renderedHotspotX : 0
                      }
                      hotspotY={
                        selectedSlotBound && cursor ? cursor.renderedHotspotY : 0
                      }
                      slotSources={slotSimulationSources}
                      selectedSlotId={selectedSlotId}
                      backgroundMode={simulationBackgroundMode}
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

        <StudioInspector
          style={{
            width: showCompactInspectorGuidance ? "13rem" : "16rem",
            borderLeft: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-secondary)",
            padding: "1.25rem",
            flexShrink: 0,
            overflowY: "auto",
          }}
          summary={
            state === "editing" && cursor && selectedSlotBound ? (
              <div style={{ display: "grid", gap: "0.375rem" }}>
                <StudioInspectorRow label={t("slotRailTitle")} value={stageSlotLabel} />
                <StudioInspectorRow label={tp("cursor")} value={cursor.cursorName} />
                <StudioInspectorRow
                  label={t("slotFilled")}
                  value={
                    selectedSlot.kind
                      ? selectedSlot.kind.toUpperCase()
                      : t("slotKindUnset")
                  }
                />
              </div>
            ) : showCompactInspectorGuidance ? (
              <StudioInspectorCompactGuidance
                title={t("slotEmptyTitle")}
                summary={t("emptySlotDescription")}
                lines={[t("slotStaticUploadSub"), t("slotAniUploadSub")]}
              />
            ) : (
              <StudioInspectorEmptyNotice
                slotLabel={stageSlotLabel}
                title={t("slotEmptyTitle")}
                summary={t("emptySlotDescription")}
                expectedControlsTitle={t("inspectorExpectedControlsTitle")}
                expectedControls={[
                  tp("output"),
                  tp("framing"),
                  tp("name"),
                  tp("hotspot"),
                  tp("scale"),
                  tp("position"),
                ]}
                formatGuidanceTitle={t("inspectorFormatGuidanceTitle")}
                formatGuidance={[
                  t("slotStaticUploadSub"),
                  t("slotAniUploadSub"),
                ]}
              />
            )
          }
          previews={
            state === "editing" && cursor && selectedSlotBound && previewUrl ? (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "0.5rem",
                  }}
                >
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
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  {tp("actualSize")}
                </div>
              </div>
            ) : null
          }
        >
          {state === "editing" && cursor && selectedSlotBound ? (
            <>
              <StudioInspectorSection title={tp("output")}>
                <StudioInspectorRow
                  label={tp("original")}
                  value={`${cursor.sourceWidth} x ${cursor.sourceHeight}`}
                />
                <StudioInspectorSegmentedControl
                  value={cursor.cursorSize}
                  options={[32, 48, 64] as const}
                  onChange={setCursorSize}
                  ariaLabel={tp("output")}
                  getLabel={(size) => `${size}`}
                />
              </StudioInspectorSection>

              <StudioInspectorSection title={tp("framing")}>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <StudioInspectorSecondaryButton
                    onClick={() => setFitMode("contain")}
                    style={
                      cursor.fitMode === "contain"
                        ? {
                            borderColor: "var(--color-accent)",
                            backgroundColor: "var(--color-accent-subtle)",
                            color: "var(--color-accent)",
                          }
                        : undefined
                    }
                  >
                    {tp("fitContain")}
                  </StudioInspectorSecondaryButton>
                  <StudioInspectorSecondaryButton
                    onClick={() => setFitMode("cover")}
                    style={
                      cursor.fitMode === "cover"
                        ? {
                            borderColor: "var(--color-accent)",
                            backgroundColor: "var(--color-accent-subtle)",
                            color: "var(--color-accent)",
                          }
                        : undefined
                    }
                  >
                    {tp("fitCover")}
                  </StudioInspectorSecondaryButton>
                </div>
              </StudioInspectorSection>

              <StudioInspectorSection title={tp("name")}>
                <NameInput
                  value={cursor.cursorName}
                  onChange={setCursorName}
                  placeholder={tp("namePlaceholder")}
                />
              </StudioInspectorSection>

              <StudioInspectorSection title={tp("hotspot")}>
                <StudioInspectorRow
                  label={tp("position")}
                  value={`${cursor.hotspotX}, ${cursor.hotspotY}`}
                />
                <StudioInspectorRow
                  label={tp("status")}
                  value={cursor.hotspotMode === "auto" ? tp("recommended") : tp("manual")}
                />
              </StudioInspectorSection>

              <StudioInspectorSection title={tp("scale")}>
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
              </StudioInspectorSection>

              <StudioInspectorSection title={tp("position")}>
                <StudioInspectorRow label={tp("offsetX")} value={`${cursor.offsetX}`} />
                <StudioInspectorRow label={tp("offsetY")} value={`${cursor.offsetY}`} />
                <StudioInspectorSecondaryButton
                  onClick={() => setOffset(0, 0)}
                  style={{ justifyContent: "space-between" }}
                >
                  <span>{tp("center")}</span>
                  <span aria-hidden="true">-</span>
                </StudioInspectorSecondaryButton>
              </StudioInspectorSection>

              <HealthCheck
                imageBlob={cursor.renderedBlob}
                hotspotX={cursor.renderedHotspotX}
                hotspotY={cursor.renderedHotspotY}
              />
            </>
          ) : null}
        </StudioInspector>
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

function SlotEmptyState({
  slotId,
  onStaticFile,
  onAnimatedFile,
}: {
  slotId: string;
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
        width: "min(56rem, 100%)",
        display: "grid",
        gap: "1.25rem",
        color: "var(--color-text-muted)",
        textAlign: "left",
        lineHeight: 1.6,
      }}
    >
      <div style={{ display: "grid", gap: "0.375rem" }}>
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
          style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}
        >
          {t("emptySlotDescription")}
        </div>
      </div>

      <div
        data-testid="studio-empty-slot-source-cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
          gap: "1rem",
          padding: "1.125rem",
          border: "1px solid var(--color-border)",
          borderRadius: "1rem",
          backgroundColor: "rgba(255,255,255,0.02)",
        }}
      >
        <SlotSourceChoiceCard
          dataTestId="studio-empty-slot-source-static"
          title={t("slotStaticUpload")}
          description={t("slotStaticUploadSub")}
          ariaLabel={t("emptySlotStaticStart")}
          mode="cur"
          onFile={onStaticFile}
        />
        <SlotSourceChoiceCard
          dataTestId="studio-empty-slot-source-animated"
          title={t("slotAniUpload")}
          description={t("slotAniUploadSub")}
          ariaLabel={t("emptySlotAnimatedStart")}
          mode="ani"
          onFile={onAnimatedFile}
        />
      </div>

      <div style={{ display: "grid", gap: "0.75rem" }}>
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
            transition: STUDIO_INTERACTION_TRANSITION,
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

function capitalizeSlotId(slotId: string | undefined) {
  if (!slotId) return "Slot";
  return `${slotId.slice(0, 1).toUpperCase()}${slotId.slice(1)}`;
}

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


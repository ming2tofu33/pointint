"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import CursorCanvas from "@/components/CursorCanvas";
import AniEditorShell from "@/components/AniEditorShell";
import AniSimulation from "@/components/AniSimulation";
import CanvasViewZoomControl, {
  type CanvasViewZoom,
} from "@/components/CanvasViewZoomControl";
import GuideModal from "@/components/GuideModal";
import HealthCheck from "@/components/HealthCheck";
import MobileGuard from "@/components/MobileGuard";
import NameInput from "@/components/NameInput";
import SimulationThemeModeSwitch from "@/components/SimulationThemeModeSwitch";
import SimulationSceneContextHint from "@/components/SimulationSceneContextHint";
import SimulationSceneTabs from "@/components/SimulationSceneTabs";
import SlotRail from "@/components/SlotRail";
import Simulation from "@/components/Simulation";
import SimulationFooter from "@/components/SimulationFooter";
import SlotReplacementSurface from "@/components/SlotReplacementSurface";
import StudioSelectionSummary from "@/components/StudioSelectionSummary";
import StudioBar from "@/components/StudioBar";
import StudioInspector, {
  StudioInspectorCompactGuidance,
  StudioInspectorEmptyNotice,
  StudioInspectorGroup,
  StudioInspectorNumberField,
  StudioInspectorRow,
  StudioInspectorSection,
  StudioInspectorSecondaryButton,
  StudioInspectorSegmentedControl,
  StudioInspectorTextAction,
} from "@/components/StudioInspector";
import StudioSlotEmptyState from "@/components/StudioSlotEmptyState";
import StudioStageActionBar from "@/components/StudioStageActionBar";
import StudioStageHeader from "@/components/StudioStageHeader";
import {
  STUDIO_INTERACTION_TRANSITION,
  default as StudioSurfaceCard,
  StudioShellInteractionStyles,
} from "@/components/StudioSurfaceCard";
import type { SimulationThemeMode } from "@/components/CursorSimulationSurface";
import { trackEvent } from "@/lib/analytics";
import { FitMode } from "@/lib/cursorFrame";
import { clearLandingFile, getLandingFile } from "@/lib/landingStore";
import {
  buildProjectSlotSimulationSources,
  hasNormalSlotSimulationSource,
} from "@/lib/slotSimulationSources";
import {
  DEFAULT_SIMULATION_SCENE_ID,
  type SimulationSceneId,
} from "@/lib/simulationScenes";
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
    pendingBackgroundRemovalSlotIds,
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
    endContinuousHistoryAction,
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
  const [simulationThemeMode, setSimulationThemeMode] =
    useState<SimulationThemeMode>("dark");
  const [canvasViewZoom, setCanvasViewZoom] = useState<CanvasViewZoom>(1);
  const [simulationSceneId, setSimulationSceneId] =
    useState<SimulationSceneId>(DEFAULT_SIMULATION_SCENE_ID);
  const t = useTranslations("studio");
  const tp = useTranslations("panel");
  const tu = useTranslations("upload");
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

  const displayUrl = cursor
    ? state === "editing"
      ? showOriginal
        ? cursor.originalUrl
        : cursor.processedUrl
      : cursor.originalUrl
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
  const stageHotspotSummary =
    state === "editing" && cursor
      ? cursor.hotspotMode === "auto"
        ? tp("recommended")
        : tp("manual")
      : null;
  const stageKindSummary = selectedSlot.kind
    ? selectedSlot.kind === "static"
      ? t("slotStatic")
      : t("slotAnimated")
    : t("slotKindUnset");
  const pendingBackgroundRemovalSlotLabels = useMemo(
    () =>
      pendingBackgroundRemovalSlotIds.map((slotId) =>
        t(`slot${capitalizeSlotId(slotId)}`)
      ),
    [pendingBackgroundRemovalSlotIds, t]
  );
  const canCompareOriginal = Boolean(
    cursor &&
      cursor.originalUrl &&
      cursor.processedUrl &&
      cursor.originalUrl !== cursor.processedUrl
  );
  const stageGuidance = cursor
    ? hotspotPickActive
      ? t("clickToSetHotspot")
      : `${t("dragToMove")} · ${t("shortcutHotspot")}`
    : t("emptySlotDescription");
  const stageActions = [
    {
      id: "studio-pick-hotspot",
      label: hotspotPickActive ? t("clickToSetHotspot") : tp("hotspot"),
      onClick: () => setHotspotPickActive((current) => !current),
      disabled: !cursor,
      title: hotspotPickActive ? t("clickToSetHotspot") : tp("hotspot"),
      ariaLabel: hotspotPickActive ? t("clickToSetHotspot") : tp("hotspot"),
      group: "tool",
      tone: hotspotPickActive ? ("accent" as const) : ("default" as const),
    },
    {
      id: "studio-undo",
      label: t("undo"),
      onClick: undo,
      disabled: !canUndo,
      title: t("undoShortcut"),
      ariaLabel: t("undoShortcut"),
      group: "history",
      icon: <UndoArrowIcon />,
      shortcutHint: "Ctrl+Z",
    },
    {
      id: "studio-redo",
      label: t("redo"),
      onClick: redo,
      disabled: !canRedo,
      title: t("redoShortcut"),
      ariaLabel: t("redoShortcut"),
      group: "history",
      icon: <RedoArrowIcon />,
      shortcutHint: "Ctrl+Y",
    },
    ...(canCompareOriginal
      ? [
          {
            id: "studio-toggle-original",
            label: showOriginal ? t("showProcessed") : t("showOriginal"),
            onClick: toggleOriginal,
            disabled: !cursor,
            title: showOriginal ? t("showProcessed") : t("showOriginal"),
            ariaLabel: showOriginal ? t("showProcessed") : t("showOriginal"),
            group: "view",
            tone: "subtle" as const,
          },
        ]
      : []),
  ];
  const slotSimulationSources = useMemo(
    () => buildProjectSlotSimulationSources(project),
    [project]
  );
  const hasSimulationNormal = hasNormalSlotSimulationSource(slotSimulationSources);
  const showStaticStudioShell =
    state === "editing" ||
    ((state === "uploaded" || state === "processing") && Boolean(cursor));
  const showSlotSourceEntry =
    state !== "uploaded" && state !== "processing" && !selectedSlotBound;
  const showCompactInspectorGuidance =
    !selectedSlotBound || state === "uploaded" || state === "processing";
  const compactGuidanceContent =
    state === "uploaded"
      ? {
          title: tu("removeBg"),
          summary: tu("removeBgSub"),
          lines: [tu("skipBgSub")],
        }
      : state === "processing"
        ? {
            title: tu("removingBg"),
            summary: tu("removeBgSub"),
            lines: [],
          }
        : {
            title: t("slotEmptyTitle"),
            summary: t("emptySlotDescription"),
            lines: [t("slotStaticUploadSub"), t("slotAniUploadSub")],
          };

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
          primaryActionLabel={t("downloadAllRoles")}
          secondaryActionLabel={t("downloadCurrentSlot")}
        />
        {pendingBackgroundRemovalSlotIds.length > 0 ? (
          <PendingBackgroundDecisionNotice
            title={t("backgroundPendingDownloadTitle")}
            summary={t("backgroundPendingDownloadSummary", {
              slots: pendingBackgroundRemovalSlotLabels.join(", "),
            })}
            actionLabel={t("backgroundPendingDownloadAction")}
            onAction={() => selectSlot(pendingBackgroundRemovalSlotIds[0])}
          />
        ) : null}

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
            onEndContinuousHistoryAction={endContinuousHistoryAction}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            simulationThemeMode={simulationThemeMode}
            onSimulationThemeModeChange={setSimulationThemeMode}
            onResetHotspot={() => setHotspot(0, 0)}
            onReset={reset}
            canvasViewZoom={canvasViewZoom}
            onCanvasViewZoomChange={setCanvasViewZoom}
          />
        ) : (
          <>
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
            backgroundColor: "var(--color-bg-primary)",
            position: "relative",
            minWidth: 0,
            minHeight: 0,
          }}
        >
          {showStaticStudioShell && (
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
                pendingBackgroundRemovalSlotIds={pendingBackgroundRemovalSlotIds}
                processingSlotId={state === "processing" ? selectedSlotId : null}
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
                      padding: "1.25rem 1.25rem 0.875rem",
                      gap: "1rem",
                    }}
                  >
                    <StudioStageHeader
                      slotLabel={stageSlotLabel}
                      style={{ padding: 0 }}
                    />
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
                      }}
                    >
                      <StudioSlotEmptyState
                        slotId={selectedSlotId}
                        onStaticFile={selectSelectedSlotStaticFile}
                        onAnimatedFile={selectSelectedSlotAnimatedFile}
                      />
                    </div>
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
                    actions={
                      <CanvasViewZoomControl
                        value={canvasViewZoom}
                        onChange={setCanvasViewZoom}
                      />
                    }
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
                          position: "relative",
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
                          onGestureEnd={endContinuousHistoryAction}
                          hotspotPickActive={hotspotPickActive}
                          onHotspotPickComplete={() => setHotspotPickActive(false)}
                          viewScale={canvasViewZoom}
                        />

                        {state === "uploaded" ? (
                          <BackgroundRemovalDecisionOverlay
                            title={tu("removeBg")}
                            summary={tu("removeBgSub")}
                            hint={tu("skipBgSub")}
                            removeLabel={tu("removeBg")}
                            removeSub={tu("removeBgSub")}
                            keepLabel={tu("useAsIs")}
                            keepSub={tu("skipBgSub")}
                            onRemoveBg={processBgRemoval}
                            onSkipBg={skipBgRemoval}
                          />
                        ) : null}

                        {state === "processing" ? (
                          <BackgroundRemovalProcessingOverlay
                            title={tu("removingBg")}
                            summary={tu("removeBgSub")}
                          />
                        ) : null}
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
                        visibility: state === "editing" ? "visible" : "hidden",
                        pointerEvents: state === "editing" ? "auto" : "none",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--color-text-muted)",
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>{stageGuidance}</span>
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                        }}
                      >
                        <SimulationSceneTabs
                          value={simulationSceneId}
                          onChange={setSimulationSceneId}
                        />
                        <SimulationSceneContextHint sceneId={simulationSceneId} />
                        <SimulationThemeModeSwitch
                          value={simulationThemeMode}
                          onChange={setSimulationThemeMode}
                        />
                      </div>
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
                      themeMode={simulationThemeMode}
                      sceneId={simulationSceneId}
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
            width: "17rem",
            borderLeft: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-secondary)",
            padding: "1.25rem",
            flexShrink: 0,
            overflowY: "auto",
          }}
          quickActions={
            state === "editing" && cursor && selectedSlotBound && canCompareOriginal ? (
              <StudioInspectorSecondaryButton onClick={retryBgRemoval}>
                {t("retryBg")}
              </StudioInspectorSecondaryButton>
            ) : null
          }
          summary={
            state === "editing" && cursor && selectedSlotBound ? (
              <StudioSelectionSummary
                slotLabelTitle={t("slotRailTitle")}
                slotLabel={stageSlotLabel}
                cursorLabelTitle={tp("cursor")}
                cursorName={cursor.cursorName}
                statusLabelTitle={tp("status")}
                statusLabel={stageHotspotSummary ?? tp("manual")}
                typeLabelTitle={t("slotTypeLabel")}
                typeLabel={stageKindSummary}
              />
            ) : showCompactInspectorGuidance ? (
              <StudioInspectorCompactGuidance
                title={compactGuidanceContent.title}
                summary={compactGuidanceContent.summary}
                lines={compactGuidanceContent.lines}
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
              <StudioInspectorGroup data-testid="studio-inspector-group-image">
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
                  <StudioInspectorSegmentedControl
                    value={cursor.fitMode}
                    options={["contain", "cover"] as const}
                    onChange={setFitMode}
                    ariaLabel={tp("framing")}
                    getLabel={(value) =>
                      value === "contain" ? tp("fitContain") : tp("fitCover")
                    }
                  />
                </StudioInspectorSection>

                <StudioInspectorSection title={tp("name")}>
                  <NameInput
                    value={cursor.cursorName}
                    onChange={setCursorName}
                    placeholder={tp("namePlaceholder")}
                  />
                </StudioInspectorSection>
              </StudioInspectorGroup>

              <StudioInspectorGroup data-testid="studio-inspector-group-transform">
                <StudioInspectorSection
                  title={tp("hotspot")}
                  action={
                    <StudioInspectorTextAction onClick={recommendHotspot}>
                      {cursor.hotspotMode === "auto"
                        ? tp("recommendHotspotAgain")
                        : tp("recommendHotspot")}
                    </StudioInspectorTextAction>
                  }
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "0.5rem",
                    }}
                  >
                    <StudioInspectorNumberField
                      label={tp("hotspotX")}
                      aria-label={tp("hotspotX")}
                      value={cursor.hotspotX}
                      step={1}
                      onChange={(event) => {
                        const nextX = Number(event.target.value);
                        setHotspot(
                          Number.isFinite(nextX) ? nextX : 0,
                          cursor.hotspotY
                        );
                      }}
                    />
                    <StudioInspectorNumberField
                      label={tp("hotspotY")}
                      aria-label={tp("hotspotY")}
                      value={cursor.hotspotY}
                      step={1}
                      onChange={(event) => {
                        const nextY = Number(event.target.value);
                        setHotspot(
                          cursor.hotspotX,
                          Number.isFinite(nextY) ? nextY : 0
                        );
                      }}
                    />
                  </div>
                  <StudioInspectorRow
                    label={tp("position")}
                    value={`${cursor.hotspotX}, ${cursor.hotspotY}`}
                  />
                  <StudioInspectorRow
                    label={tp("status")}
                    value={
                      cursor.hotspotMode === "auto"
                        ? tp("recommended")
                        : tp("manual")
                    }
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
                    onPointerUp={endContinuousHistoryAction}
                    onPointerCancel={endContinuousHistoryAction}
                    onBlur={endContinuousHistoryAction}
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

                <StudioInspectorSection
                  title={tp("position")}
                  action={
                    <StudioInspectorTextAction onClick={() => setOffset(0, 0)}>
                      {tp("center")}
                    </StudioInspectorTextAction>
                  }
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "0.5rem",
                    }}
                  >
                    <StudioInspectorNumberField
                      label={tp("offsetX")}
                      aria-label={tp("offsetX")}
                      value={cursor.offsetX}
                      step={1}
                      onChange={(event) => {
                        const nextX = Number(event.target.value);
                        setOffset(
                          Number.isFinite(nextX) ? nextX : 0,
                          cursor.offsetY
                        );
                      }}
                    />
                    <StudioInspectorNumberField
                      label={tp("offsetY")}
                      aria-label={tp("offsetY")}
                      value={cursor.offsetY}
                      step={1}
                      onChange={(event) => {
                        const nextY = Number(event.target.value);
                        setOffset(
                          cursor.offsetX,
                          Number.isFinite(nextY) ? nextY : 0
                        );
                      }}
                    />
                  </div>
                </StudioInspectorSection>
              </StudioInspectorGroup>

              <StudioInspectorGroup data-testid="studio-inspector-group-health">
                <HealthCheck
                  imageBlob={cursor.renderedBlob}
                  hotspotX={cursor.renderedHotspotX}
                  hotspotY={cursor.renderedHotspotY}
                />
              </StudioInspectorGroup>
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

function UndoArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 14 4 9l5-5" />
      <path d="M20 20a8 8 0 0 0-8-8H4" />
    </svg>
  );
}

function RedoArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 14 5-5-5-5" />
      <path d="M4 20a8 8 0 0 1 8-8h8" />
    </svg>
  );
}

function PendingBackgroundDecisionNotice({
  title,
  summary,
  actionLabel,
  onAction,
}: {
  title: string;
  summary: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div
      data-testid="pending-background-decision-notice"
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "0.625rem 1.25rem",
        borderBottom: "1px solid var(--color-border)",
        background:
          "linear-gradient(90deg, rgba(255, 96, 130, 0.13), rgba(255, 255, 255, 0.025))",
        color: "var(--color-text-primary)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "grid", gap: "0.125rem", minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {summary}
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        style={{
          minHeight: "2rem",
          padding: "0.375rem 0.75rem",
          border: "1px solid var(--color-border)",
          backgroundColor: "rgba(255,255,255,0.035)",
          color: "var(--color-text-primary)",
          cursor: "pointer",
          fontSize: "0.75rem",
          fontWeight: 700,
          flexShrink: 0,
          transition: STUDIO_INTERACTION_TRANSITION,
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function BackgroundRemovalDecisionOverlay({
  title,
  summary,
  hint,
  removeLabel,
  removeSub,
  keepLabel,
  keepSub,
  onRemoveBg,
  onSkipBg,
}: {
  title: string;
  summary: string;
  hint: string;
  removeLabel: string;
  removeSub: string;
  keepLabel: string;
  keepSub: string;
  onRemoveBg: () => void;
  onSkipBg: () => void;
}) {
  return (
    <div
      data-testid="background-removal-decision-overlay"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "1rem 1rem 1.375rem",
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <StudioSurfaceCard
        style={{
          width: "min(28rem, 100%)",
          display: "grid",
          gap: "0.875rem",
          pointerEvents: "auto",
          boxShadow:
            "0 12px 24px rgba(8, 12, 18, 0.14), 0 2px 8px rgba(8, 12, 18, 0.08)",
          backgroundColor:
            "color-mix(in srgb, var(--color-bg-secondary) 96%, white 4%)",
          borderColor: "color-mix(in srgb, var(--color-border) 84%, white 6%)",
        }}
      >
        <div style={{ display: "grid", gap: "0.25rem" }}>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              lineHeight: 1.45,
            }}
          >
            {summary}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.45,
            }}
          >
            {hint}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "0.75rem",
          }}
        >
          <BackgroundRemovalActionButton
            label={removeLabel}
            summary={removeSub}
            accent
            onClick={onRemoveBg}
          />
          <BackgroundRemovalActionButton
            label={keepLabel}
            summary={keepSub}
            onClick={onSkipBg}
          />
        </div>
      </StudioSurfaceCard>
    </div>
  );
}

function BackgroundRemovalProcessingOverlay({
  title,
  summary,
}: {
  title: string;
  summary: string;
}) {
  return (
    <div
      data-testid="background-removal-processing-overlay"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "1rem 1rem 1.375rem",
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <StudioSurfaceCard
        style={{
          width: "min(22rem, 100%)",
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          pointerEvents: "auto",
          boxShadow:
            "0 12px 24px rgba(8, 12, 18, 0.14), 0 2px 8px rgba(8, 12, 18, 0.08)",
          backgroundColor:
            "color-mix(in srgb, var(--color-bg-secondary) 96%, white 4%)",
          borderColor: "color-mix(in srgb, var(--color-border) 84%, white 6%)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: "1.125rem",
            height: "1.125rem",
            borderRadius: "999px",
            border: "2px solid color-mix(in srgb, var(--color-border) 88%, white 8%)",
            borderTopColor: "var(--color-accent)",
            animation: "spin 0.8s linear infinite",
            flexShrink: 0,
          }}
        />
        <div style={{ display: "grid", gap: "0.2rem" }}>
          <div
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.45,
            }}
          >
            {summary}
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </StudioSurfaceCard>
    </div>
  );
}

function BackgroundRemovalActionButton({
  label,
  summary,
  accent,
  onClick,
}: {
  label: string;
  summary: string;
  accent?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "grid",
        gap: "0.2rem",
        textAlign: "left",
        padding: "0.75rem 0.875rem",
        borderRadius: "0.875rem",
        border: `1px solid ${
          accent ? "var(--color-accent)" : "var(--color-border)"
        }`,
        backgroundColor: accent
          ? "var(--color-accent-subtle)"
          : "rgba(255,255,255,0.02)",
        color: accent ? "var(--color-accent)" : "var(--color-text-primary)",
        cursor: "pointer",
        transition: STUDIO_INTERACTION_TRANSITION,
      }}
    >
      <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{label}</span>
      <span
        style={{
          fontSize: "0.6875rem",
          lineHeight: 1.45,
          color: "var(--color-text-muted)",
        }}
      >
        {summary}
      </span>
    </button>
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

function capitalizeSlotId(slotId: string | undefined) {
  if (!slotId) return "Slot";
  return `${slotId.slice(0, 1).toUpperCase()}${slotId.slice(1)}`;
}

const studioThemeScopeStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "calc(100dvh - var(--app-header-height, 4.25rem))",
  minHeight: 0,
  overflow: "hidden",
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


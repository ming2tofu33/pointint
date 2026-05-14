"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import CursorCanvas from "@/components/CursorCanvas";
import AniSimulation from "@/components/AniSimulation";
import AniFrameTimeline from "@/components/AniFrameTimeline";
import CanvasViewZoomControl, {
  type CanvasViewZoom,
} from "@/components/CanvasViewZoomControl";
import type { SimulationThemeMode } from "@/components/CursorSimulationSurface";
import FramedCursorPreview from "@/components/FramedCursorPreview";
import ImageTransformControls from "@/components/ImageTransformControls";
import SimulationThemeModeSwitch from "@/components/SimulationThemeModeSwitch";
import SimulationSceneContextHint from "@/components/SimulationSceneContextHint";
import SimulationSceneTabs from "@/components/SimulationSceneTabs";
import SlotRail from "@/components/SlotRail";
import SlotReplacementSurface from "@/components/SlotReplacementSurface";
import SimulationFooter from "@/components/SimulationFooter";
import StudioInspector, {
  StudioInspectorCompactGuidance,
  StudioInspectorGroup,
  StudioInspectorPreviewStrip,
  StudioInspectorRow,
  StudioInspectorSection,
  StudioInspectorSegmentedControl,
  StudioInspectorSizeSummary,
  StudioInspectorSliderControl,
  StudioInspectorTextAction,
} from "@/components/StudioInspector";
import StudioSlotEmptyState from "@/components/StudioSlotEmptyState";
import StudioStageActionBar from "@/components/StudioStageActionBar";
import StudioStageHeader from "@/components/StudioStageHeader";
import { StudioShellInteractionStyles } from "@/components/StudioSurfaceCard";
import InteractiveDotBackground from "@/components/InteractiveDotBackground";
import { resolveAniFrameEdit } from "@/lib/aniFrameEdits";
import { type FitMode, type ImageTransformAction } from "@/lib/cursorFrame";
import { type CursorThemeProject, type SlotId } from "@/lib/cursorThemeProject";
import {
  buildProjectSlotSimulationSources,
  hasNormalSlotSimulationSource,
} from "@/lib/slotSimulationSources";
import {
  DEFAULT_SIMULATION_SCENE_ID,
  type SimulationSceneId,
} from "@/lib/simulationScenes";
import {
  type AniData,
  type AniFrameEditScope,
  type CursorSize,
} from "@/lib/useStudio";

interface AniEditorShellProps {
  ani: AniData | null;
  imageUrl: string;
  project: CursorThemeProject;
  selectedSlotId: SlotId;
  error?: string | null;
  hotspotPickActive: boolean;
  onSetHotspotPickActive: (active: boolean) => void;
  onSelectSlot: (slotId: SlotId) => void;
  onSelectSlotStaticFile: (file: File) => void;
  onSelectSlotAnimatedFile: (file: File) => void;
  onSelectSlotImageSequenceFiles: (files: File[]) => void;
  onSelectAniFrame: (frameId: string) => void;
  onDeleteAniFrame: (frameId: string) => void;
  onReorderAniFrame: (frameId: string, insertionIndex: number) => void;
  onInsertAniFrameFiles: (files: File[], insertionIndex?: number) => void;
  onSetAniFrameDuration: (frameId: string, durationMs: number) => void;
  onSetAllAniFrameDurations: (durationMs: number) => void;
  onOffsetChange: (
    x: number,
    y: number,
    editScope?: AniFrameEditScope
  ) => void;
  onHotspotChange: (x: number, y: number) => void;
  onScaleChange: (scale: number, editScope?: AniFrameEditScope) => void;
  onFitModeChange: (
    fitMode: FitMode,
    editScope?: AniFrameEditScope
  ) => void;
  onImageTransform: (
    action: ImageTransformAction,
    editScope?: AniFrameEditScope
  ) => void;
  onAniCursorSizeChange: (size: CursorSize) => void;
  onAniNameChange: (name: string) => void;
  onRecommendHotspot: () => void;
  onEndContinuousHistoryAction: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  simulationThemeMode: SimulationThemeMode;
  onSimulationThemeModeChange: (next: SimulationThemeMode) => void;
  onResetHotspot: () => void;
  onReset: () => void;
  canvasViewZoom: CanvasViewZoom;
  onCanvasViewZoomChange: (next: CanvasViewZoom) => void;
}

export default function AniEditorShell({
  ani,
  imageUrl,
  project,
  selectedSlotId,
  error,
  hotspotPickActive,
  onSetHotspotPickActive,
  onSelectSlot,
  onSelectSlotStaticFile,
  onSelectSlotAnimatedFile,
  onSelectSlotImageSequenceFiles,
  onSelectAniFrame,
  onDeleteAniFrame,
  onReorderAniFrame,
  onInsertAniFrameFiles,
  onSetAniFrameDuration,
  onSetAllAniFrameDurations,
  onOffsetChange,
  onHotspotChange,
  onScaleChange,
  onFitModeChange,
  onImageTransform,
  onAniCursorSizeChange,
  onAniNameChange,
  onRecommendHotspot,
  onEndContinuousHistoryAction,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  simulationThemeMode,
  onSimulationThemeModeChange,
  onResetHotspot,
  onReset,
  canvasViewZoom,
  onCanvasViewZoomChange,
}: AniEditorShellProps) {
  const t = useTranslations("studio");
  const tp = useTranslations("panel");
  const [simulationCollapsed, setSimulationCollapsed] = useState(false);
  const [simulationSceneId, setSimulationSceneId] =
    useState<SimulationSceneId>(DEFAULT_SIMULATION_SCENE_ID);
  const [editScope, setEditScope] =
    useState<AniFrameEditScope>("all-frames");
  const [sequencePreviewPlaying, setSequencePreviewPlaying] = useState(false);
  const [sequencePreviewFrameId, setSequencePreviewFrameId] = useState<
    string | null
  >(null);
  const selectedSlot = project.slots[selectedSlotId];
  const selectedSlotBound = Boolean(
    selectedSlot.asset.originalUrl || selectedSlot.asset.previewUrl || ani
  );
  const selectedAniFrame =
    ani?.sourceKind === "image-sequence"
      ? ani.frames.find((frame) => frame.id === ani.selectedFrameId) ??
        ani.frames[0] ??
        null
      : null;
  const supportsFrameEditScope = ani?.sourceKind === "image-sequence";
  const sequencePreviewActive =
    sequencePreviewPlaying &&
    ani?.sourceKind === "image-sequence" &&
    ani.frames.length > 0;
  const sequencePreviewFrame =
    sequencePreviewActive && ani?.sourceKind === "image-sequence"
      ? ani.frames.find((frame) => frame.id === sequencePreviewFrameId) ??
        selectedAniFrame
      : null;
  const displayedAniFrame = sequencePreviewFrame ?? selectedAniFrame;
  const activeImageUrl = displayedAniFrame?.url ?? imageUrl;
  const activeSourceWidth = displayedAniFrame?.sourceWidth ?? ani?.sourceWidth ?? 0;
  const activeSourceHeight =
    displayedAniFrame?.sourceHeight ?? ani?.sourceHeight ?? 0;
  const timelineFrames =
    ani?.sourceKind === "image-sequence"
      ? ani.frames.map((frame) => ({
          ...frame,
          ...resolveAniFrameEdit(ani.globalEdit, frame),
        }))
      : [];
  const activeEditScope = supportsFrameEditScope ? editScope : "all-frames";
  const activeEdit =
    ani == null
      ? {
          fitMode: "contain" as const,
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          rotation: 0 as const,
          flipX: false,
          flipY: false,
        }
      : sequencePreviewActive && displayedAniFrame
        ? resolveAniFrameEdit(ani.globalEdit, displayedAniFrame)
      : activeEditScope === "all-frames"
        ? ani.globalEdit
        : ani;
  useEffect(() => {
    if (!supportsFrameEditScope || !ani || ani.frames.length === 0) {
      setSequencePreviewPlaying(false);
      setSequencePreviewFrameId(null);
      return;
    }

    setSequencePreviewFrameId((current) =>
      current && ani.frames.some((frame) => frame.id === current)
        ? current
        : ani.selectedFrameId ?? ani.frames[0]?.id ?? null
    );
  }, [ani, supportsFrameEditScope]);

  useEffect(() => {
    if (
      !sequencePreviewPlaying ||
      !ani ||
      ani.sourceKind !== "image-sequence" ||
      ani.frames.length === 0
    ) {
      return;
    }

    const currentFrameId =
      sequencePreviewFrameId ?? ani.selectedFrameId ?? ani.frames[0]?.id ?? null;
    const currentIndex = Math.max(
      0,
      ani.frames.findIndex((frame) => frame.id === currentFrameId)
    );
    const currentFrame = ani.frames[currentIndex] ?? ani.frames[0];
    if (!currentFrame) {
      return;
    }

    if (sequencePreviewFrameId !== currentFrame.id) {
      setSequencePreviewFrameId(currentFrame.id);
    }

    const timer = window.setTimeout(() => {
      const nextFrame = ani.frames[(currentIndex + 1) % ani.frames.length];
      setSequencePreviewFrameId(nextFrame?.id ?? null);
    }, Math.max(20, currentFrame.durationMs));

    return () => window.clearTimeout(timer);
  }, [ani, sequencePreviewFrameId, sequencePreviewPlaying]);

  const stopSequencePreview = () => {
    setSequencePreviewPlaying(false);
    setSequencePreviewFrameId(null);
  };
  const handleOffsetChange = (x: number, y: number) =>
    onOffsetChange(x, y, activeEditScope);
  const handleScaleChange = (scale: number) =>
    onScaleChange(scale, activeEditScope);
  const handleFitModeChange = (fitMode: FitMode) =>
    onFitModeChange(fitMode, activeEditScope);
  const handleImageTransform = (action: ImageTransformAction) =>
    onImageTransform(action, activeEditScope);
  const stageSlotLabel = t(`slot${capitalizeSlotId(selectedSlotId)}`);
  const stageKindSummary = selectedSlot.kind
    ? selectedSlot.kind === "static"
      ? t("slotStatic")
      : t("slotAnimated")
    : t("slotKindUnset");
  const stageFormatSummary = ani ? t("slotAnimated") : stageKindSummary;
  const slotSimulationSources = useMemo(
    () => buildProjectSlotSimulationSources(project),
    [project]
  );
  const hasSimulationNormal = hasNormalSlotSimulationSource(slotSimulationSources);

  return (
    <div
      data-studio-shell
      style={{
        display: "flex",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
      data-testid="ani-editor-shell"
    >
      <StudioShellInteractionStyles />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
        }}
      >
        <SlotRail
          project={project}
          selectedSlotId={selectedSlotId}
          onSelectSlot={onSelectSlot}
        />

        <div
          data-testid="ani-editor-shell-workspace"
          style={{
            flex: "1 1 58%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--color-bg-primary)",
            minHeight: 0,
          }}
        >
          <main
            data-testid="ani-editor-shell-main"
            style={{
              flex: "1 1 58%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              padding: "1.25rem 1.25rem 0.875rem",
              gap: "1rem",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {selectedSlotBound && ani ? (
              <>
                <SlotReplacementSurface
                  onStaticFile={onSelectSlotStaticFile}
                  onAnimatedFile={onSelectSlotAnimatedFile}
                  onImageSequenceFiles={onSelectSlotImageSequenceFiles}
                  style={{
                    flex: 1,
                    minHeight: 0,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    gap: "1rem",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <StudioStageHeader
                    slotLabel={stageSlotLabel}
                    showSlotLabel={false}
                    cursorName={ani.cursorName}
                    cursorNameLabel={tp("name")}
                    cursorNamePlaceholder={tp("namePlaceholder")}
                    onCursorNameChange={onAniNameChange}
                    style={{ padding: 0 }}
                  />

                  <div
                    data-testid="studio-stage-canvas"
                    onMouseMove={(event) => {
                      setInteractiveDotPosition(
                        event.currentTarget,
                        event.clientX,
                        event.clientY
                      );
                    }}
                    onPointerMove={(event) => {
                      setInteractiveDotPosition(
                        event.currentTarget,
                        event.clientX,
                        event.clientY
                      );
                    }}
                    style={{
                      flex: 1,
                      minHeight: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-bg-secondary)",
                      padding: "1.25rem",
                      position: "relative",
                      boxShadow: "none",
                    }}
                  >
                    <InteractiveDotBackground
                      layerTestId="ani-stage-dots"
                      baseColor="color-mix(in srgb, var(--color-text-primary) 14%, transparent)"
                    />
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <CursorCanvas
                        imageUrl={activeImageUrl}
                        sourceWidth={activeSourceWidth}
                        sourceHeight={activeSourceHeight}
                        fitMode={activeEdit.fitMode}
                        offsetX={activeEdit.offsetX}
                        offsetY={activeEdit.offsetY}
                        scale={activeEdit.scale}
                        rotation={activeEdit.rotation}
                        flipX={activeEdit.flipX}
                        flipY={activeEdit.flipY}
                        hotspotX={ani.hotspotX}
                        hotspotY={ani.hotspotY}
                        onOffsetChange={handleOffsetChange}
                        onHotspotChange={onHotspotChange}
                        onGestureEnd={onEndContinuousHistoryAction}
                        hotspotPickActive={hotspotPickActive}
                        onHotspotPickComplete={() => onSetHotspotPickActive(false)}
                        viewScale={canvasViewZoom}
                      />
                    </div>

                    <div
                      data-testid="studio-stage-actions"
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: "1rem",
                        transform: "translateX(-50%)",
                        zIndex: 5,
                        display: "flex",
                        alignItems: "center",
                        alignContent: "center",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        width: "max-content",
                        maxWidth: "calc(100% - 0.75rem)",
                        boxSizing: "border-box",
                        border: "1px solid var(--color-border)",
                        backgroundColor:
                          "color-mix(in srgb, var(--color-bg-secondary) 92%, rgba(20,24,32,0.08))",
                        color: "var(--color-text-primary)",
                        boxShadow: "none",
                        padding: "0.45rem",
                      }}
                    >
                      <StudioStageActionBar
                        actions={[
                          {
                            id: "ani-pick-hotspot",
                            label: hotspotPickActive
                              ? t("clickToSetHotspot")
                              : tp("hotspot"),
                            onClick: () =>
                              onSetHotspotPickActive(!hotspotPickActive),
                            title: hotspotPickActive
                              ? t("clickToSetHotspot")
                              : tp("hotspot"),
                            ariaLabel: hotspotPickActive
                              ? t("clickToSetHotspot")
                              : tp("hotspot"),
                            group: "tool",
                            tone: hotspotPickActive
                              ? ("accent" as const)
                              : ("default" as const),
                          },
                          {
                            id: "ani-undo",
                            label: t("undo"),
                            onClick: onUndo,
                            disabled: !canUndo,
                            title: t("undoShortcut"),
                            ariaLabel: t("undoShortcut"),
                            group: "history",
                            icon: <UndoArrowIcon />,
                            shortcutHint: "Ctrl+Z",
                          },
                          {
                            id: "ani-redo",
                            label: t("redo"),
                            onClick: onRedo,
                            disabled: !canRedo,
                            title: t("redoShortcut"),
                            ariaLabel: t("redoShortcut"),
                            group: "history",
                            icon: <RedoArrowIcon />,
                            shortcutHint: "Ctrl+Y",
                          },
                        ]}
                      />
                      <CanvasViewZoomControl
                        value={canvasViewZoom}
                        onChange={onCanvasViewZoomChange}
                      />
                    </div>
                  </div>

                  {ani.sourceKind === "image-sequence" &&
                  ani.frames.length > 0 ? (
                    <AniFrameTimeline
                      frames={timelineFrames}
                      selectedFrameId={ani.selectedFrameId}
                      previewFrameId={
                        sequencePreviewActive ? displayedAniFrame?.id : null
                      }
                      isPlaying={sequencePreviewPlaying}
                      onPlayToggle={(playing) => {
                        setSequencePreviewFrameId(
                          ani.selectedFrameId ?? ani.frames[0]?.id ?? null
                        );
                        setSequencePreviewPlaying(playing);
                      }}
                      onSelectFrame={(frameId) => {
                        stopSequencePreview();
                        onSelectAniFrame(frameId);
                      }}
                      onDeleteFrame={(frameId) => {
                        stopSequencePreview();
                        onDeleteAniFrame(frameId);
                      }}
                      onReorderFrame={(frameId, insertionIndex) => {
                        stopSequencePreview();
                        onReorderAniFrame(frameId, insertionIndex);
                      }}
                      onAddFrames={(files, insertionIndex) => {
                        stopSequencePreview();
                        onInsertAniFrameFiles(files, insertionIndex);
                      }}
                      onSetFrameDuration={onSetAniFrameDuration}
                      onSetAllFrameDurations={onSetAllAniFrameDurations}
                      style={{
                        flexShrink: 0,
                      }}
                    />
                  ) : null}

                  <div
                    aria-hidden="true"
                    style={{
                      display: "none",
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
                        gap: "0.5rem",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        {hotspotPickActive
                          ? t("clickToSetHotspot")
                          : `${t("dragToMove")} · ${t("shortcutHotspot")}`}
                      </span>
                    </div>

                    <StudioStageActionBar
                      actions={[
                        {
                          id: "ani-pick-hotspot",
                          label: hotspotPickActive
                            ? t("clickToSetHotspot")
                            : tp("hotspot"),
                          onClick: () =>
                            onSetHotspotPickActive(!hotspotPickActive),
                          title: hotspotPickActive
                            ? t("clickToSetHotspot")
                            : tp("hotspot"),
                          ariaLabel: hotspotPickActive
                            ? t("clickToSetHotspot")
                            : tp("hotspot"),
                          group: "tool",
                          tone: hotspotPickActive
                            ? ("accent" as const)
                            : ("default" as const),
                        },
                        {
                          id: "ani-undo",
                          label: t("undo"),
                          onClick: onUndo,
                          disabled: !canUndo,
                          title: t("undoShortcut"),
                          ariaLabel: t("undoShortcut"),
                          group: "history",
                          icon: <UndoArrowIcon />,
                          shortcutHint: "Ctrl+Z",
                        },
                        {
                          id: "ani-redo",
                          label: t("redo"),
                          onClick: onRedo,
                          disabled: !canRedo,
                          title: t("redoShortcut"),
                          ariaLabel: t("redoShortcut"),
                          group: "history",
                          icon: <RedoArrowIcon />,
                          shortcutHint: "Ctrl+Y",
                        },
                      ]}
                    />
                  </div>
                </SlotReplacementSurface>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  gap: "1rem",
                  position: "relative",
                  zIndex: 1,
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <StudioSlotEmptyState
                    slotId={selectedSlotId}
                    onStaticFile={onSelectSlotStaticFile}
                    onAnimatedFile={onSelectSlotAnimatedFile}
                    onImageSequenceFiles={onSelectSlotImageSequenceFiles}
                  />
                </div>
              </div>
            )}
          </main>

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
                    onChange={onSimulationThemeModeChange}
                  />
                </div>
              }
            >
              <AniSimulation
                imageUrl={selectedSlotBound && ani ? activeImageUrl : null}
                sourceWidth={selectedSlotBound && ani ? activeSourceWidth : 0}
                sourceHeight={selectedSlotBound && ani ? activeSourceHeight : 0}
                fitMode={
                  selectedSlotBound && ani ? activeEdit.fitMode : "contain"
                }
                offsetX={selectedSlotBound && ani ? activeEdit.offsetX : 0}
                offsetY={selectedSlotBound && ani ? activeEdit.offsetY : 0}
                scale={selectedSlotBound && ani ? activeEdit.scale : 1}
                rotation={selectedSlotBound && ani ? activeEdit.rotation : 0}
                flipX={selectedSlotBound && ani ? activeEdit.flipX : false}
                flipY={selectedSlotBound && ani ? activeEdit.flipY : false}
                cursorSize={selectedSlotBound && ani ? ani.cursorSize : 32}
                hotspotX={selectedSlotBound && ani ? ani.hotspotX : 0}
                hotspotY={selectedSlotBound && ani ? ani.hotspotY : 0}
                slotSources={slotSimulationSources}
                selectedSlotId={selectedSlotId}
                themeMode={simulationThemeMode}
                sceneId={simulationSceneId}
              />
            </SimulationFooter>
          ) : null}
        </div>
      </div>

      <StudioInspector
        style={{
          width: "17rem",
          borderLeft: "1px solid var(--color-border)",
          backgroundColor: "var(--studio-chrome-bg)",
          padding: "1.25rem",
          flexShrink: 0,
          overflowY: "auto",
        }}
        summary={
          selectedSlotBound && ani ? (
            null
          ) : (
            <StudioInspectorCompactGuidance
              title={t("slotEmptyTitle")}
              summary={t("slotEmptySub")}
              lines={[t("slotStaticUploadSub"), t("slotAniUploadSub")]}
            />
          )
        }
      >
        {error && (
          <p
            role="alert"
            style={{ fontSize: "0.8125rem", color: "var(--color-error)" }}
          >
            {error}
          </p>
        )}

        {selectedSlotBound && ani ? (
          <>
            <StudioInspectorGroup data-testid="studio-inspector-group-current">
              <StudioInspectorSection title={tp("currentCursor")}>
                <StudioInspectorRow
                  label={tp("role")}
                  value={stageSlotLabel}
                />
                <StudioInspectorRow
                  label={tp("fileName")}
                  value={ani.cursorName}
                />
                <StudioInspectorRow
                  label={tp("format")}
                  value={stageFormatSummary}
                />
              </StudioInspectorSection>
            </StudioInspectorGroup>

            <StudioInspectorGroup data-testid="studio-inspector-group-image">
              <StudioInspectorSection title={tp("output")}>
                <StudioInspectorPreviewStrip label={tp("actualSize")}>
                  <ActualSizePreview
                    background="#ffffff"
                    border="1px solid var(--color-border)"
                  >
                    <FramedCursorPreview
                      imageUrl={activeImageUrl}
                      sourceWidth={activeSourceWidth}
                      sourceHeight={activeSourceHeight}
                      fitMode={activeEdit.fitMode}
                      offsetX={activeEdit.offsetX}
                      offsetY={activeEdit.offsetY}
                      scale={activeEdit.scale}
                      rotation={activeEdit.rotation}
                      flipX={activeEdit.flipX}
                      flipY={activeEdit.flipY}
                      viewportSize={ani.cursorSize}
                      alt={tp("lightPreview")}
                    />
                  </ActualSizePreview>
                  <ActualSizePreview
                    background="#1a1a1a"
                    border="1px solid var(--color-border)"
                  >
                    <FramedCursorPreview
                      imageUrl={activeImageUrl}
                      sourceWidth={activeSourceWidth}
                      sourceHeight={activeSourceHeight}
                      fitMode={activeEdit.fitMode}
                      offsetX={activeEdit.offsetX}
                      offsetY={activeEdit.offsetY}
                      scale={activeEdit.scale}
                      rotation={activeEdit.rotation}
                      flipX={activeEdit.flipX}
                      flipY={activeEdit.flipY}
                      viewportSize={ani.cursorSize}
                      alt={tp("darkPreview")}
                    />
                  </ActualSizePreview>
                </StudioInspectorPreviewStrip>
                <StudioInspectorRow
                  label={tp("sizeSummary")}
                  value={
                    <StudioInspectorSizeSummary
                      sourceLabel={tp("sourceSize")}
                      sourceValue={`${ani.sourceWidth} x ${ani.sourceHeight}`}
                      outputLabel={tp("outputSize")}
                      outputValue={`${ani.cursorSize} x ${ani.cursorSize}`}
                    />
                  }
                />
                <StudioInspectorSegmentedControl
                  value={ani.cursorSize}
                  options={[32, 48, 64] as const}
                  onChange={onAniCursorSizeChange}
                  ariaLabel={tp("output")}
                  getLabel={(size) => `${size}`}
                />
                <StudioInspectorSegmentedControl
                  value={activeEdit.fitMode}
                  options={["contain", "cover"] as const}
                  onChange={handleFitModeChange}
                  ariaLabel={tp("framing")}
                  getLabel={(value) =>
                    value === "contain" ? tp("fitContain") : tp("fitCover")
                  }
                />
              </StudioInspectorSection>
            </StudioInspectorGroup>

            <StudioInspectorGroup data-testid="studio-inspector-group-adjust">
              <StudioInspectorSection
                title={tp("adjust")}
                action={
                  <StudioInspectorTextAction
                    variant="button"
                    onClick={() => handleOffsetChange(0, 0)}
                  >
                    {tp("center")}
                  </StudioInspectorTextAction>
                }
              >
                {supportsFrameEditScope ? (
                  <StudioInspectorSegmentedControl
                    value={activeEditScope}
                    options={["all-frames", "selected-frame"] as const}
                    onChange={setEditScope}
                    ariaLabel={tp("editScope")}
                    getLabel={(value) =>
                      value === "all-frames"
                        ? tp("allFrames")
                        : tp("selectedFrame")
                    }
                  />
                ) : null}
                <ImageTransformControls
                  rotation={activeEdit.rotation}
                  flipX={activeEdit.flipX}
                  flipY={activeEdit.flipY}
                  onTransform={handleImageTransform}
                />
                <StudioInspectorSliderControl
                  label={tp("scale")}
                  value={activeEdit.scale}
                  valueLabel={`${Math.round(activeEdit.scale * 100)}%`}
                  editValue={String(Math.round(activeEdit.scale * 100))}
                  min={0.25}
                  max={3}
                  step={0.05}
                  onChange={handleScaleChange}
                  onCommit={onEndContinuousHistoryAction}
                  parseEditValue={(draft) => Number(draft) / 100}
                />
                <div
                  style={{
                    display: "grid",
                    gap: "0.55rem",
                  }}
                >
                  <StudioInspectorSliderControl
                    label={tp("offsetX")}
                    aria-label={tp("offsetX")}
                    value={activeEdit.offsetX}
                    valueLabel={activeEdit.offsetX}
                    min={-128}
                    max={128}
                    step={1}
                    onChange={(nextX) =>
                      handleOffsetChange(nextX, activeEdit.offsetY)
                    }
                    onCommit={onEndContinuousHistoryAction}
                  />
                  <StudioInspectorSliderControl
                    label={tp("offsetY")}
                    aria-label={tp("offsetY")}
                    value={activeEdit.offsetY}
                    valueLabel={activeEdit.offsetY}
                    min={-128}
                    max={128}
                    step={1}
                    onChange={(nextY) =>
                      handleOffsetChange(activeEdit.offsetX, nextY)
                    }
                    onCommit={onEndContinuousHistoryAction}
                  />
                </div>
              </StudioInspectorSection>

              <StudioInspectorSection
                title={tp("hotspot")}
                action={
                  <StudioInspectorTextAction
                    variant="button"
                    onClick={onRecommendHotspot}
                  >
                    {ani.hotspotMode === "auto"
                      ? tp("recommendHotspotAgain")
                      : tp("recommendHotspot")}
                  </StudioInspectorTextAction>
                }
              >
                <HotspotModeBadge>
                  {ani.hotspotMode === "auto"
                    ? tp("autoHotspot")
                    : tp("manualHotspot")}
                </HotspotModeBadge>
                <div
                  style={{
                    display: "grid",
                    gap: "0.55rem",
                  }}
                >
                  <StudioInspectorSliderControl
                    label={tp("hotspotX")}
                    aria-label={tp("hotspotX")}
                    value={ani.hotspotX}
                    valueLabel={ani.hotspotX}
                    min={0}
                    max={255}
                    step={1}
                    onChange={(nextX) => onHotspotChange(nextX, ani.hotspotY)}
                  />
                  <StudioInspectorSliderControl
                    label={tp("hotspotY")}
                    aria-label={tp("hotspotY")}
                    value={ani.hotspotY}
                    valueLabel={ani.hotspotY}
                    min={0}
                    max={255}
                    step={1}
                    onChange={(nextY) => onHotspotChange(ani.hotspotX, nextY)}
                  />
                </div>
              </StudioInspectorSection>

            </StudioInspectorGroup>
          </>
        ) : null}
      </StudioInspector>
    </div>
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

function HotspotModeBadge({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-testid="studio-hotspot-mode"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifySelf: "start",
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-primary)",
        color: "var(--color-text-primary)",
        fontSize: "0.75rem",
        fontWeight: 650,
        lineHeight: 1,
        padding: "0.35rem 0.5rem",
      }}
    >
      {children}
    </div>
  );
}

function ActualSizePreview({
  background,
  border,
  children,
}: {
  background: string;
  border: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-testid="studio-output-mini-preview"
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
      {children}
    </div>
  );
}

function capitalizeSlotId(slotId: string | undefined) {
  if (!slotId) return "Slot";
  return `${slotId.slice(0, 1).toUpperCase()}${slotId.slice(1)}`;
}

function setInteractiveDotPosition(
  element: HTMLElement,
  clientX: number,
  clientY: number
) {
  const rect = element.getBoundingClientRect();
  element.style.setProperty("--mouse-x", `${clientX - rect.left}px`);
  element.style.setProperty("--mouse-y", `${clientY - rect.top}px`);
}

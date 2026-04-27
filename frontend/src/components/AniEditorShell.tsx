"use client";

import { CSSProperties, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import CursorCanvas from "@/components/CursorCanvas";
import AniSimulation from "@/components/AniSimulation";
import CanvasViewZoomControl, {
  type CanvasViewZoom,
} from "@/components/CanvasViewZoomControl";
import type { SimulationThemeMode } from "@/components/CursorSimulationSurface";
import FramedCursorPreview from "@/components/FramedCursorPreview";
import NameInput from "@/components/NameInput";
import SimulationThemeModeSwitch from "@/components/SimulationThemeModeSwitch";
import SimulationSceneContextHint from "@/components/SimulationSceneContextHint";
import SimulationSceneTabs from "@/components/SimulationSceneTabs";
import SlotRail from "@/components/SlotRail";
import SlotReplacementSurface from "@/components/SlotReplacementSurface";
import SimulationFooter from "@/components/SimulationFooter";
import StudioSelectionSummary from "@/components/StudioSelectionSummary";
import StudioInspector, {
  StudioInspectorCompactGuidance,
  StudioInspectorGroup,
  StudioInspectorNumberField,
  StudioInspectorRow,
  StudioInspectorSection,
  StudioInspectorSegmentedControl,
  StudioInspectorTextAction,
} from "@/components/StudioInspector";
import StudioSlotEmptyState from "@/components/StudioSlotEmptyState";
import StudioStageActionBar from "@/components/StudioStageActionBar";
import StudioStageHeader from "@/components/StudioStageHeader";
import { StudioShellInteractionStyles } from "@/components/StudioSurfaceCard";
import { type FitMode } from "@/lib/cursorFrame";
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
  onOffsetChange,
  onHotspotChange,
  onScaleChange,
  onFitModeChange,
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
  const activeImageUrl = selectedAniFrame?.url ?? imageUrl;
  const supportsFrameEditScope = ani?.sourceKind === "image-sequence";
  const activeEditScope = supportsFrameEditScope ? editScope : "all-frames";
  const handleOffsetChange = (x: number, y: number) =>
    onOffsetChange(x, y, activeEditScope);
  const handleScaleChange = (scale: number) =>
    onScaleChange(scale, activeEditScope);
  const handleFitModeChange = (fitMode: FitMode) =>
    onFitModeChange(fitMode, activeEditScope);
  const stageSlotLabel = t(`slot${capitalizeSlotId(selectedSlotId)}`);
  const stageTypeLabel = selectedSlot.kind ? selectedSlot.kind.toUpperCase() : "ANI";
  const stageHotspotBadge =
    ani && ani.hotspotMode === "auto" ? tp("recommended") : tp("manual");
  const stageKindSummary = selectedSlot.kind
    ? selectedSlot.kind === "static"
      ? t("slotStatic")
      : t("slotAnimated")
    : t("slotKindUnset");
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
                  }}
                >
                  <StudioStageHeader
                    slotLabel={stageSlotLabel}
                    typeLabel={stageTypeLabel}
                    cursorName={ani.cursorName}
                    statusBadge={stageHotspotBadge}
                    actions={
                      <CanvasViewZoomControl
                        value={canvasViewZoom}
                        onChange={onCanvasViewZoomChange}
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
                    <CursorCanvas
                      imageUrl={activeImageUrl}
                      sourceWidth={ani.sourceWidth}
                      sourceHeight={ani.sourceHeight}
                      fitMode={ani.fitMode}
                      offsetX={ani.offsetX}
                      offsetY={ani.offsetY}
                      scale={ani.scale}
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
                    width="min(52rem, 100%)"
                    minHeight="20rem"
                    boxed
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
                sourceWidth={selectedSlotBound && ani ? ani.sourceWidth : 0}
                sourceHeight={selectedSlotBound && ani ? ani.sourceHeight : 0}
                fitMode={selectedSlotBound && ani ? ani.fitMode : "contain"}
                offsetX={selectedSlotBound && ani ? ani.offsetX : 0}
                offsetY={selectedSlotBound && ani ? ani.offsetY : 0}
                scale={selectedSlotBound && ani ? ani.scale : 1}
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
          backgroundColor: "var(--color-bg-secondary)",
          padding: "1.25rem",
          flexShrink: 0,
          overflowY: "auto",
        }}
        summary={
          selectedSlotBound && ani ? (
            <StudioSelectionSummary
              slotLabelTitle={t("slotRailTitle")}
              slotLabel={stageSlotLabel}
              cursorLabelTitle={tp("cursor")}
              cursorName={ani.cursorName}
              statusLabelTitle={tp("status")}
              statusLabel={
                ani.hotspotMode === "auto" ? tp("recommended") : tp("manual")
              }
              typeLabelTitle={t("slotTypeLabel")}
              typeLabel={stageKindSummary}
            />
          ) : (
            <StudioInspectorCompactGuidance
              title={t("slotEmptyTitle")}
              summary={t("slotEmptySub")}
              lines={[t("slotStaticUploadSub"), t("slotAniUploadSub")]}
            />
          )
        }
        previews={
          selectedSlotBound && ani ? (
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
                >
                  <FramedCursorPreview
                    imageUrl={activeImageUrl}
                    sourceWidth={ani.sourceWidth}
                    sourceHeight={ani.sourceHeight}
                    fitMode={ani.fitMode}
                    offsetX={ani.offsetX}
                    offsetY={ani.offsetY}
                    scale={ani.scale}
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
                    sourceWidth={ani.sourceWidth}
                    sourceHeight={ani.sourceHeight}
                    fitMode={ani.fitMode}
                    offsetX={ani.offsetX}
                    offsetY={ani.offsetY}
                    scale={ani.scale}
                    viewportSize={ani.cursorSize}
                    alt={tp("darkPreview")}
                  />
                </ActualSizePreview>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {tp("actualSize")}
              </div>
            </div>
          ) : null
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
            <StudioInspectorGroup data-testid="studio-inspector-group-image">
              <StudioInspectorSection title={tp("output")}>
                <StudioInspectorRow
                  label={tp("original")}
                  value={`${ani.sourceWidth} x ${ani.sourceHeight}`}
                />
                <StudioInspectorSegmentedControl
                  value={ani.cursorSize}
                  options={[32, 48, 64] as const}
                  onChange={onAniCursorSizeChange}
                  ariaLabel={tp("output")}
                  getLabel={(size) => `${size}`}
                />
              </StudioInspectorSection>

              <StudioInspectorSection title={tp("framing")}>
                <StudioInspectorSegmentedControl
                  value={ani.fitMode}
                  options={["contain", "cover"] as const}
                  onChange={handleFitModeChange}
                  ariaLabel={tp("framing")}
                  getLabel={(value) =>
                    value === "contain" ? tp("fitContain") : tp("fitCover")
                  }
                />
              </StudioInspectorSection>

              {supportsFrameEditScope ? (
                <StudioInspectorSection title={tp("editScope")}>
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
                </StudioInspectorSection>
              ) : null}

              <StudioInspectorSection title={tp("name")}>
                <NameInput
                  value={ani.cursorName}
                  onChange={onAniNameChange}
                  placeholder={tp("namePlaceholder")}
                />
              </StudioInspectorSection>
            </StudioInspectorGroup>

            <StudioInspectorGroup data-testid="studio-inspector-group-transform">
                <StudioInspectorSection
                  title={tp("hotspot")}
                  action={
                    <StudioInspectorTextAction onClick={onRecommendHotspot}>
                      {ani.hotspotMode === "auto"
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
                    value={ani.hotspotX}
                    step={1}
                    onChange={(event) => {
                      const nextX = Number(event.target.value);
                      onHotspotChange(
                        Number.isFinite(nextX) ? nextX : 0,
                        ani.hotspotY
                      );
                    }}
                  />
                  <StudioInspectorNumberField
                    label={tp("hotspotY")}
                    aria-label={tp("hotspotY")}
                    value={ani.hotspotY}
                    step={1}
                    onChange={(event) => {
                      const nextY = Number(event.target.value);
                      onHotspotChange(
                        ani.hotspotX,
                        Number.isFinite(nextY) ? nextY : 0
                      );
                    }}
                  />
                </div>
                <StudioInspectorRow
                  label={tp("position")}
                  value={`${ani.hotspotX}, ${ani.hotspotY}`}
                />
                <StudioInspectorRow
                  label={tp("status")}
                  value={
                    ani.hotspotMode === "auto" ? tp("recommended") : tp("manual")
                  }
                />
              </StudioInspectorSection>

              <StudioInspectorSection title={tp("scale")}>
                <input
                  type="range"
                  min="0.25"
                  max="3"
                  step="0.05"
                  value={ani.scale}
                  onChange={(e) => handleScaleChange(Number(e.target.value))}
                  onPointerUp={onEndContinuousHistoryAction}
                  onPointerCancel={onEndContinuousHistoryAction}
                  onBlur={onEndContinuousHistoryAction}
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
                  {Math.round(ani.scale * 100)}%
                </div>
              </StudioInspectorSection>

              <StudioInspectorSection
                title={tp("position")}
                action={
                  <StudioInspectorTextAction
                    onClick={() => handleOffsetChange(0, 0)}
                  >
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
                    value={ani.offsetX}
                    step={1}
                    onChange={(event) => {
                      const nextX = Number(event.target.value);
                      handleOffsetChange(
                        Number.isFinite(nextX) ? nextX : 0,
                        ani.offsetY
                      );
                    }}
                  />
                  <StudioInspectorNumberField
                    label={tp("offsetY")}
                    aria-label={tp("offsetY")}
                    value={ani.offsetY}
                    step={1}
                    onChange={(event) => {
                      const nextY = Number(event.target.value);
                      handleOffsetChange(
                        ani.offsetX,
                        Number.isFinite(nextY) ? nextY : 0
                      );
                    }}
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

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
import ImageTransformControls from "@/components/ImageTransformControls";
import MobileGuard from "@/components/MobileGuard";
import SimulationThemeModeSwitch from "@/components/SimulationThemeModeSwitch";
import SimulationSceneContextHint from "@/components/SimulationSceneContextHint";
import SimulationSceneTabs from "@/components/SimulationSceneTabs";
import SlotRail from "@/components/SlotRail";
import Simulation from "@/components/Simulation";
import SimulationFooter from "@/components/SimulationFooter";
import SlotReplacementSurface from "@/components/SlotReplacementSurface";
import StudioQuickBackgroundDecision from "@/components/StudioQuickBackgroundDecision";
import StudioQuickResult from "@/components/StudioQuickResult";
import StudioQuickStart from "@/components/StudioQuickStart";
import StudioHeaderControls from "@/components/StudioHeaderControls";
import StudioInspector, {
  StudioInspectorCompactGuidance,
  StudioInspectorGroup,
  StudioInspectorPreviewStrip,
  StudioInspectorRow,
  StudioInspectorSection,
  StudioInspectorSecondaryButton,
  StudioInspectorSegmentedControl,
  StudioInspectorSizeSummary,
  StudioInspectorSliderControl,
  StudioInspectorTextAction,
} from "@/components/StudioInspector";
import StudioSlotEmptyState from "@/components/StudioSlotEmptyState";
import StudioStageActionBar from "@/components/StudioStageActionBar";
import StudioStageHeader from "@/components/StudioStageHeader";
import WorkflowPicker from "@/components/WorkflowPicker";
import {
  STUDIO_INTERACTION_TRANSITION,
  default as StudioSurfaceCard,
  StudioShellInteractionStyles,
} from "@/components/StudioSurfaceCard";
import InteractiveDotBackground from "@/components/InteractiveDotBackground";
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
import {
  ANI_ANIMATED_GIF_WORKFLOW_ID,
  ANI_MULTIPLE_PNGS_WORKFLOW_ID,
  ANI_VIDEO_TO_ANI_WORKFLOW_ID,
  CUR_STATIC_IMAGE_WORKFLOW_ID,
  isSelectableWorkflow,
  type WorkflowOptionId,
} from "@/lib/studioWorkflow";
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
    downloadGuideVariant,
    showOriginal,
    previewUrl,
    pendingBackgroundRemovalSlotIds,
    selectFile,
    selectAniFile,
    selectVideoFile,
    selectSlot,
    selectSelectedSlotStaticFile,
    selectSelectedSlotAnimatedFile,
    selectSelectedSlotVideoFile,
    selectSelectedSlotImageSequenceFiles,
    selectAniFrame,
    deleteAniFrame,
    reorderAniFrame,
    insertAniFrameFiles,
    setAniFrameDuration,
    setAllAniFrameDurations,
    processBgRemoval,
    skipBgRemoval,
    toggleOriginal,
    retryBgRemoval,
    setHotspot,
    setOffset,
    setScale,
    setFitMode,
    applyImageTransform,
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
    canDownloadGif,
    downloadAll,
    download,
    downloadGif,
    closeGuide,
  } = useStudio();
  const [hotspotPickActive, setHotspotPickActive] = useState(false);
  const [simulationCollapsed, setSimulationCollapsed] = useState(false);
  const [simulationThemeMode, setSimulationThemeModeState] =
    useState<SimulationThemeMode>(() => resolveInitialSimulationThemeMode());
  const [
    simulationThemeModeManuallyChanged,
    setSimulationThemeModeManuallyChanged,
  ] = useState(false);
  const [canvasViewZoom, setCanvasViewZoom] = useState<CanvasViewZoom>(1);
  const [simulationSceneId, setSimulationSceneId] =
    useState<SimulationSceneId>(DEFAULT_SIMULATION_SCENE_ID);
  const [experienceMode, setExperienceMode] =
    useState<StudioExperienceMode>("quick");
  const t = useTranslations("studio");
  const tp = useTranslations("panel");
  const tu = useTranslations("upload");
  const searchParams = useSearchParams();
  const router = useRouter();
  const workflowParam = getSelectableWorkflowParam(searchParams.get("workflow"));
  const [selectedWorkflowId, setSelectedWorkflowId] =
    useState<WorkflowOptionId | null>(workflowParam);
  const activeWorkflowId = workflowParam ?? selectedWorkflowId;
  const handleSimulationThemeModeChange = (next: SimulationThemeMode) => {
    setSimulationThemeModeManuallyChanged(true);
    setSimulationThemeModeState(next);
  };

  useEffect(() => {
    trackEvent(
      "studio_entry",
      workflowParam
        ? {
            source: "studio_page",
            workflow: workflowParam,
          }
        : {
            source: "studio_page",
          }
    );
  }, [workflowParam]);

  useEffect(() => {
    if (workflowParam) {
      setSelectedWorkflowId(workflowParam);
    }
  }, [workflowParam]);

  useEffect(() => {
    if (simulationThemeModeManuallyChanged) return;

    if (typeof MutationObserver === "undefined") return;

    const themeObserver = new MutationObserver(() => {
      setSimulationThemeModeState(resolveDocumentSimulationThemeMode());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      themeObserver.disconnect();
    };
  }, [simulationThemeModeManuallyChanged]);

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
  const stageFormatSummary = cursor ? t("slotStatic") : stageKindSummary;
  const currentSlotDownloadLabel =
    state === "ani-editing" || selectedSlot.kind === "animated"
      ? t("downloadCurrentAni")
      : state === "editing" ||
          state === "uploaded" ||
          state === "processing" ||
          selectedSlot.kind === "static"
        ? t("downloadCurrentCur")
        : t("downloadCurrentSlot");
  const currentSlotDownloadDescription =
    state === "ani-editing" || selectedSlot.kind === "animated"
      ? t("downloadCurrentAniLabel")
      : state === "editing" ||
          state === "uploaded" ||
          state === "processing" ||
          selectedSlot.kind === "static"
        ? t("downloadCurrentCurLabel")
        : t("downloadCurrentSlotLabel");
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
  const isBackgroundDecisionState =
    state === "uploaded" || state === "processing";
  const isCurrentSlotBackgroundDecision =
    isBackgroundDecisionState &&
    pendingBackgroundRemovalSlotIds.includes(selectedSlotId);
  const showPendingBackgroundDecisionNotice =
    pendingBackgroundRemovalSlotIds.length > 0 &&
    !isCurrentSlotBackgroundDecision;
  const showSlotSourceEntry =
    state !== "uploaded" && state !== "processing" && !selectedSlotBound;
  const showCompactInspectorGuidance = isBackgroundDecisionState;
  const showWorkflowGuide =
    state !== "ani-editing" &&
    experienceMode === "quick" &&
    !selectedSlotBound &&
    !isBackgroundDecisionState &&
    !activeWorkflowId;
  const showQuickStart =
    state !== "ani-editing" &&
    experienceMode === "quick" &&
    !selectedSlotBound &&
    !isBackgroundDecisionState &&
    !showWorkflowGuide;
  const showQuickResult =
    state === "editing" &&
    experienceMode === "quick" &&
    Boolean(cursor && selectedSlotBound && (previewUrl || displayUrl));
  const showQuickBackgroundDecision =
    isBackgroundDecisionState &&
    experienceMode === "quick" &&
    Boolean(cursor && selectedSlotBound);
  const isQuickExperience =
    state !== "ani-editing" &&
    experienceMode === "quick" &&
    (showWorkflowGuide ||
      showQuickStart ||
      showQuickResult ||
      showQuickBackgroundDecision);
  const quickPreviewUrl = previewUrl || displayUrl;
  const quickStartConfig = getQuickStartConfig(activeWorkflowId, t, tu);
  const showAdvancedStaticShell =
    showStaticStudioShell && experienceMode === "advanced";
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

  useEffect(() => {
    if (showAdvancedStaticShell && showSlotSourceEntry) {
      setSimulationCollapsed(true);
    }
  }, [selectedSlotId, showAdvancedStaticShell, showSlotSourceEntry]);

  return (
    <MobileGuard>
      <div
        data-testid="studio-theme-scope"
        data-studio-shell
        style={studioThemeScopeStyle}
      >
        <StudioShellInteractionStyles />
        <StudioHeaderControls
          canSaveProject={false}
          saveProjectLabel={t("saveProject")}
          saveProjectDescription={t("saveProjectLoginRequiredDescription")}
          saveProjectStatusLabel={t("saveProjectLoginRequired")}
          projectTitleLabel={t("untitledProject")}
          hideDownloadActions={isQuickExperience}
          onDownload={isQuickExperience ? undefined : downloadAll}
          onSecondaryDownload={isQuickExperience ? undefined : download}
          onTertiaryDownload={isQuickExperience ? undefined : downloadGif}
          downloading={downloading}
          canDownload={isQuickExperience ? false : canDownloadAll}
          canSecondaryDownload={isQuickExperience ? false : canDownload}
          canTertiaryDownload={isQuickExperience ? false : canDownloadGif}
          primaryActionLabel={isQuickExperience ? undefined : t("downloadAllRoles")}
          primaryActionDescription={
            isQuickExperience ? undefined : t("downloadAllRolesLabel")
          }
          secondaryActionLabel={
            isQuickExperience ? undefined : currentSlotDownloadLabel
          }
          secondaryActionDescription={
            isQuickExperience ? undefined : currentSlotDownloadDescription
          }
          tertiaryActionLabel={
            !isQuickExperience && canDownloadGif ? t("downloadGif") : undefined
          }
          tertiaryActionDescription={
            !isQuickExperience && canDownloadGif ? t("downloadGifLabel") : undefined
          }
        />
        {showPendingBackgroundDecisionNotice ? (
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
            onSelectSlot={(slotId) => {
              setExperienceMode("advanced");
              selectSlot(slotId);
            }}
            onSelectSlotStaticFile={selectSelectedSlotStaticFile}
            onSelectSlotAnimatedFile={selectSelectedSlotAnimatedFile}
            onSelectSlotImageSequenceFiles={selectSelectedSlotImageSequenceFiles}
            onSelectAniFrame={selectAniFrame}
            onDeleteAniFrame={deleteAniFrame}
            onReorderAniFrame={reorderAniFrame}
            onInsertAniFrameFiles={insertAniFrameFiles}
            onSetAniFrameDuration={setAniFrameDuration}
            onSetAllAniFrameDurations={setAllAniFrameDurations}
            onOffsetChange={setOffset}
            onHotspotChange={setHotspot}
            onScaleChange={setScale}
            onFitModeChange={setFitMode}
            onImageTransform={applyImageTransform}
            onAniCursorSizeChange={setAniCursorSize}
            onAniNameChange={setCursorName}
            onRecommendHotspot={recommendHotspot}
            onEndContinuousHistoryAction={endContinuousHistoryAction}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            simulationThemeMode={simulationThemeMode}
            onSimulationThemeModeChange={handleSimulationThemeModeChange}
            onResetHotspot={() => setHotspot(0, 0)}
            onReset={reset}
            canvasViewZoom={canvasViewZoom}
            onCanvasViewZoomChange={setCanvasViewZoom}
          />
        ) : (
          <>
      <div
        data-testid="studio-app-shell"
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          backgroundColor: "var(--color-bg-primary)",
        }}
      >
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
          {showWorkflowGuide ? (
            <WorkflowPicker
              onSelectWorkflow={(workflowId) => setSelectedWorkflowId(workflowId)}
            />
          ) : null}

          {showQuickStart ? (
            <StudioQuickStart
              title={quickStartConfig.title}
              description={quickStartConfig.description}
              staticUploadLabel={t("slotStaticUpload")}
              staticUploadDescription={t("slotStaticUploadSub")}
              animatedUploadLabel={
                quickStartConfig.primarySource === "animated"
                  ? t("slotAniUpload")
                  : undefined
              }
              animatedUploadDescription={
                quickStartConfig.primarySource === "animated"
                  ? t("slotAniUploadSub")
                  : undefined
              }
              imageSequenceUploadLabel={t("emptySlotMultiplePngs")}
              imageSequenceUploadDescription={tu("aniMultiplePngsSub")}
              videoUploadLabel={tu("aniVideoToAni")}
              videoUploadDescription={tu("aniVideoToAniSub")}
              primarySource={quickStartConfig.primarySource}
              busy={
                state === "ani-upload" &&
                activeWorkflowId === ANI_VIDEO_TO_ANI_WORKFLOW_ID
              }
              busyLabel={t("videoExtractingTitle")}
              busyDescription={t("videoExtractingDescription")}
              onStaticFile={(file) => {
                setExperienceMode("quick");
                selectSelectedSlotStaticFile(file);
              }}
              onAnimatedFile={
                quickStartConfig.primarySource === "animated"
                  ? (file) => {
                      setExperienceMode(
                        activeWorkflowId === ANI_ANIMATED_GIF_WORKFLOW_ID
                          ? "advanced"
                          : "quick"
                      );
                      if (activeWorkflowId === ANI_ANIMATED_GIF_WORKFLOW_ID) {
                        selectAniFile(file);
                        return;
                      }

                      selectSelectedSlotAnimatedFile(file);
                    }
                  : undefined
              }
              onVideoFile={
                quickStartConfig.primarySource === "video"
                  ? (file) => {
                      setExperienceMode("advanced");
                      if (activeWorkflowId === ANI_VIDEO_TO_ANI_WORKFLOW_ID) {
                        selectVideoFile(file);
                        return;
                      }

                      selectSelectedSlotVideoFile(file);
                    }
                  : undefined
              }
              onImageSequenceFiles={(files) => {
                setExperienceMode(
                  activeWorkflowId === ANI_MULTIPLE_PNGS_WORKFLOW_ID
                    ? "advanced"
                    : "quick"
                );
                selectSelectedSlotImageSequenceFiles(files);
              }}
            />
          ) : null}

          {showQuickResult && cursor && quickPreviewUrl ? (
            <StudioQuickResult
              title={t("quickResultTitle")}
              description={t("quickResultDescription")}
              previewUrl={quickPreviewUrl}
              displayPreviewUrl={displayUrl}
              cursorName={cursor.cursorName}
              cursorSize={cursor.cursorSize}
              hotspotLabel={stageHotspotSummary ?? tp("manual")}
              typeLabel={stageFormatSummary}
              actualSizeLabel={tp("actualSize")}
              lightPreviewAlt={tp("lightPreview")}
              darkPreviewAlt={tp("darkPreview")}
              downloading={downloading}
              canDownload={canDownload}
              downloadLabel={t("quickDownload")}
              downloadDescription={t("quickDownloadDescription")}
              advancedLabel={t("openAdvancedEditor")}
              onDownload={download}
              onOpenAdvanced={() => setExperienceMode("advanced")}
            />
          ) : null}

          {showQuickBackgroundDecision && cursor ? (
            <StudioQuickBackgroundDecision
              title={t("quickBackgroundRemoveTitle")}
              description={
                state === "processing"
                  ? tu("removingBg")
                  : t("quickBackgroundRemoveDescription")
              }
              removeLabel={t("quickRemoveBackground")}
              keepLabel={t("quickUseAsIs")}
              processing={state === "processing"}
              previewUrl={displayUrl}
              cursorName={cursor.cursorName}
              onRemove={processBgRemoval}
              onKeep={skipBgRemoval}
            />
          ) : null}

          {showAdvancedStaticShell && (
            <div
              data-testid="studio-workspace"
              style={{
                flex: 1,
                minHeight: 0,
                width: "100%",
                display: "flex",
                flexDirection: "row",
                overflow: "hidden",
                backgroundColor: "var(--color-bg-primary)",
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
                data-testid="studio-editor-main"
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  backgroundColor: "var(--color-bg-primary)",
                  padding: "1rem",
                  gap: "0.85rem",
                  position: "relative",
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
                      padding: "1.1rem 1.1rem 0.85rem",
                      gap: "0.85rem",
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
                        onImageSequenceFiles={selectSelectedSlotImageSequenceFiles}
                      />
                    </div>
                  </div>
                ) : selectedSlotBound && cursor ? (
                  <SlotReplacementSurface
                    onStaticFile={selectSelectedSlotStaticFile}
                    onAnimatedFile={selectSelectedSlotAnimatedFile}
                    onImageSequenceFiles={selectSelectedSlotImageSequenceFiles}
                    style={{
                      flex: 1,
                      minHeight: 0,
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      padding: "1.1rem 1.1rem 0.85rem",
                      gap: "0.85rem",
                      backgroundColor: "var(--color-bg-primary)",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                  <StudioStageHeader
                    slotLabel={stageSlotLabel}
                    showSlotLabel={false}
                    cursorName={cursor.cursorName}
                    cursorNameLabel={tp("name")}
                    cursorNamePlaceholder={tp("namePlaceholder")}
                    onCursorNameChange={setCursorName}
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
                        layerTestId="studio-stage-dots"
                        baseColor="color-mix(in srgb, var(--color-text-primary) 14%, transparent)"
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.85rem",
                          flex: "1 1 58%",
                          minHeight: 0,
                          position: "relative",
                          zIndex: 1,
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
                          rotation={cursor.rotation}
                          flipX={cursor.flipX}
                          flipY={cursor.flipY}
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
                          <BackgroundRemovalDecisionDock
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
                          <BackgroundRemovalProcessingDock
                            title={tu("removingBg")}
                            summary={tu("removeBgSub")}
                          />
                        ) : null}
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
                          visibility: state === "editing" ? "visible" : "hidden",
                          pointerEvents: state === "editing" ? "auto" : "none",
                        }}
                      >
                        <StudioStageActionBar actions={stageActions} />
                        <CanvasViewZoomControl
                          value={canvasViewZoom}
                          onChange={setCanvasViewZoom}
                        />
                      </div>
                    </div>
                  </SlotReplacementSurface>
                ) : null}

                {hasSimulationNormal ? (
                  <SimulationFooter
                    collapsed={simulationCollapsed}
                    density={isBackgroundDecisionState ? "compact" : "default"}
                    onToggle={() => setSimulationCollapsed((current) => !current)}
                    headerControls={
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          flexWrap: "nowrap",
                          justifyContent: "flex-end",
                          minWidth: 0,
                        }}
                      >
                        <SimulationSceneTabs
                          value={simulationSceneId}
                          onChange={setSimulationSceneId}
                        />
                        <SimulationSceneContextHint sceneId={simulationSceneId} />
                        <SimulationThemeModeSwitch
                          value={simulationThemeMode}
                          onChange={handleSimulationThemeModeChange}
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

        {showAdvancedStaticShell ? (
        <StudioInspector
          style={{
            width: "20rem",
            borderLeft: "1px solid var(--color-border)",
            backgroundColor: "var(--studio-chrome-bg)",
            padding: "1rem 1.15rem",
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
              null
            ) : showCompactInspectorGuidance ? (
              <StudioInspectorCompactGuidance
                title={compactGuidanceContent.title}
                summary={compactGuidanceContent.summary}
                lines={compactGuidanceContent.lines}
              />
            ) : null
          }
        >
        {state === "editing" && !cursor && !selectedSlotBound ? (
          <>
            <StudioInspectorGroup data-testid="studio-inspector-group-current">
              <StudioInspectorSection title={tp("currentCursor")}>
                <StudioInspectorRow
                  label={tp("role")}
                  value={stageSlotLabel}
                />
                <StudioInspectorRow
                  label={tp("fileName")}
                  value={t("slotEmpty")}
                />
                <StudioInspectorRow
                  label={tp("format")}
                  value={stageKindSummary}
                />
              </StudioInspectorSection>
            </StudioInspectorGroup>

            <StudioInspectorGroup data-testid="studio-inspector-group-source">
              <StudioInspectorSection title={t("slotEmptyTitle")}>
                <StudioInspectorRow
                  label={t("slotStaticUpload")}
                  value={t("slotStaticUploadSub")}
                />
                <StudioInspectorRow
                  label={t("slotAniUpload")}
                  value={t("slotAniUploadSub")}
                />
              </StudioInspectorSection>
            </StudioInspectorGroup>
          </>
        ) : null}

        {state === "editing" && cursor && selectedSlotBound ? (
          <>
              <StudioInspectorGroup data-testid="studio-inspector-group-current">
                <StudioInspectorSection title={tp("currentCursor")}>
                  <StudioInspectorRow
                    label={tp("role")}
                    value={stageSlotLabel}
                  />
                  <StudioInspectorRow
                    label={tp("fileName")}
                    value={cursor.cursorName}
                  />
                  <StudioInspectorRow
                    label={tp("format")}
                    value={stageFormatSummary}
                  />
                </StudioInspectorSection>
              </StudioInspectorGroup>

              <StudioInspectorGroup data-testid="studio-inspector-group-image">
                <StudioInspectorSection title={tp("output")}>
                  {previewUrl ? (
                    <StudioInspectorPreviewStrip label={tp("actualSize")}>
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
                    </StudioInspectorPreviewStrip>
                  ) : null}
                  <StudioInspectorRow
                    label={tp("sizeSummary")}
                    value={
                      <StudioInspectorSizeSummary
                        sourceLabel={tp("sourceSize")}
                        sourceValue={`${cursor.sourceWidth} x ${cursor.sourceHeight}`}
                        outputLabel={tp("outputSize")}
                        outputValue={`${cursor.cursorSize} x ${cursor.cursorSize}`}
                      />
                    }
                  />
                  <StudioInspectorSegmentedControl
                    value={cursor.cursorSize}
                    options={[32, 48, 64] as const}
                    onChange={setCursorSize}
                    ariaLabel={tp("output")}
                    getLabel={(size) => `${size}`}
                  />
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
              </StudioInspectorGroup>

              <StudioInspectorGroup data-testid="studio-inspector-group-adjust">
                <StudioInspectorSection
                  title={tp("adjust")}
                  action={
                    <StudioInspectorTextAction
                      variant="button"
                      onClick={() => setOffset(0, 0)}
                    >
                      {tp("center")}
                    </StudioInspectorTextAction>
                  }
                >
                  <ImageTransformControls
                    rotation={cursor.rotation}
                    flipX={cursor.flipX}
                    flipY={cursor.flipY}
                    onTransform={applyImageTransform}
                  />
                  <StudioInspectorSliderControl
                    label={tp("scale")}
                    value={cursor.scale}
                    valueLabel={`${Math.round(cursor.scale * 100)}%`}
                    editValue={String(Math.round(cursor.scale * 100))}
                    min={0.25}
                    max={3}
                    step={0.05}
                    onChange={setScale}
                    onCommit={endContinuousHistoryAction}
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
                      value={cursor.offsetX}
                      valueLabel={cursor.offsetX}
                      min={-128}
                      max={128}
                      step={1}
                      onChange={(nextX) => setOffset(nextX, cursor.offsetY)}
                      onCommit={endContinuousHistoryAction}
                    />
                    <StudioInspectorSliderControl
                      label={tp("offsetY")}
                      aria-label={tp("offsetY")}
                      value={cursor.offsetY}
                      valueLabel={cursor.offsetY}
                      min={-128}
                      max={128}
                      step={1}
                      onChange={(nextY) => setOffset(cursor.offsetX, nextY)}
                      onCommit={endContinuousHistoryAction}
                    />
                  </div>
                </StudioInspectorSection>

                <StudioInspectorSection
                  title={tp("hotspot")}
                  action={
                    <StudioInspectorTextAction
                      variant="button"
                      onClick={recommendHotspot}
                    >
                      {cursor.hotspotMode === "auto"
                        ? tp("recommendHotspotAgain")
                        : tp("recommendHotspot")}
                    </StudioInspectorTextAction>
                  }
                >
                  <HotspotModeBadge>
                    {cursor.hotspotMode === "auto"
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
                      value={cursor.hotspotX}
                      valueLabel={cursor.hotspotX}
                      min={0}
                      max={255}
                      step={1}
                      onChange={(nextX) => setHotspot(nextX, cursor.hotspotY)}
                    />
                    <StudioInspectorSliderControl
                      label={tp("hotspotY")}
                      aria-label={tp("hotspotY")}
                      value={cursor.hotspotY}
                      valueLabel={cursor.hotspotY}
                      min={0}
                      max={255}
                      step={1}
                      onChange={(nextY) => setHotspot(cursor.hotspotX, nextY)}
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
        ) : null}
      </div>
        </>
      )}

      <GuideModal
        open={showGuide}
        onClose={closeGuide}
        variant={downloadGuideVariant}
      />
      </div>
    </MobileGuard>
  );
}

type StudioExperienceMode = "quick" | "advanced";

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

function BackgroundRemovalDecisionDock({
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
      data-testid="background-removal-decision-dock"
      role="status"
      style={{
        position: "relative",
        flexShrink: 0,
        width: "min(33rem, 100%)",
      }}
    >
      <StudioSurfaceCard
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.85rem",
          padding: "0.78rem 0.85rem",
          boxShadow:
            "0 10px 22px rgba(8, 12, 18, 0.12), 0 2px 8px rgba(8, 12, 18, 0.08)",
          backgroundColor:
            "color-mix(in srgb, var(--color-bg-secondary) 96%, white 4%)",
          borderColor: "color-mix(in srgb, var(--color-border) 84%, white 6%)",
        }}
      >
        <div style={{ display: "grid", gap: "0.2rem", minWidth: 0 }}>
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
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              lineHeight: 1.35,
            }}
          >
            {summary}
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.35,
            }}
          >
            {hint}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "0.45rem",
            minWidth: "12.5rem",
          }}
        >
          <BackgroundRemovalActionButton
            label={removeLabel}
            summary={removeSub}
            accent
            compact
            onClick={onRemoveBg}
          />
          <BackgroundRemovalActionButton
            label={keepLabel}
            summary={keepSub}
            compact
            onClick={onSkipBg}
          />
        </div>
      </StudioSurfaceCard>
    </div>
  );
}

function BackgroundRemovalProcessingDock({
  title,
  summary,
}: {
  title: string;
  summary: string;
}) {
  return (
    <div
      data-testid="background-removal-processing-dock"
      style={{
        position: "relative",
        flexShrink: 0,
        width: "min(24rem, 100%)",
      }}
    >
      <StudioSurfaceCard
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          padding: "0.78rem 0.85rem",
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
  compact = false,
  onClick,
}: {
  label: string;
  summary: string;
  accent?: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "grid",
        gap: compact ? "0.1rem" : "0.2rem",
        textAlign: "left",
        padding: compact ? "0.55rem 0.62rem" : "0.75rem 0.875rem",
        borderRadius: compact ? "0.7rem" : "0.875rem",
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
          fontSize: compact ? "0.625rem" : "0.6875rem",
          lineHeight: compact ? 1.25 : 1.45,
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

function getSelectableWorkflowParam(workflowId: string | null) {
  if (!workflowId) return null;

  return isSelectableWorkflow(workflowId as WorkflowOptionId)
    ? (workflowId as WorkflowOptionId)
    : null;
}

function getQuickStartConfig(
  workflowId: WorkflowOptionId | null,
  t: ReturnType<typeof useTranslations>,
  tu: ReturnType<typeof useTranslations>
) {
  if (workflowId === ANI_ANIMATED_GIF_WORKFLOW_ID) {
    return {
      title: tu("aniAnimatedGif"),
      description: tu("aniAnimatedGifSub"),
      primarySource: "animated" as const,
    };
  }

  if (workflowId === ANI_MULTIPLE_PNGS_WORKFLOW_ID) {
    return {
      title: tu("aniMultiplePngs"),
      description: tu("aniMultiplePngsSub"),
      primarySource: "image-sequence" as const,
    };
  }

  if (workflowId === ANI_VIDEO_TO_ANI_WORKFLOW_ID) {
    return {
      title: tu("aniVideoToAni"),
      description: tu("aniVideoToAniSub"),
      primarySource: "video" as const,
    };
  }

  return {
    title: t("quickStartTitle"),
    description: t("quickStartDescription"),
    primarySource: "static" as const,
  };
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

const POINTINT_THEME_STORAGE_KEY = "pointint-theme";

function resolveInitialSimulationThemeMode(): SimulationThemeMode {
  const documentTheme = getDocumentThemeName();
  if (documentTheme && documentTheme !== "dark") {
    return siteThemeToSimulationThemeMode(documentTheme);
  }

  const storedTheme = getStoredThemeName();
  if (storedTheme) {
    return siteThemeToSimulationThemeMode(storedTheme);
  }

  return siteThemeToSimulationThemeMode(documentTheme);
}

function resolveDocumentSimulationThemeMode(): SimulationThemeMode {
  return siteThemeToSimulationThemeMode(getDocumentThemeName());
}

function getDocumentThemeName() {
  if (typeof document === "undefined") return null;

  return document.documentElement.getAttribute("data-theme");
}

function getStoredThemeName() {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(POINTINT_THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function siteThemeToSimulationThemeMode(
  themeName: string | null
): SimulationThemeMode {
  return themeName === "light" || themeName === "custom" ? "light" : "dark";
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
  ["--color-accent-primary" as string]: "var(--color-accent)",
  ["colorScheme" as string]: "var(--studio-color-scheme)",
};


"use client";

import { CSSProperties, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import CursorCanvas from "@/components/CursorCanvas";
import AniSimulation from "@/components/AniSimulation";
import type { BackgroundMode } from "@/components/CursorSimulationSurface";
import FramedCursorPreview from "@/components/FramedCursorPreview";
import NameInput from "@/components/NameInput";
import SimulationBackgroundModeSwitch from "@/components/SimulationBackgroundModeSwitch";
import SlotRail from "@/components/SlotRail";
import SlotReplacementSurface from "@/components/SlotReplacementSurface";
import SlotSourceChoiceCard from "@/components/SlotSourceChoiceCard";
import SimulationFooter from "@/components/SimulationFooter";
import StudioInspector, {
  StudioInspectorCompactGuidance,
  StudioInspectorRow,
  StudioInspectorSecondaryButton,
  StudioInspectorSection,
  StudioInspectorSegmentedControl,
} from "@/components/StudioInspector";
import StudioStageActionBar from "@/components/StudioStageActionBar";
import StudioStageHeader from "@/components/StudioStageHeader";
import { StudioShellInteractionStyles } from "@/components/StudioSurfaceCard";
import { type FitMode } from "@/lib/cursorFrame";
import { type CursorThemeProject, type SlotId } from "@/lib/cursorThemeProject";
import {
  buildProjectSlotSimulationSources,
  hasNormalSlotSimulationSource,
} from "@/lib/slotSimulationSources";
import { type AniData, type CursorSize } from "@/lib/useStudio";

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
  onOffsetChange: (x: number, y: number) => void;
  onHotspotChange: (x: number, y: number) => void;
  onScaleChange: (scale: number) => void;
  onFitModeChange: (fitMode: FitMode) => void;
  onAniCursorSizeChange: (size: CursorSize) => void;
  onAniNameChange: (name: string) => void;
  onRecommendHotspot: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onResetHotspot: () => void;
  onReset: () => void;
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
  onOffsetChange,
  onHotspotChange,
  onScaleChange,
  onFitModeChange,
  onAniCursorSizeChange,
  onAniNameChange,
  onRecommendHotspot,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onResetHotspot,
  onReset,
}: AniEditorShellProps) {
  const t = useTranslations("studio");
  const tp = useTranslations("panel");
  const [simulationCollapsed, setSimulationCollapsed] = useState(false);
  const [simulationBackgroundMode, setSimulationBackgroundMode] =
    useState<BackgroundMode>("dark");
  const selectedSlot = project.slots[selectedSlotId];
  const selectedSlotBound = Boolean(
    selectedSlot.asset.originalUrl || selectedSlot.asset.previewUrl || ani
  );
  const stageSlotLabel = t(`slot${capitalizeSlotId(selectedSlotId)}`);
  const stageTypeLabel = selectedSlot.kind ? selectedSlot.kind.toUpperCase() : "ANI";
  const stageHotspotBadge =
    ani && ani.hotspotMode === "auto" ? tp("recommended") : tp("manual");
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
        overflow: "hidden",
      }}
      data-testid="ani-editor-shell"
    >
      <StudioShellInteractionStyles />
      <div
        style={{
          flex: 1,
          minWidth: 0,
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
                      imageUrl={imageUrl}
                      sourceWidth={ani.sourceWidth}
                      sourceHeight={ani.sourceHeight}
                      fitMode={ani.fitMode}
                      offsetX={ani.offsetX}
                      offsetY={ani.offsetY}
                      scale={ani.scale}
                      hotspotX={ani.hotspotX}
                      hotspotY={ani.hotspotY}
                      onOffsetChange={onOffsetChange}
                      onHotspotChange={onHotspotChange}
                      hotspotPickActive={hotspotPickActive}
                      onHotspotPickComplete={() => onSetHotspotPickActive(false)}
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
                      gap: "1rem",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>
                      {hotspotPickActive
                        ? t("clickToSetHotspot")
                        : t("dragToMove")}
                    </span>
                    <span>{t("shortcutHotspot")}</span>
                  </div>

                    <StudioStageActionBar
                      actions={[
                        {
                          id: "ani-undo",
                          label: t("undo"),
                          onClick: onUndo,
                          disabled: !canUndo,
                          title: t("undoShortcut"),
                          ariaLabel: t("undoShortcut"),
                        },
                        {
                          id: "ani-redo",
                          label: t("redo"),
                          onClick: onRedo,
                          disabled: !canRedo,
                          title: t("redoShortcut"),
                          ariaLabel: t("redoShortcut"),
                        },
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
                        },
                        {
                          id: "ani-recommend-hotspot",
                          label:
                            ani.hotspotMode === "auto"
                              ? tp("recommendHotspotAgain")
                              : tp("recommendHotspot"),
                          onClick: onRecommendHotspot,
                          title:
                            ani.hotspotMode === "auto"
                              ? tp("recommendHotspotAgain")
                              : tp("recommendHotspot"),
                          ariaLabel:
                            ani.hotspotMode === "auto"
                              ? tp("recommendHotspotAgain")
                              : tp("recommendHotspot"),
                        },
                        {
                          id: "ani-reset-hotspot",
                          label: tp("resetHotspot"),
                          onClick: onResetHotspot,
                          title: tp("resetHotspot"),
                          ariaLabel: tp("resetHotspot"),
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "2rem 2.25rem",
                }}
              >
                <SlotEmptyState
                  slotId={selectedSlotId}
                  onStaticFile={onSelectSlotStaticFile}
                  onAnimatedFile={onSelectSlotAnimatedFile}
                />
              </div>
            )}
          </main>

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
              <AniSimulation
                imageUrl={selectedSlotBound && ani ? imageUrl : null}
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
                backgroundMode={simulationBackgroundMode}
              />
            </SimulationFooter>
          ) : null}
        </div>
      </div>

      <StudioInspector
        style={{
          width: selectedSlotBound ? "16rem" : "13rem",
          borderLeft: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-secondary)",
          padding: "1.25rem",
          flexShrink: 0,
          overflowY: "auto",
        }}
        summary={
          selectedSlotBound && ani ? (
            <div style={{ display: "grid", gap: "0.375rem" }}>
              <StudioInspectorRow label={tp("cursor")} value={ani.cursorName} />
              <StudioInspectorRow
                label={tp("status")}
                value={ani.hotspotMode === "auto" ? tp("recommended") : tp("manual")}
              />
              <StudioInspectorRow
                label={t("slotFilled")}
                value={selectedSlot.kind ? selectedSlot.kind.toUpperCase() : t("slotKindUnset")}
              />
            </div>
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
                    imageUrl={imageUrl}
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
                    imageUrl={imageUrl}
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
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <StudioInspectorSecondaryButton
                  onClick={() => onFitModeChange("contain")}
                  style={
                    ani.fitMode === "contain"
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
                  onClick={() => onFitModeChange("cover")}
                  style={
                    ani.fitMode === "cover"
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
                value={ani.cursorName}
                onChange={onAniNameChange}
                placeholder={tp("namePlaceholder")}
              />
            </StudioInspectorSection>

            <StudioInspectorSection title={tp("hotspot")}>
              <StudioInspectorRow
                label={tp("position")}
                value={`${ani.hotspotX}, ${ani.hotspotY}`}
              />
              <StudioInspectorRow
                label={tp("status")}
                value={ani.hotspotMode === "auto" ? tp("recommended") : tp("manual")}
              />
            </StudioInspectorSection>

            <StudioInspectorSection title={tp("scale")}>
              <input
                type="range"
                min="0.25"
                max="3"
                step="0.05"
                value={ani.scale}
                onChange={(e) => onScaleChange(Number(e.target.value))}
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

            <StudioInspectorSection title={tp("position")}>
              <StudioInspectorRow label={tp("offsetX")} value={`${ani.offsetX}`} />
              <StudioInspectorRow label={tp("offsetY")} value={`${ani.offsetY}`} />
              <StudioInspectorSecondaryButton
                onClick={() => onOffsetChange(0, 0)}
                style={{ justifyContent: "space-between" }}
              >
                <span>{tp("center")}</span>
                <span aria-hidden="true">⌖</span>
              </StudioInspectorSecondaryButton>
            </StudioInspectorSection>
          </>
        ) : null}
      </StudioInspector>
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

  return (
    <div
      data-testid="studio-empty-slot-state"
      style={{
        width: "min(52rem, 100%)",
        minHeight: "20rem",
        border: "1px solid var(--color-border)",
        borderRadius: "1.25rem",
        backgroundColor: "rgba(255,255,255,0.02)",
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
          {t("slotEmptyTitle")}
        </div>
        <div style={{ fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
          {slotLabel}
        </div>
        <div style={{ fontSize: "0.8125rem" }}>{t("slotEmptySub")}</div>
      </div>

      <div
        data-testid="studio-empty-slot-source-cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
          gap: "1rem",
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
    </div>
  );
}

function capitalizeSlotId(slotId: string | undefined) {
  if (!slotId) return "Slot";
  return `${slotId.slice(0, 1).toUpperCase()}${slotId.slice(1)}`;
}

"use client";

import { CSSProperties, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import CursorCanvas from "@/components/CursorCanvas";
import AniSimulation from "@/components/AniSimulation";
import FramedCursorPreview from "@/components/FramedCursorPreview";
import NameInput from "@/components/NameInput";
import SlotRail from "@/components/SlotRail";
import SimulationFooter from "@/components/SimulationFooter";
import UploadZone from "@/components/UploadZone";
import { type FitMode } from "@/lib/cursorFrame";
import { type CursorThemeProject, type SlotId } from "@/lib/cursorThemeProject";
import { buildProjectSlotSimulationSources } from "@/lib/slotSimulationSources";
import { type AniData, type CursorSize } from "@/lib/useStudio";

type Tool = "move" | "hotspot";

interface AniEditorShellProps {
  ani: AniData | null;
  imageUrl: string;
  project: CursorThemeProject;
  selectedSlotId: SlotId;
  error?: string | null;
  activeTool: Tool;
  onSetActiveTool: (tool: Tool) => void;
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
  onResetHotspot: () => void;
  onReset: () => void;
}

export default function AniEditorShell({
  ani,
  imageUrl,
  project,
  selectedSlotId,
  error,
  activeTool,
  onSetActiveTool,
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
  onResetHotspot,
  onReset,
}: AniEditorShellProps) {
  const t = useTranslations("studio");
  const tp = useTranslations("panel");
  const [simulationCollapsed, setSimulationCollapsed] = useState(false);
  const selectedSlot = project.slots[selectedSlotId];
  const selectedSlotBound = Boolean(
    selectedSlot.asset.originalUrl || selectedSlot.asset.previewUrl || ani
  );
  const slotSimulationSources = useMemo(
    () => buildProjectSlotSimulationSources(project),
    [project]
  );

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        overflow: "hidden",
      }}
      data-testid="ani-editor-shell"
    >
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
        <ToolButton
          label={t("move")}
          shortcut="V"
          active={activeTool === "move"}
          onClick={() => onSetActiveTool("move")}
        />
        <ToolButton
          label={t("hotspotShort")}
          shortcut="H"
          active={activeTool === "hotspot"}
          onClick={() => onSetActiveTool("hotspot")}
        />
        <div style={{ flex: 1 }} />
        <ToolButton label={t("new")} shortcut="" onClick={onReset} />
      </aside>

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
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              gap: "1rem",
              minHeight: 0,
            }}
          >
            {selectedSlotBound && ani ? (
              <>
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
                    onClick={onRecommendHotspot}
                    style={inlineGhostButtonStyle}
                  >
                    {ani.hotspotMode === "auto"
                      ? tp("recommendHotspotAgain")
                      : tp("recommendHotspot")}
                  </button>
                  <button onClick={onResetHotspot} style={inlineGhostButtonStyle}>
                    {tp("resetHotspot")}
                  </button>
                </div>
              </>
            ) : (
              <SlotEmptyState
                slotId={selectedSlotId}
                onStaticFile={onSelectSlotStaticFile}
                onAnimatedFile={onSelectSlotAnimatedFile}
              />
            )}
          </main>

          {selectedSlotBound && ani ? (
            <SimulationFooter
              collapsed={simulationCollapsed}
              onToggle={() => setSimulationCollapsed((current) => !current)}
            >
              <AniSimulation
                imageUrl={imageUrl}
                sourceWidth={ani.sourceWidth}
                sourceHeight={ani.sourceHeight}
                fitMode={ani.fitMode}
                offsetX={ani.offsetX}
                offsetY={ani.offsetY}
                scale={ani.scale}
                cursorSize={ani.cursorSize}
                hotspotX={ani.hotspotX}
                hotspotY={ani.hotspotY}
                slotSources={slotSimulationSources}
                selectedSlotId={selectedSlotId}
              />
            </SimulationFooter>
          ) : null}
        </div>
      </div>

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
            <PanelSection title={tp("actualSize")}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
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
            </PanelSection>

            <PanelSection title={tp("cursor")}>
              <PanelRow
                label={tp("original")}
                value={`${ani.sourceWidth} x ${ani.sourceHeight}`}
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
                      onClick={() => onAniCursorSizeChange(size)}
                      style={{
                        fontSize: "0.6875rem",
                        padding: "0.125rem 0.375rem",
                        border: `1px solid ${ani.cursorSize === size ? "var(--color-accent)" : "var(--color-border)"}`,
                        backgroundColor:
                          ani.cursorSize === size
                            ? "var(--color-accent-subtle)"
                            : "transparent",
                        color:
                          ani.cursorSize === size
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

            <PanelSection title={tp("name")}>
              <NameInput
                value={ani.cursorName}
                onChange={onAniNameChange}
                placeholder={tp("namePlaceholder")}
              />
            </PanelSection>

            <PanelSection title={tp("framing")}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
              >
                <FitModeButton
                  mode="contain"
                  active={ani.fitMode === "contain"}
                  onClick={() => onFitModeChange("contain")}
                />
                <FitModeButton
                  mode="cover"
                  active={ani.fitMode === "cover"}
                  onClick={() => onFitModeChange("cover")}
                />
              </div>
            </PanelSection>

            <PanelSection title={tp("hotspot")}>
              <PanelRow
                label={tp("position")}
                value={`${ani.hotspotX}, ${ani.hotspotY}`}
              />
              <PanelRow
                label={tp("status")}
                value={ani.hotspotMode === "auto" ? tp("recommended") : tp("manual")}
              />
            </PanelSection>

            <PanelSection title={tp("scale")}>
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
            </PanelSection>

            <PanelSection title={tp("position")}>
              <PanelRow label={tp("offsetX")} value={`${ani.offsetX}`} />
              <PanelRow label={tp("offsetY")} value={`${ani.offsetY}`} />
              <button
                onClick={() => onOffsetChange(0, 0)}
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
          </>
        ) : (
          <SlotEmptyPanelNotice slotId={selectedSlotId} />
        )}
      </aside>
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

function SlotEmptyPanelNotice({ slotId }: { slotId: SlotId }) {
  const t = useTranslations("studio");
  const slotLabel = t(`slot${capitalizeSlotId(slotId)}`);

  return (
    <div
      data-testid="ani-empty-slot-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
        padding: "0.875rem 0",
        color: "var(--color-text-muted)",
        lineHeight: 1.6,
      }}
    >
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
  );
}

function SlotEmptyState({
  slotId,
  onStaticFile,
  onAnimatedFile,
}: {
  slotId: SlotId;
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
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(17rem, 1fr))",
          gap: "1rem",
        }}
      >
        <SlotUploadChoice
          title={t("slotStaticUpload")}
          description={t("slotStaticUploadSub")}
          mode="cur"
          onFile={onStaticFile}
        />
        <SlotUploadChoice
          title={t("slotAniUpload")}
          description={t("slotAniUploadSub")}
          mode="ani"
          onFile={onAnimatedFile}
        />
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
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "1rem",
        padding: "1rem",
        backgroundColor: "rgba(255,255,255,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <div
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
          {description}
        </div>
      </div>
      <UploadZone onFile={onFile} processing={false} mode={mode} />
    </div>
  );
}

function capitalizeSlotId(slotId: SlotId | undefined) {
  if (!slotId) return "Slot";
  return `${slotId.slice(0, 1).toUpperCase()}${slotId.slice(1)}`;
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

const inlineGhostButtonStyle: CSSProperties = {
  fontSize: "0.6875rem",
  color: "var(--color-text-muted)",
  background: "none",
  border: "1px solid var(--color-border)",
  padding: "0.125rem 0.5rem",
  cursor: "pointer",
  transition: "border-color 0.15s",
};

"use client";

import { CSSProperties } from "react";
import { useTranslations } from "next-intl";

import CursorCanvas from "@/components/CursorCanvas";
import NameInput from "@/components/NameInput";
import { type FitMode } from "@/lib/cursorFrame";
import { type AniData } from "@/lib/useStudio";

type Tool = "move" | "hotspot";

interface AniEditorShellProps {
  ani: AniData;
  imageUrl: string;
  error?: string | null;
  activeTool: Tool;
  onSetActiveTool: (tool: Tool) => void;
  onOffsetChange: (x: number, y: number) => void;
  onHotspotChange: (x: number, y: number) => void;
  onScaleChange: (scale: number) => void;
  onFitModeChange: (fitMode: FitMode) => void;
  onAniNameChange: (name: string) => void;
  onRecommendHotspot: () => void;
  onResetHotspot: () => void;
  onReset: () => void;
}

export default function AniEditorShell({
  ani,
  imageUrl,
  error,
  activeTool,
  onSetActiveTool,
  onOffsetChange,
  onHotspotChange,
  onScaleChange,
  onFitModeChange,
  onAniNameChange,
  onRecommendHotspot,
  onResetHotspot,
  onReset,
}: AniEditorShellProps) {
  const t = useTranslations("studio");
  const tp = useTranslations("panel");

  return (
    <div
      style={{ display: "flex", flex: 1, overflow: "hidden" }}
      data-testid="ani-editor-shell"
    >
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
              {activeTool === "move" ? t("dragToMove") : t("clickToSetHotspot")}
            </span>
            <span>{t("shortcutMove")}</span>
            <span>{t("shortcutHotspot")}</span>
            <button onClick={onRecommendHotspot} style={inlineGhostButtonStyle}>
              {ani.hotspotMode === "auto"
                ? tp("recommendHotspotAgain")
                : tp("recommendHotspot")}
            </button>
            <button onClick={onResetHotspot} style={inlineGhostButtonStyle}>
              {tp("resetHotspot")}
            </button>
          </div>
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
          {error && (
            <p
              role="alert"
              style={{ fontSize: "0.8125rem", color: "var(--color-error)" }}
            >
              {error}
            </p>
          )}

          <PanelSection title={tp("cursor")}>
            <PanelRow label={tp("original")} value={`${ani.sourceWidth} x ${ani.sourceHeight}`} />
            <PanelRow label={tp("output")} value="32" />
          </PanelSection>

          <PanelSection title={tp("name")}>
            <NameInput
              value={ani.cursorName}
              onChange={onAniNameChange}
              placeholder={tp("namePlaceholder")}
            />
          </PanelSection>

          <PanelSection title={tp("framing")}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
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
            <PanelRow label={tp("position")} value={`${ani.hotspotX}, ${ani.hotspotY}`} />
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
        </aside>
      </div>
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

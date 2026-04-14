"use client";

import { type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import {
  DEFAULT_SIMULATION_SCENE_ID,
  type SimulationSceneId,
  type SimulationStationId,
} from "@/lib/simulationScenes";

interface CursorSceneProps {
  sceneId?: SimulationSceneId;
  onStationChange?: (stationId: SimulationStationId) => void;
  children?: ReactNode;
}

export default function CursorScene({
  sceneId = DEFAULT_SIMULATION_SCENE_ID,
  onStationChange,
  children,
}: CursorSceneProps) {
  const t = useTranslations("simulation");

  return (
    <div
      data-testid="cursor-scene"
      data-scene-id={sceneId}
      style={sceneRootStyle}
    >
      {children ?? renderScene(sceneId, onStationChange, t)}
    </div>
  );
}

function renderScene(
  sceneId: SimulationSceneId,
  onStationChange: CursorSceneProps["onStationChange"],
  t: ReturnType<typeof useTranslations>
) {
  switch (sceneId) {
    case "browser":
      return renderBrowserScene(onStationChange, t);
    case "system":
      return renderSystemScene(onStationChange, t);
    case "windowControls":
      return renderWindowControlsScene(onStationChange, t);
  }
}

function renderBrowserScene(
  onStationChange: CursorSceneProps["onStationChange"],
  t: ReturnType<typeof useTranslations>
) {
  return (
    <>
      <div data-testid="cursor-scene-browser-chrome" style={chromeStyle}>
        <div style={chromeDotsStyle}>
          <span style={{ ...chromeDotStyle, backgroundColor: "#ff5f57" }} />
          <span style={{ ...chromeDotStyle, backgroundColor: "#ffbd2f" }} />
          <span style={{ ...chromeDotStyle, backgroundColor: "#28c840" }} />
        </div>
        <div data-testid="cursor-scene-browser-address" style={addressBarStyle}>
          {t("browserAddress")}
        </div>
      </div>

      <section
        data-testid="cursor-scene-station-browser-neutral"
        onMouseEnter={() => onStationChange?.("browser-neutral")}
        style={surfaceStyle}
      >
        <div style={browserToolbarStyle}>
          <div style={tabActiveStyle}>{t("browserTabDocumentation")}</div>
          <div style={tabMutedStyle}>{t("browserTabDownloads")}</div>
          <div style={tabMutedStyle}>{t("browserTabSupport")}</div>
        </div>

        <div
          data-testid="cursor-scene-browser-content"
          style={browserContentStyle}
        >
          <section style={articleStyle}>
            <h3 style={titleStyle}>{t("browserTitleInstallTheme")}</h3>
            <p
              data-testid="cursor-scene-station-browser-text-body"
              onMouseEnter={() => onStationChange?.("browser-text-body")}
              style={bodyTextStyle}
            >
              {t("browserBodyInstallTheme")}
            </p>
            <div style={metaRowStyle}>
              <span style={metaBadgeStyle}>{t("browserBadgeWindows11")}</span>
              <span style={metaTextStyle}>{t("browserBadgeSetupTime")}</span>
            </div>
          </section>

          <aside style={sideCardStyle}>
            <div style={sideCardLabelStyle}>{t("browserQuickActions")}</div>
            <a
              data-testid="cursor-scene-station-browser-link-docs"
              href="#"
              onClick={(event) => event.preventDefault()}
              onMouseEnter={() => onStationChange?.("browser-link-docs")}
              style={linkStyle}
            >
              {t("browserOpenCursorSettings")}
            </a>
            <button type="button" style={zoneButtonStyle}>
              {t("browserApplyTheme")}
            </button>
            <label
              data-testid="cursor-scene-station-browser-text-input"
              onMouseEnter={() => onStationChange?.("browser-text-input")}
              style={inputLabelStyle}
            >
              {t("browserSearchSettings")}
              <input
                data-testid="cursor-scene-browser-input"
                readOnly
                value={t("browserSearchValue")}
                style={inputStyle}
              />
            </label>
          </aside>
        </div>
      </section>
    </>
  );
}

function renderSystemScene(
  onStationChange: CursorSceneProps["onStationChange"],
  t: ReturnType<typeof useTranslations>
) {
  return (
    <section style={surfaceStyle}>
      <div style={systemHeaderStyle}>
        <div style={systemHeaderTitleStyle}>{t("systemTitle")}</div>
        <div style={systemHeaderMetaStyle}>{t("systemHeaderMeta")}</div>
      </div>

      <div
        data-testid="cursor-scene-system-workspace"
        style={systemWorkspaceStyle}
      >
        <aside
          data-testid="cursor-scene-system-queue"
          style={systemQueueStyle}
        >
          <div style={systemQueueTitleStyle}>{t("systemHeaderMeta")}</div>
          <div style={systemQueueListStyle}>
            <div style={systemQueueRowActiveStyle}>
              <span style={systemQueueDotActiveStyle} />
              <div style={systemQueueTextGroupStyle}>
                <span style={systemQueueLabelStyle}>{t("systemBusyTitle")}</span>
                <span style={systemQueueMetaStyle}>{t("systemBusyProgress")}</span>
              </div>
            </div>
            <div style={systemQueueRowStyle}>
              <span style={systemQueueDotStyle} />
              <div style={systemQueueTextGroupStyle}>
                <span style={systemQueueLabelStyle}>
                  {t("systemWorkingTitle")}
                </span>
                <span style={systemQueueMetaStyle}>
                  {t("systemWorkingStatus")}
                </span>
              </div>
            </div>
            <div style={systemQueueRowStyle}>
              <span style={systemQueueDotMutedStyle} />
              <div style={systemQueueTextGroupStyle}>
                <span style={systemQueueLabelStyle}>
                  {t("systemUnavailableTitle")}
                </span>
                <span style={systemQueueMetaStyle}>
                  {t("systemUnavailableAction")}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <div style={systemMainColumnStyle}>
          <article
            data-testid="cursor-scene-station-system-busy-progress"
            onMouseEnter={() => onStationChange?.("system-busy-progress")}
            style={systemBusyCardStyle}
          >
            <div style={systemCardHeaderRowStyle}>
              <div style={systemCardEyebrowStyle}>{t("systemBusyEyebrow")}</div>
              <div style={systemStatusChipStyle}>{t("systemBusyEta")}</div>
            </div>
            <h3 style={systemCardTitleStyle}>{t("systemBusyTitle")}</h3>
            <p style={systemCardBodyStyle}>{t("systemBusyBody")}</p>
            <div
              data-testid="cursor-scene-system-progress-bar"
              style={systemProgressBlockStyle}
            >
              <div style={progressTrackStyle}>
                <div style={progressFillStyle} />
              </div>
              <div style={systemMetaRowStyle}>
                <span>{t("systemBusyProgress")}</span>
                <span>{t("systemBusyEta")}</span>
              </div>
            </div>
          </article>

          <div style={systemSecondaryGridStyle}>
            <article
              data-testid="cursor-scene-station-system-working-card"
              onMouseEnter={() => onStationChange?.("system-working-card")}
              style={systemCardStyle}
            >
              <div style={systemCardEyebrowStyle}>{t("systemWorkingEyebrow")}</div>
              <h3 style={systemCardTitleStyle}>{t("systemWorkingTitle")}</h3>
              <p style={systemCardBodyStyle}>{t("systemWorkingBody")}</p>
              <div style={systemWorkingFooterStyle}>
                <div style={systemStatusChipStyle}>{t("systemWorkingStatus")}</div>
                <div style={systemPulseStyle} />
              </div>
            </article>

            <article style={systemCardStyle}>
              <div style={systemCardEyebrowStyle}>
                {t("systemUnavailableEyebrow")}
              </div>
              <h3 style={systemCardTitleStyle}>{t("systemUnavailableTitle")}</h3>
              <p style={systemCardBodyStyle}>{t("systemUnavailableBody")}</p>
              <button
                data-testid="cursor-scene-station-system-unavailable-action"
                type="button"
                onMouseEnter={() =>
                  onStationChange?.("system-unavailable-action")
                }
                style={systemDisabledButtonStyle}
              >
                {t("systemUnavailableAction")}
              </button>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function renderWindowControlsScene(
  onStationChange: CursorSceneProps["onStationChange"],
  t: ReturnType<typeof useTranslations>
) {
  return (
    <section style={surfaceStyle}>
      <div data-testid="cursor-scene-window-frame" style={windowFrameStyle}>
        <div
          data-testid="cursor-scene-station-window-corner-diagonal-resize-1"
          onMouseEnter={() =>
            onStationChange?.("window-corner-diagonal-resize-1")
          }
          style={{ ...cornerHandleStyle, top: "-0.3rem", left: "-0.3rem" }}
        />
        <div
          data-testid="cursor-scene-station-window-corner-diagonal-resize-2"
          onMouseEnter={() =>
            onStationChange?.("window-corner-diagonal-resize-2")
          }
          style={{ ...cornerHandleStyle, right: "-0.3rem", bottom: "-0.3rem" }}
        />
        <div
          data-testid="cursor-scene-station-window-edge-horizontal-resize"
          onMouseEnter={() =>
            onStationChange?.("window-edge-horizontal-resize")
          }
          style={horizontalEdgeHandleStyle}
        />
        <div
          data-testid="cursor-scene-station-window-edge-vertical-resize"
          onMouseEnter={() =>
            onStationChange?.("window-edge-vertical-resize")
          }
          style={verticalEdgeHandleStyle}
        />

        <div
          data-testid="cursor-scene-station-window-titlebar-move"
          onMouseEnter={() => onStationChange?.("window-titlebar-move")}
          style={windowTitlebarStyle}
        >
          <div style={windowTitlebarGroupStyle}>
            <div style={windowControlDotsStyle}>
              <span style={windowControlDotStyle} />
              <span style={windowControlDotStyle} />
              <span style={windowControlDotStyle} />
            </div>
            <span>{t("windowTitle")}</span>
          </div>
          <span style={windowTitleMetaStyle}>{t("windowTitleMeta")}</span>
        </div>

        <div data-testid="cursor-scene-window-toolbar" style={windowToolbarStyle}>
          <div style={windowToolbarGroupStyle}>
            <span style={windowToolbarChipActiveStyle}>
              {t("windowSidebarLayers")}
            </span>
            <span style={windowToolbarChipStyle}>
              {t("windowSidebarProperties")}
            </span>
            <span style={windowToolbarChipStyle}>
              {t("windowSidebarHistory")}
            </span>
          </div>
          <div style={windowToolbarGroupStyle}>
            <span style={windowToolbarMetaStyle}>{t("windowCanvasTitle")}</span>
          </div>
        </div>

        <div style={windowBodyStyle}>
          <div style={windowPanelStyle}>
            <div style={windowPanelTitleStyle}>{t("windowSidebarTitle")}</div>
            <div style={windowListStyle}>
              <span>{t("windowSidebarLayers")}</span>
              <span>{t("windowSidebarProperties")}</span>
              <span>{t("windowSidebarHistory")}</span>
            </div>
          </div>
          <div
            data-testid="cursor-scene-window-canvas-workspace"
            style={windowCanvasStyle}
          >
            <div style={windowCanvasLabelStyle}>{t("windowCanvasTitle")}</div>
            <div style={windowCanvasStageStyle}>
              <div style={windowCanvasFrameStyle}>
                <div style={windowCanvasGuideRowStyle}>
                  <span style={windowCanvasGuideStyle} />
                  <span style={windowCanvasGuideStyle} />
                  <span style={windowCanvasGuideAccentStyle} />
                </div>
                <div style={windowCanvasBoxStyle} />
                <div style={windowCanvasCaptionStyle}>{t("windowTitleMeta")}</div>
              </div>
            </div>
          </div>
          <aside
            data-testid="cursor-scene-window-properties-panel"
            style={windowPropertiesPanelStyle}
          >
            <div style={windowPanelTitleStyle}>{t("windowSidebarProperties")}</div>
            <div style={windowPropertyGroupStyle}>
              <div style={windowPropertyLabelStyle}>{t("windowTitle")}</div>
              <div style={windowPropertyFieldStyle}>{t("windowSidebarLayers")}</div>
            </div>
            <div style={windowPropertyGroupStyle}>
              <div style={windowPropertyLabelStyle}>{t("windowCanvasTitle")}</div>
              <div style={windowSliderTrackStyle}>
                <span style={windowSliderFillStyle} />
              </div>
            </div>
            <div style={windowPropertyGroupStyle}>
              <div style={windowPropertyLabelStyle}>{t("windowTitleMeta")}</div>
              <div style={windowPropertyFieldStyle}>
                {t("windowSidebarHistory")}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

const sceneRootStyle: CSSProperties = {
  display: "grid",
  gap: "0.75rem",
  height: "100%",
  minHeight: 0,
  padding: "clamp(0.75rem, 1.4vw, 1.25rem)",
  boxSizing: "border-box",
  width: "100%",
  alignContent: "start",
};

const chromeStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  border: "1px solid var(--simulation-panel-border)",
  borderRadius: "1rem 1rem 0.75rem 0.75rem",
  background:
    "linear-gradient(180deg, var(--simulation-chrome-top), var(--simulation-chrome-bottom))",
};

const chromeDotsStyle: CSSProperties = {
  display: "flex",
  gap: "0.375rem",
  alignItems: "center",
};

const chromeDotStyle: CSSProperties = {
  width: "0.625rem",
  height: "0.625rem",
  borderRadius: "999px",
  display: "inline-block",
};

const addressBarStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  fontSize: "0.75rem",
  color: "var(--simulation-panel-muted)",
  border: "1px solid var(--simulation-panel-border)",
  borderRadius: "999px",
  padding: "0.375rem 0.75rem",
  backgroundColor: "var(--simulation-panel-elevated)",
};

const surfaceStyle: CSSProperties = {
  border: "1px solid var(--simulation-panel-border)",
  backgroundColor: "var(--simulation-panel-bg)",
  color: "var(--simulation-panel-text)",
  display: "grid",
  minHeight: 0,
  overflow: "hidden",
};

const browserToolbarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.875rem 1rem",
  borderBottom: "1px solid var(--simulation-panel-border)",
  background:
    "linear-gradient(180deg, var(--simulation-chrome-top), var(--simulation-chrome-bottom))",
};

const tabBaseStyle: CSSProperties = {
  fontSize: "0.75rem",
  padding: "0.35rem 0.65rem",
};

const tabActiveStyle: CSSProperties = {
  ...tabBaseStyle,
  backgroundColor: "var(--simulation-tab-active-bg)",
  color: "var(--simulation-panel-text)",
};

const tabMutedStyle: CSSProperties = {
  ...tabBaseStyle,
  backgroundColor: "transparent",
  color: "var(--simulation-panel-muted)",
};

const browserContentStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 14rem), 1fr))",
  gap: "1rem",
  padding: "1rem",
  alignItems: "start",
  minHeight: 0,
};

const articleStyle: CSSProperties = {
  display: "grid",
  gap: "0.875rem",
  alignContent: "start",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1rem",
  fontWeight: 600,
  lineHeight: 1.3,
};

const bodyTextStyle: CSSProperties = {
  margin: 0,
  lineHeight: 1.6,
  fontSize: "0.875rem",
  color: "var(--simulation-panel-muted)",
};

const metaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  flexWrap: "wrap",
};

const metaBadgeStyle: CSSProperties = {
  fontSize: "0.6875rem",
  padding: "0.2rem 0.45rem",
  backgroundColor: "var(--simulation-button-bg)",
  color: "var(--simulation-link)",
};

const metaTextStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--simulation-panel-muted)",
};

const sideCardStyle: CSSProperties = {
  border: "1px solid var(--simulation-panel-border)",
  padding: "0.875rem",
  display: "grid",
  gap: "0.875rem",
  backgroundColor: "var(--simulation-card-bg)",
};

const sideCardLabelStyle: CSSProperties = {
  fontSize: "0.6875rem",
  color: "var(--simulation-panel-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const linkStyle: CSSProperties = {
  color: "var(--simulation-link)",
  textDecoration: "underline",
  textUnderlineOffset: "0.2em",
  cursor: "pointer",
  fontSize: "0.8125rem",
};

const zoneButtonStyle: CSSProperties = {
  border: "1px solid var(--simulation-panel-border)",
  padding: "0.625rem 0.875rem",
  backgroundColor: "var(--simulation-button-bg)",
  color: "var(--simulation-button-text)",
  textAlign: "left",
  fontSize: "0.8125rem",
};

const inputLabelStyle: CSSProperties = {
  display: "grid",
  gap: "0.375rem",
  fontSize: "0.75rem",
  color: "var(--simulation-panel-muted)",
};

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid var(--simulation-panel-border)",
  padding: "0.625rem 0.75rem",
  backgroundColor: "var(--simulation-panel-elevated)",
  color: "var(--simulation-panel-text)",
  fontSize: "0.8125rem",
};

const systemHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  padding: "0.9rem 1rem",
  borderBottom: "1px solid var(--simulation-panel-border)",
  background:
    "linear-gradient(180deg, var(--simulation-chrome-top), var(--simulation-chrome-bottom))",
};

const systemHeaderTitleStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
};

const systemHeaderMetaStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--simulation-panel-muted)",
};

const systemWorkspaceStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(12rem, 14rem) minmax(0, 1fr)",
  gap: "1rem",
  padding: "1rem",
  minHeight: 0,
  alignItems: "start",
};

const systemQueueStyle: CSSProperties = {
  border: "1px solid var(--simulation-panel-border)",
  backgroundColor: "var(--simulation-card-bg)",
  padding: "0.875rem",
  display: "grid",
  gap: "0.75rem",
  alignContent: "start",
  minHeight: 0,
};

const systemQueueTitleStyle: CSSProperties = {
  fontSize: "0.6875rem",
  color: "var(--simulation-panel-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const systemQueueListStyle: CSSProperties = {
  display: "grid",
  gap: "0.55rem",
};

const systemQueueRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "0.625rem 1fr",
  gap: "0.65rem",
  alignItems: "start",
  padding: "0.55rem 0.6rem",
  border: "1px solid rgba(255,255,255,0.06)",
  backgroundColor: "rgba(255,255,255,0.02)",
};

const systemQueueRowActiveStyle: CSSProperties = {
  ...systemQueueRowStyle,
  border: "1px solid rgba(77,163,255,0.18)",
  backgroundColor: "rgba(77,163,255,0.08)",
};

const systemQueueDotBaseStyle: CSSProperties = {
  width: "0.5rem",
  height: "0.5rem",
  borderRadius: "999px",
  marginTop: "0.25rem",
};

const systemQueueDotStyle: CSSProperties = {
  ...systemQueueDotBaseStyle,
  backgroundColor: "rgba(255,255,255,0.22)",
};

const systemQueueDotActiveStyle: CSSProperties = {
  ...systemQueueDotBaseStyle,
  backgroundColor: "var(--simulation-link)",
};

const systemQueueDotMutedStyle: CSSProperties = {
  ...systemQueueDotBaseStyle,
  backgroundColor: "rgba(255,255,255,0.12)",
};

const systemQueueTextGroupStyle: CSSProperties = {
  display: "grid",
  gap: "0.18rem",
};

const systemQueueLabelStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--simulation-panel-text)",
};

const systemQueueMetaStyle: CSSProperties = {
  fontSize: "0.6875rem",
  color: "var(--simulation-panel-muted)",
};

const systemMainColumnStyle: CSSProperties = {
  display: "grid",
  gap: "1rem",
  minHeight: 0,
};

const systemSecondaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 15rem), 1fr))",
  gap: "1rem",
};

const systemCardStyle: CSSProperties = {
  display: "grid",
  gap: "0.75rem",
  padding: "1rem",
  border: "1px solid var(--simulation-panel-border)",
  backgroundColor: "var(--simulation-card-bg)",
  alignContent: "start",
};

const systemBusyCardStyle: CSSProperties = {
  ...systemCardStyle,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
};

const systemCardHeaderRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
};

const systemCardEyebrowStyle: CSSProperties = {
  fontSize: "0.6875rem",
  color: "var(--simulation-panel-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const systemCardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.9375rem",
  fontWeight: 600,
};

const systemCardBodyStyle: CSSProperties = {
  margin: 0,
  color: "var(--simulation-panel-muted)",
  fontSize: "0.8125rem",
  lineHeight: 1.55,
};

const progressTrackStyle: CSSProperties = {
  position: "relative",
  height: "0.5rem",
  backgroundColor: "rgba(255,255,255,0.08)",
  overflow: "hidden",
};

const systemProgressBlockStyle: CSSProperties = {
  display: "grid",
  gap: "0.55rem",
};

const progressFillStyle: CSSProperties = {
  width: "68%",
  height: "100%",
  background:
    "linear-gradient(90deg, var(--simulation-link), rgba(77,163,255,0.55))",
};

const systemMetaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  fontSize: "0.75rem",
  color: "var(--simulation-panel-muted)",
};

const systemStatusChipStyle: CSSProperties = {
  justifySelf: "start",
  padding: "0.25rem 0.55rem",
  fontSize: "0.75rem",
  backgroundColor: "rgba(77,163,255,0.12)",
  color: "var(--simulation-link)",
};

const systemWorkingFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
};

const systemPulseStyle: CSSProperties = {
  width: "0.6rem",
  height: "0.6rem",
  borderRadius: "999px",
  backgroundColor: "rgba(77,163,255,0.8)",
  boxShadow: "0 0 0 0.3rem rgba(77,163,255,0.14)",
};

const systemDisabledButtonStyle: CSSProperties = {
  border: "1px solid var(--simulation-panel-border)",
  padding: "0.7rem 0.85rem",
  color: "var(--simulation-panel-muted)",
  backgroundColor: "rgba(255,255,255,0.03)",
  opacity: 0.62,
  textAlign: "left",
};

const windowFrameStyle: CSSProperties = {
  position: "relative",
  minHeight: 0,
  flex: 1,
  margin: "1rem",
  border: "1px solid var(--simulation-panel-border)",
  backgroundColor: "var(--simulation-panel-bg)",
  overflow: "hidden",
};

const windowTitlebarStyle: CSSProperties = {
  height: "2.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 0.9rem",
  borderBottom: "1px solid var(--simulation-panel-border)",
  background:
    "linear-gradient(180deg, var(--simulation-chrome-top), var(--simulation-chrome-bottom))",
  fontSize: "0.8125rem",
};

const windowTitlebarGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.65rem",
};

const windowControlDotsStyle: CSSProperties = {
  display: "flex",
  gap: "0.35rem",
  alignItems: "center",
};

const windowControlDotStyle: CSSProperties = {
  width: "0.45rem",
  height: "0.45rem",
  borderRadius: "999px",
  backgroundColor: "rgba(255,255,255,0.18)",
};

const windowTitleMetaStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--simulation-panel-muted)",
};

const windowToolbarStyle: CSSProperties = {
  height: "2.25rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  padding: "0 0.9rem",
  borderBottom: "1px solid var(--simulation-panel-border)",
  backgroundColor: "rgba(255,255,255,0.02)",
};

const windowToolbarGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  minWidth: 0,
};

const windowToolbarChipStyle: CSSProperties = {
  fontSize: "0.6875rem",
  padding: "0.22rem 0.5rem",
  color: "var(--simulation-panel-muted)",
  backgroundColor: "rgba(255,255,255,0.02)",
};

const windowToolbarChipActiveStyle: CSSProperties = {
  ...windowToolbarChipStyle,
  color: "var(--simulation-panel-text)",
  backgroundColor: "rgba(77,163,255,0.1)",
};

const windowToolbarMetaStyle: CSSProperties = {
  fontSize: "0.6875rem",
  color: "var(--simulation-panel-muted)",
};

const windowBodyStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "13rem minmax(0, 1fr) 14rem",
  minHeight: 0,
  height: "calc(100% - 4.75rem)",
};

const windowPanelStyle: CSSProperties = {
  borderRight: "1px solid var(--simulation-panel-border)",
  padding: "1rem",
  display: "grid",
  alignContent: "start",
  gap: "0.75rem",
  backgroundColor: "var(--simulation-card-bg)",
};

const windowPanelTitleStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--simulation-panel-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const windowListStyle: CSSProperties = {
  display: "grid",
  gap: "0.55rem",
  fontSize: "0.8125rem",
  color: "var(--simulation-panel-text)",
};

const windowCanvasStyle: CSSProperties = {
  display: "grid",
  alignContent: "start",
  gap: "0.75rem",
  padding: "1rem",
  minWidth: 0,
};

const windowCanvasLabelStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--simulation-panel-muted)",
};

const windowCanvasStageStyle: CSSProperties = {
  minHeight: "12rem",
  border: "1px dashed var(--simulation-panel-border)",
  backgroundColor: "var(--simulation-panel-elevated)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const windowCanvasFrameStyle: CSSProperties = {
  width: "100%",
  maxWidth: "18rem",
  display: "grid",
  gap: "0.8rem",
  justifyItems: "center",
};

const windowCanvasGuideRowStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  gap: "0.4rem",
  alignItems: "center",
};

const windowCanvasGuideBaseStyle: CSSProperties = {
  display: "inline-block",
  height: "0.35rem",
  backgroundColor: "rgba(255,255,255,0.08)",
};

const windowCanvasGuideStyle: CSSProperties = {
  ...windowCanvasGuideBaseStyle,
  flex: 1,
};

const windowCanvasGuideAccentStyle: CSSProperties = {
  ...windowCanvasGuideBaseStyle,
  width: "3.5rem",
  backgroundColor: "rgba(77,163,255,0.22)",
};

const windowCanvasBoxStyle: CSSProperties = {
  width: "8rem",
  height: "5rem",
  border: "1px solid rgba(255,255,255,0.18)",
  backgroundColor: "rgba(255,255,255,0.04)",
};

const windowCanvasCaptionStyle: CSSProperties = {
  fontSize: "0.6875rem",
  color: "var(--simulation-panel-muted)",
};

const windowPropertiesPanelStyle: CSSProperties = {
  borderLeft: "1px solid var(--simulation-panel-border)",
  padding: "1rem",
  display: "grid",
  alignContent: "start",
  gap: "0.75rem",
  backgroundColor: "rgba(255,255,255,0.02)",
};

const windowPropertyGroupStyle: CSSProperties = {
  display: "grid",
  gap: "0.35rem",
};

const windowPropertyLabelStyle: CSSProperties = {
  fontSize: "0.6875rem",
  color: "var(--simulation-panel-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const windowPropertyFieldStyle: CSSProperties = {
  padding: "0.5rem 0.6rem",
  border: "1px solid var(--simulation-panel-border)",
  backgroundColor: "var(--simulation-panel-elevated)",
  fontSize: "0.75rem",
  color: "var(--simulation-panel-text)",
};

const windowSliderTrackStyle: CSSProperties = {
  position: "relative",
  height: "0.35rem",
  backgroundColor: "rgba(255,255,255,0.08)",
  overflow: "hidden",
};

const windowSliderFillStyle: CSSProperties = {
  display: "block",
  width: "58%",
  height: "100%",
  background:
    "linear-gradient(90deg, var(--simulation-link), rgba(77,163,255,0.55))",
};

const edgeHandleBaseStyle: CSSProperties = {
  position: "absolute",
  zIndex: 2,
};

const horizontalEdgeHandleStyle: CSSProperties = {
  ...edgeHandleBaseStyle,
  top: "4.75rem",
  right: "-0.25rem",
  width: "0.5rem",
  height: "calc(100% - 4.75rem)",
};

const verticalEdgeHandleStyle: CSSProperties = {
  ...edgeHandleBaseStyle,
  left: 0,
  right: 0,
  bottom: "-0.25rem",
  height: "0.5rem",
};

const cornerHandleStyle: CSSProperties = {
  position: "absolute",
  zIndex: 3,
  width: "0.75rem",
  height: "0.75rem",
};

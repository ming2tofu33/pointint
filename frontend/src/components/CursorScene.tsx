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
  activeStation?: SimulationStationId;
  children?: ReactNode;
}

export default function CursorScene({
  sceneId = DEFAULT_SIMULATION_SCENE_ID,
  onStationChange,
  activeStation,
  children,
}: CursorSceneProps) {
  const t = useTranslations("simulation");

  return (
    <div
      data-testid="cursor-scene"
      data-scene-id={sceneId}
      className="transition-all duration-500 ease-in-out"
      style={getSceneRootStyle(sceneId)}
    >
      {children ?? renderScene(sceneId, onStationChange, activeStation, t)}
    </div>
  );
}

function renderScene(
  sceneId: SimulationSceneId,
  onStationChange: CursorSceneProps["onStationChange"],
  activeStation: CursorSceneProps["activeStation"],
  t: ReturnType<typeof useTranslations>
) {
  switch (sceneId) {
    case "browser":
      return renderBrowserScene(onStationChange, t);
    case "system":
      return renderSystemScene(onStationChange, t);
    case "windowControls":
      return renderWindowControlsScene(onStationChange, activeStation, t);
  }
}

function renderBrowserScene(
  onStationChange: CursorSceneProps["onStationChange"],
  t: ReturnType<typeof useTranslations>
) {
  return (
    <div data-testid="cursor-scene-browser-frame" style={realisticWindowBaseStyle}>
      <div data-testid="cursor-scene-browser-chrome" style={chromeStyle}>
        <div style={chromeDotsStyle}>
          <span style={{ ...chromeDotStyle, backgroundColor: "#ED6A5E" }} />
          <span style={{ ...chromeDotStyle, backgroundColor: "#F5BF4F" }} />
          <span style={{ ...chromeDotStyle, backgroundColor: "#62C554" }} />
        </div>
        <div data-testid="cursor-scene-browser-address" style={addressBarStyle}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px", opacity: 0.6 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          {t("browserAddress")}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", opacity: 0.5 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
        </div>
      </div>

      <div style={browserToolbarStyle}>
        <div style={tabActiveStyle}>{t("browserTabDocumentation")}</div>
        <div style={tabMutedStyle}>{t("browserTabDownloads")}</div>
        <div style={tabMutedStyle}>{t("browserTabSupport")}</div>
      </div>

      <section
        data-testid="cursor-scene-station-browser-neutral"
        onMouseEnter={() => onStationChange?.("browser-neutral")}
        style={browserSurfaceStyle}
      >
        <div
          data-testid="cursor-scene-browser-content"
          style={browserContentStyle}
        >
          <div style={webContentWrapperStyle}>
            <section
              data-testid="cursor-scene-browser-copy-region"
              onMouseEnter={() => onStationChange?.("browser-neutral")}
              style={articleStyle}
            >
              <h3 style={titleStyle}>{t("browserTitleInstallTheme")}</h3>
              <p style={bodyTextStyle}>{t("browserBodyInstallTheme")}</p>
              <div style={metaRowStyle}>
                <span style={metaBadgeStyle}>{t("browserBadgeWindows11")}</span>
                <span style={metaTextStyle}>{t("browserBadgeSetupTime")}</span>
              </div>
              <div
                data-testid="cursor-scene-station-browser-text-body"
                onMouseEnter={() => onStationChange?.("browser-text-body")}
                style={browserTextNoteStyle}
              >
                <span style={browserTextNoteLabelStyle}>
                  {t("browserNoteLabel")}
                </span>
                <span style={browserTextNoteValueStyle}>
                  {t("browserNoteValue")}
                </span>
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
        </div>
      </section>
    </div>
  );
}

function renderSystemScene(
  onStationChange: CursorSceneProps["onStationChange"],
  t: ReturnType<typeof useTranslations>
) {
  return (
    <section data-testid="cursor-scene-system-frame" style={realisticWindowBaseStyle}>
      <div style={systemHeaderStyle}>
        <div style={systemHeaderGroupStyle}>
          <div style={windowControlDotsStyle}>
            <span style={{ ...windowControlDotStyle, backgroundColor: "#ED6A5E" }} />
            <span style={{ ...windowControlDotStyle, backgroundColor: "#F5BF4F" }} />
            <span style={{ ...windowControlDotStyle, backgroundColor: "#62C554" }} />
          </div>
          <div style={systemHeaderTitleStyle}>{t("systemTitle")}</div>
        </div>
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
  activeStation: CursorSceneProps["activeStation"],
  t: ReturnType<typeof useTranslations>
) {
  const guideRows = getWindowGuideRows(t);

  return (
    <section style={{ ...realisticWindowBaseStyle, backgroundColor: "transparent", border: "none", boxShadow: "none" }}>
      <div data-testid="cursor-scene-window-frame" style={windowFrameStyle}>
        <div style={windowSceneHeaderStyle}>
          <div style={windowSceneHeaderTitleStyle}>{t("windowTitle")}</div>
          <span style={windowTitleMetaStyle}>{t("windowTitleMeta")}</span>
        </div>

        <div data-testid="cursor-scene-window-body" style={windowBodyStyle}>
          <div
            data-testid="cursor-scene-window-canvas-workspace"
            style={windowCanvasStyle}
          >
            <div
              data-testid="cursor-scene-window-desktop-stage"
              style={windowCanvasStageStyle}
            >
              <div
                data-testid="cursor-scene-window-floating-frame"
                style={windowFloatingFrameWrapStyle}
              >
                {/* resize-1: Top-Left (NW) & Bottom-Right (SE) */}
                <div
                  data-testid="cursor-scene-station-window-corner-diagonal-resize-1"
                  onMouseEnter={() =>
                    onStationChange?.("window-corner-diagonal-resize-1")
                  }
                  style={{
                    ...cornerHandleStyle,
                    top: "-0.5rem",
                    left: "-0.5rem",
                    backgroundColor: activeStation === "window-corner-diagonal-resize-1" ? "color-mix(in srgb, var(--simulation-link) 20%, transparent)" : "transparent",
                  }}
                />
                <div
                  data-testid="cursor-scene-station-window-corner-diagonal-resize-1-br"
                  onMouseEnter={() =>
                    onStationChange?.("window-corner-diagonal-resize-1")
                  }
                  style={{
                    ...cornerHandleStyle,
                    bottom: "-0.5rem",
                    right: "-0.5rem",
                    backgroundColor: activeStation === "window-corner-diagonal-resize-1" ? "color-mix(in srgb, var(--simulation-link) 20%, transparent)" : "transparent",
                  }}
                />

                {/* resize-2: Top-Right (NE) & Bottom-Left (SW) */}
                <div
                  data-testid="cursor-scene-station-window-corner-diagonal-resize-2"
                  onMouseEnter={() =>
                    onStationChange?.("window-corner-diagonal-resize-2")
                  }
                  style={{
                    ...cornerHandleStyle,
                    top: "-0.5rem",
                    right: "-0.5rem",
                    backgroundColor: activeStation === "window-corner-diagonal-resize-2" ? "color-mix(in srgb, var(--simulation-link) 20%, transparent)" : "transparent",
                  }}
                />
                <div
                  data-testid="cursor-scene-station-window-corner-diagonal-resize-2-bl"
                  onMouseEnter={() =>
                    onStationChange?.("window-corner-diagonal-resize-2")
                  }
                  style={{
                    ...cornerHandleStyle,
                    bottom: "-0.5rem",
                    left: "-0.5rem",
                    backgroundColor: activeStation === "window-corner-diagonal-resize-2" ? "color-mix(in srgb, var(--simulation-link) 20%, transparent)" : "transparent",
                  }}
                />
                <div
                  data-testid="cursor-scene-station-window-edge-horizontal-resize"
                  onMouseEnter={() =>
                    onStationChange?.("window-edge-horizontal-resize")
                  }
                  style={{
                    ...horizontalEdgeHandleStyle,
                    backgroundColor: activeStation === "window-edge-horizontal-resize" ? "color-mix(in srgb, var(--simulation-link) 20%, transparent)" : "transparent",
                  }}
                />
                <div
                  data-testid="cursor-scene-station-window-edge-horizontal-resize-left"
                  onMouseEnter={() =>
                    onStationChange?.("window-edge-horizontal-resize")
                  }
                  style={{
                    ...horizontalEdgeHandleStyle,
                    right: "auto",
                    left: "-0.28rem",
                    backgroundColor: activeStation === "window-edge-horizontal-resize" ? "color-mix(in srgb, var(--simulation-link) 20%, transparent)" : "transparent",
                  }}
                />
                <div
                  data-testid="cursor-scene-station-window-edge-vertical-resize"
                  onMouseEnter={() =>
                    onStationChange?.("window-edge-vertical-resize")
                  }
                  style={{
                    ...verticalEdgeHandleStyle,
                    backgroundColor: activeStation === "window-edge-vertical-resize" ? "color-mix(in srgb, var(--simulation-link) 20%, transparent)" : "transparent",
                  }}
                />

                <div
                  style={{
                    ...windowFloatingFrameStyle,
                    boxShadow: activeStation === "window-titlebar-move" || activeStation?.includes("resize") ? "0 24px 48px rgba(0, 0, 0, 0.25), 0 0 0 1px color-mix(in srgb, var(--simulation-link) 40%, transparent)" : windowFloatingFrameStyle.boxShadow,
                  }}
                >
                  <div
                    data-testid="cursor-scene-station-window-titlebar-move"
                    onMouseEnter={() => onStationChange?.("window-titlebar-move")}
                    style={{
                      ...windowFloatingTitlebarStyle,
                      backgroundColor: activeStation === "window-titlebar-move" ? "var(--simulation-chrome-bg)" : "var(--simulation-scene-surface, #fff)",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <div style={windowTitlebarGroupStyle}>
                      <div style={windowControlDotsStyle}>
                        <span style={{ ...windowControlDotStyle, backgroundColor: "#ED6A5E" }} />
                        <span style={{ ...windowControlDotStyle, backgroundColor: "#F5BF4F" }} />
                        <span style={{ ...windowControlDotStyle, backgroundColor: "#62C554" }} />
                      </div>
                      <div style={{ marginLeft: "0.2rem", height: "1.2rem", width: "8rem", backgroundColor: "var(--simulation-input-bg)", borderRadius: "4px", border: "1px solid var(--simulation-panel-border)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)" }} />
                    </div>
                  </div>
                  <div style={{ ...windowFloatingBodyStyle, padding: 0 }}>
                    <div style={{ ...windowFloatingSurfaceStyle, borderRadius: 0, minHeight: "100%", boxShadow: "none", border: "none", backgroundColor: "var(--simulation-panel-bg)", display: "flex", flexDirection: "column" }}>
                      <div style={windowStagePanelBodyStyle}>
                        <div
                          data-testid="cursor-scene-window-helper-copy"
                          style={{ ...windowCanvasCaptionStyle, fontSize: "0.875rem" }}
                        >
                          {t("windowCanvasCaption")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <aside
            data-testid="cursor-scene-window-guide-panel"
            style={windowGuidePanelStyle}
          >
            <div
              data-testid="cursor-scene-window-guide-list"
              style={windowGuideListStyle}
            >
              {guideRows.map((row) => {
                const isActive = activeStation === row.stationId;

                return (
                  <div
                    key={row.stationId}
                    data-testid={`cursor-scene-window-guide-row-${row.stationId}`}
                    data-guide-active={isActive ? "true" : "false"}
                    style={getWindowGuideRowStyle(isActive)}
                  >
                    <div style={getWindowGuideAreaStyle(isActive)}>
                      {row.areaLabel}
                    </div>
                    <div style={getWindowGuideExpectedStyle(isActive)}>
                      {row.expectedLabel}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function getWindowGuideRows(t: ReturnType<typeof useTranslations>) {
  return [
    {
      stationId: "window-titlebar-move" as const,
      areaLabel: t("windowGuideMoveArea"),
      expectedLabel: t("windowGuideMoveExpected"),
    },
    {
      stationId: "window-edge-horizontal-resize" as const,
      areaLabel: t("windowGuideHorizontalArea"),
      expectedLabel: t("windowGuideHorizontalExpected"),
    },
    {
      stationId: "window-edge-vertical-resize" as const,
      areaLabel: t("windowGuideVerticalArea"),
      expectedLabel: t("windowGuideVerticalExpected"),
    },
    {
      stationId: "window-corner-diagonal-resize-1" as const,
      areaLabel: t("windowGuideDiagonalPrimaryArea"),
      expectedLabel: t("windowGuideDiagonalPrimaryExpected"),
    },
    {
      stationId: "window-corner-diagonal-resize-2" as const,
      areaLabel: t("windowGuideDiagonalSecondaryArea"),
      expectedLabel: t("windowGuideDiagonalSecondaryExpected"),
    },
  ];
}

const sceneRootStyle: CSSProperties = {
  display: "flex",
  justifyContent: "stretch",
  alignItems: "stretch",
  height: "100%",
  minHeight: 0,
  padding: "clamp(0.625rem, 2vw, 1rem)",
  boxSizing: "border-box",
  width: "100%",
  overflow: "hidden",
};

function getSceneRootStyle(sceneId: SimulationSceneId): CSSProperties {
  if (sceneId === "browser" || sceneId === "system") {
    return {
      ...sceneRootStyle,
      padding: "0.4rem",
    };
  }

  if (sceneId === "windowControls") {
    return {
      ...sceneRootStyle,
      padding: "0.4rem",
    };
  }

  return sceneRootStyle;
}

const realisticWindowBaseStyle: CSSProperties = {
  width: "100%",
  maxWidth: "none",
  height: "100%",
  maxHeight: "100%",
  backgroundColor: "var(--simulation-panel-bg)",
  borderRadius: "10px",
  border: "1px solid var(--simulation-panel-border)",
  boxShadow: "0 20px 60px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--simulation-panel-border)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  color: "var(--simulation-panel-text)",
  transition: "all 0.3s ease",
};

const glassBase: CSSProperties = {
  backgroundColor: "var(--simulation-panel-bg)",
  border: "1px solid var(--simulation-panel-border)",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
};

const chromeStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "100px 1fr 100px",
  alignItems: "center",
  padding: "0.6rem 1rem",
  backgroundColor: "var(--simulation-chrome-bg, var(--simulation-panel-bg))",
  borderBottom: "1px solid var(--simulation-panel-border)",
};

const chromeDotsStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
};

const chromeDotStyle: CSSProperties = {
  width: "0.75rem",
  height: "0.75rem",
  borderRadius: "999px",
  display: "inline-block",
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
};

const addressBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  maxWidth: "32rem",
  margin: "0 auto",
  width: "100%",
  fontSize: "0.8125rem",
  color: "var(--simulation-panel-text)",
  border: "1px solid var(--simulation-panel-border)",
  borderRadius: "8px",
  padding: "0.3rem 0.75rem",
  backgroundColor: "var(--simulation-input-bg, var(--simulation-panel-elevated))",
  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
};

const surfaceStyle: CSSProperties = {
  ...glassBase,
  backgroundColor: "var(--simulation-panel-bg)",
  color: "var(--simulation-panel-text)",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
  overflow: "hidden",
  borderRadius: "0.5rem",
  transition: "all 0.3s ease",
};

const browserSurfaceStyle: CSSProperties = {
  flex: 1,
  backgroundColor: "var(--simulation-panel-bg)",
  color: "var(--simulation-panel-text)",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "hidden",
};

const browserToolbarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.25rem",
  padding: "0.5rem 1.25rem",
  borderBottom: "1px solid var(--simulation-panel-border)",
  backgroundColor: "var(--simulation-chrome-bg, var(--simulation-panel-bg))",
};

const tabBaseStyle: CSSProperties = {
  fontSize: "0.8125rem",
  cursor: "pointer",
};

const tabActiveStyle: CSSProperties = {
  ...tabBaseStyle,
  fontWeight: 500,
  color: "var(--simulation-panel-text)",
};

const tabMutedStyle: CSSProperties = {
  ...tabBaseStyle,
  color: "var(--simulation-panel-muted)",
};

const browserContentStyle: CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "1rem 0.875rem",
  display: "flex",
  justifyContent: "center",
};

const webContentWrapperStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))",
  gap: "1rem",
  width: "100%",
  maxWidth: "960px",
};

const articleStyle: CSSProperties = {
  display: "grid",
  gap: "1rem",
  alignContent: "start",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.75rem",
  fontWeight: 700,
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
};

const bodyTextStyle: CSSProperties = {
  margin: 0,
  lineHeight: 1.6,
  fontSize: "0.9375rem",
  color: "var(--simulation-panel-muted)",
};

const metaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  flexWrap: "wrap",
  marginTop: "1rem",
};

const metaBadgeStyle: CSSProperties = {
  fontSize: "0.75rem",
  padding: "0.3rem 0.6rem",
  backgroundColor: "var(--simulation-panel-elevated)",
  color: "var(--simulation-link)",
  borderRadius: "999px",
  fontWeight: 500,
  border: "1px solid var(--simulation-panel-border)",
};

const metaTextStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "var(--simulation-panel-muted)",
};

const browserTextNoteStyle: CSSProperties = {
  display: "grid",
  gap: "0.35rem",
  width: "fit-content",
  minWidth: "13rem",
  maxWidth: "100%",
  padding: "0.8rem 0.95rem",
  borderRadius: "12px",
  border: "1px solid var(--simulation-panel-border)",
  backgroundColor: "var(--simulation-panel-elevated)",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const browserTextNoteLabelStyle: CSSProperties = {
  fontSize: "0.6875rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--simulation-panel-muted)",
};

const browserTextNoteValueStyle: CSSProperties = {
  fontSize: "0.875rem",
  lineHeight: 1.35,
  color: "var(--simulation-panel-text)",
};

const sideCardStyle: CSSProperties = {
  padding: "1.5rem",
  display: "grid",
  gap: "1.25rem",
  backgroundColor: "var(--simulation-panel-bg)",
  borderRadius: "16px",
  border: "1px solid var(--simulation-panel-border)",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
  alignContent: "start",
};

const sideCardLabelStyle: CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--simulation-panel-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const linkStyle: CSSProperties = {
  color: "var(--simulation-link)",
  textDecoration: "underline",
  textUnderlineOffset: "0.2em",
  cursor: "pointer",
  fontSize: "0.875rem",
};

const zoneButtonStyle: CSSProperties = {
  appearance: "none",
  border: "1px solid var(--simulation-panel-border)",
  padding: "0.625rem 1rem",
  backgroundColor: "var(--simulation-button-bg)",
  color: "var(--simulation-button-text)",
  textAlign: "center",
  fontSize: "0.875rem",
  fontWeight: 500,
  borderRadius: "8px",
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  transition: "all 0.2s ease",
};

const inputLabelStyle: CSSProperties = {
  display: "grid",
  gap: "0.5rem",
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "var(--simulation-panel-text)",
};

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid var(--simulation-panel-border)",
  borderRadius: "6px",
  padding: "0.625rem 0.75rem",
  backgroundColor: "var(--simulation-scene-surface)",
  color: "var(--simulation-panel-text)",
  fontSize: "0.875rem",
};

const systemHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.875rem 1.25rem",
  backgroundColor: "var(--simulation-chrome-bg, var(--simulation-panel-bg))",
  borderBottom: "1px solid var(--simulation-panel-border)",
};

const systemHeaderGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.25rem",
};

const systemHeaderTitleStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "var(--simulation-panel-text)",
};

const systemHeaderMetaStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--simulation-panel-muted)",
};

const systemWorkspaceStyle: CSSProperties = {
  display: "flex",
  flex: 1,
  minHeight: 0,
  overflow: "hidden",
};

const systemQueueStyle: CSSProperties = {
  width: "12.5rem",
  padding: "0.75rem",
  display: "grid",
  gap: "0.75rem",
  alignContent: "start",
  backgroundColor: "var(--simulation-sidebar-bg, var(--simulation-panel-bg))",
  borderRight: "1px solid var(--simulation-panel-border)",
  overflowY: "auto",
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
  gap: "0.75rem",
  alignItems: "center",
  padding: "0.5rem 0.75rem",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const systemQueueRowActiveStyle: CSSProperties = {
  ...systemQueueRowStyle,
  backgroundColor: "var(--simulation-panel-elevated)",
};

const systemQueueDotBaseStyle: CSSProperties = {
  width: "0.5rem",
  height: "0.5rem",
  borderRadius: "999px",
  marginTop: "0.1rem",
};

const systemQueueDotStyle: CSSProperties = {
  ...systemQueueDotBaseStyle,
  backgroundColor: "var(--simulation-panel-border)",
};

const systemQueueDotActiveStyle: CSSProperties = {
  ...systemQueueDotBaseStyle,
  backgroundColor: "var(--simulation-link)",
};

const systemQueueDotMutedStyle: CSSProperties = {
  ...systemQueueDotBaseStyle,
  backgroundColor: "transparent",
  border: "1px solid var(--simulation-panel-border)",
};

const systemQueueTextGroupStyle: CSSProperties = {
  display: "grid",
  gap: "0.15rem",
};

const systemQueueLabelStyle: CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "var(--simulation-panel-text)",
};

const systemQueueMetaStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--simulation-panel-muted)",
};

const systemMainColumnStyle: CSSProperties = {
  display: "grid",
  gap: "0.875rem",
  padding: "0.875rem",
  flex: 1,
  backgroundColor: "var(--simulation-scene-surface, #fff)",
  overflowY: "auto",
  alignContent: "start",
};

const systemSecondaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 13rem), 1fr))",
  gap: "0.875rem",
};

const systemCardStyle: CSSProperties = {
  display: "grid",
  gap: "0.625rem",
  padding: "0.75rem",
  borderRadius: "8px",
  backgroundColor: "var(--simulation-panel-bg)",
  border: "1px solid var(--simulation-panel-border)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  alignContent: "start",
};

const systemBusyCardStyle: CSSProperties = {
  ...systemCardStyle,
  borderColor: "rgba(77, 163, 255, 0.3)",
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
  color: "var(--simulation-panel-text)",
};

const systemCardBodyStyle: CSSProperties = {
  margin: 0,
  color: "var(--simulation-panel-muted)",
  fontSize: "0.8125rem",
  lineHeight: 1.5,
};

const progressTrackStyle: CSSProperties = {
  position: "relative",
  height: "0.35rem",
  backgroundColor: "var(--simulation-panel-border)",
  borderRadius: "999px",
  overflow: "hidden",
};

const systemProgressBlockStyle: CSSProperties = {
  display: "grid",
  gap: "0.75rem",
  marginTop: "0.5rem",
};

const progressFillStyle: CSSProperties = {
  width: "68%",
  height: "100%",
  backgroundColor: "var(--simulation-link)",
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
  padding: "0.2rem 0.5rem",
  fontSize: "0.6875rem",
  fontWeight: 600,
  textTransform: "uppercase",
  backgroundColor: "var(--simulation-panel-elevated)",
  border: "1px solid var(--simulation-panel-border)",
  color: "var(--simulation-panel-text)",
  borderRadius: "4px",
};

const systemWorkingFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
};

const systemPulseStyle: CSSProperties = {
  width: "0.5rem",
  height: "0.5rem",
  borderRadius: "999px",
  backgroundColor: "#28c840",
};

const systemDisabledButtonStyle: CSSProperties = {
  border: "1px solid var(--simulation-panel-border)",
  padding: "0.6rem 0.8rem",
  color: "var(--simulation-panel-muted)",
  backgroundColor: "var(--simulation-panel-elevated)",
  opacity: 0.5,
  textAlign: "center",
  fontWeight: 500,
  borderRadius: "6px",
  cursor: "not-allowed",
  fontSize: "0.8125rem",
  marginTop: "0.5rem",
};

const windowFrameStyle: CSSProperties = {
  position: "relative",
  minHeight: 0,
  flex: 1,
  margin: 0,
  borderRadius: "10px",
  backgroundColor: "var(--simulation-panel-bg)",
  border: "1px solid var(--simulation-panel-border)",
  overflow: "hidden",
  boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
};

const windowSceneHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  padding: "0.85rem 1rem",
  borderBottom: "1px solid var(--simulation-panel-border)",
  backgroundColor: "var(--simulation-panel-bg)",
};

const windowSceneHeaderTitleStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "var(--simulation-panel-text)",
};

const windowTitlebarGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  minWidth: 0,
};

const windowControlDotsStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
};

const windowControlDotStyle: CSSProperties = {
  width: "0.75rem",
  height: "0.75rem",
  borderRadius: "999px",
  backgroundColor: "var(--simulation-panel-border)",
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
};

const windowTitleMetaStyle: CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 400,
  color: "var(--simulation-panel-muted)",
  textAlign: "right",
  maxWidth: "24rem",
  lineHeight: 1.4,
};

const windowBodyStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.9fr) minmax(14rem, 1fr)",
  minHeight: 0,
  flex: 1,
  backgroundColor: "var(--simulation-scene-surface, #fff)",
  overflow: "hidden",
};

const windowCanvasStyle: CSSProperties = {
  display: "flex",
  padding: "1rem",
  minWidth: 0,
  minHeight: 0,
  backgroundColor: "var(--simulation-scene-surface, #fff)",
};

const windowCanvasStageStyle: CSSProperties = {
  flex: 1,
  minHeight: "12rem",
  borderRadius: "12px",
  border: "1px solid color-mix(in srgb, var(--simulation-panel-border) 56%, transparent)",
  background:
    "radial-gradient(circle at 18% 12%, color-mix(in srgb, var(--simulation-link) 10%, transparent), transparent 26%), linear-gradient(180deg, color-mix(in srgb, var(--simulation-panel-elevated) 94%, white 6%) 0%, color-mix(in srgb, var(--simulation-scene-surface, #fff) 96%, var(--simulation-panel-bg) 4%) 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.1rem 1.25rem",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
};

const windowFloatingFrameWrapStyle: CSSProperties = {
  position: "relative",
  width: "min(100%, 22rem)",
  minHeight: "13.5rem",
  display: "flex",
  alignItems: "stretch",
};

const windowFloatingFrameStyle: CSSProperties = {
  width: "100%",
  minHeight: "13.5rem",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  borderRadius: "11px",
  border: "1px solid var(--simulation-panel-border)",
  backgroundColor: "var(--simulation-panel-bg)",
  boxShadow:
    "0 24px 48px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(255,255,255,0.04)",
};

const windowFloatingTitlebarStyle: CSSProperties = {
  minHeight: "2.55rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  padding: "0.7rem 0.85rem",
  borderBottom: "1px solid var(--simulation-panel-border)",
  backgroundColor: "var(--simulation-scene-surface, #fff)",
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "var(--simulation-panel-text)",
};

const windowStagePanelHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.75rem 0.875rem",
  borderBottom: "1px solid var(--simulation-panel-border)",
};

const windowStagePanelHeaderPillStyle: CSSProperties = {
  display: "inline-block",
  height: "0.35rem",
  width: "2.5rem",
  borderRadius: "999px",
  backgroundColor: "var(--simulation-panel-border)",
};

const windowStagePanelHeaderAccentStyle: CSSProperties = {
  ...windowStagePanelHeaderPillStyle,
  width: "4rem",
  backgroundColor: "var(--simulation-link)",
};

const windowStagePanelBodyStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem 0.9rem",
};

const windowFloatingBodyStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.95rem",
  background:
    "linear-gradient(180deg, color-mix(in srgb, var(--simulation-panel-bg) 94%, white 6%) 0%, color-mix(in srgb, var(--simulation-panel-elevated) 94%, transparent) 100%)",
};

const windowFloatingSurfaceStyle: CSSProperties = {
  width: "100%",
  minHeight: "8.7rem",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  borderRadius: "9px",
  border: "1px solid color-mix(in srgb, var(--simulation-panel-border) 82%, transparent)",
  backgroundColor: "color-mix(in srgb, var(--simulation-scene-surface, #fff) 94%, var(--simulation-panel-bg) 6%)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
};

const windowFloatingSurfaceHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.75rem 0.875rem",
  borderBottom: "1px solid color-mix(in srgb, var(--simulation-panel-border) 82%, transparent)",
};

const windowCanvasCaptionStyle: CSSProperties = {
  maxWidth: "11.5rem",
  fontSize: "0.8125rem",
  fontWeight: 500,
  lineHeight: 1.5,
  textAlign: "center",
  color: "var(--simulation-panel-muted)",
};

const windowGuidePanelStyle: CSSProperties = {
  borderLeft: "1px solid var(--simulation-panel-border)",
  padding: "0.75rem",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "var(--simulation-panel-bg)",
  overflow: "hidden",
  minHeight: 0,
};

const windowGuideListStyle: CSSProperties = {
  display: "grid",
  gridTemplateRows: "repeat(5, minmax(0, 1fr))",
  gap: "0.4rem",
  minHeight: 0,
  height: "100%",
  flex: 1,
};

const windowGuideRowStyle: CSSProperties = {
  display: "grid",
  gap: "0.2rem",
  padding: "0.65rem 0.7rem",
  borderRadius: "6px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "var(--simulation-panel-border)",
  backgroundColor: "transparent",
  transition: "all 0.2s ease",
  alignContent: "center",
  minHeight: 0,
};

function getWindowGuideRowStyle(isActive: boolean): CSSProperties {
  if (!isActive) {
    return windowGuideRowStyle;
  }

  return {
    ...windowGuideRowStyle,
    backgroundColor: "var(--simulation-panel-elevated)",
    borderColor: "var(--simulation-link)",
    boxShadow: "0 0 0 1px color-mix(in srgb, var(--simulation-link) 18%, transparent)",
  };
}

const windowGuideAreaStyle: CSSProperties = {
  fontSize: "0.6875rem",
  fontWeight: 600,
  color: "var(--simulation-panel-muted)",
  lineHeight: 1.25,
};

function getWindowGuideAreaStyle(isActive: boolean): CSSProperties {
  if (!isActive) {
    return windowGuideAreaStyle;
  }

  return {
    ...windowGuideAreaStyle,
    color: "var(--simulation-panel-text)",
  };
}

const windowGuideExpectedStyle: CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "var(--simulation-panel-text)",
  lineHeight: 1.25,
};

function getWindowGuideExpectedStyle(isActive: boolean): CSSProperties {
  if (isActive) {
    return {
      ...windowGuideExpectedStyle,
      fontWeight: 600,
    };
  }

  return windowGuideExpectedStyle;
}

const edgeHandleBaseStyle: CSSProperties = {
  position: "absolute",
  zIndex: 3,
};

const horizontalEdgeHandleStyle: CSSProperties = {
  ...edgeHandleBaseStyle,
  top: "2.6rem",
  right: "-0.28rem",
  width: "0.56rem",
  height: "calc(100% - 2.6rem)",
};

const verticalEdgeHandleStyle: CSSProperties = {
  ...edgeHandleBaseStyle,
  left: "0.85rem",
  right: "0.85rem",
  bottom: "-0.28rem",
  height: "0.56rem",
};

const cornerHandleStyle: CSSProperties = {
  position: "absolute",
  zIndex: 4,
  width: "1.2rem",
  height: "1.2rem",
};

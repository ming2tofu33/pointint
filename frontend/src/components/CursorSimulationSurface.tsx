"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";

import CursorPreviewLayer from "@/components/CursorPreviewLayer";
import CursorScene from "@/components/CursorScene";
import {
  type CursorSource,
  type CursorSourceSnapshot,
} from "@/lib/cursorSources";
import {
  getSimulationStationNativeCursor,
  resolveSimulationStationSource,
  type SlotSimulationSources,
} from "@/lib/slotSimulationSources";
import {
  DEFAULT_SIMULATION_SCENE_ID,
  getDefaultSimulationStation,
  type SimulationSceneId,
  type SimulationStationId,
} from "@/lib/simulationScenes";

export type SimulationThemeMode = "dark" | "light";

interface CursorSimulationSurfaceProps {
  source?: CursorSource | null;
  slotSources?: SlotSimulationSources;
  placeholder?: ReactNode;
  children?: ReactNode;
  themeMode?: SimulationThemeMode;
  sceneId?: SimulationSceneId;
}

interface SimulationThemeDefinition {
  shellBg: string;
  shellFg: string;
  sceneSurface: string;
  sceneBg: string;
  panelBg: string;
  chromeBg: string;
  sidebarBg: string;
  inputBg: string;
  panelElevated: string;
  panelBorder: string;
  panelText: string;
  panelMuted: string;
  link: string;
  buttonBg: string;
  buttonText: string;
  chromeTop: string;
  chromeBottom: string;
  tabActiveBg: string;
  cardBg: string;
}

const SIMULATION_THEME_DEFINITIONS = {
  dark: {
    shellBg: "#202020",
    shellFg: "#f3f3f3",
    sceneSurface: "#1f1f1f",
    sceneBg: "#181818",
    panelBg: "#2b2b2b",
    chromeBg: "#282828",
    sidebarBg: "#232323",
    inputBg: "#1e1e1e",
    panelElevated: "#313131",
    panelBorder: "#3f3f3f",
    panelText: "#f3f3f3",
    panelMuted: "#c7c7c7",
    link: "#76b9ed",
    buttonBg: "#0f6cbd",
    buttonText: "#ffffff",
    chromeTop: "rgba(255, 255, 255, 0.06)",
    chromeBottom: "rgba(255, 255, 255, 0.015)",
    tabActiveBg: "rgba(255, 255, 255, 0.08)",
    cardBg: "rgba(255, 255, 255, 0.035)",
  },
  light: {
    shellBg: "#f3f3f3",
    shellFg: "#1f1f1f",
    sceneSurface: "#ffffff",
    sceneBg: "#f5f5f5",
    panelBg: "#fbfbfb",
    chromeBg: "#f6f6f6",
    sidebarBg: "#f5f5f7",
    inputBg: "#ffffff",
    panelElevated: "#f0f0f0",
    panelBorder: "#e5e5e5",
    panelText: "#1f1f1f",
    panelMuted: "#616161",
    link: "#0f6cbd",
    buttonBg: "#0f6cbd",
    buttonText: "#ffffff",
    chromeTop: "rgba(17, 17, 17, 0.05)",
    chromeBottom: "rgba(17, 17, 17, 0.015)",
    tabActiveBg: "rgba(17, 17, 17, 0.06)",
    cardBg: "rgba(17, 17, 17, 0.03)",
  },
} satisfies Record<SimulationThemeMode, SimulationThemeDefinition>;

export default function CursorSimulationSurface({
  source,
  slotSources,
  placeholder,
  children,
  themeMode = "dark",
  sceneId = DEFAULT_SIMULATION_SCENE_ID,
}: CursorSimulationSurfaceProps) {
  const [pointer, setPointer] = useState({ x: 160, y: 120 });
  const [now, setNow] = useState(() => Date.now());
  const [activeStation, setActiveStation] = useState<SimulationStationId>(
    getDefaultSimulationStation(sceneId)
  );

  useEffect(() => {
    setActiveStation(getDefaultSimulationStation(sceneId));
  }, [sceneId]);

  const activeSource = useMemo<CursorSource | null>(() => {
    if (slotSources) {
      return resolveSimulationStationSource(sceneId, activeStation, slotSources);
    }

    return source ?? null;
  }, [activeStation, sceneId, slotSources, source]);

  const activeNativeCursor = useMemo(
    () => getSimulationStationNativeCursor(sceneId, activeStation),
    [activeStation, sceneId]
  );

  useEffect(() => {
    setNow(Date.now());

    if (activeSource?.kind !== "animated") {
      return;
    }

    let animationFrameId = window.requestAnimationFrame(function tick() {
      setNow(Date.now());
      animationFrameId = window.requestAnimationFrame(tick);
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [activeSource]);

  const snapshot = useMemo<CursorSourceSnapshot | null>(() => {
    if (!activeSource) {
      return null;
    }

    try {
      return activeSource.getFrameAtTime(now);
    } catch {
      return null;
    }
  }, [activeSource, now]);

  return (
    <div
      data-testid="cursor-simulation-surface"
      data-theme-mode={themeMode}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...getSimulationThemeSurfaceStyle(themeMode),
      }}
    >
      <style data-testid="cursor-simulation-cursor-lock">
        {snapshot
          ? `
              [data-cursor-lock-scope="true"],
              [data-cursor-lock-scope="true"] * {
                cursor: none !important;
              }
            `
          : ""}
      </style>

      <div
        data-testid="cursor-simulation-stage"
        data-cursor-lock-scope="true"
        data-active-station={activeStation}
        data-native-cursor={activeNativeCursor}
        onPointerMove={(event) => setPointer(getStageLocalPointer(event))}
        onMouseMove={(event) => setPointer(getStageLocalPointer(event))}
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          cursor: snapshot ? "none" : activeNativeCursor,
        }}
      >
        <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
          {renderScene(children, sceneId, setActiveStation, activeStation)}
        </div>
        {snapshot ? (
          <CursorPreviewLayer snapshot={snapshot} pointer={pointer} />
        ) : (
          placeholder && (!slotSources || !slotSources.normalSelect)
            ? placeholder
            : null
        )}
      </div>
    </div>
  );
}

export function getSimulationThemeVariables(
  themeMode: SimulationThemeMode
): CSSProperties {
  const theme = SIMULATION_THEME_DEFINITIONS[themeMode];

  return {
    colorScheme: themeMode,
    "--simulation-scene-surface": theme.sceneSurface,
    "--simulation-scene-bg": theme.sceneBg,
    "--simulation-panel-bg": theme.panelBg,
    "--simulation-chrome-bg": theme.chromeBg,
    "--simulation-sidebar-bg": theme.sidebarBg,
    "--simulation-input-bg": theme.inputBg,
    "--simulation-panel-elevated": theme.panelElevated,
    "--simulation-panel-border": theme.panelBorder,
    "--simulation-panel-text": theme.panelText,
    "--simulation-panel-muted": theme.panelMuted,
    "--simulation-link": theme.link,
    "--simulation-button-bg": theme.buttonBg,
    "--simulation-button-text": theme.buttonText,
    "--simulation-chrome-top": theme.chromeTop,
    "--simulation-chrome-bottom": theme.chromeBottom,
    "--simulation-tab-active-bg": theme.tabActiveBg,
    "--simulation-card-bg": theme.cardBg,
  } as CSSProperties;
}

export function getSimulationThemeSurfaceStyle(
  themeMode: SimulationThemeMode
): CSSProperties {
  const theme = SIMULATION_THEME_DEFINITIONS[themeMode];

  return {
    backgroundColor: theme.shellBg,
    color: theme.shellFg,
    ...getSimulationThemeVariables(themeMode),
  };
}

function getStageLocalPointer(
  event: ReactMouseEvent<HTMLDivElement> | ReactPointerEvent<HTMLDivElement>
) {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: Math.round(event.clientX - rect.left),
    y: Math.round(event.clientY - rect.top),
  };
}

function renderScene(
  children: ReactNode,
  sceneId: SimulationSceneId,
  onStationChange: (stationId: SimulationStationId) => void,
  activeStation: SimulationStationId
) {
  if (!children) {
    return (
      <CursorScene
        sceneId={sceneId}
        onStationChange={onStationChange}
        activeStation={activeStation}
      />
    );
  }

  return Children.map(children, (child) =>
    injectStationTracking(child, sceneId, onStationChange, activeStation)
  );
}

function injectStationTracking(
  node: ReactNode,
  sceneId: SimulationSceneId,
  onStationChange: (stationId: SimulationStationId) => void,
  activeStation: SimulationStationId
): ReactNode {
  if (!isValidElement(node)) {
    return node;
  }

  if (node.type === CursorScene) {
    return cloneElement(
      node as ReactElement<{
        sceneId?: SimulationSceneId;
        onStationChange?: typeof onStationChange;
        activeStation?: SimulationStationId;
      }>,
      { sceneId, onStationChange, activeStation }
    );
  }

  const childNodes = (node as ReactElement<{ children?: ReactNode }>).props
    .children;
  if (!childNodes) {
    return node;
  }

  const nextChildren = Children.map(childNodes, (child) =>
    injectStationTracking(child, sceneId, onStationChange, activeStation)
  );

  return cloneElement(
    node as ReactElement<{ children?: ReactNode }>,
    undefined,
    nextChildren
  );
}

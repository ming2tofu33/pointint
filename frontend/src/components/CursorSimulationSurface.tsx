"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useState,
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

export type BackgroundMode = "dark" | "light";

interface CursorSimulationSurfaceProps {
  source?: CursorSource | null;
  slotSources?: SlotSimulationSources;
  placeholder?: ReactNode;
  children?: ReactNode;
  backgroundMode?: BackgroundMode;
  sceneId?: SimulationSceneId;
}

export default function CursorSimulationSurface({
  source,
  slotSources,
  placeholder,
  children,
  backgroundMode = "dark",
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
      data-background-mode={backgroundMode}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor:
          backgroundMode === "dark"
            ? "var(--simulation-shell-dark-bg)"
            : "var(--simulation-shell-light-bg)",
        color:
          backgroundMode === "dark"
            ? "var(--simulation-shell-dark-fg)"
            : "var(--simulation-shell-light-fg)",
        overflow: "hidden",
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
          {renderScene(children, sceneId, setActiveStation)}
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
  onStationChange: (stationId: SimulationStationId) => void
) {
  if (!children) {
    return <CursorScene sceneId={sceneId} onStationChange={onStationChange} />;
  }

  return Children.map(children, (child) =>
    injectStationTracking(child, sceneId, onStationChange)
  );
}

function injectStationTracking(
  node: ReactNode,
  sceneId: SimulationSceneId,
  onStationChange: (stationId: SimulationStationId) => void
): ReactNode {
  if (!isValidElement(node)) {
    return node;
  }

  if (node.type === CursorScene) {
    return cloneElement(
      node as ReactElement<{
        sceneId?: SimulationSceneId;
        onStationChange?: typeof onStationChange;
      }>,
      { sceneId, onStationChange }
    );
  }

  const childNodes = (node as ReactElement<{ children?: ReactNode }>).props
    .children;
  if (!childNodes) {
    return node;
  }

  const nextChildren = Children.map(childNodes, (child) =>
    injectStationTracking(child, sceneId, onStationChange)
  );

  return cloneElement(
    node as ReactElement<{ children?: ReactNode }>,
    undefined,
    nextChildren
  );
}

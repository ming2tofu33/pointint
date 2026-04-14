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
import CursorScene, { type CursorSceneZone } from "@/components/CursorScene";
import {
  type CursorSource,
  type CursorSourceSnapshot,
} from "@/lib/cursorSources";
import {
  resolveZoneSimulationSource,
  type SlotSimulationSources,
} from "@/lib/slotSimulationSources";

export type BackgroundMode = "dark" | "light";

interface CursorSimulationSurfaceProps {
  source?: CursorSource | null;
  slotSources?: SlotSimulationSources;
  placeholder?: ReactNode;
  children?: ReactNode;
  backgroundMode?: BackgroundMode;
}

export default function CursorSimulationSurface({
  source,
  slotSources,
  placeholder,
  children,
  backgroundMode = "dark",
}: CursorSimulationSurfaceProps) {
  const [pointer, setPointer] = useState({ x: 160, y: 120 });
  const [now, setNow] = useState(() => Date.now());
  const [activeZone, setActiveZone] = useState<CursorSceneZone>("neutral");

  const activeSource = useMemo<CursorSource | null>(() => {
    if (slotSources) {
      return resolveZoneSimulationSource(activeZone, slotSources);
    }

    return source ?? null;
  }, [activeZone, slotSources, source]);

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
        backgroundColor: backgroundMode === "dark" ? "#121212" : "#f5f5f5",
        color: backgroundMode === "dark" ? "#f0f0f0" : "#1f1f1f",
        overflow: "hidden",
      }}
    >
      <style data-testid="cursor-simulation-cursor-lock">
        {`
          [data-cursor-lock-scope="true"],
          [data-cursor-lock-scope="true"] * {
            cursor: none !important;
          }
        `}
      </style>

      <div
        data-testid="cursor-simulation-stage"
        data-cursor-lock-scope="true"
        data-active-zone={activeZone}
        onPointerMove={(event) => setPointer(getStageLocalPointer(event))}
        onMouseMove={(event) => setPointer(getStageLocalPointer(event))}
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          cursor: "none",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
          {renderScene(children, setActiveZone)}
        </div>
        {snapshot ? (
          <CursorPreviewLayer snapshot={snapshot} pointer={pointer} />
        ) : (
          placeholder ?? null
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
  onZoneChange: (zone: CursorSceneZone) => void
) {
  if (!children) {
    return <CursorScene onZoneChange={onZoneChange} />;
  }

  return Children.map(children, (child) => injectZoneTracking(child, onZoneChange));
}

function injectZoneTracking(
  node: ReactNode,
  onZoneChange: (zone: CursorSceneZone) => void
): ReactNode {
  if (!isValidElement(node)) {
    return node;
  }

  if (node.type === CursorScene) {
    return cloneElement(
      node as ReactElement<{ onZoneChange?: typeof onZoneChange }>,
      { onZoneChange }
    );
  }

  const childNodes = (node as ReactElement<{ children?: ReactNode }>).props
    .children;
  if (!childNodes) {
    return node;
  }

  const nextChildren = Children.map(childNodes, (child) =>
    injectZoneTracking(child, onZoneChange)
  );

  return cloneElement(
    node as ReactElement<{ children?: ReactNode }>,
    undefined,
    nextChildren
  );
}

"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import CursorPreviewLayer from "@/components/CursorPreviewLayer";
import CursorScene, { type CursorSceneZone } from "@/components/CursorScene";
import {
  type CursorSource,
  type CursorSourceSnapshot,
} from "@/lib/cursorSources";

type BackgroundMode = "dark" | "light";

interface CursorSimulationSurfaceProps {
  source: CursorSource;
  children?: ReactNode;
}

export default function CursorSimulationSurface({
  source,
  children,
}: CursorSimulationSurfaceProps) {
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("dark");
  const [pointer, setPointer] = useState({ x: 160, y: 120 });
  const [now, setNow] = useState(() => Date.now());
  const [activeZone, setActiveZone] = useState<CursorSceneZone>("neutral");

  useEffect(() => {
    setNow(Date.now());

    if (source.kind !== "animated") {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 100);

    return () => window.clearInterval(timer);
  }, [source]);

  const snapshot = useMemo<CursorSourceSnapshot | null>(() => {
    try {
      return source.getFrameAtTime(now);
    } catch {
      return null;
    }
  }, [source, now]);

  return (
    <div
      data-testid="cursor-simulation-surface"
      data-background-mode={backgroundMode}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: backgroundMode === "dark" ? "#121212" : "#f5f5f5",
        color: backgroundMode === "dark" ? "#f0f0f0" : "#1f1f1f",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.375rem",
          padding: "0.5rem 0.75rem 0",
          flexShrink: 0,
        }}
      >
        <BackgroundToggle
          label="Light"
          active={backgroundMode === "light"}
          onClick={() => setBackgroundMode("light")}
        />
        <BackgroundToggle
          label="Dark"
          active={backgroundMode === "dark"}
          onClick={() => setBackgroundMode("dark")}
        />
      </div>

      <div
        data-testid="cursor-simulation-stage"
        data-active-zone={activeZone}
        onPointerMove={(event) =>
          setPointer({ x: event.clientX, y: event.clientY })
        }
        onMouseMove={(event) => setPointer({ x: event.clientX, y: event.clientY })}
        style={{
          position: "relative",
          flex: 1,
          overflow: "hidden",
          cursor: "none",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          {renderScene(children, setActiveZone)}
        </div>
        <CursorPreviewLayer snapshot={snapshot} pointer={pointer} />
      </div>
    </div>
  );
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

function BackgroundToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={{
        padding: "0.25rem 0.5rem",
        fontSize: "0.6875rem",
        borderRadius: "999px",
        border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
        backgroundColor: active ? "var(--color-accent-subtle)" : "transparent",
        color: active ? "var(--color-accent)" : "inherit",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { FitMode, getFrameRect } from "@/lib/cursorFrame";

type Tool = "move" | "hotspot";

interface CursorCanvasProps {
  imageUrl: string;
  sourceWidth: number;
  sourceHeight: number;
  fitMode: FitMode;
  offsetX: number;
  offsetY: number;
  scale: number;
  hotspotX: number;
  hotspotY: number;
  onOffsetChange: (x: number, y: number) => void;
  onHotspotChange: (x: number, y: number) => void;
  activeTool: Tool;
}

const CANVAS_SIZE = 256;

export default function CursorCanvas({
  imageUrl,
  sourceWidth,
  sourceHeight,
  fitMode,
  offsetX,
  offsetY,
  scale,
  hotspotX,
  hotspotY,
  onOffsetChange,
  onHotspotChange,
  activeTool,
}: CursorCanvasProps) {
  const t = useTranslations("studio");
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, startOffsetX: 0, startOffsetY: 0 });
  const frameRect = getFrameRect({
    sourceWidth,
    sourceHeight,
    viewportSize: CANVAS_SIZE,
    fitMode,
    scale,
    offsetX,
    offsetY,
  });

  const getRelativePos = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: Math.round(e.clientX - rect.left),
        y: Math.round(e.clientY - rect.top),
      };
    },
    []
  );

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    const pos = getRelativePos(e);

    if (activeTool === "hotspot") {
      onHotspotChange(pos.x, pos.y);
      return;
    }

    // Move tool
    setDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
    };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging || activeTool !== "move") return;

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    onOffsetChange(
      dragStart.current.startOffsetX + dx,
      dragStart.current.startOffsetY + dy
    );
  }

  function handleMouseUp() {
    setDragging(false);
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: "relative",
        width: `${CANVAS_SIZE}px`,
        height: `${CANVAS_SIZE}px`,
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-tertiary)",
        backgroundImage:
          "linear-gradient(45deg, var(--color-bg-secondary) 25%, transparent 25%, transparent 75%, var(--color-bg-secondary) 75%), linear-gradient(45deg, var(--color-bg-secondary) 25%, transparent 25%, transparent 75%, var(--color-bg-secondary) 75%)",
        backgroundSize: "16px 16px",
        backgroundPosition: "0 0, 8px 8px",
        overflow: "hidden",
        cursor:
          activeTool === "move"
            ? dragging
              ? "grabbing"
              : "grab"
            : "crosshair",
        userSelect: "none",
      }}
    >
      {/* Image */}
      <img
        src={imageUrl}
        alt={t("cursorPreview")}
        draggable={false}
        style={{
          position: "absolute",
          left: `${frameRect.drawX}px`,
          top: `${frameRect.drawY}px`,
          width: `${frameRect.drawWidth}px`,
          height: `${frameRect.drawHeight}px`,
          imageRendering: scale > 1.5 ? "pixelated" : "auto",
          pointerEvents: "none",
        }}
      />

      {/* Hotspot marker */}
      <div
        style={{
          position: "absolute",
          left: `${hotspotX}px`,
          top: `${hotspotY}px`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        {/* Crosshair lines */}
        <div
          style={{
            position: "absolute",
            left: "-8px",
            top: "-0.5px",
            width: "16px",
            height: "1px",
            backgroundColor: "var(--color-accent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-8px",
            left: "-0.5px",
            width: "1px",
            height: "16px",
            backgroundColor: "var(--color-accent)",
          }}
        />
        {/* Center dot */}
        <div
          style={{
            position: "absolute",
            left: "-3px",
            top: "-3px",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "var(--color-accent)",
            border: "1px solid #fff",
            boxShadow: "0 0 6px var(--color-accent-glow)",
          }}
        />
      </div>

      {/* Grid center guides */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: "1px",
          backgroundColor: "var(--color-border)",
          opacity: 0.3,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: "var(--color-border)",
          opacity: 0.3,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

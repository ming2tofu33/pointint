"use client";

import { type CursorSourceSnapshot } from "@/lib/cursorSources";

interface CursorPreviewLayerProps {
  snapshot: CursorSourceSnapshot | null;
  pointer: {
    x: number;
    y: number;
  };
}

export default function CursorPreviewLayer({
  snapshot,
  pointer,
}: CursorPreviewLayerProps) {
  if (!snapshot) return null;

  const left = pointer.x - snapshot.hotspot.x;
  const top = pointer.y - snapshot.hotspot.y;

  return (
    <div
      data-testid="cursor-preview-layer"
      data-output-size={snapshot.outputSize}
      style={{
        position: "absolute",
        left,
        top,
        width: `${snapshot.outputSize}px`,
        height: `${snapshot.outputSize}px`,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 3,
      }}
    >
      <img
        src={snapshot.frame.src}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}

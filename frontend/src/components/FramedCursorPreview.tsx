"use client";

import { CSSProperties } from "react";

import { FitMode, getFrameRect } from "@/lib/cursorFrame";

interface FramedCursorPreviewProps {
  imageUrl: string;
  sourceWidth: number;
  sourceHeight: number;
  fitMode: FitMode;
  offsetX: number;
  offsetY: number;
  scale: number;
  viewportSize: number;
  alt: string;
  style?: CSSProperties;
}

export default function FramedCursorPreview({
  imageUrl,
  sourceWidth,
  sourceHeight,
  fitMode,
  offsetX,
  offsetY,
  scale,
  viewportSize,
  alt,
  style,
}: FramedCursorPreviewProps) {
  const frameRect = getFrameRect({
    sourceWidth,
    sourceHeight,
    viewportSize,
    fitMode,
    scale,
    offsetX: offsetX * (viewportSize / 256),
    offsetY: offsetY * (viewportSize / 256),
  });

  return (
    <div
      style={{
        position: "relative",
        width: `${viewportSize}px`,
        height: `${viewportSize}px`,
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      <img
        src={imageUrl}
        alt={alt}
        style={{
          position: "absolute",
          left: `${frameRect.drawX}px`,
          top: `${frameRect.drawY}px`,
          width: `${frameRect.drawWidth}px`,
          height: `${frameRect.drawHeight}px`,
          imageRendering: scale > 1.5 ? "pixelated" : "auto",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </div>
  );
}

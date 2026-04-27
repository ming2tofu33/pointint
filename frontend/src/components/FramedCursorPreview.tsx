"use client";

import { CSSProperties } from "react";

import {
  FitMode,
  getFrameRect,
  getTransformedImagePlacement,
  type ImageRotation,
} from "@/lib/cursorFrame";

interface FramedCursorPreviewProps {
  imageUrl: string;
  sourceWidth: number;
  sourceHeight: number;
  fitMode: FitMode;
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation?: ImageRotation;
  flipX?: boolean;
  flipY?: boolean;
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
  rotation = 0,
  flipX = false,
  flipY = false,
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
    rotation,
    flipX,
    flipY,
  });
  const imagePlacement = getTransformedImagePlacement(frameRect, {
    rotation,
    flipX,
    flipY,
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
          left: `${
            frameRect.drawX +
            (frameRect.drawWidth - imagePlacement.imageDrawWidth) / 2
          }px`,
          top: `${
            frameRect.drawY +
            (frameRect.drawHeight - imagePlacement.imageDrawHeight) / 2
          }px`,
          width: `${imagePlacement.imageDrawWidth}px`,
          height: `${imagePlacement.imageDrawHeight}px`,
          imageRendering: scale > 1.5 ? "pixelated" : "auto",
          pointerEvents: "none",
          transform: imagePlacement.transform,
          transformOrigin: "center",
          userSelect: "none",
        }}
      />
    </div>
  );
}

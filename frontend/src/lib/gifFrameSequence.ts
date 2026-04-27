"use client";

import {
  decodeAniPreviewFrames,
  type AniPreviewFrameSequence,
} from "@/lib/aniPreviewFrames";
import { clampAniFrameDuration } from "@/lib/aniFrameEdits";

export interface ExtractedGifFrameFile {
  file: File;
  durationMs: number;
}

export interface ExtractedGifFrameSequence {
  width: number;
  height: number;
  frames: ExtractedGifFrameFile[];
}

interface ExtractGifFrameDependencies {
  decodeFrames?: (file: Blob) => Promise<AniPreviewFrameSequence>;
  canvasToBlob?: (canvas: HTMLCanvasElement) => Promise<Blob>;
}

export async function extractGifFrameFiles(
  file: File,
  dependencies: ExtractGifFrameDependencies = {}
): Promise<ExtractedGifFrameSequence> {
  const decodeFrames = dependencies.decodeFrames ?? decodeAniPreviewFrames;
  const sequence = await decodeFrames(file);

  if (sequence.frames.length === 0) {
    throw new Error("GIF must contain at least one frame.");
  }

  const stem = createGifFrameStem(file.name);
  const frames: ExtractedGifFrameFile[] = [];

  for (const [index, frame] of sequence.frames.entries()) {
    const canvas = getCanvasFromFrameSource(
      frame.source,
      sequence.width,
      sequence.height
    );
    const blob = await (dependencies.canvasToBlob ?? canvasToPngBlob)(canvas);
    const frameNumber = String(index + 1).padStart(3, "0");

    frames.push({
      file: new File([blob], `${stem}-frame-${frameNumber}.png`, {
        type: "image/png",
      }),
      durationMs: clampAniFrameDuration(frame.durationMs),
    });
  }

  return {
    width: sequence.width,
    height: sequence.height,
    frames,
  };
}

function createGifFrameStem(fileName: string) {
  const stem = fileName.replace(/\.[^/.]+$/, "");
  return (
    stem
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "gif"
  );
}

function getCanvasFromFrameSource(
  source: CanvasImageSource,
  width: number,
  height: number
) {
  if (
    typeof HTMLCanvasElement !== "undefined" &&
    source instanceof HTMLCanvasElement
  ) {
    return source;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to create canvas context");
  }

  context.clearRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

async function canvasToPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to rasterize GIF frame"));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

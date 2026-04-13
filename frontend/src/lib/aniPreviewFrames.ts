import { type FitMode, getFrameRect, mapViewportHotspotToOutput } from "@/lib/cursorFrame";
import {
  createAnimatedCursorSource,
  type CursorFrame,
  type CursorPoint,
  type CursorSource,
} from "@/lib/cursorSources";

export interface AniPreviewSourceInput {
  imageUrl: string;
  sourceWidth: number;
  sourceHeight: number;
  fitMode: FitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
  outputSize: number;
  hotspotX: number;
  hotspotY: number;
  editorViewportSize?: number;
}

export interface AniPreviewSourceResult {
  source: CursorSource;
  frameUrls: string[];
  hotspot: CursorPoint;
}

export interface AniDecodedFrame {
  image: AniRenderableFrame;
  durationMs: number;
}

type AniRenderableFrame = CanvasImageSource & {
  close?: () => void;
  duration?: number;
};

type AniImageDecoder = {
  tracks: {
    ready: Promise<void>;
    selectedTrack?: {
      frameCount?: number;
    };
  };
  decode(options: {
    frameIndex: number;
    completeFrames?: boolean;
  }): Promise<{
    image: AniRenderableFrame;
  }>;
  close?: () => void;
};

const DEFAULT_EDITOR_VIEWPORT_SIZE = 256;

export async function buildAniPreviewSource(
  input: AniPreviewSourceInput
): Promise<AniPreviewSourceResult> {
  const editorViewportSize = normalizeViewportSize(input.editorViewportSize);
  const hotspot = mapViewportHotspotToOutput({
    hotspotX: input.hotspotX,
    hotspotY: input.hotspotY,
    viewportSize: editorViewportSize,
    outputSize: input.outputSize,
  });

  const sourceBlob = await fetchPreviewBlob(input.imageUrl);
  const decodedFrames = await decodeAniPreviewFrames(sourceBlob);

  if (!decodedFrames.length) {
    throw new Error("ANI preview unavailable");
  }

  const renderedFrames = await renderDecodedAniFrames(decodedFrames, input);
  const frameUrls: string[] = [];

  try {
    for (const frame of renderedFrames) {
      frameUrls.push(URL.createObjectURL(frame.blob));
    }

    const cursorFrames: CursorFrame[] = frameUrls.map((src, index) => ({
      src,
      durationMs: renderedFrames[index]?.durationMs ?? 100,
    }));

    return {
      source: createAnimatedCursorSource(cursorFrames, hotspot, input.outputSize),
      frameUrls,
      hotspot,
    };
  } catch (error) {
    revokeFrameUrls(frameUrls);
    throw error;
  }
}

export async function decodeAniPreviewFrames(
  blob: Blob
): Promise<AniDecodedFrame[]> {
  const Decoder = getImageDecoderConstructor();
  if (!Decoder) {
    return [];
  }

  const decoder = new Decoder({
    data: blob,
    type: blob.type || "image/gif",
  });

  try {
    await decoder.tracks.ready;
    const frameCount = normalizePositiveInteger(
      decoder.tracks.selectedTrack?.frameCount,
      1
    );
    const frames: AniDecodedFrame[] = [];

    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      const result = await decoder.decode({
        frameIndex,
        completeFrames: true,
      });

      frames.push({
        image: result.image,
        durationMs: normalizePositiveInteger(result.image.duration, 100),
      });
    }

    return frames;
  } catch {
    return [];
  } finally {
    decoder.close?.();
  }
}

async function renderDecodedAniFrames(
  frames: AniDecodedFrame[],
  input: AniPreviewSourceInput
) {
  const renderedFrames: Array<{ blob: Blob; durationMs: number }> = [];

  for (const frame of frames) {
    const blob = await renderAniFrameToBlob(frame.image, input);
    renderedFrames.push({ blob, durationMs: frame.durationMs });
  }

  return renderedFrames;
}

async function renderAniFrameToBlob(
  image: AniRenderableFrame,
  input: AniPreviewSourceInput
) {
  const canvas = document.createElement("canvas");
  canvas.width = input.outputSize;
  canvas.height = input.outputSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    image.close?.();
    throw new Error("Failed to create canvas context");
  }

  try {
    renderCurrentAniFrame(ctx, image, input);
    return await canvasToBlob(canvas);
  } finally {
    image.close?.();
  }
}

function renderCurrentAniFrame(
  ctx: CanvasRenderingContext2D,
  image: AniRenderableFrame,
  input: AniPreviewSourceInput
) {
  const frameRect = getFrameRect({
    sourceWidth: input.sourceWidth,
    sourceHeight: input.sourceHeight,
    viewportSize: input.outputSize,
    fitMode: input.fitMode,
    scale: input.scale,
    offsetX: scaleOffset(input.offsetX, input.outputSize, input.editorViewportSize),
    offsetY: scaleOffset(input.offsetY, input.outputSize, input.editorViewportSize),
  });

  ctx.clearRect(0, 0, input.outputSize, input.outputSize);
  ctx.drawImage(
    image,
    frameRect.drawX,
    frameRect.drawY,
    frameRect.drawWidth,
    frameRect.drawHeight
  );
}

function scaleOffset(
  offset: number,
  outputSize: number,
  editorViewportSize: number | undefined
) {
  const viewportSize = normalizeViewportSize(editorViewportSize);
  return offset * (outputSize / Math.max(viewportSize, 1));
}

function fetchPreviewBlob(imageUrl: string) {
  return fetch(imageUrl).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch ANI preview image: ${response.status}`);
    }

    return response.blob();
  });
}

function getImageDecoderConstructor() {
  const Decoder = (globalThis as typeof globalThis & {
    ImageDecoder?: new (options: { data: Blob; type?: string }) => AniImageDecoder;
  }).ImageDecoder;

  if (typeof Decoder !== "function") {
    return null;
  }

  return Decoder;
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to encode ANI preview frame"));
        return;
      }

      resolve(blob);
    });
  });
}

function normalizePositiveInteger(value: number | undefined, fallback: number) {
  const safe =
    typeof value === "number" && Number.isFinite(value)
      ? Math.floor(value)
      : 0;
  return Math.max(1, safe || fallback);
}

function normalizeViewportSize(viewportSize: number | undefined) {
  return normalizePositiveInteger(viewportSize, DEFAULT_EDITOR_VIEWPORT_SIZE);
}

function revokeFrameUrls(frameUrls: string[]) {
  for (const frameUrl of frameUrls) {
    if (typeof URL.revokeObjectURL === "function") {
      URL.revokeObjectURL(frameUrl);
    }
  }
}

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

export interface AniPreviewSourceOptions {
  fallbackFrameCount?: number;
  fallbackFrameDurationMs?: number;
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

const DEFAULT_FALLBACK_FRAME_COUNT = 6;
const DEFAULT_FALLBACK_FRAME_DURATION_MS = 120;
const DEFAULT_EDITOR_VIEWPORT_SIZE = 256;

export async function buildAniPreviewSource(
  input: AniPreviewSourceInput,
  options: AniPreviewSourceOptions = {}
): Promise<AniPreviewSourceResult> {
  const editorViewportSize = normalizeViewportSize(input.editorViewportSize);
  const fallbackFrameCount = normalizePositiveInteger(
    options.fallbackFrameCount,
    DEFAULT_FALLBACK_FRAME_COUNT
  );
  const fallbackFrameDurationMs = normalizePositiveInteger(
    options.fallbackFrameDurationMs,
    DEFAULT_FALLBACK_FRAME_DURATION_MS
  );
  const hotspot = mapViewportHotspotToOutput({
    hotspotX: input.hotspotX,
    hotspotY: input.hotspotY,
    viewportSize: editorViewportSize,
    outputSize: input.outputSize,
  });

  const sourceBlob = await fetchPreviewBlob(input.imageUrl);
  const decodedFrames = await decodeAniPreviewFrames(sourceBlob);
  const renderedFrames =
    decodedFrames.length > 0
      ? await renderDecodedAniFrames(decodedFrames, input)
      : await renderFallbackAniPreviewFrames(
          input,
          fallbackFrameCount,
          fallbackFrameDurationMs
        );

  const frameUrls: string[] = [];

  try {
    for (const frame of renderedFrames) {
      frameUrls.push(URL.createObjectURL(frame.blob));
    }

    const cursorFrames: CursorFrame[] = frameUrls.map((src, index) => ({
      src,
      durationMs: renderedFrames[index]?.durationMs ?? fallbackFrameDurationMs,
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

async function renderFallbackAniPreviewFrames(
  input: AniPreviewSourceInput,
  frameCount: number,
  frameDurationMs: number
) {
  const image = document.createElement("img");
  image.decoding = "async";
  image.loading = "eager";
  image.src = input.imageUrl;
  image.style.position = "fixed";
  image.style.left = "-99999px";
  image.style.top = "0";
  image.style.width = "1px";
  image.style.height = "1px";
  image.style.opacity = "0";
  image.style.pointerEvents = "none";
  document.body.appendChild(image);

  try {
    await waitForImageLoad(image);

    const canvas = document.createElement("canvas");
    canvas.width = input.outputSize;
    canvas.height = input.outputSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to create canvas context");
    }

    const renderedFrames: Array<{ blob: Blob; durationMs: number }> = [];

    for (let index = 0; index < frameCount; index += 1) {
      if (index > 0) {
        await wait(frameDurationMs);
      }

      renderCurrentFallbackFrame(ctx, image, input);
      const blob = await canvasToBlob(canvas);
      renderedFrames.push({ blob, durationMs: frameDurationMs });
    }

    return renderedFrames;
  } finally {
    image.remove();
  }
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

function renderCurrentFallbackFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
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

function waitForImageLoad(image: HTMLImageElement) {
  return new Promise<void>((resolve, reject) => {
    if (image.complete && image.naturalWidth > 0) {
      resolve();
      return;
    }

    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to load ANI preview image"));
  });
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
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

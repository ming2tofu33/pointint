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
  frameCount?: number;
  frameDurationMs?: number;
  sampleFrame?: (frameIndex: number, input: AniPreviewSourceInput) => Promise<Blob>;
}

export interface AniPreviewSourceResult {
  source: CursorSource;
  frameUrls: string[];
  hotspot: CursorPoint;
}

const DEFAULT_FRAME_COUNT = 6;
const DEFAULT_FRAME_DURATION_MS = 120;
const DEFAULT_EDITOR_VIEWPORT_SIZE = 256;

export async function buildAniPreviewSource(
  input: AniPreviewSourceInput,
  options: AniPreviewSourceOptions = {}
): Promise<AniPreviewSourceResult> {
  const frameCount = normalizeFrameCount(options.frameCount);
  const frameDurationMs = normalizeFrameDuration(options.frameDurationMs);
  const frameUrls: string[] = [];
  const editorViewportSize = normalizeEditorViewportSize(input.editorViewportSize);

  try {
    const frames = options.sampleFrame
      ? await sampleFramesWithInjectedSampler(input, options.sampleFrame, frameCount, frameDurationMs)
      : await sampleRenderedAniFrames(input, frameCount, frameDurationMs);

    for (const frame of frames) {
      frameUrls.push(URL.createObjectURL(frame.blob));
    }

    const cursorFrames: CursorFrame[] = frameUrls.map((src) => ({
      src,
      durationMs: frameDurationMs,
    }));
    const hotspot = mapViewportHotspotToOutput({
      hotspotX: input.hotspotX,
      hotspotY: input.hotspotY,
      viewportSize: editorViewportSize,
      outputSize: input.outputSize,
    });

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

async function sampleFramesWithInjectedSampler(
  input: AniPreviewSourceInput,
  sampleFrame: (frameIndex: number, input: AniPreviewSourceInput) => Promise<Blob>,
  frameCount: number,
  frameDurationMs: number
) {
  const frames: Array<{ blob: Blob; durationMs: number }> = [];

  for (let index = 0; index < frameCount; index += 1) {
    const blob = await sampleFrame(index, input);
    frames.push({ blob, durationMs: frameDurationMs });
  }

  return frames;
}

async function sampleRenderedAniFrames(
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

    const frames: Array<{ blob: Blob; durationMs: number }> = [];

    for (let index = 0; index < frameCount; index += 1) {
      if (index > 0) {
        await wait(frameDurationMs);
      }

      renderCurrentFrame(ctx, image, input);
      const blob = await canvasToBlob(canvas);
      frames.push({ blob, durationMs: frameDurationMs });
    }

    return frames;
  } finally {
    image.remove();
  }
}

function renderCurrentFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  input: AniPreviewSourceInput
) {
  const editorViewportSize = normalizeEditorViewportSize(
    input.editorViewportSize
  );
  const offsetScale = input.outputSize / Math.max(editorViewportSize, 1);
  const frameRect = getFrameRect({
    sourceWidth: input.sourceWidth,
    sourceHeight: input.sourceHeight,
    viewportSize: input.outputSize,
    fitMode: input.fitMode,
    scale: input.scale,
    offsetX: input.offsetX * offsetScale,
    offsetY: input.offsetY * offsetScale,
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

function normalizeFrameCount(frameCount: number | undefined) {
  const value =
    typeof frameCount === "number" && Number.isFinite(frameCount)
      ? Math.floor(frameCount)
      : 0;
  return Math.max(1, value || DEFAULT_FRAME_COUNT);
}

function normalizeFrameDuration(frameDurationMs: number | undefined) {
  const value =
    typeof frameDurationMs === "number" && Number.isFinite(frameDurationMs)
      ? Math.floor(frameDurationMs)
      : 0;
  return Math.max(1, value || DEFAULT_FRAME_DURATION_MS);
}

function normalizeEditorViewportSize(editorViewportSize: number | undefined) {
  const value =
    typeof editorViewportSize === "number" &&
    Number.isFinite(editorViewportSize)
      ? Math.floor(editorViewportSize)
      : 0;
  return Math.max(1, value || DEFAULT_EDITOR_VIEWPORT_SIZE);
}

function revokeFrameUrls(frameUrls: string[]) {
  for (const frameUrl of frameUrls) {
    if (typeof URL.revokeObjectURL === "function") {
      URL.revokeObjectURL(frameUrl);
    }
  }
}

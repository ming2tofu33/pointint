"use client";

import {
  getFrameRect,
  mapViewportHotspotToOutput,
  type FitMode,
} from "@/lib/cursorFrame";
import {
  createAnimatedCursorSource,
  type CursorFrame,
  type CursorSource,
} from "@/lib/cursorSources";

const DEFAULT_EDITOR_VIEWPORT_SIZE = 256;
const DEFAULT_FRAME_DURATION_MS = 100;

export interface AniPreviewInput {
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

export interface AniPreviewFrame {
  source: CanvasImageSource;
  durationMs: number;
}

export interface AniPreviewFrameSequence {
  width: number;
  height: number;
  frames: AniPreviewFrame[];
}

export interface GifFrameMetadata {
  width: number;
  height: number;
  frameCount: number;
  frameDurationsMs: number[];
}

interface ImageDecoderTrack {
  ready: Promise<unknown>;
  selectedTrack: { frameCount: number } | null;
}

interface ImageDecoderDecodeResult {
  image: CanvasImageSource & {
    duration?: number;
    close?: () => void;
    displayWidth?: number;
    displayHeight?: number;
  };
}

interface ImageDecoderConstructorLike {
  new (init: { data: Blob; type: string }): {
    tracks: ImageDecoderTrack;
    decode(init: { frameIndex: number; completeFrames: boolean }): Promise<ImageDecoderDecodeResult>;
    close?: () => void;
  };
}

export interface AniPreviewDependencies {
  fetchBlob?: (imageUrl: string) => Promise<Blob>;
  imageDecoder?: ImageDecoderConstructorLike | null;
  frameSequenceLoader?: (imageUrl: string) => Promise<AniPreviewFrameSequence>;
  parseGifMetadata?: (buffer: ArrayBuffer) => GifFrameMetadata;
  sampleGifFrames?: (
    blob: Blob,
    metadata: GifFrameMetadata
  ) => Promise<AniPreviewFrameSequence>;
  createCanvas?: () => HTMLCanvasElement;
  createObjectURL?: typeof URL.createObjectURL;
  revokeObjectURL?: typeof URL.revokeObjectURL;
}

export interface AniPreviewBuildResult {
  source: CursorSource;
  frameUrls: string[];
}

const preparedSequenceCache = new Map<string, Promise<AniPreviewFrameSequence>>();

export async function buildAniPreviewSource(
  input: AniPreviewInput,
  dependencies: AniPreviewDependencies = {}
): Promise<AniPreviewBuildResult> {
  const sequence = await prepareAniPreviewFrames(input.imageUrl, dependencies);
  const outputSize = normalizeOutputSize(input.outputSize);
  const mappedHotspot = mapViewportHotspotToOutput({
    hotspotX: input.hotspotX,
    hotspotY: input.hotspotY,
    viewportSize: input.editorViewportSize ?? DEFAULT_EDITOR_VIEWPORT_SIZE,
    outputSize,
  });

  const frameUrls: string[] = [];

  try {
    for (const frame of sequence.frames) {
      const rendered = await renderAniPreviewFrame({
        source: frame.source,
        sourceWidth: sequence.width,
        sourceHeight: sequence.height,
        fitMode: input.fitMode,
        scale: input.scale,
        offsetX: input.offsetX,
        offsetY: input.offsetY,
        outputSize,
      });

      const blob = await canvasToBlob(rendered);
      const objectUrl = createObjectUrl(blob, dependencies);
      frameUrls.push(objectUrl);
    }
  } catch (error) {
    frameUrls.forEach((url) => safeRevokeObjectURL(url, dependencies));
    throw error;
  }

  const source = createAnimatedCursorSource(
    frameUrls.map(
      (src, index): CursorFrame => ({
        src,
        durationMs: sequence.frames[index]?.durationMs,
      })
    ),
    mappedHotspot,
    outputSize
  );

  return {
    source,
    frameUrls,
  };
}

export async function prepareAniPreviewFrames(
  imageUrl: string,
  dependencies: AniPreviewDependencies = {}
): Promise<AniPreviewFrameSequence> {
  const cached = preparedSequenceCache.get(imageUrl);
  if (cached) {
    return cached;
  }

  const loader =
    dependencies.frameSequenceLoader ??
    ((nextImageUrl: string) => loadAniPreviewFramesFromUrl(nextImageUrl, dependencies));

  const sequencePromise = loader(imageUrl).catch((error) => {
    preparedSequenceCache.delete(imageUrl);
    throw error;
  });

  preparedSequenceCache.set(imageUrl, sequencePromise);
  return sequencePromise;
}

export async function decodeAniPreviewFrames(
  blob: Blob,
  dependencies: AniPreviewDependencies = {}
): Promise<AniPreviewFrameSequence> {
  const imageDecoderCtor = dependencies.imageDecoder ?? getGlobalImageDecoder();
  if (imageDecoderCtor) {
    return decodeGifFramesWithImageDecoder(blob, imageDecoderCtor, dependencies);
  }

  const metadata = await readGifMetadataFromBlob(
    blob,
    dependencies.parseGifMetadata ?? parseGifFrameMetadata
  );

  if (dependencies.sampleGifFrames) {
    return dependencies.sampleGifFrames(blob, metadata);
  }

  return sampleGifFramesFromBrowser(blob, metadata, dependencies);
}

export function parseGifFrameMetadata(buffer: ArrayBuffer): GifFrameMetadata {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 13) {
    throw new Error("GIF is too short.");
  }

  const header = bytesToAscii(bytes.slice(0, 6));
  if (header !== "GIF87a" && header !== "GIF89a") {
    throw new Error("Unsupported file type. GIF only.");
  }

  const view = new DataView(buffer);
  const width = Math.max(1, view.getUint16(6, true));
  const height = Math.max(1, view.getUint16(8, true));
  const packed = bytes[10] ?? 0;

  let offset = 13;
  if (packed & 0x80) {
    offset += 3 * (1 << ((packed & 0x07) + 1));
  }

  const frameDurationsMs: number[] = [];
  let pendingDelayMs = DEFAULT_FRAME_DURATION_MS;

  while (offset < bytes.length) {
    const blockId = bytes[offset++];

    if (blockId === 0x3b) {
      break;
    }

    if (blockId === 0x21) {
      const extensionLabel = bytes[offset++];

      if (extensionLabel === 0xf9) {
        offset += 1; // block size
        offset += 1; // packed fields
        const delayCs = view.getUint16(offset, true);
        offset += 2;
        offset += 1; // transparent color index
        offset += 1; // terminator
        pendingDelayMs = normalizeGifDuration(delayCs * 10);
        continue;
      }

      offset = skipGifSubBlocks(bytes, offset);
      continue;
    }

    if (blockId === 0x2c) {
      frameDurationsMs.push(pendingDelayMs);
      offset += 8; // frame position + size
      const imagePacked = bytes[offset++];

      if (imagePacked & 0x80) {
        offset += 3 * (1 << ((imagePacked & 0x07) + 1));
      }

      offset += 1; // LZW minimum code size
      offset = skipGifSubBlocks(bytes, offset);
      pendingDelayMs = DEFAULT_FRAME_DURATION_MS;
      continue;
    }

    throw new Error("Unsupported GIF structure.");
  }

  if (!frameDurationsMs.length) {
    throw new Error("GIF must contain at least one frame.");
  }

  return {
    width,
    height,
    frameCount: frameDurationsMs.length,
    frameDurationsMs,
  };
}

async function loadAniPreviewFramesFromUrl(
  imageUrl: string,
  dependencies: AniPreviewDependencies
): Promise<AniPreviewFrameSequence> {
  const fetchBlob = dependencies.fetchBlob ?? fetchBlobFromUrl;
  const blob = await fetchBlob(imageUrl);
  return decodeAniPreviewFrames(blob, dependencies);
}

async function fetchBlobFromUrl(imageUrl: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to load image: ${response.status}`);
  }

  return response.blob();
}

async function decodeGifFramesWithImageDecoder(
  blob: Blob,
  ImageDecoderCtor: ImageDecoderConstructorLike,
  dependencies: AniPreviewDependencies
): Promise<AniPreviewFrameSequence> {
  const decoder = new ImageDecoderCtor({
    data: blob,
    type: blob.type || "image/gif",
  });

  await decoder.tracks.ready;

  const frameCount = decoder.tracks.selectedTrack?.frameCount ?? 0;
  if (!frameCount) {
    throw new Error("GIF must contain at least one frame.");
  }

  const frames: AniPreviewFrame[] = [];
  let width = 0;
  let height = 0;

  try {
    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      const decoded = await decoder.decode({
        frameIndex,
        completeFrames: true,
      });
      const image = decoded.image;
      width = width || getDrawableWidth(image);
      height = height || getDrawableHeight(image);

      const canvas = createCanvasElement(width, height, dependencies);
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Failed to create canvas context");
      }

      context.clearRect(0, 0, width, height);
      context.drawImage(image as CanvasImageSource, 0, 0, width, height);
      frames.push({
        source: canvas,
        durationMs: normalizeGifDuration(
          decodeImageFrameDurationMs(image.duration)
        ),
      });

      if (typeof image.close === "function") {
        image.close();
      }
    }
  } finally {
    if (typeof decoder.close === "function") {
      decoder.close();
    }
  }

  return {
    width,
    height,
    frames,
  };
}

async function sampleGifFramesFromBrowser(
  blob: Blob,
  metadata: GifFrameMetadata,
  dependencies: AniPreviewDependencies
): Promise<AniPreviewFrameSequence> {
  const imageUrl = createObjectUrl(blob, dependencies);
  try {
    const image = await loadAnimatedImage(imageUrl);
    const frames: AniPreviewFrame[] = [];

    for (let frameIndex = 0; frameIndex < metadata.frameDurationsMs.length; frameIndex += 1) {
      if (frameIndex > 0) {
        await waitForFrameDuration(
          metadata.frameDurationsMs[frameIndex - 1] ?? DEFAULT_FRAME_DURATION_MS
        );
      }

      const canvas = createCanvasElement(metadata.width, metadata.height, dependencies);
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Failed to create canvas context");
      }

      context.clearRect(0, 0, metadata.width, metadata.height);
      context.drawImage(image, 0, 0, metadata.width, metadata.height);
      frames.push({
        source: canvas,
        durationMs: normalizeGifDuration(metadata.frameDurationsMs[frameIndex]),
      });
    }

    return {
      width: metadata.width,
      height: metadata.height,
      frames,
    };
  } finally {
    safeRevokeObjectURL(imageUrl, dependencies);
  }
}

async function readGifMetadataFromBlob(
  blob: Blob,
  parseGifMetadata: (buffer: ArrayBuffer) => GifFrameMetadata
): Promise<GifFrameMetadata> {
  return parseGifMetadata(await readBlobArrayBuffer(blob));
}

async function renderAniPreviewFrame(input: {
  source: CanvasImageSource;
  sourceWidth: number;
  sourceHeight: number;
  fitMode: FitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
  outputSize: number;
}) {
  const {
    source,
    sourceWidth,
    sourceHeight,
    fitMode,
    scale,
    offsetX,
    offsetY,
    outputSize,
  } = input;

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to create canvas context");
  }

  const offsetScale = outputSize / DEFAULT_EDITOR_VIEWPORT_SIZE;
  const frameRect = getFrameRect({
    sourceWidth,
    sourceHeight,
    viewportSize: outputSize,
    fitMode,
    scale,
    offsetX: offsetX * offsetScale,
    offsetY: offsetY * offsetScale,
  });

  context.clearRect(0, 0, outputSize, outputSize);
  context.drawImage(
    source,
    frameRect.drawX,
    frameRect.drawY,
    frameRect.drawWidth,
    frameRect.drawHeight
  );

  return canvas;
}

function createCanvasElement(
  width: number,
  height: number,
  dependencies: AniPreviewDependencies
) {
  const canvas = dependencies.createCanvas?.() ?? document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function createObjectUrl(blob: Blob, dependencies: AniPreviewDependencies) {
  const createObjectURL = dependencies.createObjectURL ?? URL.createObjectURL;
  return createObjectURL(blob);
}

function safeRevokeObjectURL(url: string, dependencies: AniPreviewDependencies) {
  const revokeObjectURL = dependencies.revokeObjectURL ?? URL.revokeObjectURL;
  if (typeof revokeObjectURL === "function") {
    revokeObjectURL(url);
  }
}

function getGlobalImageDecoder(): ImageDecoderConstructorLike | null {
  const globalDecoder = (globalThis as typeof globalThis & {
    ImageDecoder?: ImageDecoderConstructorLike;
  }).ImageDecoder;

  return globalDecoder ?? null;
}

function getDrawableWidth(source: ImageDecoderDecodeResult["image"]) {
  const frame = source as {
    width?: number;
    codedWidth?: number;
    displayWidth?: number;
  };

  return (
    frame.displayWidth ??
    frame.width ??
    frame.codedWidth ??
    1
  );
}

function getDrawableHeight(source: ImageDecoderDecodeResult["image"]) {
  const frame = source as {
    height?: number;
    codedHeight?: number;
    displayHeight?: number;
  };

  return (
    frame.displayHeight ??
    frame.height ??
    frame.codedHeight ??
    1
  );
}

function decodeImageFrameDurationMs(duration?: number) {
  if (!Number.isFinite(duration ?? NaN)) {
    return DEFAULT_FRAME_DURATION_MS;
  }

  return Math.max(1, Math.round((duration ?? 0) / 1000));
}

function normalizeGifDuration(durationMs: number) {
  if (!Number.isFinite(durationMs)) {
    return DEFAULT_FRAME_DURATION_MS;
  }

  return Math.max(1, Math.round(durationMs));
}

function normalizeOutputSize(outputSize: number) {
  if (!Number.isFinite(outputSize)) {
    return 32;
  }

  const safeSize = Math.floor(outputSize);
  return safeSize > 0 ? safeSize : 32;
}

function skipGifSubBlocks(bytes: Uint8Array, startOffset: number) {
  let offset = startOffset;

  while (offset < bytes.length) {
    const blockSize = bytes[offset++];
    if (blockSize === 0) {
      return offset;
    }

    offset += blockSize;
  }

  throw new Error("Unexpected end of GIF data.");
}

async function loadAnimatedImage(imageUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = imageUrl;
  });
}

async function waitForFrameDuration(durationMs: number) {
  const safeDuration = Math.max(1, Math.round(durationMs));

  await new Promise<void>((resolve) => {
    window.setTimeout(() => {
      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(() => resolve());
        return;
      }

      resolve();
    }, safeDuration);
  });
}

async function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to rasterize image"));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

function bytesToAscii(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
}

async function readBlobArrayBuffer(blob: Blob) {
  if (typeof blob.arrayBuffer === "function") {
    return blob.arrayBuffer();
  }

  return new Response(blob).arrayBuffer();
}

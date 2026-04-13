"use client";

import { GifReader } from "omggif";

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
    decode(init: {
      frameIndex: number;
      completeFrames: boolean;
    }): Promise<ImageDecoderDecodeResult>;
    close?: () => void;
  };
}

interface GifReaderLike {
  width: number;
  height: number;
  numFrames(): number;
  frameInfo(index: number): { delay?: number };
  decodeAndBlitFrameRGBA(index: number, pixels: Uint8ClampedArray): void;
}

export interface AniPreviewDependencies {
  fetchBlob?: (imageUrl: string) => Promise<Blob>;
  imageDecoder?: ImageDecoderConstructorLike | null;
  gifReaderFactory?: (bytes: Uint8Array) => GifReaderLike;
  frameSequenceLoader?: (imageUrl: string) => Promise<AniPreviewFrameSequence>;
  createCanvas?: () => HTMLCanvasElement;
  createImageData?: (
    pixels: Uint8ClampedArray,
    width: number,
    height: number
  ) => ImageData;
  createObjectURL?: typeof URL.createObjectURL;
  revokeObjectURL?: typeof URL.revokeObjectURL;
}

export interface AniPreviewBuildResult {
  source: CursorSource;
  frameUrls: string[];
}

const sequenceCacheByLoader = new WeakMap<
  (imageUrl: string) => Promise<AniPreviewFrameSequence>,
  Map<string, Promise<AniPreviewFrameSequence>>
>();

const defaultFrameSequenceLoader = (imageUrl: string) =>
  loadAniPreviewFramesFromUrl(imageUrl, {});

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
      frameUrls.push(createObjectUrl(blob, dependencies));
    }
  } catch (error) {
    frameUrls.forEach((url) => safeRevokeObjectURL(url, dependencies));
    throw error;
  }

  return {
    source: createAnimatedCursorSource(
      frameUrls.map((src, index): CursorFrame => ({
        src,
        durationMs: sequence.frames[index]?.durationMs,
      })),
      mappedHotspot,
      outputSize
    ),
    frameUrls,
  };
}

export async function prepareAniPreviewFrames(
  imageUrl: string,
  dependencies: AniPreviewDependencies = {}
): Promise<AniPreviewFrameSequence> {
  const loader =
    dependencies.frameSequenceLoader ?? defaultFrameSequenceLoader;
  let cacheForLoader = sequenceCacheByLoader.get(loader);
  if (!cacheForLoader) {
    cacheForLoader = new Map<string, Promise<AniPreviewFrameSequence>>();
    sequenceCacheByLoader.set(loader, cacheForLoader);
  }

  const cached = cacheForLoader.get(imageUrl);
  if (cached) {
    return cached;
  }

  const sequencePromise = loader(imageUrl).catch((error) => {
    cacheForLoader?.delete(imageUrl);
    throw error;
  });

  cacheForLoader.set(imageUrl, sequencePromise);
  return sequencePromise;
}

export function releaseAniPreviewFrames(
  imageUrl: string,
  dependencies: AniPreviewDependencies = {}
) {
  const loader = dependencies.frameSequenceLoader ?? defaultFrameSequenceLoader;
  const cacheForLoader = sequenceCacheByLoader.get(loader);
  cacheForLoader?.delete(imageUrl);
}

export async function decodeAniPreviewFrames(
  blob: Blob,
  dependencies: AniPreviewDependencies = {}
): Promise<AniPreviewFrameSequence> {
  const imageDecoderCtor = dependencies.imageDecoder ?? getGlobalImageDecoder();
  if (imageDecoderCtor) {
    return decodeGifFramesWithImageDecoder(blob, imageDecoderCtor, dependencies);
  }

  return decodeGifFramesWithReader(blob, dependencies);
}

export function parseGifFrameMetadata(buffer: ArrayBuffer): GifFrameMetadata {
  const reader = createGifReader(new Uint8Array(buffer), {});
  const frameCount = reader.numFrames();

  return {
    width: reader.width,
    height: reader.height,
    frameCount,
    frameDurationsMs: Array.from({ length: frameCount }, (_, index) =>
      normalizeGifDuration((reader.frameInfo(index).delay ?? 0) * 10)
    ),
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
        durationMs: normalizeGifDuration(decodeImageFrameDurationMs(image.duration)),
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

async function decodeGifFramesWithReader(
  blob: Blob,
  dependencies: AniPreviewDependencies
): Promise<AniPreviewFrameSequence> {
  const bytes = new Uint8Array(await readBlobArrayBuffer(blob));
  const reader = createGifReader(bytes, dependencies);
  const frameCount = reader.numFrames();
  if (!frameCount) {
    throw new Error("GIF must contain at least one frame.");
  }

  const width = reader.width;
  const height = reader.height;
  const frames: AniPreviewFrame[] = [];
  const pixels = new Uint8ClampedArray(width * height * 4);

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    reader.decodeAndBlitFrameRGBA(frameIndex, pixels);

    const canvas = createCanvasElement(width, height, dependencies);
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to create canvas context");
    }

    const imageData = createImageData(pixels, width, height, dependencies);
    context.clearRect(0, 0, width, height);
    context.putImageData(imageData, 0, 0);

    frames.push({
      source: canvas,
      durationMs: normalizeGifDuration((reader.frameInfo(frameIndex).delay ?? 0) * 10),
    });
  }

  return {
    width,
    height,
    frames,
  };
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

function createImageData(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  dependencies: AniPreviewDependencies
) {
  return (
    dependencies.createImageData ??
    ((data, w, h) => new ImageData(data as any, w, h))
  )(pixels, width, height);
}

function createGifReader(
  bytes: Uint8Array,
  dependencies: AniPreviewDependencies
): GifReaderLike {
  if (dependencies.gifReaderFactory) {
    return dependencies.gifReaderFactory(bytes);
  }

  return new GifReader(bytes) as unknown as GifReaderLike;
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

  return frame.displayWidth ?? frame.width ?? frame.codedWidth ?? 1;
}

function getDrawableHeight(source: ImageDecoderDecodeResult["image"]) {
  const frame = source as {
    height?: number;
    codedHeight?: number;
    displayHeight?: number;
  };

  return frame.displayHeight ?? frame.height ?? frame.codedHeight ?? 1;
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

async function fetchBlobFromUrl(imageUrl: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to load image: ${response.status}`);
  }

  return response.blob();
}

async function readBlobArrayBuffer(blob: Blob) {
  if (typeof blob.arrayBuffer === "function") {
    return blob.arrayBuffer();
  }

  return new Response(blob).arrayBuffer();
}

"use client";

export const DEFAULT_VIDEO_TO_ANI_DURATION_MS = 3000;
export const DEFAULT_VIDEO_TO_ANI_FPS = 10;
export const DEFAULT_VIDEO_TO_ANI_MAX_FRAMES = 30;

export interface ExtractedVideoFrameFile {
  file: File;
  durationMs: number;
}

export interface ExtractedVideoFrameSequence {
  width: number;
  height: number;
  frames: ExtractedVideoFrameFile[];
}

export interface ExtractVideoFrameOptions {
  startMs?: number;
  durationMs?: number;
  fps?: number;
  maxFrames?: number;
}

export interface VideoMetadata {
  width: number;
  height: number;
  durationMs: number;
}

export interface ExtractVideoFrameDependencies {
  loadMetadata?: (file: File) => Promise<VideoMetadata>;
  captureFrame?: (
    file: File,
    timeMs: number,
    metadata: VideoMetadata
  ) => Promise<HTMLCanvasElement>;
  canvasToBlob?: (canvas: HTMLCanvasElement) => Promise<Blob>;
}

export async function extractVideoFrameFiles(
  file: File,
  options: ExtractVideoFrameOptions = {},
  dependencies: ExtractVideoFrameDependencies = {}
): Promise<ExtractedVideoFrameSequence> {
  const loadMetadata = dependencies.loadMetadata ?? loadVideoMetadata;
  const captureFrame = dependencies.captureFrame ?? captureVideoFrame;
  const canvasToBlob = dependencies.canvasToBlob ?? canvasToPngBlob;
  const metadata = await loadMetadata(file);

  if (
    !isPositiveFiniteNumber(metadata.width) ||
    !isPositiveFiniteNumber(metadata.height)
  ) {
    throw new Error("Video metadata must include a drawable size.");
  }

  if (!isNonNegativeFiniteNumber(metadata.durationMs)) {
    throw new Error("Video metadata must include a valid duration.");
  }

  const startMs = Math.max(
    0,
    readFiniteNumber(options.startMs, 0, "start time")
  );
  const requestedDurationMs = readPositiveFiniteNumber(
    options.durationMs,
    DEFAULT_VIDEO_TO_ANI_DURATION_MS,
    "duration"
  );
  const fps = readPositiveFiniteNumber(
    options.fps,
    DEFAULT_VIDEO_TO_ANI_FPS,
    "fps"
  );
  const maxFrames = Math.floor(
    readPositiveFiniteNumber(
      options.maxFrames,
      DEFAULT_VIDEO_TO_ANI_MAX_FRAMES,
      "max frames"
    )
  );
  const frameDurationMs = Math.round(1000 / fps);
  const remainingDurationMs = Math.max(0, metadata.durationMs - startMs);
  const usableDurationMs = Math.min(requestedDurationMs, remainingDurationMs);
  const frameCount = Math.min(
    maxFrames,
    Math.floor(usableDurationMs / frameDurationMs)
  );

  if (frameCount < 2) {
    throw new Error("Video segment must allow at least two frames.");
  }

  const stem = createVideoFrameStem(file.name);
  const frames: ExtractedVideoFrameFile[] = [];

  for (let index = 0; index < frameCount; index += 1) {
    const canvas = await captureFrame(
      file,
      startMs + index * frameDurationMs,
      metadata
    );
    const blob = await canvasToBlob(canvas);
    const frameNumber = String(index + 1).padStart(3, "0");

    frames.push({
      file: new File([blob], `${stem}-frame-${frameNumber}.png`, {
        type: "image/png",
      }),
      durationMs: frameDurationMs,
    });
  }

  return {
    width: metadata.width,
    height: metadata.height,
    frames,
  };
}

function createVideoFrameStem(fileName: string) {
  const stem = fileName.replace(/\.[^/.]+$/, "");
  return (
    stem
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "video"
  );
}

function isPositiveFiniteNumber(value: number) {
  return Number.isFinite(value) && value > 0;
}

function isNonNegativeFiniteNumber(value: number) {
  return Number.isFinite(value) && value >= 0;
}

function readFiniteNumber(
  value: number | undefined,
  fallback: number,
  label: string
) {
  const resolvedValue = value ?? fallback;

  if (!Number.isFinite(resolvedValue)) {
    throw new Error(`Video frame ${label} must be a finite number.`);
  }

  return resolvedValue;
}

function readPositiveFiniteNumber(
  value: number | undefined,
  fallback: number,
  label: string
) {
  const resolvedValue = readFiniteNumber(value, fallback, label);

  if (resolvedValue <= 0) {
    throw new Error(`Video frame ${label} must be greater than zero.`);
  }

  return resolvedValue;
}

async function loadVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("error", handleError);
      URL.revokeObjectURL(objectUrl);
    };

    const handleLoadedMetadata = () => {
      cleanup();
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        durationMs: video.duration * 1000,
      });
    };

    const handleError = () => {
      cleanup();
      reject(new Error("Failed to load video metadata."));
    };

    video.preload = "metadata";
    video.muted = true;
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("error", handleError);
    video.src = objectUrl;
    video.load();
  });
}

async function captureVideoFrame(
  file: File,
  timeMs: number,
  metadata: VideoMetadata
) {
  const haveCurrentDataReadyState = 2;

  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    let settled = false;

    const cleanup = () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
      URL.revokeObjectURL(objectUrl);
    };

    const rejectOnce = (error: Error) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      reject(error);
    };

    const drawCurrentFrame = () => {
      if (settled || video.readyState < haveCurrentDataReadyState) {
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = metadata.width;
      canvas.height = metadata.height;
      const context = canvas.getContext("2d");

      if (!context) {
        rejectOnce(new Error("Failed to create canvas context."));
        return;
      }

      try {
        context.drawImage(video, 0, 0, metadata.width, metadata.height);
      } catch (error) {
        rejectOnce(toError(error, "Failed to draw video frame."));
        return;
      }

      settled = true;
      cleanup();
      resolve(canvas);
    };

    const handleLoadedMetadata = () => {
      if (timeMs === 0) {
        drawCurrentFrame();
        return;
      }

      try {
        video.currentTime = timeMs / 1000;
      } catch (error) {
        rejectOnce(toError(error, "Failed to seek video frame."));
      }
    };

    const handleLoadedData = () => {
      if (timeMs === 0) {
        drawCurrentFrame();
      }
    };

    const handleSeeked = () => {
      drawCurrentFrame();
    };

    const handleError = () => {
      rejectOnce(new Error("Failed to capture video frame."));
    };

    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("error", handleError);
    video.src = objectUrl;
    video.load();
  });
}

function toError(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error : new Error(fallbackMessage);
}

async function canvasToPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to rasterize video frame."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

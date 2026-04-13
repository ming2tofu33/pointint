export type CursorPoint = {
  x: number;
  y: number;
};

export type CursorFrame = {
  src: string;
  durationMs?: number;
};

export type CursorSourceKind = "static" | "animated";

export type CursorSourceSnapshot = {
  frame: CursorFrame;
  hotspot: CursorPoint;
  outputSize: number;
  frameIndex: number;
};

export interface CursorSource {
  kind: CursorSourceKind;
  hotspot: CursorPoint;
  outputSize: number;
  getFrameAtTime(now: number): CursorSourceSnapshot;
}

export function createStaticCursorSource(
  frame: CursorFrame,
  hotspot: CursorPoint,
  outputSize: number
): CursorSource {
  const safeFrame = normalizeFrame(frame);
  const safeHotspot = normalizePoint(hotspot);

  return {
    kind: "static",
    hotspot: safeHotspot,
    outputSize: normalizeOutputSize(outputSize),
    getFrameAtTime() {
      return {
        frame: safeFrame,
        hotspot: safeHotspot,
        outputSize: normalizeOutputSize(outputSize),
        frameIndex: 0,
      };
    },
  };
}

export function createAnimatedCursorSource(
  frames: CursorFrame[],
  hotspot: CursorPoint,
  outputSize: number
): CursorSource {
  const normalizedFrames = frames.map(normalizeFrame);
  if (!normalizedFrames.length) {
    throw new Error("Animated cursor sources require at least one frame");
  }

  const safeHotspot = normalizePoint(hotspot);
  const safeOutputSize = normalizeOutputSize(outputSize);
  const startedAt = Date.now();
  const durations = normalizedFrames.map((frame) =>
    normalizeDuration(frame.durationMs)
  );
  const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);

  return {
    kind: "animated",
    hotspot: safeHotspot,
    outputSize: safeOutputSize,
    getFrameAtTime(now: number) {
      const elapsed = Math.max(0, now - startedAt);
      const cycleTime = totalDuration > 0 ? elapsed % totalDuration : 0;
      let remaining = cycleTime;

      for (let index = 0; index < normalizedFrames.length; index += 1) {
        const duration = durations[index] ?? 100;
        if (remaining < duration) {
          return {
            frame: normalizedFrames[index]!,
            hotspot: safeHotspot,
            outputSize: safeOutputSize,
            frameIndex: index,
          };
        }
        remaining -= duration;
      }

      return {
        frame: normalizedFrames[normalizedFrames.length - 1]!,
        hotspot: safeHotspot,
        outputSize: safeOutputSize,
        frameIndex: normalizedFrames.length - 1,
      };
    },
  };
}

function normalizeFrame(frame: CursorFrame): CursorFrame {
  return {
    src: frame.src,
    durationMs: normalizeDuration(frame.durationMs),
  };
}

function normalizeDuration(durationMs: number | undefined) {
  const safe = Number.isFinite(durationMs ?? NaN) ? Math.floor(durationMs ?? 0) : 0;
  return Math.max(1, safe || 100);
}

function normalizePoint(point: CursorPoint): CursorPoint {
  return {
    x: normalizeCoordinate(point.x),
    y: normalizeCoordinate(point.y),
  };
}

function normalizeCoordinate(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return clamp(Math.floor(value), 0, Number.MAX_SAFE_INTEGER);
}

function normalizeOutputSize(outputSize: number) {
  const safe = Number.isFinite(outputSize) ? Math.floor(outputSize) : 0;
  return safe > 0 ? safe : 32;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

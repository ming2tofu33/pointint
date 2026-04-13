import { afterEach, describe, expect, it, vi } from "vitest";

import { decodeAniPreviewFrames } from "@/lib/aniPreviewFrames";

describe("decodeAniPreviewFrames", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("decodes every GIF frame and preserves per-frame durations", async () => {
    const frames = [
      { duration: 40 },
      { duration: 80 },
      { duration: 120 },
    ];

    const decoder = {
      tracks: {
        ready: Promise.resolve(),
        selectedTrack: { frameCount: frames.length },
      },
      decode: vi.fn(async ({ frameIndex }: { frameIndex: number }) => ({
          image: {
            duration: frames[frameIndex]?.duration ?? 0,
          } as unknown as CanvasImageSource & { duration?: number; close?: () => void },
      })),
      close: vi.fn(),
    };

    vi.stubGlobal(
      "ImageDecoder",
      vi.fn(() => decoder)
    );

    const result = await decodeAniPreviewFrames(new Blob(["gif"], { type: "image/gif" }));

    expect(result).toHaveLength(3);
    expect(result.map((frame) => frame.durationMs)).toEqual([40, 80, 120]);
    expect(decoder.decode).toHaveBeenCalledTimes(3);
    expect(decoder.decode).toHaveBeenNthCalledWith(1, {
      frameIndex: 0,
      completeFrames: true,
    });
  });
});

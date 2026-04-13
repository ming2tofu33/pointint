import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildAniPreviewSource,
  decodeAniPreviewFrames,
} from "@/lib/aniPreviewFrames";

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

  it("does not fabricate a preview when ImageDecoder is unavailable", async () => {
    vi.stubGlobal("ImageDecoder", undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(new Blob(["gif"], { type: "image/gif" })))
    );

    await expect(
      buildAniPreviewSource({
        imageUrl: "blob:gif",
        sourceWidth: 160,
        sourceHeight: 120,
        fitMode: "cover",
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        outputSize: 48,
        hotspotX: 16,
        hotspotY: 16,
      })
    ).rejects.toThrow("ANI preview unavailable");
  });
});

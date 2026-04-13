import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildAniPreviewSource } from "@/lib/aniPreviewFrames";

describe("buildAniPreviewSource", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("captures rendered frames with the current ANI framing inputs", async () => {
    const sampleFrame = vi.fn(async (index: number) => {
      return new Blob([`frame-${index}`], { type: "image/png" });
    });
    const originalCreateObjectURL = URL.createObjectURL;
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn((blob: Blob) => `blob:${blob.size}`),
    });
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1000);

    const { source } = await buildAniPreviewSource(
      {
        imageUrl: "blob:gif",
        sourceWidth: 160,
        sourceHeight: 120,
        fitMode: "cover",
        scale: 1.5,
        offsetX: 12,
        offsetY: -8,
        outputSize: 48,
        hotspotX: 128,
        hotspotY: 64,
      },
      {
        frameCount: 3,
        frameDurationMs: 120,
        sampleFrame,
      }
    );

    expect(sampleFrame).toHaveBeenCalledTimes(3);
    expect(sampleFrame.mock.calls[0]?.[0]).toBe(0);
    expect(sampleFrame.mock.calls[0]?.[1]).toMatchObject({
      imageUrl: "blob:gif",
      sourceWidth: 160,
      sourceHeight: 120,
      fitMode: "cover",
      scale: 1.5,
      offsetX: 12,
      offsetY: -8,
      outputSize: 48,
      hotspotX: 128,
      hotspotY: 64,
    });

    expect(URL.createObjectURL).toHaveBeenCalledTimes(3);
    expect(source.kind).toBe("animated");
    expect(source.outputSize).toBe(48);
    expect(source.hotspot).toEqual({ x: 24, y: 12 });
    expect(source.getFrameAtTime(1000)).toMatchObject({
      frame: { src: "blob:7", durationMs: 120 },
      frameIndex: 0,
    });
    expect(source.getFrameAtTime(1119)).toMatchObject({
      frameIndex: 0,
    });
    expect(source.getFrameAtTime(1120)).toMatchObject({
      frameIndex: 1,
    });

    nowSpy.mockRestore();

    if (originalCreateObjectURL) {
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: originalCreateObjectURL,
      });
    }
  });
});

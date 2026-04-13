import { describe, expect, it, vi } from "vitest";

import {
  createAnimatedCursorSource,
  createStaticCursorSource,
} from "@/lib/cursorSources";

describe("cursor sources", () => {
  it("keeps static cursor frames stable over time", () => {
    const source = createStaticCursorSource(
      { src: "blob:static" },
      { x: 8, y: 10 },
      64
    );

    expect(source.kind).toBe("static");
    expect(source.outputSize).toBe(64);
    expect(source.getFrameAtTime(0)).toMatchObject({
      frame: { src: "blob:static" },
      hotspot: { x: 8, y: 10 },
      outputSize: 64,
      frameIndex: 0,
    });
    expect(source.getFrameAtTime(9999)).toMatchObject({
      frame: { src: "blob:static" },
      hotspot: { x: 8, y: 10 },
      outputSize: 64,
      frameIndex: 0,
    });
  });

  it("loops animated cursor frames by elapsed time", () => {
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1000);
    const source = createAnimatedCursorSource(
      [
        { src: "frame-1", durationMs: 100 },
        { src: "frame-2", durationMs: 200 },
        { src: "frame-3", durationMs: 300 },
      ],
      { x: 12, y: 14 },
      48
    );

    expect(source.kind).toBe("animated");
    expect(source.getFrameAtTime(1000)).toMatchObject({
      frame: { src: "frame-1" },
      hotspot: { x: 12, y: 14 },
      outputSize: 48,
      frameIndex: 0,
    });
    expect(source.getFrameAtTime(1099)).toMatchObject({
      frame: { src: "frame-1" },
      frameIndex: 0,
    });
    expect(source.getFrameAtTime(1100)).toMatchObject({
      frame: { src: "frame-2" },
      frameIndex: 1,
    });
    expect(source.getFrameAtTime(1299)).toMatchObject({
      frame: { src: "frame-2" },
      frameIndex: 1,
    });
    expect(source.getFrameAtTime(1300)).toMatchObject({
      frame: { src: "frame-3" },
      frameIndex: 2,
    });
    expect(source.getFrameAtTime(1600)).toMatchObject({
      frame: { src: "frame-1" },
      frameIndex: 0,
    });

    nowSpy.mockRestore();
  });

  it("sanitizes invalid hotspot coordinates", () => {
    const source = createStaticCursorSource(
      { src: "blob:static" },
      { x: Number.NaN, y: Number.POSITIVE_INFINITY },
      32
    );

    expect(source.hotspot).toEqual({ x: 0, y: 0 });
    expect(source.getFrameAtTime(0).hotspot).toEqual({ x: 0, y: 0 });
  });
});

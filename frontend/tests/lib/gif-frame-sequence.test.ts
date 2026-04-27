import { describe, expect, it, vi } from "vitest";

import { extractGifFrameFiles } from "@/lib/gifFrameSequence";

describe("extractGifFrameFiles", () => {
  it("turns decoded GIF frames into ordered PNG files with frame durations", async () => {
    const sourceA = document.createElement("canvas");
    const sourceB = document.createElement("canvas");
    const file = new File(["gif"], "Orbit Demo.gif", { type: "image/gif" });
    const canvasToBlob = vi.fn(async (canvas: HTMLCanvasElement) => {
      return new Blob([canvas === sourceA ? "a" : "b"], { type: "image/png" });
    });

    const result = await extractGifFrameFiles(file, {
      decodeFrames: async () => ({
        width: 24,
        height: 16,
        frames: [
          { source: sourceA, durationMs: 80 },
          { source: sourceB, durationMs: 140 },
        ],
      }),
      canvasToBlob,
    });

    expect(result.width).toBe(24);
    expect(result.height).toBe(16);
    expect(result.frames).toHaveLength(2);
    expect(result.frames.map((frame) => frame.durationMs)).toEqual([80, 140]);
    expect(result.frames.map((frame) => frame.file.name)).toEqual([
      "orbit-demo-frame-001.png",
      "orbit-demo-frame-002.png",
    ]);
    expect(result.frames.every((frame) => frame.file.type === "image/png")).toBe(
      true
    );
    expect(canvasToBlob).toHaveBeenCalledTimes(2);
  });
});

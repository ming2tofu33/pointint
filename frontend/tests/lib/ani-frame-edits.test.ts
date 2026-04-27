import { describe, expect, it, vi } from "vitest";

import {
  ANI_FRAME_DEFAULT_DURATION_MS,
  ANI_FRAME_MAX_DURATION_MS,
  ANI_FRAME_MIN_DURATION_MS,
  clampAniFrameDuration,
  createAniFrameId,
  createAniFramesFromFiles,
  resolveAniFrameEdit,
  type AniFrameEdit,
} from "@/lib/aniFrameEdits";

describe("resolveAniFrameEdit", () => {
  const globalEdit: AniFrameEdit = {
    fitMode: "contain",
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  };

  it("returns global values when the frame has no override", () => {
    expect(resolveAniFrameEdit(globalEdit, {})).toEqual(globalEdit);
  });

  it("uses frame overrides only for provided fields", () => {
    expect(
      resolveAniFrameEdit(globalEdit, {
        editOverride: {
          scale: 1.5,
          offsetY: -12,
        },
      })
    ).toEqual({
      fitMode: "contain",
      scale: 1.5,
      offsetX: 0,
      offsetY: -12,
    });
  });
});

describe("createAniFrameId", () => {
  it("creates stable unique ids from file names and sorted indexes", () => {
    expect(createAniFrameId("Frame 01.PNG", 0)).toBe(
      createAniFrameId("Frame 01.PNG", 0)
    );
    expect(createAniFrameId("Frame 01.PNG", 0)).toBe("ani-frame-1-frame-01");
    expect(createAniFrameId("Frame 01.PNG", 1)).toBe("ani-frame-2-frame-01");
  });
});

describe("createAniFramesFromFiles", () => {
  it("sorts files by filename and uses default frame durations", () => {
    const originalCreateObjectURL = URL.createObjectURL;
    const createObjectURL = vi.fn(
      (file: Blob | MediaSource) => `blob:${(file as File).name}`
    );
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    const files = [
      new File(["b"], "frame-b.png", { type: "image/png" }),
      new File(["a"], "frame-a.png", { type: "image/png" }),
      new File(["duplicate"], "frame-a.png", { type: "image/png" }),
    ];

    try {
      const frames = createAniFramesFromFiles(files);

      expect(frames.map((frame) => frame.file.name)).toEqual([
        "frame-a.png",
        "frame-a.png",
        "frame-b.png",
      ]);
      expect(frames.map((frame) => frame.durationMs)).toEqual([
        ANI_FRAME_DEFAULT_DURATION_MS,
        ANI_FRAME_DEFAULT_DURATION_MS,
        ANI_FRAME_DEFAULT_DURATION_MS,
      ]);
      expect(frames.map((frame) => frame.url)).toEqual([
        "blob:frame-a.png",
        "blob:frame-a.png",
        "blob:frame-b.png",
      ]);
      expect(new Set(frames.map((frame) => frame.id)).size).toBe(frames.length);
      expect(createObjectURL).toHaveBeenCalledTimes(3);
    } finally {
      if (originalCreateObjectURL) {
        Object.defineProperty(URL, "createObjectURL", {
          configurable: true,
          value: originalCreateObjectURL,
        });
      } else {
        delete (URL as unknown as { createObjectURL?: typeof URL.createObjectURL })
          .createObjectURL;
      }
    }
  });
});

describe("clampAniFrameDuration", () => {
  it("clamps duration to the safe ANI frame range", () => {
    expect(clampAniFrameDuration(1)).toBe(ANI_FRAME_MIN_DURATION_MS);
    expect(clampAniFrameDuration(75)).toBe(75);
    expect(clampAniFrameDuration(2500)).toBe(ANI_FRAME_MAX_DURATION_MS);
  });

  it("uses the default duration for unsafe values", () => {
    expect(clampAniFrameDuration(Number.NaN)).toBe(
      ANI_FRAME_DEFAULT_DURATION_MS
    );
    expect(clampAniFrameDuration(Number.POSITIVE_INFINITY)).toBe(
      ANI_FRAME_DEFAULT_DURATION_MS
    );
  });
});

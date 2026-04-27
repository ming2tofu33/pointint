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
    rotation: 0,
    flipX: false,
    flipY: false,
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
      rotation: 0,
      flipX: false,
      flipY: false,
    });
  });

  it("ignores undefined overrides while preserving zero values", () => {
    expect(
      resolveAniFrameEdit(
        {
          fitMode: "cover",
          scale: 2,
          offsetX: 12,
          offsetY: -8,
          rotation: 90,
          flipX: true,
          flipY: false,
        },
        {
          editOverride: {
            fitMode: undefined,
            scale: undefined,
            offsetX: 0,
            offsetY: undefined,
            rotation: undefined,
            flipX: false,
          },
        }
      )
    ).toEqual({
      fitMode: "cover",
      scale: 2,
      offsetX: 0,
      offsetY: -8,
      rotation: 90,
      flipX: false,
      flipY: false,
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

  it("uses locale-stable filename ordering with original-index tie breaks", () => {
    const originalCreateObjectURL = URL.createObjectURL;
    const createObjectURL = vi.fn(
      (file: Blob | MediaSource) => `blob:${(file as File).name}`
    );
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    const files = [
      new File(["upper"], "FRAME-2.png", { type: "image/png" }),
      new File(["ten"], "frame-10.png", { type: "image/png" }),
      new File(["one"], "frame-01.png", { type: "image/png" }),
      new File(["mixed"], "Frame-2.png", { type: "image/png" }),
    ];

    try {
      const frames = createAniFramesFromFiles(files);

      expect(frames.map((frame) => frame.file.name)).toEqual([
        "frame-01.png",
        "frame-10.png",
        "FRAME-2.png",
        "Frame-2.png",
      ]);
      expect(frames.map((frame) => frame.id)).toEqual([
        "ani-frame-1-frame-01",
        "ani-frame-2-frame-10",
        "ani-frame-3-frame-2",
        "ani-frame-4-frame-2",
      ]);
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

import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_VIDEO_TO_ANI_DURATION_MS,
  DEFAULT_VIDEO_TO_ANI_FPS,
  DEFAULT_VIDEO_TO_ANI_MAX_FRAMES,
  extractVideoFrameFiles,
} from "@/lib/videoFrameSequence";

describe("extractVideoFrameFiles", () => {
  it("extracts capped PNG frames with stable durations using mocked deps", async () => {
    const file = new File(["video"], "cat.webm", { type: "video/webm" });
    const metadata = { width: 640, height: 360, durationMs: 5000 };
    const captureFrame = vi.fn(async () => document.createElement("canvas"));
    const canvasToBlob = vi.fn(async () => {
      return new Blob(["frame"], { type: "image/png" });
    });

    const result = await extractVideoFrameFiles(
      file,
      {
        durationMs: DEFAULT_VIDEO_TO_ANI_DURATION_MS,
        fps: DEFAULT_VIDEO_TO_ANI_FPS,
        maxFrames: DEFAULT_VIDEO_TO_ANI_MAX_FRAMES,
      },
      {
        loadMetadata: async () => metadata,
        captureFrame,
        canvasToBlob,
      }
    );

    expect(result.width).toBe(640);
    expect(result.height).toBe(360);
    expect(result.frames).toHaveLength(30);
    expect(result.frames.every((frame) => frame.durationMs === 100)).toBe(true);
    expect(result.frames[0]?.file.name).toBe("cat-frame-001.png");
    expect(result.frames.every((frame) => frame.file.type === "image/png")).toBe(
      true
    );
    expect(captureFrame).toHaveBeenCalledTimes(30);
    expect(captureFrame.mock.calls[0]?.[1]).toBe(0);
    expect(captureFrame.mock.calls[29]?.[1]).toBe(2900);
    expect(canvasToBlob).toHaveBeenCalledTimes(30);
  });

  it("uses the video duration when the clip is shorter than the default segment", async () => {
    const file = new File(["video"], "short.mp4", { type: "video/mp4" });
    const captureFrame = vi.fn(async () => document.createElement("canvas"));

    const result = await extractVideoFrameFiles(file, undefined, {
      loadMetadata: async () => ({ width: 320, height: 180, durationMs: 240 }),
      captureFrame,
      canvasToBlob: async () => new Blob(["frame"], { type: "image/png" }),
    });

    expect(result.frames).toHaveLength(2);
    expect(result.frames.map((frame) => frame.durationMs)).toEqual([100, 100]);
    expect(captureFrame.mock.calls.map((call) => call[1])).toEqual([0, 100]);
  });

  it("captures the first browser frame without waiting for a zero-time seek", async () => {
    vi.useFakeTimers();

    const file = new File(["video"], "first-frame.webm", {
      type: "video/webm",
    });
    const drawImage = vi.fn();
    const createObjectURL = vi.fn(() => "blob:video");
    const revokeObjectURL = vi.fn();
    const originalCreateObjectURL = Object.getOwnPropertyDescriptor(
      URL,
      "createObjectURL"
    );
    const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(
      URL,
      "revokeObjectURL"
    );
    const originalCreateElement = document.createElement.bind(document);
    const createElement = vi
      .spyOn(document, "createElement")
      .mockImplementation((tagName, options) => {
        if (tagName.toLowerCase() !== "video") {
          return originalCreateElement(tagName, options);
        }

        const video = originalCreateElement("video");
        let currentTime = 0;
        let readyState = 0;

        Object.defineProperty(video, "currentTime", {
          configurable: true,
          get: () => currentTime,
          set: (value) => {
            currentTime = value;

            if (value !== 0) {
              window.setTimeout(() => {
                readyState = 2;
                video.dispatchEvent(new Event("seeked"));
              }, 0);
            }
          },
        });
        Object.defineProperty(video, "readyState", {
          configurable: true,
          get: () => readyState,
        });
        Object.defineProperty(video, "load", {
          configurable: true,
          value: () => {
            window.setTimeout(() => {
              video.dispatchEvent(new Event("loadedmetadata"));
              readyState = 2;
              video.dispatchEvent(new Event("loadeddata"));
            }, 0);
          },
        });

        return video;
      });
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue({
        drawImage,
      } as unknown as CanvasRenderingContext2D);

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    try {
      const extraction = Promise.race([
        extractVideoFrameFiles(
          file,
          { durationMs: 200 },
          {
            loadMetadata: async () => ({
              width: 640,
              height: 360,
              durationMs: 5000,
            }),
            canvasToBlob: async () =>
              new Blob(["frame"], { type: "image/png" }),
          }
        ).then((result) => result.frames.length),
        new Promise<"timed-out">((resolve) => {
          window.setTimeout(() => resolve("timed-out"), 10);
        }),
      ]);

      await vi.advanceTimersByTimeAsync(10);

      await expect(extraction).resolves.toBe(2);
      expect(drawImage).toHaveBeenCalledTimes(2);
      expect(revokeObjectURL).toHaveBeenCalledTimes(2);
    } finally {
      createElement.mockRestore();
      getContext.mockRestore();
      vi.useRealTimers();

      if (originalCreateObjectURL) {
        Object.defineProperty(URL, "createObjectURL", originalCreateObjectURL);
      } else {
        Reflect.deleteProperty(URL, "createObjectURL");
      }

      if (originalRevokeObjectURL) {
        Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectURL);
      } else {
        Reflect.deleteProperty(URL, "revokeObjectURL");
      }
    }
  });

  it("throws for invalid numeric options and metadata duration", async () => {
    const file = new File(["video"], "invalid-numbers.webm", {
      type: "video/webm",
    });
    const validMetadata = { width: 640, height: 360, durationMs: 5000 };

    await expect(
      extractVideoFrameFiles(
        file,
        { durationMs: Number.NaN },
        {
          loadMetadata: async () => validMetadata,
        }
      )
    ).rejects.toThrow(/duration/i);

    await expect(
      extractVideoFrameFiles(
        file,
        { fps: Number.NaN },
        {
          loadMetadata: async () => validMetadata,
        }
      )
    ).rejects.toThrow(/fps/i);

    await expect(
      extractVideoFrameFiles(
        file,
        { maxFrames: Number.NaN },
        {
          loadMetadata: async () => validMetadata,
        }
      )
    ).rejects.toThrow(/max frames/i);

    await expect(
      extractVideoFrameFiles(file, undefined, {
        loadMetadata: async () => ({
          width: 640,
          height: 360,
          durationMs: Number.NaN,
        }),
      })
    ).rejects.toThrow(/duration/i);
  });

  it("clamps negative start times before capturing frames", async () => {
    const file = new File(["video"], "negative-start.webm", {
      type: "video/webm",
    });
    const captureFrame = vi.fn(async () => document.createElement("canvas"));

    await extractVideoFrameFiles(
      file,
      { startMs: -500, durationMs: 200 },
      {
        loadMetadata: async () => ({ width: 640, height: 360, durationMs: 5000 }),
        captureFrame,
        canvasToBlob: async () => new Blob(["frame"], { type: "image/png" }),
      }
    );

    expect(captureFrame.mock.calls.map((call) => call[1])).toEqual([0, 100]);
  });

  it("rejects and cleans up when setting currentTime throws", async () => {
    vi.useFakeTimers();

    const file = new File(["video"], "seek-error.webm", {
      type: "video/webm",
    });
    const revokeObjectURL = vi.fn();
    const restoreBrowserMocks = installDefaultCaptureMocks({
      currentTimeSetter: () => {
        throw new Error("seek failed");
      },
      revokeObjectURL,
    });

    try {
      const extraction = extractVideoFrameFiles(
        file,
        { startMs: 100, durationMs: 200 },
        {
          loadMetadata: async () => ({
            width: 640,
            height: 360,
            durationMs: 5000,
          }),
          canvasToBlob: async () => new Blob(["frame"], { type: "image/png" }),
        }
      );
      const rejection = expect(extraction).rejects.toThrow("seek failed");

      await vi.advanceTimersByTimeAsync(0);

      await rejection;
      expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    } finally {
      restoreBrowserMocks();
      vi.useRealTimers();
    }
  });

  it("rejects and cleans up when drawing the current frame throws", async () => {
    vi.useFakeTimers();

    const file = new File(["video"], "draw-error.webm", {
      type: "video/webm",
    });
    const revokeObjectURL = vi.fn();
    const restoreBrowserMocks = installDefaultCaptureMocks({
      drawImage: () => {
        throw new Error("draw failed");
      },
      revokeObjectURL,
    });

    try {
      const extraction = extractVideoFrameFiles(
        file,
        { durationMs: 200 },
        {
          loadMetadata: async () => ({
            width: 640,
            height: 360,
            durationMs: 5000,
          }),
          canvasToBlob: async () => new Blob(["frame"], { type: "image/png" }),
        }
      );
      const rejection = expect(extraction).rejects.toThrow("draw failed");

      await vi.advanceTimersByTimeAsync(0);

      await rejection;
      expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    } finally {
      restoreBrowserMocks();
      vi.useRealTimers();
    }
  });

  it("throws when metadata has no drawable size", async () => {
    const file = new File(["video"], "empty.webm", { type: "video/webm" });

    await expect(
      extractVideoFrameFiles(file, undefined, {
        loadMetadata: async () => ({ width: 0, height: 360, durationMs: 5000 }),
      })
    ).rejects.toThrow(/drawable size/i);
  });

  it("throws when fewer than two frames can be extracted", async () => {
    const file = new File(["video"], "single-frame.mp4", { type: "video/mp4" });

    await expect(
      extractVideoFrameFiles(file, { durationMs: 199, fps: 10 }, {
        loadMetadata: async () => ({ width: 640, height: 360, durationMs: 199 }),
      })
    ).rejects.toThrow(/at least two frames/i);
  });

  it("sanitizes frame file names", async () => {
    const file = new File(["video"], "  Cat & Dog: 01!.webm", {
      type: "video/webm",
    });

    const result = await extractVideoFrameFiles(
      file,
      { durationMs: 200 },
      {
        loadMetadata: async () => ({
          width: 640,
          height: 360,
          durationMs: 5000,
        }),
        captureFrame: async () => document.createElement("canvas"),
        canvasToBlob: async () => new Blob(["frame"], { type: "image/png" }),
      }
    );

    expect(result.frames.map((frame) => frame.file.name)).toEqual([
      "cat-dog-01-frame-001.png",
      "cat-dog-01-frame-002.png",
    ]);
  });
});

function installDefaultCaptureMocks({
  currentTimeSetter,
  drawImage = vi.fn(),
  revokeObjectURL = vi.fn(),
}: {
  currentTimeSetter?: (value: number) => void;
  drawImage?: CanvasRenderingContext2D["drawImage"];
  revokeObjectURL?: (objectUrl: string) => void;
}) {
  const createObjectURL = vi.fn(() => "blob:video");
  const originalCreateObjectURL = Object.getOwnPropertyDescriptor(
    URL,
    "createObjectURL"
  );
  const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(
    URL,
    "revokeObjectURL"
  );
  const originalCreateElement = document.createElement.bind(document);
  const createElement = vi
    .spyOn(document, "createElement")
    .mockImplementation((tagName, options) => {
      if (tagName.toLowerCase() !== "video") {
        return originalCreateElement(tagName, options);
      }

      const video = originalCreateElement("video");
      let currentTime = 0;
      let readyState = 0;

      Object.defineProperty(video, "currentTime", {
        configurable: true,
        get: () => currentTime,
        set: (value) => {
          currentTime = value;
          currentTimeSetter?.(value);

          if (value !== 0) {
            window.setTimeout(() => {
              readyState = 2;
              video.dispatchEvent(new Event("seeked"));
            }, 0);
          }
        },
      });
      Object.defineProperty(video, "readyState", {
        configurable: true,
        get: () => readyState,
      });
      Object.defineProperty(video, "load", {
        configurable: true,
        value: () => {
          window.setTimeout(() => {
            video.dispatchEvent(new Event("loadedmetadata"));
            readyState = 2;
            video.dispatchEvent(new Event("loadeddata"));
          }, 0);
        },
      });

      return video;
    });
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);

  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createObjectURL,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revokeObjectURL,
  });

  return () => {
    createElement.mockRestore();
    getContext.mockRestore();

    if (originalCreateObjectURL) {
      Object.defineProperty(URL, "createObjectURL", originalCreateObjectURL);
    } else {
      Reflect.deleteProperty(URL, "createObjectURL");
    }

    if (originalRevokeObjectURL) {
      Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectURL);
    } else {
      Reflect.deleteProperty(URL, "revokeObjectURL");
    }
  };
}

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  removeBackgroundMock,
  generateCursorMock,
  rasterizeSquarePngMock,
  suggestViewportHotspotMock,
  trackEventMock,
} = vi.hoisted(() => ({
  removeBackgroundMock: vi.fn(),
  generateCursorMock: vi.fn(),
  rasterizeSquarePngMock: vi.fn(),
  suggestViewportHotspotMock: vi.fn(),
  trackEventMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  removeBackground: removeBackgroundMock,
  generateCursor: generateCursorMock,
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

vi.mock("@/lib/cursorFrame", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cursorFrame")>(
    "@/lib/cursorFrame"
  );

  return {
    ...actual,
    rasterizeSquarePng: rasterizeSquarePngMock,
    suggestViewportHotspot: suggestViewportHotspotMock,
  };
});

import { useStudio } from "@/lib/useStudio";

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
const originalImage = global.Image;
const originalFetch = global.fetch;

describe("studio analytics events", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    trackEventMock.mockReset();

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:cursor"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });

    global.Image = class FakeImage {
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;
      naturalWidth = 96;
      naturalHeight = 96;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    } as unknown as typeof Image;

    global.fetch = vi.fn(async () => ({
      blob: async () => new Blob(["original"], { type: "image/png" }),
    })) as typeof fetch;

    removeBackgroundMock.mockReset();
    generateCursorMock.mockReset();
    rasterizeSquarePngMock.mockReset();
    suggestViewportHotspotMock.mockReset();

    rasterizeSquarePngMock.mockResolvedValue({
      blob: new Blob(["preview"], { type: "image/png" }),
      hotspotX: 0,
      hotspotY: 0,
      frameRect: {
        drawWidth: 256,
        drawHeight: 256,
        drawX: 0,
        drawY: 0,
      },
    });

    suggestViewportHotspotMock.mockResolvedValue({ x: 24, y: 18 });
    generateCursorMock.mockResolvedValue(
      new Blob(["zip"], { type: "application/zip" })
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();

    if (originalCreateObjectURL) {
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: originalCreateObjectURL,
      });
    }
    if (originalRevokeObjectURL) {
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        value: originalRevokeObjectURL,
      });
    }

    global.Image = originalImage;
    global.fetch = originalFetch;
  });

  it("tracks workflow selection from the hook", () => {
    const { result } = renderHook(() => useStudio());

    act(() => {
      result.current.selectWorkflow("cur-static-image");
    });

    expect(trackEventMock).toHaveBeenCalledWith("workflow_selected", {
      workflow_id: "cur-static-image",
    });
  });

  it("tracks download completion after a successful cursor export", async () => {
    const { result } = renderHook(() => useStudio());
    const file = new File(["cursor"], "cursor.png", { type: "image/png" });
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    act(() => {
      result.current.selectFile(file);
    });

    await act(async () => {
      await result.current.skipBgRemoval();
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.download();
    });

    expect(trackEventMock).toHaveBeenCalledWith("download_completed", {
      cursor_size: 32,
      fit_mode: "contain",
      source: "studio",
    });
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });
});

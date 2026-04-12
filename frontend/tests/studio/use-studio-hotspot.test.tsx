import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  removeBackgroundMock,
  generateCursorMock,
  rasterizeSquarePngMock,
  suggestViewportHotspotMock,
} = vi.hoisted(() => ({
  removeBackgroundMock: vi.fn(),
  generateCursorMock: vi.fn(),
  rasterizeSquarePngMock: vi.fn(),
  suggestViewportHotspotMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  removeBackground: removeBackgroundMock,
  generateCursor: generateCursorMock,
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

describe("useStudio hotspot recommendation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
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

  it("auto-applies a recommended hotspot when editing becomes ready", async () => {
    suggestViewportHotspotMock.mockResolvedValue({ x: 24, y: 18 });

    const { result } = renderHook(() => useStudio());
    const file = new File(["cursor"], "cursor.png", { type: "image/png" });

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

    expect(result.current.cursor?.hotspotX).toBe(24);
    expect(result.current.cursor?.hotspotY).toBe(18);
    expect(result.current.cursor?.hotspotMode).toBe("auto");
  });

  it("does not overwrite a manual hotspot after later automatic recomputation", async () => {
    suggestViewportHotspotMock
      .mockResolvedValueOnce({ x: 24, y: 18 })
      .mockResolvedValueOnce({ x: 12, y: 10 });

    const { result } = renderHook(() => useStudio());
    const file = new File(["cursor"], "cursor.png", { type: "image/png" });

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

    act(() => {
      result.current.setHotspot(40, 32);
    });

    act(() => {
      result.current.setScale(1.4);
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.cursor?.hotspotX).toBe(40);
    expect(result.current.cursor?.hotspotY).toBe(32);
    expect(result.current.cursor?.hotspotMode).toBe("manual");
  });

  it("allows explicit re-recommendation after manual adjustment", async () => {
    suggestViewportHotspotMock
      .mockResolvedValueOnce({ x: 24, y: 18 })
      .mockResolvedValueOnce({ x: 12, y: 10 });

    const { result } = renderHook(() => useStudio());
    const file = new File(["cursor"], "cursor.png", { type: "image/png" });

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

    act(() => {
      result.current.setHotspot(40, 32);
    });

    await act(async () => {
      await result.current.recommendHotspot();
    });

    expect(result.current.cursor?.hotspotX).toBe(12);
    expect(result.current.cursor?.hotspotY).toBe(10);
    expect(result.current.cursor?.hotspotMode).toBe("auto");
  });
});

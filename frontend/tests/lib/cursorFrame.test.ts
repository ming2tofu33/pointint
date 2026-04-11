import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getFrameRect,
  mapViewportHotspotToOutput,
  rasterizeSquarePng,
} from "@/lib/cursorFrame";

describe("getFrameRect", () => {
  it("fits a wide image inside the viewport in contain mode", () => {
    expect(
      getFrameRect({
        sourceWidth: 400,
        sourceHeight: 200,
        viewportSize: 256,
        fitMode: "contain",
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      })
    ).toEqual({
      drawWidth: 256,
      drawHeight: 128,
      drawX: 0,
      drawY: 64,
    });
  });

  it("fills the viewport in cover mode and allows cropping", () => {
    expect(
      getFrameRect({
        sourceWidth: 400,
        sourceHeight: 200,
        viewportSize: 256,
        fitMode: "cover",
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      })
    ).toEqual({
      drawWidth: 512,
      drawHeight: 256,
      drawX: -128,
      drawY: 0,
    });
  });

  it("applies scale and offsets after the base fit", () => {
    expect(
      getFrameRect({
        sourceWidth: 100,
        sourceHeight: 100,
        viewportSize: 256,
        fitMode: "contain",
        scale: 1.5,
        offsetX: 10,
        offsetY: -5,
      })
    ).toEqual({
      drawWidth: 384,
      drawHeight: 384,
      drawX: -54,
      drawY: -69,
    });
  });
});

describe("mapViewportHotspotToOutput", () => {
  it("maps viewport coordinates into output space", () => {
    expect(
      mapViewportHotspotToOutput({
        hotspotX: 128,
        hotspotY: 128,
        viewportSize: 256,
        outputSize: 32,
      })
    ).toEqual({ x: 16, y: 16 });
  });

  it("clamps mapped hotspot coordinates to output bounds", () => {
    expect(
      mapViewportHotspotToOutput({
        hotspotX: 999,
        hotspotY: -10,
        viewportSize: 256,
        outputSize: 32,
      })
    ).toEqual({ x: 31, y: 0 });
  });
});

describe("rasterizeSquarePng", () => {
  const drawImage = vi.fn();
  const clearRect = vi.fn();
  const toBlob = vi.fn();
  const createElement = document.createElement.bind(document);

  beforeEach(() => {
    drawImage.mockReset();
    clearRect.mockReset();
    toBlob.mockReset();

    vi.stubGlobal(
      "Image",
      class FakeImage {
        onload: null | (() => void) = null;
        onerror: null | (() => void) = null;
        naturalWidth = 400;
        naturalHeight = 200;

        set src(_value: string) {
          queueMicrotask(() => {
            this.onload?.();
          });
        }
      }
    );

    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName !== "canvas") {
        return createElement(tagName);
      }

      return {
        width: 0,
        height: 0,
        getContext: () => ({
          clearRect,
          drawImage,
        }),
        toBlob: (callback: BlobCallback) => {
          const blob = new Blob(["preview"], { type: "image/png" });
          toBlob(blob);
          callback(blob);
        },
      } as unknown as HTMLCanvasElement;
    });
  });

  it("rasterizes the square export using scaled editor offsets", async () => {
    const result = await rasterizeSquarePng({
      imageUrl: "blob:test",
      sourceWidth: 400,
      sourceHeight: 200,
      fitMode: "cover",
      scale: 1,
      offsetX: 20,
      offsetY: -8,
      outputSize: 64,
      hotspotX: 128,
      hotspotY: 128,
      editorViewportSize: 256,
    });

    expect(clearRect).toHaveBeenCalledWith(0, 0, 64, 64);
    expect(drawImage).toHaveBeenCalledWith(
      expect.anything(),
      -27,
      -2,
      128,
      64
    );
    expect(result.hotspotX).toBe(32);
    expect(result.hotspotY).toBe(32);
    expect(result.blob.type).toBe("image/png");
  });
});

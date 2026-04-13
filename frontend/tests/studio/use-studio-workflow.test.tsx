import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { generateAniMock, ensureAniZipPackageMock } = vi.hoisted(() => ({
  generateAniMock: vi.fn(),
  ensureAniZipPackageMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  generateAni: generateAniMock,
  generateCursor: vi.fn(),
  removeBackground: vi.fn(),
}));

vi.mock("@/lib/aniDownload", () => ({
  ensureAniZipPackage: ensureAniZipPackageMock,
}));

import { useStudio } from "@/lib/useStudio";

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
const originalImage = global.Image;
const originalCreateElement = document.createElement.bind(document);

describe("useStudio workflow entry", () => {
  beforeEach(() => {
    generateAniMock.mockReset();
    ensureAniZipPackageMock.mockReset();
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
      naturalWidth = 128;
      naturalHeight = 96;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    } as unknown as typeof Image;
  });

  afterEach(() => {
    if (originalCreateObjectURL) {
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: originalCreateObjectURL,
      });
    } else {
      delete (URL as typeof URL & { createObjectURL?: unknown }).createObjectURL;
    }

    if (originalRevokeObjectURL) {
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        value: originalRevokeObjectURL,
      });
    } else {
      delete (URL as typeof URL & { revokeObjectURL?: unknown }).revokeObjectURL;
    }

    global.Image = originalImage;
    vi.restoreAllMocks();
  });

  it("starts in the slot editor entry and resets back to it", () => {
    const { result } = renderHook(() => useStudio());

    expect(result.current.state).toBe("editing");

    const file = new File(["cursor"], "cursor.png", { type: "image/png" });

    act(() => {
      result.current.selectFile(file);
    });

    expect(result.current.state).toBe("uploaded");

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe("editing");
  });

  it("loads GIF uploads into the ANI editor shell", async () => {
    const { result } = renderHook(() => useStudio());
    const file = new File(["gif"], "orbit.gif", { type: "image/gif" });

    await act(async () => {
      await result.current.selectAniFile(file);
      await Promise.resolve();
    });

    expect(result.current.state).toBe("ani-editing");
    expect(result.current.ani?.cursorName).toBe("orbit");
    expect(result.current.ani?.sourceWidth).toBe(128);
    expect(result.current.ani?.sourceHeight).toBe(96);
    expect(result.current.ani?.cursorSize).toBe(32);
  });

  it("returns to the generic slot entry when an empty slot is selected", () => {
    const { result } = renderHook(() => useStudio());

    act(() => {
      result.current.selectSlot("text");
    });

    expect(result.current.state).toBe("editing");
    expect(result.current.selectedSlotId).toBe("text");
    expect(result.current.cursor).toBeNull();
    expect(result.current.ani).toBeNull();
  });

  it("updates ANI output size independently from CUR size", async () => {
    const { result } = renderHook(() => useStudio());
    const file = new File(["gif"], "orbit.gif", { type: "image/gif" });

    await act(async () => {
      await result.current.selectAniFile(file);
      await Promise.resolve();
    });

    act(() => {
      result.current.setAniCursorSize(48);
    });

    expect(result.current.ani?.cursorSize).toBe(48);
  });

  it("sanitizes the ANI zip download filename before exporting", async () => {
    const zipBlob = new Blob(["zip"], { type: "application/zip" });
    generateAniMock.mockResolvedValue({
      blob: zipBlob,
      filename: "orbit:demo.zip",
      contentType: "application/zip",
    });
    ensureAniZipPackageMock.mockResolvedValue(zipBlob);

    const createdAnchors: HTMLAnchorElement[] = [];
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tagName: string, options?: ElementCreationOptions) => {
        const element = originalCreateElement(tagName, options);
        if (tagName.toLowerCase() === "a") {
          createdAnchors.push(element as HTMLAnchorElement);
        }
        return element;
      });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    const { result } = renderHook(() => useStudio());
    const file = new File(["gif"], "orbit:demo.gif", { type: "image/gif" });

    await act(async () => {
      await result.current.selectAniFile(file);
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.download();
    });

    expect(createdAnchors[0]?.download).toBe("pointint-orbitdemo.zip");

    clickSpy.mockRestore();
    createElementSpy.mockRestore();
  });
});

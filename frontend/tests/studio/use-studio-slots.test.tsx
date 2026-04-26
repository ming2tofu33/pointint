import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  generateAniMock,
  generateCursorMock,
  rasterizeSquarePngMock,
  removeBackgroundMock,
} = vi.hoisted(() => ({
  generateAniMock: vi.fn(),
  generateCursorMock: vi.fn(),
  rasterizeSquarePngMock: vi.fn(),
  removeBackgroundMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  generateAni: generateAniMock,
  generateCursor: generateCursorMock,
  removeBackground: removeBackgroundMock,
}));

vi.mock("@/lib/cursorFrame", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cursorFrame")>(
    "@/lib/cursorFrame"
  );

  return {
    ...actual,
    rasterizeSquarePng: rasterizeSquarePngMock,
  };
});

import { useStudio } from "@/lib/useStudio";
import * as studioDownload from "@/lib/studioDownload";

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
const originalImage = global.Image;
const originalFetch = global.fetch;
const windowsRoleIds = [
  "normalSelect",
  "textSelect",
  "linkSelect",
  "busy",
  "workingInBackground",
  "unavailable",
  "move",
  "horizontalResize",
  "verticalResize",
  "diagonalResize1",
  "diagonalResize2",
] as const;

describe("useStudio slot contract", () => {
  beforeEach(() => {
    generateAniMock.mockReset();
    generateCursorMock.mockReset();
    generateCursorMock.mockResolvedValue(
      new Blob(["cursor"], { type: "application/octet-stream" })
    );
    generateAniMock.mockResolvedValue({
      blob: new Blob(["ani"], { type: "application/octet-stream" }),
      filename: "pointint-orbit.ani",
      contentType: "application/octet-stream",
    });
    removeBackgroundMock.mockReset();
    removeBackgroundMock.mockResolvedValue(
      new Blob(["processed"], { type: "image/png" })
    );
    rasterizeSquarePngMock.mockReset();
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
    let objectUrlCount = 0;
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => `blob:slot-object-${++objectUrlCount}`),
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

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        if (typeof input === "string" && input.startsWith("blob:")) {
          return {
            ok: true,
            blob: async () => new Blob(["cursor"], { type: "image/png" }),
          } as Response;
        }

        throw new Error(`Unexpected fetch: ${String(input)}`);
      })
    );
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
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("exposes an 11-role Windows cursor theme project with normalSelect selected by default", () => {
    const { result } = renderHook(() => useStudio());

    expect(Object.keys(result.current.project.slots).sort()).toEqual(
      [...windowsRoleIds].sort()
    );
    expect(result.current.selectedSlotId).toBe("normalSelect");
    expect(result.current.editingSlotId).toBe("normalSelect");
    expect(result.current.project.slots.normalSelect.kind).toBeNull();
    expect(result.current.project.slots.normalSelect.editing.cursorName).toBe("arrow");
    expect(result.current.project.slots.textSelect.editing.cursorName).toBe("ibeam");
  });

  it("packages only configured Windows roles into a flattened full-set zip", async () => {
    const buildWindowsRoleMasterZipSpy = vi
      .spyOn(studioDownload, "buildWindowsRoleMasterZip")
      .mockResolvedValue(new Blob(["zip"], { type: "application/zip" }));
    const createdAnchors: HTMLAnchorElement[] = [];
    const originalCreateElement = document.createElement.bind(document);
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
    const staticFile = new File(["static"], "cursor.png", {
      type: "image/png",
    });
    const animatedFile = new File(["animated"], "orbit.gif", {
      type: "image/gif",
    });

    await act(async () => {
      await result.current.selectFile(staticFile);
    });

    await act(async () => {
      await result.current.skipBgRemoval();
    });

    act(() => {
      result.current.selectSlot("linkSelect");
    });

    await act(async () => {
      await result.current.selectSelectedSlotAnimatedFile(animatedFile);
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.downloadAll();
    });

    expect(buildWindowsRoleMasterZipSpy).toHaveBeenCalledTimes(1);
    expect(buildWindowsRoleMasterZipSpy.mock.calls[0][0]).toEqual([
      {
        name: studioDownload.buildWindowsRolePackagePath("normalSelect", "cur"),
        blob: expect.any(Blob),
      },
      {
        name: studioDownload.buildWindowsRolePackagePath("linkSelect", "ani"),
        blob: expect.any(Blob),
      },
      {
        name: "install.inf",
        blob: expect.any(Blob),
      },
      {
        name: "restore-default.inf",
        blob: expect.any(Blob),
      },
    ]);
    expect(createdAnchors[0]?.download).toBe("pointint-windows-roles.zip");

    clickSpy.mockRestore();
    createElementSpy.mockRestore();
    buildWindowsRoleMasterZipSpy.mockRestore();
  });

  it("blocks full-set export while any static slot still needs a background decision", async () => {
    const buildWindowsRoleMasterZipSpy = vi.spyOn(
      studioDownload,
      "buildWindowsRoleMasterZip"
    );
    const { result } = renderHook(() => useStudio());
    const staticFile = new File(["static"], "cursor.png", {
      type: "image/png",
    });

    await act(async () => {
      await result.current.selectFile(staticFile);
    });

    expect(result.current.state).toBe("uploaded");
    expect(result.current.canDownloadAll).toBe(false);
    expect(result.current.pendingBackgroundRemovalSlotIds).toEqual([
      "normalSelect",
    ]);

    await act(async () => {
      await result.current.downloadAll();
    });

    expect(buildWindowsRoleMasterZipSpy).not.toHaveBeenCalled();

    buildWindowsRoleMasterZipSpy.mockRestore();
  });

  it("keeps full-set export blocked until every pending static slot is resolved", async () => {
    const buildWindowsRoleMasterZipSpy = vi
      .spyOn(studioDownload, "buildWindowsRoleMasterZip")
      .mockResolvedValue(new Blob(["zip"], { type: "application/zip" }));
    const createdAnchors: HTMLAnchorElement[] = [];
    const originalCreateElement = document.createElement.bind(document);
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
    const normalFile = new File(["normal"], "normal.png", {
      type: "image/png",
    });
    const textFile = new File(["text"], "text.png", {
      type: "image/png",
    });

    await act(async () => {
      await result.current.selectFile(normalFile);
    });

    act(() => {
      result.current.selectSlot("textSelect");
    });

    await act(async () => {
      await result.current.selectSelectedSlotStaticFile(textFile);
      await Promise.resolve();
    });

    expect(result.current.pendingBackgroundRemovalSlotIds.sort()).toEqual([
      "normalSelect",
      "textSelect",
    ]);
    expect(result.current.canDownloadAll).toBe(false);

    await act(async () => {
      await result.current.downloadAll();
    });

    expect(buildWindowsRoleMasterZipSpy).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.skipBgRemoval();
    });

    expect(result.current.pendingBackgroundRemovalSlotIds).toEqual([
      "normalSelect",
    ]);
    expect(result.current.canDownloadAll).toBe(false);

    act(() => {
      result.current.selectSlot("normalSelect");
    });

    expect(result.current.state).toBe("uploaded");

    await act(async () => {
      await result.current.skipBgRemoval();
    });

    expect(result.current.pendingBackgroundRemovalSlotIds).toEqual([]);
    expect(result.current.canDownloadAll).toBe(true);

    await act(async () => {
      await result.current.downloadAll();
    });

    expect(buildWindowsRoleMasterZipSpy).toHaveBeenCalledTimes(1);
    expect(buildWindowsRoleMasterZipSpy.mock.calls[0][0]).toEqual([
      {
        name: studioDownload.buildWindowsRolePackagePath("normalSelect", "cur"),
        blob: expect.any(Blob),
      },
      {
        name: studioDownload.buildWindowsRolePackagePath("textSelect", "cur"),
        blob: expect.any(Blob),
      },
      {
        name: "install.inf",
        blob: expect.any(Blob),
      },
      {
        name: "restore-default.inf",
        blob: expect.any(Blob),
      },
    ]);
    expect(createdAnchors[0]?.download).toBe("pointint-windows-roles.zip");

    clickSpy.mockRestore();
    createElementSpy.mockRestore();
    buildWindowsRoleMasterZipSpy.mockRestore();
  });

  it("downloads the current static slot as a raw CUR file", async () => {
    const createdAnchors: HTMLAnchorElement[] = [];
    const originalCreateElement = document.createElement.bind(document);
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
    const staticFile = new File(["static"], "cursor.png", {
      type: "image/png",
    });

    await act(async () => {
      await result.current.selectFile(staticFile);
    });

    await act(async () => {
      await result.current.skipBgRemoval();
    });

    await act(async () => {
      await result.current.download();
    });

    expect(createdAnchors[0]?.download).toBe(
      studioDownload.buildWindowsRoleDownloadFilename("normalSelect", "cur")
    );

    clickSpy.mockRestore();
    createElementSpy.mockRestore();
  });

  it("returns resolved non-primary static slots to the editor after switching back", async () => {
    const { result } = renderHook(() => useStudio());
    const staticFile = new File(["static"], "text-select.png", {
      type: "image/png",
    });

    act(() => {
      result.current.selectSlot("textSelect");
    });

    await act(async () => {
      await result.current.selectSelectedSlotStaticFile(staticFile);
      await Promise.resolve();
    });

    expect(result.current.state).toBe("uploaded");

    await act(async () => {
      await result.current.skipBgRemoval();
    });

    expect(result.current.state).toBe("editing");

    act(() => {
      result.current.selectSlot("linkSelect");
    });

    expect(result.current.state).toBe("editing");
    expect(result.current.cursor).toBeNull();

    act(() => {
      result.current.selectSlot("textSelect");
    });

    expect(result.current.state).toBe("editing");
    expect(result.current.cursor?.cursorName).toBe("ibeam");
  });

  it("downloads the current animated slot as a raw ANI file", async () => {
    const createdAnchors: HTMLAnchorElement[] = [];
    const originalCreateElement = document.createElement.bind(document);
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
    const animatedFile = new File(["animated"], "orbit.gif", {
      type: "image/gif",
    });

    act(() => {
      result.current.selectSlot("linkSelect");
    });

    await act(async () => {
      await result.current.selectSelectedSlotAnimatedFile(animatedFile);
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.download();
    });

    expect(createdAnchors[0]?.download).toBe(
      studioDownload.buildWindowsRoleDownloadFilename("linkSelect", "ani")
    );

    clickSpy.mockRestore();
    createElementSpy.mockRestore();
  });

  it("coalesces drag-move history so one undo reverts the whole move gesture", async () => {
    const { result } = renderHook(() => useStudio());
    const staticFile = new File(["static"], "cursor.png", {
      type: "image/png",
    });

    await act(async () => {
      await result.current.selectFile(staticFile);
    });

    await act(async () => {
      await result.current.skipBgRemoval();
    });

    act(() => {
      result.current.setOffset(12, 8);
    });

    act(() => {
      result.current.setOffset(28, 24);
    });

    expect(result.current.cursor?.offsetX).toBe(28);
    expect(result.current.cursor?.offsetY).toBe(24);

    act(() => {
      result.current.undo();
    });

    expect(result.current.cursor?.offsetX).toBe(0);
    expect(result.current.cursor?.offsetY).toBe(0);
  });

  it("does not expose undo immediately after entering the upload stage", async () => {
    const { result } = renderHook(() => useStudio());
    const staticFile = new File(["static"], "cursor.png", {
      type: "image/png",
    });

    await act(async () => {
      await result.current.selectFile(staticFile);
    });

    expect(result.current.state).toBe("uploaded");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("coalesces scale history so one undo reverts the whole slider gesture", async () => {
    const { result } = renderHook(() => useStudio());
    const staticFile = new File(["static"], "cursor.png", {
      type: "image/png",
    });

    await act(async () => {
      await result.current.selectFile(staticFile);
    });

    await act(async () => {
      await result.current.skipBgRemoval();
    });

    act(() => {
      result.current.setScale(1.2);
    });

    act(() => {
      result.current.setScale(1.6);
    });

    expect(result.current.cursor?.scale).toBe(1.6);

    act(() => {
      result.current.undo();
    });

    expect(result.current.cursor?.scale).toBe(1);
  });

  it("starts a new undo step after a move gesture ends", async () => {
    const { result } = renderHook(() => useStudio());
    const staticFile = new File(["static"], "cursor.png", {
      type: "image/png",
    });

    await act(async () => {
      await result.current.selectFile(staticFile);
    });

    await act(async () => {
      await result.current.skipBgRemoval();
    });

    act(() => {
      result.current.setOffset(12, 8);
      result.current.setOffset(28, 24);
      result.current.endContinuousHistoryAction();
    });

    act(() => {
      result.current.setOffset(64, 48);
      result.current.endContinuousHistoryAction();
    });

    expect(result.current.cursor?.offsetX).toBe(64);
    expect(result.current.cursor?.offsetY).toBe(48);

    act(() => {
      result.current.undo();
    });

    expect(result.current.cursor?.offsetX).toBe(28);
    expect(result.current.cursor?.offsetY).toBe(24);

    act(() => {
      result.current.undo();
    });

    expect(result.current.cursor?.offsetX).toBe(0);
    expect(result.current.cursor?.offsetY).toBe(0);
  });

  it("does not undo past the editing session back into the upload stage", async () => {
    const { result } = renderHook(() => useStudio());
    const staticFile = new File(["static"], "cursor.png", {
      type: "image/png",
    });

    await act(async () => {
      await result.current.selectFile(staticFile);
    });

    await act(async () => {
      await result.current.skipBgRemoval();
    });

    act(() => {
      result.current.setOffset(28, 24);
      result.current.endContinuousHistoryAction();
    });

    expect(result.current.state).toBe("editing");
    expect(result.current.cursor?.offsetX).toBe(28);
    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toBe("editing");
    expect(result.current.cursor?.offsetX).toBe(0);
    expect(result.current.cursor?.offsetY).toBe(0);

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toBe("editing");
    expect(result.current.cursor?.offsetX).toBe(0);
    expect(result.current.cursor?.offsetY).toBe(0);
    expect(result.current.canUndo).toBe(false);
  });

  it("keeps the actual-size preview available immediately after undo", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useStudio());
    const staticFile = new File(["static"], "cursor.png", {
      type: "image/png",
    });

    await act(async () => {
      await result.current.selectFile(staticFile);
    });

    await act(async () => {
      await result.current.skipBgRemoval();
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      vi.advanceTimersByTime(250);
      await Promise.resolve();
    });

    expect(result.current.previewUrl).toBeTruthy();

    act(() => {
      result.current.setOffset(28, 24);
      result.current.endContinuousHistoryAction();
    });

    act(() => {
      result.current.undo();
    });

    expect(result.current.previewUrl).toBeTruthy();
    vi.useRealTimers();
  });

  it("ignores duplicate background-removal requests while one is already running", async () => {
    let resolveRemoval: ((value: Blob) => void) | null = null;
    removeBackgroundMock.mockImplementation(
      () =>
        new Promise<Blob>((resolve) => {
          resolveRemoval = resolve;
        })
    );

    const { result } = renderHook(() => useStudio());
    const staticFile = new File(["static"], "cursor.png", {
      type: "image/png",
    });

    await act(async () => {
      await result.current.selectFile(staticFile);
    });

    expect(result.current.state).toBe("uploaded");

    act(() => {
      void result.current.processBgRemoval();
      void result.current.processBgRemoval();
    });

    expect(removeBackgroundMock).toHaveBeenCalledTimes(1);
    expect(result.current.state).toBe("processing");

    await act(async () => {
      resolveRemoval?.(new Blob(["processed"], { type: "image/png" }));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.state).toBe("editing");
  });
});

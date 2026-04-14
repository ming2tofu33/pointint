import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  generateAniMock,
  generateCursorMock,
} = vi.hoisted(() => ({
  generateAniMock: vi.fn(),
  generateCursorMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  generateAni: generateAniMock,
  generateCursor: generateCursorMock,
  removeBackground: vi.fn(),
}));

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
});

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { generateAniMock } = vi.hoisted(() => ({
  generateAniMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  generateAni: generateAniMock,
  generateCursor: vi.fn(),
  removeBackground: vi.fn(),
}));

import { useStudio } from "@/lib/useStudio";

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
const originalImage = global.Image;
const originalCreateElement = document.createElement.bind(document);

describe("useStudio workflow entry", () => {
  beforeEach(() => {
    generateAniMock.mockReset();
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

  it("starts on the normalSelect role by default", () => {
    const { result } = renderHook(() => useStudio());

    expect(result.current.selectedSlotId).toBe("normalSelect");
    expect(result.current.editingSlotId).toBe("normalSelect");
  });

  it("starts in the slot editor entry and resets back to it", async () => {
    const { result } = renderHook(() => useStudio());

    expect(result.current.state).toBe("editing");

    const file = new File(["cursor"], "cursor.png", { type: "image/png" });

    await act(async () => {
      await result.current.selectFile(file);
      await Promise.resolve();
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
    expect(result.current.ani?.cursorName).toBe("arrow");
    expect(result.current.ani?.sourceWidth).toBe(128);
    expect(result.current.ani?.sourceHeight).toBe(96);
    expect(result.current.ani?.cursorSize).toBe(32);
  });

  it("seeds uploaded names from the selected Windows role instead of the source filename", async () => {
    const { result } = renderHook(() => useStudio());
    const staticFile = new File(["cursor"], "freeform-name.png", {
      type: "image/png",
    });
    const animatedFile = new File(["gif"], "orbit.gif", { type: "image/gif" });

    act(() => {
      result.current.selectSlot("textSelect");
    });

    await act(async () => {
      await result.current.selectSelectedSlotStaticFile(staticFile);
      await Promise.resolve();
    });

    expect(result.current.state).toBe("uploaded");
    expect(result.current.cursor?.cursorName).toBe("ibeam");

    act(() => {
      result.current.selectSlot("workingInBackground");
    });

    await act(async () => {
      await result.current.selectSelectedSlotAnimatedFile(animatedFile);
      await Promise.resolve();
    });

    expect(result.current.ani?.cursorName).toBe("working");
  });

  it("returns to the generic slot entry when an empty slot is selected", () => {
    const { result } = renderHook(() => useStudio());

    act(() => {
      result.current.selectSlot("textSelect");
    });

    expect(result.current.state).toBe("editing");
    expect(result.current.selectedSlotId).toBe("textSelect");
    expect(result.current.cursor).toBeNull();
    expect(result.current.ani).toBeNull();
  });

  it("keeps hidden Windows roles selectable", () => {
    const { result } = renderHook(() => useStudio());

    act(() => {
      result.current.selectSlot("workingInBackground");
    });

    expect(result.current.state).toBe("editing");
    expect(result.current.selectedSlotId).toBe("workingInBackground");
    expect(result.current.editingSlotId).toBe("workingInBackground");
    expect(result.current.cursor).toBeNull();
    expect(result.current.ani).toBeNull();
  });

  it("keeps pending background-removal choice visible for non-primary static roles", async () => {
    const { result } = renderHook(() => useStudio());
    const initialFile = new File(["cursor"], "text-select.png", {
      type: "image/png",
    });
    const replacementFile = new File(["cursor"], "text-select-2.png", {
      type: "image/png",
    });

    act(() => {
      result.current.selectSlot("textSelect");
    });

    await act(async () => {
      await result.current.selectSelectedSlotStaticFile(initialFile);
      await Promise.resolve();
    });

    act(() => {
      result.current.selectSlot("textSelect");
    });

    expect(result.current.state).toBe("uploaded");
    expect(result.current.selectedSlotId).toBe("textSelect");
    expect(result.current.editingSlotId).toBe("textSelect");

    act(() => {
      result.current.selectSlot("linkSelect");
    });

    expect(result.current.state).toBe("editing");
    expect(result.current.cursor).toBeNull();

    act(() => {
      result.current.selectSlot("textSelect");
    });

    expect(result.current.state).toBe("uploaded");
    expect(result.current.cursor?.cursorName).toBe("ibeam");

    await act(async () => {
      await result.current.selectSelectedSlotStaticFile(replacementFile);
      await Promise.resolve();
    });

    expect(result.current.state).toBe("uploaded");
    expect(result.current.selectedSlotId).toBe("textSelect");
    expect(result.current.editingSlotId).toBe("textSelect");
  });

  it("hydrates non-primary static uploads and waits for background-removal choice", async () => {
    const { result } = renderHook(() => useStudio());
    const file = new File(["cursor"], "text-select.png", {
      type: "image/png",
    });

    act(() => {
      result.current.selectSlot("textSelect");
    });

    await act(async () => {
      await result.current.selectSelectedSlotStaticFile(file);
      await Promise.resolve();
    });

    expect(result.current.state).toBe("uploaded");
    expect(result.current.selectedSlotId).toBe("textSelect");
    expect(result.current.cursor?.sourceWidth).toBe(128);
    expect(result.current.cursor?.sourceHeight).toBe(96);
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

  it("names the current-slot export from the selected Windows role", async () => {
    generateAniMock.mockResolvedValue({
      blob: new Blob(["ani"], { type: "application/octet-stream" }),
      filename: "pointint-orbit-demo.ani",
      contentType: "application/octet-stream",
    });

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

    expect(createdAnchors[0]?.download).toBe("pointint_arrow.ani");

    clickSpy.mockRestore();
    createElementSpy.mockRestore();
  });
});

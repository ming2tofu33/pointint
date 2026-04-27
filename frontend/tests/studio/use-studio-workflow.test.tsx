import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { generateAniMock, generateAniSequenceMock } = vi.hoisted(() => ({
  generateAniMock: vi.fn(),
  generateAniSequenceMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  generateAni: generateAniMock,
  generateAniSequence: generateAniSequenceMock,
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
    generateAniSequenceMock.mockReset();
    let objectUrlIndex = 0;
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => `blob:cursor-${objectUrlIndex++}`),
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
    expect(result.current.ani?.sourceKind).toBe("gif");
    expect(result.current.ani?.frames).toEqual([]);
  });

  it("creates selectable image sequence frames by filename before entering the ANI editor", async () => {
    const { result } = renderHook(() => useStudio());
    const unsortedFiles = [
      new File(["third"], "frame-003.png", { type: "image/png" }),
      new File(["first"], "frame-001.png", { type: "image/png" }),
      new File(["second"], "frame-002.png", { type: "image/png" }),
    ];

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(unsortedFiles);
      await Promise.resolve();
    });

    expect(result.current.state).toBe("ani-editing");
    expect(result.current.ani?.sourceKind).toBe("image-sequence");
    expect(result.current.ani?.originalFile.name).toBe("frame-001.png");
    expect(result.current.ani?.originalUrl).toBe("blob:cursor-0");
    expect(result.current.ani?.sourceWidth).toBe(128);
    expect(result.current.ani?.sourceHeight).toBe(96);
    expect(result.current.ani?.selectedFrameId).toBe("ani-frame-1-frame-001");
    expect(result.current.ani?.globalEdit).toEqual({
      fitMode: "contain",
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });
    expect(result.current.ani?.frames).toEqual([
      expect.objectContaining({
        id: "ani-frame-1-frame-001",
        file: unsortedFiles[1],
        url: "blob:cursor-0",
        sourceWidth: 128,
        sourceHeight: 96,
        durationMs: 100,
      }),
      expect.objectContaining({
        id: "ani-frame-2-frame-002",
        file: unsortedFiles[2],
        url: "blob:cursor-1",
        sourceWidth: 128,
        sourceHeight: 96,
        durationMs: 100,
      }),
      expect.objectContaining({
        id: "ani-frame-3-frame-003",
        file: unsortedFiles[0],
        url: "blob:cursor-2",
        sourceWidth: 128,
        sourceHeight: 96,
        durationMs: 100,
      }),
    ]);
  });

  it("selects an image sequence frame without changing the global hotspot", async () => {
    const { result } = renderHook(() => useStudio());
    const files = [
      new File(["first"], "frame-001.png", { type: "image/png" }),
      new File(["second"], "frame-002.png", { type: "image/png" }),
    ];

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(files);
      await Promise.resolve();
    });

    act(() => {
      result.current.setHotspot(42, 64);
    });

    act(() => {
      result.current.selectAniFrame("ani-frame-2-frame-002");
    });

    expect(result.current.ani?.selectedFrameId).toBe("ani-frame-2-frame-002");
    expect(result.current.ani?.originalFile).toBe(files[1]);
    expect(result.current.ani?.originalUrl).toBe("blob:cursor-1");
    expect(result.current.ani?.sourceWidth).toBe(128);
    expect(result.current.ani?.sourceHeight).toBe(96);
    expect(result.current.ani?.hotspotX).toBe(42);
    expect(result.current.ani?.hotspotY).toBe(64);
    expect(result.current.ani?.hotspotMode).toBe("manual");
    expect(result.current.ani?.globalEdit).toEqual({
      fitMode: "contain",
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });
  });

  it("revokes old image sequence frame URLs when replacing the sequence", async () => {
    const { result } = renderHook(() => useStudio());
    const firstSequence = [
      new File(["first-a"], "frame-001.png", { type: "image/png" }),
      new File(["first-b"], "frame-002.png", { type: "image/png" }),
    ];
    const secondSequence = [
      new File(["second-a"], "frame-001.png", { type: "image/png" }),
      new File(["second-b"], "frame-002.png", { type: "image/png" }),
    ];

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(firstSequence);
      await Promise.resolve();
    });

    vi.mocked(URL.revokeObjectURL).mockClear();

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(secondSequence);
      await Promise.resolve();
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:cursor-0");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:cursor-1");
  });

  it("undoes and redoes global sequence edits without losing selected frame overrides", async () => {
    const { result } = renderHook(() => useStudio());
    const files = [
      new File(["first"], "frame-001.png", { type: "image/png" }),
      new File(["second"], "frame-002.png", { type: "image/png" }),
    ];

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(files);
      await Promise.resolve();
    });

    act(() => {
      result.current.selectAniFrame("ani-frame-2-frame-002");
    });

    act(() => {
      const selectedFrame = result.current.ani?.frames[1];
      if (selectedFrame) {
        selectedFrame.editOverride = {
          scale: 1.75,
          offsetX: 12,
        };
      }
    });

    act(() => {
      result.current.setScale(1.25);
    });

    expect(result.current.ani?.selectedFrameId).toBe("ani-frame-2-frame-002");
    expect(result.current.ani?.globalEdit.scale).toBe(1.25);
    expect(result.current.ani?.frames[1]?.editOverride).toEqual({
      scale: 1.75,
      offsetX: 12,
    });

    act(() => {
      result.current.undo();
    });

    expect(result.current.ani?.selectedFrameId).toBe("ani-frame-2-frame-002");
    expect(result.current.ani?.globalEdit.scale).toBe(1);
    expect(result.current.ani?.frames[1]?.editOverride).toEqual({
      scale: 1.75,
      offsetX: 12,
    });

    act(() => {
      result.current.redo();
    });

    expect(result.current.ani?.selectedFrameId).toBe("ani-frame-2-frame-002");
    expect(result.current.ani?.globalEdit.scale).toBe(1.25);
    expect(result.current.ani?.frames[1]?.editOverride).toEqual({
      scale: 1.75,
      offsetX: 12,
    });
  });

  it("revokes all image sequence frame URLs on reset", async () => {
    const { result } = renderHook(() => useStudio());
    const files = [
      new File(["first"], "frame-001.png", { type: "image/png" }),
      new File(["second"], "frame-002.png", { type: "image/png" }),
      new File(["third"], "frame-003.png", { type: "image/png" }),
    ];

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(files);
      await Promise.resolve();
    });

    vi.mocked(URL.revokeObjectURL).mockClear();

    act(() => {
      result.current.reset();
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:cursor-0");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:cursor-1");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:cursor-2");
  });

  it("ignores a pending image sequence upload after switching slots", async () => {
    const pendingImages: Array<{ onload: null | (() => void) }> = [];
    global.Image = class DeferredImage {
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;
      naturalWidth = 128;
      naturalHeight = 96;

      set src(_value: string) {
        pendingImages.push(this);
      }
    } as unknown as typeof Image;

    const { result } = renderHook(() => useStudio());
    const files = [
      new File(["first"], "frame-001.png", { type: "image/png" }),
      new File(["second"], "frame-002.png", { type: "image/png" }),
    ];
    let uploadPromise: Promise<void> = Promise.resolve();

    act(() => {
      uploadPromise = result.current.selectSelectedSlotImageSequenceFiles(files);
    });

    act(() => {
      result.current.selectSlot("textSelect");
    });

    await act(async () => {
      pendingImages[0]?.onload?.();
      await uploadPromise;
      await Promise.resolve();
    });

    expect(result.current.selectedSlotId).toBe("textSelect");
    expect(result.current.state).toBe("editing");
    expect(result.current.ani).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:cursor-0");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:cursor-1");
  });

  it("undoes an image sequence replacement without returning to an empty upload state", async () => {
    const { result } = renderHook(() => useStudio());
    const firstSequence = [
      new File(["first-a"], "frame-001.png", { type: "image/png" }),
      new File(["first-b"], "frame-002.png", { type: "image/png" }),
    ];
    const secondSequence = [
      new File(["second-a"], "frame-001.png", { type: "image/png" }),
      new File(["second-b"], "frame-002.png", { type: "image/png" }),
    ];

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(firstSequence);
      await Promise.resolve();
    });

    const oldFrameUrls = result.current.ani?.frames.map((frame) => frame.url);

    act(() => {
      result.current.selectAniFrame("ani-frame-2-frame-002");
    });

    act(() => {
      const selectedFrame = result.current.ani?.frames[1];
      if (selectedFrame) {
        selectedFrame.editOverride = {
          offsetY: -8,
        };
      }
    });

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(secondSequence);
      await Promise.resolve();
    });

    expect(result.current.state).toBe("ani-editing");
    expect(result.current.ani?.frames[0]?.file).toBe(secondSequence[0]);

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toBe("ani-editing");
    expect(result.current.ani?.frames[0]?.file).toBe(firstSequence[0]);
    expect(result.current.ani?.selectedFrameId).toBe("ani-frame-2-frame-002");
    expect(result.current.ani?.frames[1]?.editOverride).toEqual({
      offsetY: -8,
    });
    expect(result.current.ani?.frames.map((frame) => frame.url)).not.toEqual(
      oldFrameUrls
    );

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toBe("ani-editing");
    expect(result.current.ani?.frames[0]?.file).toBe(firstSequence[0]);
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

  it("exports image sequences through the sequence ANI endpoint", async () => {
    generateAniSequenceMock.mockResolvedValue({
      blob: new Blob(["ani"], { type: "application/octet-stream" }),
      filename: "pointint-sequence.ani",
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
    const files = [
      new File(["second"], "frame-002.png", { type: "image/png" }),
      new File(["first"], "frame-001.png", { type: "image/png" }),
    ];

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(files);
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.download();
    });

    expect(generateAniMock).not.toHaveBeenCalled();
    expect(generateAniSequenceMock).toHaveBeenCalledWith(
      [files[1], files[0]],
      expect.objectContaining({
        aniName: "arrow",
        cursorSize: 32,
        fitMode: "contain",
      })
    );
    expect(createdAnchors[0]?.download).toBe("pointint_arrow.ani");

    clickSpy.mockRestore();
    createElementSpy.mockRestore();
  });
});

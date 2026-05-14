import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  extractGifFrameFilesMock,
  extractVideoFrameFilesMock,
  generateAniMock,
  generateAniSequenceMock,
  generateGifSequenceMock,
} = vi.hoisted(() => ({
  extractGifFrameFilesMock: vi.fn(),
  extractVideoFrameFilesMock: vi.fn(),
  generateAniMock: vi.fn(),
  generateAniSequenceMock: vi.fn(),
  generateGifSequenceMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  generateAni: generateAniMock,
  generateAniSequence: generateAniSequenceMock,
  generateGifSequence: generateGifSequenceMock,
  generateCursor: vi.fn(),
  removeBackground: vi.fn(),
}));

vi.mock("@/lib/gifFrameSequence", () => ({
  extractGifFrameFiles: extractGifFrameFilesMock,
}));

vi.mock("@/lib/videoFrameSequence", () => ({
  extractVideoFrameFiles: extractVideoFrameFilesMock,
}));

import {
  ANI_FRAME_MAX_DURATION_MS,
  ANI_FRAME_MIN_DURATION_MS,
} from "@/lib/aniFrameEdits";
import { useStudio } from "@/lib/useStudio";

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
const originalImage = global.Image;
const originalCreateElement = document.createElement.bind(document);

function createSequenceFiles(names: string[]) {
  return names.map(
    (name, index) =>
      new File([`frame-${index + 1}`], name, { type: "image/png" })
  );
}

describe("useStudio workflow entry", () => {
  beforeEach(() => {
    extractGifFrameFilesMock.mockReset();
    extractVideoFrameFilesMock.mockReset();
    generateAniMock.mockReset();
    generateAniSequenceMock.mockReset();
    generateGifSequenceMock.mockReset();
    extractGifFrameFilesMock.mockRejectedValue(new Error("not a real GIF"));
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

  it("loads GIF uploads as editable ANI frame sequences", async () => {
    const { result } = renderHook(() => useStudio());
    const file = new File(["gif"], "orbit.gif", { type: "image/gif" });
    const gifFrames = [
      new File(["frame-a"], "orbit-frame-001.png", { type: "image/png" }),
      new File(["frame-b"], "orbit-frame-002.png", { type: "image/png" }),
    ];

    extractGifFrameFilesMock.mockResolvedValueOnce({
      width: 48,
      height: 40,
      frames: [
        { file: gifFrames[0], durationMs: 80 },
        { file: gifFrames[1], durationMs: 140 },
      ],
    });

    await act(async () => {
      await result.current.selectAniFile(file);
      await Promise.resolve();
    });

    expect(result.current.state).toBe("ani-editing");
    expect(extractGifFrameFilesMock).toHaveBeenCalledWith(file);
    expect(result.current.ani?.cursorName).toBe("arrow");
    expect(result.current.ani?.sourceWidth).toBe(48);
    expect(result.current.ani?.sourceHeight).toBe(40);
    expect(result.current.ani?.cursorSize).toBe(32);
    expect(result.current.ani?.sourceKind).toBe("image-sequence");
    expect(result.current.ani?.selectedFrameId).toBe(
      "ani-frame-1-orbit-frame-001"
    );
    expect(result.current.ani?.frames).toEqual([
      expect.objectContaining({
        file: gifFrames[0],
        durationMs: 80,
        sourceWidth: 48,
        sourceHeight: 40,
      }),
      expect.objectContaining({
        file: gifFrames[1],
        durationMs: 140,
        sourceWidth: 48,
        sourceHeight: 40,
      }),
    ]);
  });

  it("loads video uploads as editable ANI frame sequences", async () => {
    const { result } = renderHook(() => useStudio());
    const file = new File(["video"], "orbit.mp4", { type: "video/mp4" });
    const videoFrames = [
      new File(["frame-a"], "orbit-frame-001.png", { type: "image/png" }),
      new File(["frame-b"], "orbit-frame-002.png", { type: "image/png" }),
    ];

    extractVideoFrameFilesMock.mockResolvedValueOnce({
      width: 640,
      height: 360,
      frames: [
        { file: videoFrames[0], durationMs: 42 },
        { file: videoFrames[1], durationMs: 58 },
      ],
    });

    await act(async () => {
      await result.current.selectVideoFile(file);
      await Promise.resolve();
    });

    expect(extractVideoFrameFilesMock).toHaveBeenCalledWith(file);
    expect(result.current.state).toBe("ani-editing");
    expect(result.current.ani?.sourceKind).toBe("image-sequence");
    expect(result.current.ani?.sourceWidth).toBe(640);
    expect(result.current.ani?.sourceHeight).toBe(360);
    expect(result.current.ani?.frames).toEqual([
      expect.objectContaining({
        file: videoFrames[0],
        durationMs: 42,
        sourceWidth: 640,
        sourceHeight: 360,
      }),
      expect.objectContaining({
        file: videoFrames[1],
        durationMs: 58,
        sourceWidth: 640,
        sourceHeight: 360,
      }),
    ]);
  });

  it("routes selected-slot video uploads into animated slot state", async () => {
    const { result } = renderHook(() => useStudio());
    const file = new File(["video"], "beam.webm", { type: "video/webm" });
    const videoFrames = [
      new File(["frame-a"], "beam-frame-001.png", { type: "image/png" }),
      new File(["frame-b"], "beam-frame-002.png", { type: "image/png" }),
    ];

    extractVideoFrameFilesMock.mockResolvedValueOnce({
      width: 320,
      height: 240,
      frames: [
        { file: videoFrames[0], durationMs: 90 },
        { file: videoFrames[1], durationMs: 110 },
      ],
    });

    act(() => {
      result.current.selectSlot("textSelect");
    });

    await act(async () => {
      await result.current.selectSelectedSlotVideoFile(file);
      await Promise.resolve();
    });

    expect(extractVideoFrameFilesMock).toHaveBeenCalledWith(file);
    expect(result.current.selectedSlotId).toBe("textSelect");
    expect(result.current.state).toBe("ani-editing");
    expect(result.current.ani?.cursorName).toBe("ibeam");
    expect(result.current.project.slots.textSelect.kind).toBe("animated");
    expect(result.current.project.slots.textSelect.asset.fileName).toBe(
      "beam-frame-001.png"
    );
    expect(result.current.project.slots.normalSelect.kind).toBeNull();
  });

  it("surfaces video extraction errors", async () => {
    const { result } = renderHook(() => useStudio());
    const file = new File(["video"], "unsupported.mov", {
      type: "video/quicktime",
    });

    extractVideoFrameFilesMock.mockRejectedValueOnce(
      new Error("Unsupported video")
    );

    await act(async () => {
      await result.current.selectVideoFile(file);
      await Promise.resolve();
    });

    expect(result.current.error).toBe("Unsupported video");
  });

  it("restores the existing animated editor when video extraction fails during replacement", async () => {
    const { result } = renderHook(() => useStudio());
    const existingFrames = createSequenceFiles(["frame-001.png", "frame-002.png"]);
    const file = new File(["video"], "unsupported.mov", {
      type: "video/quicktime",
    });

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(existingFrames);
      await Promise.resolve();
    });

    act(() => {
      result.current.setScale(1.5);
    });

    extractVideoFrameFilesMock.mockRejectedValueOnce(
      new Error("Unsupported video")
    );

    await act(async () => {
      await result.current.selectVideoFile(file);
      await Promise.resolve();
    });

    expect(result.current.error).toBe("Unsupported video");
    expect(result.current.state).toBe("ani-editing");
    expect(result.current.ani?.frames[0]?.file).toBe(existingFrames[0]);
    expect(result.current.ani?.globalEdit.scale).toBe(1.5);
  });

  it("commits current animated edits before pending video upload slot switches", async () => {
    const { result } = renderHook(() => useStudio());
    const existingFrames = createSequenceFiles(["frame-001.png", "frame-002.png"]);
    const videoFrames = createSequenceFiles([
      "video-frame-001.png",
      "video-frame-002.png",
    ]);
    let resolveVideo:
      | ((value: {
          width: number;
          height: number;
          frames: Array<{ file: File; durationMs: number }>;
        }) => void)
      | null = null;
    const pendingVideo = new Promise<{
      width: number;
      height: number;
      frames: Array<{ file: File; durationMs: number }>;
    }>((resolve) => {
      resolveVideo = resolve;
    });

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(existingFrames);
      await Promise.resolve();
    });

    act(() => {
      result.current.setScale(1.5);
    });

    extractVideoFrameFilesMock.mockReturnValueOnce(pendingVideo);

    let uploadPromise: Promise<void> = Promise.resolve();
    act(() => {
      uploadPromise = result.current.selectVideoFile(
        new File(["video"], "replacement.mp4", { type: "video/mp4" })
      );
    });

    act(() => {
      result.current.selectSlot("textSelect");
    });

    await act(async () => {
      resolveVideo?.({
        width: 640,
        height: 360,
        frames: [
          { file: videoFrames[0], durationMs: 70 },
          { file: videoFrames[1], durationMs: 80 },
        ],
      });
      await uploadPromise;
      await Promise.resolve();
    });

    act(() => {
      result.current.selectSlot("normalSelect");
    });

    expect(result.current.state).toBe("ani-editing");
    expect(result.current.ani?.frames[0]?.file).toBe(existingFrames[0]);
    expect(result.current.ani?.globalEdit.scale).toBe(1.5);
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
      rotation: 0,
      flipX: false,
      flipY: false,
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
      rotation: 0,
      flipX: false,
      flipY: false,
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

  it("does not restore revoked frame URLs when undoing an edit before replacement", async () => {
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

    act(() => {
      result.current.setScale(1.25);
    });

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(secondSequence);
      await Promise.resolve();
    });

    const revokedUrls = new Set(
      vi
        .mocked(URL.revokeObjectURL)
        .mock.calls.map(([url]) => url)
    );

    act(() => {
      result.current.undo();
    });

    act(() => {
      result.current.undo();
    });

    const restoredFrameUrls =
      result.current.ani?.frames.map((frame) => frame.url) ?? [];

    expect(result.current.state).toBe("ani-editing");
    expect(result.current.ani?.frames[0]?.file).toBe(firstSequence[0]);
    expect(restoredFrameUrls.length).toBe(2);
    expect(restoredFrameUrls.some((url) => revokedUrls.has(url))).toBe(false);
  });

  describe("ani frame timeline actions", () => {
    it("selects ani frames with one undoable history entry", async () => {
      const { result } = renderHook(() => useStudio());
      const files = createSequenceFiles(["frame-001.png", "frame-002.png"]);

      await act(async () => {
        await result.current.selectSelectedSlotImageSequenceFiles(files);
        await Promise.resolve();
      });

      act(() => {
        result.current.selectAniFrame("ani-frame-2-frame-002");
      });

      expect(result.current.ani?.selectedFrameId).toBe("ani-frame-2-frame-002");
      expect(result.current.canUndo).toBe(true);

      act(() => {
        result.current.undo();
      });

      expect(result.current.ani?.selectedFrameId).toBe("ani-frame-1-frame-001");

      act(() => {
        result.current.redo();
      });

      expect(result.current.ani?.selectedFrameId).toBe("ani-frame-2-frame-002");
    });

    it("deletes ani frames without allowing fewer than two frames", async () => {
      const { result } = renderHook(() => useStudio());
      const files = createSequenceFiles([
        "frame-001.png",
        "frame-002.png",
        "frame-003.png",
      ]);

      await act(async () => {
        await result.current.selectSelectedSlotImageSequenceFiles(files);
        await Promise.resolve();
      });

      act(() => {
        result.current.selectAniFrame("ani-frame-2-frame-002");
      });

      act(() => {
        result.current.deleteAniFrame("ani-frame-2-frame-002");
      });

      expect(result.current.ani?.frames.map((frame) => frame.id)).toEqual([
        "ani-frame-1-frame-001",
        "ani-frame-3-frame-003",
      ]);
      expect(result.current.ani?.selectedFrameId).toBe("ani-frame-3-frame-003");
      expect(result.current.ani?.originalFile).toBe(files[2]);

      act(() => {
        result.current.deleteAniFrame("ani-frame-1-frame-001");
      });

      expect(result.current.ani?.frames.map((frame) => frame.id)).toEqual([
        "ani-frame-1-frame-001",
        "ani-frame-3-frame-003",
      ]);

      act(() => {
        result.current.undo();
      });

      expect(result.current.ani?.frames.map((frame) => frame.id)).toEqual([
        "ani-frame-1-frame-001",
        "ani-frame-2-frame-002",
        "ani-frame-3-frame-003",
      ]);
      expect(result.current.ani?.selectedFrameId).toBe("ani-frame-2-frame-002");
    });

    it("moves ani frames previous and next while preserving selection", async () => {
      const { result } = renderHook(() => useStudio());
      const files = createSequenceFiles([
        "frame-001.png",
        "frame-002.png",
        "frame-003.png",
      ]);

      await act(async () => {
        await result.current.selectSelectedSlotImageSequenceFiles(files);
        await Promise.resolve();
      });

      act(() => {
        result.current.moveAniFrame("ani-frame-3-frame-003", "previous");
      });

      expect(result.current.ani?.frames.map((frame) => frame.id)).toEqual([
        "ani-frame-1-frame-001",
        "ani-frame-3-frame-003",
        "ani-frame-2-frame-002",
      ]);
      expect(result.current.ani?.selectedFrameId).toBe("ani-frame-3-frame-003");
      expect(result.current.ani?.originalFile).toBe(files[2]);

      act(() => {
        result.current.moveAniFrame("ani-frame-3-frame-003", "next");
      });

      expect(result.current.ani?.frames.map((frame) => frame.id)).toEqual([
        "ani-frame-1-frame-001",
        "ani-frame-2-frame-002",
        "ani-frame-3-frame-003",
      ]);

      act(() => {
        result.current.undo();
      });

      expect(result.current.ani?.frames.map((frame) => frame.id)).toEqual([
        "ani-frame-1-frame-001",
        "ani-frame-3-frame-003",
        "ani-frame-2-frame-002",
      ]);
    });

    it("reorders ani frames to an arbitrary insertion point", async () => {
      const { result } = renderHook(() => useStudio());
      const files = createSequenceFiles([
        "frame-001.png",
        "frame-002.png",
        "frame-003.png",
      ]);

      await act(async () => {
        await result.current.selectSelectedSlotImageSequenceFiles(files);
        await Promise.resolve();
      });

      act(() => {
        result.current.reorderAniFrame("ani-frame-1-frame-001", 3);
      });

      expect(result.current.ani?.frames.map((frame) => frame.id)).toEqual([
        "ani-frame-2-frame-002",
        "ani-frame-3-frame-003",
        "ani-frame-1-frame-001",
      ]);
      expect(result.current.ani?.selectedFrameId).toBe("ani-frame-1-frame-001");

      act(() => {
        result.current.undo();
      });

      expect(result.current.ani?.frames.map((frame) => frame.id)).toEqual([
        "ani-frame-1-frame-001",
        "ani-frame-2-frame-002",
        "ani-frame-3-frame-003",
      ]);
    });

    it("inserts additional image sequence frames without replacing the existing sequence", async () => {
      const { result } = renderHook(() => useStudio());
      const files = createSequenceFiles(["frame-001.png", "frame-002.png"]);
      const addedFrame = new File(["third"], "frame-003.png", {
        type: "image/png",
      });

      await act(async () => {
        await result.current.selectSelectedSlotImageSequenceFiles(files);
        await Promise.resolve();
      });

      await act(async () => {
        await result.current.insertAniFrameFiles([addedFrame], 1);
        await Promise.resolve();
      });

      expect(result.current.ani?.frames.map((frame) => frame.id)).toEqual([
        "ani-frame-1-frame-001",
        "ani-frame-3-frame-003",
        "ani-frame-2-frame-002",
      ]);
      expect(result.current.ani?.selectedFrameId).toBe("ani-frame-3-frame-003");
      expect(result.current.ani?.frames[1]?.file).toBe(addedFrame);
      expect(result.current.ani?.frames[1]?.url).toBe("blob:cursor-2");

      act(() => {
        result.current.undo();
      });

      expect(result.current.ani?.frames.map((frame) => frame.id)).toEqual([
        "ani-frame-1-frame-001",
        "ani-frame-2-frame-002",
      ]);
    });

    it("sets all image sequence frame durations with one undoable action", async () => {
      const { result } = renderHook(() => useStudio());
      const files = createSequenceFiles([
        "frame-001.png",
        "frame-002.png",
        "frame-003.png",
      ]);

      await act(async () => {
        await result.current.selectSelectedSlotImageSequenceFiles(files);
        await Promise.resolve();
      });

      act(() => {
        result.current.setAllAniFrameDurations(60);
      });

      expect(result.current.ani?.frames.map((frame) => frame.durationMs)).toEqual([
        60,
        60,
        60,
      ]);

      act(() => {
        result.current.undo();
      });

      expect(result.current.ani?.frames.map((frame) => frame.durationMs)).toEqual([
        100,
        100,
        100,
      ]);

      act(() => {
        result.current.redo();
      });

      expect(result.current.ani?.frames.map((frame) => frame.durationMs)).toEqual([
        60,
        60,
        60,
      ]);
    });

    it("sets ani frame duration through the duration clamp", async () => {
      const { result } = renderHook(() => useStudio());
      const files = createSequenceFiles(["frame-001.png", "frame-002.png"]);

      await act(async () => {
        await result.current.selectSelectedSlotImageSequenceFiles(files);
        await Promise.resolve();
      });

      act(() => {
        result.current.setAniFrameDuration("ani-frame-1-frame-001", 3);
      });

      expect(result.current.ani?.frames[0]?.durationMs).toBe(
        ANI_FRAME_MIN_DURATION_MS
      );

      act(() => {
        result.current.setAniFrameDuration("ani-frame-1-frame-001", 99999);
      });

      expect(result.current.ani?.frames[0]?.durationMs).toBe(
        ANI_FRAME_MAX_DURATION_MS
      );

      act(() => {
        result.current.undo();
      });

      expect(result.current.ani?.frames[0]?.durationMs).toBe(
        ANI_FRAME_MIN_DURATION_MS
      );
    });

    it("resets the selected ani frame edit override with undo", async () => {
      const { result } = renderHook(() => useStudio());
      const files = createSequenceFiles(["frame-001.png", "frame-002.png"]);

      await act(async () => {
        await result.current.selectSelectedSlotImageSequenceFiles(files);
        await Promise.resolve();
      });

      act(() => {
        result.current.selectAniFrame("ani-frame-2-frame-002");
      });

      act(() => {
        result.current.setSelectedAniFrameEditOverride({
          scale: 1.5,
          offsetX: 8,
        });
      });

      expect(result.current.ani?.frames[1]?.editOverride).toEqual({
        scale: 1.5,
        offsetX: 8,
      });
      expect(result.current.ani?.scale).toBe(1.5);
      expect(result.current.ani?.offsetX).toBe(8);

      act(() => {
        result.current.resetSelectedAniFrameEdit();
      });

      expect(result.current.ani?.frames[1]?.editOverride).toBeUndefined();
      expect(result.current.ani?.scale).toBe(1);
      expect(result.current.ani?.offsetX).toBe(0);

      act(() => {
        result.current.undo();
      });

      expect(result.current.ani?.frames[1]?.editOverride).toEqual({
        scale: 1.5,
        offsetX: 8,
      });
    });

    it("edits selected image sequence scale and offset as a frame override", async () => {
      const { result } = renderHook(() => useStudio());
      const files = createSequenceFiles(["frame-001.png", "frame-002.png"]);

      await act(async () => {
        await result.current.selectSelectedSlotImageSequenceFiles(files);
        await Promise.resolve();
      });

      act(() => {
        result.current.selectAniFrame("ani-frame-2-frame-002");
      });

      act(() => {
        result.current.setScale(1.5, "selected-frame");
      });

      expect(result.current.ani?.globalEdit.scale).toBe(1);
      expect(result.current.ani?.frames[1]?.editOverride).toEqual({
        scale: 1.5,
      });
      expect(result.current.ani?.scale).toBe(1.5);

      act(() => {
        result.current.setOffset(9, -6, "selected-frame");
      });

      expect(result.current.ani?.globalEdit).toEqual({
        fitMode: "contain",
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        flipX: false,
        flipY: false,
      });
      expect(result.current.ani?.frames[1]?.editOverride).toEqual({
        scale: 1.5,
        offsetX: 9,
        offsetY: -6,
      });
      expect(result.current.ani?.offsetX).toBe(9);
      expect(result.current.ani?.offsetY).toBe(-6);
    });

    it("edits all image sequence frames through the global baseline by default", async () => {
      const { result } = renderHook(() => useStudio());
      const files = createSequenceFiles(["frame-001.png", "frame-002.png"]);

      await act(async () => {
        await result.current.selectSelectedSlotImageSequenceFiles(files);
        await Promise.resolve();
      });

      act(() => {
        result.current.selectAniFrame("ani-frame-2-frame-002");
      });

      act(() => {
        result.current.setScale(1.25);
      });

      act(() => {
        result.current.setOffset(4, 5);
      });

      act(() => {
        result.current.setHotspot(11, 12);
      });

      expect(result.current.ani?.globalEdit).toEqual({
        fitMode: "contain",
        scale: 1.25,
        offsetX: 4,
        offsetY: 5,
        rotation: 0,
        flipX: false,
        flipY: false,
      });
      expect(result.current.ani?.frames[1]?.editOverride).toBeUndefined();
      expect(result.current.ani?.hotspotX).toBe(11);
      expect(result.current.ani?.hotspotY).toBe(12);

      act(() => {
        result.current.selectAniFrame("ani-frame-1-frame-001");
      });

      expect(result.current.ani?.scale).toBe(1.25);
      expect(result.current.ani?.offsetX).toBe(4);
      expect(result.current.ani?.offsetY).toBe(5);
      expect(result.current.ani?.hotspotX).toBe(11);
      expect(result.current.ani?.hotspotY).toBe(12);
    });

    it("applies image transforms globally with undoable hotspot adjustment", async () => {
      const { result } = renderHook(() => useStudio());
      const files = createSequenceFiles(["frame-001.png", "frame-002.png"]);

      await act(async () => {
        await result.current.selectSelectedSlotImageSequenceFiles(files);
        await Promise.resolve();
      });

      act(() => {
        result.current.setHotspot(64, 96);
      });

      act(() => {
        result.current.applyImageTransform("rotate-clockwise");
      });

      expect(result.current.ani?.globalEdit.rotation).toBe(90);
      expect(result.current.ani?.rotation).toBe(90);
      expect(result.current.ani?.hotspotX).toBe(96);
      expect(result.current.ani?.hotspotY).toBe(192);

      act(() => {
        result.current.applyImageTransform("flip-horizontal");
      });

      expect(result.current.ani?.globalEdit.flipX).toBe(true);
      expect(result.current.ani?.hotspotX).toBe(160);
      expect(result.current.ani?.hotspotY).toBe(192);

      act(() => {
        result.current.undo();
      });

      expect(result.current.ani?.globalEdit.flipX).toBe(false);
      expect(result.current.ani?.globalEdit.rotation).toBe(90);
    });

    it("applies image transforms to the selected frame when scoped", async () => {
      const { result } = renderHook(() => useStudio());
      const files = createSequenceFiles(["frame-001.png", "frame-002.png"]);

      await act(async () => {
        await result.current.selectSelectedSlotImageSequenceFiles(files);
        await Promise.resolve();
      });

      act(() => {
        result.current.selectAniFrame("ani-frame-2-frame-002");
      });

      act(() => {
        result.current.applyImageTransform(
          "flip-horizontal",
          "selected-frame"
        );
      });

      expect(result.current.ani?.globalEdit.flipX).toBe(false);
      expect(result.current.ani?.frames[1]?.editOverride).toEqual(
        expect.objectContaining({
          flipX: true,
        })
      );
      expect(result.current.ani?.flipX).toBe(true);
    });
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
    expect(result.current.downloadGuideVariant).toBe("ani");

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
        durationMs: 100,
      })
    );
    expect(createdAnchors[0]?.download).toBe("pointint_arrow.ani");

    clickSpy.mockRestore();
    createElementSpy.mockRestore();
  });

  it("passes per-frame durations when image sequence frame durations differ", async () => {
    generateAniSequenceMock.mockResolvedValue({
      blob: new Blob(["ani"], { type: "application/octet-stream" }),
      filename: "pointint-sequence.ani",
      contentType: "application/octet-stream",
    });

    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tagName: string, options?: ElementCreationOptions) =>
        originalCreateElement(tagName, options)
      );
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    const { result } = renderHook(() => useStudio());
    const files = createSequenceFiles(["frame-001.png", "frame-002.png"]);

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(files);
      await Promise.resolve();
    });

    act(() => {
      result.current.setAniFrameDuration("ani-frame-2-frame-002", 250);
    });

    await act(async () => {
      await result.current.download();
    });

    expect(generateAniSequenceMock).toHaveBeenCalledWith(
      files,
      expect.objectContaining({
        frameDurationsMs: [100, 250],
      })
    );

    clickSpy.mockRestore();
    createElementSpy.mockRestore();
  });

  it("exports image sequences as GIF files with frame durations", async () => {
    generateGifSequenceMock.mockResolvedValue({
      blob: new Blob(["gif"], { type: "image/gif" }),
      filename: "pointint-sequence.gif",
      contentType: "image/gif",
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
    const files = createSequenceFiles(["frame-001.png", "frame-002.png"]);

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(files);
      await Promise.resolve();
    });

    act(() => {
      result.current.setAniFrameDuration("ani-frame-2-frame-002", 240);
    });

    await act(async () => {
      await result.current.downloadGif();
    });

    expect(generateGifSequenceMock).toHaveBeenCalledWith(
      files,
      expect.objectContaining({
        aniName: "arrow",
        frameDurationsMs: [100, 240],
      })
    );
    expect(createdAnchors[0]?.download).toBe("pointint_arrow.gif");
    expect(result.current.showGuide).toBe(false);

    clickSpy.mockRestore();
    createElementSpy.mockRestore();
  });

  it("shows an actionable backend message when GIF export cannot reach the API", async () => {
    generateGifSequenceMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const { result } = renderHook(() => useStudio());
    const files = createSequenceFiles(["frame-001.png", "frame-002.png"]);

    await act(async () => {
      await result.current.selectSelectedSlotImageSequenceFiles(files);
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.downloadGif();
    });

    expect(result.current.error).toBe(
      "Backend connection failed. Start or redeploy the backend, then try again."
    );
  });
});

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

describe("useStudio slot contract", () => {
  beforeEach(() => {
    generateAniMock.mockReset();
    ensureAniZipPackageMock.mockReset();
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

  it("exposes a four-slot cursor theme project with normal selected by default", () => {
    const { result } = renderHook(() => useStudio());

    expect(result.current).toHaveProperty("project");
    expect(result.current).toHaveProperty("selectedSlotId", "normal");
    expect(result.current.project?.slots).toEqual({
      normal: expect.anything(),
      text: expect.anything(),
      link: expect.anything(),
      button: expect.anything(),
    });
    expect(result.current.project.slots.normal.kind).toBeNull();
    expect(result.current.project.slots.text.kind).toBeNull();
    expect(result.current.project.slots.link.kind).toBeNull();
    expect(result.current.project.slots.button.kind).toBeNull();
  });

  it("switches the bound editing target when a different slot is selected", () => {
    const { result } = renderHook(() => useStudio());

    expect(result.current).toHaveProperty("selectSlot");

    act(() => {
      result.current.selectSlot("text");
    });

    expect(result.current).toHaveProperty("selectedSlotId", "text");
    expect(result.current).toHaveProperty("editingSlotId", "text");
  });

  it("stores a static upload in the selected slot and restores its editing state", async () => {
    const { result } = renderHook(() => useStudio());
    const file = new File(["slot"], "slot-image.png", { type: "image/png" });

    act(() => {
      result.current.selectSlot("text");
    });

    await act(async () => {
      await result.current.selectSelectedSlotStaticFile(file);
      await Promise.resolve();
    });

    expect(result.current.state).toBe("editing");
    expect(result.current.selectedSlotId).toBe("text");
    expect(result.current.project.slots.text.kind).toBe("static");
    expect(result.current.project.slots.text.asset.originalUrl).toMatch(
      /^blob:slot-object-/
    );
    expect(result.current.cursor?.originalFile).toBe(file);

    act(() => {
      result.current.setScale(1.5);
      result.current.setHotspot(18, 22);
      result.current.setCursorName("text-slot");
    });

    act(() => {
      result.current.selectSlot("button");
    });

    act(() => {
      result.current.selectSlot("text");
    });

    expect(result.current.state).toBe("editing");
    expect(result.current.cursor?.cursorName).toBe("text-slot");
    expect(result.current.cursor?.scale).toBe(1.5);
    expect(result.current.cursor?.hotspotX).toBe(18);
    expect(result.current.cursor?.hotspotY).toBe(22);
  });

  it("clears the active editor asset when switching from a populated slot to an empty slot", async () => {
    const { result } = renderHook(() => useStudio());

    act(() => {
      result.current.selectSlot("text");
    });

    await act(async () => {
      await result.current.selectSelectedSlotStaticFile(
        new File(["text"], "text-slot.png", { type: "image/png" })
      );
      await Promise.resolve();
    });

    expect(result.current.cursor?.originalFile.name).toBe("text-slot.png");

    act(() => {
      result.current.selectSlot("button");
    });

    expect(result.current.selectedSlotId).toBe("button");
    expect(result.current.cursor).toBeNull();
    expect(result.current.ani).toBeNull();
  });

  it("stores an animated upload in the selected slot and enters ani-editing", async () => {
    const { result } = renderHook(() => useStudio());
    const file = new File(["gif"], "slot-ani.gif", { type: "image/gif" });

    act(() => {
      result.current.selectSlot("link");
    });

    await act(async () => {
      await result.current.selectSelectedSlotAnimatedFile(file);
      await Promise.resolve();
    });

    expect(result.current.state).toBe("ani-editing");
    expect(result.current.selectedSlotId).toBe("link");
    expect(result.current.project.slots.link.kind).toBe("animated");
    expect(result.current.project.slots.link.asset.originalUrl).toMatch(
      /^blob:slot-object-/
    );
    expect(result.current.ani?.originalFile).toBe(file);
  });

  it("does not revoke another populated slot when uploading into a new empty slot", async () => {
    const { result } = renderHook(() => useStudio());
    const revokeObjectUrlMock = vi.mocked(URL.revokeObjectURL);

    act(() => {
      result.current.selectSlot("text");
    });

    await act(async () => {
      await result.current.selectSelectedSlotStaticFile(
        new File(["text"], "text-slot.png", { type: "image/png" })
      );
      await Promise.resolve();
    });

    const textSlotUrl = result.current.project.slots.text.asset.originalUrl;

    act(() => {
      result.current.selectSlot("button");
    });

    await act(async () => {
      await result.current.selectSelectedSlotStaticFile(
        new File(["button"], "button-slot.png", { type: "image/png" })
      );
      await Promise.resolve();
    });

    expect(textSlotUrl).toBeTruthy();
    expect(revokeObjectUrlMock).not.toHaveBeenCalledWith(textSlotUrl);
  });
});

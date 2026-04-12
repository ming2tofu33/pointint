import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useStudio } from "@/lib/useStudio";

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
const originalImage = global.Image;

describe("useStudio workflow entry", () => {
  beforeEach(() => {
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

  it("enters cur-upload from the workflow picker", () => {
    const { result } = renderHook(() => useStudio());

    act(() => {
      result.current.selectWorkflow("cur-static-image");
    });

    expect(result.current.state).toBe("cur-upload");
  });

  it("enters ani-upload from the workflow picker", () => {
    const { result } = renderHook(() => useStudio());

    act(() => {
      result.current.selectWorkflow("ani-animated-gif");
    });

    expect(result.current.state).toBe("ani-upload");
  });

  it("starts in workflow-pick, still uploads files, and resets back", () => {
    const { result } = renderHook(() => useStudio());

    expect(result.current.state).toBe("workflow-pick");

    const file = new File(["cursor"], "cursor.png", { type: "image/png" });

    act(() => {
      result.current.selectFile(file);
    });

    expect(result.current.state).toBe("uploaded");

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe("workflow-pick");
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
  });
});

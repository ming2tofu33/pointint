import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useStudio } from "@/lib/useStudio";

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

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

    vi.restoreAllMocks();
  });

  it("enters cur-upload from the workflow picker", () => {
    const { result } = renderHook(() => useStudio());

    act(() => {
      result.current.selectWorkflow("cur-static-image");
    });

    expect(result.current.state).toBe("cur-upload");
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
});

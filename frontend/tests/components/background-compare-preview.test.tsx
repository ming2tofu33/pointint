import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import BackgroundComparePreview from "@/components/BackgroundComparePreview";

describe("BackgroundComparePreview", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("autoplays the before-after sweep once and settles on the processed image", () => {
    vi.useFakeTimers();

    render(
      <BackgroundComparePreview
        beforeUrl="blob:before"
        afterUrl="blob:after"
        title="Background removal compare"
        beforeLabel="Original"
        afterLabel="Processed"
      />
    );

    const preview = screen.getByTestId("background-compare-preview");
    const overlay = screen.getByTestId("background-compare-overlay");

    expect(preview).toHaveAttribute("data-state", "playing");
    expect(overlay).toHaveStyle({ width: "100%" });

    act(() => {
      vi.advanceTimersByTime(40);
    });

    expect(overlay).toHaveStyle({ width: "0%" });

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(preview).toHaveAttribute("data-state", "done");
  });

  it("does not render when the before and after image are identical", () => {
    render(
      <BackgroundComparePreview
        beforeUrl="blob:same"
        afterUrl="blob:same"
        title="Background removal compare"
        beforeLabel="Original"
        afterLabel="Processed"
      />
    );

    expect(
      screen.queryByTestId("background-compare-preview")
    ).not.toBeInTheDocument();
  });
});

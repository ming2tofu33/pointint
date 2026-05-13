import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import StudioQuickBackgroundDecision from "@/components/StudioQuickBackgroundDecision";

describe("StudioQuickBackgroundDecision", () => {
  it("renders inline background decision actions", () => {
    const onRemove = vi.fn();
    const onKeep = vi.fn();

    render(
      <StudioQuickBackgroundDecision
        title="Remove the background?"
        description="Use AI background removal."
        removeLabel="Remove background"
        keepLabel="Use as is"
        previewUrl="blob:preview"
        cursorName="cursor"
        onRemove={onRemove}
        onKeep={onKeep}
      />
    );

    expect(screen.getByTestId("studio-quick-background-decision")).toBeVisible();
    expect(screen.getByAltText("cursor")).toHaveAttribute("src", "blob:preview");

    fireEvent.click(screen.getByRole("button", { name: "Remove background" }));
    fireEvent.click(screen.getByRole("button", { name: "Use as is" }));

    expect(onRemove).toHaveBeenCalledOnce();
    expect(onKeep).toHaveBeenCalledOnce();
  });

  it("keeps a stable inline processing state", () => {
    render(
      <StudioQuickBackgroundDecision
        title="Remove the background?"
        description="Removing background"
        removeLabel="Remove background"
        keepLabel="Use as is"
        processing
        onRemove={vi.fn()}
        onKeep={vi.fn()}
      />
    );

    expect(
      screen.getByTestId("studio-quick-background-processing")
    ).toBeVisible();
    expect(screen.queryByRole("button")).toBeNull();
  });
});

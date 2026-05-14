import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AniBackgroundDecision from "@/components/AniBackgroundDecision";

describe("AniBackgroundDecision", () => {
  it("renders frame previews and decision actions", () => {
    const onKeep = vi.fn();
    const onRemove = vi.fn();

    render(
      <AniBackgroundDecision
        title="Remove the background?"
        description="Use transparent frames for sticker-like animations."
        keepLabel="Use as is"
        removeLabel="Remove background"
        framePreviewUrls={["blob:frame-1", "blob:frame-2", "blob:frame-3"]}
        onKeep={onKeep}
        onRemove={onRemove}
      />
    );

    expect(screen.getByTestId("ani-background-decision")).toBeVisible();
    expect(screen.getAllByRole("img")).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Use as is" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove background" }));

    expect(onKeep).toHaveBeenCalledOnce();
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("shows progress while frame backgrounds are processing", () => {
    render(
      <AniBackgroundDecision
        title="Remove the background?"
        description="Use transparent frames for sticker-like animations."
        keepLabel="Use as is"
        removeLabel="Remove background"
        processing
        processingTitle="Removing backgrounds"
        processingDescription="7 / 30 frames processed"
        progress={{ completed: 7, total: 30 }}
        framePreviewUrls={["blob:frame-1", "blob:frame-2"]}
        onKeep={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByRole("status")).toBeVisible();
    expect(screen.getByText("Removing backgrounds")).toBeVisible();
    expect(screen.getByText("7 / 30 frames processed")).toBeVisible();
    expect(screen.getByRole("button", { name: "Use as is" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Remove background" })
    ).toBeDisabled();
  });
});

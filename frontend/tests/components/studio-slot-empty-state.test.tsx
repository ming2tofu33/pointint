import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    (
      {
        slotTextSelect: "Text Select",
        slotLabelSuffix: "slot",
        emptySlotDescription: "Choose a source for this cursor role.",
        slotStaticUpload: "Static Image",
        slotStaticUploadSub: "Upload a PNG, JPG, JPEG, or WebP image.",
        slotAniUpload: "Animated GIF",
        slotAniUploadSub: "Upload a GIF for an animated cursor slot.",
        emptySlotStaticStart: "Start with Static Image",
        emptySlotAnimatedStart: "Start with Animated GIF",
        moreSourceOptions: "More options",
        imageSequenceMinimumError: "Select at least 2 frames.",
      } as Record<string, string>
    )[key] ?? key,
}));

import StudioSlotEmptyState from "@/components/StudioSlotEmptyState";

describe("StudioSlotEmptyState", () => {
  it("fills the editor stage with a single dotted border and source cards inside", () => {
    render(
      <StudioSlotEmptyState
        slotId="textSelect"
        onStaticFile={vi.fn()}
        onAnimatedFile={vi.fn()}
        onImageSequenceFiles={vi.fn()}
      />
    );

    const stage = screen.getByTestId("studio-empty-slot-state");
    const sourceCards = screen.getByTestId("studio-empty-slot-source-cards");

    expect(stage).toBeVisible();
    expect(stage).toHaveStyle({
      width: "100%",
      flex: "1 1 auto",
    });
    expect(stage.getAttribute("style")).toContain(
      "border: 1px solid var(--color-border)"
    );
    expect(stage.getAttribute("style")).toContain(
      "background-color: var(--color-bg-secondary)"
    );
    expect(screen.getByTestId("studio-empty-slot-dots-base")).toBeInTheDocument();
    expect(screen.getByTestId("studio-empty-slot-dots-hover")).toBeInTheDocument();
    expect(sourceCards.getAttribute("style")).not.toContain("border:");
    expect(sourceCards.getAttribute("style")).toContain(
      "background-color: transparent"
    );
    expect(
      screen.getByRole("button", { name: "Start with Static Image" })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Start with Animated GIF" })
    ).toBeVisible();
  });

  it("updates the pink dot mask from cursor movement", () => {
    render(
      <StudioSlotEmptyState
        slotId="textSelect"
        onStaticFile={vi.fn()}
        onAnimatedFile={vi.fn()}
        onImageSequenceFiles={vi.fn()}
      />
    );

    const stage = screen.getByTestId("studio-empty-slot-state");

    fireEvent.mouseMove(stage, { clientX: 72, clientY: 96 });

    expect(stage.style.getPropertyValue("--mouse-x")).toBe("72px");
    expect(stage.style.getPropertyValue("--mouse-y")).toBe("96px");
  });
});

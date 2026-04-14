import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import SlotReplacementSurface from "@/components/SlotReplacementSurface";

describe("SlotReplacementSurface", () => {
  it("shows an inline confirm before replacing with a dropped static file", () => {
    const onStaticFile = vi.fn();
    const onAnimatedFile = vi.fn();
    const file = new File(["cursor"], "cursor.png", { type: "image/png" });

    render(
      <SlotReplacementSurface
        onStaticFile={onStaticFile}
        onAnimatedFile={onAnimatedFile}
      >
        <div>stage</div>
      </SlotReplacementSurface>
    );

    fireEvent.drop(screen.getByTestId("slot-replacement-surface"), {
      dataTransfer: { files: [file] },
    });

    expect(onStaticFile).not.toHaveBeenCalled();
    expect(screen.getByText("replaceSlotPrompt")).not.toBeNull();
    expect(screen.getByRole("button", { name: "confirmReplace" })).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "confirmReplace" }));

    expect(onStaticFile).toHaveBeenCalledWith(file);
    expect(onAnimatedFile).not.toHaveBeenCalled();
  });

  it("cancels a dropped animated replacement without applying it", () => {
    const onStaticFile = vi.fn();
    const onAnimatedFile = vi.fn();
    const file = new File(["cursor"], "cursor.gif", { type: "image/gif" });

    render(
      <SlotReplacementSurface
        onStaticFile={onStaticFile}
        onAnimatedFile={onAnimatedFile}
      >
        <div>stage</div>
      </SlotReplacementSurface>
    );

    fireEvent.drop(screen.getByTestId("slot-replacement-surface"), {
      dataTransfer: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: "cancelReplace" }));

    expect(onStaticFile).not.toHaveBeenCalled();
    expect(onAnimatedFile).not.toHaveBeenCalled();
    expect(screen.queryByText("replaceSlotPrompt")).toBeNull();
  });
});

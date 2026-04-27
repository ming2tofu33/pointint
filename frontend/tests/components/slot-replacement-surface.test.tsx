import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import SlotReplacementSurface from "@/components/SlotReplacementSurface";

describe("SlotReplacementSurface", () => {
  it("ignores internal text drags so frame reordering does not trigger replacement UI", () => {
    const onStaticFile = vi.fn();
    const onAnimatedFile = vi.fn();
    const onImageSequenceFiles = vi.fn();

    render(
      <SlotReplacementSurface
        onStaticFile={onStaticFile}
        onAnimatedFile={onAnimatedFile}
        onImageSequenceFiles={onImageSequenceFiles}
      >
        <div>stage</div>
      </SlotReplacementSurface>
    );

    const surface = screen.getByTestId("slot-replacement-surface");
    const dataTransfer = {
      files: [],
      types: ["text/plain"],
    };

    fireEvent.dragEnter(surface, { dataTransfer });
    fireEvent.dragOver(surface, { dataTransfer });
    fireEvent.drop(surface, { dataTransfer });

    expect(screen.queryByText("dropToReplace")).toBeNull();
    expect(screen.queryByText("replaceSlotPrompt")).toBeNull();
    expect(onStaticFile).not.toHaveBeenCalled();
    expect(onAnimatedFile).not.toHaveBeenCalled();
    expect(onImageSequenceFiles).not.toHaveBeenCalled();
  });

  it("shows an inline confirm before replacing with a dropped static file", () => {
    const onStaticFile = vi.fn();
    const onAnimatedFile = vi.fn();
    const onImageSequenceFiles = vi.fn();
    const file = new File(["cursor"], "cursor.png", { type: "image/png" });

    render(
      <SlotReplacementSurface
        onStaticFile={onStaticFile}
        onAnimatedFile={onAnimatedFile}
        onImageSequenceFiles={onImageSequenceFiles}
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
    expect(onImageSequenceFiles).not.toHaveBeenCalled();
  });

  it("cancels a dropped animated replacement without applying it", () => {
    const onStaticFile = vi.fn();
    const onAnimatedFile = vi.fn();
    const onImageSequenceFiles = vi.fn();
    const file = new File(["cursor"], "cursor.gif", { type: "image/gif" });

    render(
      <SlotReplacementSurface
        onStaticFile={onStaticFile}
        onAnimatedFile={onAnimatedFile}
        onImageSequenceFiles={onImageSequenceFiles}
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
    expect(onImageSequenceFiles).not.toHaveBeenCalled();
    expect(screen.queryByText("replaceSlotPrompt")).toBeNull();
  });

  it("confirms dropped image sequences instead of treating the first frame as static", () => {
    const onStaticFile = vi.fn();
    const onAnimatedFile = vi.fn();
    const onImageSequenceFiles = vi.fn();
    const firstFrame = new File(["one"], "frame-01.png", { type: "image/png" });
    const secondFrame = new File(["two"], "frame-02.webp", {
      type: "image/webp",
    });

    render(
      <SlotReplacementSurface
        onStaticFile={onStaticFile}
        onAnimatedFile={onAnimatedFile}
        onImageSequenceFiles={onImageSequenceFiles}
      >
        <div>stage</div>
      </SlotReplacementSurface>
    );

    fireEvent.drop(screen.getByTestId("slot-replacement-surface"), {
      dataTransfer: { files: [firstFrame, secondFrame] },
    });

    expect(screen.getByText("replaceSlotPrompt")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "confirmReplace" }));

    expect(onStaticFile).not.toHaveBeenCalled();
    expect(onAnimatedFile).not.toHaveBeenCalled();
    expect(onImageSequenceFiles).toHaveBeenCalledWith([
      firstFrame,
      secondFrame,
    ]);
  });
});

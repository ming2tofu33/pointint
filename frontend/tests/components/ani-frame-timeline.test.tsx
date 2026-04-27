import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AniFrameTimeline, {
  type AniFrameTimelineFrame,
} from "@/components/AniFrameTimeline";

function frame(
  id: string,
  durationMs: number,
  editOverride?: AniFrameTimelineFrame["editOverride"]
): AniFrameTimelineFrame {
  return {
    id,
    url: `blob:${id}`,
    durationMs,
    sourceWidth: 32,
    sourceHeight: 32,
    editOverride,
  };
}

const frames = [
  frame("frame-a", 100),
  frame("frame-b", 125, { scale: 1.2 }),
  frame("frame-c", 75),
];

describe("AniFrameTimeline", () => {
  it("renders the frame count and total duration", () => {
    render(
      <AniFrameTimeline
        frames={frames}
        selectedFrameId="frame-a"
        onSelectFrame={vi.fn()}
        onDeleteFrame={vi.fn()}
        onReorderFrames={vi.fn()}
      />
    );

    expect(screen.getByText("3 frames")).toBeVisible();
    expect(screen.getByText("300 ms")).toBeVisible();
  });

  it("selects a frame when its thumbnail is clicked", () => {
    const onSelectFrame = vi.fn();

    render(
      <AniFrameTimeline
        frames={frames}
        selectedFrameId="frame-a"
        onSelectFrame={onSelectFrame}
        onDeleteFrame={vi.fn()}
        onReorderFrames={vi.fn()}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Select frame 2, duration 125 ms, edited",
      })
    );

    expect(onSelectFrame).toHaveBeenCalledWith("frame-b");
  });

  it("disables deleting when only two frames remain", () => {
    const onDeleteFrame = vi.fn();

    render(
      <AniFrameTimeline
        frames={[frame("frame-a", 100), frame("frame-b", 100)]}
        selectedFrameId="frame-a"
        onSelectFrame={vi.fn()}
        onDeleteFrame={onDeleteFrame}
        onReorderFrames={vi.fn()}
      />
    );

    const deleteButton = screen.getByRole("button", {
      name: "Delete frame 1",
    });

    expect(deleteButton).toBeDisabled();
    fireEvent.click(deleteButton);
    expect(onDeleteFrame).not.toHaveBeenCalled();
  });

  it("emits reordered frame ids from move previous and move next actions", () => {
    const onReorderFrames = vi.fn();

    render(
      <AniFrameTimeline
        frames={frames}
        selectedFrameId="frame-b"
        onSelectFrame={vi.fn()}
        onDeleteFrame={vi.fn()}
        onReorderFrames={onReorderFrames}
      />
    );

    const frameTwoActions = screen.getByRole("group", {
      name: "Frame 2 actions",
    });

    fireEvent.click(
      within(frameTwoActions).getByRole("button", {
        name: "Move frame 2 previous",
      })
    );
    expect(onReorderFrames).toHaveBeenLastCalledWith([
      "frame-b",
      "frame-a",
      "frame-c",
    ]);

    fireEvent.click(
      within(frameTwoActions).getByRole("button", { name: "Move frame 2 next" })
    );
    expect(onReorderFrames).toHaveBeenLastCalledWith([
      "frame-a",
      "frame-c",
      "frame-b",
    ]);
  });

  it("shows a visible edited marker on modified frames", () => {
    render(
      <AniFrameTimeline
        frames={frames}
        selectedFrameId="frame-a"
        onSelectFrame={vi.fn()}
        onDeleteFrame={vi.fn()}
        onReorderFrames={vi.fn()}
      />
    );

    expect(
      within(screen.getByTestId("ani-frame-frame-b")).getByText("Edited")
    ).toBeVisible();
    expect(
      within(screen.getByTestId("ani-frame-frame-b")).getByRole("button", {
        name: "Select frame 2, duration 125 ms, edited",
      })
    ).toBeVisible();
    expect(
      within(screen.getByTestId("ani-frame-frame-a")).queryByText("Edited")
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId("ani-frame-frame-a")).getByRole("button", {
        name: "Select frame 1, duration 100 ms, not edited",
      })
    ).toBeVisible();
  });
});

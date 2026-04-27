import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations:
    () =>
    (key: string, values?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        aniFrameTimeline: "ANI frame timeline",
        aniFrameCountSingular: "{count} frame",
        aniFrameCountPlural: "{count} frames",
        aniFrameTotalDuration: "Total duration",
        aniFrameTimelineHint: "Click to select. Drag to reorder.",
        aniFrameEdited: "Edited",
        aniFrameEditedState: "edited",
        aniFrameNotEditedState: "not edited",
        aniFrameSelectLabel:
          "Select frame {frame}, duration {duration}, {state}",
        aniFrameActions: "Frame {frame} actions",
        aniFrameMovePrevious: "Previous",
        aniFrameMoveNext: "Next",
        aniFrameDelete: "Delete",
        aniFrameMovePreviousLabel: "Move frame {frame} previous",
        aniFrameMoveNextLabel: "Move frame {frame} next",
        aniFrameDeleteLabel: "Delete frame {frame}",
        aniFrameAdd: "Add frame",
        aniFrameAddLabel: "Add image frames",
        aniFrameDurationLabel: "Frame {frame} duration in milliseconds",
        aniFramePlay: "Play",
        aniFramePause: "Pause",
        aniFramePlayLabel: "Play animation",
        aniFramePauseLabel: "Pause animation",
        aniFrameSpeed: "Animation speed",
        aniFrameSpeedSlow: "Slow",
        aniFrameSpeedNormal: "Normal",
        aniFrameSpeedFast: "Fast",
        aniFrameSpeedLabel: "{label} speed, {duration} ms per frame",
      };

      return Object.entries(values ?? {}).reduce(
        (current, [name, value]) =>
          current.replaceAll(`{${name}}`, String(value)),
        translations[key] ?? key
      );
    },
}));

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

function createDataTransfer(files: File[] = []) {
  const data = new Map<string, string>();

  return {
    dropEffect: "",
    effectAllowed: "",
    files,
    types: files.length > 0 ? ["Files"] : ["text/plain"],
    getData: vi.fn((type: string) => data.get(type) ?? ""),
    setData: vi.fn((type: string, value: string) => {
      data.set(type, value);
    }),
  };
}

const frames = [
  frame("frame-a", 100),
  frame("frame-b", 125, { scale: 1.2 }),
  frame("frame-c", 75),
];

describe("AniFrameTimeline", () => {
  it("renders the frame count, total duration, and direct-manipulation hint", () => {
    render(
      <AniFrameTimeline
        frames={frames}
        selectedFrameId="frame-a"
        onSelectFrame={vi.fn()}
        onDeleteFrame={vi.fn()}
        onReorderFrame={vi.fn()}
        onAddFrames={vi.fn()}
      />
    );

    expect(screen.getByText("3 frames")).toBeVisible();
    expect(screen.getByText("300 ms")).toBeVisible();
    expect(screen.getByText("Click to select. Drag to reorder.")).toBeVisible();
  });

  it("renders playback controls and emits global speed changes", () => {
    const onPlayToggle = vi.fn();
    const onSetAllFrameDurations = vi.fn();

    render(
      <AniFrameTimeline
        frames={frames}
        selectedFrameId="frame-a"
        isPlaying={false}
        onPlayToggle={onPlayToggle}
        onSelectFrame={vi.fn()}
        onDeleteFrame={vi.fn()}
        onReorderFrame={vi.fn()}
        onAddFrames={vi.fn()}
        onSetAllFrameDurations={onSetAllFrameDurations}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Play animation" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Fast speed, 60 ms per frame" })
    );

    expect(onPlayToggle).toHaveBeenCalledWith(true);
    expect(onSetAllFrameDurations).toHaveBeenCalledWith(60);
  });

  it("edits the selected frame duration through an inline number input", () => {
    const onSetFrameDuration = vi.fn();

    render(
      <AniFrameTimeline
        frames={frames}
        selectedFrameId="frame-b"
        onSelectFrame={vi.fn()}
        onDeleteFrame={vi.fn()}
        onReorderFrame={vi.fn()}
        onAddFrames={vi.fn()}
        onSetFrameDuration={onSetFrameDuration}
      />
    );

    const durationInput = screen.getByRole("spinbutton", {
      name: "Frame 2 duration in milliseconds",
    });

    fireEvent.change(durationInput, { target: { value: "180" } });
    fireEvent.blur(durationInput);

    expect(onSetFrameDuration).toHaveBeenCalledWith("frame-b", 180);
  });

  it("selects a frame when its thumbnail is clicked", () => {
    const onSelectFrame = vi.fn();

    render(
      <AniFrameTimeline
        frames={frames}
        selectedFrameId="frame-a"
        onSelectFrame={onSelectFrame}
        onDeleteFrame={vi.fn()}
        onReorderFrame={vi.fn()}
        onAddFrames={vi.fn()}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Select frame 2, duration 125 ms, edited",
      })
    );

    expect(onSelectFrame).toHaveBeenCalledWith("frame-b");
  });

  it("deletes frames through a compact x button while preserving the minimum frame count", () => {
    const onDeleteFrame = vi.fn();

    render(
      <AniFrameTimeline
        frames={[frame("frame-a", 100), frame("frame-b", 100)]}
        selectedFrameId="frame-a"
        onSelectFrame={vi.fn()}
        onDeleteFrame={onDeleteFrame}
        onReorderFrame={vi.fn()}
        onAddFrames={vi.fn()}
      />
    );

    const deleteButton = screen.getByRole("button", {
      name: "Delete frame 1",
    });

    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveStyle({
      minHeight: "1.42rem",
      minWidth: "1.42rem",
    });
    fireEvent.click(deleteButton);
    expect(onDeleteFrame).not.toHaveBeenCalled();
  });

  it("emits a reorder action when a frame is dragged to a new insertion point", () => {
    const onReorderFrame = vi.fn();
    const dataTransfer = createDataTransfer();

    render(
      <AniFrameTimeline
        frames={frames}
        selectedFrameId="frame-b"
        onSelectFrame={vi.fn()}
        onDeleteFrame={vi.fn()}
        onReorderFrame={onReorderFrame}
        onAddFrames={vi.fn()}
      />
    );

    const firstFrame = screen.getByTestId("ani-frame-frame-a");
    const secondFrame = screen.getByTestId("ani-frame-frame-b");
    secondFrame.getBoundingClientRect = vi.fn(
      () =>
        ({
          bottom: 10,
          height: 10,
          left: 0,
          right: 10,
          top: 0,
          width: 10,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect
    );

    fireEvent.dragStart(firstFrame, {
      dataTransfer,
    });
    fireEvent.dragOver(secondFrame, {
      clientX: 9,
      dataTransfer,
    });
    fireEvent.drop(secondFrame, {
      clientX: 9,
      dataTransfer,
    });

    expect(onReorderFrame).toHaveBeenCalledWith("frame-a", 1);
  });

  it("adds selected image files from the add-frame tile", () => {
    const onAddFrames = vi.fn();
    const addedFile = new File(["added"], "frame-004.png", {
      type: "image/png",
    });

    render(
      <AniFrameTimeline
        frames={frames}
        selectedFrameId="frame-a"
        onSelectFrame={vi.fn()}
        onDeleteFrame={vi.fn()}
        onReorderFrame={vi.fn()}
        onAddFrames={onAddFrames}
      />
    );

    fireEvent.change(screen.getByTestId("ani-frame-add-input"), {
      target: { files: [addedFile] },
    });

    expect(onAddFrames).toHaveBeenCalledWith([addedFile], frames.length);
  });

  it("shows a visible edited marker on modified frames", () => {
    render(
      <AniFrameTimeline
        frames={frames}
        selectedFrameId="frame-a"
        onSelectFrame={vi.fn()}
        onDeleteFrame={vi.fn()}
        onReorderFrame={vi.fn()}
        onAddFrames={vi.fn()}
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

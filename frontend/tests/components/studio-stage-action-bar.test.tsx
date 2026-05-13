import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import StudioStageActionBar from "@/components/StudioStageActionBar";

describe("StudioStageActionBar", () => {
  it("keeps toolbar groups and action labels from being squeezed on narrow canvases", () => {
    render(
      <StudioStageActionBar
        actions={[
          {
            id: "hotspot",
            label: "Hotspot",
            group: "tool",
            onClick: vi.fn(),
          },
          {
            id: "undo",
            label: "Undo",
            group: "history",
            shortcutHint: "Ctrl+Z",
            onClick: vi.fn(),
          },
          {
            id: "redo",
            label: "Redo",
            group: "history",
            shortcutHint: "Ctrl+Y",
            onClick: vi.fn(),
          },
        ]}
      />
    );

    const undo = screen.getByRole("button", { name: "Undo" });
    const redo = screen.getByRole("button", { name: "Redo" });
    const historyGroup = undo.parentElement;

    expect(undo).toHaveStyle({
      whiteSpace: "nowrap",
      flexShrink: "0",
    });
    expect(redo).toHaveStyle({
      whiteSpace: "nowrap",
      flexShrink: "0",
    });
    expect(historyGroup).toHaveStyle({
      flexShrink: "0",
    });
  });
});

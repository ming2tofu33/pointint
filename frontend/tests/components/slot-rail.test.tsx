import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import SlotRail from "@/components/SlotRail";
import { createCursorThemeProject } from "@/lib/cursorThemeProject";

describe("SlotRail", () => {
  it("moves the selected badge out of the title row and above the thumbnail", () => {
    const project = createCursorThemeProject();
    project.slots.normal.kind = "animated";
    project.slots.normal.asset.previewUrl = "blob:normal-preview";

    render(
      <SlotRail
        project={project}
        selectedSlotId="normal"
        onSelectSlot={vi.fn()}
      />
    );

    expect(screen.getByTestId("slot-normal")).toHaveStyle({
      minHeight: "4.75rem",
    });
    expect(screen.getByTestId("slot-thumbnail-normal")).toHaveStyle({
      borderRadius: "0",
    });

    expect(screen.getByTestId("slot-title-normal")).toHaveTextContent(
      "slotNormal"
    );
    expect(screen.getByTestId("slot-title-normal")).not.toHaveTextContent(
      "slotSelected"
    );
    expect(screen.getByTestId("slot-selected-badge-normal")).toHaveStyle({
      borderRadius: "0.25rem",
    });
    expect(screen.getByTestId("slot-badge-stack-normal")).toHaveStyle({
      display: "grid",
    });
  });

  it("shows an unset type label for empty slots", () => {
    const project = createCursorThemeProject();

    render(
      <SlotRail
        project={project}
        selectedSlotId="text"
        onSelectSlot={vi.fn()}
      />
    );

    expect(screen.getByTestId("slot-status-text")).toHaveTextContent("slotEmpty");
    expect(screen.getByTestId("slot-kind-text")).toHaveTextContent("slotKindUnset");
  });
});

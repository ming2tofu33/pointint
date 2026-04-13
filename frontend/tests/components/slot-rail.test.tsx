import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import SlotRail from "@/components/SlotRail";
import { createCursorThemeProject } from "@/lib/cursorThemeProject";

describe("SlotRail", () => {
  it("locks the refreshed selected-state contract for selected badge, unset kind, and elevated emphasis", () => {
    const project = createCursorThemeProject();
    project.slots.normal.kind = "animated";
    project.slots.normal.asset.previewUrl = "blob:normal-preview";
    project.slots.link.kind = "static";
    project.slots.link.asset.previewUrl = "blob:link-preview";

    render(
      <SlotRail
        project={project}
        selectedSlotId="normal"
        onSelectSlot={vi.fn()}
      />
    );

    expect(screen.getByTestId("slot-selected-badge-normal")).toBeVisible();
    expect(screen.getByTestId("slot-badge-stack-normal")).toHaveStyle({
      display: "grid",
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
    expect(screen.getByTestId("slot-normal")).toHaveStyle({
      border: "1px solid var(--color-accent)",
      backgroundColor: "var(--color-accent-subtle)",
    });
    expect(screen.getByTestId("slot-normal")).toHaveStyle({
      boxShadow: "0 0 0 1px var(--color-accent), 0 12px 28px rgba(0, 0, 0, 0.3)",
    });
    expect(screen.getByTestId("slot-link")).toHaveStyle({
      border: "1px solid var(--color-border)",
      backgroundColor: "var(--color-bg-primary)",
      boxShadow: "none",
    });
    expect(screen.getByTestId("slot-text")).toHaveStyle({
      border: "1px solid var(--color-border)",
      backgroundColor: "var(--color-bg-primary)",
      boxShadow: "none",
    });
    expect(screen.getByTestId("slot-status-text")).toHaveTextContent("slotEmpty");
    expect(screen.getByTestId("slot-kind-text")).toHaveTextContent("slotKindUnset");
  });
});

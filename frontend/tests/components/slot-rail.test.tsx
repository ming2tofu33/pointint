import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const SLOT_RAIL_TRANSLATIONS: Record<string, string> = {
  slotRailTitle: "Windows roles",
  slotRailMore: "Additional 7 cursors",
  slotRailConfigured: "configured",
  slotSelected: "Selected",
  slotFilled: "Configured",
  slotEmpty: "Empty",
  slotStatic: "Static",
  slotAnimated: "Animated",
  slotKindUnset: "Unset",
  slotNormalSelect: "Normal Select",
  slotNormalSelectHint: "Pointer on the desktop",
  slotTextSelect: "Text Select",
  slotTextSelectHint: "Text input area",
  slotLinkSelect: "Link Select",
  slotLinkSelectHint: "Link hover",
  slotBusy: "Busy",
  slotBusyHint: "Waiting cursor",
  slotWorkingInBackground: "Working in Background",
  slotWorkingInBackgroundHint: "Task continues in the background",
  slotUnavailable: "Unavailable",
  slotUnavailableHint: "Unavailable state",
  slotMove: "Move",
  slotMoveHint: "Move selection",
  slotHorizontalResize: "Horizontal Resize",
  slotHorizontalResizeHint: "Resize horizontally",
  slotVerticalResize: "Vertical Resize",
  slotVerticalResizeHint: "Resize vertically",
  slotDiagonalResize1: "Diagonal Resize 1",
  slotDiagonalResize1Hint: "Resize diagonally",
  slotDiagonalResize2: "Diagonal Resize 2",
  slotDiagonalResize2Hint: "Resize diagonally",
};

function humanizeKey(key: string) {
  return (
    SLOT_RAIL_TRANSLATIONS[key] ??
    key
      .replace(/^slot/, "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .trim()
      .toLowerCase()
  );
}

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => humanizeKey(key),
}));

import SlotRail from "@/components/SlotRail";

const PRIMARY_ROLE_IDS = [
  "normalSelect",
  "textSelect",
  "linkSelect",
  "busy",
] as const;

const HIDDEN_ROLE_IDS = [
  "workingInBackground",
  "unavailable",
  "move",
  "horizontalResize",
  "verticalResize",
  "diagonalResize1",
  "diagonalResize2",
] as const;

function createSlot(id: string, previewUrl: string | null = null) {
  return {
    id,
    kind: previewUrl ? "static" : null,
    asset: {
      fileName: previewUrl ? `${id}.png` : null,
      originalUrl: previewUrl,
      previewUrl,
    },
    editing: {
      cursorName: id,
      cursorSize: 32,
      fitMode: "contain",
      hotspotMode: "auto",
      hotspotX: 0,
      hotspotY: 0,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    },
  };
}

describe("SlotRail", () => {
  it("shows four primary roles by default and expands the hidden seven inline", () => {
    const project = {
      slots: {
        normalSelect: createSlot("normalSelect", "blob:normal-preview"),
        textSelect: createSlot("textSelect", "blob:text-preview"),
        linkSelect: createSlot("linkSelect", "blob:link-preview"),
        busy: createSlot("busy", "blob:busy-preview"),
        workingInBackground: createSlot(
          "workingInBackground",
          "blob:workingInBackground-preview"
        ),
        unavailable: createSlot("unavailable"),
        move: createSlot("move"),
        horizontalResize: createSlot("horizontalResize"),
        verticalResize: createSlot("verticalResize"),
        diagonalResize1: createSlot("diagonalResize1"),
        diagonalResize2: createSlot("diagonalResize2"),
      },
    } as never;

    render(
      <SlotRail
        project={project}
        selectedSlotId="normalSelect"
        onSelectSlot={vi.fn()}
      />
    );

    PRIMARY_ROLE_IDS.forEach((roleId) => {
      expect(screen.getByTestId(`slot-${roleId}`)).toBeVisible();
    });

    HIDDEN_ROLE_IDS.forEach((roleId) => {
      expect(screen.queryByTestId(`slot-${roleId}`)).toBeNull();
    });

    expect(screen.getByTestId("slot-rail-more-summary")).toHaveTextContent("1");
    expect(screen.getByTestId("slot-rail-more")).toHaveAttribute(
      "aria-expanded",
      "false"
    );

    fireEvent.click(screen.getByTestId("slot-rail-more"));
    expect(screen.getByTestId("slot-rail-more")).toHaveAttribute(
      "aria-expanded",
      "true"
    );

    HIDDEN_ROLE_IDS.forEach((roleId) => {
      expect(screen.getByTestId(`slot-${roleId}`)).toBeVisible();
    });
  });
});

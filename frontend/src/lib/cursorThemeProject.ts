import { type FitMode } from "@/lib/cursorFrame";

export type CursorSize = 32 | 48 | 64;
export const WINDOWS_ROLE_SLOT_IDS = [
  "normalSelect",
  "textSelect",
  "linkSelect",
  "busy",
  "workingInBackground",
  "unavailable",
  "move",
  "horizontalResize",
  "verticalResize",
  "diagonalResize1",
  "diagonalResize2",
] as const;
export type WindowsRoleSlotId = (typeof WINDOWS_ROLE_SLOT_IDS)[number];
export type SlotId = WindowsRoleSlotId;
export type SlotKind = "static" | "animated";
export const DEFAULT_PRIMARY_ROLE_SLOT_ID = WINDOWS_ROLE_SLOT_IDS[0];
export const WINDOWS_ROLE_DEFAULT_NAMES: Record<WindowsRoleSlotId, string> = {
  normalSelect: "arrow",
  textSelect: "ibeam",
  linkSelect: "link",
  busy: "busy",
  workingInBackground: "working",
  unavailable: "unavail",
  move: "move",
  horizontalResize: "ew",
  verticalResize: "ns",
  diagonalResize1: "nwse",
  diagonalResize2: "nesw",
};

export interface CursorThemeSlot {
  id: SlotId;
  kind: SlotKind | null;
  asset: {
    fileName: string | null;
    originalUrl: string | null;
    previewUrl: string | null;
  };
  editing: {
    cursorName: string;
    cursorSize: CursorSize;
    fitMode: FitMode;
    hotspotMode: "auto" | "manual";
    hotspotX: number;
    hotspotY: number;
    offsetX: number;
    offsetY: number;
    scale: number;
  };
}

export interface CursorThemeSlots
  extends Record<WindowsRoleSlotId, CursorThemeSlot> {
}

export interface CursorThemeProject {
  slots: CursorThemeSlots;
}

export function getDefaultCursorNameForSlot(slotId: WindowsRoleSlotId) {
  return WINDOWS_ROLE_DEFAULT_NAMES[slotId];
}

function createCursorThemeSlot(id: SlotId): CursorThemeSlot {
  return {
    id,
    kind: null,
    asset: {
      fileName: null,
      originalUrl: null,
      previewUrl: null,
    },
    editing: {
      cursorName: getDefaultCursorNameForSlot(id),
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

export function createWindowsRoleRecord<T>(
  createValue: (slotId: WindowsRoleSlotId) => T
): Record<WindowsRoleSlotId, T> {
  const record = {} as Record<WindowsRoleSlotId, T>;

  for (const slotId of WINDOWS_ROLE_SLOT_IDS) {
    record[slotId] = createValue(slotId);
  }

  return record;
}

export function createCursorThemeProject(): CursorThemeProject {
  const slots = createWindowsRoleRecord((slotId) => createCursorThemeSlot(slotId));

  return {
    slots,
  };
}

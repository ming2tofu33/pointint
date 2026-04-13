import { type FitMode } from "@/lib/cursorFrame";

export type CursorSize = 32 | 48 | 64;
export type SlotId = "normal" | "text" | "link" | "button";
export type SlotKind = "static" | "animated";

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

export interface CursorThemeProject {
  slots: Record<SlotId, CursorThemeSlot>;
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

export function createCursorThemeProject(): CursorThemeProject {
  return {
    slots: {
      normal: createCursorThemeSlot("normal"),
      text: createCursorThemeSlot("text"),
      link: createCursorThemeSlot("link"),
      button: createCursorThemeSlot("button"),
    },
  };
}

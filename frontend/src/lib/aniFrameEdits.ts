import type { FitMode } from "@/lib/cursorFrame";

export const ANI_FRAME_MIN_DURATION_MS = 20;
export const ANI_FRAME_DEFAULT_DURATION_MS = 100;
export const ANI_FRAME_MAX_DURATION_MS = 2000;

export type AniFrameEdit = {
  fitMode: FitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
};

export type AniFrameEditOverride = Partial<AniFrameEdit>;

export type AniImportedFrame = {
  id: string;
  file: File;
  url: string;
  durationMs: number;
  editOverride?: AniFrameEditOverride;
};

export type AniFrameWithEditOverride = {
  editOverride?: AniFrameEditOverride | null;
};

export function resolveAniFrameEdit(
  globalEdit: AniFrameEdit,
  frame: AniFrameWithEditOverride
): AniFrameEdit {
  const override = frame.editOverride;

  return {
    fitMode: override?.fitMode ?? globalEdit.fitMode,
    scale: override?.scale ?? globalEdit.scale,
    offsetX: override?.offsetX ?? globalEdit.offsetX,
    offsetY: override?.offsetY ?? globalEdit.offsetY,
  };
}

export function createAniFrameId(fileName: string, index: number): string {
  const stem = fileName.replace(/\.[^/.]+$/, "");
  const slug = stem
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `ani-frame-${index + 1}-${slug || "frame"}`;
}

export function createAniFramesFromFiles(
  files: readonly File[],
  options?: {
    startIndex?: number;
    preserveOrder?: boolean;
    getDurationMs?: (file: File, originalIndex: number) => number | undefined;
  }
): AniImportedFrame[] {
  const startIndex = options?.startIndex ?? 0;
  const entries = files.map((file, originalIndex) => ({
    file,
    originalIndex,
    sortKey: file.name.normalize("NFC").toLowerCase(),
  }));

  const orderedEntries = options?.preserveOrder
    ? entries
    : entries.sort((a, b) => {
        if (a.sortKey < b.sortKey) return -1;
        if (a.sortKey > b.sortKey) return 1;
        return a.originalIndex - b.originalIndex;
      });

  return orderedEntries
    .map(({ file, originalIndex }, index) => ({
      id: createAniFrameId(file.name, startIndex + index),
      file,
      url: URL.createObjectURL(file),
      durationMs: clampAniFrameDuration(
        options?.getDurationMs?.(file, originalIndex) ??
          ANI_FRAME_DEFAULT_DURATION_MS
      ),
    }));
}

export function clampAniFrameDuration(durationMs: number): number {
  if (!Number.isFinite(durationMs)) {
    return ANI_FRAME_DEFAULT_DURATION_MS;
  }

  return Math.min(
    ANI_FRAME_MAX_DURATION_MS,
    Math.max(ANI_FRAME_MIN_DURATION_MS, Math.round(durationMs))
  );
}

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
  return {
    ...globalEdit,
    ...(frame.editOverride ?? {}),
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
  files: readonly File[]
): AniImportedFrame[] {
  return [...files]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((file, index) => ({
      id: createAniFrameId(file.name, index),
      file,
      url: URL.createObjectURL(file),
      durationMs: ANI_FRAME_DEFAULT_DURATION_MS,
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

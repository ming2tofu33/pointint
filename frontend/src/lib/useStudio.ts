"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  applyImageTransformAction,
  createDefaultImageTransform,
  FitMode,
  hasNonDefaultImageTransform,
  ImageTransformAction,
  ImageRotation,
  mapViewportHotspotToOutput,
  rasterizeSquarePng,
  suggestViewportHotspot,
  trimTransparentImageBlob,
} from "@/lib/cursorFrame";
import {
  DEFAULT_PRIMARY_ROLE_SLOT_ID,
  createCursorThemeProject,
  createWindowsRoleRecord,
  getDefaultCursorNameForSlot,
  WINDOWS_ROLE_SLOT_IDS,
  type CursorSize as ThemeCursorSize,
  type CursorThemeProject,
  type SlotKind,
  type WindowsRoleSlotId,
} from "@/lib/cursorThemeProject";
import {
  buildWindowsRoleMasterZip,
  buildWindowsRoleDownloadFilename,
  buildWindowsRoleInstallInf,
  buildWindowsRolePackagePath,
  buildWindowsRoleRestoreInf,
  type WindowsRoleInstallerEntry,
} from "@/lib/studioDownload";
import { type StudioState } from "@/lib/studioWorkflow";
import { trackEvent } from "@/lib/analytics";
import {
  clampAniFrameDuration,
  createAniFramesFromFiles,
  resolveAniFrameEdit,
  type AniFrameEdit,
  type AniFrameEditOverride,
  type AniImportedFrame,
} from "@/lib/aniFrameEdits";

import {
  generateAni,
  generateAniSequence,
  generateCursor,
  generateGifSequence,
  removeBackground,
  type BinaryDownloadResponse,
} from "./api";
import {
  extractGifFrameFiles,
  type ExtractedGifFrameSequence,
} from "./gifFrameSequence";
import {
  extractVideoFrameFiles,
  type ExtractedVideoFrameSequence,
  type ExtractVideoFrameOptions,
} from "./videoFrameSequence";

export type CursorSize = ThemeCursorSize;
export type AniFrameMoveDirection = "previous" | "next";
export type AniFrameEditScope = "all-frames" | "selected-frame";
export type DownloadGuideVariant = "package" | "cur" | "ani";

const EDITOR_VIEWPORT_SIZE = 256;
const DEFAULT_ANI_FRAME_EDIT: AniFrameEdit = {
  fitMode: "contain",
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  flipX: false,
  flipY: false,
};

export interface CursorData {
  originalFile: File;
  originalUrl: string;
  processedUrl: string;
  processedBlob: Blob;
  sourceWidth: number;
  sourceHeight: number;
  hotspotX: number;
  hotspotY: number;
  hotspotMode: "auto" | "manual";
  renderedHotspotX: number;
  renderedHotspotY: number;
  renderedBlob: Blob | null;
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: ImageRotation;
  flipX: boolean;
  flipY: boolean;
  fitMode: FitMode;
  cursorSize: CursorSize;
  cursorName: string;
}

export interface AniFrameData extends AniImportedFrame {
  sourceWidth: number;
  sourceHeight: number;
  editOverride?: AniFrameEditOverride;
}

export interface AniData {
  originalFile: File;
  originalUrl: string;
  sourceKind: "gif" | "image-sequence";
  frames: AniFrameData[];
  selectedFrameId: string | null;
  globalEdit: AniFrameEdit;
  sourceWidth: number;
  sourceHeight: number;
  hotspotX: number;
  hotspotY: number;
  hotspotMode: "auto" | "manual";
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: ImageRotation;
  flipX: boolean;
  flipY: boolean;
  fitMode: FitMode;
  cursorSize: CursorSize;
  cursorName: string;
}

interface SlotRuntime {
  cursor: CursorData | null;
  ani: AniData | null;
  backgroundRemovalPending: boolean;
}

interface SlotStateUpdate {
  kind: SlotKind;
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
    rotation: ImageRotation;
    flipX: boolean;
    flipY: boolean;
  };
  runtime: SlotRuntime;
}

interface StudioSnapshot {
  state: StudioState;
  project: CursorThemeProject;
  slotRuntime: Record<WindowsRoleSlotId, SlotRuntime>;
  selectedSlotId: WindowsRoleSlotId;
  editingSlotId: WindowsRoleSlotId;
  cursor: CursorData | null;
  ani: AniData | null;
}

interface PendingAniBackgroundDecision {
  slotId: WindowsRoleSlotId;
  ani: AniData;
  previous: StudioSnapshot;
}

interface AniBackgroundProgress {
  completed: number;
  total: number;
}

type HistoryActionKey =
  | "offset"
  | "scale"
  | "hotspot"
  | "fitMode"
  | "cursorSize"
  | "cursorName"
  | "replaceSlot"
  | "backgroundDecision"
  | "recommendHotspot"
  | "aniFrameSelection"
  | "aniFrameDelete"
  | "aniFrameInsert"
  | "aniFrameMove"
  | "aniFrameDuration"
  | "aniFrameEditOverride"
  | "aniFrameReset"
  | "imageTransform";

type LegacySlotId = "normal" | "text" | "link" | "button" | "busySelect";

const LEGACY_SLOT_ID_MAP: Record<LegacySlotId, WindowsRoleSlotId> = {
  normal: "normalSelect",
  text: "textSelect",
  link: "linkSelect",
  button: "busy",
  busySelect: "busy",
};

const HISTORY_LIMIT = 50;

function normalizeSlotId(
  slotId: WindowsRoleSlotId | LegacySlotId
): WindowsRoleSlotId {
  return LEGACY_SLOT_ID_MAP[slotId as LegacySlotId] ?? slotId;
}

function attachLegacySlotAliases(
  slots: CursorThemeProject["slots"]
): CursorThemeProject["slots"] {
  const legacySlots =
    slots as CursorThemeProject["slots"] &
      Record<LegacySlotId, CursorThemeProject["slots"][WindowsRoleSlotId]>;
  const aliasMap: Record<LegacySlotId, WindowsRoleSlotId> = LEGACY_SLOT_ID_MAP;

  (Object.entries(aliasMap) as Array<[LegacySlotId, WindowsRoleSlotId]>).forEach(
    ([legacySlotId, modernSlotId]) => {
      Object.defineProperty(legacySlots, legacySlotId, {
        configurable: true,
        enumerable: false,
        get: () => legacySlots[modernSlotId],
        set: (value) => {
          legacySlots[modernSlotId] = value;
        },
      });
    }
  );

  return legacySlots;
}

function revokeCursorObjectUrls(cursor: CursorData | null) {
  if (!cursor) return;
  if (cursor.processedUrl && cursor.processedUrl !== cursor.originalUrl) {
    safeRevokeObjectUrl(cursor.processedUrl);
  }
  if (cursor.originalUrl) {
    safeRevokeObjectUrl(cursor.originalUrl);
  }
}

function revokeAniObjectUrls(ani: AniData | null) {
  if (!ani) return;
  const urls = new Set<string>();
  if (ani.originalUrl) {
    urls.add(ani.originalUrl);
  }
  ani.frames.forEach((frame) => urls.add(frame.url));
  urls.forEach((url) => safeRevokeObjectUrl(url));
}

function revokeAniObjectUrlsNotRetained(
  ani: AniData | null,
  retainedSnapshots: StudioSnapshot[]
) {
  if (!ani) return;

  const candidateUrls = new Set<string>();
  collectAniObjectUrls(ani, candidateUrls);
  const retainedUrls = collectSnapshotsObjectUrls(retainedSnapshots);

  candidateUrls.forEach((url) => {
    if (!retainedUrls.has(url)) {
      safeRevokeObjectUrl(url);
    }
  });
}

function revokeSlotRuntimeAssets(runtime: SlotRuntime | undefined) {
  if (!runtime) return;
  revokeCursorObjectUrls(runtime.cursor);
  revokeAniObjectUrls(runtime.ani);
}

function getRenderedHotspot(
  hotspotX: number,
  hotspotY: number,
  outputSize: CursorSize
) {
  return mapViewportHotspotToOutput({
    hotspotX,
    hotspotY,
    viewportSize: EDITOR_VIEWPORT_SIZE,
    outputSize,
  });
}

function loadImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = src;
  });
}

function createEmptySlotRuntime(): Record<WindowsRoleSlotId, SlotRuntime> {
  return createWindowsRoleRecord(() => ({
    cursor: null,
    ani: null,
    backgroundRemovalPending: false,
  }));
}

function createLegacyCompatibleProject() {
  const project = createCursorThemeProject();
  return {
    ...project,
    slots: attachLegacySlotAliases(project.slots),
  };
}

function getPrimaryRoleSelection() {
  return {
    selectedSlotId: DEFAULT_PRIMARY_ROLE_SLOT_ID,
    editingSlotId: DEFAULT_PRIMARY_ROLE_SLOT_ID,
  } as const;
}

function createDefaultAniFrameEdit(): AniFrameEdit {
  return { ...DEFAULT_ANI_FRAME_EDIT };
}

function getAniGlobalEdit(ani: AniData): AniFrameEdit {
  return ani.globalEdit ?? {
    fitMode: ani.fitMode,
    scale: ani.scale,
    offsetX: ani.offsetX,
    offsetY: ani.offsetY,
  };
}

function getSelectedAniFrame(ani: AniData) {
  return (
    ani.frames.find((frame) => frame.id === ani.selectedFrameId) ??
    ani.frames[0] ??
    null
  );
}

function normalizeAniFrameEditOverride(
  editOverride: AniFrameEditOverride
): AniFrameEditOverride | undefined {
  const nextEditOverride: AniFrameEditOverride = {};

  if (editOverride.fitMode !== undefined) {
    nextEditOverride.fitMode = editOverride.fitMode;
  }
  if (editOverride.scale !== undefined) {
    nextEditOverride.scale = editOverride.scale;
  }
  if (editOverride.offsetX !== undefined) {
    nextEditOverride.offsetX = editOverride.offsetX;
  }
  if (editOverride.offsetY !== undefined) {
    nextEditOverride.offsetY = editOverride.offsetY;
  }
  if (editOverride.rotation !== undefined) {
    nextEditOverride.rotation = editOverride.rotation;
  }
  if (editOverride.flipX !== undefined) {
    nextEditOverride.flipX = editOverride.flipX;
  }
  if (editOverride.flipY !== undefined) {
    nextEditOverride.flipY = editOverride.flipY;
  }

  return Object.keys(nextEditOverride).length > 0
    ? nextEditOverride
    : undefined;
}

function areAniFrameEditOverridesEqual(
  left: AniFrameEditOverride | undefined,
  right: AniFrameEditOverride | undefined
) {
  return (
    left?.fitMode === right?.fitMode &&
    left?.scale === right?.scale &&
    left?.offsetX === right?.offsetX &&
    left?.offsetY === right?.offsetY &&
    left?.rotation === right?.rotation &&
    left?.flipX === right?.flipX &&
    left?.flipY === right?.flipY
  );
}

function syncSelectedAniFrameEditOverride(
  ani: AniData,
  editOverride: AniFrameEditOverride
): AniData {
  const selectedFrame = getSelectedAniFrame(ani);
  if (!selectedFrame) {
    return ani;
  }

  const nextEditOverride = normalizeAniFrameEditOverride({
    ...selectedFrame.editOverride,
    ...editOverride,
  });

  return syncAniActiveFrame({
    ...ani,
    frames: ani.frames.map((frame) =>
      frame.id === selectedFrame.id
        ? { ...frame, editOverride: nextEditOverride }
        : frame
    ),
  });
}

function getSharedAniFrameDurationMs(ani: AniData) {
  if (ani.sourceKind !== "image-sequence" || ani.frames.length === 0) {
    return undefined;
  }

  const firstDurationMs = clampAniFrameDuration(ani.frames[0].durationMs);
  return ani.frames.every(
    (frame) => clampAniFrameDuration(frame.durationMs) === firstDurationMs
  )
    ? firstDurationMs
    : undefined;
}

function getAniFrameDurationsMs(ani: AniData) {
  if (ani.sourceKind !== "image-sequence" || ani.frames.length === 0) {
    return undefined;
  }

  return ani.frames.map((frame) => clampAniFrameDuration(frame.durationMs));
}

function hasAniFrameSpecificEdits(ani: AniData) {
  return (
    ani.sourceKind === "image-sequence" &&
    ani.frames.some((frame) => {
      const override = frame.editOverride;
      return Boolean(
        override &&
          (override.fitMode !== undefined ||
            override.scale !== undefined ||
            override.offsetX !== undefined ||
            override.offsetY !== undefined ||
            override.rotation !== undefined ||
            override.flipX !== undefined ||
            override.flipY !== undefined ||
            hasNonDefaultImageTransform(override))
      );
    })
  );
}

async function renderAniFramesForExport(ani: AniData) {
  if (ani.sourceKind !== "image-sequence") {
    return [];
  }

  return Promise.all(
    ani.frames.map(async (frame) => {
      const edit = resolveAniFrameEdit(getAniGlobalEdit(ani), frame);
      const renderResult = await rasterizeSquarePng({
        imageUrl: frame.url,
        sourceWidth: frame.sourceWidth,
        sourceHeight: frame.sourceHeight,
        fitMode: edit.fitMode,
        scale: edit.scale,
        offsetX: edit.offsetX,
        offsetY: edit.offsetY,
        rotation: edit.rotation,
        flipX: edit.flipX,
        flipY: edit.flipY,
        outputSize: ani.cursorSize,
        hotspotX: ani.hotspotX,
        hotspotY: ani.hotspotY,
        editorViewportSize: EDITOR_VIEWPORT_SIZE,
      });

      return renderResult.blob;
    })
  );
}

function clampFrameInsertionIndex(index: number, frameCount: number) {
  if (!Number.isFinite(index)) {
    return frameCount;
  }

  return Math.min(frameCount, Math.max(0, Math.round(index)));
}

function reorderAniFramesToInsertionIndex(
  frames: readonly AniFrameData[],
  frameId: string,
  insertionIndex: number
) {
  const currentIndex = frames.findIndex((frame) => frame.id === frameId);
  if (currentIndex === -1) {
    return null;
  }

  const clampedInsertionIndex = clampFrameInsertionIndex(
    insertionIndex,
    frames.length
  );
  if (
    clampedInsertionIndex === currentIndex ||
    clampedInsertionIndex === currentIndex + 1
  ) {
    return null;
  }

  const nextFrames = [...frames];
  const [movedFrame] = nextFrames.splice(currentIndex, 1);
  if (!movedFrame) {
    return null;
  }

  const adjustedInsertionIndex =
    clampedInsertionIndex > currentIndex
      ? clampedInsertionIndex - 1
      : clampedInsertionIndex;
  nextFrames.splice(
    clampFrameInsertionIndex(adjustedInsertionIndex, nextFrames.length),
    0,
    movedFrame
  );

  return nextFrames;
}

function assignUniqueAniFrameIds(
  frames: AniFrameData[],
  existingFrameIds: ReadonlySet<string>
) {
  const usedFrameIds = new Set(existingFrameIds);

  return frames.map((frame) => {
    let nextId = frame.id;
    let suffix = 2;

    while (usedFrameIds.has(nextId)) {
      nextId = `${frame.id}-${suffix}`;
      suffix += 1;
    }

    usedFrameIds.add(nextId);
    return nextId === frame.id ? frame : { ...frame, id: nextId };
  });
}

function syncAniActiveFrame(ani: AniData): AniData {
  const globalEdit = getAniGlobalEdit(ani);

  if (ani.sourceKind !== "image-sequence") {
    return {
      ...ani,
      selectedFrameId: null,
      globalEdit,
      fitMode: globalEdit.fitMode,
      scale: globalEdit.scale,
      offsetX: globalEdit.offsetX,
      offsetY: globalEdit.offsetY,
      rotation: globalEdit.rotation,
      flipX: globalEdit.flipX,
      flipY: globalEdit.flipY,
    };
  }

  const selectedFrame = getSelectedAniFrame(ani);
  const activeEdit = selectedFrame
    ? resolveAniFrameEdit(globalEdit, selectedFrame)
    : globalEdit;

  return {
    ...ani,
    selectedFrameId: selectedFrame?.id ?? null,
    originalFile: selectedFrame?.file ?? ani.originalFile,
    originalUrl: selectedFrame?.url ?? ani.originalUrl,
    sourceWidth: selectedFrame?.sourceWidth ?? ani.sourceWidth,
    sourceHeight: selectedFrame?.sourceHeight ?? ani.sourceHeight,
    globalEdit,
    fitMode: activeEdit.fitMode,
    scale: activeEdit.scale,
    offsetX: activeEdit.offsetX,
    offsetY: activeEdit.offsetY,
    rotation: activeEdit.rotation,
    flipX: activeEdit.flipX,
    flipY: activeEdit.flipY,
  };
}

function syncAniGlobalEdit(ani: AniData, globalEdit: AniFrameEdit): AniData {
  return syncAniActiveFrame({
    ...ani,
    globalEdit,
  });
}

async function loadAniFrameDimensions(
  frames: AniFrameData[],
  firstFrameDimensions: { width: number; height: number },
  isActive: () => boolean
) {
  const hydratedFrames: AniFrameData[] = [];

  for (const [index, frame] of frames.entries()) {
    const dimensions =
      index === 0 ? firstFrameDimensions : await loadImageDimensions(frame.url);

    if (!isActive()) {
      return null;
    }

    hydratedFrames.push({
      ...frame,
      sourceWidth: dimensions.width,
      sourceHeight: dimensions.height,
    });
  }

  return hydratedFrames;
}

function createCursorFromFile(
  file: File,
  slotId: WindowsRoleSlotId
): CursorData {
  const url = URL.createObjectURL(file);
  const renderedHotspot = getRenderedHotspot(0, 0, 32);
  const imageTransform = createDefaultImageTransform();

  return {
    originalFile: file,
    originalUrl: url,
    processedUrl: url,
    processedBlob: file,
    sourceWidth: 0,
    sourceHeight: 0,
    hotspotX: 0,
    hotspotY: 0,
    hotspotMode: "auto",
    renderedHotspotX: renderedHotspot.x,
    renderedHotspotY: renderedHotspot.y,
    renderedBlob: null,
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    ...imageTransform,
    fitMode: "contain",
    cursorSize: 32,
    cursorName: getDefaultCursorNameForSlot(slotId),
  };
}

function createAniFromFile(
  file: File,
  slotId: WindowsRoleSlotId,
  sourceWidth = 0,
  sourceHeight = 0
): AniData {
  const globalEdit = createDefaultAniFrameEdit();

  return {
    originalFile: file,
    originalUrl: URL.createObjectURL(file),
    sourceKind: "gif",
    frames: [],
    selectedFrameId: null,
    globalEdit,
    sourceWidth,
    sourceHeight,
    hotspotX: 0,
    hotspotY: 0,
    hotspotMode: "auto",
    offsetX: globalEdit.offsetX,
    offsetY: globalEdit.offsetY,
    scale: globalEdit.scale,
    rotation: globalEdit.rotation,
    flipX: globalEdit.flipX,
    flipY: globalEdit.flipY,
    fitMode: globalEdit.fitMode,
    cursorSize: 32,
    cursorName: getDefaultCursorNameForSlot(slotId),
  };
}

function createAniFromImageSequenceFiles(
  files: File[],
  slotId: WindowsRoleSlotId
): AniData {
  return createAniFromFrameFiles(
    files.map((file) => ({ file })),
    slotId
  );
}

function createAniFromExtractedGifFrames(
  extractedGif: ExtractedGifFrameSequence,
  slotId: WindowsRoleSlotId
): AniData {
  return createAniFromFrameFiles(
    extractedGif.frames,
    slotId,
    {
      preserveOrder: true,
      sourceWidth: extractedGif.width,
      sourceHeight: extractedGif.height,
    }
  );
}

function createAniFromExtractedVideoFrames(
  extractedVideo: ExtractedVideoFrameSequence,
  slotId: WindowsRoleSlotId
): AniData {
  if (extractedVideo.frames.length === 0) {
    throw new Error("Video did not contain any frames");
  }

  return createAniFromFrameFiles(extractedVideo.frames, slotId, {
    preserveOrder: true,
    sourceWidth: extractedVideo.width,
    sourceHeight: extractedVideo.height,
  });
}

function buildTransparentFrameFileName(fileName: string) {
  const renamed = fileName.replace(/\.png$/i, "-transparent.png");
  return renamed === fileName ? `${fileName}-transparent.png` : renamed;
}

function createAniFromFrameFiles(
  frameInputs: Array<{
    file: File;
    durationMs?: number;
  }>,
  slotId: WindowsRoleSlotId,
  options: {
    preserveOrder?: boolean;
    sourceWidth?: number;
    sourceHeight?: number;
  } = {}
): AniData {
  const files = frameInputs.map((frame) => frame.file);
  const frames = createAniFramesFromFiles(files, {
    preserveOrder: options.preserveOrder,
    getDurationMs: (_file, index) => frameInputs[index]?.durationMs,
  }).map((frame) => ({
    ...frame,
    sourceWidth: options.sourceWidth ?? 0,
    sourceHeight: options.sourceHeight ?? 0,
  }));
  const firstFrame = frames[0];
  const globalEdit = createDefaultAniFrameEdit();

  return syncAniActiveFrame({
    originalFile: firstFrame.file,
    originalUrl: firstFrame.url,
    sourceKind: "image-sequence",
    frames,
    selectedFrameId: firstFrame.id,
    globalEdit,
    sourceWidth: 0,
    sourceHeight: 0,
    hotspotX: 0,
    hotspotY: 0,
    hotspotMode: "auto",
    offsetX: globalEdit.offsetX,
    offsetY: globalEdit.offsetY,
    scale: globalEdit.scale,
    rotation: globalEdit.rotation,
    flipX: globalEdit.flipX,
    flipY: globalEdit.flipY,
    fitMode: globalEdit.fitMode,
    cursorSize: 32,
    cursorName: getDefaultCursorNameForSlot(slotId),
  });
}

async function createAniFromAnimatedFile(
  file: File,
  slotId: WindowsRoleSlotId
) {
  try {
    const extractedGif = await extractGifFrameFiles(file);
    if (extractedGif.frames.length >= 2) {
      return createAniFromExtractedGifFrames(extractedGif, slotId);
    }
  } catch {
    // Keep the legacy GIF path as a safety net if browser-side decoding fails.
  }

  return createAniFromFile(file, slotId);
}

async function createCursorExportBlob(
  cursor: CursorData,
  packageFormat: "zip" | "raw" = "zip"
) {
  const renderResult =
    cursor.renderedBlob !== null
      ? null
      : await rasterizeSquarePng({
          imageUrl: cursor.processedUrl,
          sourceWidth: cursor.sourceWidth,
          sourceHeight: cursor.sourceHeight,
          fitMode: cursor.fitMode,
          scale: cursor.scale,
          offsetX: cursor.offsetX,
          offsetY: cursor.offsetY,
          rotation: cursor.rotation,
          flipX: cursor.flipX,
          flipY: cursor.flipY,
          outputSize: cursor.cursorSize,
          hotspotX: cursor.hotspotX,
          hotspotY: cursor.hotspotY,
          editorViewportSize: EDITOR_VIEWPORT_SIZE,
        });
  const pngBlob = cursor.renderedBlob ?? renderResult?.blob ?? cursor.processedBlob;
  const renderedHotspot =
    cursor.renderedBlob !== null
      ? {
          x: cursor.renderedHotspotX,
          y: cursor.renderedHotspotY,
        }
      : renderResult
        ? {
            x: renderResult.hotspotX,
            y: renderResult.hotspotY,
          }
        : getRenderedHotspot(cursor.hotspotX, cursor.hotspotY, cursor.cursorSize);

  return generateCursor(
    pngBlob,
    renderedHotspot.x,
    renderedHotspot.y,
    cursor.cursorSize,
    cursor.cursorName,
    packageFormat
  );
}

async function createAniExportDownload(ani: AniData): Promise<BinaryDownloadResponse> {
  const edit = ani.sourceKind === "image-sequence" ? getAniGlobalEdit(ani) : ani;
  const renderedHotspot = mapViewportHotspotToOutput({
    hotspotX: ani.hotspotX,
    hotspotY: ani.hotspotY,
    viewportSize: EDITOR_VIEWPORT_SIZE,
    outputSize: ani.cursorSize,
  });
  const input = {
    aniName: ani.cursorName,
    hotspotX: renderedHotspot.x,
    hotspotY: renderedHotspot.y,
    cursorSize: ani.cursorSize,
    fitMode: edit.fitMode,
    offsetX: edit.offsetX,
    offsetY: edit.offsetY,
    scale: edit.scale,
    rotation: edit.rotation,
    flipX: edit.flipX,
    flipY: edit.flipY,
  };

  if (ani.sourceKind === "image-sequence") {
    const sharedDurationMs = getSharedAniFrameDurationMs(ani);
    const frameDurationsMs = getAniFrameDurationsMs(ani);
    const renderedFrames = hasAniFrameSpecificEdits(ani)
      ? await renderAniFramesForExport(ani)
      : null;
    const sequenceInput = renderedFrames
      ? {
          ...input,
          fitMode: "contain" as const,
          offsetX: 0,
          offsetY: 0,
          scale: 1,
          rotation: 0 as const,
          flipX: false,
          flipY: false,
        }
      : input;

    return generateAniSequence(
      renderedFrames ?? ani.frames.map((frame) => frame.file),
      typeof sharedDurationMs === "number"
        ? {
            ...sequenceInput,
            durationMs: sharedDurationMs,
            frameDurationsMs,
          }
        : { ...sequenceInput, frameDurationsMs }
    );
  }

  return generateAni(ani.originalFile, input);
}

async function createGifExportDownload(
  ani: AniData
): Promise<BinaryDownloadResponse> {
  if (ani.sourceKind !== "image-sequence") {
    throw new Error("GIF export requires editable image sequence frames.");
  }

  const edit = getAniGlobalEdit(ani);
  const sharedDurationMs = getSharedAniFrameDurationMs(ani);
  const frameDurationsMs = getAniFrameDurationsMs(ani);
  const input = {
    aniName: ani.cursorName,
    cursorSize: ani.cursorSize,
    fitMode: edit.fitMode,
    offsetX: edit.offsetX,
    offsetY: edit.offsetY,
    scale: edit.scale,
    rotation: edit.rotation,
    flipX: edit.flipX,
    flipY: edit.flipY,
  };
  const renderedFrames = hasAniFrameSpecificEdits(ani)
    ? await renderAniFramesForExport(ani)
    : null;
  const sequenceInput = renderedFrames
    ? {
        ...input,
        fitMode: "contain" as const,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        rotation: 0 as const,
        flipX: false,
        flipY: false,
      }
    : input;

  return generateGifSequence(
    renderedFrames ?? ani.frames.map((frame) => frame.file),
    typeof sharedDurationMs === "number"
      ? { ...sequenceInput, durationMs: sharedDurationMs, frameDurationsMs }
      : { ...sequenceInput, frameDurationsMs }
  );
}

function buildWindowsRoleGifFilename(slotId: WindowsRoleSlotId) {
  return `pointint_${getDefaultCursorNameForSlot(slotId)}.gif`;
}

function getDownloadErrorMessage(err: unknown, fallback: string) {
  const message = err instanceof Error ? err.message : "";
  if (err instanceof TypeError || /failed to fetch/i.test(message)) {
    return "Backend connection failed. Start or redeploy the backend, then try again.";
  }
  if (/404|not found/i.test(message)) {
    return "Export endpoint is missing. Redeploy the backend and try again.";
  }

  return message || fallback;
}

function toSlotAssetUrl(cursor: CursorData) {
  return cursor.renderedBlob ? cursor.processedUrl : cursor.processedUrl;
}

function safeRevokeObjectUrl(url: string) {
  if (typeof URL.revokeObjectURL === "function") {
    URL.revokeObjectURL(url);
  }
}

function createSlotStateUpdate(
  kind: SlotKind,
  asset: SlotStateUpdate["asset"],
  editing: SlotStateUpdate["editing"],
  runtime: SlotRuntime
): SlotStateUpdate {
  return {
    kind,
    asset,
    editing,
    runtime,
  };
}

function createStaticSlotState(
  nextCursor: CursorData,
  backgroundRemovalPending = false
): SlotStateUpdate {
  return createSlotStateUpdate(
    "static",
    {
      fileName: nextCursor.originalFile.name,
      originalUrl: nextCursor.originalUrl,
      previewUrl: toSlotAssetUrl(nextCursor),
    },
    {
      cursorName: nextCursor.cursorName,
      cursorSize: nextCursor.cursorSize,
      fitMode: nextCursor.fitMode,
      hotspotMode: nextCursor.hotspotMode,
      hotspotX: nextCursor.hotspotX,
      hotspotY: nextCursor.hotspotY,
      offsetX: nextCursor.offsetX,
      offsetY: nextCursor.offsetY,
      scale: nextCursor.scale,
      rotation: nextCursor.rotation,
      flipX: nextCursor.flipX,
      flipY: nextCursor.flipY,
    },
    { cursor: nextCursor, ani: null, backgroundRemovalPending }
  );
}

function createAnimatedSlotState(nextAni: AniData): SlotStateUpdate {
  const edit =
    nextAni.sourceKind === "image-sequence" ? getAniGlobalEdit(nextAni) : nextAni;

  return createSlotStateUpdate(
    "animated",
    {
      fileName: nextAni.originalFile.name,
      originalUrl: nextAni.originalUrl,
      previewUrl: nextAni.originalUrl,
    },
    {
      cursorName: nextAni.cursorName,
      cursorSize: nextAni.cursorSize,
      fitMode: edit.fitMode,
      hotspotMode: nextAni.hotspotMode,
      hotspotX: nextAni.hotspotX,
      hotspotY: nextAni.hotspotY,
      offsetX: edit.offsetX,
      offsetY: edit.offsetY,
      scale: edit.scale,
      rotation: edit.rotation,
      flipX: edit.flipX,
      flipY: edit.flipY,
    },
    { cursor: null, ani: nextAni, backgroundRemovalPending: false }
  );
}

function applySlotStateUpdate(
  project: CursorThemeProject,
  slotRuntime: Record<WindowsRoleSlotId, SlotRuntime>,
  slotId: WindowsRoleSlotId,
  nextSlotState: SlotStateUpdate
) {
  const slots = attachLegacySlotAliases({
    ...project.slots,
    [slotId]: {
      ...project.slots[slotId],
      kind: nextSlotState.kind,
      asset: nextSlotState.asset,
      editing: nextSlotState.editing,
    },
  });

  return {
    project: {
      ...project,
      slots,
    },
    slotRuntime: {
      ...slotRuntime,
      [slotId]: nextSlotState.runtime,
    },
  };
}

function cloneAniWithFreshFrameUrls(ani: AniData): AniData {
  if (ani.sourceKind !== "image-sequence") {
    return ani;
  }

  return syncAniActiveFrame({
    ...ani,
    frames: ani.frames.map((frame) => ({
      ...frame,
      url: URL.createObjectURL(frame.file),
    })),
  });
}

function replaceSnapshotAni(
  snapshot: StudioSnapshot,
  slotId: WindowsRoleSlotId,
  nextAni: AniData
): StudioSnapshot {
  const synced = applySlotStateUpdate(
    snapshot.project,
    snapshot.slotRuntime,
    slotId,
    createAnimatedSlotState(nextAni)
  );

  return {
    ...snapshot,
    ...synced,
    ani: snapshot.selectedSlotId === slotId ? nextAni : snapshot.ani,
  };
}

function prepareImageSequenceReplacementSnapshot(
  snapshot: StudioSnapshot,
  slotId: WindowsRoleSlotId
) {
  const replacedAni = snapshot.slotRuntime[slotId]?.ani;

  if (replacedAni?.sourceKind !== "image-sequence") {
    return {
      historySnapshot: snapshot,
      replacedAni: null,
    };
  }

  return {
    historySnapshot: replaceSnapshotAni(
      snapshot,
      slotId,
      cloneAniWithFreshFrameUrls(replacedAni)
    ),
    replacedAni,
  };
}

function finalizeStudioSnapshot(snapshot: StudioSnapshot): StudioSnapshot {
  if (
    snapshot.cursor &&
    (snapshot.state === "editing" ||
      snapshot.state === "uploaded" ||
      snapshot.state === "processing")
  ) {
    const synced = applySlotStateUpdate(
      snapshot.project,
      snapshot.slotRuntime,
      snapshot.selectedSlotId,
      createStaticSlotState(
        snapshot.cursor,
        isBackgroundRemovalDecisionState(snapshot.state)
      )
    );

    return {
      ...snapshot,
      ...synced,
    };
  }

  if (snapshot.ani && snapshot.state === "ani-editing") {
    const synced = applySlotStateUpdate(
      snapshot.project,
      snapshot.slotRuntime,
      snapshot.selectedSlotId,
      createAnimatedSlotState(snapshot.ani)
    );

    return {
      ...snapshot,
      ...synced,
    };
  }

  return snapshot;
}

function isBackgroundRemovalDecisionState(state: StudioState) {
  return state === "uploaded" || state === "processing";
}

function isUndoSessionState(state: StudioState) {
  return state === "editing" || state === "ani-editing";
}

function transformViewportHotspotForAction(
  hotspotX: number,
  hotspotY: number,
  action: ImageTransformAction,
  edit: Pick<AniFrameEdit, "offsetX" | "offsetY">
) {
  const centerX = EDITOR_VIEWPORT_SIZE / 2 + edit.offsetX;
  const centerY = EDITOR_VIEWPORT_SIZE / 2 + edit.offsetY;
  const dx = hotspotX - centerX;
  const dy = hotspotY - centerY;

  switch (action) {
    case "rotate-clockwise":
      return {
        x: clampViewportCoordinate(centerX + dy),
        y: clampViewportCoordinate(centerY - dx),
      };
    case "flip-horizontal":
      return {
        x: clampViewportCoordinate(centerX - dx),
        y: clampViewportCoordinate(hotspotY),
      };
    case "flip-vertical":
      return {
        x: clampViewportCoordinate(hotspotX),
        y: clampViewportCoordinate(centerY - dy),
      };
  }
}

function clampViewportCoordinate(value: number) {
  return Math.min(
    EDITOR_VIEWPORT_SIZE - 1,
    Math.max(0, Math.round(value))
  );
}

function matchesUndoSession(
  snapshot: StudioSnapshot,
  current: StudioSnapshot
) {
  if (
    current.state === "editing" &&
    current.cursor &&
    snapshot.state === "editing"
  ) {
    return (
      snapshot.selectedSlotId === current.selectedSlotId &&
      Boolean(snapshot.cursor)
    );
  }

  if (
    current.state === "ani-editing" &&
    current.ani &&
    snapshot.state === "ani-editing"
  ) {
    return (
      snapshot.selectedSlotId === current.selectedSlotId &&
      Boolean(snapshot.ani)
    );
  }

  return false;
}

function popMatchingHistorySnapshot(
  stack: StudioSnapshot[],
  current: StudioSnapshot
) {
  while (stack.length > 0) {
    const snapshot = stack.pop();
    if (snapshot && matchesUndoSession(snapshot, current)) {
      return snapshot;
    }
  }

  return null;
}

function hasMatchingHistorySnapshot(
  stack: StudioSnapshot[],
  current: StudioSnapshot
) {
  return stack.some((snapshot) => matchesUndoSession(snapshot, current));
}

function collectCursorObjectUrls(cursor: CursorData | null, urls: Set<string>) {
  if (!cursor) return;
  if (cursor.originalUrl) {
    urls.add(cursor.originalUrl);
  }
  if (cursor.processedUrl && cursor.processedUrl !== cursor.originalUrl) {
    urls.add(cursor.processedUrl);
  }
}

function collectAniObjectUrls(ani: AniData | null, urls: Set<string>) {
  if (!ani) return;
  if (ani.originalUrl) {
    urls.add(ani.originalUrl);
  }
  ani.frames.forEach((frame) => urls.add(frame.url));
}

function collectSnapshotObjectUrls(snapshot: StudioSnapshot, urls: Set<string>) {
  collectCursorObjectUrls(snapshot.cursor, urls);
  collectAniObjectUrls(snapshot.ani, urls);

  Object.values(snapshot.slotRuntime).forEach((runtime) => {
    collectCursorObjectUrls(runtime.cursor, urls);
    collectAniObjectUrls(runtime.ani, urls);
  });
}

function collectSnapshotsObjectUrls(snapshots: StudioSnapshot[]) {
  const urls = new Set<string>();
  snapshots.forEach((snapshot) => collectSnapshotObjectUrls(snapshot, urls));
  return urls;
}

function revokeDroppedSnapshotObjectUrls(
  droppedSnapshots: StudioSnapshot[],
  retainedSnapshots: StudioSnapshot[]
) {
  if (droppedSnapshots.length === 0) return;

  const droppedUrls = collectSnapshotsObjectUrls(droppedSnapshots);
  const retainedUrls = collectSnapshotsObjectUrls(retainedSnapshots);

  droppedUrls.forEach((url) => {
    if (!retainedUrls.has(url)) {
      safeRevokeObjectUrl(url);
    }
  });
}

export function useStudio() {
  const [state, setState] = useState<StudioState>("editing");
  const [project, setProject] = useState<CursorThemeProject>(() =>
    createLegacyCompatibleProject()
  );
  const [slotRuntime, setSlotRuntime] = useState<
    Record<WindowsRoleSlotId, SlotRuntime>
  >(
    () => createEmptySlotRuntime()
  );
  const [selectedSlotId, setSelectedSlotId] = useState<WindowsRoleSlotId>(
    getPrimaryRoleSelection().selectedSlotId
  );
  const [editingSlotId, setEditingSlotId] = useState<WindowsRoleSlotId>(
    getPrimaryRoleSelection().editingSlotId
  );
  const [cursor, setCursor] = useState<CursorData | null>(null);
  const [ani, setAni] = useState<AniData | null>(null);
  const [pendingAniBackgroundDecision, setPendingAniBackgroundDecision] =
    useState<PendingAniBackgroundDecision | null>(null);
  const [aniBackgroundProgress, setAniBackgroundProgress] =
    useState<AniBackgroundProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [downloadGuideVariant, setDownloadGuideVariant] =
    useState<DownloadGuideVariant>("package");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const undoStackRef = useRef<StudioSnapshot[]>([]);
  const redoStackRef = useRef<StudioSnapshot[]>([]);
  const activeHistoryActionRef = useRef<HistoryActionKey | null>(null);
  const assetLoadRequestIdRef = useRef(0);
  const bgRemovalRequestIdRef = useRef(0);
  const bgRemovalInFlightRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const selectedSlot = project.slots[selectedSlotId];
  const selectedSlotRuntime = slotRuntime[selectedSlotId];
  const selectedSlotBound = Boolean(
    selectedSlot.asset.originalUrl ||
      selectedSlot.asset.previewUrl ||
      selectedSlotRuntime.cursor ||
      selectedSlotRuntime.ani
  );
  const pendingBackgroundRemovalSlotIds = WINDOWS_ROLE_SLOT_IDS.filter(
    (slotId) =>
      slotRuntime[slotId].backgroundRemovalPending ||
      (slotId === selectedSlotId && isBackgroundRemovalDecisionState(state))
  );
  const canDownloadAll = WINDOWS_ROLE_SLOT_IDS.some(
    (slotId) => project.slots[slotId].kind !== null
  ) && pendingBackgroundRemovalSlotIds.length === 0;
  const canDownload = Boolean(
    (state === "editing" || state === "ani-editing") && selectedSlotBound
  );
  const canDownloadGif = Boolean(
    state === "ani-editing" &&
      ani?.sourceKind === "image-sequence" &&
      ani.frames.length >= 2
  );
  const liveStateRef = useRef<StudioSnapshot>({
    state,
    project,
    slotRuntime,
    selectedSlotId,
    editingSlotId,
    cursor,
    ani,
  });
  const previewUrlRef = useRef<string | null>(previewUrl);

  liveStateRef.current = {
    state,
    project,
    slotRuntime,
    selectedSlotId,
    editingSlotId,
    cursor,
    ani,
  };
  previewUrlRef.current = previewUrl;

  const takeSnapshot = useCallback(() => {
    return finalizeStudioSnapshot(liveStateRef.current);
  }, []);

  const syncHistoryFlags = useCallback(() => {
    const current = takeSnapshot();

    if (!isUndoSessionState(current.state)) {
      setCanUndo(false);
      setCanRedo(false);
      return;
    }

    setCanUndo(hasMatchingHistorySnapshot(undoStackRef.current, current));
    setCanRedo(hasMatchingHistorySnapshot(redoStackRef.current, current));
  }, [takeSnapshot]);

  const clearPreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
  }, []);

  const pushHistory = useCallback(
    (snapshot: StudioSnapshot) => {
      const droppedRedoSnapshots = redoStackRef.current;
      undoStackRef.current.push(snapshot);
      let droppedUndoSnapshots: StudioSnapshot[] = [];

      if (undoStackRef.current.length > HISTORY_LIMIT) {
        droppedUndoSnapshots = undoStackRef.current.slice(
          0,
          undoStackRef.current.length - HISTORY_LIMIT
        );
        undoStackRef.current = undoStackRef.current.slice(-HISTORY_LIMIT);
      }

      redoStackRef.current = [];
      revokeDroppedSnapshotObjectUrls(
        [...droppedUndoSnapshots, ...droppedRedoSnapshots],
        [takeSnapshot(), ...undoStackRef.current]
      );
      syncHistoryFlags();
    },
    [syncHistoryFlags, takeSnapshot]
  );

  const clearActiveHistoryAction = useCallback(() => {
    activeHistoryActionRef.current = null;
  }, []);

  const cancelBgRemovalRequest = useCallback(() => {
    bgRemovalRequestIdRef.current += 1;
    bgRemovalInFlightRef.current = false;
  }, []);

  const beginAssetLoadRequest = useCallback(() => {
    assetLoadRequestIdRef.current += 1;
    return assetLoadRequestIdRef.current;
  }, []);

  const cancelAssetLoadRequest = useCallback(() => {
    assetLoadRequestIdRef.current += 1;
  }, []);

  const isAssetLoadRequestActive = useCallback(
    (requestId: number) => requestId === assetLoadRequestIdRef.current,
    []
  );

  const pushHistoryForAction = useCallback(
    (
      snapshot: StudioSnapshot,
      action: HistoryActionKey,
      options?: { coalesce?: boolean }
    ) => {
      if (options?.coalesce && activeHistoryActionRef.current === action) {
        return;
      }

      pushHistory(snapshot);
      activeHistoryActionRef.current = action;
    },
    [pushHistory]
  );

  const applySnapshot = useCallback(
    (snapshot: StudioSnapshot) => {
      cancelBgRemovalRequest();
      cancelAssetLoadRequest();
      clearActiveHistoryAction();
      setPreviewUrl((prev) => {
        if (prev) {
          safeRevokeObjectUrl(prev);
        }

        if (
          snapshot.cursor?.renderedBlob &&
          (snapshot.state === "editing" ||
            snapshot.state === "uploaded" ||
            snapshot.state === "processing")
        ) {
          return URL.createObjectURL(snapshot.cursor.renderedBlob);
        }

        return null;
      });
      setState(snapshot.state);
      setProject(snapshot.project);
      setSlotRuntime(snapshot.slotRuntime);
      setSelectedSlotId(snapshot.selectedSlotId);
      setEditingSlotId(snapshot.editingSlotId);
      setCursor(snapshot.cursor);
      setAni(snapshot.ani);
      setError(null);
      setShowOriginal(false);
    },
    [cancelAssetLoadRequest, cancelBgRemovalRequest, clearActiveHistoryAction]
  );

  const undo = useCallback(() => {
    const current = takeSnapshot();
    const previous = popMatchingHistorySnapshot(undoStackRef.current, current);
    if (!previous) {
      syncHistoryFlags();
      return;
    }

    redoStackRef.current.push(current);
    let droppedRedoSnapshots: StudioSnapshot[] = [];
    if (redoStackRef.current.length > HISTORY_LIMIT) {
      droppedRedoSnapshots = redoStackRef.current.slice(
        0,
        redoStackRef.current.length - HISTORY_LIMIT
      );
      redoStackRef.current = redoStackRef.current.slice(-HISTORY_LIMIT);
    }
    revokeDroppedSnapshotObjectUrls(droppedRedoSnapshots, [
      previous,
      ...undoStackRef.current,
      ...redoStackRef.current,
    ]);

    applySnapshot(previous);
    syncHistoryFlags();
  }, [applySnapshot, syncHistoryFlags, takeSnapshot]);

  const redo = useCallback(() => {
    const current = takeSnapshot();
    const next = popMatchingHistorySnapshot(redoStackRef.current, current);
    if (!next) {
      syncHistoryFlags();
      return;
    }

    undoStackRef.current.push(current);
    let droppedUndoSnapshots: StudioSnapshot[] = [];
    if (undoStackRef.current.length > HISTORY_LIMIT) {
      droppedUndoSnapshots = undoStackRef.current.slice(
        0,
        undoStackRef.current.length - HISTORY_LIMIT
      );
      undoStackRef.current = undoStackRef.current.slice(-HISTORY_LIMIT);
    }
    revokeDroppedSnapshotObjectUrls(droppedUndoSnapshots, [
      next,
      ...undoStackRef.current,
      ...redoStackRef.current,
    ]);

    applySnapshot(next);
    syncHistoryFlags();
  }, [applySnapshot, syncHistoryFlags, takeSnapshot]);

  const cleanupSlotReplacement = useCallback(
    (_slotId: WindowsRoleSlotId) => {},
    []
  );

  const commitSlotState = useCallback(
    (slotId: WindowsRoleSlotId, nextSlotState: SlotStateUpdate) => {
      setSlotRuntime((prev) =>
        applySlotStateUpdate(
          project,
          prev,
          slotId,
          nextSlotState
        ).slotRuntime
      );

      setProject((prev) =>
        applySlotStateUpdate(
          prev,
          slotRuntime,
          slotId,
          nextSlotState
        ).project
      );
    },
    [project, slotRuntime]
  );

  const uploadFileToSlot = useCallback(
    async (slotId: WindowsRoleSlotId, file: File, kind: SlotKind) => {
      trackEvent("upload_started", {
        input_kind: kind === "static" ? "static_image" : "animated_gif",
        slot_id: slotId,
        source: "studio",
      });

      const requestId = beginAssetLoadRequest();
      const previous = takeSnapshot();
      clearActiveHistoryAction();
      setError(null);
      setPendingAniBackgroundDecision(null);
      setAniBackgroundProgress(null);
      cleanupSlotReplacement(slotId);
      clearPreview();
      cancelBgRemovalRequest();

      if (kind === "static") {
        const nextCursor = createCursorFromFile(file, slotId);

        try {
          const dimensions = await loadImageDimensions(nextCursor.originalUrl);
          if (!isAssetLoadRequestActive(requestId)) {
            revokeCursorObjectUrls(nextCursor);
            return;
          }

          const hydratedCursor = {
            ...nextCursor,
            sourceWidth: dimensions.width,
            sourceHeight: dimensions.height,
          };

          const { historySnapshot, replacedAni } =
            prepareImageSequenceReplacementSnapshot(previous, slotId);

          pushHistoryForAction(historySnapshot, "replaceSlot");
          setCursor(hydratedCursor);
          setAni(null);
          commitSlotState(slotId, createStaticSlotState(hydratedCursor, true));
          setState("uploaded");
          if (replacedAni?.sourceKind === "image-sequence") {
            revokeAniObjectUrlsNotRetained(replacedAni, [
              ...undoStackRef.current,
              ...redoStackRef.current,
            ]);
          }
        } catch (err) {
          revokeCursorObjectUrls(nextCursor);
          if (!isAssetLoadRequestActive(requestId)) return;
          setError(err instanceof Error ? err.message : "Failed to load image");
        }
        return;
      }

      const nextAni = await createAniFromAnimatedFile(file, slotId);

      try {
        let hydratedAni: AniData;

        if (
          nextAni.sourceKind === "image-sequence" &&
          nextAni.frames.every(
            (frame) => frame.sourceWidth > 0 && frame.sourceHeight > 0
          )
        ) {
          hydratedAni = syncAniActiveFrame(nextAni);
        } else if (nextAni.sourceKind === "image-sequence") {
          const dimensions = await loadImageDimensions(nextAni.originalUrl);
          if (!isAssetLoadRequestActive(requestId)) {
            revokeAniObjectUrls(nextAni);
            return;
          }

          const hydratedFrames = await loadAniFrameDimensions(
            nextAni.frames,
            dimensions,
            () => isAssetLoadRequestActive(requestId)
          );

          if (!hydratedFrames) {
            revokeAniObjectUrls(nextAni);
            return;
          }

          hydratedAni = syncAniActiveFrame({
            ...nextAni,
            frames: hydratedFrames,
          });
        } else {
          const dimensions = await loadImageDimensions(nextAni.originalUrl);
          if (!isAssetLoadRequestActive(requestId)) {
            revokeAniObjectUrls(nextAni);
            return;
          }

          hydratedAni = syncAniActiveFrame({
            ...nextAni,
            sourceWidth: dimensions.width,
            sourceHeight: dimensions.height,
          });
        }

        const { historySnapshot, replacedAni } =
          prepareImageSequenceReplacementSnapshot(previous, slotId);

        pushHistoryForAction(historySnapshot, "replaceSlot");
        setCursor(null);
        setAni(hydratedAni);
        commitSlotState(slotId, createAnimatedSlotState(hydratedAni));
        setState("ani-editing");
        if (replacedAni?.sourceKind === "image-sequence") {
          revokeAniObjectUrlsNotRetained(replacedAni, [
            ...undoStackRef.current,
            ...redoStackRef.current,
          ]);
        }
      } catch (err) {
        revokeAniObjectUrls(nextAni);
        if (!isAssetLoadRequestActive(requestId)) return;
        setError(err instanceof Error ? err.message : "Failed to load GIF");
        setState("editing");
      }
    },
    [
      cleanupSlotReplacement,
      clearPreview,
      commitSlotState,
      clearActiveHistoryAction,
      pushHistoryForAction,
      takeSnapshot,
      cancelBgRemovalRequest,
      beginAssetLoadRequest,
      isAssetLoadRequestActive,
    ]
  );

  const uploadImageSequenceFilesToSlot = useCallback(
    async (slotId: WindowsRoleSlotId, files: File[]) => {
      if (files.length === 0) return;

      trackEvent("upload_started", {
        file_count: files.length,
        input_kind: "image_sequence",
        slot_id: slotId,
        source: "studio",
      });

      const requestId = beginAssetLoadRequest();
      const previous = takeSnapshot();
      clearActiveHistoryAction();
      setError(null);
      setPendingAniBackgroundDecision(null);
      setAniBackgroundProgress(null);
      cleanupSlotReplacement(slotId);
      clearPreview();
      cancelBgRemovalRequest();

      const nextAni = createAniFromImageSequenceFiles(files, slotId);

      try {
        const dimensions = await loadImageDimensions(nextAni.originalUrl);
        if (!isAssetLoadRequestActive(requestId)) {
          revokeAniObjectUrls(nextAni);
          return;
        }

        const hydratedFrames = await loadAniFrameDimensions(
          nextAni.frames,
          dimensions,
          () => isAssetLoadRequestActive(requestId)
        );

        if (!hydratedFrames) {
          revokeAniObjectUrls(nextAni);
          return;
        }

        const hydratedAni = syncAniActiveFrame({
          ...nextAni,
          frames: hydratedFrames,
        });

        const { historySnapshot, replacedAni } =
          prepareImageSequenceReplacementSnapshot(previous, slotId);

        pushHistoryForAction(historySnapshot, "replaceSlot");
        setCursor(null);
        setAni(hydratedAni);
        commitSlotState(slotId, createAnimatedSlotState(hydratedAni));
        setState("ani-editing");
        if (replacedAni?.sourceKind === "image-sequence") {
          revokeAniObjectUrlsNotRetained(replacedAni, [
            ...undoStackRef.current,
            ...redoStackRef.current,
          ]);
        }
      } catch (err) {
        revokeAniObjectUrls(nextAni);
        if (!isAssetLoadRequestActive(requestId)) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load image sequence"
        );
        setState("editing");
      }
    },
    [
      cleanupSlotReplacement,
      clearPreview,
      commitSlotState,
      clearActiveHistoryAction,
      pushHistoryForAction,
      takeSnapshot,
      cancelBgRemovalRequest,
      beginAssetLoadRequest,
      isAssetLoadRequestActive,
    ]
  );

  const commitHydratedAniSequence = useCallback(
    (
      hydratedAni: AniData,
      previous: StudioSnapshot,
      slotId: WindowsRoleSlotId
    ) => {
      const { historySnapshot, replacedAni } =
        prepareImageSequenceReplacementSnapshot(previous, slotId);

      pushHistoryForAction(historySnapshot, "replaceSlot");
      setCursor(null);
      setAni(hydratedAni);
      commitSlotState(slotId, createAnimatedSlotState(hydratedAni));
      setPendingAniBackgroundDecision(null);
      setAniBackgroundProgress(null);
      setState("ani-editing");
      if (replacedAni?.sourceKind === "image-sequence") {
        revokeAniObjectUrlsNotRetained(replacedAni, [
          ...undoStackRef.current,
          ...redoStackRef.current,
        ]);
      }
    },
    [commitSlotState, pushHistoryForAction]
  );

  const uploadVideoFileToSlot = useCallback(
    async (
      slotId: WindowsRoleSlotId,
      file: File,
      options: ExtractVideoFrameOptions = {}
    ) => {
      trackEvent("upload_started", {
        input_kind: "video",
        slot_id: slotId,
        source: "studio",
      });

      if (
        selectedSlotBound &&
        cursor &&
        (state === "editing" || isBackgroundRemovalDecisionState(state))
      ) {
        commitSlotState(
          selectedSlotId,
          createStaticSlotState(
            cursor,
            isBackgroundRemovalDecisionState(state)
          )
        );
      }

      if (selectedSlotBound && ani && state === "ani-editing") {
        commitSlotState(selectedSlotId, createAnimatedSlotState(ani));
      }

      const requestId = beginAssetLoadRequest();
      const previous = takeSnapshot();
      clearActiveHistoryAction();
      setError(null);
      setPendingAniBackgroundDecision(null);
      setAniBackgroundProgress(null);
      cleanupSlotReplacement(slotId);
      clearPreview();
      cancelBgRemovalRequest();
      setState("ani-upload");

      let nextAni: AniData | null = null;

      try {
        const extractedVideo = await extractVideoFrameFiles(file, options);
        if (!isAssetLoadRequestActive(requestId)) {
          return;
        }

        nextAni = createAniFromExtractedVideoFrames(extractedVideo, slotId);

        let hydratedAni: AniData;

        if (
          nextAni.frames.every(
            (frame) => frame.sourceWidth > 0 && frame.sourceHeight > 0
          )
        ) {
          hydratedAni = syncAniActiveFrame(nextAni);
        } else {
          const dimensions = await loadImageDimensions(nextAni.originalUrl);
          if (!isAssetLoadRequestActive(requestId)) {
            revokeAniObjectUrls(nextAni);
            return;
          }

          const hydratedFrames = await loadAniFrameDimensions(
            nextAni.frames,
            dimensions,
            () => isAssetLoadRequestActive(requestId)
          );

          if (!hydratedFrames) {
            revokeAniObjectUrls(nextAni);
            return;
          }

          hydratedAni = syncAniActiveFrame({
            ...nextAni,
            frames: hydratedFrames,
          });
        }

        setCursor(null);
        setAni(null);
        setPendingAniBackgroundDecision({
          slotId,
          ani: hydratedAni,
          previous,
        });
        setState("ani-background-decision");
      } catch (err) {
        if (nextAni) {
          revokeAniObjectUrls(nextAni);
        }
        if (!isAssetLoadRequestActive(requestId)) return;
        const message =
          err instanceof Error ? err.message : "Failed to load video";
        setPreviewUrl((prev) => {
          if (prev) {
            safeRevokeObjectUrl(prev);
          }
          return null;
        });
        setProject(previous.project);
        setSlotRuntime(previous.slotRuntime);
        setSelectedSlotId(previous.selectedSlotId);
        setEditingSlotId(previous.editingSlotId);
        setCursor(previous.cursor);
        setAni(previous.ani);
        setState(previous.state);
        setShowOriginal(false);
        setError(message);
      }
    },
    [
      ani,
      cleanupSlotReplacement,
      clearPreview,
      commitSlotState,
      cursor,
      clearActiveHistoryAction,
      takeSnapshot,
      cancelBgRemovalRequest,
      beginAssetLoadRequest,
      isAssetLoadRequestActive,
      selectedSlotBound,
      selectedSlotId,
      state,
    ]
  );

  const keepExtractedVideoBackground = useCallback(() => {
    if (!pendingAniBackgroundDecision) return;

    commitHydratedAniSequence(
      pendingAniBackgroundDecision.ani,
      pendingAniBackgroundDecision.previous,
      pendingAniBackgroundDecision.slotId
    );
  }, [commitHydratedAniSequence, pendingAniBackgroundDecision]);

  const removeExtractedVideoBackground = useCallback(async () => {
    if (!pendingAniBackgroundDecision || bgRemovalInFlightRef.current) return;

    bgRemovalInFlightRef.current = true;
    setError(null);
    setState("ani-background-processing");

    const sourceAni = pendingAniBackgroundDecision.ani;
    const total = sourceAni.frames.length;
    const cleanedUrls: string[] = [];
    setAniBackgroundProgress({ completed: 0, total });

    try {
      const cleanedFrames: AniFrameData[] = [];

      for (const [index, frame] of sourceAni.frames.entries()) {
        const removedBlob = await removeBackground(frame.file);
        const trimmedImage = await trimTransparentImageBlob(removedBlob);
        const cleanedFile = new File(
          [trimmedImage.blob],
          buildTransparentFrameFileName(frame.file.name),
          { type: "image/png" }
        );
        const cleanedUrl = URL.createObjectURL(cleanedFile);
        cleanedUrls.push(cleanedUrl);

        cleanedFrames.push({
          ...frame,
          file: cleanedFile,
          url: cleanedUrl,
          sourceWidth: trimmedImage.width,
          sourceHeight: trimmedImage.height,
        });

        setAniBackgroundProgress({ completed: index + 1, total });
      }

      const firstFrame = cleanedFrames[0];
      if (!firstFrame) {
        throw new Error("Video did not contain any frames");
      }

      const cleanedAni = syncAniActiveFrame({
        ...sourceAni,
        originalFile: firstFrame.file,
        originalUrl: firstFrame.url,
        sourceWidth: firstFrame.sourceWidth,
        sourceHeight: firstFrame.sourceHeight,
        frames: cleanedFrames,
      });

      commitHydratedAniSequence(
        cleanedAni,
        pendingAniBackgroundDecision.previous,
        pendingAniBackgroundDecision.slotId
      );
      revokeAniObjectUrls(sourceAni);
    } catch (err) {
      cleanedUrls.forEach((url) => safeRevokeObjectUrl(url));
      setError(
        err instanceof Error ? err.message : "Failed to remove backgrounds"
      );
      setAniBackgroundProgress(null);
      setState("ani-background-decision");
    } finally {
      bgRemovalInFlightRef.current = false;
    }
  }, [commitHydratedAniSequence, pendingAniBackgroundDecision]);

  const uploadFileToPrimaryRoleSlot = useCallback(
    (file: File, kind: SlotKind) =>
      uploadFileToSlot(DEFAULT_PRIMARY_ROLE_SLOT_ID, file, kind),
    [uploadFileToSlot]
  );

  const selectSlot = useCallback((slotId: WindowsRoleSlotId | LegacySlotId) => {
    const normalizedSlotId = normalizeSlotId(slotId);

    cancelAssetLoadRequest();

    if (
      selectedSlotBound &&
      cursor &&
      (state === "editing" || isBackgroundRemovalDecisionState(state))
    ) {
      commitSlotState(
        selectedSlotId,
        createStaticSlotState(
          cursor,
          isBackgroundRemovalDecisionState(state)
        )
      );
    }

    if (selectedSlotBound && ani && state === "ani-editing") {
      commitSlotState(selectedSlotId, createAnimatedSlotState(ani));
    }

    setSelectedSlotId(normalizedSlotId);
    setEditingSlotId(normalizedSlotId);

    const slot = project.slots[normalizedSlotId];
    const runtime = slotRuntime[normalizedSlotId];

      if (slot.kind === "static" && runtime.cursor) {
      cancelBgRemovalRequest();
      setPreviewUrl((prev) => {
        if (prev) {
          safeRevokeObjectUrl(prev);
        }
        return null;
      });
      setCursor(runtime.cursor);
      setAni(null);
      setState(runtime.backgroundRemovalPending ? "uploaded" : "editing");
      return;
    }

    if (slot.kind === "animated" && runtime.ani) {
      cancelBgRemovalRequest();
      setPreviewUrl((prev) => {
        if (prev) {
          safeRevokeObjectUrl(prev);
        }
        return null;
      });
      setAni(runtime.ani);
      setCursor(null);
      setState("ani-editing");
      return;
    }

    cancelBgRemovalRequest();
    setPreviewUrl((prev) => {
      if (prev) {
        safeRevokeObjectUrl(prev);
      }
      return null;
    });
    setCursor(null);
    setAni(null);
    setState("editing");
  }, [
    ani,
    cursor,
    commitSlotState,
    project.slots,
    selectedSlotBound,
    selectedSlotId,
    slotRuntime,
    state,
    cancelBgRemovalRequest,
    cancelAssetLoadRequest,
  ]);

  // UX-1: 파일 선택 후 "uploaded" 상태 (배경 제거 여부 선택 전)
  const selectFile = useCallback(
    (file: File) => uploadFileToPrimaryRoleSlot(file, "static"),
    [uploadFileToPrimaryRoleSlot]
  );

  const selectAniFile = useCallback(
    (file: File) => uploadFileToPrimaryRoleSlot(file, "animated"),
    [uploadFileToPrimaryRoleSlot]
  );

  const selectVideoFile = useCallback(
    (file: File, options?: ExtractVideoFrameOptions) =>
      uploadVideoFileToSlot(DEFAULT_PRIMARY_ROLE_SLOT_ID, file, options),
    [uploadVideoFileToSlot]
  );

  const selectSelectedSlotStaticFile = useCallback(
    (file: File) => uploadFileToSlot(selectedSlotId, file, "static"),
    [selectedSlotId, uploadFileToSlot]
  );

  const selectSelectedSlotAnimatedFile = useCallback(
    (file: File) => uploadFileToSlot(selectedSlotId, file, "animated"),
    [selectedSlotId, uploadFileToSlot]
  );

  const selectSelectedSlotImageSequenceFiles = useCallback(
    (files: File[]) => uploadImageSequenceFilesToSlot(selectedSlotId, files),
    [selectedSlotId, uploadImageSequenceFilesToSlot]
  );

  const selectSelectedSlotVideoFile = useCallback(
    (file: File, options?: ExtractVideoFrameOptions) =>
      uploadVideoFileToSlot(selectedSlotId, file, options),
    [selectedSlotId, uploadVideoFileToSlot]
  );

  const selectAniFrame = useCallback((frameId: string) => {
    if (
      state !== "ani-editing" ||
      !ani ||
      ani.sourceKind !== "image-sequence" ||
      ani.selectedFrameId === frameId
    ) {
      return;
    }

    if (!ani.frames.some((frame) => frame.id === frameId)) {
      return;
    }

    const nextAni = syncAniActiveFrame({
      ...ani,
      selectedFrameId: frameId,
    });

    pushHistoryForAction(takeSnapshot(), "aniFrameSelection");
    setAni(nextAni);
    commitSlotState(selectedSlotId, createAnimatedSlotState(nextAni));
  }, [
    ani,
    commitSlotState,
    pushHistoryForAction,
    selectedSlotId,
    state,
    takeSnapshot,
  ]);

  const deleteAniFrame = useCallback((frameId: string) => {
    if (
      state !== "ani-editing" ||
      !ani ||
      ani.sourceKind !== "image-sequence" ||
      ani.frames.length <= 2
    ) {
      return;
    }

    const frameIndex = ani.frames.findIndex((frame) => frame.id === frameId);
    if (frameIndex === -1) {
      return;
    }

    const nextFrames = ani.frames.filter((frame) => frame.id !== frameId);
    const nextSelectedFrameId =
      ani.selectedFrameId === frameId
        ? nextFrames[Math.min(frameIndex, nextFrames.length - 1)]?.id ?? null
        : ani.selectedFrameId;
    const nextAni = syncAniActiveFrame({
      ...ani,
      frames: nextFrames,
      selectedFrameId: nextSelectedFrameId,
    });

    pushHistoryForAction(takeSnapshot(), "aniFrameDelete");
    setAni(nextAni);
    commitSlotState(selectedSlotId, createAnimatedSlotState(nextAni));
  }, [
    ani,
    commitSlotState,
    pushHistoryForAction,
    selectedSlotId,
    state,
    takeSnapshot,
  ]);

  const moveAniFrame = useCallback(
    (frameId: string, direction: AniFrameMoveDirection) => {
      if (state !== "ani-editing" || !ani || ani.sourceKind !== "image-sequence") {
        return;
      }

      const frameIndex = ani.frames.findIndex((frame) => frame.id === frameId);
      const targetInsertionIndex =
        direction === "previous" ? frameIndex - 1 : frameIndex + 2;

      if (
        frameIndex === -1 ||
        targetInsertionIndex < 0 ||
        targetInsertionIndex > ani.frames.length
      ) {
        return;
      }

      const nextFrames = reorderAniFramesToInsertionIndex(
        ani.frames,
        frameId,
        targetInsertionIndex
      );
      if (!nextFrames) {
        return;
      }

      const nextAni = syncAniActiveFrame({
        ...ani,
        frames: nextFrames,
        selectedFrameId: frameId,
      });

      pushHistoryForAction(takeSnapshot(), "aniFrameMove");
      setAni(nextAni);
      commitSlotState(selectedSlotId, createAnimatedSlotState(nextAni));
    },
    [
      ani,
      commitSlotState,
      pushHistoryForAction,
      selectedSlotId,
      state,
      takeSnapshot,
    ]
  );

  const reorderAniFrame = useCallback((frameId: string, insertionIndex: number) => {
    if (state !== "ani-editing" || !ani || ani.sourceKind !== "image-sequence") {
      return;
    }

    const nextFrames = reorderAniFramesToInsertionIndex(
      ani.frames,
      frameId,
      insertionIndex
    );
    if (!nextFrames) {
      return;
    }

    const nextAni = syncAniActiveFrame({
      ...ani,
      frames: nextFrames,
      selectedFrameId: frameId,
    });

    pushHistoryForAction(takeSnapshot(), "aniFrameMove");
    setAni(nextAni);
    commitSlotState(selectedSlotId, createAnimatedSlotState(nextAni));
  }, [
    ani,
    commitSlotState,
    pushHistoryForAction,
    selectedSlotId,
    state,
    takeSnapshot,
  ]);

  const insertAniFrameFiles = useCallback(async (
    files: File[],
    insertionIndex?: number
  ) => {
    if (
      state !== "ani-editing" ||
      !ani ||
      ani.sourceKind !== "image-sequence" ||
      files.length === 0
    ) {
      return;
    }

    const requestId = beginAssetLoadRequest();
    const previous = takeSnapshot();
    setError(null);

    const existingFrameIds = new Set(ani.frames.map((frame) => frame.id));
    const createdFrames = assignUniqueAniFrameIds(
      createAniFramesFromFiles(files, { startIndex: ani.frames.length }).map(
        (frame) => ({
          ...frame,
          sourceWidth: 0,
          sourceHeight: 0,
        })
      ),
      existingFrameIds
    );

    try {
      const firstFrame = createdFrames[0];
      if (!firstFrame) {
        return;
      }

      const firstDimensions = await loadImageDimensions(firstFrame.url);
      if (!isAssetLoadRequestActive(requestId)) {
        createdFrames.forEach((frame) => safeRevokeObjectUrl(frame.url));
        return;
      }

      const hydratedFrames = await loadAniFrameDimensions(
        createdFrames,
        firstDimensions,
        () => isAssetLoadRequestActive(requestId)
      );

      if (!hydratedFrames) {
        createdFrames.forEach((frame) => safeRevokeObjectUrl(frame.url));
        return;
      }

      const selectedFrameIndex = ani.frames.findIndex(
        (frame) => frame.id === ani.selectedFrameId
      );
      const insertAt = clampFrameInsertionIndex(
        insertionIndex ??
          (selectedFrameIndex === -1 ? ani.frames.length : selectedFrameIndex + 1),
        ani.frames.length
      );
      const nextFrames = [...ani.frames];
      nextFrames.splice(insertAt, 0, ...hydratedFrames);

      const nextAni = syncAniActiveFrame({
        ...ani,
        frames: nextFrames,
        selectedFrameId: hydratedFrames[0]?.id ?? ani.selectedFrameId,
      });

      pushHistoryForAction(previous, "aniFrameInsert");
      setAni(nextAni);
      commitSlotState(selectedSlotId, createAnimatedSlotState(nextAni));
    } catch (err) {
      createdFrames.forEach((frame) => safeRevokeObjectUrl(frame.url));
      setError(err instanceof Error ? err.message : "Failed to add frames");
    }
  }, [
    ani,
    beginAssetLoadRequest,
    commitSlotState,
    isAssetLoadRequestActive,
    pushHistoryForAction,
    selectedSlotId,
    state,
    takeSnapshot,
  ]);

  const setAniFrameDuration = useCallback((frameId: string, durationMs: number) => {
    if (state !== "ani-editing" || !ani || ani.sourceKind !== "image-sequence") {
      return;
    }

    const clampedDurationMs = clampAniFrameDuration(durationMs);
    const frame = ani.frames.find((candidate) => candidate.id === frameId);
    if (!frame || frame.durationMs === clampedDurationMs) {
      return;
    }

    const nextAni = syncAniActiveFrame({
      ...ani,
      frames: ani.frames.map((candidate) =>
        candidate.id === frameId
          ? { ...candidate, durationMs: clampedDurationMs }
          : candidate
      ),
    });

    pushHistoryForAction(takeSnapshot(), "aniFrameDuration");
    setAni(nextAni);
    commitSlotState(selectedSlotId, createAnimatedSlotState(nextAni));
  }, [
    ani,
    commitSlotState,
    pushHistoryForAction,
    selectedSlotId,
    state,
    takeSnapshot,
  ]);

  const setAllAniFrameDurations = useCallback((durationMs: number) => {
    if (state !== "ani-editing" || !ani || ani.sourceKind !== "image-sequence") {
      return;
    }

    const clampedDurationMs = clampAniFrameDuration(durationMs);
    if (ani.frames.every((frame) => frame.durationMs === clampedDurationMs)) {
      return;
    }

    const nextAni = syncAniActiveFrame({
      ...ani,
      frames: ani.frames.map((frame) => ({
        ...frame,
        durationMs: clampedDurationMs,
      })),
    });

    pushHistoryForAction(takeSnapshot(), "aniFrameDuration");
    setAni(nextAni);
    commitSlotState(selectedSlotId, createAnimatedSlotState(nextAni));
  }, [
    ani,
    commitSlotState,
    pushHistoryForAction,
    selectedSlotId,
    state,
    takeSnapshot,
  ]);

  const setSelectedAniFrameEditOverride = useCallback(
    (editOverride: AniFrameEditOverride) => {
      if (
        state !== "ani-editing" ||
        !ani ||
        ani.sourceKind !== "image-sequence" ||
        !ani.selectedFrameId
      ) {
        return;
      }

      const selectedFrame = ani.frames.find(
        (frame) => frame.id === ani.selectedFrameId
      );
      const nextEditOverride = normalizeAniFrameEditOverride(editOverride);
      if (
        !selectedFrame ||
        areAniFrameEditOverridesEqual(
          selectedFrame.editOverride,
          nextEditOverride
        )
      ) {
        return;
      }

      pushHistoryForAction(takeSnapshot(), "aniFrameEditOverride");
      setAni((prev) =>
        prev && prev.sourceKind === "image-sequence"
          ? syncAniActiveFrame({
              ...prev,
              frames: prev.frames.map((frame) =>
                frame.id === prev.selectedFrameId
                  ? { ...frame, editOverride: nextEditOverride }
                  : frame
              ),
            })
          : prev
      );
    },
    [ani, pushHistoryForAction, state, takeSnapshot]
  );

  const resetSelectedAniFrameEdit = useCallback(() => {
    if (
      state !== "ani-editing" ||
      !ani ||
      ani.sourceKind !== "image-sequence" ||
      !ani.selectedFrameId
    ) {
      return;
    }

    const selectedFrame = ani.frames.find(
      (frame) => frame.id === ani.selectedFrameId
    );
    if (!selectedFrame?.editOverride) {
      return;
    }

    pushHistoryForAction(takeSnapshot(), "aniFrameReset");
    setAni((prev) =>
      prev && prev.sourceKind === "image-sequence"
        ? syncAniActiveFrame({
            ...prev,
            frames: prev.frames.map((frame) =>
              frame.id === prev.selectedFrameId
                ? { ...frame, editOverride: undefined }
                : frame
            ),
          })
        : prev
    );
  }, [ani, pushHistoryForAction, state, takeSnapshot]);

  const processBgRemoval = useCallback(async () => {
    if (!cursor || bgRemovalInFlightRef.current) return;
    trackEvent("background_decision_made", {
      decision: "remove",
      slot_id: selectedSlotId,
      source: "studio",
    });
    const previous = takeSnapshot();
    const requestId = bgRemovalRequestIdRef.current + 1;
    bgRemovalRequestIdRef.current = requestId;
    bgRemovalInFlightRef.current = true;
    const sourceOriginalUrl = cursor.originalUrl;
    const sourceFile = cursor.originalFile;
    setError(null);
    setState("processing");

    try {
      const blob = await removeBackground(sourceFile);
      const trimmedImage = await trimTransparentImageBlob(blob);

      if (bgRemovalRequestIdRef.current !== requestId) {
        return;
      }

      const url = URL.createObjectURL(trimmedImage.blob);
      const processedCursor = {
        ...cursor,
        processedUrl: url,
        processedBlob: trimmedImage.blob,
        sourceWidth: trimmedImage.width,
        sourceHeight: trimmedImage.height,
        renderedBlob: null,
      };

      pushHistoryForAction(previous, "backgroundDecision");
      setCursor((prev) =>
        prev && prev.originalUrl === sourceOriginalUrl
          ? {
              ...prev,
              processedUrl: processedCursor.processedUrl,
              processedBlob: processedCursor.processedBlob,
              sourceWidth: processedCursor.sourceWidth,
              sourceHeight: processedCursor.sourceHeight,
              renderedBlob: processedCursor.renderedBlob,
            }
          : null
      );
      commitSlotState(
        selectedSlotId,
        createStaticSlotState(processedCursor, false)
      );
      setState("editing");
    } catch (err) {
      if (bgRemovalRequestIdRef.current !== requestId) {
        return;
      }
      setError(err instanceof Error ? err.message : "Background removal failed");
      setState("uploaded");
    } finally {
      if (bgRemovalRequestIdRef.current === requestId) {
        bgRemovalInFlightRef.current = false;
      }
    }
  }, [commitSlotState, cursor, pushHistoryForAction, selectedSlotId, takeSnapshot]);

  // UX-1: 배경 제거 건너뛰기
  const skipBgRemoval = useCallback(async () => {
    if (!cursor || bgRemovalInFlightRef.current) return;
    trackEvent("background_decision_made", {
      decision: "keep_original",
      slot_id: selectedSlotId,
      source: "studio",
    });
    const previous = takeSnapshot();
    const requestId = bgRemovalRequestIdRef.current + 1;
    bgRemovalRequestIdRef.current = requestId;
    bgRemovalInFlightRef.current = true;
    const sourceOriginalUrl = cursor.originalUrl;

    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = cursor.originalUrl;
      });

      const res = await fetch(cursor.originalUrl);
      const blob = await res.blob();

      if (bgRemovalRequestIdRef.current !== requestId) {
        return;
      }

      const keptCursor = {
        ...cursor,
        processedUrl: cursor.originalUrl,
        processedBlob: blob,
        sourceWidth: img.naturalWidth,
        sourceHeight: img.naturalHeight,
        renderedBlob: null,
      };

      pushHistoryForAction(previous, "backgroundDecision");
      setCursor((prev) =>
        prev && prev.originalUrl === sourceOriginalUrl
          ? {
              ...prev,
              processedUrl: keptCursor.processedUrl,
              processedBlob: keptCursor.processedBlob,
              sourceWidth: keptCursor.sourceWidth,
              sourceHeight: keptCursor.sourceHeight,
              renderedBlob: keptCursor.renderedBlob,
            }
          : null
      );
      commitSlotState(selectedSlotId, createStaticSlotState(keptCursor, false));
      setState("editing");
    } catch (err) {
      if (bgRemovalRequestIdRef.current !== requestId) {
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to keep original");
      setState("uploaded");
    } finally {
      if (bgRemovalRequestIdRef.current === requestId) {
        bgRemovalInFlightRef.current = false;
      }
    }
  }, [commitSlotState, cursor, pushHistoryForAction, selectedSlotId, takeSnapshot]);

  // UX-4: 원본/결과 토글
  const [showOriginal, setShowOriginal] = useState(false);
  const toggleOriginal = useCallback(() => setShowOriginal((v) => !v), []);

  // UX-4: 배경 제거 다시하기
  const retryBgRemoval = useCallback(async () => {
    setShowOriginal(false);
    await processBgRemoval();
  }, [processBgRemoval]);

  const setHotspot = useCallback((x: number, y: number) => {
    if (state === "editing") {
      if (!cursor) return;
      if (
        cursor.hotspotX === x &&
        cursor.hotspotY === y &&
        cursor.hotspotMode === "manual"
      ) {
        return;
      }
      pushHistoryForAction(takeSnapshot(), "hotspot");
      setCursor((prev) => {
        if (!prev) return null;
        const renderedHotspot = getRenderedHotspot(x, y, prev.cursorSize);
        return {
          ...prev,
          hotspotX: x,
          hotspotY: y,
          hotspotMode: "manual",
          renderedHotspotX: renderedHotspot.x,
          renderedHotspotY: renderedHotspot.y,
        };
      });
      return;
    }

    if (state === "ani-editing") {
      if (!ani) return;
      if (
        ani.hotspotX === x &&
        ani.hotspotY === y &&
        ani.hotspotMode === "manual"
      ) {
        return;
      }
      pushHistoryForAction(takeSnapshot(), "hotspot");
      setAni((prev) =>
        prev
          ? {
              ...prev,
              hotspotX: x,
              hotspotY: y,
              hotspotMode: "manual",
          }
          : null
      );
    }
  }, [ani, cursor, pushHistoryForAction, state, takeSnapshot]);

  const setOffset = useCallback((
    x: number,
    y: number,
    editScope: AniFrameEditScope = "all-frames"
  ) => {
    if (state === "editing") {
      if (!cursor || (cursor.offsetX === x && cursor.offsetY === y)) return;
      pushHistoryForAction(takeSnapshot(), "offset", { coalesce: true });
      setCursor((prev) => (prev ? { ...prev, offsetX: x, offsetY: y } : null));
      return;
    }

    if (state === "ani-editing") {
      if (!ani) return;

      if (
        editScope === "selected-frame" &&
        ani.sourceKind === "image-sequence"
      ) {
        const selectedFrame = getSelectedAniFrame(ani);
        const nextEditOverride = selectedFrame
          ? normalizeAniFrameEditOverride({
              ...selectedFrame.editOverride,
              offsetX: x,
              offsetY: y,
            })
          : undefined;
        if (
          !selectedFrame ||
          areAniFrameEditOverridesEqual(
            selectedFrame.editOverride,
            nextEditOverride
          )
        ) {
          return;
        }

        pushHistoryForAction(takeSnapshot(), "offset", { coalesce: true });
        setAni((prev) =>
          prev && prev.sourceKind === "image-sequence"
            ? syncSelectedAniFrameEditOverride(prev, {
                offsetX: x,
                offsetY: y,
              })
            : prev
        );
        return;
      }

      const globalEdit = getAniGlobalEdit(ani);
      if (globalEdit.offsetX === x && globalEdit.offsetY === y) return;
      pushHistoryForAction(takeSnapshot(), "offset", { coalesce: true });
      setAni((prev) =>
        prev
          ? syncAniGlobalEdit(prev, {
              ...getAniGlobalEdit(prev),
              offsetX: x,
              offsetY: y,
            })
          : null
      );
    }
  }, [ani, cursor, pushHistoryForAction, state, takeSnapshot]);

  const setScale = useCallback((
    scale: number,
    editScope: AniFrameEditScope = "all-frames"
  ) => {
    if (state === "editing") {
      if (!cursor || cursor.scale === scale) return;
      pushHistoryForAction(takeSnapshot(), "scale", { coalesce: true });
      setCursor((prev) => (prev ? { ...prev, scale } : null));
      return;
    }

    if (state === "ani-editing") {
      if (!ani) return;

      if (
        editScope === "selected-frame" &&
        ani.sourceKind === "image-sequence"
      ) {
        const selectedFrame = getSelectedAniFrame(ani);
        const nextEditOverride = selectedFrame
          ? normalizeAniFrameEditOverride({
              ...selectedFrame.editOverride,
              scale,
            })
          : undefined;
        if (
          !selectedFrame ||
          areAniFrameEditOverridesEqual(
            selectedFrame.editOverride,
            nextEditOverride
          )
        ) {
          return;
        }

        pushHistoryForAction(takeSnapshot(), "scale", { coalesce: true });
        setAni((prev) =>
          prev && prev.sourceKind === "image-sequence"
            ? syncSelectedAniFrameEditOverride(prev, { scale })
            : prev
        );
        return;
      }

      const globalEdit = getAniGlobalEdit(ani);
      if (globalEdit.scale === scale) return;
      pushHistoryForAction(takeSnapshot(), "scale", { coalesce: true });
      setAni((prev) =>
        prev
          ? syncAniGlobalEdit(prev, {
              ...getAniGlobalEdit(prev),
              scale,
            })
          : null
      );
    }
  }, [ani, cursor, pushHistoryForAction, state, takeSnapshot]);

  const setFitMode = useCallback((
    fitMode: FitMode,
    editScope: AniFrameEditScope = "all-frames"
  ) => {
    if (state === "editing") {
      if (!cursor || cursor.fitMode === fitMode) return;
      pushHistoryForAction(takeSnapshot(), "fitMode");
      setCursor((prev) => (prev ? { ...prev, fitMode } : null));
      return;
    }

    if (state === "ani-editing") {
      if (!ani) return;

      if (
        editScope === "selected-frame" &&
        ani.sourceKind === "image-sequence"
      ) {
        const selectedFrame = getSelectedAniFrame(ani);
        const nextEditOverride = selectedFrame
          ? normalizeAniFrameEditOverride({
              ...selectedFrame.editOverride,
              fitMode,
            })
          : undefined;
        if (
          !selectedFrame ||
          areAniFrameEditOverridesEqual(
            selectedFrame.editOverride,
            nextEditOverride
          )
        ) {
          return;
        }

        pushHistoryForAction(takeSnapshot(), "fitMode");
        setAni((prev) =>
          prev && prev.sourceKind === "image-sequence"
            ? syncSelectedAniFrameEditOverride(prev, { fitMode })
            : prev
        );
        return;
      }

      const globalEdit = getAniGlobalEdit(ani);
      if (globalEdit.fitMode === fitMode) return;
      pushHistoryForAction(takeSnapshot(), "fitMode");
      setAni((prev) =>
        prev
          ? syncAniGlobalEdit(prev, {
              ...getAniGlobalEdit(prev),
              fitMode,
            })
          : null
      );
    }
  }, [ani, cursor, pushHistoryForAction, state, takeSnapshot]);

  // UX-5: 커서 크기 변경
  const applyImageTransform = useCallback((
    action: ImageTransformAction,
    editScope: AniFrameEditScope = "all-frames"
  ) => {
    if (state === "editing") {
      if (!cursor) return;

      const nextTransform = applyImageTransformAction(cursor, action);
      const nextHotspot = transformViewportHotspotForAction(
        cursor.hotspotX,
        cursor.hotspotY,
        action,
        cursor
      );
      const renderedHotspot = getRenderedHotspot(
        nextHotspot.x,
        nextHotspot.y,
        cursor.cursorSize
      );

      pushHistoryForAction(takeSnapshot(), "imageTransform");
      setCursor((prev) =>
        prev
          ? {
              ...prev,
              ...nextTransform,
              hotspotX: nextHotspot.x,
              hotspotY: nextHotspot.y,
              renderedBlob: null,
              renderedHotspotX: renderedHotspot.x,
              renderedHotspotY: renderedHotspot.y,
            }
          : null
      );
      return;
    }

    if (state === "ani-editing") {
      if (!ani) return;

      if (
        editScope === "selected-frame" &&
        ani.sourceKind === "image-sequence"
      ) {
        const selectedFrame = getSelectedAniFrame(ani);
        if (!selectedFrame) return;

        const activeEdit = resolveAniFrameEdit(
          getAniGlobalEdit(ani),
          selectedFrame
        );
        const nextTransform = applyImageTransformAction(activeEdit, action);

        pushHistoryForAction(takeSnapshot(), "imageTransform");
        setAni((prev) =>
          prev && prev.sourceKind === "image-sequence"
            ? syncSelectedAniFrameEditOverride(prev, nextTransform)
            : prev
        );
        return;
      }

      const globalEdit = getAniGlobalEdit(ani);
      const nextGlobalEdit: AniFrameEdit = {
        ...globalEdit,
        ...applyImageTransformAction(globalEdit, action),
      };
      const nextHotspot = transformViewportHotspotForAction(
        ani.hotspotX,
        ani.hotspotY,
        action,
        globalEdit
      );

      pushHistoryForAction(takeSnapshot(), "imageTransform");
      setAni((prev) =>
        prev
          ? syncAniGlobalEdit(
              {
                ...prev,
                hotspotX: nextHotspot.x,
                hotspotY: nextHotspot.y,
              },
              nextGlobalEdit
            )
          : null
      );
    }
  }, [ani, cursor, pushHistoryForAction, state, takeSnapshot]);

  const setCursorSize = useCallback((size: CursorSize) => {
    if (!cursor || cursor.cursorSize === size) return;
    pushHistoryForAction(takeSnapshot(), "cursorSize");
    setCursor((prev) => {
      if (!prev) return null;
      const renderedHotspot = getRenderedHotspot(
        prev.hotspotX,
        prev.hotspotY,
        size
      );

      return {
        ...prev,
        cursorSize: size,
        renderedHotspotX: renderedHotspot.x,
        renderedHotspotY: renderedHotspot.y,
      };
    });
  }, [cursor, pushHistoryForAction, takeSnapshot]);

  const setAniCursorSize = useCallback((size: CursorSize) => {
    if (!ani || ani.cursorSize === size) return;
    pushHistoryForAction(takeSnapshot(), "cursorSize");
    setAni((prev) => (prev ? { ...prev, cursorSize: size } : null));
  }, [ani, pushHistoryForAction, takeSnapshot]);

  // UX-6: 커서 이름 변경
  const setCursorName = useCallback((name: string) => {
    if (state === "editing") {
      if (!cursor || cursor.cursorName === name) return;
      pushHistoryForAction(takeSnapshot(), "cursorName");
      setCursor((prev) => (prev ? { ...prev, cursorName: name } : null));
      return;
    }

    if (state === "ani-editing") {
      if (!ani || ani.cursorName === name) return;
      pushHistoryForAction(takeSnapshot(), "cursorName");
      setAni((prev) => (prev ? { ...prev, cursorName: name } : null));
    }
  }, [ani, cursor, pushHistoryForAction, state, takeSnapshot]);

  const recommendHotspot = useCallback(async () => {
    if (state === "editing") {
      if (!cursor || !cursor.sourceWidth || !cursor.sourceHeight) {
        return;
      }

      const previous = takeSnapshot();

      const suggestion = await suggestViewportHotspot({
        imageUrl: cursor.processedUrl,
        sourceWidth: cursor.sourceWidth,
        sourceHeight: cursor.sourceHeight,
        fitMode: cursor.fitMode,
        scale: cursor.scale,
        offsetX: cursor.offsetX,
        offsetY: cursor.offsetY,
        viewportSize: EDITOR_VIEWPORT_SIZE,
      });

      if (!suggestion) return;
      if (
        cursor.hotspotX === suggestion.x &&
        cursor.hotspotY === suggestion.y &&
        cursor.hotspotMode === "auto"
      ) {
        return;
      }

      pushHistoryForAction(previous, "recommendHotspot");
      setCursor((prev) => {
        if (!prev) return null;
        const renderedHotspot = getRenderedHotspot(
          suggestion.x,
          suggestion.y,
          prev.cursorSize
        );

        return {
          ...prev,
          hotspotX: suggestion.x,
          hotspotY: suggestion.y,
          hotspotMode: "auto",
          renderedHotspotX: renderedHotspot.x,
          renderedHotspotY: renderedHotspot.y,
        };
      });
      return;
    }

    if (state === "ani-editing") {
      if (!ani || !ani.sourceWidth || !ani.sourceHeight) {
        return;
      }

      const previous = takeSnapshot();

      const suggestion = await suggestViewportHotspot({
        imageUrl: ani.originalUrl,
        sourceWidth: ani.sourceWidth,
        sourceHeight: ani.sourceHeight,
        fitMode: ani.fitMode,
        scale: ani.scale,
        offsetX: ani.offsetX,
        offsetY: ani.offsetY,
        viewportSize: EDITOR_VIEWPORT_SIZE,
      });

      if (!suggestion) return;
      if (
        ani.hotspotX === suggestion.x &&
        ani.hotspotY === suggestion.y &&
        ani.hotspotMode === "auto"
      ) {
        return;
      }

      pushHistoryForAction(previous, "recommendHotspot");
      setAni((prev) =>
        prev
          ? {
              ...prev,
              hotspotX: suggestion.x,
              hotspotY: suggestion.y,
              hotspotMode: "auto",
            }
          : null
      );
    }
  }, [ani, cursor, pushHistoryForAction, state, takeSnapshot]);

  const endContinuousHistoryAction = useCallback(() => {
    clearActiveHistoryAction();
  }, [clearActiveHistoryAction]);

  const reset = useCallback(() => {
    const urls = new Set<string>();
    [takeSnapshot(), ...undoStackRef.current, ...redoStackRef.current].forEach(
      (snapshot) => collectSnapshotObjectUrls(snapshot, urls)
    );
    if (previewUrlRef.current) {
      urls.add(previewUrlRef.current);
    }
    urls.forEach((url) => safeRevokeObjectUrl(url));

    undoStackRef.current = [];
    redoStackRef.current = [];
    clearActiveHistoryAction();
    cancelBgRemovalRequest();
    cancelAssetLoadRequest();
    syncHistoryFlags();
    setCursor(null);
    setAni(null);
    setPendingAniBackgroundDecision(null);
    setAniBackgroundProgress(null);
    setProject(createLegacyCompatibleProject());
    setSlotRuntime(createEmptySlotRuntime());
    const defaultSelection = getPrimaryRoleSelection();
    setSelectedSlotId(defaultSelection.selectedSlotId);
    setEditingSlotId(defaultSelection.editingSlotId);
    setPreviewUrl(null);
    setState("editing");
    setError(null);
    setShowOriginal(false);
  }, [
    cancelAssetLoadRequest,
    cancelBgRemovalRequest,
    clearActiveHistoryAction,
    syncHistoryFlags,
    takeSnapshot,
  ]);

  useEffect(() => {
    return () => {
      cancelAssetLoadRequest();
      const urls = new Set<string>();
      [takeSnapshot(), ...undoStackRef.current, ...redoStackRef.current].forEach(
        (snapshot) => collectSnapshotObjectUrls(snapshot, urls)
      );
      if (previewUrlRef.current) {
        urls.add(previewUrlRef.current);
      }
      urls.forEach((url) => safeRevokeObjectUrl(url));
    };
  }, [cancelAssetLoadRequest, takeSnapshot]);

  // UX-2 + UX-3: editor framing과 최종 export가 같은 square PNG 생성
  useEffect(() => {
    if (
      !cursor ||
      state !== "editing" ||
      !cursor.sourceWidth ||
      !cursor.sourceHeight
    ) {
      return;
    }

    let active = true;

    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);

    previewTimerRef.current = setTimeout(() => {
      rasterizeSquarePng({
        imageUrl: cursor.processedUrl,
        sourceWidth: cursor.sourceWidth,
        sourceHeight: cursor.sourceHeight,
        fitMode: cursor.fitMode,
        scale: cursor.scale,
        offsetX: cursor.offsetX,
        offsetY: cursor.offsetY,
        rotation: cursor.rotation,
        flipX: cursor.flipX,
        flipY: cursor.flipY,
        outputSize: cursor.cursorSize,
        hotspotX: cursor.hotspotX,
        hotspotY: cursor.hotspotY,
        editorViewportSize: EDITOR_VIEWPORT_SIZE,
      })
        .then((renderResult) => {
          if (!active) return;

          const nextPreviewUrl = URL.createObjectURL(renderResult.blob);

          setCursor((prev) =>
            prev
              ? {
                  ...prev,
                  renderedBlob: renderResult.blob,
                  renderedHotspotX: renderResult.hotspotX,
                  renderedHotspotY: renderResult.hotspotY,
                }
              : null
          );

          setPreviewUrl((prev) => {
            if (prev) {
              safeRevokeObjectUrl(prev);
            }
            return nextPreviewUrl;
          });
        })
        .catch((err) => {
          if (!active) return;
          setError(err instanceof Error ? err.message : "Preview render failed");
        });
    }, 200);

    return () => {
      active = false;
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, [
    cursor?.processedUrl,
    cursor?.sourceWidth,
    cursor?.sourceHeight,
    cursor?.fitMode,
    cursor?.scale,
    cursor?.offsetX,
    cursor?.offsetY,
    cursor?.rotation,
    cursor?.flipX,
    cursor?.flipY,
    cursor?.cursorSize,
    state,
  ]);

  useEffect(() => {
    if (
      !cursor ||
      state !== "editing" ||
      !cursor.sourceWidth ||
      !cursor.sourceHeight ||
      cursor.hotspotMode !== "auto"
    ) {
      return;
    }

    let active = true;

    const timer = setTimeout(() => {
      suggestViewportHotspot({
        imageUrl: cursor.processedUrl,
        sourceWidth: cursor.sourceWidth,
        sourceHeight: cursor.sourceHeight,
        fitMode: cursor.fitMode,
        scale: cursor.scale,
        offsetX: cursor.offsetX,
        offsetY: cursor.offsetY,
        rotation: cursor.rotation,
        flipX: cursor.flipX,
        flipY: cursor.flipY,
        viewportSize: EDITOR_VIEWPORT_SIZE,
      })
        .then((suggestion) => {
          if (!active || !suggestion) return;

          setCursor((prev) => {
            if (!prev || prev.hotspotMode !== "auto") return prev;
            const renderedHotspot = getRenderedHotspot(
              suggestion.x,
              suggestion.y,
              prev.cursorSize
            );

            return {
              ...prev,
              hotspotX: suggestion.x,
              hotspotY: suggestion.y,
              hotspotMode: "auto",
              renderedHotspotX: renderedHotspot.x,
              renderedHotspotY: renderedHotspot.y,
            };
          });
        })
        .catch(() => {
          // ignore recommendation failures and keep the current hotspot
        });
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    cursor?.processedUrl,
    cursor?.sourceWidth,
    cursor?.sourceHeight,
    cursor?.fitMode,
    cursor?.scale,
    cursor?.offsetX,
    cursor?.offsetY,
    cursor?.rotation,
    cursor?.flipX,
    cursor?.flipY,
    cursor?.hotspotMode,
    state,
  ]);

  useEffect(() => {
    if (
      !ani ||
      state !== "ani-editing" ||
      !ani.sourceWidth ||
      !ani.sourceHeight ||
      ani.hotspotMode !== "auto"
    ) {
      return;
    }

    let active = true;

    const timer = setTimeout(() => {
      suggestViewportHotspot({
        imageUrl: ani.originalUrl,
        sourceWidth: ani.sourceWidth,
        sourceHeight: ani.sourceHeight,
        fitMode: ani.fitMode,
        scale: ani.scale,
        offsetX: ani.offsetX,
        offsetY: ani.offsetY,
        rotation: ani.rotation,
        flipX: ani.flipX,
        flipY: ani.flipY,
        viewportSize: EDITOR_VIEWPORT_SIZE,
      })
        .then((suggestion) => {
          if (!active || !suggestion) return;

          setAni((prev) => {
            if (!prev || prev.hotspotMode !== "auto") return prev;

            return {
              ...prev,
              hotspotX: suggestion.x,
              hotspotY: suggestion.y,
              hotspotMode: "auto",
            };
          });
        })
        .catch(() => {
          // keep the current hotspot when auto-suggestion fails
        });
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    ani?.originalUrl,
    ani?.sourceWidth,
    ani?.sourceHeight,
    ani?.fitMode,
    ani?.scale,
    ani?.offsetX,
    ani?.offsetY,
    ani?.rotation,
    ani?.flipX,
    ani?.flipY,
    ani?.hotspotMode,
    state,
  ]);

  const downloadAll = useCallback(async () => {
    const snapshot = takeSnapshot();
    const configuredSlotIds = WINDOWS_ROLE_SLOT_IDS.filter(
      (slotId) => snapshot.project.slots[slotId].kind !== null
    );
    const pendingSlotIds = WINDOWS_ROLE_SLOT_IDS.filter(
      (slotId) =>
        snapshot.slotRuntime[slotId].backgroundRemovalPending ||
        (slotId === snapshot.selectedSlotId &&
          isBackgroundRemovalDecisionState(snapshot.state))
    );

    if (!configuredSlotIds.length || pendingSlotIds.length) return;

    setDownloading(true);
    setError(null);

    try {
      const entries = await Promise.all(
        configuredSlotIds.map(async (slotId) => {
          const slot = snapshot.project.slots[slotId];
          const runtime = snapshot.slotRuntime[slotId];

          if (slot.kind === "static" && runtime.cursor) {
            return {
              name: buildWindowsRolePackagePath(slotId, "cur"),
              blob: await createCursorExportBlob(runtime.cursor, "raw"),
            };
          }

          if (slot.kind === "animated" && runtime.ani) {
            const aniDownload = await createAniExportDownload(runtime.ani);
            return {
              name: buildWindowsRolePackagePath(slotId, "ani"),
              blob: aniDownload.blob,
            };
          }

          return null;
        })
      );
      const configuredEntries = entries.filter(
        (entry): entry is { name: string; blob: Blob } => entry !== null
      );

      if (!configuredEntries.length) return;

      const installerEntries: WindowsRoleInstallerEntry[] = configuredSlotIds
        .map((slotId) => {
          const slot = snapshot.project.slots[slotId];
          if (slot.kind === "static") {
            return { slotId, extension: "cur" as const };
          }
          if (slot.kind === "animated") {
            return { slotId, extension: "ani" as const };
          }
          return null;
        })
        .filter(
          (
            entry
          ): entry is WindowsRoleInstallerEntry => entry !== null
        );

      const fullSetEntries = [
        ...configuredEntries,
        {
          name: "install.inf",
          blob: new Blob([buildWindowsRoleInstallInf(installerEntries)], {
            type: "text/plain;charset=utf-8",
          }),
        },
        {
          name: "restore-default.inf",
          blob: new Blob([buildWindowsRoleRestoreInf()], {
            type: "text/plain;charset=utf-8",
          }),
        },
      ];

      const fullSetZipBlob = await buildWindowsRoleMasterZip(fullSetEntries);
      const url = URL.createObjectURL(fullSetZipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pointint-windows-roles.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      safeRevokeObjectUrl(url);
      trackEvent("download_completed", {
        source: "studio",
        export_scope: "full_set",
        configured_roles: configuredEntries.length,
      });
      setDownloadGuideVariant("package");
      setShowGuide(true);
    } catch (err) {
      setError(getDownloadErrorMessage(err, "Download failed"));
    } finally {
      setDownloading(false);
    }
  }, [takeSnapshot]);

  const download = useCallback(async () => {
    if (state === "uploaded" || state === "processing") return;

    if (state === "ani-editing") {
      if (!ani) return;
      setDownloading(true);
      setError(null);

      try {
        const roleDownloadFilename =
          buildWindowsRoleDownloadFilename(selectedSlotId, "ani");
        const aniDownload = await createAniExportDownload(ani);
        const url = URL.createObjectURL(aniDownload.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = roleDownloadFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        safeRevokeObjectUrl(url);
        trackEvent("download_completed", {
          cursor_size: ani.cursorSize,
          fit_mode: ani.fitMode,
          source: "studio",
          workflow: "ani",
        });
        setDownloadGuideVariant("ani");
        setShowGuide(true);
      } catch (err) {
        setError(getDownloadErrorMessage(err, "ANI export failed"));
      } finally {
        setDownloading(false);
      }
      return;
    }

    if (!cursor) return;
    setDownloading(true);
    setError(null);

    try {
      const roleDownloadFilename =
        buildWindowsRoleDownloadFilename(selectedSlotId, "cur");
      const curBlob = await createCursorExportBlob(cursor, "raw");
      const url = URL.createObjectURL(curBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = roleDownloadFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      safeRevokeObjectUrl(url);
      trackEvent("download_completed", {
        cursor_size: cursor.cursorSize,
        fit_mode: cursor.fitMode,
        source: "studio",
      });
      setDownloadGuideVariant("cur");
      setShowGuide(true);
    } catch (err) {
      setError(getDownloadErrorMessage(err, "Download failed"));
    } finally {
      setDownloading(false);
    }
  }, [ani, cursor, selectedSlotId, state]);

  const downloadGif = useCallback(async () => {
    if (!canDownloadGif || !ani) return;

    setDownloading(true);
    setError(null);

    try {
      const gifDownload = await createGifExportDownload(ani);
      const url = URL.createObjectURL(gifDownload.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = buildWindowsRoleGifFilename(selectedSlotId);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      safeRevokeObjectUrl(url);
      trackEvent("download_completed", {
        cursor_size: ani.cursorSize,
        fit_mode: ani.fitMode,
        source: "studio",
        workflow: "gif",
      });
    } catch (err) {
      setError(getDownloadErrorMessage(err, "GIF export failed"));
    } finally {
      setDownloading(false);
    }
  }, [ani, canDownloadGif, selectedSlotId]);

  const closeGuide = useCallback(() => setShowGuide(false), []);

  return {
    state,
    project,
    selectedSlotId,
    editingSlotId,
    cursor,
    ani,
    error,
    downloading,
    showGuide,
    downloadGuideVariant,
    showOriginal,
    previewUrl,
    pendingBackgroundRemovalSlotIds,
    pendingAniBackgroundDecision,
    aniBackgroundProgress,
    selectFile,
    selectAniFile,
    selectVideoFile,
    processBgRemoval,
    keepExtractedVideoBackground,
    removeExtractedVideoBackground,
    skipBgRemoval,
    toggleOriginal,
    retryBgRemoval,
    setHotspot,
    setOffset,
    setScale,
    setFitMode,
    applyImageTransform,
    setCursorSize,
    setAniCursorSize,
    setCursorName,
    selectSlot,
    selectSelectedSlotStaticFile,
    selectSelectedSlotAnimatedFile,
    selectSelectedSlotImageSequenceFiles,
    selectSelectedSlotVideoFile,
    selectAniFrame,
    deleteAniFrame,
    moveAniFrame,
    reorderAniFrame,
    insertAniFrameFiles,
    setAniFrameDuration,
    setAllAniFrameDurations,
    setSelectedAniFrameEditOverride,
    resetSelectedAniFrameEdit,
    recommendHotspot,
    endContinuousHistoryAction,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    canDownloadAll,
    canDownload,
    canDownloadGif,
    downloadAll,
    download,
    downloadGif,
    closeGuide,
  };
}

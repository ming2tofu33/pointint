"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  FitMode,
  mapViewportHotspotToOutput,
  rasterizeSquarePng,
  suggestViewportHotspot,
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
  removeBackground,
  type BinaryDownloadResponse,
} from "./api";

export type CursorSize = ThemeCursorSize;

const EDITOR_VIEWPORT_SIZE = 256;
const DEFAULT_ANI_FRAME_EDIT: AniFrameEdit = {
  fitMode: "contain",
  scale: 1,
  offsetX: 0,
  offsetY: 0,
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

type HistoryActionKey =
  | "offset"
  | "scale"
  | "hotspot"
  | "fitMode"
  | "cursorSize"
  | "cursorName"
  | "replaceSlot"
  | "backgroundDecision"
  | "recommendHotspot";

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
    fitMode: globalEdit.fitMode,
    cursorSize: 32,
    cursorName: getDefaultCursorNameForSlot(slotId),
  };
}

function createAniFromImageSequenceFiles(
  files: File[],
  slotId: WindowsRoleSlotId
): AniData {
  const frames = createAniFramesFromFiles(files).map((frame) => ({
    ...frame,
    sourceWidth: 0,
    sourceHeight: 0,
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
    fitMode: globalEdit.fitMode,
    cursorSize: 32,
    cursorName: getDefaultCursorNameForSlot(slotId),
  });
}

async function createCursorExportBlob(
  cursor: CursorData,
  packageFormat: "zip" | "raw" = "zip"
) {
  const pngBlob = cursor.renderedBlob ?? cursor.processedBlob;
  const renderedHotspot =
    cursor.renderedBlob !== null
      ? {
          x: cursor.renderedHotspotX,
          y: cursor.renderedHotspotY,
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
  };

  if (ani.sourceKind === "image-sequence") {
    return generateAniSequence(
      ani.frames.map((frame) => frame.file),
      input
    );
  }

  return generateAni(ani.originalFile, input);
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
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
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
      const requestId = beginAssetLoadRequest();
      const previous = takeSnapshot();
      clearActiveHistoryAction();
      setError(null);
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
            revokeAniObjectUrls(replacedAni);
          }
        } catch (err) {
          revokeCursorObjectUrls(nextCursor);
          if (!isAssetLoadRequestActive(requestId)) return;
          setError(err instanceof Error ? err.message : "Failed to load image");
        }
        return;
      }

      const nextAni = createAniFromFile(file, slotId);

      try {
        const dimensions = await loadImageDimensions(nextAni.originalUrl);
        if (!isAssetLoadRequestActive(requestId)) {
          revokeAniObjectUrls(nextAni);
          return;
        }

        const hydratedAni = syncAniActiveFrame({
          ...nextAni,
          sourceWidth: dimensions.width,
          sourceHeight: dimensions.height,
        });

        const { historySnapshot, replacedAni } =
          prepareImageSequenceReplacementSnapshot(previous, slotId);

        pushHistoryForAction(historySnapshot, "replaceSlot");
        setCursor(null);
        setAni(hydratedAni);
        commitSlotState(slotId, createAnimatedSlotState(hydratedAni));
        setState("ani-editing");
        if (replacedAni?.sourceKind === "image-sequence") {
          revokeAniObjectUrls(replacedAni);
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

      const requestId = beginAssetLoadRequest();
      const previous = takeSnapshot();
      clearActiveHistoryAction();
      setError(null);
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
          revokeAniObjectUrls(replacedAni);
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

    setAni((prev) =>
      prev && prev.sourceKind === "image-sequence"
        ? syncAniActiveFrame({
            ...prev,
            selectedFrameId: frameId,
          })
        : prev
    );
  }, [ani, state]);

  const processBgRemoval = useCallback(async () => {
    if (!cursor || bgRemovalInFlightRef.current) return;
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
      const url = URL.createObjectURL(blob);
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
      });

      if (bgRemovalRequestIdRef.current !== requestId) {
        safeRevokeObjectUrl(url);
        return;
      }

      const processedCursor = {
        ...cursor,
        processedUrl: url,
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

  const setOffset = useCallback((x: number, y: number) => {
    if (state === "editing") {
      if (!cursor || (cursor.offsetX === x && cursor.offsetY === y)) return;
      pushHistoryForAction(takeSnapshot(), "offset", { coalesce: true });
      setCursor((prev) => (prev ? { ...prev, offsetX: x, offsetY: y } : null));
      return;
    }

    if (state === "ani-editing") {
      if (!ani) return;
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

  const setScale = useCallback((scale: number) => {
    if (state === "editing") {
      if (!cursor || cursor.scale === scale) return;
      pushHistoryForAction(takeSnapshot(), "scale", { coalesce: true });
      setCursor((prev) => (prev ? { ...prev, scale } : null));
      return;
    }

    if (state === "ani-editing") {
      if (!ani) return;
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

  const setFitMode = useCallback((fitMode: FitMode) => {
    if (state === "editing") {
      if (!cursor || cursor.fitMode === fitMode) return;
      pushHistoryForAction(takeSnapshot(), "fitMode");
      setCursor((prev) => (prev ? { ...prev, fitMode } : null));
      return;
    }

    if (state === "ani-editing") {
      if (!ani) return;
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
      setShowGuide(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
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
        setShowGuide(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "ANI export failed");
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
      setShowGuide(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }, [ani, cursor, selectedSlotId, state]);

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
    showOriginal,
    previewUrl,
    pendingBackgroundRemovalSlotIds,
    selectFile,
    selectAniFile,
    processBgRemoval,
    skipBgRemoval,
    toggleOriginal,
    retryBgRemoval,
    setHotspot,
    setOffset,
    setScale,
    setFitMode,
    setCursorSize,
    setAniCursorSize,
    setCursorName,
    selectSlot,
    selectSelectedSlotStaticFile,
    selectSelectedSlotAnimatedFile,
    selectSelectedSlotImageSequenceFiles,
    selectAniFrame,
    recommendHotspot,
    endContinuousHistoryAction,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    canDownloadAll,
    canDownload,
    downloadAll,
    download,
    closeGuide,
  };
}

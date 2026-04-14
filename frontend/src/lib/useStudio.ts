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
  WINDOWS_ROLE_SLOT_IDS,
  type CursorSize as ThemeCursorSize,
  type CursorThemeProject,
  type SlotKind,
  type WindowsRoleSlotId,
} from "@/lib/cursorThemeProject";
import {
  buildWindowsRoleMasterZip,
  buildWindowsRoleDownloadFilename,
  buildWindowsRolePackagePath,
} from "@/lib/studioDownload";
import { type StudioState } from "@/lib/studioWorkflow";
import { trackEvent } from "@/lib/analytics";
import { ensureAniZipPackage } from "@/lib/aniDownload";

import { generateAni, generateCursor, removeBackground } from "./api";

export type CursorSize = ThemeCursorSize;

const EDITOR_VIEWPORT_SIZE = 256;

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

export interface AniData {
  originalFile: File;
  originalUrl: string;
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
  if (!ani?.originalUrl) return;
  safeRevokeObjectUrl(ani.originalUrl);
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

function createAniName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return baseName || "cursor";
}

function sanitizeCursorName(name: string) {
  const safe = name.replace(/[^\w\- ]+/g, "").trim();
  return safe || "cursor";
}

function createEmptySlotRuntime(): Record<WindowsRoleSlotId, SlotRuntime> {
  return createWindowsRoleRecord(() => ({ cursor: null, ani: null }));
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

function createCursorFromFile(file: File): CursorData {
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
    cursorName: "cursor",
  };
}

function createAniFromFile(file: File, sourceWidth = 0, sourceHeight = 0): AniData {
  return {
    originalFile: file,
    originalUrl: URL.createObjectURL(file),
    sourceWidth,
    sourceHeight,
    hotspotX: 0,
    hotspotY: 0,
    hotspotMode: "auto",
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    fitMode: "contain",
    cursorSize: 32,
    cursorName: createAniName(file.name),
  };
}

async function createCursorExportBlob(cursor: CursorData) {
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
    cursor.cursorName
  );
}

async function createAniExportBlob(ani: AniData) {
  const renderedHotspot = mapViewportHotspotToOutput({
    hotspotX: ani.hotspotX,
    hotspotY: ani.hotspotY,
    viewportSize: EDITOR_VIEWPORT_SIZE,
    outputSize: ani.cursorSize,
  });
  const aniDownload = await generateAni(ani.originalFile, {
    aniName: ani.cursorName,
    hotspotX: renderedHotspot.x,
    hotspotY: renderedHotspot.y,
    cursorSize: ani.cursorSize,
    fitMode: ani.fitMode,
    offsetX: ani.offsetX,
    offsetY: ani.offsetY,
    scale: ani.scale,
  });

  return ensureAniZipPackage(aniDownload, sanitizeCursorName(ani.cursorName));
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

function createStaticSlotState(nextCursor: CursorData): SlotStateUpdate {
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
    { cursor: nextCursor, ani: null }
  );
}

function createAnimatedSlotState(nextAni: AniData): SlotStateUpdate {
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
      fitMode: nextAni.fitMode,
      hotspotMode: nextAni.hotspotMode,
      hotspotX: nextAni.hotspotX,
      hotspotY: nextAni.hotspotY,
      offsetX: nextAni.offsetX,
      offsetY: nextAni.offsetY,
      scale: nextAni.scale,
    },
    { cursor: null, ani: nextAni }
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
      createStaticSlotState(snapshot.cursor)
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
  if (!ani?.originalUrl) return;
  urls.add(ani.originalUrl);
}

function collectSnapshotObjectUrls(snapshot: StudioSnapshot, urls: Set<string>) {
  collectCursorObjectUrls(snapshot.cursor, urls);
  collectAniObjectUrls(snapshot.ani, urls);

  Object.values(snapshot.slotRuntime).forEach((runtime) => {
    collectCursorObjectUrls(runtime.cursor, urls);
    collectAniObjectUrls(runtime.ani, urls);
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
  const canDownloadAll = WINDOWS_ROLE_SLOT_IDS.some(
    (slotId) => project.slots[slotId].kind !== null
  );
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

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
  }, []);

  const takeSnapshot = useCallback(() => {
    return finalizeStudioSnapshot(liveStateRef.current);
  }, []);

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
      undoStackRef.current.push(snapshot);
      if (undoStackRef.current.length > HISTORY_LIMIT) {
        undoStackRef.current = undoStackRef.current.slice(-HISTORY_LIMIT);
      }
      redoStackRef.current = [];
      syncHistoryFlags();
    },
    [syncHistoryFlags]
  );

  const applySnapshot = useCallback(
    (snapshot: StudioSnapshot) => {
      clearPreview();
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
    [clearPreview]
  );

  const undo = useCallback(() => {
    const previous = undoStackRef.current.pop();
    if (!previous) {
      return;
    }

    const current = takeSnapshot();
    redoStackRef.current.push(current);
    if (redoStackRef.current.length > HISTORY_LIMIT) {
      redoStackRef.current = redoStackRef.current.slice(-HISTORY_LIMIT);
    }

    applySnapshot(previous);
    syncHistoryFlags();
  }, [applySnapshot, syncHistoryFlags, takeSnapshot]);

  const redo = useCallback(() => {
    const next = redoStackRef.current.pop();
    if (!next) {
      return;
    }

    const current = takeSnapshot();
    undoStackRef.current.push(current);
    if (undoStackRef.current.length > HISTORY_LIMIT) {
      undoStackRef.current = undoStackRef.current.slice(-HISTORY_LIMIT);
    }

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
      const previous = takeSnapshot();
      setError(null);
      cleanupSlotReplacement(slotId);
      clearPreview();

      if (kind === "static") {
        const nextCursor = createCursorFromFile(file);
        pushHistory(previous);
        setCursor(nextCursor);
        setAni(null);
        commitSlotState(slotId, createStaticSlotState(nextCursor));
        setState(
          slotId === DEFAULT_PRIMARY_ROLE_SLOT_ID ? "uploaded" : "editing"
        );
        return;
      }

      const nextAni = createAniFromFile(file);

      try {
        const dimensions = await loadImageDimensions(nextAni.originalUrl);
        const hydratedAni = {
          ...nextAni,
          sourceWidth: dimensions.width,
          sourceHeight: dimensions.height,
        };

        pushHistory(previous);
        setCursor(null);
        setAni(hydratedAni);
        commitSlotState(slotId, createAnimatedSlotState(hydratedAni));
        setState("ani-editing");
      } catch (err) {
        safeRevokeObjectUrl(nextAni.originalUrl);
        setError(err instanceof Error ? err.message : "Failed to load GIF");
        setState("editing");
      }
    },
    [
      cleanupSlotReplacement,
      clearPreview,
      commitSlotState,
      pushHistory,
      takeSnapshot,
    ]
  );

  const uploadFileToPrimaryRoleSlot = useCallback(
    (file: File, kind: SlotKind) =>
      uploadFileToSlot(DEFAULT_PRIMARY_ROLE_SLOT_ID, file, kind),
    [uploadFileToSlot]
  );

  const selectSlot = useCallback((slotId: WindowsRoleSlotId | LegacySlotId) => {
    const normalizedSlotId = normalizeSlotId(slotId);

    if (selectedSlotBound && cursor && state === "editing") {
      commitSlotState(selectedSlotId, createStaticSlotState(cursor));
    }

    if (selectedSlotBound && ani && state === "ani-editing") {
      commitSlotState(selectedSlotId, createAnimatedSlotState(ani));
    }

    setSelectedSlotId(normalizedSlotId);
    setEditingSlotId(normalizedSlotId);

    const slot = project.slots[normalizedSlotId];
    const runtime = slotRuntime[normalizedSlotId];

    if (slot.kind === "static" && runtime.cursor) {
      setPreviewUrl((prev) => {
        if (prev) {
          safeRevokeObjectUrl(prev);
        }
        return null;
      });
      setCursor(runtime.cursor);
      setAni(null);
      setState("editing");
      return;
    }

    if (slot.kind === "animated" && runtime.ani) {
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

  // UX-1: 배경 제거 실행
  const processBgRemoval = useCallback(async () => {
    if (!cursor) return;
    const previous = takeSnapshot();
    setError(null);
    setState("processing");

    try {
      const blob = await removeBackground(cursor.originalFile);
      const url = URL.createObjectURL(blob);
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
      });

      pushHistory(previous);
      setCursor((prev) =>
        prev
          ? {
              ...prev,
              processedUrl: url,
              processedBlob: blob,
              sourceWidth: img.naturalWidth,
              sourceHeight: img.naturalHeight,
              renderedBlob: null,
            }
          : null
      );
      setState("editing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Background removal failed");
      setState("uploaded");
    }
  }, [cursor, pushHistory, takeSnapshot]);

  // UX-1: 배경 제거 건너뛰기
  const skipBgRemoval = useCallback(async () => {
    if (!cursor) return;
    const previous = takeSnapshot();

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = cursor.originalUrl;
    });

    const res = await fetch(cursor.originalUrl);
    const blob = await res.blob();

    pushHistory(previous);
    setCursor((prev) =>
      prev
        ? {
            ...prev,
            processedUrl: prev.originalUrl,
            processedBlob: blob,
            sourceWidth: img.naturalWidth,
            sourceHeight: img.naturalHeight,
            renderedBlob: null,
          }
        : null
    );
    setState("editing");
  }, [cursor, pushHistory, takeSnapshot]);

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
      pushHistory(takeSnapshot());
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
      pushHistory(takeSnapshot());
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
  }, [ani, cursor, pushHistory, state, takeSnapshot]);

  const setOffset = useCallback((x: number, y: number) => {
    if (state === "editing") {
      if (!cursor || (cursor.offsetX === x && cursor.offsetY === y)) return;
      pushHistory(takeSnapshot());
      setCursor((prev) => (prev ? { ...prev, offsetX: x, offsetY: y } : null));
      return;
    }

    if (state === "ani-editing") {
      if (!ani || (ani.offsetX === x && ani.offsetY === y)) return;
      pushHistory(takeSnapshot());
      setAni((prev) => (prev ? { ...prev, offsetX: x, offsetY: y } : null));
    }
  }, [ani, cursor, pushHistory, state, takeSnapshot]);

  const setScale = useCallback((scale: number) => {
    if (state === "editing") {
      if (!cursor || cursor.scale === scale) return;
      pushHistory(takeSnapshot());
      setCursor((prev) => (prev ? { ...prev, scale } : null));
      return;
    }

    if (state === "ani-editing") {
      if (!ani || ani.scale === scale) return;
      pushHistory(takeSnapshot());
      setAni((prev) => (prev ? { ...prev, scale } : null));
    }
  }, [ani, cursor, pushHistory, state, takeSnapshot]);

  const setFitMode = useCallback((fitMode: FitMode) => {
    if (state === "editing") {
      if (!cursor || cursor.fitMode === fitMode) return;
      pushHistory(takeSnapshot());
      setCursor((prev) => (prev ? { ...prev, fitMode } : null));
      return;
    }

    if (state === "ani-editing") {
      if (!ani || ani.fitMode === fitMode) return;
      pushHistory(takeSnapshot());
      setAni((prev) => (prev ? { ...prev, fitMode } : null));
    }
  }, [ani, cursor, pushHistory, state, takeSnapshot]);

  // UX-5: 커서 크기 변경
  const setCursorSize = useCallback((size: CursorSize) => {
    if (!cursor || cursor.cursorSize === size) return;
    pushHistory(takeSnapshot());
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
  }, [cursor, pushHistory, takeSnapshot]);

  const setAniCursorSize = useCallback((size: CursorSize) => {
    if (!ani || ani.cursorSize === size) return;
    pushHistory(takeSnapshot());
    setAni((prev) => (prev ? { ...prev, cursorSize: size } : null));
  }, [ani, pushHistory, takeSnapshot]);

  // UX-6: 커서 이름 변경
  const setCursorName = useCallback((name: string) => {
    if (state === "editing") {
      if (!cursor || cursor.cursorName === name) return;
      pushHistory(takeSnapshot());
      setCursor((prev) => (prev ? { ...prev, cursorName: name } : null));
      return;
    }

    if (state === "ani-editing") {
      if (!ani || ani.cursorName === name) return;
      pushHistory(takeSnapshot());
      setAni((prev) => (prev ? { ...prev, cursorName: name } : null));
    }
  }, [ani, cursor, pushHistory, state, takeSnapshot]);

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

      pushHistory(previous);
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

      pushHistory(previous);
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
  }, [ani, cursor, pushHistory, state, takeSnapshot]);

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
  }, [syncHistoryFlags, takeSnapshot]);

  useEffect(() => {
    return () => {
      const urls = new Set<string>();
      [takeSnapshot(), ...undoStackRef.current, ...redoStackRef.current].forEach(
        (snapshot) => collectSnapshotObjectUrls(snapshot, urls)
      );
      if (previewUrlRef.current) {
        urls.add(previewUrlRef.current);
      }
      urls.forEach((url) => safeRevokeObjectUrl(url));
    };
  }, [takeSnapshot]);

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

    if (!configuredSlotIds.length) return;

    setDownloading(true);
    setError(null);

    try {
      const entries = await Promise.all(
        configuredSlotIds.map(async (slotId) => {
          const slot = snapshot.project.slots[slotId];
          const runtime = snapshot.slotRuntime[slotId];

          if (slot.kind === "static" && runtime.cursor) {
            return {
              name: buildWindowsRolePackagePath(slotId),
              blob: await createCursorExportBlob(runtime.cursor),
            };
          }

          if (slot.kind === "animated" && runtime.ani) {
            return {
              name: buildWindowsRolePackagePath(slotId),
              blob: await createAniExportBlob(runtime.ani),
            };
          }

          return null;
        })
      );
      const configuredEntries = entries.filter(
        (entry): entry is { name: string; blob: Blob } => entry !== null
      );

      if (!configuredEntries.length) return;

      const fullSetZipBlob = await buildWindowsRoleMasterZip(configuredEntries);
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
    if (state === "ani-editing") {
      if (!ani) return;
      setDownloading(true);
      setError(null);

      try {
        const roleDownloadFilename =
          buildWindowsRoleDownloadFilename(selectedSlotId);
        const aniZipBlob = await createAniExportBlob(ani);

        const url = URL.createObjectURL(aniZipBlob);
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
        buildWindowsRoleDownloadFilename(selectedSlotId);
      const curBlob = await createCursorExportBlob(cursor);

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
    recommendHotspot,
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

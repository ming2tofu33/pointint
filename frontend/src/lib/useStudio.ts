"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  FitMode,
  mapViewportHotspotToOutput,
  rasterizeSquarePng,
  suggestViewportHotspot,
} from "@/lib/cursorFrame";
import {
  createCursorThemeProject,
  type CursorSize as ThemeCursorSize,
  type CursorThemeProject,
  type SlotId,
} from "@/lib/cursorThemeProject";
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

function revokeCursorObjectUrls(cursor: CursorData | null) {
  if (!cursor) return;
  if (cursor.processedUrl && cursor.processedUrl !== cursor.originalUrl) {
    URL.revokeObjectURL(cursor.processedUrl);
  }
  if (cursor.originalUrl) {
    URL.revokeObjectURL(cursor.originalUrl);
  }
}

function revokeAniObjectUrls(ani: AniData | null) {
  if (!ani?.originalUrl) return;
  URL.revokeObjectURL(ani.originalUrl);
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

function createEmptySlotRuntime(): Record<SlotId, SlotRuntime> {
  return {
    normal: { cursor: null, ani: null },
    text: { cursor: null, ani: null },
    link: { cursor: null, ani: null },
    button: { cursor: null, ani: null },
  };
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

function toSlotAssetUrl(cursor: CursorData) {
  return cursor.renderedBlob ? cursor.processedUrl : cursor.processedUrl;
}

export function useStudio() {
  const [state, setState] = useState<StudioState>("editing");
  const [project, setProject] = useState<CursorThemeProject>(() =>
    createCursorThemeProject()
  );
  const [slotRuntime, setSlotRuntime] = useState<Record<SlotId, SlotRuntime>>(
    () => createEmptySlotRuntime()
  );
  const [selectedSlotId, setSelectedSlotId] = useState<SlotId>("normal");
  const [editingSlotId, setEditingSlotId] = useState<SlotId>("normal");
  const [cursor, setCursor] = useState<CursorData | null>(null);
  const [ani, setAni] = useState<AniData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const selectedSlot = project.slots[selectedSlotId];
  const selectedSlotRuntime = slotRuntime[selectedSlotId];
  const selectedSlotBound = Boolean(
    selectedSlot.asset.originalUrl ||
      selectedSlot.asset.previewUrl ||
      selectedSlotRuntime.cursor ||
      selectedSlotRuntime.ani
  );

  const cleanupSlotReplacement = useCallback(
    (slotId: SlotId) => {
      revokeSlotRuntimeAssets(slotRuntime[slotId]);

      if (slotId !== selectedSlotId || !selectedSlotBound) {
        return;
      }

      revokeCursorObjectUrls(cursor);
      revokeAniObjectUrls(ani);
    },
    [ani, cursor, selectedSlotBound, selectedSlotId, slotRuntime]
  );

  const persistStaticSlot = useCallback(
    (slotId: SlotId, nextCursor: CursorData) => {
      setSlotRuntime((prev) => ({
        ...prev,
        [slotId]: { cursor: nextCursor, ani: null },
      }));

      setProject((prev) => ({
        ...prev,
        slots: {
          ...prev.slots,
          [slotId]: {
            ...prev.slots[slotId],
            kind: "static",
            asset: {
              fileName: nextCursor.originalFile.name,
              originalUrl: nextCursor.originalUrl,
              previewUrl: toSlotAssetUrl(nextCursor),
            },
            editing: {
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
          },
        },
      }));
    },
    []
  );

  const persistAnimatedSlot = useCallback(
    (slotId: SlotId, nextAni: AniData) => {
      setSlotRuntime((prev) => ({
        ...prev,
        [slotId]: { cursor: null, ani: nextAni },
      }));

      setProject((prev) => ({
        ...prev,
        slots: {
          ...prev.slots,
          [slotId]: {
            ...prev.slots[slotId],
            kind: "animated",
            asset: {
              fileName: nextAni.originalFile.name,
              originalUrl: nextAni.originalUrl,
              previewUrl: nextAni.originalUrl,
            },
            editing: {
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
          },
        },
      }));
    },
    []
  );

  const syncStaticSlotRuntime = useCallback(
    (slotId: SlotId, nextCursor: CursorData) => {
      setSlotRuntime((prev) => ({
        ...prev,
        [slotId]: { cursor: nextCursor, ani: null },
      }));

      setProject((prev) => ({
        ...prev,
        slots: {
          ...prev.slots,
          [slotId]: {
            ...prev.slots[slotId],
            kind: "static",
            asset: {
              fileName: nextCursor.originalFile.name,
              originalUrl: nextCursor.originalUrl,
              previewUrl: toSlotAssetUrl(nextCursor),
            },
            editing: {
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
          },
        },
      }));
    },
    []
  );

  const syncAnimatedSlotRuntime = useCallback(
    (slotId: SlotId, nextAni: AniData) => {
      setSlotRuntime((prev) => ({
        ...prev,
        [slotId]: { cursor: null, ani: nextAni },
      }));

      setProject((prev) => ({
        ...prev,
        slots: {
          ...prev.slots,
          [slotId]: {
            ...prev.slots[slotId],
            kind: "animated",
            asset: {
              fileName: nextAni.originalFile.name,
              originalUrl: nextAni.originalUrl,
              previewUrl: nextAni.originalUrl,
            },
            editing: {
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
          },
        },
      }));
    },
    []
  );

  const selectSlot = useCallback((slotId: SlotId) => {
    if (selectedSlotBound && cursor && state === "editing") {
      syncStaticSlotRuntime(selectedSlotId, cursor);
    }

    if (selectedSlotBound && ani && state === "ani-editing") {
      syncAnimatedSlotRuntime(selectedSlotId, ani);
    }

    setSelectedSlotId(slotId);
    setEditingSlotId(slotId);

    const slot = project.slots[slotId];
    const runtime = slotRuntime[slotId];

    if (slot.kind === "static" && runtime.cursor) {
      setPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
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
          URL.revokeObjectURL(prev);
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
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setCursor(null);
    setAni(null);
    setState("editing");
  }, [
    ani,
    cursor,
    project.slots,
    selectedSlotBound,
    selectedSlotId,
    slotRuntime,
    state,
    syncAnimatedSlotRuntime,
    syncStaticSlotRuntime,
  ]);

  // UX-1: 파일 선택 후 "uploaded" 상태 (배경 제거 여부 선택 전)
  const selectFile = useCallback(
    (file: File) => {
      setError(null);
      cleanupSlotReplacement("normal");

      setPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });

      const nextCursor = createCursorFromFile(file);
      setCursor(nextCursor);
      setAni(null);
      persistStaticSlot("normal", nextCursor);
      setState("uploaded");
    },
    [cleanupSlotReplacement, persistStaticSlot]
  );

  const selectAniFile = useCallback(
    async (file: File) => {
      setError(null);
      cleanupSlotReplacement("normal");

      setAni(null);

      const nextAni = createAniFromFile(file);

      try {
        const dimensions = await loadImageDimensions(nextAni.originalUrl);

        const hydratedAni = {
          ...nextAni,
          sourceWidth: dimensions.width,
          sourceHeight: dimensions.height,
        };

        persistAnimatedSlot("normal", hydratedAni);
        setAni(hydratedAni);
        setState("ani-editing");
      } catch (err) {
        URL.revokeObjectURL(nextAni.originalUrl);
        setError(err instanceof Error ? err.message : "Failed to load GIF");
        setState("editing");
      }
    },
    [cleanupSlotReplacement, persistAnimatedSlot]
  );

  const selectSelectedSlotStaticFile = useCallback(
    async (file: File) => {
      if (selectedSlotId === "normal") {
        selectFile(file);
        return;
      }

      setError(null);
      cleanupSlotReplacement(selectedSlotId);

      setPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });

      const nextCursor = createCursorFromFile(file);
      setCursor(nextCursor);
      setAni(null);
      persistStaticSlot(selectedSlotId, nextCursor);
      setState("editing");
    },
    [cleanupSlotReplacement, persistStaticSlot, selectFile, selectedSlotId]
  );

  const selectSelectedSlotAnimatedFile = useCallback(
    async (file: File) => {
      if (selectedSlotId === "normal") {
        await selectAniFile(file);
        return;
      }

      setError(null);
      cleanupSlotReplacement(selectedSlotId);

      setPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });

      const nextAni = createAniFromFile(file);

      try {
        const dimensions = await loadImageDimensions(nextAni.originalUrl);
        const hydratedAni = {
          ...nextAni,
          sourceWidth: dimensions.width,
          sourceHeight: dimensions.height,
        };

        setCursor(null);
        setAni(hydratedAni);
        persistAnimatedSlot(selectedSlotId, hydratedAni);
        setState("ani-editing");
      } catch (err) {
        URL.revokeObjectURL(nextAni.originalUrl);
        setError(err instanceof Error ? err.message : "Failed to load GIF");
      }
    },
    [cleanupSlotReplacement, persistAnimatedSlot, selectAniFile, selectedSlotId]
  );

  // UX-1: 배경 제거 실행
  const processBgRemoval = useCallback(async () => {
    if (!cursor) return;
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

      if (cursor.processedUrl !== cursor.originalUrl) {
        URL.revokeObjectURL(cursor.processedUrl);
      }

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
  }, [cursor]);

  // UX-1: 배경 제거 건너뛰기
  const skipBgRemoval = useCallback(async () => {
    if (!cursor) return;

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = cursor.originalUrl;
    });

    const res = await fetch(cursor.originalUrl);
    const blob = await res.blob();

    if (cursor.processedUrl !== cursor.originalUrl) {
      URL.revokeObjectURL(cursor.processedUrl);
    }

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
  }, [cursor]);

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
  }, [state]);

  const setOffset = useCallback((x: number, y: number) => {
    if (state === "editing") {
      setCursor((prev) => (prev ? { ...prev, offsetX: x, offsetY: y } : null));
      return;
    }

    if (state === "ani-editing") {
      setAni((prev) => (prev ? { ...prev, offsetX: x, offsetY: y } : null));
    }
  }, [state]);

  const setScale = useCallback((scale: number) => {
    if (state === "editing") {
      setCursor((prev) => (prev ? { ...prev, scale } : null));
      return;
    }

    if (state === "ani-editing") {
      setAni((prev) => (prev ? { ...prev, scale } : null));
    }
  }, [state]);

  const setFitMode = useCallback((fitMode: FitMode) => {
    if (state === "editing") {
      setCursor((prev) => (prev ? { ...prev, fitMode } : null));
      return;
    }

    if (state === "ani-editing") {
      setAni((prev) => (prev ? { ...prev, fitMode } : null));
    }
  }, [state]);

  // UX-5: 커서 크기 변경
  const setCursorSize = useCallback((size: CursorSize) => {
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
  }, []);

  const setAniCursorSize = useCallback((size: CursorSize) => {
    setAni((prev) => (prev ? { ...prev, cursorSize: size } : null));
  }, []);

  // UX-6: 커서 이름 변경
  const setCursorName = useCallback((name: string) => {
    if (state === "editing") {
      setCursor((prev) => (prev ? { ...prev, cursorName: name } : null));
      return;
    }

    if (state === "ani-editing") {
      setAni((prev) => (prev ? { ...prev, cursorName: name } : null));
    }
  }, [state]);

  const recommendHotspot = useCallback(async () => {
    if (state === "editing") {
      if (!cursor || !cursor.sourceWidth || !cursor.sourceHeight) {
        return;
      }

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
  }, [ani, cursor, state]);

  const reset = useCallback(() => {
    revokeCursorObjectUrls(cursor);
    revokeAniObjectUrls(ani);
    Object.values(slotRuntime).forEach((runtime) => revokeSlotRuntimeAssets(runtime));
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setCursor(null);
    setAni(null);
    setProject(createCursorThemeProject());
    setSelectedSlotId("normal");
    setEditingSlotId("normal");
    setPreviewUrl(null);
    setState("editing");
    setError(null);
    setShowOriginal(false);
  }, [ani, cursor, previewUrl, slotRuntime]);

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
              URL.revokeObjectURL(prev);
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

  const download = useCallback(async () => {
    if (state === "ani-editing") {
      if (!ani) return;
      setDownloading(true);
      setError(null);

      try {
        const safeAniName = sanitizeCursorName(ani.cursorName);
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
        const aniZipBlob = await ensureAniZipPackage(
          aniDownload,
          safeAniName
        );

        const url = URL.createObjectURL(aniZipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pointint-${safeAniName}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
      const pngBlob = cursor.renderedBlob ?? cursor.processedBlob;
      const renderedHotspot =
        cursor.renderedBlob !== null
          ? {
              x: cursor.renderedHotspotX,
              y: cursor.renderedHotspotY,
            }
          : getRenderedHotspot(
              cursor.hotspotX,
              cursor.hotspotY,
              cursor.cursorSize
            );

      const curBlob = await generateCursor(
        pngBlob,
        renderedHotspot.x,
        renderedHotspot.y,
        cursor.cursorSize,
        cursor.cursorName
      );

      const url = URL.createObjectURL(curBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pointint-${cursor.cursorName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
  }, [ani, cursor, state]);

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
    reset,
    download,
    closeGuide,
  };
}

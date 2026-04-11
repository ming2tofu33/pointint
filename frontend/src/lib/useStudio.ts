"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  FitMode,
  mapViewportHotspotToOutput,
  rasterizeSquarePng,
} from "@/lib/cursorFrame";
import {
  isSelectableWorkflow,
  type StudioState,
  type WorkflowOptionId,
} from "@/lib/studioWorkflow";

import { generateCursor, removeBackground } from "./api";

export type CursorSize = 32 | 48 | 64;

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

export function useStudio() {
  const [state, setState] = useState<StudioState>("workflow-pick");
  const [cursor, setCursor] = useState<CursorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const selectWorkflow = useCallback((workflowId: WorkflowOptionId) => {
    if (!isSelectableWorkflow(workflowId)) return;
    setError(null);
    setState("cur-upload");
  }, []);

  // UX-1: 파일 선택 후 "uploaded" 상태 (배경 제거 여부 선택 전)
  const selectFile = useCallback(
    (file: File) => {
      setError(null);

      if (cursor?.processedUrl && cursor.processedUrl !== cursor.originalUrl) {
        URL.revokeObjectURL(cursor.processedUrl);
      }
      if (cursor?.originalUrl) {
        URL.revokeObjectURL(cursor.originalUrl);
      }

      const url = URL.createObjectURL(file);
      const renderedHotspot = getRenderedHotspot(0, 0, 32);

      setPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });

      setCursor({
        originalFile: file,
        originalUrl: url,
        processedUrl: url,
        processedBlob: file,
        sourceWidth: 0,
        sourceHeight: 0,
        hotspotX: 0,
        hotspotY: 0,
        renderedHotspotX: renderedHotspot.x,
        renderedHotspotY: renderedHotspot.y,
        renderedBlob: null,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        fitMode: "contain",
        cursorSize: 32,
        cursorName: "cursor",
      });
      setState("uploaded");
    },
    [cursor]
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
    setCursor((prev) => {
      if (!prev) return null;
      const renderedHotspot = getRenderedHotspot(x, y, prev.cursorSize);
      return {
        ...prev,
        hotspotX: x,
        hotspotY: y,
        renderedHotspotX: renderedHotspot.x,
        renderedHotspotY: renderedHotspot.y,
      };
    });
  }, []);

  const setOffset = useCallback((x: number, y: number) => {
    setCursor((prev) => (prev ? { ...prev, offsetX: x, offsetY: y } : null));
  }, []);

  const setScale = useCallback((scale: number) => {
    setCursor((prev) => (prev ? { ...prev, scale } : null));
  }, []);

  const setFitMode = useCallback((fitMode: FitMode) => {
    setCursor((prev) => (prev ? { ...prev, fitMode } : null));
  }, []);

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

  // UX-6: 커서 이름 변경
  const setCursorName = useCallback((name: string) => {
    setCursor((prev) => (prev ? { ...prev, cursorName: name } : null));
  }, []);

  const reset = useCallback(() => {
    if (cursor?.processedUrl && cursor.processedUrl !== cursor.originalUrl) {
      URL.revokeObjectURL(cursor.processedUrl);
    }
    if (cursor?.originalUrl) {
      URL.revokeObjectURL(cursor.originalUrl);
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setCursor(null);
    setPreviewUrl(null);
    setState("workflow-pick");
    setError(null);
    setShowOriginal(false);
  }, [cursor, previewUrl]);

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

  const download = useCallback(async () => {
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
      setShowGuide(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }, [cursor]);

  const closeGuide = useCallback(() => setShowGuide(false), []);

  return {
    state,
    cursor,
    error,
    downloading,
    showGuide,
    showOriginal,
    previewUrl,
    selectFile,
    selectWorkflow,
    processBgRemoval,
    skipBgRemoval,
    toggleOriginal,
    retryBgRemoval,
    setHotspot,
    setOffset,
    setScale,
    setFitMode,
    setCursorSize,
    setCursorName,
    reset,
    download,
    closeGuide,
  };
}

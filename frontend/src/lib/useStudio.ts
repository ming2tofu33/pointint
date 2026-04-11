"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateCursor, removeBackground } from "./api";
import {
  EDITOR_VIEWPORT_SIZE,
  FitMode,
  clampCoordinate,
  mapViewportHotspotToOutput,
  rasterizeSquarePng,
} from "./cursorFrame";

export type StudioState =
  | "idle"
  | "uploaded"
  | "processing"
  | "editing";

export type CursorSize = 32 | 48 | 64;

export interface RenderedCursorAsset {
  blob: Blob;
  url: string;
  hotspotX: number;
  hotspotY: number;
  size: CursorSize;
}

export interface CursorData {
  originalFile: File;
  originalUrl: string;
  processedUrl: string;
  processedBlob: Blob;
  width: number;
  height: number;
  hotspotX: number;
  hotspotY: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  fitMode: FitMode;
  cursorSize: CursorSize;
  cursorName: string;
}

export function useStudio() {
  const [state, setState] = useState<StudioState>("idle");
  const [cursor, setCursor] = useState<CursorData | null>(null);
  const [rendered, setRendered] = useState<RenderedCursorAsset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const renderTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const renderVersionRef = useRef(0);

  const invalidateRenderPipeline = useCallback(() => {
    renderVersionRef.current += 1;
    if (renderTimerRef.current) {
      clearTimeout(renderTimerRef.current);
      renderTimerRef.current = undefined;
    }
  }, []);

  const replaceRendered = useCallback((next: RenderedCursorAsset | null) => {
    setRendered((prev) => {
      if (prev?.url && prev.url !== next?.url) {
        URL.revokeObjectURL(prev.url);
      }
      return next;
    });
  }, []);

  const buildRenderedAsset = useCallback(async (source: CursorData) => {
    const blob = await rasterizeSquarePng({
      imageUrl: source.processedUrl,
      imageWidth: source.width,
      imageHeight: source.height,
      outputSize: source.cursorSize,
      sourceViewportSize: EDITOR_VIEWPORT_SIZE,
      fitMode: source.fitMode,
      scale: source.scale,
      offsetX: source.offsetX,
      offsetY: source.offsetY,
    });

    const mappedHotspot = mapViewportHotspotToOutput({
      hotspotX: source.hotspotX,
      hotspotY: source.hotspotY,
      viewportSize: EDITOR_VIEWPORT_SIZE,
      outputSize: source.cursorSize,
    });

    return {
      blob,
      url: URL.createObjectURL(blob),
      hotspotX: mappedHotspot.x,
      hotspotY: mappedHotspot.y,
      size: source.cursorSize,
    } satisfies RenderedCursorAsset;
  }, []);

  const selectFile = useCallback(
    (file: File) => {
      setError(null);
      invalidateRenderPipeline();
      replaceRendered(null);
      const url = URL.createObjectURL(file);
      setCursor({
        originalFile: file,
        originalUrl: url,
        processedUrl: url,
        processedBlob: file,
        width: 0,
        height: 0,
        hotspotX: 0,
        hotspotY: 0,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        fitMode: "contain",
        cursorSize: 32,
        cursorName: "cursor",
      });
      setState("uploaded");
    },
    [invalidateRenderPipeline, replaceRendered]
  );

  const processBgRemoval = useCallback(async () => {
    if (!cursor) return;
    setError(null);
    setState("processing");

    try {
      invalidateRenderPipeline();
      replaceRendered(null);
      const blob = await removeBackground(cursor.originalFile);
      const url = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
      });

      setCursor((prev) =>
        prev
          ? {
              ...prev,
              processedUrl: url,
              processedBlob: blob,
              width: img.naturalWidth,
              height: img.naturalHeight,
            }
          : null
      );
      setState("editing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Background removal failed");
      setState("uploaded");
    }
  }, [cursor, invalidateRenderPipeline, replaceRendered]);

  const skipBgRemoval = useCallback(async () => {
    if (!cursor) return;
    invalidateRenderPipeline();
    replaceRendered(null);

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = cursor.originalUrl;
    });

    const res = await fetch(cursor.originalUrl);
    const blob = await res.blob();

    setCursor((prev) =>
      prev
        ? {
            ...prev,
            processedUrl: prev.originalUrl,
            processedBlob: blob,
            width: img.naturalWidth,
            height: img.naturalHeight,
          }
        : null
    );
    setState("editing");
  }, [cursor, invalidateRenderPipeline, replaceRendered]);

  const toggleOriginal = useCallback(() => setShowOriginal((v) => !v), []);

  const retryBgRemoval = useCallback(async () => {
    setShowOriginal(false);
    await processBgRemoval();
  }, [processBgRemoval]);

  const setHotspot = useCallback((x: number, y: number) => {
    setCursor((prev) =>
      prev
        ? {
            ...prev,
            hotspotX: clampCoordinate(x, EDITOR_VIEWPORT_SIZE - 1),
            hotspotY: clampCoordinate(y, EDITOR_VIEWPORT_SIZE - 1),
          }
        : null
    );
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

  const setCursorSize = useCallback((size: CursorSize) => {
    setCursor((prev) => (prev ? { ...prev, cursorSize: size } : null));
  }, []);

  const setCursorName = useCallback((name: string) => {
    setCursor((prev) => (prev ? { ...prev, cursorName: name } : null));
  }, []);

  const reset = useCallback(() => {
    invalidateRenderPipeline();
    if (cursor?.processedUrl && cursor.processedUrl !== cursor.originalUrl) {
      URL.revokeObjectURL(cursor.processedUrl);
    }
    if (cursor?.originalUrl) {
      URL.revokeObjectURL(cursor.originalUrl);
    }
    replaceRendered(null);
    setCursor(null);
    setState("idle");
    setError(null);
    setShowOriginal(false);
  }, [cursor, invalidateRenderPipeline, replaceRendered]);

  useEffect(() => {
    if (!cursor || state !== "editing") return;
    if (!cursor.width || !cursor.height) return;

    if (renderTimerRef.current) clearTimeout(renderTimerRef.current);

    const version = renderVersionRef.current + 1;
    renderVersionRef.current = version;

    renderTimerRef.current = setTimeout(() => {
      buildRenderedAsset(cursor)
        .then((asset) => {
          if (renderVersionRef.current !== version) {
            URL.revokeObjectURL(asset.url);
            return;
          }
          replaceRendered(asset);
        })
        .catch((err) => {
          if (renderVersionRef.current !== version) return;
          setError(err instanceof Error ? err.message : "Preview render failed");
        });
    }, 120);

    return () => {
      if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
    };
  }, [
    state,
    cursor,
    cursor?.width,
    cursor?.height,
    cursor?.processedUrl,
    cursor?.cursorSize,
    cursor?.fitMode,
    cursor?.scale,
    cursor?.offsetX,
    cursor?.offsetY,
    cursor?.hotspotX,
    cursor?.hotspotY,
    buildRenderedAsset,
    replaceRendered,
  ]);

  const download = useCallback(async () => {
    if (!cursor) return;
    setDownloading(true);
    setError(null);

    try {
      const renderedAsset = await buildRenderedAsset(cursor);
      replaceRendered(renderedAsset);

      const curBlob = await generateCursor(
        renderedAsset.blob,
        renderedAsset.hotspotX,
        renderedAsset.hotspotY,
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
  }, [cursor, buildRenderedAsset, replaceRendered]);

  const closeGuide = useCallback(() => setShowGuide(false), []);
  const previewUrl = rendered?.url ?? null;

  return {
    state,
    cursor,
    rendered,
    error,
    downloading,
    showGuide,
    showOriginal,
    previewUrl,
    selectFile,
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

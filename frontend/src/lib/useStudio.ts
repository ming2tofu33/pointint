"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateCursor, removeBackground } from "./api";

export type StudioState =
  | "idle"
  | "uploaded"
  | "processing"
  | "editing";

export type CursorSize = 32 | 48 | 64;

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
  cursorSize: CursorSize;
  cursorName: string;
}

export function useStudio() {
  const [state, setState] = useState<StudioState>("idle");
  const [cursor, setCursor] = useState<CursorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // UX-1: 파일 선택 → "uploaded" 상태 (배경 제거 여부 선택 전)
  const selectFile = useCallback((file: File) => {
    setError(null);
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
      cursorSize: 32,
      cursorName: "cursor",
    });
    setState("uploaded");
  }, []);

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

    // 원본을 Blob으로 변환
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
  }, [cursor]);

  // UX-4: 원본/결과 토글
  const [showOriginal, setShowOriginal] = useState(false);
  const toggleOriginal = useCallback(() => setShowOriginal((v) => !v), []);

  // UX-4: 배경 제거 재시도
  const retryBgRemoval = useCallback(async () => {
    setShowOriginal(false);
    await processBgRemoval();
  }, [processBgRemoval]);

  const setHotspot = useCallback((x: number, y: number) => {
    setCursor((prev) => (prev ? { ...prev, hotspotX: x, hotspotY: y } : null));
  }, []);

  const setOffset = useCallback((x: number, y: number) => {
    setCursor((prev) => (prev ? { ...prev, offsetX: x, offsetY: y } : null));
  }, []);

  const setScale = useCallback((scale: number) => {
    setCursor((prev) => (prev ? { ...prev, scale } : null));
  }, []);

  // UX-5: 커서 크기 변경
  const setCursorSize = useCallback((size: CursorSize) => {
    setCursor((prev) => (prev ? { ...prev, cursorSize: size } : null));
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
    setState("idle");
    setError(null);
    setShowOriginal(false);
  }, [cursor, previewUrl]);

  // UX-2 + UX-3: 32px 미리보기 URL 생성 (debounced)
  useEffect(() => {
    if (!cursor || state !== "editing") return;

    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);

    previewTimerRef.current = setTimeout(() => {
      const size = cursor.cursorSize;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // 비율 유지하며 캔버스에 맞춤
        const scale = Math.min(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (size - w) / 2;
        const y = (size - h) / 2;
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, x, y, w, h);

        canvas.toBlob((blob) => {
          if (!blob) return;
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(URL.createObjectURL(blob));
        }, "image/png");
      };
      img.src = cursor.processedUrl;
    }, 200);

    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [cursor?.processedUrl, cursor?.cursorSize, state]);

  const download = useCallback(async () => {
    if (!cursor) return;
    setDownloading(true);
    setError(null);

    try {
      const curBlob = await generateCursor(
        cursor.processedBlob,
        cursor.hotspotX,
        cursor.hotspotY,
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
    processBgRemoval,
    skipBgRemoval,
    toggleOriginal,
    retryBgRemoval,
    setHotspot,
    setOffset,
    setScale,
    setCursorSize,
    setCursorName,
    reset,
    download,
    closeGuide,
  };
}

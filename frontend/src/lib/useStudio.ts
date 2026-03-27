"use client";

import { useCallback, useState } from "react";
import { removeBackground } from "./api";

export type StudioState = "idle" | "uploading" | "processing" | "editing";

export interface CursorData {
  originalFile: File;
  processedUrl: string;
  processedBlob: Blob;
  width: number;
  height: number;
  hotspotX: number;
  hotspotY: number;
  offsetX: number;
  offsetY: number;
  scale: number;
}

export function useStudio() {
  const [state, setState] = useState<StudioState>("idle");
  const [cursor, setCursor] = useState<CursorData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    setError(null);
    setState("processing");

    try {
      const blob = await removeBackground(file);
      const url = URL.createObjectURL(blob);

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
      });

      setCursor({
        originalFile: file,
        processedUrl: url,
        processedBlob: blob,
        width: img.naturalWidth,
        height: img.naturalHeight,
        hotspotX: 0,
        hotspotY: 0,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
      });
      setState("editing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setState("idle");
    }
  }, []);

  const setHotspot = useCallback((x: number, y: number) => {
    setCursor((prev) => (prev ? { ...prev, hotspotX: x, hotspotY: y } : null));
  }, []);

  const setOffset = useCallback((x: number, y: number) => {
    setCursor((prev) => (prev ? { ...prev, offsetX: x, offsetY: y } : null));
  }, []);

  const setScale = useCallback((scale: number) => {
    setCursor((prev) => (prev ? { ...prev, scale } : null));
  }, []);

  const reset = useCallback(() => {
    if (cursor?.processedUrl) {
      URL.revokeObjectURL(cursor.processedUrl);
    }
    setCursor(null);
    setState("idle");
    setError(null);
  }, [cursor]);

  return { state, cursor, error, upload, setHotspot, setOffset, setScale, reset };
}

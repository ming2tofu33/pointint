"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import CursorSimulationSurface from "@/components/CursorSimulationSurface";
import {
  buildAniPreviewFrameStack,
  createAniPreviewSourceFromFrames,
  releaseAniPreviewFrames,
} from "@/lib/aniPreviewFrames";
import { type FitMode } from "@/lib/cursorFrame";
import { type CursorSource } from "@/lib/cursorSources";
import { type SlotId } from "@/lib/cursorThemeProject";
import {
  hasNormalSlotSimulationSource,
  type SlotSimulationSources,
} from "@/lib/slotSimulationSources";
import { type AniPreviewRenderedFrameStack } from "@/lib/aniPreviewFrames";

interface AniSimulationProps {
  imageUrl: string;
  sourceWidth: number;
  sourceHeight: number;
  fitMode: FitMode;
  offsetX: number;
  offsetY: number;
  scale: number;
  cursorSize: number;
  hotspotX: number;
  hotspotY: number;
  slotSources?: SlotSimulationSources;
  selectedSlotId?: SlotId;
}

const ANI_PREVIEW_VIEWPORT_SIZE = 256;
const ANI_PREVIEW_REBUILD_DEBOUNCE_MS = 140;
type PreviewStatus = "loading" | "ready" | "unavailable";

export default function AniSimulation({
  imageUrl,
  sourceWidth,
  sourceHeight,
  fitMode,
  offsetX,
  offsetY,
  scale,
  cursorSize,
  hotspotX,
  hotspotY,
  slotSources,
  selectedSlotId,
}: AniSimulationProps) {
  const [previewFrameStack, setPreviewFrameStack] =
    useState<AniPreviewRenderedFrameStack | null>(null);
  const [previewStatus, setPreviewStatus] =
    useState<PreviewStatus>("loading");
  const animationStartedAtRef = useRef(Date.now());
  const latestRequestIdRef = useRef(0);
  const activeBuildCountRef = useRef(0);
  const rebuildTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStartedImageUrlRef = useRef<string | null>(null);
  const committedFrameUrlsRef = useRef<string[]>([]);
  const t = useTranslations("simulation");

  useEffect(() => {
    animationStartedAtRef.current = Date.now();
  }, [imageUrl]);

  useEffect(() => {
    let cancelled = false;
    const requestId = ++latestRequestIdRef.current;
    const imageChanged = lastStartedImageUrlRef.current !== imageUrl;
    const shouldDebounce =
      !imageChanged &&
      (previewFrameStack !== null ||
        activeBuildCountRef.current > 0 ||
        rebuildTimerRef.current !== null);

    clearPendingAniPreviewRebuild(rebuildTimerRef);

    if (!previewFrameStack) {
      setPreviewStatus("loading");
    }

    const startBuild = () => {
      lastStartedImageUrlRef.current = imageUrl;
      activeBuildCountRef.current += 1;

      buildAniPreviewFrameStack({
        imageUrl,
        sourceWidth,
        sourceHeight,
        fitMode,
        scale,
        offsetX,
        offsetY,
        outputSize: cursorSize,
        editorViewportSize: ANI_PREVIEW_VIEWPORT_SIZE,
      })
        .then((nextStack) => {
          if (cancelled || requestId !== latestRequestIdRef.current) {
            nextStack.frames.forEach((frame) => URL.revokeObjectURL(frame.src));
            return;
          }

          setPreviewFrameStack(nextStack);
          setPreviewStatus("ready");
        })
        .catch(() => {
          if (cancelled || requestId !== latestRequestIdRef.current) return;
          setPreviewFrameStack(null);
          setPreviewStatus("unavailable");
        })
        .finally(() => {
          activeBuildCountRef.current = Math.max(
            0,
            activeBuildCountRef.current - 1
          );
        });
    };

    if (shouldDebounce) {
      rebuildTimerRef.current = setTimeout(() => {
        rebuildTimerRef.current = null;
        startBuild();
      }, ANI_PREVIEW_REBUILD_DEBOUNCE_MS);
    } else {
      startBuild();
    }

    return () => {
      cancelled = true;
      clearPendingAniPreviewRebuild(rebuildTimerRef);
    };
  }, [
    cursorSize,
    fitMode,
    imageUrl,
    offsetX,
    offsetY,
    scale,
    sourceHeight,
    sourceWidth,
  ]);

  useEffect(() => {
    const previousFrameUrls = committedFrameUrlsRef.current;
    const nextFrameUrls = previewFrameStack?.frames.map((frame) => frame.src) ?? [];
    committedFrameUrlsRef.current = nextFrameUrls;
    previousFrameUrls.forEach((url) => safeRevokeObjectURL(url));
  }, [previewFrameStack]);

  useEffect(() => {
    return () => {
      committedFrameUrlsRef.current.forEach((url) => safeRevokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    return () => {
      releaseAniPreviewFrames(imageUrl);
    };
  }, [imageUrl]);

  const previewSource = useMemo<CursorSource | null>(() => {
    if (!previewFrameStack) {
      return null;
    }

    return createAniPreviewSourceFromFrames(previewFrameStack, {
      hotspotX,
      hotspotY,
      outputSize: cursorSize,
      editorViewportSize: ANI_PREVIEW_VIEWPORT_SIZE,
      startedAt: animationStartedAtRef.current,
    });
  }, [cursorSize, hotspotX, hotspotY, previewFrameStack]);

  const previewTitle =
    previewStatus === "unavailable"
      ? t("previewUnavailable")
      : t("previewLoading");

  const previewBody =
    previewStatus === "unavailable"
      ? t("previewUnavailableBody")
      : t("previewLoadingBody");

  const mergedSlotSources = useMemo(() => {
    if (!slotSources || !selectedSlotId || !previewSource) {
      return slotSources;
    }

    return {
      ...slotSources,
      [selectedSlotId]: previewSource,
    } satisfies SlotSimulationSources;
  }, [previewSource, selectedSlotId, slotSources]);

  if (mergedSlotSources && !hasNormalSlotSimulationSource(mergedSlotSources)) {
    return renderAniPlaceholder(previewTitle, previewBody, t("instruction"));
  }

  return (
    <div
      data-testid="ani-simulation"
      style={{
        display: "flex",
        height: "100%",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minWidth: 0,
        }}
      >
        {previewSource ? (
          <CursorSimulationSurface
            source={previewSource}
            slotSources={mergedSlotSources}
            placeholder={renderAniPlaceholder(
              previewTitle,
              previewBody,
              t("instruction")
            )}
          />
        ) : (
          renderAniPlaceholder(previewTitle, previewBody, t("instruction"))
        )}
      </div>
    </div>
  );
}

function renderAniPlaceholder(title: string, body: string, instruction: string) {
  return (
    <div
      data-testid="ani-simulation-placeholder"
      style={{
        flex: 1,
        backgroundColor: "var(--color-bg-primary)",
        padding: "1rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "0.625rem",
        transition: "background-color 0.3s",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--color-text-muted)",
          userSelect: "none",
        }}
      >
        {title}
      </p>

      <p
        style={{
          fontSize: "0.8125rem",
          color: "var(--color-text-primary)",
          lineHeight: 1.5,
        }}
      >
        {body}
      </p>

      <p
        style={{
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
        }}
      >
        {instruction}
      </p>
    </div>
  );
}

function clearPendingAniPreviewRebuild(
  rebuildTimerRef: { current: ReturnType<typeof setTimeout> | null }
) {
  if (rebuildTimerRef.current !== null) {
    clearTimeout(rebuildTimerRef.current);
    rebuildTimerRef.current = null;
  }
}

function safeRevokeObjectURL(url: string) {
  if (typeof URL.revokeObjectURL === "function") {
    URL.revokeObjectURL(url);
  }
}

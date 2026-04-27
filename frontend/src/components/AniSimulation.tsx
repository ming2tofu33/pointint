"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import CursorSimulationSurface, {
  getSimulationThemeVariables,
  type SimulationThemeMode,
} from "@/components/CursorSimulationSurface";
import {
  buildAniPreviewFrameStack,
  createAniPreviewSourceFromFrames,
  releaseAniPreviewFrames,
} from "@/lib/aniPreviewFrames";
import { type FitMode, type ImageRotation } from "@/lib/cursorFrame";
import { type CursorSource } from "@/lib/cursorSources";
import { type SlotId } from "@/lib/cursorThemeProject";
import { type SimulationSceneId } from "@/lib/simulationScenes";
import {
  hasNormalSlotSimulationSource,
  type SlotSimulationSources,
} from "@/lib/slotSimulationSources";
import { type AniPreviewRenderedFrameStack } from "@/lib/aniPreviewFrames";

interface AniSimulationProps {
  imageUrl?: string | null;
  sourceWidth?: number;
  sourceHeight?: number;
  fitMode: FitMode;
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation?: ImageRotation;
  flipX?: boolean;
  flipY?: boolean;
  cursorSize: number;
  hotspotX: number;
  hotspotY: number;
  slotSources?: SlotSimulationSources;
  selectedSlotId?: SlotId;
  themeMode?: SimulationThemeMode;
  sceneId?: SimulationSceneId;
}

const ANI_PREVIEW_VIEWPORT_SIZE = 256;
const ANI_PREVIEW_REBUILD_DEBOUNCE_MS = 140;
type PreviewStatus = "loading" | "ready" | "unavailable";

export default function AniSimulation({
  imageUrl,
  sourceWidth = 0,
  sourceHeight = 0,
  fitMode,
  offsetX,
  offsetY,
  scale,
  rotation = 0,
  flipX = false,
  flipY = false,
  cursorSize,
  hotspotX,
  hotspotY,
  slotSources,
  selectedSlotId,
  themeMode = "dark",
  sceneId,
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
    if (!imageUrl) {
      setPreviewFrameStack(null);
      setPreviewStatus("ready");
      lastStartedImageUrlRef.current = null;
      clearPendingAniPreviewRebuild(rebuildTimerRef);
      return;
    }

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
        rotation,
        flipX,
        flipY,
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
    rotation,
    flipX,
    flipY,
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
    if (!imageUrl) {
      return;
    }
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
    return renderAniPlaceholder(
      previewTitle,
      previewBody,
      t("instruction"),
      themeMode
    );
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
              t("instruction"),
              themeMode
            )}
            themeMode={themeMode}
            sceneId={sceneId}
          />
        ) : (
          renderAniPlaceholder(
            previewTitle,
            previewBody,
            t("instruction"),
            themeMode
          )
        )}
      </div>
    </div>
  );
}

function renderAniPlaceholder(
  title: string,
  body: string,
  instruction: string,
  themeMode: SimulationThemeMode
) {
  return (
    <div
      data-testid="ani-simulation-placeholder"
      style={{
        ...getSimulationThemeVariables(themeMode),
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "var(--simulation-scene-surface, #fff)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "1rem",
        padding: "2rem",
        maxWidth: "24rem",
        backgroundColor: "var(--simulation-scene-bg, #f3f3f3)",
        border: "1px solid var(--simulation-panel-border, #e5e5e5)",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)",
        transition: "all 0.4s ease",
      }}>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--simulation-link)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            margin: 0,
            fontWeight: 600,
          }}
        >
          {title}
        </p>

        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--simulation-panel-text)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {body}
        </p>

        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            backgroundColor: "var(--simulation-panel-elevated)",
            border: "1px solid var(--simulation-panel-border, #e5e5e5)",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--simulation-panel-muted)",
              margin: 0,
            }}
          >
            {instruction}
          </p>
        </div>
      </div>
    </div>
  );
}

function clearPendingAniPreviewRebuild(rebuildTimerRef: {
  current: ReturnType<typeof setTimeout> | null;
}) {
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

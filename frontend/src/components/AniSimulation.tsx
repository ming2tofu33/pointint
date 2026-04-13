"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import CursorSimulationSurface from "@/components/CursorSimulationSurface";
import FramedCursorPreview from "@/components/FramedCursorPreview";
import {
  buildAniPreviewFrameStack,
  createAniPreviewSourceFromFrames,
  releaseAniPreviewFrames,
} from "@/lib/aniPreviewFrames";
import { type FitMode } from "@/lib/cursorFrame";
import { type CursorSource } from "@/lib/cursorSources";
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
}

const ANI_PREVIEW_VIEWPORT_SIZE = 256;
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
}: AniSimulationProps) {
  const [previewFrameStack, setPreviewFrameStack] =
    useState<AniPreviewRenderedFrameStack | null>(null);
  const [previewStatus, setPreviewStatus] =
    useState<PreviewStatus>("loading");
  const t = useTranslations("simulation");

  useEffect(() => {
    let active = true;
    let frameUrls: string[] = [];

    setPreviewFrameStack(null);
    setPreviewStatus("loading");

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
        if (!active) {
          nextStack.frames.forEach((frame) => URL.revokeObjectURL(frame.src));
          return;
        }

        frameUrls = nextStack.frames.map((frame) => frame.src);
        setPreviewFrameStack(nextStack);
        setPreviewStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setPreviewFrameStack(null);
        setPreviewStatus("unavailable");
      });

    return () => {
      active = false;
      frameUrls.forEach((url) => safeRevokeObjectURL(url));
      releaseAniPreviewFrames(imageUrl);
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

  const previewSource = useMemo<CursorSource | null>(() => {
    if (!previewFrameStack) {
      return null;
    }

    return createAniPreviewSourceFromFrames(previewFrameStack, {
      hotspotX,
      hotspotY,
      outputSize: cursorSize,
      editorViewportSize: ANI_PREVIEW_VIEWPORT_SIZE,
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

  return (
    <div
      data-testid="ani-simulation"
      style={{
        display: "flex",
        height: "100%",
        gap: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          alignItems: "center",
          padding: "0 2rem",
          borderRight: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        <PreviewBox label={t("normal")}>
          <FramedCursorPreview
            imageUrl={imageUrl}
            sourceWidth={sourceWidth}
            sourceHeight={sourceHeight}
            fitMode={fitMode}
            offsetX={offsetX}
            offsetY={offsetY}
            scale={scale}
            viewportSize={cursorSize}
            alt={t("normal")}
          />
        </PreviewBox>
        <PreviewBox label={t("text")}>
          <FramedCursorPreview
            imageUrl={imageUrl}
            sourceWidth={sourceWidth}
            sourceHeight={sourceHeight}
            fitMode={fitMode}
            offsetX={offsetX}
            offsetY={offsetY}
            scale={scale}
            viewportSize={cursorSize}
            alt={t("text")}
          />
        </PreviewBox>
        <PreviewBox label={t("link")}>
          <FramedCursorPreview
            imageUrl={imageUrl}
            sourceWidth={sourceWidth}
            sourceHeight={sourceHeight}
            fitMode={fitMode}
            offsetX={offsetX}
            offsetY={offsetY}
            scale={scale}
            viewportSize={cursorSize}
            alt={t("link")}
          />
        </PreviewBox>
      </div>

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
          <CursorSimulationSurface source={previewSource} />
        ) : (
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
              {previewTitle}
            </p>

            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-text-primary)",
                lineHeight: 1.5,
              }}
            >
              {previewBody}
            </p>

            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
              }}
            >
              {t("instruction")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function safeRevokeObjectURL(url: string) {
  if (typeof URL.revokeObjectURL === "function") {
    URL.revokeObjectURL(url);
  }
}

function PreviewBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <div
        style={{
          width: "4rem",
          height: "4rem",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
      <span
        style={{
          fontSize: "0.5625rem",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

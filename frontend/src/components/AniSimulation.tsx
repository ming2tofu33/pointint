"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { type FitMode } from "@/lib/cursorFrame";

import FramedCursorPreview from "@/components/FramedCursorPreview";

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

type BgMode = "light" | "dark";

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
  const [bgMode, setBgMode] = useState<BgMode>("dark");
  const [pointer, setPointer] = useState({ x: 160, y: 72 });
  const areaRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("simulation");

  const bgColor = bgMode === "dark" ? "#1a1a1a" : "#f0f0f0";
  const textColor = bgMode === "dark" ? "#ccc" : "#333";
  const linkColor = bgMode === "dark" ? "#6eaaf5" : "#1a6ed8";
  const mutedColor = bgMode === "dark" ? "#666" : "#999";

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;

    setPointer({
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top),
    });
  }

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
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.75rem",
            display: "flex",
            gap: "0.25rem",
            zIndex: 5,
          }}
        >
          <BgToggle
            mode="light"
            active={bgMode === "light"}
            onClick={() => setBgMode("light")}
            label={t("bgLight")}
          />
          <BgToggle
            mode="dark"
            active={bgMode === "dark"}
            onClick={() => setBgMode("dark")}
            label={t("bgDark")}
          />
        </div>

        <div
          ref={areaRef}
          onMouseMove={handleMouseMove}
          style={{
            flex: 1,
            backgroundColor: bgColor,
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "0.625rem",
            transition: "background-color 0.3s",
            overflow: "hidden",
            position: "relative",
            cursor: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `${pointer.x - hotspotX}px`,
              top: `${pointer.y - hotspotY}px`,
              pointerEvents: "none",
              zIndex: 4,
            }}
          >
            <FramedCursorPreview
              imageUrl={imageUrl}
              sourceWidth={sourceWidth}
              sourceHeight={sourceHeight}
              fitMode={fitMode}
              offsetX={offsetX}
              offsetY={offsetY}
              scale={scale}
              viewportSize={cursorSize}
              alt={t("instruction")}
            />
          </div>

          <p
            style={{
              fontSize: "0.75rem",
              color: mutedColor,
              userSelect: "none",
            }}
          >
            {t("instruction")}
          </p>

          <p
            style={{
              fontSize: "0.8125rem",
              color: textColor,
              lineHeight: 1.5,
            }}
          >
            {t("sampleText")}
          </p>

          <p style={{ fontSize: "0.8125rem" }}>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                color: linkColor,
                textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
            >
              {t("sampleLink")}
            </a>
          </p>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "0.25rem",
            }}
          >
            <SimButton label={t("button")} bgMode={bgMode} />
            <SimButton label={t("cancel")} bgMode={bgMode} secondary />
          </div>
        </div>
      </div>
    </div>
  );
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

function BgToggle({
  mode,
  active,
  onClick,
  label,
}: {
  mode: BgMode;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: "1.25rem",
        height: "1.25rem",
        borderRadius: "50%",
        border: active
          ? "2px solid var(--color-accent)"
          : "1px solid var(--color-border)",
        backgroundColor: mode === "dark" ? "#1a1a1a" : "#f0f0f0",
        cursor: "pointer",
        transition: "border-color 0.15s",
      }}
    />
  );
}

function SimButton({
  label,
  bgMode,
  secondary,
}: {
  label: string;
  bgMode: BgMode;
  secondary?: boolean;
}) {
  const bg = secondary
    ? "transparent"
    : bgMode === "dark"
      ? "#333"
      : "#e0e0e0";
  const color = bgMode === "dark" ? "#ccc" : "#333";
  const border = secondary
    ? `1px solid ${bgMode === "dark" ? "#444" : "#ccc"}`
    : "none";

  return (
    <button
      style={{
        fontSize: "0.6875rem",
        padding: "0.375rem 0.75rem",
        backgroundColor: bg,
        color,
        border,
      }}
    >
      {label}
    </button>
  );
}

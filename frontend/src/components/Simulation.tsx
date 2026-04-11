"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface SimulationProps {
  imageUrl: string;
  hotspotX?: number;
  hotspotY?: number;
  cursorSize?: number;
}

type BgMode = "light" | "dark";

export default function Simulation({
  imageUrl,
  hotspotX = 0,
  hotspotY = 0,
  cursorSize = 32,
}: SimulationProps) {
  const [bgMode, setBgMode] = useState<BgMode>("dark");
  const t = useTranslations("simulation");

  const bgColor = bgMode === "dark" ? "#1a1a1a" : "#f0f0f0";
  const textColor = bgMode === "dark" ? "#ccc" : "#333";
  const linkColor = bgMode === "dark" ? "#6eaaf5" : "#1a6ed8";
  const mutedColor = bgMode === "dark" ? "#666" : "#999";

  const cursorStyle = `url(${imageUrl}) ${hotspotX} ${hotspotY}, auto`;

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        gap: 0,
        overflow: "hidden",
      }}
    >
      {/* Left: 3종 미리보기 (정적) */}
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
        <PreviewBox label={t("normal")} imageUrl={imageUrl} cursorSize={cursorSize} />
        <PreviewBox label={t("text")} imageUrl={imageUrl} cursorSize={cursorSize} />
        <PreviewBox label={t("link")} imageUrl={imageUrl} cursorSize={cursorSize} />
      </div>

      {/* Right: 인터랙티브 존 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Bg mode toggle */}
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

        {/* Interactive area */}
        <div
          style={{
            flex: 1,
            backgroundColor: bgColor,
            padding: "1rem 1.5rem",
            cursor: cursorStyle,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "0.625rem",
            transition: "background-color 0.3s",
            overflow: "hidden",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              color: mutedColor,
              cursor: `url(${imageUrl}) ${hotspotX} ${hotspotY}, auto`,
              userSelect: "none",
            }}
          >
            {t("instruction")}
          </p>

          <p
            style={{
              fontSize: "0.8125rem",
              color: textColor,
              cursor: `url(${imageUrl}) ${hotspotX} ${hotspotY}, text`,
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
                cursor: `url(${imageUrl}) ${hotspotX} ${hotspotY}, pointer`,
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
            <SimButton label={t("button")} imageUrl={imageUrl} bgMode={bgMode} hotspotX={hotspotX} hotspotY={hotspotY} />
            <SimButton label={t("cancel")} imageUrl={imageUrl} bgMode={bgMode} secondary hotspotX={hotspotX} hotspotY={hotspotY} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewBox({
  label,
  imageUrl,
  cursorSize,
}: {
  label: string;
  imageUrl: string;
  cursorSize: number;
}) {
  const displaySize = Math.min(cursorSize, 32);

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
          width: "3.5rem",
          height: "3.5rem",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={imageUrl}
          alt={label}
          style={{
            width: `${displaySize}px`,
            height: `${displaySize}px`,
            imageRendering: "pixelated",
          }}
        />
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
  imageUrl,
  bgMode,
  secondary,
  hotspotX = 0,
  hotspotY = 0,
}: {
  label: string;
  imageUrl: string;
  bgMode: BgMode;
  secondary?: boolean;
  hotspotX?: number;
  hotspotY?: number;
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
        cursor: `url(${imageUrl}) ${hotspotX} ${hotspotY}, pointer`,
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {label}
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";

type BackgroundComparePreviewProps = {
  beforeUrl: string;
  afterUrl: string;
  title: string;
  beforeLabel: string;
  afterLabel: string;
};

export default function BackgroundComparePreview(
  props: BackgroundComparePreviewProps
) {
  const { beforeUrl, afterUrl, title, beforeLabel, afterLabel } = props;
  const [revealPercent, setRevealPercent] = useState(100);
  const [state, setState] = useState<"playing" | "done">("playing");

  useEffect(() => {
    if (!beforeUrl || !afterUrl || beforeUrl === afterUrl) {
      return;
    }

    setRevealPercent(100);
    setState("playing");

    const startTimer = window.setTimeout(() => {
      setRevealPercent(0);
    }, 40);
    const doneTimer = window.setTimeout(() => {
      setState("done");
    }, 1040);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(doneTimer);
    };
  }, [beforeUrl, afterUrl]);

  if (!beforeUrl || !afterUrl || beforeUrl === afterUrl) {
    return null;
  }

  return (
    <div
      data-testid="background-compare-preview"
      data-state={state}
      style={{ display: "grid", gap: "0.5rem" }}
    >
      <div
        style={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {title}
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          overflow: "hidden",
          borderRadius: "0.875rem",
          border: "1px solid color-mix(in srgb, var(--color-border) 88%, white 4%)",
          backgroundColor: "rgba(255,255,255,0.03)",
          backgroundImage:
            "linear-gradient(45deg, rgba(148, 163, 184, 0.12) 25%, transparent 25%), linear-gradient(-45deg, rgba(148, 163, 184, 0.12) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(148, 163, 184, 0.12) 75%), linear-gradient(-45deg, transparent 75%, rgba(148, 163, 184, 0.12) 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
        }}
      >
        <img
          src={afterUrl}
          alt={afterLabel}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />

        <div
          data-testid="background-compare-overlay"
          style={{
            position: "absolute",
            inset: 0,
            width: `${revealPercent}%`,
            overflow: "hidden",
            transition: "width 960ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <img
            src={beforeUrl}
            alt={beforeLabel}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `calc(${revealPercent}% - 1px)`,
            width: "2px",
            transform: "translateX(-1px)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, color-mix(in srgb, var(--color-accent) 72%, white 20%) 55%, rgba(255,255,255,0.92) 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.22)",
            transition: "left 960ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />

        <CompareChip align="left">{beforeLabel}</CompareChip>
        <CompareChip align="right">{afterLabel}</CompareChip>
      </div>
    </div>
  );
}

function CompareChip({
  align,
  children,
}: {
  align: "left" | "right";
  children: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        [align]: "0.625rem",
        bottom: "0.625rem",
        padding: "0.1875rem 0.4375rem",
        borderRadius: "999px",
        backgroundColor: "rgba(10, 14, 20, 0.72)",
        color: "rgba(255,255,255,0.92)",
        fontSize: "0.625rem",
        fontWeight: 600,
        letterSpacing: "0.03em",
        backdropFilter: "blur(10px)",
      }}
    >
      {children}
    </div>
  );
}

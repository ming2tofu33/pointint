"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { StudioInspectorSecondaryButton } from "@/components/StudioInspector";
import type {
  ImageRotation,
  ImageTransformAction,
} from "@/lib/cursorFrame";

interface ImageTransformControlsProps {
  rotation: ImageRotation;
  flipX: boolean;
  flipY: boolean;
  onTransform: (action: ImageTransformAction) => void;
}

export default function ImageTransformControls({
  rotation,
  flipX,
  flipY,
  onTransform,
}: ImageTransformControlsProps) {
  const t = useTranslations("panel");

  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <div
        role="group"
        aria-label={t("imageTransform")}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "0.45rem",
        }}
      >
        <TransformButton
          label={t("rotateClockwise")}
          pressed={rotation !== 0}
          onClick={() => onTransform("rotate-clockwise")}
        >
          <RotateIcon />
        </TransformButton>
        <TransformButton
          label={t("flipHorizontal")}
          pressed={flipX}
          onClick={() => onTransform("flip-horizontal")}
        >
          <FlipHorizontalIcon />
        </TransformButton>
        <TransformButton
          label={t("flipVertical")}
          pressed={flipY}
          onClick={() => onTransform("flip-vertical")}
        >
          <FlipVerticalIcon />
        </TransformButton>
      </div>
    </div>
  );
}

function TransformButton({
  children,
  label,
  pressed,
  onClick,
}: {
  children: ReactNode;
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <StudioInspectorSecondaryButton
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      title={label}
      style={{
        aspectRatio: "1 / 1",
        minHeight: "3.05rem",
        padding: "0.68rem",
        color: pressed ? "var(--color-accent)" : "var(--color-text-primary)",
        backgroundColor: pressed
          ? "color-mix(in srgb, var(--color-accent) 18%, rgba(255,255,255,0.04))"
          : "rgba(255,255,255,0.035)",
        boxShadow: pressed
          ? "inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 36%, transparent)"
          : "inset 0 1px 0 rgba(255,255,255,0.035)",
        lineHeight: 1,
      }}
    >
      {children}
    </StudioInspectorSecondaryButton>
  );
}

function RotateIcon() {
  return (
    <svg
      aria-hidden="true"
      data-testid="image-transform-icon"
      focusable="false"
      viewBox="0 0 16 16"
      style={{ display: "block", width: "1.45rem", height: "1.45rem" }}
    >
      <path
        d="M12.8 6.5A4.8 4.8 0 1 0 11.4 11"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <path
        d="M12.5 3.2v3.3H9.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function FlipHorizontalIcon() {
  return (
    <svg
      aria-hidden="true"
      data-testid="image-transform-icon"
      focusable="false"
      viewBox="0 0 16 16"
      style={{ display: "block", width: "1.45rem", height: "1.45rem" }}
    >
      <path d="M2.5 3.5 7 8l-4.5 4.5V3.5Z" fill="currentColor" opacity="0.42" />
      <path d="M13.5 3.5 9 8l4.5 4.5V3.5Z" fill="currentColor" />
      <path d="M8 2.7v10.6" stroke="currentColor" strokeDasharray="1.6 1.6" />
    </svg>
  );
}

function FlipVerticalIcon() {
  return (
    <svg
      aria-hidden="true"
      data-testid="image-transform-icon"
      focusable="false"
      viewBox="0 0 16 16"
      style={{ display: "block", width: "1.45rem", height: "1.45rem" }}
    >
      <path d="M3.5 2.5 8 7l4.5-4.5h-9Z" fill="currentColor" opacity="0.42" />
      <path d="M3.5 13.5 8 9l4.5 4.5h-9Z" fill="currentColor" />
      <path d="M2.7 8h10.6" stroke="currentColor" strokeDasharray="1.6 1.6" />
    </svg>
  );
}

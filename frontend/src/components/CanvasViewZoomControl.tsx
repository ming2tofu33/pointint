"use client";

import { useTranslations } from "next-intl";

import { StudioInspectorSegmentedControl } from "@/components/StudioInspector";

export const CANVAS_VIEW_ZOOM_OPTIONS = [1, 1.5, 2] as const;
export type CanvasViewZoom = (typeof CANVAS_VIEW_ZOOM_OPTIONS)[number];

export default function CanvasViewZoomControl({
  value,
  onChange,
}: {
  value: CanvasViewZoom;
  onChange: (next: CanvasViewZoom) => void;
}) {
  const t = useTranslations("studio");

  return (
    <div style={{ width: "8.5rem" }}>
      <StudioInspectorSegmentedControl
        value={value}
        options={CANVAS_VIEW_ZOOM_OPTIONS}
        onChange={onChange}
        ariaLabel={t("viewZoom")}
        getLabel={(option) => `${option}x`}
      />
    </div>
  );
}

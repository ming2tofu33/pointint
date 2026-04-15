"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import CursorSimulationSurface, {
  getSimulationThemeVariables,
  type SimulationThemeMode,
} from "@/components/CursorSimulationSurface";
import { createStaticCursorSource } from "@/lib/cursorSources";
import { type SlotId } from "@/lib/cursorThemeProject";
import { type SimulationSceneId } from "@/lib/simulationScenes";
import {
  hasNormalSlotSimulationSource,
  type SlotSimulationSources,
} from "@/lib/slotSimulationSources";

interface SimulationProps {
  imageUrl?: string | null;
  cursorSize?: number;
  hotspotX?: number;
  hotspotY?: number;
  slotSources?: SlotSimulationSources;
  selectedSlotId?: SlotId;
  themeMode?: SimulationThemeMode;
  sceneId?: SimulationSceneId;
}

export default function Simulation({
  imageUrl,
  cursorSize = 32,
  hotspotX = 0,
  hotspotY = 0,
  slotSources,
  selectedSlotId,
  themeMode = "dark",
  sceneId,
}: SimulationProps) {
  const t = useTranslations("simulation");
  const source = useMemo(
    () =>
      imageUrl
        ? createStaticCursorSource(
          { src: imageUrl },
          { x: hotspotX, y: hotspotY },
          cursorSize
        )
        : null,
    [imageUrl, hotspotX, hotspotY, cursorSize]
  );

  const mergedSlotSources = useMemo(() => {
    if (!slotSources || !selectedSlotId || !source) {
      return slotSources;
    }

    return {
      ...slotSources,
      [selectedSlotId]: source,
    } satisfies SlotSimulationSources;
  }, [selectedSlotId, slotSources, source]);

  if (mergedSlotSources && !hasNormalSlotSimulationSource(mergedSlotSources)) {
    return (
      <SimulationPlaceholder
        message={t("placeholderNormalRequired")}
        themeMode={themeMode}
      />
    );
  }

  return (
    <CursorSimulationSurface
      source={source}
      slotSources={mergedSlotSources}
      placeholder={
        <SimulationPlaceholder
          message={t("placeholderNormalRequired")}
          themeMode={themeMode}
        />
      }
      themeMode={themeMode}
      sceneId={sceneId}
    />
  );
}

function SimulationPlaceholder({
  message,
  themeMode,
}: {
  message: string;
  themeMode: SimulationThemeMode;
}) {
  return (
    <div
      data-testid="simulation-placeholder"
      style={{
        ...getSimulationThemeVariables(themeMode),
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--simulation-scene-surface, #fff)",
      }}
    >
      <div style={{
        maxWidth: "20rem",
        padding: "1.5rem 2rem",
        backgroundColor: "var(--simulation-scene-bg, #f3f3f3)",
        border: "1px solid var(--simulation-panel-border, #e5e5e5)",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)",
        color: "var(--simulation-panel-muted)",
        fontSize: "0.875rem",
        textAlign: "center",
        lineHeight: 1.6
      }}>
        {message}
      </div>
    </div>
  );
}

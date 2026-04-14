"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import CursorSimulationSurface from "@/components/CursorSimulationSurface";
import type { BackgroundMode } from "@/components/CursorSimulationSurface";
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
  backgroundMode?: BackgroundMode;
  sceneId?: SimulationSceneId;
}

export default function Simulation({
  imageUrl,
  cursorSize = 32,
  hotspotX = 0,
  hotspotY = 0,
  slotSources,
  selectedSlotId,
  backgroundMode = "dark",
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
    if (!slotSources || !selectedSlotId) {
      return slotSources;
    }

    return {
      ...slotSources,
      [selectedSlotId]: source,
    } satisfies SlotSimulationSources;
  }, [selectedSlotId, slotSources, source]);

  if (mergedSlotSources && !hasNormalSlotSimulationSource(mergedSlotSources)) {
    return <SimulationPlaceholder message={t("placeholderNormalRequired")} />;
  }

  return (
    <CursorSimulationSurface
      source={source}
      slotSources={mergedSlotSources}
      placeholder={<SimulationPlaceholder message={t("placeholderNormalRequired")} />}
      backgroundMode={backgroundMode}
      sceneId={sceneId}
    />
  );
}

function SimulationPlaceholder({ message }: { message: string }) {
  return (
    <div
      data-testid="simulation-placeholder"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--simulation-panel-muted)",
        fontSize: "0.8125rem",
        textAlign: "center",
        padding: "1rem",
      }}
    >
      {message}
    </div>
  );
}

"use client";

import { useMemo } from "react";

import CursorSimulationSurface from "@/components/CursorSimulationSurface";
import { createStaticCursorSource } from "@/lib/cursorSources";

interface SimulationProps {
  imageUrl: string;
  cursorSize: number;
  hotspotX?: number;
  hotspotY?: number;
}

export default function Simulation({
  imageUrl,
  cursorSize,
  hotspotX = 0,
  hotspotY = 0,
}: SimulationProps) {
  const source = useMemo(
    () =>
      createStaticCursorSource(
        { src: imageUrl },
        { x: hotspotX, y: hotspotY },
        cursorSize
      ),
    [imageUrl, hotspotX, hotspotY, cursorSize]
  );

  return <CursorSimulationSurface source={source} />;
}

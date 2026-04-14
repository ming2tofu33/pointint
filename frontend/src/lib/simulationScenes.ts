"use client";

export const SIMULATION_SCENE_IDS = [
  "browser",
  "system",
  "windowControls",
] as const;

export type SimulationSceneId = (typeof SIMULATION_SCENE_IDS)[number];

export const SIMULATION_STATION_IDS = [
  "browser-neutral",
  "browser-text-body",
  "browser-text-input",
  "browser-link-docs",
  "system-neutral",
  "system-busy-progress",
  "system-working-card",
  "system-unavailable-action",
  "window-neutral",
  "window-titlebar-move",
  "window-edge-horizontal-resize",
  "window-edge-vertical-resize",
  "window-corner-diagonal-resize-1",
  "window-corner-diagonal-resize-2",
] as const;

export type SimulationStationId = (typeof SIMULATION_STATION_IDS)[number];

export const DEFAULT_SIMULATION_SCENE_ID: SimulationSceneId = "browser";

const DEFAULT_SCENE_STATION: Record<SimulationSceneId, SimulationStationId> = {
  browser: "browser-neutral",
  system: "system-neutral",
  windowControls: "window-neutral",
};

export function getDefaultSimulationStation(
  sceneId: SimulationSceneId
): SimulationStationId {
  return DEFAULT_SCENE_STATION[sceneId];
}


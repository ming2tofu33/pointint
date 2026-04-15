import { mapViewportHotspotToOutput } from "@/lib/cursorFrame";
import {
  createAnimatedCursorSource,
  createStaticCursorSource,
  type CursorSource,
  type CursorSourceKind,
} from "@/lib/cursorSources";
import {
  type CursorThemeProject,
  createWindowsRoleRecord,
  type WindowsRoleSlotId,
} from "@/lib/cursorThemeProject";
import {
  type SimulationSceneId,
  type SimulationStationId,
} from "@/lib/simulationScenes";

export type SlotSimulationSources = Record<
  WindowsRoleSlotId,
  CursorSource | null
>;

interface SlotSimulationAssetInput {
  kind: "static" | "animated";
  imageUrl: string | null;
  hotspotX: number;
  hotspotY: number;
  cursorSize: number;
}

export function hasNormalSlotSimulationSource(
  sources: SlotSimulationSources | null | undefined
) {
  return Boolean(sources?.normalSelect);
}

export function resolveSimulationStationSource(
  sceneId: SimulationSceneId,
  stationId: SimulationStationId,
  sources: SlotSimulationSources | null | undefined
): CursorSource | null {
  const slotId = mapStationToSlotId(sceneId, stationId);

  if (!slotId) {
    return null;
  }

  return sources?.[slotId] ?? null;
}

export function getSimulationStationNativeCursor(
  sceneId: SimulationSceneId,
  stationId: SimulationStationId
) {
  switch (sceneId) {
    case "browser":
      switch (stationId) {
        case "browser-neutral":
          return "default";
        case "browser-text-body":
        case "browser-text-input":
          return "text";
        case "browser-link-docs":
          return "pointer";
        default:
          return "default";
      }
    case "system":
      switch (stationId) {
        case "system-busy-progress":
          return "wait";
        case "system-working-card":
          return "progress";
        case "system-unavailable-action":
          return "not-allowed";
        default:
          return "default";
      }
    case "windowControls":
      switch (stationId) {
        case "window-titlebar-move":
          return "move";
        case "window-edge-horizontal-resize":
          return "ew-resize";
        case "window-edge-vertical-resize":
          return "ns-resize";
        case "window-corner-diagonal-resize-1":
          return "nwse-resize";
        case "window-corner-diagonal-resize-2":
          return "nesw-resize";
        default:
          return "default";
      }
  }
}

export function isAnimatedCursorSource(source: CursorSource | null | undefined) {
  return Boolean(source && source.kind === ("animated" as CursorSourceKind));
}

export function createSlotSimulationSource(
  input: SlotSimulationAssetInput | null | undefined
): CursorSource | null {
  if (!input?.imageUrl) {
    return null;
  }

  const hotspot = mapViewportHotspotToOutput({
    hotspotX: input.hotspotX,
    hotspotY: input.hotspotY,
    viewportSize: 256,
    outputSize: input.cursorSize,
  });

  return input.kind === "animated"
    ? createAnimatedCursorSource(
      [{ src: input.imageUrl, durationMs: 100 }],
      hotspot,
      input.cursorSize
    )
    : createStaticCursorSource(
      { src: input.imageUrl },
      hotspot,
      input.cursorSize
    );
}

export function buildProjectSlotSimulationSources(
  project: CursorThemeProject
): SlotSimulationSources {
  return createWindowsRoleRecord((slotId) =>
    createSlotSimulationSource(fromProjectSlot(project, slotId))
  );
}

function mapStationToSlotId(
  sceneId: SimulationSceneId,
  stationId: SimulationStationId
): WindowsRoleSlotId | null {
  switch (sceneId) {
    case "browser":
      switch (stationId) {
        case "browser-neutral":
          return "normalSelect";
        case "browser-text-body":
        case "browser-text-input":
          return "textSelect";
        case "browser-link-docs":
          return "linkSelect";
        default:
          return null;
      }
    case "system":
      switch (stationId) {
        case "system-busy-progress":
          return "busy";
        case "system-working-card":
          return "workingInBackground";
        case "system-unavailable-action":
          return "unavailable";
        default:
          return null;
      }
    case "windowControls":
      switch (stationId) {
        case "window-titlebar-move":
          return "move";
        case "window-edge-horizontal-resize":
          return "horizontalResize";
        case "window-edge-vertical-resize":
          return "verticalResize";
        case "window-corner-diagonal-resize-1":
          return "diagonalResize1";
        case "window-corner-diagonal-resize-2":
          return "diagonalResize2";
        default:
          return null;
      }
  }
}

export type { SimulationSceneId, SimulationStationId } from "@/lib/simulationScenes";

function fromProjectSlot(
  project: CursorThemeProject,
  slotId: WindowsRoleSlotId
) {
  const slot = project.slots[slotId];
  if (!slot || !slot.asset) return null;
  const imageUrl = slot.asset.previewUrl ?? slot.asset.originalUrl;

  if (!imageUrl || !slot.kind) {
    return null;
  }

  return {
    kind: slot.kind,
    imageUrl,
    hotspotX: slot.editing.hotspotX,
    hotspotY: slot.editing.hotspotY,
    cursorSize: slot.editing.cursorSize,
  };
}

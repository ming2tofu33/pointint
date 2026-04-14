import { type CursorSceneZone } from "@/components/CursorScene";
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

export function resolveZoneSimulationSource(
  zone: CursorSceneZone,
  sources: SlotSimulationSources | null | undefined
): CursorSource | null {
  const normal = sources?.normalSelect ?? null;
  const busy = sources?.busy ?? normal;

  switch (zone) {
    case "neutral":
      return normal;
    case "text":
      return sources?.textSelect ?? normal;
    case "link":
      return sources?.linkSelect ?? normal;
    case "button":
      return busy;
  }
}

export function buildZoneSimulationSources(
  sources: SlotSimulationSources | null | undefined
): Record<CursorSceneZone, CursorSource | null> {
  return {
    neutral: resolveZoneSimulationSource("neutral", sources),
    text: resolveZoneSimulationSource("text", sources),
    link: resolveZoneSimulationSource("link", sources),
    button: resolveZoneSimulationSource("button", sources),
  };
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

function fromProjectSlot(
  project: CursorThemeProject,
  slotId: WindowsRoleSlotId
) {
  const slot = project.slots[slotId];
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

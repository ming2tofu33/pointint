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
  type SlotId,
} from "@/lib/cursorThemeProject";

export type SlotSimulationSources = Partial<Record<SlotId, CursorSource | null>>;

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
  return Boolean(sources?.normal);
}

export function resolveZoneSimulationSource(
  zone: CursorSceneZone,
  sources: SlotSimulationSources | null | undefined
): CursorSource | null {
  const normal = sources?.normal ?? null;

  switch (zone) {
    case "neutral":
      return normal;
    case "text":
      return sources?.text ?? normal;
    case "link":
      return sources?.link ?? normal;
    case "button":
      return sources?.button ?? normal;
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
  return {
    normal: createSlotSimulationSource(fromProjectSlot(project, "normal")),
    text: createSlotSimulationSource(fromProjectSlot(project, "text")),
    link: createSlotSimulationSource(fromProjectSlot(project, "link")),
    button: createSlotSimulationSource(fromProjectSlot(project, "button")),
  };
}

function fromProjectSlot(project: CursorThemeProject, slotId: SlotId) {
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

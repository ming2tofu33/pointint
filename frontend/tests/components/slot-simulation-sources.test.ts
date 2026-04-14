import { describe, expect, it } from "vitest";

import { createCursorThemeProject } from "@/lib/cursorThemeProject";
import {
  buildProjectSlotSimulationSources,
  buildZoneSimulationSources,
  resolveZoneSimulationSource,
} from "@/lib/slotSimulationSources";

describe("slotSimulationSources", () => {
  it("builds project simulation sources from the Windows role slot ids", () => {
    const project = createCursorThemeProject();
    seedSlot(project.slots.normalSelect, "blob:normal");
    seedSlot(project.slots.textSelect, "blob:text");
    seedSlot(project.slots.linkSelect, "blob:link");
    seedSlot(project.slots.busy, "blob:busy");

    const sources = buildProjectSlotSimulationSources(project);

    expect(sources.normalSelect?.getFrameAtTime(0).frame.src).toBe(
      "blob:normal"
    );
    expect(sources.textSelect?.getFrameAtTime(0).frame.src).toBe("blob:text");
    expect(sources.linkSelect?.getFrameAtTime(0).frame.src).toBe("blob:link");
    expect(sources.busy?.getFrameAtTime(0).frame.src).toBe("blob:busy");
    expect((sources as Record<string, unknown>).button).toBeUndefined();
  });

  it("maps simulation zones onto the Windows role sources", () => {
    const sources = {
      normalSelect: makeSource("blob:normal"),
      textSelect: makeSource("blob:text"),
      linkSelect: makeSource("blob:link"),
      busy: makeSource("blob:busy"),
      workingInBackground: null,
      unavailable: null,
      move: null,
      horizontalResize: null,
      verticalResize: null,
      diagonalResize1: null,
      diagonalResize2: null,
    };

    expect(resolveZoneSimulationSource("neutral", sources)).toBe(
      sources.normalSelect
    );
    expect(resolveZoneSimulationSource("text", sources)).toBe(
      sources.textSelect
    );
    expect(resolveZoneSimulationSource("link", sources)).toBe(
      sources.linkSelect
    );
    expect(resolveZoneSimulationSource("button", sources)).toBe(
      sources.busy
    );
  });

  it("falls back to normalSelect when the busy role is missing", () => {
    const sources = {
      normalSelect: makeSource("blob:normal"),
      textSelect: makeSource("blob:text"),
      linkSelect: makeSource("blob:link"),
      busy: null,
      workingInBackground: null,
      unavailable: null,
      move: null,
      horizontalResize: null,
      verticalResize: null,
      diagonalResize1: null,
      diagonalResize2: null,
    };

    expect(resolveZoneSimulationSource("button", sources)).toBe(
      sources.normalSelect
    );
  });

  it("builds zone sources with the Windows role fallbacks", () => {
    const sources = {
      normalSelect: makeSource("blob:normal"),
      textSelect: makeSource("blob:text"),
      linkSelect: makeSource("blob:link"),
      busy: makeSource("blob:busy"),
      workingInBackground: null,
      unavailable: null,
      move: null,
      horizontalResize: null,
      verticalResize: null,
      diagonalResize1: null,
      diagonalResize2: null,
    };

    const zones = buildZoneSimulationSources(sources);

    expect(zones.neutral?.getFrameAtTime(0).frame.src).toBe("blob:normal");
    expect(zones.text?.getFrameAtTime(0).frame.src).toBe("blob:text");
    expect(zones.link?.getFrameAtTime(0).frame.src).toBe("blob:link");
    expect(zones.button?.getFrameAtTime(0).frame.src).toBe("blob:busy");
  });
});

function seedSlot(
  slot: { kind: "static" | "animated" | null; asset: { previewUrl: string | null; originalUrl: string | null } },
  previewUrl: string
) {
  slot.kind = "static";
  slot.asset.previewUrl = previewUrl;
  slot.asset.originalUrl = previewUrl;
}

function makeSource(frameSrc: string) {
  return {
    kind: "static" as const,
    outputSize: 32,
    hotspot: { x: 0, y: 0 },
    getFrameAtTime: () => ({
      frame: { src: frameSrc },
      hotspot: { x: 0, y: 0 },
    }),
  };
}

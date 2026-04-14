import { describe, expect, it } from "vitest";

import { createCursorThemeProject } from "@/lib/cursorThemeProject";
import {
  buildProjectSlotSimulationSources,
  getSimulationStationNativeCursor,
  resolveSimulationStationSource,
  type SimulationSceneId,
  type SimulationStationId,
} from "@/lib/slotSimulationSources";

describe("slotSimulationSources", () => {
  it("builds project simulation sources from the Windows role slot ids", () => {
    const project = createCursorThemeProject();
    seedSlot(project.slots.normalSelect, "blob:normal");
    seedSlot(project.slots.textSelect, "blob:text");
    seedSlot(project.slots.linkSelect, "blob:link");
    seedSlot(project.slots.busy, "blob:busy");
    seedSlot(project.slots.workingInBackground, "blob:working");
    seedSlot(project.slots.unavailable, "blob:unavailable");
    seedSlot(project.slots.move, "blob:move");
    seedSlot(project.slots.horizontalResize, "blob:horizontal");
    seedSlot(project.slots.verticalResize, "blob:vertical");
    seedSlot(project.slots.diagonalResize1, "blob:diag1");
    seedSlot(project.slots.diagonalResize2, "blob:diag2");

    const sources = buildProjectSlotSimulationSources(project);

    expect(sources.normalSelect?.getFrameAtTime(0).frame.src).toBe("blob:normal");
    expect(sources.workingInBackground?.getFrameAtTime(0).frame.src).toBe(
      "blob:working"
    );
    expect(sources.diagonalResize2?.getFrameAtTime(0).frame.src).toBe(
      "blob:diag2"
    );
  });

  it("maps browser, system, and window stations onto Windows role sources", () => {
    const sources = {
      normalSelect: makeSource("blob:normal"),
      textSelect: makeSource("blob:text"),
      linkSelect: makeSource("blob:link"),
      busy: makeSource("blob:busy"),
      workingInBackground: makeSource("blob:working"),
      unavailable: makeSource("blob:unavailable"),
      move: makeSource("blob:move"),
      horizontalResize: makeSource("blob:horizontal"),
      verticalResize: makeSource("blob:vertical"),
      diagonalResize1: makeSource("blob:diag1"),
      diagonalResize2: makeSource("blob:diag2"),
    };

    expect(resolve("browser", "browser-neutral", sources)).toBe(
      sources.normalSelect
    );
    expect(resolve("browser", "browser-text-input", sources)).toBe(
      sources.textSelect
    );
    expect(resolve("browser", "browser-link-docs", sources)).toBe(
      sources.linkSelect
    );
    expect(resolve("system", "system-busy-progress", sources)).toBe(sources.busy);
    expect(resolve("system", "system-working-card", sources)).toBe(
      sources.workingInBackground
    );
    expect(resolve("system", "system-unavailable-action", sources)).toBe(
      sources.unavailable
    );
    expect(resolve("windowControls", "window-titlebar-move", sources)).toBe(
      sources.move
    );
    expect(
      resolve("windowControls", "window-edge-horizontal-resize", sources)
    ).toBe(sources.horizontalResize);
    expect(resolve("windowControls", "window-edge-vertical-resize", sources)).toBe(
      sources.verticalResize
    );
    expect(resolve("windowControls", "window-corner-diagonal-resize-1", sources)).toBe(
      sources.diagonalResize1
    );
    expect(resolve("windowControls", "window-corner-diagonal-resize-2", sources)).toBe(
      sources.diagonalResize2
    );
  });

  it("returns null when a station role is missing and exposes the native cursor fallback", () => {
    const sources = {
      normalSelect: makeSource("blob:normal"),
      textSelect: null,
      linkSelect: null,
      busy: null,
      workingInBackground: null,
      unavailable: null,
      move: null,
      horizontalResize: null,
      verticalResize: null,
      diagonalResize1: null,
      diagonalResize2: null,
    };

    expect(resolve("browser", "browser-link-docs", sources)).toBeNull();
    expect(resolve("system", "system-busy-progress", sources)).toBeNull();
    expect(resolve("windowControls", "window-corner-diagonal-resize-2", sources)).toBeNull();
    expect(getSimulationStationNativeCursor("browser", "browser-link-docs")).toBe(
      "pointer"
    );
    expect(
      getSimulationStationNativeCursor("system", "system-busy-progress")
    ).toBe("wait");
    expect(
      getSimulationStationNativeCursor(
        "windowControls",
        "window-corner-diagonal-resize-2"
      )
    ).toBe("nesw-resize");
  });
});

function resolve(
  sceneId: SimulationSceneId,
  stationId: SimulationStationId,
  sources: Parameters<typeof resolveSimulationStationSource>[2]
) {
  return resolveSimulationStationSource(sceneId, stationId, sources);
}

function seedSlot(
  slot: {
    kind: "static" | "animated" | null;
    asset: { previewUrl: string | null; originalUrl: string | null };
  },
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

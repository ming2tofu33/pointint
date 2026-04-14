import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  createAnimatedCursorSource,
  createStaticCursorSource,
} from "@/lib/cursorSources";
import { createWindowsRoleRecord } from "@/lib/cursorThemeProject";
import { type SlotSimulationSources } from "@/lib/slotSimulationSources";

const { cursorPreviewLayerMock } = vi.hoisted(() => ({
  cursorPreviewLayerMock: vi.fn(
    ({
      snapshot,
    }: {
      snapshot: { frame: { src: string }; hotspot: { x: number; y: number } } | null;
    }) => (
      <div
        data-testid="cursor-preview-layer"
        data-frame-src={snapshot?.frame.src ?? ""}
      />
    )
  ),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/CursorPreviewLayer", () => ({
  default: cursorPreviewLayerMock,
}));

import CursorScene from "@/components/CursorScene";
import CursorSimulationSurface from "@/components/CursorSimulationSurface";

describe("CursorSimulationSurface", () => {
  it("renders the browser scene stations", () => {
    render(<CursorScene sceneId="browser" />);

    expect(screen.getByTestId("cursor-scene")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-browser-chrome")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-browser-address")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-browser-input")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-station-browser-neutral")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-station-browser-text-input")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-station-browser-link-docs")).not.toBeNull();
    expect(screen.getByText("browserTitleInstallTheme")).not.toBeNull();
  });

  it("renders the system and window control scenes", () => {
    const { rerender } = render(<CursorScene sceneId="system" />);

    expect(screen.getByTestId("cursor-scene-system-workspace")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-system-queue")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-system-progress-bar")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-station-system-busy-progress")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-station-system-working-card")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-station-system-unavailable-action")).not.toBeNull();

    rerender(<CursorScene sceneId="windowControls" />);

    expect(screen.getByTestId("cursor-scene-window-frame")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-window-toolbar")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-window-properties-panel")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-window-canvas-workspace")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-station-window-titlebar-move")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-station-window-edge-horizontal-resize")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-station-window-edge-vertical-resize")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-station-window-corner-diagonal-resize-1")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-station-window-corner-diagonal-resize-2")).not.toBeNull();
  });

  it("uses the hovered station's slot source and falls back to a native cursor when unset", () => {
    const normalSource = createStaticCursorSource(
      { src: "blob:normal" },
      { x: 12, y: 8 },
      32
    );
    const textSource = createStaticCursorSource(
      { src: "blob:text" },
      { x: 12, y: 8 },
      32
    );

    render(
      <CursorSimulationSurface
        sceneId="browser"
        slotSources={makeSlotSources({
          normalSelect: normalSource,
          textSelect: textSource,
        })}
      >
        <CursorScene sceneId="browser" />
      </CursorSimulationSurface>
    );

    const stage = screen.getByTestId("cursor-simulation-stage");
    const textStation = screen.getByTestId(
      "cursor-scene-station-browser-text-input"
    );
    const linkStation = screen.getByTestId(
      "cursor-scene-station-browser-link-docs"
    );

    fireEvent.mouseMove(stage, { clientX: 100, clientY: 80 });
    expect(screen.getByTestId("cursor-preview-layer")).toHaveAttribute(
      "data-frame-src",
      "blob:normal"
    );

    fireEvent.mouseEnter(textStation);
    expect(screen.getByTestId("cursor-preview-layer")).toHaveAttribute(
      "data-frame-src",
      "blob:text"
    );

    fireEvent.mouseEnter(linkStation);
    expect(screen.queryByTestId("cursor-preview-layer")).toBeNull();
    expect(stage).toHaveStyle({ cursor: "pointer" });
    expect(stage).toHaveAttribute("data-native-cursor", "pointer");
  });

  it("shows the placeholder when the normal slot is missing", async () => {
    render(
      <CursorSimulationSurface
        sceneId="browser"
        slotSources={makeSlotSources({
          textSelect: createStaticCursorSource(
            { src: "blob:text" },
            { x: 0, y: 0 },
            32
          ),
        })}
        placeholder={<div data-testid="cursor-simulation-placeholder" />}
      >
        <CursorScene sceneId="browser" />
      </CursorSimulationSurface>
    );

    await waitFor(() => {
      expect(screen.getByTestId("cursor-simulation-placeholder")).not.toBeNull();
    });

    expect(screen.queryByTestId("cursor-preview-layer")).toBeNull();
  });

  it("uses the matching native cursor when a non-browser station has no custom source", () => {
    render(
      <CursorSimulationSurface
        sceneId="system"
        slotSources={makeSlotSources({
          normalSelect: createStaticCursorSource(
            { src: "blob:normal" },
            { x: 0, y: 0 },
            32
          ),
        })}
      >
        <CursorScene sceneId="system" />
      </CursorSimulationSurface>
    );

    const stage = screen.getByTestId("cursor-simulation-stage");
    const busyStation = screen.getByTestId(
      "cursor-scene-station-system-busy-progress"
    );

    fireEvent.mouseEnter(busyStation);

    expect(screen.queryByTestId("cursor-preview-layer")).toBeNull();
    expect(stage).toHaveStyle({ cursor: "wait" });
    expect(stage).toHaveAttribute("data-native-cursor", "wait");
  });

  it("positions the cursor preview layer from the pointer and hotspot", () => {
    const source = createStaticCursorSource(
      { src: "blob:cursor" },
      { x: 12, y: 8 },
      32
    );

    render(
      <CursorSimulationSurface source={source} sceneId="browser">
        <CursorScene sceneId="browser" />
      </CursorSimulationSurface>
    );

    const stage = screen.getByTestId("cursor-simulation-stage");
    fireEvent.mouseMove(stage, { clientX: 100, clientY: 80 });

    const preview = screen.getByTestId("cursor-preview-layer");

    expect(preview).toHaveAttribute("data-frame-src", "blob:cursor");
    expect(stage).toHaveStyle({ cursor: "none" });
  });

  it("locks the native cursor for every descendant inside the simulation stage", () => {
    const source = createStaticCursorSource(
      { src: "blob:cursor" },
      { x: 0, y: 0 },
      32
    );

    const { container } = render(
      <CursorSimulationSurface source={source} sceneId="browser">
        <CursorScene sceneId="browser" />
      </CursorSimulationSurface>
    );

    const cursorLockStyle = container.querySelector(
      '[data-testid="cursor-simulation-cursor-lock"]'
    );
    expect(cursorLockStyle).not.toBeNull();
    expect(cursorLockStyle?.textContent).toContain(
      '[data-cursor-lock-scope="true"] *'
    );
    expect(cursorLockStyle?.textContent).toContain("cursor: none !important");
  });

  it("uses stage-local coordinates when positioning the cursor preview", () => {
    const source = createStaticCursorSource(
      { src: "blob:cursor" },
      { x: 12, y: 8 },
      32
    );

    render(
      <CursorSimulationSurface source={source} sceneId="browser">
        <CursorScene sceneId="browser" />
      </CursorSimulationSurface>
    );

    const stage = screen.getByTestId("cursor-simulation-stage");
    stage.getBoundingClientRect = vi.fn(() => ({
      x: 50,
      y: 20,
      left: 50,
      top: 20,
      right: 450,
      bottom: 320,
      width: 400,
      height: 300,
      toJSON: () => ({}),
    })) as typeof stage.getBoundingClientRect;

    fireEvent.mouseMove(stage, { clientX: 200, clientY: 100 });

    const preview = screen.getByTestId("cursor-preview-layer");

    expect(preview).toHaveAttribute("data-frame-src", "blob:cursor");
  });

  it("updates the rendered background mode without removing the scene", () => {
    const source = createStaticCursorSource(
      { src: "blob:cursor" },
      { x: 0, y: 0 },
      32
    );

    const { rerender } = render(
      <CursorSimulationSurface source={source} sceneId="browser">
        <CursorScene sceneId="browser" />
      </CursorSimulationSurface>
    );

    const surface = screen.getByTestId("cursor-simulation-surface");

    expect(surface).toHaveAttribute("data-background-mode", "dark");
    expect(surface).toHaveStyle({
      backgroundColor: "var(--simulation-shell-dark-bg)",
      color: "var(--simulation-shell-dark-fg)",
    });
    expect(
      screen.getByTestId("cursor-scene-browser-address").getAttribute("style")
    ).toContain("border: 1px solid var(--simulation-panel-border)");
    expect(
      screen.getByTestId("cursor-scene-browser-address").getAttribute("style")
    ).toContain("background-color: var(--simulation-panel-elevated)");

    rerender(
      <CursorSimulationSurface
        source={source}
        sceneId="browser"
        backgroundMode="light"
      >
        <CursorScene sceneId="browser" />
      </CursorSimulationSurface>
    );

    expect(surface).toHaveAttribute("data-background-mode", "light");
    expect(surface).toHaveStyle({
      backgroundColor: "var(--simulation-shell-light-bg)",
      color: "var(--simulation-shell-light-fg)",
    });
    expect(screen.getByTestId("cursor-scene")).not.toBeNull();
  });

  it("does not render its own background toggle UI", () => {
    const source = createStaticCursorSource(
      { src: "blob:cursor" },
      { x: 0, y: 0 },
      32
    );

    render(
      <CursorSimulationSurface source={source} sceneId="browser">
        <CursorScene sceneId="browser" />
      </CursorSimulationSurface>
    );

    expect(
      screen.queryByTestId("cursor-simulation-background-toggles")
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Light" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Dark" })).toBeNull();
  });

  it("uses a responsive scene layout that can shrink inside the footer", () => {
    render(<CursorScene sceneId="browser" />);

    expect(screen.getByTestId("cursor-scene")).toHaveStyle({
      minHeight: "0",
      height: "100%",
    });
    expect(screen.getByTestId("cursor-scene-browser-content")).toHaveStyle({
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 14rem), 1fr))",
    });
  });

  it("tracks the hovered scene station", () => {
    const source = createStaticCursorSource(
      { src: "blob:cursor" },
      { x: 0, y: 0 },
      32
    );

    render(
      <CursorSimulationSurface source={source} sceneId="browser">
        <CursorScene sceneId="browser" />
      </CursorSimulationSurface>
    );

    const stage = screen.getByTestId("cursor-simulation-stage");
    const linkStation = screen.getByTestId(
      "cursor-scene-station-browser-link-docs"
    );

    expect(stage).toHaveAttribute("data-active-station", "browser-neutral");

    fireEvent.mouseEnter(linkStation);

    expect(stage).toHaveAttribute("data-active-station", "browser-link-docs");
  });

  it("keeps station tracking when CursorScene is wrapped in fragments and containers", () => {
    const source = createStaticCursorSource(
      { src: "blob:cursor" },
      { x: 0, y: 0 },
      32
    );

    render(
      <CursorSimulationSurface source={source} sceneId="browser">
        <>
          <div>
            <CursorScene sceneId="browser" />
          </div>
        </>
      </CursorSimulationSurface>
    );

    const stage = screen.getByTestId("cursor-simulation-stage");
    const textStation = screen.getByTestId(
      "cursor-scene-station-browser-text-input"
    );

    expect(stage).toHaveAttribute("data-active-station", "browser-neutral");

    fireEvent.mouseEnter(textStation);

    expect(stage).toHaveAttribute("data-active-station", "browser-text-input");
  });

  it("schedules animated preview updates with requestAnimationFrame", async () => {
    const source = createAnimatedCursorSource(
      [{ src: "blob:frame-1", durationMs: 40 }],
      { x: 0, y: 0 },
      32
    );
    const requestAnimationFrameSpy = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation(() => 1);

    render(
      <CursorSimulationSurface source={source} sceneId="browser">
        <CursorScene sceneId="browser" />
      </CursorSimulationSurface>
    );

    await waitFor(() => {
      expect(requestAnimationFrameSpy).toHaveBeenCalled();
    });
  });
});

function makeSlotSources(overrides: Partial<SlotSimulationSources>) {
  return Object.assign(createWindowsRoleRecord(() => null), overrides);
}

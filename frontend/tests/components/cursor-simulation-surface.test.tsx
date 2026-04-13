import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createAnimatedCursorSource, createStaticCursorSource } from "@/lib/cursorSources";

import CursorScene from "@/components/CursorScene";
import CursorSimulationSurface from "@/components/CursorSimulationSurface";

describe("CursorSimulationSurface", () => {
  it("renders the shared scene zones", () => {
    render(<CursorScene />);

    expect(screen.getByTestId("cursor-scene")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-zone-neutral")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-zone-text")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-zone-link")).not.toBeNull();
    expect(screen.getByTestId("cursor-scene-zone-button")).not.toBeNull();
  });

  it("positions the cursor preview layer from the pointer and hotspot", () => {
    const source = createStaticCursorSource(
      { src: "blob:cursor" },
      { x: 12, y: 8 },
      32
    );

    render(
      <CursorSimulationSurface source={source}>
        <CursorScene />
      </CursorSimulationSurface>
    );

    const stage = screen.getByTestId("cursor-simulation-stage");
    fireEvent.mouseMove(stage, { clientX: 100, clientY: 80 });

    const preview = screen.getByTestId("cursor-preview-layer");

    expect(preview).toHaveStyle({ left: "88px", top: "72px" });
    expect(preview).toHaveAttribute("data-output-size", "32");
    expect(stage).toHaveStyle({ cursor: "none" });
  });

  it("uses stage-local coordinates when positioning the cursor preview", () => {
    const source = createStaticCursorSource(
      { src: "blob:cursor" },
      { x: 12, y: 8 },
      32
    );

    render(
      <CursorSimulationSurface source={source}>
        <CursorScene />
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

    expect(preview).toHaveStyle({ left: "138px", top: "72px" });
  });

  it("lets the background mode switch without removing the scene", () => {
    const source = createStaticCursorSource(
      { src: "blob:cursor" },
      { x: 0, y: 0 },
      32
    );

    render(
      <CursorSimulationSurface source={source}>
        <CursorScene />
      </CursorSimulationSurface>
    );

    const surface = screen.getByTestId("cursor-simulation-surface");
    const lightButton = screen.getByRole("button", { name: "Light" });

    expect(surface).toHaveAttribute("data-background-mode", "dark");

    fireEvent.click(lightButton);

    expect(surface).toHaveAttribute("data-background-mode", "light");
    expect(screen.getByTestId("cursor-scene")).not.toBeNull();
  });

  it("tracks the hovered scene zone", () => {
    const source = createStaticCursorSource(
      { src: "blob:cursor" },
      { x: 0, y: 0 },
      32
    );

    render(
      <CursorSimulationSurface source={source}>
        <CursorScene />
      </CursorSimulationSurface>
    );

    const stage = screen.getByTestId("cursor-simulation-stage");
    const linkZone = screen.getByTestId("cursor-scene-zone-link");

    expect(stage).toHaveAttribute("data-active-zone", "neutral");

    fireEvent.mouseEnter(linkZone);

    expect(stage).toHaveAttribute("data-active-zone", "link");
  });

  it("keeps zone tracking when CursorScene is wrapped in fragments and containers", () => {
    const source = createStaticCursorSource(
      { src: "blob:cursor" },
      { x: 0, y: 0 },
      32
    );

    render(
      <CursorSimulationSurface source={source}>
        <>
          <div>
            <CursorScene />
          </div>
        </>
      </CursorSimulationSurface>
    );

    const stage = screen.getByTestId("cursor-simulation-stage");
    const textZone = screen.getByTestId("cursor-scene-zone-text");

    expect(stage).toHaveAttribute("data-active-zone", "neutral");

    fireEvent.mouseEnter(textZone);

    expect(stage).toHaveAttribute("data-active-zone", "text");
  });

  it("schedules animated preview updates with requestAnimationFrame", async () => {
    const source = createAnimatedCursorSource(
      [
        { src: "blob:frame-1", durationMs: 40 },
        { src: "blob:frame-2", durationMs: 40 },
      ],
      { x: 0, y: 0 },
      32
    );
    const requestAnimationFrameSpy = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation(() => 1);

    render(
      <CursorSimulationSurface source={source}>
        <CursorScene />
      </CursorSimulationSurface>
    );

    await waitFor(() => {
      expect(requestAnimationFrameSpy).toHaveBeenCalled();
    });
  });
});

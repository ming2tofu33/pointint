import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createStaticCursorSource } from "@/lib/cursorSources";

const { cursorSimulationSurfaceMock } = vi.hoisted(() => ({
  cursorSimulationSurfaceMock: vi.fn(() => (
    <div data-testid="cursor-simulation-surface" />
  )),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/CursorSimulationSurface", () => ({
  default: cursorSimulationSurfaceMock,
}));

import Simulation from "@/components/Simulation";

describe("Simulation", () => {
  it("routes CUR previews through the shared cursor simulation surface", async () => {
    render(
      <Simulation
        imageUrl="blob:cursor"
        cursorSize={32}
        hotspotX={12}
        hotspotY={8}
      />
    );

    await waitFor(() => {
      expect(cursorSimulationSurfaceMock).toHaveBeenCalled();
    });

    const props = cursorSimulationSurfaceMock.mock.calls.at(-1)?.[0];
    expect(props?.source.kind).toBe("static");
    expect(props?.source.outputSize).toBe(32);
    expect(props?.source.hotspot).toEqual({ x: 12, y: 8 });
    expect(screen.getByTestId("cursor-simulation-surface")).not.toBeNull();
  });

  it("passes slot-specific sources through to the shared simulation surface", async () => {
    const normalSource = createStaticCursorSource(
      { src: "blob:normal" },
      { x: 1, y: 2 },
      32
    );
    const textSource = createStaticCursorSource(
      { src: "blob:text" },
      { x: 3, y: 4 },
      32
    );

    render(
      <Simulation
        imageUrl="blob:cursor"
        cursorSize={32}
        hotspotX={12}
        hotspotY={8}
        slotSources={{ normal: normalSource, text: textSource }}
      />
    );

    await waitFor(() => {
      expect(cursorSimulationSurfaceMock).toHaveBeenCalled();
    });

    const props = cursorSimulationSurfaceMock.mock.calls.at(-1)?.[0];
    expect(props?.slotSources?.normal?.getFrameAtTime(0).frame.src).toBe(
      "blob:normal"
    );
    expect(props?.slotSources?.text?.getFrameAtTime(0).frame.src).toBe(
      "blob:text"
    );
  });

  it("shows the simulation placeholder when the normal slot is missing", async () => {
    render(
      <Simulation
        imageUrl="blob:cursor"
        cursorSize={32}
        hotspotX={12}
        hotspotY={8}
        slotSources={{
          text: createStaticCursorSource(
            { src: "blob:text" },
            { x: 0, y: 0 },
            32
          ),
        }}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("simulation-placeholder")).not.toBeNull();
    });

    expect(screen.queryByTestId("cursor-simulation-surface")).toBeNull();
  });
});

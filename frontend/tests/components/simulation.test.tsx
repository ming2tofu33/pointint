import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
      expect(cursorSimulationSurfaceMock).toHaveBeenCalledTimes(1);
    });

    const props = cursorSimulationSurfaceMock.mock.calls[0]?.[0];
    expect(props?.source.kind).toBe("static");
    expect(props?.source.outputSize).toBe(32);
    expect(props?.source.hotspot).toEqual({ x: 12, y: 8 });
    expect(screen.getByTestId("cursor-simulation-surface")).not.toBeNull();
  });
});

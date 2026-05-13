import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import SimulationFooter from "@/components/SimulationFooter";

describe("SimulationFooter", () => {
  it("uses a ratio-based expanded split instead of a fixed desktop height", () => {
    render(
      <SimulationFooter
        collapsed={false}
        onToggle={vi.fn()}
        headerControls={<div data-testid="header-controls">controls</div>}
      >
        <div data-testid="simulation-body">preview</div>
      </SimulationFooter>
    );

    const footer = screen.getByTestId("studio-simulation-footer");

    expect(footer).toHaveStyle({
      flexBasis: "34%",
      flexGrow: "0",
      flexShrink: "0",
      minHeight: "16rem",
    });
    expect(footer.getAttribute("style")).not.toMatch(/(?:^|;\s*)flex:/);
    expect(screen.getByTestId("studio-simulation-body")).toHaveStyle({
      overflowY: "auto",
      overflowX: "hidden",
    });
    expect(screen.getByTestId("simulation-body")).not.toBeNull();
    expect(screen.getByTestId("header-controls")).not.toBeNull();
    expect(screen.getByTestId("studio-simulation-toggle")).toHaveTextContent(
      "collapseSimulation"
    );
  });

  it("hides the simulation body when collapsed and keeps the toggle visible", () => {
    const onToggle = vi.fn();

    render(
      <SimulationFooter collapsed={true} onToggle={onToggle}>
        <div data-testid="simulation-body">preview</div>
      </SimulationFooter>
    );

    const footer = screen.getByTestId("studio-simulation-footer");

    expect(footer).toHaveStyle({
      flexBasis: "3rem",
      flexGrow: "0",
      flexShrink: "0",
      height: "3rem",
    });
    expect(footer.getAttribute("style")).not.toMatch(/(?:^|;\s*)flex:/);
    expect(screen.queryByTestId("simulation-body")).toBeNull();

    fireEvent.click(screen.getByTestId("studio-simulation-toggle"));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("studio-simulation-toggle")).toHaveTextContent(
      "expandSimulation"
    );
  });

  it("can use a compact expanded footprint for decision-heavy editor states", () => {
    render(
      <SimulationFooter collapsed={false} density="compact" onToggle={vi.fn()}>
        <div data-testid="simulation-body">preview</div>
      </SimulationFooter>
    );

    expect(screen.getByTestId("studio-simulation-footer")).toHaveStyle({
      flexBasis: "28%",
      minHeight: "13rem",
    });
  });
});

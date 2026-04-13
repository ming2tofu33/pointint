import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import SimulationFooter from "@/components/SimulationFooter";

describe("SimulationFooter", () => {
  it("uses a ratio-based expanded split instead of a fixed desktop height", () => {
    render(
      <SimulationFooter collapsed={false} onToggle={vi.fn()}>
        <div data-testid="simulation-body">preview</div>
      </SimulationFooter>
    );

    expect(screen.getByTestId("studio-simulation-footer")).toHaveStyle({
      flexBasis: "42%",
      minHeight: "20rem",
    });
    expect(screen.getByTestId("simulation-body")).not.toBeNull();
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

    expect(screen.getByTestId("studio-simulation-footer")).toHaveStyle({
      height: "3rem",
    });
    expect(screen.queryByTestId("simulation-body")).toBeNull();

    fireEvent.click(screen.getByTestId("studio-simulation-toggle"));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("studio-simulation-toggle")).toHaveTextContent(
      "expandSimulation"
    );
  });
});

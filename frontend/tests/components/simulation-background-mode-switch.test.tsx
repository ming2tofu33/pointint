import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import SimulationBackgroundModeSwitch from "@/components/SimulationBackgroundModeSwitch";

describe("SimulationBackgroundModeSwitch", () => {
  it("toggles to light when the switch is clicked from dark mode", () => {
    const onChange = vi.fn();

    render(
      <SimulationBackgroundModeSwitch value="dark" onChange={onChange} />
    );

    expect(screen.getByRole("switch").getAttribute("style")).not.toContain("box-shadow");
    expect(
      screen.getByTestId("simulation-background-mode-thumb").getAttribute("style")
    ).not.toContain("box-shadow");

    expect(screen.getByTestId("simulation-background-mode-thumb")).toHaveStyle({
      left: "calc(50% + 0.0625rem)",
    });

    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith("light");
  });

  it("toggles to dark when the switch is clicked from light mode", () => {
    const onChange = vi.fn();

    render(<SimulationBackgroundModeSwitch value="light" onChange={onChange} />);

    expect(screen.getByTestId("simulation-background-mode-thumb")).toHaveStyle({
      left: "0.125rem",
    });

    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith("dark");
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    (
      {
        themeLight: "Light mode",
        themeDark: "Dark mode",
        themeModeSwitch: "simulation theme mode",
      } as Record<string, string>
    )[key] ?? key,
}));

import SimulationThemeModeSwitch from "@/components/SimulationThemeModeSwitch";

describe("SimulationThemeModeSwitch", () => {
  it("toggles to light when the switch is clicked from dark mode", () => {
    const onChange = vi.fn();

    render(<SimulationThemeModeSwitch value="dark" onChange={onChange} />);

    expect(screen.getByRole("switch").getAttribute("style")).not.toContain("box-shadow");
    expect(screen.getByRole("switch")).toHaveAttribute(
      "aria-label",
      "simulation theme mode"
    );
    expect(screen.getByText("Light mode")).not.toBeNull();
    expect(screen.getByText("Dark mode")).not.toBeNull();
    expect(
      screen.getByTestId("simulation-theme-mode-thumb").getAttribute("style")
    ).not.toContain("box-shadow");

    expect(screen.getByTestId("simulation-theme-mode-thumb")).toHaveStyle({
      left: "calc(50% + 0.0625rem)",
      background:
        "color-mix(in srgb, var(--color-text-muted) 28%, var(--color-bg-secondary))",
    });

    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith("light");
  });

  it("toggles to dark when the switch is clicked from light mode", () => {
    const onChange = vi.fn();

    render(<SimulationThemeModeSwitch value="light" onChange={onChange} />);

    expect(screen.getByTestId("simulation-theme-mode-thumb")).toHaveStyle({
      left: "0.125rem",
      background:
        "color-mix(in srgb, var(--color-text-muted) 28%, var(--color-bg-secondary))",
    });

    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith("dark");
  });
});

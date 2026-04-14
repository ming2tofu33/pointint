import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import SimulationSceneTabs from "@/components/SimulationSceneTabs";

describe("SimulationSceneTabs", () => {
  it("renders the three scene tabs and changes the active scene", () => {
    const onChange = vi.fn();

    render(
      <SimulationSceneTabs value="browser" onChange={onChange} />
    );

    expect(screen.getByRole("button", { name: /browser scene/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(
      screen.getByRole("button", { name: /system work scene/i })
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: /window controls scene/i })
    ).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getByRole("button", { name: /system work scene/i }));
    expect(onChange).toHaveBeenCalledWith("system");
  });
});

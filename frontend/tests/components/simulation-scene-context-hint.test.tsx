import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    switch (key) {
      case "browserGuideIntro":
        return "Hover links, fields, and actions to inspect browser cursors.";
      case "systemGuideIntro":
        return "Check busy, background, and unavailable states here.";
      case "windowGuideIntro":
        return "Use this window to verify move and resize cursors.";
      default:
        return key;
    }
  },
}));

import SimulationSceneContextHint from "@/components/SimulationSceneContextHint";

describe("SimulationSceneContextHint", () => {
  it("renders an info trigger for each scene and reveals the matching hint on hover/focus", () => {
    const { rerender } = render(<SimulationSceneContextHint sceneId="browser" />);

    let trigger = screen.getByTestId("simulation-scene-context-hint");
    expect(trigger).toHaveAttribute("aria-label");
    expect(
      screen.queryByText("Hover links, fields, and actions to inspect browser cursors.")
    ).toBeNull();

    fireEvent.mouseEnter(trigger);
    expect(
      screen.getByText("Hover links, fields, and actions to inspect browser cursors.")
    ).toBeInTheDocument();
    fireEvent.mouseLeave(trigger);
    expect(
      screen.queryByText("Hover links, fields, and actions to inspect browser cursors.")
    ).toBeNull();

    rerender(<SimulationSceneContextHint sceneId="system" />);

    trigger = screen.getByTestId("simulation-scene-context-hint");
    fireEvent.focus(trigger);
    expect(
      screen.getByText("Check busy, background, and unavailable states here.")
    ).toBeInTheDocument();
    fireEvent.blur(trigger);
    expect(
      screen.queryByText("Check busy, background, and unavailable states here.")
    ).toBeNull();

    rerender(<SimulationSceneContextHint sceneId="windowControls" />);

    trigger = screen.getByTestId("simulation-scene-context-hint");
    expect(trigger).toHaveAttribute("aria-label");
    expect(
      screen.queryByText("Use this window to verify move and resize cursors.")
    ).toBeNull();

    fireEvent.mouseEnter(trigger);

    expect(
      screen.getByText("Use this window to verify move and resize cursors.")
    ).toBeInTheDocument();

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveStyle({ top: "calc(100% + 0.5rem)" });
  });
});

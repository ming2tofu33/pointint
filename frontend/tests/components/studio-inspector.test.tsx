import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import StudioInspector, {
  StudioInspectorSegmentedControl,
} from "@/components/StudioInspector";

describe("StudioInspector", () => {
  it("renders the summary, actual-size preview, and grouped quick actions cards", async () => {
    const { rerender } = render(
      <StudioInspector
        summary={<div>No asset bound yet</div>}
        previews={<div>Actual size preview</div>}
      >
        <section aria-label="Quick actions">
          <div data-testid="studio-inspector-quick-actions">
            <button type="button">recommendHotspotAgain</button>
            <button type="button">resetHotspot</button>
          </div>
        </section>
      </StudioInspector>
    );

    const inspector = screen.getByTestId("studio-inspector");
    expect(inspector).toBeVisible();
    expect(
      within(inspector).getByTestId("studio-inspector-summary-card")
    ).toBeVisible();
    expect(
      within(inspector).getByTestId("studio-inspector-actual-size-card")
    ).toBeVisible();
    expect(
      within(inspector).getByTestId("studio-inspector-quick-actions")
    ).toBeVisible();
    expect(
      within(inspector).getByRole("button", { name: "recommendHotspotAgain" })
    ).toBeVisible();
    expect(
      within(inspector).getByRole("button", { name: "resetHotspot" })
    ).toBeVisible();

    rerender(
      <StudioInspector summary={<div>No asset bound yet</div>} previews={null}>
        {0}
      </StudioInspector>
    );

    expect(
      screen.queryByTestId("studio-inspector-actual-size-card")
    ).not.toBeInTheDocument();
    expect(within(screen.getByTestId("studio-inspector")).getByText("0")).toBeVisible();
  });

  it("does not clip segmented-control focus treatment at the group boundary", () => {
    render(
      <StudioInspectorSegmentedControl
        value={32}
        options={[32, 48, 64] as const}
        onChange={() => {}}
        ariaLabel="output"
      />
    );

    expect(screen.getByRole("group", { name: "output" })).toHaveStyle({
      overflow: "visible",
    });
  });
});

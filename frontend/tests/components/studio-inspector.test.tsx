import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import StudioInspector, {
  StudioInspectorGroup,
  StudioInspectorSegmentedControl,
  StudioInspectorSliderControl,
} from "@/components/StudioInspector";

describe("StudioInspector", () => {
  it("renders a compact status strip, inline preview, and quick actions", async () => {
    const { rerender } = render(
      <StudioInspector
        summary={<div>No asset bound yet</div>}
        previews={<div>Actual size preview</div>}
        quickActions={
          <>
            <button type="button">recommendHotspotAgain</button>
            <button type="button">resetHotspot</button>
          </>
        }
      >
        <section aria-label="Output">Output</section>
      </StudioInspector>
    );

    const inspector = screen.getByTestId("studio-inspector");
    expect(inspector).toBeVisible();
    expect(
      within(inspector).getByTestId("studio-inspector-status-strip")
    ).toBeVisible();
    expect(
      within(inspector).getByTestId("studio-inspector-inline-preview")
    ).toBeVisible();
    expect(
      within(inspector).getByTestId("studio-inspector-quick-actions")
    ).toBeVisible();
    expect(
      within(inspector).queryByTestId("studio-inspector-summary-card")
    ).not.toBeInTheDocument();
    expect(
      within(inspector).queryByTestId("studio-inspector-actual-size-card")
    ).not.toBeInTheDocument();
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
      screen.queryByTestId("studio-inspector-inline-preview")
    ).not.toBeInTheDocument();
    expect(within(screen.getByTestId("studio-inspector")).getByText("0")).toBeVisible();

    rerender(
      <StudioInspector summary={null} previews={null}>
        <section aria-label="Output">Output</section>
      </StudioInspector>
    );

    expect(
      screen.queryByTestId("studio-inspector-status-strip")
    ).not.toBeInTheDocument();
  });

  it("renders dividers between inspector sections even when sections are passed in a fragment", () => {
    render(
      <StudioInspector summary={<div>Summary</div>} previews={null}>
        <>
          <section aria-label="Output">Output</section>
          <section aria-label="Framing">Framing</section>
          <section aria-label="Position">Position</section>
        </>
      </StudioInspector>
    );

    expect(screen.getByTestId("studio-inspector-sections")).toBeVisible();
    expect(screen.getByTestId("studio-inspector-divider-1")).toBeVisible();
    expect(screen.getByTestId("studio-inspector-divider-2")).toBeVisible();
  });

  it("renders grouped inspector blocks without losing subsection content", () => {
    render(
      <StudioInspector summary={<div>Summary</div>} previews={null}>
        <StudioInspectorGroup data-testid="group-image">
          <section aria-label="Output">Output</section>
          <section aria-label="Framing">Framing</section>
          <section aria-label="Name">Name</section>
        </StudioInspectorGroup>
        <StudioInspectorGroup data-testid="group-transform">
          <section aria-label="Hotspot">Hotspot</section>
          <section aria-label="Scale">Scale</section>
          <section aria-label="Position">Position</section>
        </StudioInspectorGroup>
      </StudioInspector>
    );

    expect(screen.getByTestId("group-image")).toBeVisible();
    expect(screen.getByTestId("group-transform")).toBeVisible();
    expect(screen.getByText("Output")).toBeVisible();
    expect(screen.getByText("Position")).toBeVisible();
    expect(screen.getByTestId("studio-inspector-divider-1")).toBeVisible();
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

  it("renders a borderless inspector slider with a visible value", () => {
    const handleChange = vi.fn();

    render(
      <StudioInspectorSliderControl
        label="Scale"
        value={1}
        valueLabel="100%"
        min={0.25}
        max={3}
        step={0.05}
        onChange={handleChange}
      />
    );

    const slider = screen.getByRole("slider", { name: "Scale" });

    expect(slider).toHaveAttribute("data-borderless", "true");
    expect(screen.getByText("100%")).toBeVisible();

    fireEvent.change(slider, { target: { value: "1.5" } });

    expect(handleChange).toHaveBeenCalledWith(1.5);
  });

  it("lets the visible slider value switch to a text field and commit edits", () => {
    const handleChange = vi.fn();
    const handleCommit = vi.fn();

    render(
      <StudioInspectorSliderControl
        label="Offset X"
        value={0}
        valueLabel="0"
        min={-128}
        max={128}
        step={1}
        onChange={handleChange}
        onCommit={handleCommit}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Edit Offset X value" })
    );

    const input = screen.getByRole("textbox", { name: "Offset X value" });
    expect(input).toHaveValue("0");

    fireEvent.change(input, { target: { value: "14" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(handleChange).toHaveBeenCalledWith(14);
    expect(handleCommit).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("textbox", { name: "Offset X value" })
    ).not.toBeInTheDocument();
  });

  it("can parse edited value text differently from the displayed slider value", () => {
    const handleChange = vi.fn();

    render(
      <StudioInspectorSliderControl
        label="Scale"
        value={1}
        valueLabel="100%"
        editValue="100"
        min={0.25}
        max={3}
        step={0.05}
        onChange={handleChange}
        parseEditValue={(draft) => Number(draft) / 100}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit Scale value" }));
    const input = screen.getByRole("textbox", { name: "Scale value" });

    expect(input).toHaveValue("100");

    fireEvent.change(input, { target: { value: "150" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(handleChange).toHaveBeenCalledWith(1.5);
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import StudioQuickResult from "@/components/StudioQuickResult";

function renderQuickResult(overrides = {}) {
  const props = {
    title: "Your cursor is ready",
    description: "Download it now or fine-tune.",
    previewUrl: "blob:preview",
    cursorName: "cursor",
    cursorSize: 32,
    hotspotLabel: "Recommended",
    typeLabel: "Static",
    downloading: false,
    canDownload: true,
    downloadLabel: "Download cursor",
    downloadDescription: "Download the current cursor file",
    advancedLabel: "Fine-tune",
    onDownload: vi.fn(),
    onOpenAdvanced: vi.fn(),
    ...overrides,
  };

  render(<StudioQuickResult {...props} />);

  return props;
}

describe("StudioQuickResult", () => {
  it("renders the quick result preview and actual-size confidence strip", () => {
    renderQuickResult();

    expect(screen.getByTestId("studio-quick-result")).toBeVisible();
    expect(screen.getByAltText("cursor")).toHaveAttribute("src", "blob:preview");
    expect(screen.getByAltText("Light background preview")).toHaveStyle({
      width: "32px",
      height: "32px",
    });
    expect(screen.getByAltText("Dark background preview")).toHaveStyle({
      width: "32px",
      height: "32px",
    });
    expect(screen.getByText("Recommended")).toBeVisible();
    expect(screen.getByText("Static")).toBeVisible();
  });

  it("runs the primary download and advanced editor actions", () => {
    const props = renderQuickResult();

    fireEvent.click(
      screen.getByRole("button", { name: "Download the current cursor file" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Fine-tune" }));

    expect(props.onDownload).toHaveBeenCalledOnce();
    expect(props.onOpenAdvanced).toHaveBeenCalledOnce();
  });

  it("disables download while unavailable or in progress", () => {
    renderQuickResult({
      downloading: true,
      canDownload: true,
    });

    expect(
      screen.getByRole("button", { name: "Download the current cursor file" })
    ).toBeDisabled();
  });

  it("renders an optional full Windows set action", () => {
    const onDownloadFullSet = vi.fn();

    renderQuickResult({
      fullSetLabel: "Build full Windows set",
      fullSetDescription: "Download Windows cursor set",
      canDownloadFullSet: true,
      onDownloadFullSet,
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Download Windows cursor set" })
    );

    expect(onDownloadFullSet).toHaveBeenCalledOnce();
  });
});

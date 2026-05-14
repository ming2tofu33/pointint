import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import StudioQuickResult from "@/components/StudioQuickResult";

function renderQuickResult(overrides = {}) {
  const props = {
    title: "Your cursor is ready",
    description: "Download it now or fine-tune.",
    previewUrl: "blob:preview",
    displayPreviewUrl: "blob:display",
    cursorName: "cursor",
    cursorSize: 32,
    hotspotLabel: "Recommended",
    typeLabel: "Static",
    actualSizeLabel: "Actual size",
    lightPreviewAlt: "Light preview",
    darkPreviewAlt: "Dark preview",
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
    expect(screen.getByTestId("studio-quick-result-dots-base")).toBeInTheDocument();
    expect(screen.getByTestId("studio-quick-result-dots-hover")).toBeInTheDocument();
    expect(screen.getByAltText("cursor")).toHaveAttribute("src", "blob:display");
    expect(screen.getByLabelText("Actual size")).toBeVisible();
    expect(screen.getByAltText("Light preview")).toHaveStyle({
      width: "32px",
      height: "32px",
    });
    expect(screen.getByAltText("Dark preview")).toHaveStyle({
      width: "32px",
      height: "32px",
    });
    expect(screen.getByText("Recommended")).toBeVisible();
    expect(screen.getByText("Static")).toBeVisible();
  });

  it("updates the interactive dot mask from cursor movement", () => {
    renderQuickResult();

    const stage = screen.getByTestId("studio-quick-result");

    fireEvent.mouseMove(stage, { clientX: 88, clientY: 116 });

    expect(stage.style.getPropertyValue("--mouse-x")).toBe("88px");
    expect(stage.style.getPropertyValue("--mouse-y")).toBe("116px");
  });

  it("uses the rendered cursor only for actual-size previews", () => {
    renderQuickResult({
      previewUrl: "blob:rendered-32",
      displayPreviewUrl: "blob:trimmed-source",
    });

    expect(screen.getByAltText("cursor")).toHaveAttribute(
      "src",
      "blob:trimmed-source"
    );
    expect(screen.getByAltText("Light preview")).toHaveAttribute(
      "src",
      "blob:rendered-32"
    );
    expect(screen.getByAltText("Dark preview")).toHaveAttribute(
      "src",
      "blob:rendered-32"
    );
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

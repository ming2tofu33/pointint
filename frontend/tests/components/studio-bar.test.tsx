import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import StudioBar from "@/components/StudioBar";

describe("StudioBar", () => {
  it("groups GIF export under the current ANI download menu", () => {
    const onSecondaryDownload = vi.fn();
    const onTertiaryDownload = vi.fn();

    render(
      <StudioBar
        saveProjectLabel="Save"
        saveProjectDescription="Log in to save this project"
        saveProjectStatusLabel="Login required"
        projectTitleLabel="Untitled cursor set"
        onDownload={vi.fn()}
        onSecondaryDownload={onSecondaryDownload}
        onTertiaryDownload={onTertiaryDownload}
        canDownload={true}
        canSecondaryDownload={true}
        canTertiaryDownload={true}
        primaryActionLabel="Download all"
        primaryActionDescription="Download Windows cursor set"
        secondaryActionLabel="ANI cursor"
        secondaryActionDescription="Download Windows animated cursor file"
        tertiaryActionLabel="Save GIF"
        tertiaryActionDescription="Export as GIF file"
      />
    );

    expect(
      screen.getByRole("button", { name: "Download Windows cursor set" })
    ).toHaveTextContent("Download all");
    const saveButton = screen.getByRole("button", {
      name: "Log in to save this project",
    });

    expect(screen.getByText("Untitled cursor set")).toBeVisible();
    expect(saveButton).toHaveTextContent("Save");
    expect(saveButton).not.toHaveTextContent("Login required");
    expect(screen.getByText("Login required")).toBeVisible();
    expect(saveButton).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByText("Studio")).not.toBeInTheDocument();

    const menuButton = screen.getByRole("button", {
      name: "Download Windows animated cursor file",
    });

    expect(menuButton).toHaveTextContent("ANI cursor");
    expect(menuButton).toHaveAttribute("aria-haspopup", "menu");
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Save GIF")).not.toBeInTheDocument();

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeVisible();
    expect(
      screen.getByRole("menuitem", {
        name: "Download Windows animated cursor file",
      })
    ).toHaveTextContent("ANI cursor");
    expect(
      screen.getByRole("menuitem", { name: "Export as GIF file" })
    ).toHaveTextContent("Save GIF");

    fireEvent.click(screen.getByRole("menuitem", { name: "Export as GIF file" }));

    expect(onTertiaryDownload).toHaveBeenCalledOnce();
    expect(onSecondaryDownload).not.toHaveBeenCalled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    const icons = screen.getAllByTestId("studio-download-icon");

    expect(icons.length).toBeGreaterThanOrEqual(2);
    icons.forEach((icon) => {
      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(icon).toHaveAttribute("focusable", "false");
    });
  });

  it("downloads the current cursor directly when no nested export option exists", () => {
    const onSecondaryDownload = vi.fn();

    render(
      <StudioBar
        onDownload={vi.fn()}
        onSecondaryDownload={onSecondaryDownload}
        canDownload={true}
        canSecondaryDownload={true}
        primaryActionLabel="Download all"
        primaryActionDescription="Download Windows cursor set"
        secondaryActionLabel="Current cursor"
        secondaryActionDescription="Download Windows cursor file"
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Download Windows cursor file" })
    );

    expect(onSecondaryDownload).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("runs the save action only when project saving is available", () => {
    const onSaveProject = vi.fn();
    const { rerender } = render(
      <StudioBar
        saveProjectLabel="Save"
        saveProjectDescription="Save project"
        onSaveProject={onSaveProject}
        canSaveProject={false}
        onDownload={vi.fn()}
        canDownload={false}
        canSecondaryDownload={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Save project" }));
    expect(onSaveProject).not.toHaveBeenCalled();

    rerender(
      <StudioBar
        saveProjectLabel="Save"
        saveProjectDescription="Save project"
        onSaveProject={onSaveProject}
        canSaveProject={true}
        onDownload={vi.fn()}
        canDownload={false}
        canSecondaryDownload={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Save project" }));
    expect(onSaveProject).toHaveBeenCalledOnce();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import StudioQuickStart from "@/components/StudioQuickStart";

describe("StudioQuickStart", () => {
  it("renders one dominant static upload surface", () => {
    render(
      <StudioQuickStart
        title="Drop an image. Get a cursor."
        description={"Pointint picks the defaults.\nFine-tune later."}
        staticUploadLabel="Choose image"
        staticUploadDescription="PNG, JPG, JPEG, or WebP"
        onStaticFile={vi.fn()}
      />
    );

    expect(screen.getByTestId("studio-quick-start")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Choose image" })
    ).toBeVisible();
    expect(screen.getByText(/Pointint picks the defaults/)).toHaveStyle({
      whiteSpace: "pre-line",
    });
    expect(screen.getByText(/Pointint picks the defaults/).textContent).toBe(
      "Pointint picks the defaults.\nFine-tune later."
    );
    expect(screen.queryByTestId("studio-quick-start-animated")).toBeNull();
  });

  it("keeps the drop region broad while making the click target compact", () => {
    render(
      <StudioQuickStart
        title="Drop an image. Get a cursor."
        description="Pointint picks the defaults."
        staticUploadLabel="Choose image"
        staticUploadDescription="PNG, JPG, JPEG, or WebP"
        onStaticFile={vi.fn()}
      />
    );

    const region = screen.getByTestId("studio-quick-start");
    const surface = screen.getByTestId("studio-quick-start-static");
    const clickTarget = screen.getByTestId(
      "studio-quick-start-static-click-target"
    );

    expect(region).toHaveStyle({
      flex: "1",
    });
    expect(surface).toHaveAttribute("data-drop-target", "true");
    expect(clickTarget).toHaveStyle({
      width: "min(100%, 17rem)",
      minHeight: "6rem",
    });
    expect(clickTarget).not.toHaveStyle({
      width: "100%",
      minHeight: "100%",
    });
  });

  it("passes the first valid static file from the primary upload input", () => {
    const onStaticFile = vi.fn();
    const file = new File(["cursor"], "cursor.png", { type: "image/png" });
    const extraFile = new File(["extra"], "extra.webp", { type: "image/webp" });

    render(
      <StudioQuickStart
        title="Drop an image. Get a cursor."
        description="Pointint picks the defaults."
        staticUploadLabel="Choose image"
        staticUploadDescription="PNG, JPG, JPEG, or WebP"
        onStaticFile={onStaticFile}
      />
    );

    const input = screen
      .getByTestId("studio-quick-start-static")
      .querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [file, extraFile],
      },
    });

    expect(onStaticFile).toHaveBeenCalledWith(file);
  });

  it("passes dropped static files from the primary surface", () => {
    const onStaticFile = vi.fn();
    const file = new File(["cursor"], "cursor.webp", { type: "image/webp" });

    render(
      <StudioQuickStart
        title="Drop an image. Get a cursor."
        description="Pointint picks the defaults."
        staticUploadLabel="Choose image"
        staticUploadDescription="PNG, JPG, JPEG, or WebP"
        onStaticFile={onStaticFile}
      />
    );

    fireEvent.drop(screen.getByTestId("studio-quick-start-static"), {
      dataTransfer: { files: [file] },
    });

    expect(onStaticFile).toHaveBeenCalledWith(file);
  });

  it("accepts dropped static files from the whole quick-start region", () => {
    const onStaticFile = vi.fn();
    const file = new File(["cursor"], "cursor.jpg", { type: "image/jpeg" });

    render(
      <StudioQuickStart
        title="Drop an image. Get a cursor."
        description="Pointint picks the defaults."
        staticUploadLabel="Choose image"
        staticUploadDescription="PNG, JPG, JPEG, or WebP"
        onStaticFile={onStaticFile}
      />
    );

    fireEvent.drop(screen.getByTestId("studio-quick-start"), {
      dataTransfer: { files: [file] },
    });

    expect(onStaticFile).toHaveBeenCalledWith(file);
  });

  it("exposes quieter animated upload only when callbacks are provided", () => {
    const onAnimatedFile = vi.fn();
    const file = new File(["gif"], "cursor.gif", { type: "image/gif" });

    render(
      <StudioQuickStart
        title="Drop an image. Get a cursor."
        description="Pointint picks the defaults."
        staticUploadLabel="Choose image"
        staticUploadDescription="PNG, JPG, JPEG, or WebP"
        animatedUploadLabel="Make animated cursor"
        animatedUploadDescription="GIF or image frames"
        onStaticFile={vi.fn()}
        onAnimatedFile={onAnimatedFile}
      />
    );

    const animatedSurface = screen.getByTestId("studio-quick-start-animated");
    const input = animatedSurface.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(animatedSurface).toBeVisible();
    expect(onAnimatedFile).toHaveBeenCalledWith(file);
  });

  it("shows drag state without replacing the upload layout", () => {
    render(
      <StudioQuickStart
        title="Drop an image. Get a cursor."
        description="Pointint picks the defaults."
        staticUploadLabel="Choose image"
        staticUploadDescription="PNG, JPG, JPEG, or WebP"
        onStaticFile={vi.fn()}
      />
    );

    const surface = screen.getByTestId("studio-quick-start-static");

    fireEvent.dragEnter(surface, { dataTransfer: { files: [] } });

    expect(surface).toHaveAttribute("data-drag-active", "true");
    expect(screen.getByRole("button", { name: "Choose image" })).toBeVisible();
  });
});

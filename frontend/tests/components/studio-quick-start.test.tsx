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

  it("can use an animated GIF as the primary guide upload", () => {
    const onAnimatedFile = vi.fn();
    const gif = new File(["gif"], "cursor.gif", { type: "image/gif" });
    const png = new File(["png"], "cursor.png", { type: "image/png" });

    render(
      <StudioQuickStart
        title="Drop a GIF. Get an animated cursor."
        description="Pointint picks the defaults."
        staticUploadLabel="Choose image"
        staticUploadDescription="PNG, JPG, JPEG, or WebP"
        animatedUploadLabel="Choose GIF"
        animatedUploadDescription="GIF"
        primarySource="animated"
        onStaticFile={vi.fn()}
        onAnimatedFile={onAnimatedFile}
      />
    );

    const animatedSurface = screen.getByTestId("studio-quick-start-animated");
    const input = animatedSurface.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    expect(screen.queryByTestId("studio-quick-start-static")).toBeNull();
    expect(input).toHaveAttribute("accept", ".gif");

    fireEvent.change(input, {
      target: {
        files: [png, gif],
      },
    });

    expect(onAnimatedFile).toHaveBeenCalledWith(gif);
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

  it("can use a video as the primary guide upload", () => {
    const onVideoFile = vi.fn();
    render(
      <StudioQuickStart
        title="Video to ANI"
        description="Upload a short clip"
        staticUploadLabel="Choose image"
        staticUploadDescription="Image"
        videoUploadLabel="Choose video"
        videoUploadDescription="MP4 or WebM"
        primarySource="video"
        onStaticFile={vi.fn()}
        onVideoFile={onVideoFile}
      />
    );
    const surface = screen.getByTestId("studio-quick-start-video");
    const input = surface.querySelector(
      "input[type='file']"
    ) as HTMLInputElement;
    const file = new File(["video"], "cat.webm", { type: "video/webm" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onVideoFile).toHaveBeenCalledWith(file);
    expect(input.accept).toContain(".webm");
    expect(input.accept).toContain(".mp4");
  });

  it("passes dropped video files from the primary video surface", () => {
    const onVideoFile = vi.fn();
    const file = new File(["video"], "cat.mp4", { type: "video/mp4" });

    render(
      <StudioQuickStart
        title="Video to ANI"
        description="Upload a short clip"
        staticUploadLabel="Choose image"
        staticUploadDescription="Image"
        videoUploadLabel="Choose video"
        videoUploadDescription="MP4 or WebM"
        primarySource="video"
        onStaticFile={vi.fn()}
        onVideoFile={onVideoFile}
      />
    );

    fireEvent.drop(screen.getByTestId("studio-quick-start-video"), {
      dataTransfer: { files: [file] },
    });

    expect(onVideoFile).toHaveBeenCalledWith(file);
  });

  it("keeps the upload layout present but blocks uploads while busy", () => {
    const onVideoFile = vi.fn();
    const file = new File(["video"], "cat.webm", { type: "video/webm" });

    render(
      <StudioQuickStart
        title="Video to ANI"
        description="Upload a short clip"
        staticUploadLabel="Choose image"
        staticUploadDescription="Image"
        videoUploadLabel="Choose video"
        videoUploadDescription="MP4 or WebM"
        primarySource="video"
        onStaticFile={vi.fn()}
        onVideoFile={onVideoFile}
        busy
        busyLabel="Preparing upload"
        busyDescription="Encoding preview"
      />
    );

    const surface = screen.getByTestId("studio-quick-start-video");
    const clickTarget = screen.getByRole("button", {
      name: "Preparing upload",
    });

    expect(surface).toBeVisible();
    expect(clickTarget).toBeDisabled();
    expect(clickTarget).toHaveStyle({
      minHeight: "6rem",
    });
    expect(screen.getByText("Encoding preview")).toBeVisible();

    fireEvent.drop(surface, {
      dataTransfer: { files: [file] },
    });

    expect(onVideoFile).not.toHaveBeenCalled();
  });

  it("disables secondary animated uploads while busy", () => {
    const onAnimatedFile = vi.fn();
    const inputFile = new File(["gif"], "input.gif", { type: "image/gif" });
    const droppedFile = new File(["gif"], "drop.gif", { type: "image/gif" });

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
        busy
      />
    );

    const animatedSurface = screen.getByTestId("studio-quick-start-animated");
    const clickTarget = screen.getByTestId(
      "studio-quick-start-animated-click-target"
    );
    const input = animatedSurface.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    expect(clickTarget).toBeDisabled();

    fireEvent.change(input, {
      target: {
        files: [inputFile],
      },
    });
    fireEvent.drop(animatedSurface, {
      dataTransfer: { files: [droppedFile] },
    });

    expect(onAnimatedFile).not.toHaveBeenCalled();
  });

  it("uses video filename fallback when MIME is empty and rejects invalid videos", () => {
    const onVideoFile = vi.fn();
    const invalidFile = new File(["video"], "cat.mov", { type: "" });
    const validFile = new File(["video"], "cat.webm", { type: "" });

    render(
      <StudioQuickStart
        title="Video to ANI"
        description="Upload a short clip"
        staticUploadLabel="Choose image"
        staticUploadDescription="Image"
        videoUploadLabel="Choose video"
        videoUploadDescription="MP4 or WebM"
        primarySource="video"
        onStaticFile={vi.fn()}
        onVideoFile={onVideoFile}
      />
    );

    const input = screen
      .getByTestId("studio-quick-start-video")
      .querySelector("input[type='file']") as HTMLInputElement;

    fireEvent.change(input, { target: { files: [invalidFile] } });

    expect(onVideoFile).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { files: [validFile] } });

    expect(onVideoFile).toHaveBeenCalledWith(validFile);
  });
});

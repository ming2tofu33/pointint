import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const LABELS: Record<string, string> = {
  imageTransform: "Image transform",
  rotateClockwise: "Rotate 90",
  flipHorizontal: "Flip H",
  flipVertical: "Flip V",
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => LABELS[key] ?? key,
}));

import ImageTransformControls from "@/components/ImageTransformControls";

describe("ImageTransformControls", () => {
  it("emits rotate and flip actions with clear accessible labels", () => {
    const onTransform = vi.fn();

    render(
      <ImageTransformControls
        rotation={90}
        flipX={true}
        flipY={false}
        onTransform={onTransform}
      />
    );

    expect(screen.getByRole("group", { name: "Image transform" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Rotate 90" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Flip H" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Flip V" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.queryByText("Rotate 90")).not.toBeInTheDocument();
    expect(screen.queryByText("Flip H")).not.toBeInTheDocument();
    expect(screen.queryByText("Flip V")).not.toBeInTheDocument();
    [
      screen.getByRole("button", { name: "Rotate 90" }),
      screen.getByRole("button", { name: "Flip H" }),
      screen.getByRole("button", { name: "Flip V" }),
    ].forEach((button) => {
      expect(button).toHaveStyle({
        width: "2.5rem",
        minHeight: "2.5rem",
        padding: "0.45rem",
      });
    });
    screen.getAllByTestId("image-transform-icon").forEach((icon) => {
      expect(icon).toHaveStyle({ width: "1.1rem", height: "1.1rem" });
    });

    fireEvent.click(screen.getByRole("button", { name: "Rotate 90" }));
    fireEvent.click(screen.getByRole("button", { name: "Flip H" }));
    fireEvent.click(screen.getByRole("button", { name: "Flip V" }));

    expect(onTransform).toHaveBeenNthCalledWith(1, "rotate-clockwise");
    expect(onTransform).toHaveBeenNthCalledWith(2, "flip-horizontal");
    expect(onTransform).toHaveBeenNthCalledWith(3, "flip-vertical");
  });
});

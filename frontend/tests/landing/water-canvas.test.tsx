import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WaterCanvas from "@/components/landing/WaterCanvas";

describe("WaterCanvas", () => {
  it("pins page ripples to the viewport instead of the full document", () => {
    const { container } = render(
      <WaterCanvas mouseX={120} mouseY={180} variant="page" />
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveStyle({ position: "fixed" });
  });
});

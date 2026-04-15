import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CursorCanvas from "@/components/CursorCanvas";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("CursorCanvas", () => {
  it("renders a single 256px editing frame without a secondary outer workspace", () => {
    render(
      <CursorCanvas
        imageUrl="blob:test"
        sourceWidth={96}
        sourceHeight={192}
        fitMode="contain"
        offsetX={0}
        offsetY={0}
        scale={2}
        hotspotX={64}
        hotspotY={32}
        onOffsetChange={() => {}}
        onHotspotChange={() => {}}
      />
    );

    expect(screen.getByTestId("cursor-canvas-workspace")).toHaveStyle({
      width: "256px",
      height: "256px",
    });
    expect(
      screen.queryByTestId("cursor-canvas-output-frame")
    ).not.toBeInTheDocument();
  });

  it("scales the editing frame visually when a larger view zoom is requested", () => {
    render(
      <CursorCanvas
        imageUrl="blob:test"
        sourceWidth={96}
        sourceHeight={96}
        fitMode="contain"
        offsetX={0}
        offsetY={0}
        scale={1}
        hotspotX={0}
        hotspotY={0}
        onOffsetChange={() => {}}
        onHotspotChange={() => {}}
        viewScale={1.5}
      />
    );

    expect(screen.getByTestId("cursor-canvas-workspace")).toHaveStyle({
      width: "384px",
      height: "384px",
    });
  });

  it("maps hotspot picking directly to the single frame coordinates", () => {
    const onHotspotChange = vi.fn();

    render(
      <CursorCanvas
        imageUrl="blob:test"
        sourceWidth={96}
        sourceHeight={96}
        fitMode="contain"
        offsetX={0}
        offsetY={0}
        scale={1}
        hotspotX={0}
        hotspotY={0}
        onOffsetChange={() => {}}
        onHotspotChange={onHotspotChange}
        hotspotPickActive
      />
    );

    const workspace = screen.getByTestId("cursor-canvas-workspace");
    Object.defineProperty(workspace, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        left: 0,
        top: 0,
        right: 256,
        bottom: 256,
        width: 256,
        height: 256,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    fireEvent.mouseDown(workspace, { clientX: 128, clientY: 128 });

    expect(onHotspotChange).toHaveBeenCalledWith(128, 128);
  });

  it("keeps hotspot picking aligned when the view zoom is enlarged", () => {
    const onHotspotChange = vi.fn();

    render(
      <CursorCanvas
        imageUrl="blob:test"
        sourceWidth={96}
        sourceHeight={96}
        fitMode="contain"
        offsetX={0}
        offsetY={0}
        scale={1}
        hotspotX={0}
        hotspotY={0}
        onOffsetChange={() => {}}
        onHotspotChange={onHotspotChange}
        hotspotPickActive
        viewScale={1.5}
      />
    );

    const workspace = screen.getByTestId("cursor-canvas-workspace");
    Object.defineProperty(workspace, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        left: 0,
        top: 0,
        right: 384,
        bottom: 384,
        width: 384,
        height: 384,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    fireEvent.mouseDown(workspace, { clientX: 192, clientY: 192 });

    expect(onHotspotChange).toHaveBeenCalledWith(128, 128);
  });
});

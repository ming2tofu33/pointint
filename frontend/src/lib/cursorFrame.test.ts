import { describe, expect, it } from "vitest";
import { getFrameGeometry, mapViewportHotspotToOutput } from "./cursorFrame";

describe("cursorFrame math", () => {
  it("computes contain geometry for non-square input", () => {
    const geometry = getFrameGeometry({
      viewportSize: 256,
      imageWidth: 96,
      imageHeight: 48,
      fitMode: "contain",
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });

    expect(geometry.width).toBeCloseTo(256, 5);
    expect(geometry.height).toBeCloseTo(128, 5);
    expect(geometry.x).toBeCloseTo(0, 5);
    expect(geometry.y).toBeCloseTo(64, 5);
  });

  it("computes cover geometry for non-square input", () => {
    const geometry = getFrameGeometry({
      viewportSize: 256,
      imageWidth: 96,
      imageHeight: 48,
      fitMode: "cover",
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });

    expect(geometry.width).toBeCloseTo(512, 5);
    expect(geometry.height).toBeCloseTo(256, 5);
    expect(geometry.x).toBeCloseTo(-128, 5);
    expect(geometry.y).toBeCloseTo(0, 5);
  });

  it("maps and clamps hotspot from 256 viewport to 32 output", () => {
    const mapped = mapViewportHotspotToOutput({
      hotspotX: 300,
      hotspotY: -10,
      viewportSize: 256,
      outputSize: 32,
    });

    expect(mapped.x).toBe(31);
    expect(mapped.y).toBe(0);
  });

  it("preserves editor composition when rendering output geometry", () => {
    const editorGeometry = getFrameGeometry({
      viewportSize: 256,
      imageWidth: 96,
      imageHeight: 48,
      fitMode: "contain",
      scale: 1,
      offsetX: 64,
      offsetY: 0,
    });

    const outputGeometry = getFrameGeometry({
      viewportSize: 32,
      sourceViewportSize: 256,
      imageWidth: 96,
      imageHeight: 48,
      fitMode: "contain",
      scale: 1,
      offsetX: 64,
      offsetY: 0,
    });

    expect(outputGeometry.x).toBeCloseTo(editorGeometry.x / 8, 5);
    expect(outputGeometry.y).toBeCloseTo(editorGeometry.y / 8, 5);
    expect(outputGeometry.width).toBeCloseTo(editorGeometry.width / 8, 5);
    expect(outputGeometry.height).toBeCloseTo(editorGeometry.height / 8, 5);
  });
});

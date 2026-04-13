import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  buildAniPreviewSourceMock,
  releaseAniPreviewFramesMock,
  cursorSimulationSurfaceMock,
} = vi.hoisted(
  () => ({
    buildAniPreviewSourceMock: vi.fn(),
    releaseAniPreviewFramesMock: vi.fn(),
    cursorSimulationSurfaceMock: vi.fn(() => (
      <div data-testid="cursor-simulation-surface" />
    )),
  })
);

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/aniPreviewFrames", () => ({
  buildAniPreviewSource: buildAniPreviewSourceMock,
  releaseAniPreviewFrames: releaseAniPreviewFramesMock,
}));

vi.mock("@/components/CursorSimulationSurface", () => ({
  default: cursorSimulationSurfaceMock,
}));

import AniSimulation from "@/components/AniSimulation";

describe("AniSimulation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds rendered ANI preview frames before mounting the shared surface", async () => {
    const originalRevokeObjectURL = URL.revokeObjectURL;
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    const source = {
      kind: "animated" as const,
      hotspot: { x: 12, y: 8 },
      outputSize: 48,
      getFrameAtTime: vi.fn(() => ({
        frame: { src: "blob:frame", durationMs: 120 },
        hotspot: { x: 12, y: 8 },
        outputSize: 48,
        frameIndex: 0,
      })),
    };

    buildAniPreviewSourceMock.mockResolvedValue({
      source,
      frameUrls: ["blob:frame-1", "blob:frame-2"],
      hotspot: { x: 12, y: 8 },
    });

    const { unmount } = render(
      <AniSimulation
        imageUrl="blob:gif"
        sourceWidth={160}
        sourceHeight={120}
        fitMode="cover"
        offsetX={12}
        offsetY={-8}
        scale={1.5}
        cursorSize={48}
        hotspotX={128}
        hotspotY={64}
      />
    );

    await waitFor(() => {
      expect(buildAniPreviewSourceMock).toHaveBeenCalled();
    });

    expect(buildAniPreviewSourceMock.mock.calls[0]?.[0]).toMatchObject({
      imageUrl: "blob:gif",
      sourceWidth: 160,
      sourceHeight: 120,
      fitMode: "cover",
      scale: 1.5,
      offsetX: 12,
      offsetY: -8,
      outputSize: 48,
      hotspotX: 128,
      hotspotY: 64,
    });

    await waitFor(() => {
      expect(cursorSimulationSurfaceMock).toHaveBeenCalledTimes(1);
    });

    expect(cursorSimulationSurfaceMock.mock.calls[0]?.[0]?.source).toBe(source);
    expect(screen.getByTestId("cursor-simulation-surface")).not.toBeNull();

    expect(releaseAniPreviewFramesMock).not.toHaveBeenCalled();

    unmount();

    expect(releaseAniPreviewFramesMock).toHaveBeenCalledWith("blob:gif");

    if (originalRevokeObjectURL) {
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        value: originalRevokeObjectURL,
      });
    }
  });

  it("shows a neutral unavailable state when ANI preview decoding fails", async () => {
    buildAniPreviewSourceMock.mockRejectedValueOnce(new Error("ANI preview unavailable"));

    render(
      <AniSimulation
        imageUrl="blob:gif"
        sourceWidth={160}
        sourceHeight={120}
        fitMode="cover"
        offsetX={12}
        offsetY={-8}
        scale={1.5}
        cursorSize={48}
        hotspotX={128}
        hotspotY={64}
      />
    );

    await waitFor(() => {
      expect(buildAniPreviewSourceMock).toHaveBeenCalled();
    });

    expect(screen.getByTestId("ani-simulation-placeholder")).not.toBeNull();
    expect(screen.queryByTestId("cursor-simulation-surface")).toBeNull();
    expect(releaseAniPreviewFramesMock).not.toHaveBeenCalled();
  });
});

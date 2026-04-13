import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  buildAniPreviewFrameStackMock,
  releaseAniPreviewFramesMock,
  cursorSimulationSurfaceMock,
} = vi.hoisted(
  () => ({
    buildAniPreviewFrameStackMock: vi.fn(),
    releaseAniPreviewFramesMock: vi.fn(),
    cursorSimulationSurfaceMock: vi.fn(() => (
      <div data-testid="cursor-simulation-surface" />
    )),
  })
);

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/aniPreviewFrames", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/aniPreviewFrames")>();

  return {
    ...actual,
    buildAniPreviewFrameStack: buildAniPreviewFrameStackMock,
    releaseAniPreviewFrames: releaseAniPreviewFramesMock,
  };
});

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

    buildAniPreviewFrameStackMock.mockResolvedValue({
      width: 160,
      height: 120,
      frames: [
        { src: "blob:frame-1", durationMs: 120 },
        { src: "blob:frame-2", durationMs: 120 },
      ],
    });

    const { rerender, unmount } = render(
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
      expect(buildAniPreviewFrameStackMock).toHaveBeenCalled();
    });

    expect(buildAniPreviewFrameStackMock.mock.calls[0]?.[0]).toMatchObject({
      imageUrl: "blob:gif",
      sourceWidth: 160,
      sourceHeight: 120,
      fitMode: "cover",
      scale: 1.5,
      offsetX: 12,
      offsetY: -8,
      outputSize: 48,
      editorViewportSize: 256,
    });

    await waitFor(() => {
      expect(cursorSimulationSurfaceMock).toHaveBeenCalledTimes(1);
    });

    expect(cursorSimulationSurfaceMock.mock.calls[0]?.[0]?.source.kind).toBe(
      "animated"
    );
    expect(screen.getByTestId("cursor-simulation-surface")).not.toBeNull();

    expect(releaseAniPreviewFramesMock).not.toHaveBeenCalled();

    rerender(
      <AniSimulation
        imageUrl="blob:gif"
        sourceWidth={160}
        sourceHeight={120}
        fitMode="cover"
        offsetX={12}
        offsetY={-8}
        scale={1.5}
        cursorSize={48}
        hotspotX={92}
        hotspotY={48}
      />
    );

    expect(buildAniPreviewFrameStackMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("ani-simulation-placeholder")).toBeNull();

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
    buildAniPreviewFrameStackMock.mockRejectedValueOnce(
      new Error("ANI preview unavailable")
    );

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
      expect(buildAniPreviewFrameStackMock).toHaveBeenCalled();
    });

    expect(screen.getByTestId("ani-simulation-placeholder")).not.toBeNull();
    expect(screen.queryByTestId("cursor-simulation-surface")).toBeNull();
    expect(releaseAniPreviewFramesMock).not.toHaveBeenCalled();
  });
});

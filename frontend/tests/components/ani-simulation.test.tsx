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

  it("keeps the current preview mounted while only the latest rebuild wins", async () => {
    const originalRevokeObjectURL = URL.revokeObjectURL;
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });

    const firstStack = {
      width: 160,
      height: 120,
      frames: [{ src: "blob:frame-a", durationMs: 120 }],
    };
    const secondStack = deferredStack("blob:frame-b");
    const thirdStack = deferredStack("blob:frame-c");

    buildAniPreviewFrameStackMock
      .mockResolvedValueOnce(firstStack)
      .mockReturnValueOnce(secondStack.promise)
      .mockReturnValueOnce(thirdStack.promise);

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
    expect(
      cursorSimulationSurfaceMock.mock.calls[0]?.[0]?.source.getFrameAtTime(
        Date.now()
      ).frame.src
    ).toBe("blob:frame-a");
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
        scale={1.75}
        cursorSize={48}
        hotspotX={92}
        hotspotY={48}
      />
    );

    await waitFor(() => {
      expect(buildAniPreviewFrameStackMock).toHaveBeenCalledTimes(2);
    });
    expect(screen.queryByTestId("ani-simulation-placeholder")).toBeNull();
    expect(releaseAniPreviewFramesMock).not.toHaveBeenCalled();

    rerender(
      <AniSimulation
        imageUrl="blob:gif-2"
        sourceWidth={160}
        sourceHeight={120}
        fitMode="cover"
        offsetX={20}
        offsetY={-8}
        scale={1.75}
        cursorSize={48}
        hotspotX={92}
        hotspotY={48}
      />
    );

    await waitFor(() => {
      expect(buildAniPreviewFrameStackMock).toHaveBeenCalledTimes(3);
    });
    expect(screen.queryByTestId("ani-simulation-placeholder")).toBeNull();

    secondStack.resolve({
      width: 160,
      height: 120,
      frames: [{ src: "blob:frame-b", durationMs: 120 }],
    });
    await Promise.resolve();

    expect(
      cursorSimulationSurfaceMock.mock.calls.at(-1)?.[0]?.source.getFrameAtTime(
        Date.now()
      ).frame.src
    ).toBe("blob:frame-a");

    thirdStack.resolve({
      width: 160,
      height: 120,
      frames: [{ src: "blob:frame-c", durationMs: 120 }],
    });

    await waitFor(() => {
      expect(
        cursorSimulationSurfaceMock.mock.calls.at(-1)?.[0]?.source.getFrameAtTime(
          Date.now()
        ).frame.src
      ).toBe("blob:frame-c");
    });

    unmount();

    expect(releaseAniPreviewFramesMock).toHaveBeenCalledWith("blob:gif-2");

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

  it("releases cached frames when the image changes and on unmount", async () => {
    const originalRevokeObjectURL = URL.revokeObjectURL;
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });

    buildAniPreviewFrameStackMock
      .mockResolvedValueOnce({
        width: 160,
        height: 120,
        frames: [{ src: "blob:frame-a", durationMs: 120 }],
      })
      .mockResolvedValueOnce({
        width: 160,
        height: 120,
        frames: [{ src: "blob:frame-b", durationMs: 120 }],
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
      expect(cursorSimulationSurfaceMock).toHaveBeenCalledTimes(1);
    });

    rerender(
      <AniSimulation
        imageUrl="blob:gif-2"
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
      expect(releaseAniPreviewFramesMock).toHaveBeenCalledWith("blob:gif");
    });

    unmount();

    expect(releaseAniPreviewFramesMock).toHaveBeenCalledWith("blob:gif-2");

    if (originalRevokeObjectURL) {
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        value: originalRevokeObjectURL,
      });
    }
  });
});

function deferredStack(frameSrc: string) {
  let resolve!: (value: {
    width: number;
    height: number;
    frames: { src: string; durationMs: number }[];
  }) => void;

  const promise = new Promise<{
    width: number;
    height: number;
    frames: { src: string; durationMs: number }[];
  }>((next) => {
    resolve = next;
  });

  return {
    promise,
    resolve,
    frameSrc,
  };
}

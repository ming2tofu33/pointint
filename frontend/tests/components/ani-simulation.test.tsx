import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  buildAniPreviewFrameStackMock,
  releaseAniPreviewFramesMock,
  cursorSimulationSurfaceMock,
} = vi.hoisted(() => ({
  buildAniPreviewFrameStackMock: vi.fn(),
  releaseAniPreviewFramesMock: vi.fn(),
  cursorSimulationSurfaceMock: vi.fn(() => (
    <div data-testid="cursor-simulation-surface" />
  )),
}));

const originalRevokeObjectURL = URL.revokeObjectURL;

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

type AniSimulationProps = import("react").ComponentProps<typeof AniSimulation>;

describe("AniSimulation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    cursorSimulationSurfaceMock.mockImplementation(() => (
      <div data-testid="cursor-simulation-surface" />
    ));
    buildAniPreviewFrameStackMock.mockResolvedValue({
      width: 160,
      height: 120,
      frames: [{ src: "blob:frame-a", durationMs: 120 }],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: originalRevokeObjectURL,
    });
  });

  it("keeps the current preview mounted while only the latest rebuild wins", async () => {
    mockRevokeObjectURL();

    const secondStack = deferredStack("blob:frame-b");
    const thirdStack = deferredStack("blob:frame-c");

    const { rerender, unmount } = renderSimulation({
      imageUrl: "blob:gif",
      fitMode: "cover",
      offsetX: 12,
      offsetY: -8,
      scale: 1.5,
      hotspotX: 128,
      hotspotY: 64,
    });

    await waitFor(() => {
      expect(screen.getByTestId("cursor-simulation-surface")).not.toBeNull();
    });

    const initialBuildCount = buildAniPreviewFrameStackMock.mock.calls.length;

    buildAniPreviewFrameStackMock
      .mockImplementationOnce(() => secondStack.promise)
      .mockImplementationOnce(() => thirdStack.promise);

    rerender(
      <AniSimulation
        imageUrl="blob:gif-2"
        sourceWidth={160}
        sourceHeight={120}
        fitMode="cover"
        offsetX={20}
        offsetY={-8}
        scale={1.5}
        cursorSize={48}
        hotspotX={128}
        hotspotY={64}
      />
    );

    rerender(
      <AniSimulation
        imageUrl="blob:gif-3"
        sourceWidth={160}
        sourceHeight={120}
        fitMode="cover"
        offsetX={24}
        offsetY={-8}
        scale={1.5}
        cursorSize={48}
        hotspotX={128}
        hotspotY={64}
      />
    );

    await waitFor(() => {
      expect(buildAniPreviewFrameStackMock).toHaveBeenCalledTimes(
        initialBuildCount + 2
      );
    });

    expect(screen.queryByTestId("ani-simulation-placeholder")).toBeNull();
    expect(renderedFrameSrc()).toBe("blob:frame-a");

    secondStack.resolve({
      width: 160,
      height: 120,
      frames: [{ src: "blob:frame-b", durationMs: 120 }],
    });
    await Promise.resolve();

    expect(renderedFrameSrc()).toBe("blob:frame-a");

    thirdStack.resolve({
      width: 160,
      height: 120,
      frames: [{ src: "blob:frame-c", durationMs: 120 }],
    });

    await waitFor(() => {
      expect(renderedFrameSrc()).toBe("blob:frame-c");
    });

    unmount();
  });

  it("keeps the previous preview visible until a later rebuild fails", async () => {
    mockRevokeObjectURL();

    const { rerender } = renderSimulation({
      imageUrl: "blob:gif",
      fitMode: "cover",
      offsetX: 12,
      offsetY: -8,
      scale: 1.5,
      hotspotX: 128,
      hotspotY: 64,
    });

    await waitFor(() => {
      expect(screen.getByTestId("cursor-simulation-surface")).not.toBeNull();
    });

    const initialBuildCount = buildAniPreviewFrameStackMock.mock.calls.length;

    vi.useFakeTimers();

    buildAniPreviewFrameStackMock.mockRejectedValueOnce(
      new Error("ANI preview unavailable")
    );

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
        hotspotX={128}
        hotspotY={64}
      />
    );

    expect(screen.getByTestId("cursor-simulation-surface")).not.toBeNull();
    expect(screen.queryByTestId("ani-simulation-placeholder")).toBeNull();
    expect(buildAniPreviewFrameStackMock).toHaveBeenCalledTimes(
      initialBuildCount
    );

    await act(async () => {
      vi.advanceTimersByTime(140);
      await Promise.resolve();
    });

    expect(buildAniPreviewFrameStackMock).toHaveBeenCalledTimes(
      initialBuildCount + 1
    );
    expect(screen.getByTestId("ani-simulation-placeholder")).not.toBeNull();
    expect(screen.queryByTestId("cursor-simulation-surface")).toBeNull();
  });

  it("debounces repeated frame-affecting edits and uses the latest values", async () => {
    mockRevokeObjectURL();

    const secondStack = deferredStack("blob:frame-b");

    const { rerender } = renderSimulation({
      imageUrl: "blob:gif",
      fitMode: "cover",
      offsetX: 12,
      offsetY: -8,
      scale: 1.5,
      hotspotX: 128,
      hotspotY: 64,
    });

    await waitFor(() => {
      expect(screen.getByTestId("cursor-simulation-surface")).not.toBeNull();
    });

    const initialBuildCount = buildAniPreviewFrameStackMock.mock.calls.length;

    vi.useFakeTimers();

    buildAniPreviewFrameStackMock.mockImplementationOnce(
      () => secondStack.promise
    );

    rerender(
      <AniSimulation
        imageUrl="blob:gif"
        sourceWidth={160}
        sourceHeight={120}
        fitMode="cover"
        offsetX={12}
        offsetY={-8}
        scale={1.55}
        cursorSize={48}
        hotspotX={128}
        hotspotY={64}
      />
    );

    rerender(
      <AniSimulation
        imageUrl="blob:gif"
        sourceWidth={160}
        sourceHeight={120}
        fitMode="cover"
        offsetX={14}
        offsetY={-8}
        scale={1.65}
        cursorSize={48}
        hotspotX={128}
        hotspotY={64}
      />
    );

    expect(buildAniPreviewFrameStackMock).toHaveBeenCalledTimes(
      initialBuildCount
    );
    expect(screen.getByTestId("cursor-simulation-surface")).not.toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(139);
      await Promise.resolve();
    });
    expect(buildAniPreviewFrameStackMock).toHaveBeenCalledTimes(
      initialBuildCount
    );

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(buildAniPreviewFrameStackMock).toHaveBeenCalledTimes(
      initialBuildCount + 1
    );

    expect(
      buildAniPreviewFrameStackMock.mock.calls.at(-1)?.[0]
    ).toMatchObject({
      imageUrl: "blob:gif",
      scale: 1.65,
      offsetX: 14,
      outputSize: 48,
    });

    secondStack.resolve({
      width: 160,
      height: 120,
      frames: [{ src: "blob:frame-b", durationMs: 120 }],
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(renderedFrameSrc()).toBe("blob:frame-b");
  });

  it("shows a neutral unavailable state when ANI preview decoding fails", async () => {
    mockRevokeObjectURL();
    buildAniPreviewFrameStackMock.mockRejectedValueOnce(
      new Error("ANI preview unavailable")
    );

    renderSimulation({
      imageUrl: "blob:gif",
      fitMode: "cover",
      offsetX: 12,
      offsetY: -8,
      scale: 1.5,
      hotspotX: 128,
      hotspotY: 64,
    });

    await waitFor(() => {
      expect(screen.getByTestId("ani-simulation-placeholder")).not.toBeNull();
    });
    expect(screen.queryByTestId("cursor-simulation-surface")).toBeNull();
    expect(releaseAniPreviewFramesMock).not.toHaveBeenCalled();
  });

  it("releases cached frames when the image changes and on unmount", async () => {
    mockRevokeObjectURL();

    const { rerender, unmount } = renderSimulation({
      imageUrl: "blob:gif",
      fitMode: "cover",
      offsetX: 12,
      offsetY: -8,
      scale: 1.5,
      hotspotX: 128,
      hotspotY: 64,
    });

    await waitFor(() => {
      expect(screen.getByTestId("cursor-simulation-surface")).not.toBeNull();
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
  });
});

function renderSimulation(overrides: Partial<AniSimulationProps> = {}) {
  return render(
    <AniSimulation
      imageUrl={overrides.imageUrl ?? "blob:gif"}
      sourceWidth={overrides.sourceWidth ?? 160}
      sourceHeight={overrides.sourceHeight ?? 120}
      fitMode={overrides.fitMode ?? "cover"}
      offsetX={overrides.offsetX ?? 12}
      offsetY={overrides.offsetY ?? -8}
      scale={overrides.scale ?? 1.5}
      cursorSize={overrides.cursorSize ?? 48}
      hotspotX={overrides.hotspotX ?? 128}
      hotspotY={overrides.hotspotY ?? 64}
    />
  );
}

function renderedFrameSrc() {
  return cursorSimulationSurfaceMock.mock.calls.at(-1)?.[0]?.source.getFrameAtTime(
    Date.now()
  ).frame.src;
}

function mockRevokeObjectURL() {
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
}

function deferredStack(frameSrc: string) {
  let resolve!: (
    value: {
      width: number;
      height: number;
      frames: { src: string; durationMs: number }[];
    }
  ) => void;

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

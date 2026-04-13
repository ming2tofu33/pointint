import { afterEach, describe, expect, it, vi } from "vitest";

import {
  decodeAniPreviewFrames,
  parseGifFrameMetadata,
  prepareAniPreviewFrames,
} from "@/lib/aniPreviewFrames";

function buildGifBytes(frameDelaysCs: number[]) {
  const bytes: number[] = [
    ...asciiBytes("GIF89a"),
    ...u16le(1),
    ...u16le(1),
    0x80,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0xff,
    0xff,
    0xff,
  ];

  for (const delayCs of frameDelaysCs) {
    bytes.push(0x21, 0xf9, 0x04, 0x00, delayCs & 0xff, delayCs >> 8, 0x00, 0x00);
    bytes.push(0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00);
    bytes.push(0x02, 0x01, 0x00, 0x00);
  }

  bytes.push(0x3b);
  return new Uint8Array(bytes).buffer;
}

function asciiBytes(value: string) {
  return Array.from(value, (char) => char.charCodeAt(0));
}

function u16le(value: number) {
  return [value & 0xff, (value >> 8) & 0xff];
}

function makeMockCanvas() {
  const context = {
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    putImageData: vi.fn(),
  };

  return {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
    context,
  } as unknown as HTMLCanvasElement & { context: typeof context };
}

describe("parseGifFrameMetadata", () => {
  it("reads actual frame count, size, and frame delays from GIF bytes", () => {
    const metadata = parseGifFrameMetadata(buildGifBytes([3, 7]));

    expect(metadata).toMatchObject({
      width: 1,
      height: 1,
      frameCount: 2,
      frameDurationsMs: [30, 70],
    });
  });
});

describe("decodeAniPreviewFrames", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("converts ImageDecoder frame durations from microseconds to milliseconds", async () => {
    const durations = [12500, 40000];
    const canvases = [makeMockCanvas(), makeMockCanvas()];

    const decoder = {
      tracks: {
        ready: Promise.resolve(),
        selectedTrack: { frameCount: durations.length },
      },
      decode: vi.fn(async ({ frameIndex }: { frameIndex: number }) => ({
        image: Object.assign(makeMockCanvas(), {
          duration: durations[frameIndex],
          close: vi.fn(),
        }),
      })),
      close: vi.fn(),
    };

    vi.stubGlobal("ImageDecoder", vi.fn(() => decoder));
    vi.stubGlobal("document", {
      createElement: vi.fn(() => canvases.shift() ?? makeMockCanvas()),
    });

    const result = await decodeAniPreviewFrames(
      new Blob(["gif"], { type: "image/gif" })
    );

    expect(result.frames).toHaveLength(2);
    expect(result.frames.map((frame) => frame.durationMs)).toEqual([13, 40]);
    expect(decoder.decode).toHaveBeenCalledTimes(2);
    expect(decoder.decode).toHaveBeenNthCalledWith(1, {
      frameIndex: 0,
      completeFrames: true,
    });
  });

  it("uses actual GIF frame count and durations in the non-WebCodecs fallback", async () => {
    vi.stubGlobal("ImageDecoder", undefined);

    const decodeAndBlitFrameRGBA = vi.fn((frameIndex: number, pixels: Uint8ClampedArray) => {
      pixels[frameIndex * 4] = 255;
      pixels[frameIndex * 4 + 3] = 255;
    });

    const reader = {
      width: 2,
      height: 2,
      numFrames: () => 3,
      frameInfo: (index: number) => ({ delay: [3, 5, 7][index] }),
      decodeAndBlitFrameRGBA,
    };

    const canvases = [makeMockCanvas(), makeMockCanvas(), makeMockCanvas()];

    const result = await decodeAniPreviewFrames(
      new Blob(["gif"], { type: "image/gif" }),
      {
        gifReaderFactory: () => reader,
        createCanvas: () => canvases.shift() ?? makeMockCanvas(),
        createImageData: (pixels, width, height) =>
          ({ data: pixels, width, height } as ImageData),
      }
    );

    expect(decodeAndBlitFrameRGBA).toHaveBeenCalledTimes(3);
    expect(result.frames).toHaveLength(3);
    expect(result.frames.map((frame) => frame.durationMs)).toEqual([
      30,
      50,
      70,
    ]);
  });
});

describe("prepareAniPreviewFrames", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("caches the decoded GIF sequence by imageUrl so repeated edits reuse it", async () => {
    const sequence = {
      width: 1,
      height: 1,
      frames: [
        { source: document.createElement("canvas"), durationMs: 30 },
        { source: document.createElement("canvas"), durationMs: 70 },
      ],
    };

    const frameSequenceLoader = vi.fn(async () => sequence);

    const first = await prepareAniPreviewFrames("blob:gif-cache-1", {
      frameSequenceLoader,
    });
    const second = await prepareAniPreviewFrames("blob:gif-cache-1", {
      frameSequenceLoader,
    });

    expect(frameSequenceLoader).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
    expect(second.frames.map((frame) => frame.durationMs)).toEqual([30, 70]);
  });

  it("reuses the cached raw sequence even when edit framing changes", async () => {
    const sequence = {
      width: 2,
      height: 2,
      frames: [{ source: document.createElement("canvas"), durationMs: 40 }],
    };

    const frameSequenceLoader = vi.fn(async () => sequence);

    await prepareAniPreviewFrames("blob:gif-cache-2", { frameSequenceLoader });
    await prepareAniPreviewFrames("blob:gif-cache-2", { frameSequenceLoader });
    await prepareAniPreviewFrames("blob:gif-cache-2", { frameSequenceLoader });

    expect(frameSequenceLoader).toHaveBeenCalledTimes(1);
  });
});

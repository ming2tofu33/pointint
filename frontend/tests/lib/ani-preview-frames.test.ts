import { afterEach, describe, expect, it, vi } from "vitest";

import {
  decodeAniPreviewFrames,
  parseGifFrameMetadata,
  prepareAniPreviewFrames,
} from "@/lib/aniPreviewFrames";

function makeCanvas(width = 1, height = 1) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

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
    const frames = [12500, 40000];
    const getContext = vi.fn(() => ({
      clearRect: vi.fn(),
      drawImage: vi.fn(),
    }));

    const decoder = {
      tracks: {
        ready: Promise.resolve(),
        selectedTrack: { frameCount: frames.length },
      },
      decode: vi.fn(async ({ frameIndex }: { frameIndex: number }) => ({
        image: Object.assign(makeCanvas(1, 1), {
          duration: frames[frameIndex],
          close: vi.fn(),
        }),
      })),
      close: vi.fn(),
    };

    vi.stubGlobal("ImageDecoder", vi.fn(() => decoder));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      getContext as typeof HTMLCanvasElement.prototype.getContext
    );

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

  it("uses the actual GIF frame metadata when ImageDecoder is unavailable", async () => {
    vi.stubGlobal("ImageDecoder", undefined);

    const parseGifMetadata = vi.fn(() => ({
      width: 1,
      height: 1,
      frameCount: 3,
      frameDurationsMs: [30, 50, 70],
    }));

    const sampleGifFrames = vi.fn(
      async (
        _blob: Blob,
        metadata: {
          width: number;
          height: number;
          frameCount: number;
          frameDurationsMs: number[];
        }
      ) => ({
      width: metadata.width,
      height: metadata.height,
      frames: metadata.frameDurationsMs.map((durationMs) => ({
        source: makeCanvas(metadata.width, metadata.height),
        durationMs,
      })),
      })
    );

    const result = await decodeAniPreviewFrames(
      new Blob(["gif"], { type: "image/gif" }),
      {
        parseGifMetadata,
        sampleGifFrames,
      }
    );

    expect(parseGifMetadata).toHaveBeenCalledTimes(1);
    expect(sampleGifFrames).toHaveBeenCalledTimes(1);
    expect(sampleGifFrames.mock.calls[0]?.[1]).toMatchObject({
      frameCount: 3,
      frameDurationsMs: [30, 50, 70],
    });
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
        { source: makeCanvas(1, 1), durationMs: 30 },
        { source: makeCanvas(1, 1), durationMs: 70 },
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
      frames: [{ source: makeCanvas(2, 2), durationMs: 40 }],
    };

    const frameSequenceLoader = vi.fn(async () => sequence);

    await prepareAniPreviewFrames("blob:gif-cache-2", { frameSequenceLoader });
    await prepareAniPreviewFrames("blob:gif-cache-2", { frameSequenceLoader });
    await prepareAniPreviewFrames("blob:gif-cache-2", { frameSequenceLoader });

    expect(frameSequenceLoader).toHaveBeenCalledTimes(1);
  });
});

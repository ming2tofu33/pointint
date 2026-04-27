import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  checkCursorHealth,
  generateAni,
  generateAniSequence,
  generateGifSequence,
  generateCursor,
} from "@/lib/api";

describe("generateAni", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts the GIF blob to the ANI export endpoint", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(new URL(_url).pathname).toBe("/api/generate-ani");
      expect(init?.method).toBe("POST");

      const formData = init?.body as FormData;
      expect(formData.get("file")).toBeInstanceOf(File);
      expect(formData.get("cursor_name")).toBe("orbit");
      expect(formData.get("cursor_size")).toBe("48");
      expect(formData.get("fit_mode")).toBe("contain");
      expect(formData.get("hotspot_x")).toBe("12");
      expect(formData.get("hotspot_y")).toBe("18");

      return {
        ok: true,
        headers: new Headers({
          "content-type": "application/octet-stream",
          "content-disposition": 'attachment; filename="pointint-orbit.ani"',
        }),
        blob: async () => new Blob(["ani"], { type: "application/octet-stream" }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    const blob = new Blob(["gif"], { type: "image/gif" });
    const result = await generateAni(blob, {
      aniName: "orbit",
      hotspotX: 12,
      hotspotY: 18,
      cursorSize: 48,
      fitMode: "contain",
    });

    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.blob.type).toBe("application/octet-stream");
    expect(result.contentType).toBe("application/octet-stream");
    expect(result.filename).toBe("pointint-orbit.ani");
  });

  it("falls back safely when the filename* header is malformed", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(new URL(_url).pathname).toBe("/api/generate-ani");
      expect(init?.method).toBe("POST");

      return {
        ok: true,
        headers: new Headers({
          "content-type": "application/octet-stream",
          "content-disposition":
            'attachment; filename*=UTF-8\'\'%E0%A4%A; filename="pointint-orbit.ani"',
        }),
        blob: async () => new Blob(["ani"], { type: "application/octet-stream" }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    const blob = new Blob(["gif"], { type: "image/gif" });
    const result = await generateAni(blob, { aniName: "orbit" });

    expect(result.filename).toBe("pointint-orbit.ani");
  });
});

describe("generateAniSequence", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts repeated frames with duration and settings and parses response metadata", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(new URL(_url).pathname).toBe("/api/generate-ani-sequence");
      expect(init?.method).toBe("POST");

      const formData = init?.body as FormData;
      const frames = formData.getAll("frames");
      expect(frames).toHaveLength(2);
      expect(frames[0]).toBeInstanceOf(File);
      expect(frames[1]).toBeInstanceOf(File);
      expect((frames[0] as File).name).toBe("frame-a.png");
      expect((frames[0] as File).type).toBe("image/png");
      expect((frames[1] as File).name).toBe("frame-b.png");
      expect((frames[1] as File).type).toBe("image/png");
      expect(formData.get("duration_ms")).toBe("75");
      expect(formData.getAll("frame_durations_ms")).toEqual(["75", "125"]);
      expect(formData.get("cursor_name")).toBe("comet");
      expect(formData.get("cursor_size")).toBe("64");
      expect(formData.get("fit_mode")).toBe("cover");
      expect(formData.get("hotspot_x")).toBe("10");
      expect(formData.get("hotspot_y")).toBe("14");
      expect(formData.get("offset_x")).toBe("-3");
      expect(formData.get("offset_y")).toBe("5");
      expect(formData.get("scale")).toBe("1.25");
      expect(formData.get("rotation")).toBe("90");
      expect(formData.get("flip_x")).toBe("true");
      expect(formData.get("flip_y")).toBe("false");

      return {
        ok: true,
        headers: new Headers({
          "content-type": "application/octet-stream",
          "content-disposition": "attachment; filename*=UTF-8''comet%20trail.ani",
        }),
        blob: async () => new Blob(["ani"], { type: "application/octet-stream" }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    const frames = [
      new File(["frame-a"], "frame-a.png", { type: "image/png" }),
      new File(["frame-b"], "frame-b.png", { type: "image/png" }),
    ];
    const result = await generateAniSequence(frames, {
      aniName: "comet",
      durationMs: 75,
      frameDurationsMs: [75, 125],
      hotspotX: 10,
      hotspotY: 14,
      cursorSize: 64,
      fitMode: "cover",
      offsetX: -3,
      offsetY: 5,
      scale: 1.25,
      rotation: 90,
      flipX: true,
      flipY: false,
    });

    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.blob.type).toBe("application/octet-stream");
    expect(result.contentType).toBe("application/octet-stream");
    expect(result.filename).toBe("comet trail.ani");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("uploads plain Blob frames without a type as PNG files", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const formData = init?.body as FormData;
      const frames = formData.getAll("frames");

      expect(frames).toHaveLength(2);
      expect(frames[0]).toBeInstanceOf(File);
      expect(frames[1]).toBeInstanceOf(File);
      expect((frames[0] as File).name).toBe("frame-1.png");
      expect((frames[0] as File).type).toBe("image/png");
      expect((frames[1] as File).name).toBe("frame-2.png");
      expect((frames[1] as File).type).toBe("image/png");

      return {
        ok: true,
        headers: new Headers({
          "content-type": "application/octet-stream",
        }),
        blob: async () => new Blob(["ani"], { type: "application/octet-stream" }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    const frame = new Blob(["png-bytes"]);
    expect(frame.type).toBe("");

    await generateAniSequence([frame, new Blob(["png-bytes-2"])]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("generateGifSequence", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts repeated frames with per-frame durations to the GIF export endpoint", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(new URL(_url).pathname).toBe("/api/generate-gif-sequence");
      expect(init?.method).toBe("POST");

      const formData = init?.body as FormData;
      expect(formData.getAll("frames")).toHaveLength(2);
      expect(formData.getAll("frame_durations_ms")).toEqual(["80", "140"]);
      expect(formData.get("cursor_name")).toBe("orbit");

      return {
        ok: true,
        headers: new Headers({
          "content-type": "image/gif",
          "content-disposition": 'attachment; filename="pointint-orbit.gif"',
        }),
        blob: async () => new Blob(["gif"], { type: "image/gif" }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await generateGifSequence(
      [
        new File(["one"], "frame-1.png", { type: "image/png" }),
        new File(["two"], "frame-2.png", { type: "image/png" }),
      ],
      {
        aniName: "orbit",
        frameDurationsMs: [80, 140],
      }
    );

    expect(result.blob.type).toBe("image/gif");
    expect(result.contentType).toBe("image/gif");
    expect(result.filename).toBe("pointint-orbit.gif");
  });
});

describe("generateCursor", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("can request a raw CUR payload for studio packaging", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(new URL(_url).pathname).toBe("/api/generate-cursor");
      expect(init?.method).toBe("POST");

      const formData = init?.body as FormData;
      expect(formData.get("file")).toBeInstanceOf(File);
      expect(formData.get("cursor_name")).toBe("arrow");
      expect(formData.get("cursor_size")).toBe("32");
      expect(formData.get("package_format")).toBe("raw");

      return {
        ok: true,
        blob: async () =>
          new Blob(["cur"], { type: "application/octet-stream" }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    const blob = new Blob(["png"], { type: "image/png" });
    const result = await generateCursor(blob, 4, 6, 32, "arrow", "raw");

    expect(result.type).toBe("application/octet-stream");
  });
});

describe("checkCursorHealth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a safe fallback when the health endpoint is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }));

    const result = await checkCursorHealth(
      new Blob(["png"], { type: "image/png" }),
      4,
      6
    );

    expect(result).toEqual({
      visibility: "pass",
      hotspot: "pass",
      readability: "pass",
      messages: [],
    });
  });
});

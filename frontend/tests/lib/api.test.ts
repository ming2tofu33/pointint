import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateAni, generateCursor } from "@/lib/api";

describe("generateAni", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts the GIF blob to the ANI export endpoint", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(_url).toContain("/api/generate-ani");
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
      expect(_url).toContain("/api/generate-ani");
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

describe("generateCursor", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("can request a raw CUR payload for studio packaging", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(_url).toContain("/api/generate-cursor");
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

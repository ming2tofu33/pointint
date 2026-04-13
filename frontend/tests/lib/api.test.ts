import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateAni } from "@/lib/api";

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
          "content-type": "application/zip",
          "content-disposition": 'attachment; filename="pointint-orbit.zip"',
        }),
        blob: async () => new Blob(["zip"], { type: "application/zip" }),
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
    expect(result.blob.type).toBe("application/zip");
    expect(result.contentType).toBe("application/zip");
    expect(result.filename).toBe("pointint-orbit.zip");
  });

  it("falls back safely when the filename* header is malformed", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(_url).toContain("/api/generate-ani");
      expect(init?.method).toBe("POST");

      return {
        ok: true,
        headers: new Headers({
          "content-type": "application/zip",
          "content-disposition":
            'attachment; filename*=UTF-8\'\'%E0%A4%A; filename="pointint-orbit.zip"',
        }),
        blob: async () => new Blob(["zip"], { type: "application/zip" }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    const blob = new Blob(["gif"], { type: "image/gif" });
    const result = await generateAni(blob, { aniName: "orbit" });

    expect(result.filename).toBe("pointint-orbit.zip");
  });
});

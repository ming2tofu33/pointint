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
      expect(formData.get("fit_mode")).toBe("contain");
      expect(formData.get("hotspot_x")).toBe("12");
      expect(formData.get("hotspot_y")).toBe("18");

      return {
        ok: true,
        blob: async () => new Blob(["ani"], { type: "application/octet-stream" }),
      } as Response;
    });

    vi.stubGlobal("fetch", fetchMock);

    const blob = new Blob(["gif"], { type: "image/gif" });
    const result = await generateAni(blob, {
      aniName: "orbit",
      hotspotX: 12,
      hotspotY: 18,
      fitMode: "contain",
    });

    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe("application/octet-stream");
  });
});

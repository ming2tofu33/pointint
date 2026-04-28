import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("publishes Wave 0-3 growth routes", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://pointtint.com");
    expect(urls).toContain("https://pointtint.com/studio");
    expect(urls).toContain("https://pointtint.com/explore");
    expect(urls).toContain("https://pointtint.com/tools");
    expect(urls).toContain("https://pointtint.com/guides");
    expect(urls).toContain("https://pointtint.com/tools/image-to-cursor");
    expect(urls).toContain("https://pointtint.com/tools/gif-to-ani-cursor");
    expect(urls).toContain(
      "https://pointtint.com/guides/how-to-change-cursor-windows"
    );
    expect(urls).toContain("https://pointtint.com/guides/what-is-cursor-hotspot");
    expect(urls).toContain("https://pointtint.com/guides/cur-vs-ani");
    expect(urls).toContain(
      "https://pointtint.com/guides/fix-blurry-custom-cursor"
    );
  });
});

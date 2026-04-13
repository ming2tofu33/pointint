import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("studio theme tokens", () => {
  it("uses a near-black glass workspace palette instead of a blue-heavy studio theme", () => {
    const globalsPath = path.resolve(
      __dirname,
      "../src/app/globals.css"
    );
    const css = fs.readFileSync(globalsPath, "utf8");

    expect(css).toContain("--studio-bg-primary: #0d0f12;");
    expect(css).toContain("--studio-bg-secondary: #111418;");
    expect(css).toContain("--studio-bg-tertiary: #171b21;");
    expect(css).toContain("--studio-border: #262c35;");
    expect(css).toContain("--studio-text-primary: #e7e9ed;");
    expect(css).toContain("--studio-text-secondary: #a0a7b1;");
  });
});

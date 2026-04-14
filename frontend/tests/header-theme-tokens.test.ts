import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("header theme tokens", () => {
  it("uses translucent light header surfaces for light and custom themes", () => {
    const globalsPath = path.resolve(__dirname, "../src/app/globals.css");
    const css = fs.readFileSync(globalsPath, "utf8");

    expect(css).toContain("--app-header-backdrop: rgba(244, 247, 248, 0.42);");
    expect(css).toContain("--app-header-highlight: rgba(252, 252, 251, 0.78);");
    expect(css).toContain("--app-header-backdrop: rgba(250, 242, 246, 0.42);");
    expect(css).toContain("--app-header-highlight: rgba(255, 252, 253, 0.8);");
  });
});

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("studio theme tokens", () => {
  it("uses a cool graphite workspace palette with a restrained blue cast", () => {
    const globalsPath = path.resolve(
      __dirname,
      "../src/app/globals.css"
    );
    const css = fs.readFileSync(globalsPath, "utf8");

    expect(css).toContain("--studio-bg-primary: #0c1017;");
    expect(css).toContain("--studio-bg-secondary: #101722;");
    expect(css).toContain("--studio-bg-tertiary: #151e2c;");
    expect(css).toContain("--studio-border: #283346;");
    expect(css).toContain("--studio-text-primary: #e6eaf1;");
    expect(css).toContain("--studio-text-secondary: #9aa5b5;");
  });
});

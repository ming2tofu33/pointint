import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("studio theme tokens", () => {
  it("defines distinct studio workspace tokens for dark, light, and custom themes", () => {
    const globalsPath = path.resolve(
      __dirname,
      "../src/app/globals.css"
    );
    const css = fs.readFileSync(globalsPath, "utf8");

    expect(css).toContain(":root,");
    expect(css).toContain('[data-theme="light"]');
    expect(css).toContain('[data-theme="custom"]');

    expect(css).toContain("--studio-bg-primary: #0c1017;");
    expect(css).toContain("--studio-bg-primary: #f3f6fb;");
    expect(css).toContain("--studio-bg-primary: #f8eff4;");

    expect(css).toContain("--studio-border: #283346;");
    expect(css).toContain("--studio-border: #cfd8e5;");
    expect(css).toContain("--studio-border: #ddc6d2;");
  });

  it("defines a dedicated simulation palette per theme", () => {
    const globalsPath = path.resolve(
      __dirname,
      "../src/app/globals.css"
    );
    const css = fs.readFileSync(globalsPath, "utf8");

    expect(css).toContain("--simulation-shell-dark-bg:");
    expect(css).toContain("--simulation-shell-light-bg:");
    expect(css).toContain("--simulation-panel-bg:");
    expect(css).toContain("--simulation-panel-border:");
    expect(css).toContain("--simulation-link:");
    expect(css).toContain("--simulation-button-bg:");
  });
});

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("studio theme tokens", () => {
  it("defines clean editor workspace tokens for dark, light, and custom themes", () => {
    const globalsPath = path.resolve(
      __dirname,
      "../src/app/globals.css"
    );
    const css = fs.readFileSync(globalsPath, "utf8");

    expect(css).toContain(":root,");
    expect(css).toContain('[data-theme="light"]');
    expect(css).toContain('[data-theme="custom"]');

    expect(css).toContain("--studio-bg-primary: #f6f6f8;");
    expect(css).toContain("--studio-bg-primary: #f7f4f6;");
    expect(css).toContain("--studio-bg-secondary: #ffffff;");

    expect(css).toContain("--studio-border: #d9dee8;");
    expect(css).toContain("--studio-border: #dfd3dc;");
    expect(css).toContain("--studio-text-primary: #141925;");
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

import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("studio theme tokens", () => {
  it("defines separate clean editor workspace tokens for dark, light, and custom themes", () => {
    const globalsPath = path.resolve(
      __dirname,
      "../src/app/globals.css"
    );
    const css = fs.readFileSync(globalsPath, "utf8");
    const darkTheme = getThemeBlock(css, "dark");
    const lightTheme = getThemeBlock(css, "light");
    const customTheme = getThemeBlock(css, "custom");

    expect(css).toContain(":root,");
    expect(css).toContain('[data-theme="light"]');
    expect(css).toContain('[data-theme="custom"]');

    expect(darkTheme).toContain("--studio-color-scheme: dark;");
    expect(darkTheme).toContain("--studio-chrome-bg: #0a0a0a;");
    expect(darkTheme).toContain("--studio-bg-primary: #0a0a0a;");
    expect(darkTheme).toContain("--studio-bg-secondary: #121212;");
    expect(darkTheme).toContain("--studio-bg-tertiary: #1a1a1a;");
    expect(darkTheme).toContain("--studio-border: #333333;");
    expect(darkTheme).toContain("--studio-text-primary: #f9f9f9;");
    expect(darkTheme).toContain("--studio-text-secondary: #a0a0a0;");

    expect(lightTheme).toContain("--studio-color-scheme: light;");
    expect(lightTheme).toContain("--studio-chrome-bg: #ffffff;");
    expect(lightTheme).toContain("--studio-bg-primary: #f6f6f8;");
    expect(lightTheme).toContain("--studio-bg-secondary: #ffffff;");
    expect(lightTheme).toContain("--studio-border: #d9dee8;");
    expect(lightTheme).toContain("--studio-text-primary: #141925;");

    expect(customTheme).toContain("--studio-color-scheme: light;");
    expect(customTheme).toContain("--studio-chrome-bg: #ffffff;");
    expect(customTheme).toContain("--studio-bg-primary: #f7f4f6;");
    expect(customTheme).toContain("--studio-border: #dfd3dc;");
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

function getThemeBlock(css: string, theme: "dark" | "light" | "custom") {
  const selector =
    theme === "dark"
      ? ':root,\\s*\\[data-theme="dark"\\]'
      : `\\[data-theme="${theme}"\\]`;
  const match = css.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`));

  expect(match).toBeTruthy();

  return match?.[1] ?? "";
}

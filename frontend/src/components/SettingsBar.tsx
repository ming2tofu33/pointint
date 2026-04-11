"use client";

import LocaleToggle from "./LocaleToggle";
import ThemeToggle from "./ThemeToggle";

export default function SettingsBar() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        zIndex: 50,
      }}
    >
      <LocaleToggle />
      <ThemeToggle />
    </div>
  );
}

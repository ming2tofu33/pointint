"use client";

import { useEffect, useState } from "react";

const THEMES = ["dark", "light", "custom"] as const;
type Theme = (typeof THEMES)[number];

const THEME_LABELS: Record<Theme, string> = {
  dark: "Dark",
  light: "Light",
  custom: "Custom",
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("pointint-theme") as Theme | null;
    if (saved && THEMES.includes(saved)) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  function cycleTheme() {
    const currentIndex = THEMES.indexOf(theme);
    const next = THEMES[(currentIndex + 1) % THEMES.length];
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("pointint-theme", next);
  }

  return (
    <button
      onClick={cycleTheme}
      aria-label={`Theme: ${THEME_LABELS[theme]}`}
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "50%",
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-card)",
        color: "var(--color-text-secondary)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.05em",
        transition: "border-color 0.2s, color 0.2s",
        zIndex: 50,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-accent)";
        e.currentTarget.style.color = "var(--color-accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.color = "var(--color-text-secondary)";
      }}
    >
      {theme === "dark" ? "D" : theme === "light" ? "L" : "C"}
    </button>
  );
}

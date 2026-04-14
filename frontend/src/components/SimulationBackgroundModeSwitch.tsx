"use client";

import { useTranslations } from "next-intl";

type BackgroundMode = "dark" | "light";

export default function SimulationBackgroundModeSwitch({
  value,
  onChange,
}: {
  value: BackgroundMode;
  onChange: (next: BackgroundMode) => void;
}) {
  const t = useTranslations("simulation");
  const nextValue = value === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      data-testid="simulation-background-mode-switch"
      role="switch"
      aria-checked={value === "dark"}
      aria-label={t("backgroundModeSwitch")}
      onClick={() => onChange(nextValue)}
      style={{
        position: "relative",
        display: "inline-grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        alignItems: "center",
        padding: "0.125rem",
        minWidth: "6.5rem",
        height: "1.875rem",
        border: "1px solid var(--simulation-panel-border)",
        borderRadius: "999px",
        background: "var(--simulation-card-bg)",
        cursor: "pointer",
        transition: "border-color 160ms ease, background 160ms ease, color 160ms ease",
      }}
    >
      <div
        aria-hidden="true"
        data-testid="simulation-background-mode-thumb"
        style={{
          position: "absolute",
          top: "0.125rem",
          bottom: "0.125rem",
          left: value === "light" ? "0.125rem" : "calc(50% + 0.0625rem)",
          width: "calc(50% - 0.1875rem)",
          borderRadius: "999px",
          background:
            value === "light"
              ? "var(--simulation-tab-active-bg)"
              : "var(--simulation-chrome-top)",
          transition: "left 180ms ease, background 180ms ease",
        }}
      />

      <ModeLabel label={t("bgLight")} active={value === "light"} />
      <ModeLabel label={t("bgDark")} active={value === "dark"} />
    </button>
  );
}

function ModeLabel({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "relative",
        zIndex: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: "1.625rem",
        padding: "0 0.625rem",
        color: active
          ? "var(--simulation-panel-text)"
          : "var(--simulation-panel-muted)",
        fontSize: "0.6875rem",
        fontWeight: 600,
        letterSpacing: "0.015em",
        userSelect: "none",
        transition: "color 180ms ease",
      }}
    >
      {label}
    </span>
  );
}

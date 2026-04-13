"use client";

import { useTranslations } from "next-intl";

const COLLAPSED_HEIGHT = "3rem";
const EXPANDED_BASIS = "42%";
const EXPANDED_MIN_HEIGHT = "20rem";

export default function SimulationFooter({
  collapsed,
  onToggle,
  children,
}: {
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const t = useTranslations("studio");

  return (
    <footer
      data-testid="studio-simulation-footer"
      style={{
        height: collapsed ? COLLAPSED_HEIGHT : undefined,
        flex: collapsed ? `0 0 ${COLLAPSED_HEIGHT}` : `0 0 ${EXPANDED_BASIS}`,
        flexBasis: collapsed ? COLLAPSED_HEIGHT : EXPANDED_BASIS,
        minHeight: collapsed ? COLLAPSED_HEIGHT : EXPANDED_MIN_HEIGHT,
        borderTop: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-secondary)",
        flexShrink: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: COLLAPSED_HEIGHT,
          padding: "0 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          borderBottom: collapsed ? "none" : "1px solid var(--color-border)",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {t("simulationPreview")}
        </span>

        <button
          type="button"
          data-testid="studio-simulation-toggle"
          onClick={onToggle}
          style={{
            fontSize: "0.6875rem",
            color: "var(--color-text-muted)",
            background: "none",
            border: "1px solid var(--color-border)",
            padding: "0.25rem 0.5rem",
            cursor: "pointer",
          }}
        >
          {collapsed ? t("expandSimulation") : t("collapseSimulation")}
        </button>
      </div>

      {!collapsed ? (
        <div
          data-testid="studio-simulation-body"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      ) : null}
    </footer>
  );
}

"use client";

import { useTranslations } from "next-intl";

const COLLAPSED_HEIGHT = "3rem";
const EXPANDED_BASIS = "46%";
const EXPANDED_MIN_HEIGHT = "22rem";
const COMPACT_EXPANDED_BASIS = "32%";
const COMPACT_EXPANDED_MIN_HEIGHT = "15rem";

export default function SimulationFooter({
  collapsed,
  onToggle,
  headerControls,
  density = "default",
  children,
}: {
  collapsed: boolean;
  onToggle: () => void;
  headerControls?: React.ReactNode;
  density?: "default" | "compact";
  children: React.ReactNode;
}) {
  const t = useTranslations("studio");
  const expandedBasis =
    density === "compact" ? COMPACT_EXPANDED_BASIS : EXPANDED_BASIS;
  const expandedMinHeight =
    density === "compact" ? COMPACT_EXPANDED_MIN_HEIGHT : EXPANDED_MIN_HEIGHT;

  return (
    <footer
      data-testid="studio-simulation-footer"
      style={{
        height: collapsed ? COLLAPSED_HEIGHT : undefined,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: collapsed ? COLLAPSED_HEIGHT : expandedBasis,
        minHeight: collapsed ? COLLAPSED_HEIGHT : expandedMinHeight,
        borderTop: "1px solid var(--simulation-frame-border)",
        backgroundColor: "var(--simulation-frame-bg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ["--simulation-panel-border" as string]: "var(--color-border)",
        ["--simulation-panel-muted" as string]: "var(--color-text-muted)",
        ["--simulation-panel-text" as string]: "var(--color-text-primary)",
        ["--simulation-card-bg" as string]: "var(--color-bg-secondary)",
        ["--simulation-tab-active-bg" as string]: "var(--color-bg-secondary)",
      }}
    >
      <div
        style={{
          height: collapsed ? COLLAPSED_HEIGHT : undefined,
          minHeight: COLLAPSED_HEIGHT,
          padding: collapsed ? "0 1rem" : "0.5rem 1rem",
          position: "relative",
          zIndex: 3,
          overflow: "visible",
          display: "flex",
          alignItems: "center",
          alignContent: "center",
          justifyContent: "space-between",
          flexWrap: collapsed ? "nowrap" : "wrap",
          gap: "0.75rem",
          borderBottom:
            collapsed ? "none" : "1px solid var(--simulation-frame-border)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            fontSize: "0.82rem",
            color: "var(--simulation-panel-text)",
            fontWeight: 760,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: "0.42rem",
              height: "0.42rem",
              backgroundColor: "var(--color-accent)",
              boxShadow: "0 0 0 3px var(--color-accent-subtle)",
            }}
          />
          {t("simulationPreview")}
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            position: "relative",
            zIndex: 4,
            flex: collapsed ? "0 0 auto" : "1 1 28rem",
            justifyContent: "flex-end",
            minWidth: 0,
            marginLeft: "auto",
          }}
        >
          {collapsed ? null : headerControls}
          <button
            type="button"
            data-testid="studio-simulation-toggle"
            onClick={onToggle}
            style={{
              fontSize: "0.6875rem",
              color: "var(--color-accent)",
              backgroundColor: "var(--color-accent-subtle)",
              border: "1px solid var(--color-accent)",
              padding: "0.25rem 0.5rem",
              cursor: "pointer",
              boxShadow:
                "inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 12%, transparent)",
            }}
          >
            {collapsed ? t("expandSimulation") : t("collapseSimulation")}
          </button>
        </div>
      </div>

      {!collapsed ? (
        <div
          data-testid="studio-simulation-body"
          style={{
            flex: 1,
            minHeight: 0,
            overflowX: "hidden",
            overflowY: "auto",
          }}
        >
          {children}
        </div>
      ) : null}
    </footer>
  );
}

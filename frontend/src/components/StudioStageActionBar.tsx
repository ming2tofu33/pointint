"use client";

import type { HTMLAttributes, ReactNode } from "react";

import { STUDIO_INTERACTION_TRANSITION } from "@/components/StudioSurfaceCard";

type StudioStageAction = {
  id: string;
  label: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
  group?: string;
  tone?: "default" | "accent" | "subtle";
  icon?: ReactNode;
  shortcutHint?: ReactNode;
};

type StudioStageActionBarProps = HTMLAttributes<HTMLDivElement> & {
  actions: StudioStageAction[];
};

export default function StudioStageActionBar({
  actions,
  style,
  ...props
}: StudioStageActionBarProps) {
  const groups = actions.reduce<StudioStageAction[][]>((acc, action) => {
    const groupId = action.group ?? action.id;
    const lastGroup = acc[acc.length - 1];

    if (!lastGroup || (lastGroup[0].group ?? lastGroup[0].id) !== groupId) {
      acc.push([action]);
      return acc;
    }

    lastGroup.push(action);
    return acc;
  }, []);

  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "100%",
        minWidth: 0,
        ...style,
      }}
    >
      {groups.map((group) => (
        <div
          key={group.map((action) => action.id).join("-")}
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "0",
            backgroundColor: "var(--color-bg-secondary)",
            display: "inline-flex",
            alignItems: "stretch",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {group.map((action, index) => {
            const textColor =
              action.tone === "accent"
                ? "var(--color-accent)"
                : action.tone === "subtle"
                  ? "var(--color-text-secondary)"
                  : "var(--color-text-primary)";

            return (
              <button
                key={action.id}
                type="button"
                title={action.title}
                aria-label={action.ariaLabel}
                disabled={action.disabled}
                onClick={action.onClick}
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: action.tone === "accent" ? 700 : 600,
                  color: textColor,
                  background:
                    action.tone === "accent"
                      ? "var(--color-accent-subtle)"
                      : "transparent",
                  border: "none",
                  padding: "0.45rem 0.72rem",
                  cursor: action.disabled ? "default" : "pointer",
                  lineHeight: 1.4,
                  minHeight: "2.1rem",
                  opacity: action.disabled ? 0.52 : 1,
                  transition: STUDIO_INTERACTION_TRANSITION,
                  borderLeft:
                    index > 0 ? "1px solid var(--color-border)" : "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {action.icon ? (
                  <span
                    aria-hidden="true"
                    style={{
                      width: "0.85rem",
                      height: "0.85rem",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {action.icon}
                  </span>
                ) : null}
                <span style={{ whiteSpace: "nowrap" }}>{action.label}</span>
                {action.shortcutHint ? (
                  <span
                    aria-hidden="true"
                    style={{
                      fontSize: "0.625rem",
                      lineHeight: 1,
                      color: "var(--color-text-muted)",
                      border: "1px solid color-mix(in srgb, var(--color-border) 88%, white 4%)",
                      borderRadius: "0",
                      padding: "0.18rem 0.32rem",
                      backgroundColor: "rgba(255,255,255,0.025)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {action.shortcutHint}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

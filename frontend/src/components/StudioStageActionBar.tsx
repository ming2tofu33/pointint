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
};

type StudioStageActionBarProps = HTMLAttributes<HTMLDivElement> & {
  actions: StudioStageAction[];
};

export default function StudioStageActionBar({
  actions,
  style,
  ...props
}: StudioStageActionBarProps) {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        alignItems: "center",
        ...style,
      }}
    >
      {actions.map((action, index) => (
        <button
          key={action.id}
          type="button"
          title={action.title}
          aria-label={action.ariaLabel}
          disabled={action.disabled}
          onClick={action.onClick}
          style={{
            fontSize: "0.6875rem",
            color: "var(--color-text-muted)",
            background: "none",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
            padding: "0.25rem 0.625rem",
            cursor: action.disabled ? "default" : "pointer",
            lineHeight: 1.4,
            opacity: action.disabled ? 0.6 : 1,
            transition: STUDIO_INTERACTION_TRANSITION,
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

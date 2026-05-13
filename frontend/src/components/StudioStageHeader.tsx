"use client";

import type { HTMLAttributes, ReactNode } from "react";

import NameInput from "@/components/NameInput";

type StudioStageHeaderProps = HTMLAttributes<HTMLDivElement> & {
  slotLabel: string;
  showSlotLabel?: boolean;
  typeLabel?: string;
  cursorName?: string | null;
  cursorNameLabel?: string;
  cursorNamePlaceholder?: string;
  onCursorNameChange?: (name: string) => void;
  statusBadge?: ReactNode;
  actions?: ReactNode;
};

export default function StudioStageHeader({
  slotLabel,
  showSlotLabel = true,
  typeLabel,
  cursorName,
  cursorNameLabel,
  cursorNamePlaceholder,
  onCursorNameChange,
  statusBadge,
  actions,
  style,
  ...props
}: StudioStageHeaderProps) {
  return (
    <div
      {...props}
      data-testid="studio-stage-header"
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "1rem",
        minHeight: "2.75rem",
        padding: "0.125rem 0",
        ...style,
      }}
    >
      <div
        style={{
          minWidth: 0,
          display: "grid",
          gap: "0.25rem",
          flex: "1 1 auto",
        }}
      >
        {showSlotLabel ? (
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-text-muted)",
            }}
          >
            {slotLabel}
          </div>
        ) : null}
        {cursorName != null ? (
          onCursorNameChange ? (
            <NameInput
              value={cursorName}
              onChange={onCursorNameChange}
              placeholder={cursorNamePlaceholder}
              ariaLabel={cursorNameLabel}
              variant="stageTitle"
              containerStyle={{
                width: "min(100%, 22rem)",
                minWidth: 0,
              }}
            />
          ) : (
            <div
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {cursorName}
            </div>
          )
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexShrink: 0,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        {actions}
        {typeLabel ? (
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              padding: "0.25rem 0.5rem",
              borderRadius: "0",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
              backgroundColor: "var(--color-bg-primary)",
              lineHeight: 1,
            }}
          >
            {typeLabel}
          </span>
        ) : null}
        {statusBadge ? (
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              padding: "0.25rem 0.5rem",
              borderRadius: "0",
              border: "1px solid var(--color-border)",
              color: "var(--color-accent)",
              backgroundColor: "var(--color-accent-subtle)",
              lineHeight: 1,
            }}
          >
            {statusBadge}
          </span>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

import StudioSurfaceCard, {
  STUDIO_INTERACTION_TRANSITION,
} from "@/components/StudioSurfaceCard";

type StudioInspectorProps = HTMLAttributes<HTMLElement> & {
  summary: ReactNode;
  previews?: ReactNode;
  quickActions?: ReactNode;
  children?: ReactNode;
};

export default function StudioInspector({
  summary,
  previews,
  quickActions,
  children,
  style,
  ...props
}: StudioInspectorProps) {
  return (
    <aside
      {...props}
      data-testid="studio-inspector"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        ...style,
      }}
    >
      <div style={{ display: "grid", gap: "0.875rem" }}>
        <StudioSurfaceCard
          data-testid="studio-inspector-summary-card"
          style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}
        >
          {summary}
        </StudioSurfaceCard>

        <div style={previews == null ? { minHeight: "8.75rem" } : undefined}>
          {previews != null ? (
            <StudioSurfaceCard
              data-testid="studio-inspector-actual-size-card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
              }}
            >
              {previews}
            </StudioSurfaceCard>
          ) : null}
        </div>

        {quickActions != null ? (
          <StudioSurfaceCard
            data-testid="studio-inspector-quick-actions"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            {quickActions}
          </StudioSurfaceCard>
        ) : null}
      </div>

      {children != null ? (
        <div style={{ display: "grid", gap: "1rem" }}>{children}</div>
      ) : null}
    </aside>
  );
}

type StudioInspectorSectionProps = HTMLAttributes<HTMLElement> & {
  title: string;
  action?: ReactNode;
};

export function StudioInspectorSection({
  title,
  action,
  children,
  style,
  ...props
}: StudioInspectorSectionProps) {
  return (
    <section
      {...props}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "0.75rem",
        }}
      >
        <h3
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: 0,
          }}
        >
          {title}
        </h3>

        {action != null ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {action}
          </div>
        ) : null}
      </div>

      <div style={{ display: "grid", gap: "0.5rem" }}>{children}</div>
    </section>
  );
}

type StudioInspectorRowProps = {
  label: ReactNode;
  value: ReactNode;
};

export function StudioInspectorRow({ label, value }: StudioInspectorRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "0.75rem",
        fontSize: "0.8125rem",
        lineHeight: 1.45,
      }}
    >
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--color-text-primary)", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

type StudioInspectorSecondaryButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement>;

export function StudioInspectorSecondaryButton({
  style,
  children,
  type = "button",
  ...props
}: StudioInspectorSecondaryButtonProps) {
  return (
    <button
      {...props}
      type={type}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.375rem",
        width: "100%",
        borderRadius: "0.75rem",
        border: "1px solid var(--color-border)",
        backgroundColor: "rgba(255,255,255,0.02)",
        color: "var(--color-text-primary)",
        fontSize: "0.75rem",
        lineHeight: 1.4,
        padding: "0.5rem 0.75rem",
        cursor: "pointer",
        transition: STUDIO_INTERACTION_TRANSITION,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

type StudioInspectorNumberFieldProps =
  InputHTMLAttributes<HTMLInputElement> & {
    label: ReactNode;
  };

export function StudioInspectorNumberField({
  label,
  id,
  style,
  ...props
}: StudioInspectorNumberFieldProps) {
  const resolvedId =
    id ??
    `studio-inspector-number-${String(label)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;

  return (
    <label
      htmlFor={resolvedId}
      style={{
        display: "grid",
        gap: "0.375rem",
        fontSize: "0.75rem",
        color: "var(--color-text-secondary)",
      }}
    >
      <span>{label}</span>
      <input
        {...props}
        id={resolvedId}
        type={props.type ?? "number"}
        style={{
          width: "100%",
          borderRadius: "0.75rem",
          border: "1px solid var(--color-border)",
          backgroundColor: "rgba(255,255,255,0.02)",
          color: "var(--color-text-primary)",
          fontSize: "0.8125rem",
          lineHeight: 1.4,
          padding: "0.5rem 0.75rem",
          outline: "none",
          ...style,
        }}
      />
    </label>
  );
}

type StudioInspectorSegmentedControlProps<T extends string | number> = {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  getLabel?: (value: T) => ReactNode;
  ariaLabel?: string;
};

export function StudioInspectorSegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  getLabel,
  ariaLabel,
}: StudioInspectorSegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        border: "1px solid var(--color-border)",
        borderRadius: "0.75rem",
        overflow: "visible",
        backgroundColor: "rgba(255,255,255,0.02)",
      }}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={String(option)}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option)}
            style={{
              minWidth: 0,
              border: "none",
              borderRight:
                option === options[options.length - 1]
                  ? "none"
                  : "1px solid var(--color-border)",
              backgroundColor: selected
                ? "var(--color-accent-subtle)"
                : "transparent",
              color: selected
                ? "var(--color-accent)"
                : "var(--color-text-muted)",
              borderRadius:
                option === options[0]
                  ? "0.625rem 0 0 0.625rem"
                  : option === options[options.length - 1]
                    ? "0 0.625rem 0.625rem 0"
                    : undefined,
              fontSize: "0.75rem",
              lineHeight: 1.4,
              padding: "0.5rem 0.625rem",
              cursor: "pointer",
              transition: STUDIO_INTERACTION_TRANSITION,
            }}
          >
            {getLabel ? getLabel(option) : String(option)}
          </button>
        );
      })}
    </div>
  );
}

type StudioInspectorEmptyNoticeProps = {
  slotLabel: string;
  expectedControls: string[];
  expectedControlsTitle: string;
  formatGuidance: string[];
  formatGuidanceTitle: string;
  title: string;
  summary: string;
};

type StudioInspectorCompactGuidanceProps = {
  title: string;
  summary: string;
  lines: string[];
};

export function StudioInspectorEmptyNotice({
  slotLabel,
  expectedControls,
  expectedControlsTitle,
  formatGuidance,
  formatGuidanceTitle,
  title,
  summary,
}: StudioInspectorEmptyNoticeProps) {
  return (
    <div
      data-testid="studio-inspector-empty-notice"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        color: "var(--color-text-muted)",
        lineHeight: 1.5,
      }}
    >
      <div style={{ display: "grid", gap: "0.25rem" }}>
        <div
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-primary)",
            fontWeight: 600,
          }}
        >
          {slotLabel}
        </div>
        <div style={{ fontSize: "0.8125rem" }}>{summary}</div>
      </div>

      <div style={{ display: "grid", gap: "0.375rem" }}>
        <div
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {expectedControlsTitle}
        </div>
        <div style={{ display: "grid", gap: "0.25rem" }}>
          {expectedControls.map((control) => (
            <div
              key={control}
              style={{ fontSize: "0.8125rem", color: "var(--color-text-primary)" }}
            >
              {control}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: "0.375rem" }}>
        <div
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {formatGuidanceTitle}
        </div>
        <div style={{ display: "grid", gap: "0.25rem" }}>
          {formatGuidance.map((line) => (
            <div
              key={line}
              style={{ fontSize: "0.8125rem", color: "var(--color-text-primary)" }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StudioInspectorCompactGuidance({
  title,
  summary,
  lines,
}: StudioInspectorCompactGuidanceProps) {
  return (
    <div
      data-testid="studio-inspector-compact-guidance"
      style={{
        display: "grid",
        gap: "0.875rem",
        color: "var(--color-text-muted)",
        lineHeight: 1.5,
      }}
    >
      <div style={{ display: "grid", gap: "0.375rem" }}>
        <div
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-text-secondary)",
          }}
        >
          {summary}
        </div>
      </div>

      <div style={{ display: "grid", gap: "0.5rem" }}>
        {lines.map((line) => (
          <div
            key={line}
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-primary)",
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

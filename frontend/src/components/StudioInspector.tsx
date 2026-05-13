"use client";

import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  CSSProperties,
  ReactNode,
} from "react";

import { STUDIO_INTERACTION_TRANSITION } from "@/components/StudioSurfaceCard";

type StudioInspectorProps = HTMLAttributes<HTMLElement> & {
  summary?: ReactNode;
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
  const controlSections = flattenInspectorSections(children);

  return (
    <aside
      {...props}
      data-testid="studio-inspector"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0",
        ...style,
      }}
    >
      {summary != null ? (
        <div
          data-testid="studio-inspector-status-strip"
          style={{
            display: "grid",
            gap: "0.625rem",
            padding: "0 0 0.875rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {summary}
        </div>
      ) : null}

      {previews != null ? (
        <div
          data-testid="studio-inspector-inline-preview"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            padding: "0.875rem 0",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {previews}
        </div>
      ) : null}

      {quickActions != null ? (
        <div
          data-testid="studio-inspector-quick-actions"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.625rem",
            padding: "0.875rem 0",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {quickActions}
        </div>
      ) : null}

      {controlSections.length > 0 ? (
        <div
          data-testid="studio-inspector-sections"
          style={{
            display: "grid",
            gap: 0,
            padding: "0.2rem 0 0",
          }}
        >
          {controlSections.map((child, index) => (
            <div key={index} style={{ display: "grid", gap: 0 }}>
              {index > 0 ? (
                <div
                  aria-hidden="true"
                  data-testid={`studio-inspector-divider-${index}`}
                  style={{
                    height: "1px",
                    margin: "0.2rem 0 0.15rem",
                    background:
                      "color-mix(in srgb, var(--color-border) 74%, rgba(20, 24, 32, 0.32) 26%)",
                    opacity: 0.95,
                  }}
                />
              ) : null}
              <div
                style={{
                  padding: "0.8rem 0",
                }}
              >
                {child}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function flattenInspectorSections(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return [child];
    if (child.type === Fragment) {
      return flattenInspectorSections(child.props.children);
    }
    return [child];
  });
}

type StudioInspectorGroupProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function StudioInspectorGroup({
  children,
  style,
  ...props
}: StudioInspectorGroupProps) {
  const items = flattenInspectorSections(children);

  return (
    <div
      {...props}
      style={{
        display: "grid",
        gap: 0,
        ...style,
      }}
    >
      {items.map((item, index) => (
        <div key={index} style={{ display: "grid", gap: 0 }}>
          {index > 0 ? (
            <div
              aria-hidden="true"
              style={{
                height: "1px",
                margin: "0.1rem 0 0.35rem",
                background:
                  "color-mix(in srgb, var(--color-border) 62%, rgba(20, 24, 32, 0.18) 38%)",
                opacity: 0.82,
              }}
            />
          ) : null}
          <div style={{ padding: "0.1rem 0 0.35rem" }}>{item}</div>
        </div>
      ))}
    </div>
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
        display: "grid",
        gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
        alignItems: "start",
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

type StudioInspectorSizeSummaryProps = {
  sourceLabel: ReactNode;
  sourceValue: ReactNode;
  outputLabel: ReactNode;
  outputValue: ReactNode;
};

export function StudioInspectorSizeSummary({
  sourceLabel,
  sourceValue,
  outputLabel,
  outputValue,
}: StudioInspectorSizeSummaryProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: "0.15rem 0.45rem",
        textAlign: "right",
      }}
    >
      <span style={{ whiteSpace: "nowrap" }}>
        {sourceLabel} {sourceValue}
      </span>
      <span aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>
        /
      </span>
      <span style={{ whiteSpace: "nowrap" }}>
        {outputLabel} {outputValue}
      </span>
    </span>
  );
}

type StudioInspectorSliderControlProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  label: string;
  value: number;
  valueLabel?: ReactNode;
  editValue?: string;
  onChange: (value: number) => void;
  onCommit?: () => void;
  parseEditValue?: (value: string) => number;
};

export function StudioInspectorSliderControl({
  label,
  id,
  value,
  valueLabel,
  editValue,
  min,
  max,
  step,
  onChange,
  onCommit,
  parseEditValue,
  style,
  onPointerUp,
  onPointerCancel,
  onBlur,
  ...props
}: StudioInspectorSliderControlProps) {
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [draftValue, setDraftValue] = useState(() =>
    getSliderEditValue(value, valueLabel, editValue)
  );
  const draftInputRef = useRef<HTMLInputElement>(null);
  const resolvedId =
    id ??
    `studio-inspector-slider-${label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;
  const displayValue = valueLabel ?? value;

  useEffect(() => {
    if (!isEditingValue) {
      setDraftValue(getSliderEditValue(value, valueLabel, editValue));
    }
  }, [editValue, isEditingValue, value, valueLabel]);

  useEffect(() => {
    if (isEditingValue) {
      draftInputRef.current?.focus();
      draftInputRef.current?.select();
    }
  }, [isEditingValue]);

  const commitDraftValue = () => {
    const parsedValue = parseEditValue
      ? parseEditValue(draftValue)
      : Number(draftValue.trim());

    if (Number.isFinite(parsedValue)) {
      onChange(clamp(parsedValue, toOptionalNumber(min), toOptionalNumber(max)));
      onCommit?.();
    }

    setIsEditingValue(false);
  };

  return (
    <div
      data-testid="studio-inspector-slider-control"
      style={{
        display: "grid",
        gap: "0.35rem",
        fontSize: "0.75rem",
        color: "var(--color-text-secondary)",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <label htmlFor={resolvedId}>{label}</label>
        {isEditingValue ? (
          <input
            ref={draftInputRef}
            aria-label={`${label} value`}
            type="text"
            inputMode="decimal"
            value={draftValue}
            onChange={(event) => setDraftValue(event.currentTarget.value)}
            onBlur={commitDraftValue}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitDraftValue();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                setDraftValue(getSliderEditValue(value, valueLabel, editValue));
                setIsEditingValue(false);
              }
            }}
            style={{
              width: "4.5rem",
              minWidth: 0,
              border: "none",
              borderBottom: "1px solid var(--color-accent)",
              background: "transparent",
              color: "var(--color-text-primary)",
              fontSize: "0.75rem",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.3,
              outline: "none",
              padding: "0 0 0.1rem",
              textAlign: "right",
            }}
          />
        ) : (
          <button
            type="button"
            aria-label={`Edit ${label} value`}
            onClick={() => {
              setDraftValue(getSliderEditValue(value, valueLabel, editValue));
              setIsEditingValue(true);
            }}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--color-text-primary)",
              cursor: "text",
              fontSize: "0.75rem",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.3,
              padding: 0,
              textAlign: "right",
            }}
          >
            {displayValue}
          </button>
        )}
      </span>
      <input
        {...props}
        id={resolvedId}
        data-borderless="true"
        className="studio-inspector-slider"
        type="range"
        aria-label={props["aria-label"] ?? label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          const nextValue = Number(event.currentTarget.value);
          onChange(Number.isFinite(nextValue) ? nextValue : value);
        }}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          onCommit?.();
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          onCommit?.();
        }}
        onBlur={(event) => {
          onBlur?.(event);
          onCommit?.();
        }}
        style={{
          width: "100%",
          height: "1rem",
          border: "none",
          background: "transparent",
          accentColor: "var(--color-accent)",
          cursor: "pointer",
          padding: 0,
          ...style,
        }}
      />
      <style>{`
        .studio-inspector-slider {
          -webkit-appearance: none;
          appearance: none;
        }
        .studio-inspector-slider::-webkit-slider-runnable-track {
          height: 3px;
          border: none;
          border-radius: 999px;
          background: color-mix(in srgb, var(--color-border) 78%, var(--color-text-muted) 22%);
        }
        .studio-inspector-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0.85rem;
          height: 0.85rem;
          margin-top: calc((3px - 0.85rem) / 2);
          border: none;
          border-radius: 999px;
          background: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-subtle);
        }
        .studio-inspector-slider::-moz-range-track {
          height: 3px;
          border: none;
          border-radius: 999px;
          background: color-mix(in srgb, var(--color-border) 78%, var(--color-text-muted) 22%);
        }
        .studio-inspector-slider::-moz-range-thumb {
          width: 0.85rem;
          height: 0.85rem;
          border: none;
          border-radius: 999px;
          background: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-subtle);
        }
      `}</style>
    </div>
  );
}

function getSliderEditValue(
  value: number,
  valueLabel: ReactNode,
  editValue?: string
) {
  if (editValue != null) return editValue;
  if (typeof valueLabel === "string" || typeof valueLabel === "number") {
    return String(valueLabel).replace(/%$/, "");
  }
  return String(value);
}

function toOptionalNumber(value: InputHTMLAttributes<HTMLInputElement>["min"]) {
  if (value == null) return undefined;
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : undefined;
}

type StudioInspectorPreviewStripProps = {
  label: ReactNode;
  children: ReactNode;
};

export function StudioInspectorPreviewStrip({
  label,
  children,
}: StudioInspectorPreviewStripProps) {
  return (
    <div
      data-testid="studio-output-preview-strip"
      style={{
        display: "grid",
        gap: "0.45rem",
        paddingTop: "0.15rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
          {label}
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "0.5rem",
        }}
      >
        {children}
      </div>
    </div>
  );
}

type StudioInspectorHotspotTargetProps = {
  x: number;
  y: number;
  size: number;
  label?: string;
  style?: CSSProperties;
};

export function StudioInspectorHotspotTarget({
  x,
  y,
  size,
  label,
  style,
}: StudioInspectorHotspotTargetProps) {
  const normalizedSize = Number.isFinite(size) && size > 0 ? size : 32;
  const left = clamp((x / normalizedSize) * 100, 0, 100);
  const top = clamp((y / normalizedSize) * 100, 0, 100);

  return (
    <div
      data-testid="studio-hotspot-target"
      aria-label={label}
      role={label ? "img" : undefined}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 0.42",
        minHeight: "5rem",
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-primary)",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "12.5% 25%",
          opacity: 0.42,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: `${left}%`,
          top: `${top}%`,
          width: "1.05rem",
          height: "1.05rem",
          transform: "translate(-50%, -50%)",
          borderRadius: "999px",
          border: "2px solid var(--color-accent)",
          backgroundColor: "var(--color-bg-secondary)",
          boxShadow: "0 0 0 3px var(--color-accent-subtle)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: `${left}%`,
          top: 0,
          bottom: 0,
          width: "1px",
          backgroundColor: "var(--color-accent)",
          opacity: 0.38,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: `${top}%`,
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: "var(--color-accent)",
          opacity: 0.38,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "0.5rem",
          bottom: "0.45rem",
          fontSize: "0.6875rem",
          color: "var(--color-text-muted)",
          backgroundColor: "color-mix(in srgb, var(--color-bg-primary) 82%, transparent)",
          padding: "0.15rem 0.35rem",
        }}
      >
        {Math.round(x)}, {Math.round(y)}
      </div>
    </div>
  );
}

function clamp(value: number, min = -Infinity, max = Infinity) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
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
        borderRadius: "0.25rem",
        border: "1px solid color-mix(in srgb, var(--color-border) 88%, white 4%)",
        backgroundColor: "var(--color-bg-primary)",
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
          borderRadius: "0.25rem",
          border: "1px solid color-mix(in srgb, var(--color-border) 88%, white 4%)",
          backgroundColor: "var(--color-bg-primary)",
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
        borderRadius: "0.25rem",
        overflow: "visible",
        backgroundColor: "var(--color-bg-primary)",
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
                  ? "0.2rem 0 0 0.2rem"
                  : option === options[options.length - 1]
                    ? "0 0.2rem 0.2rem 0"
                    : undefined,
              fontSize: "0.75rem",
              lineHeight: 1.4,
              padding: "0.55rem 0.625rem",
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

type StudioInspectorTextActionProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "text" | "button";
  };

export function StudioInspectorTextAction({
  style,
  children,
  type = "button",
  variant = "text",
  ...props
}: StudioInspectorTextActionProps) {
  const isButton = variant === "button";

  return (
    <button
      {...props}
      type={type}
      style={{
        ...(isButton
          ? {
              alignItems: "center",
              backgroundColor: "var(--color-bg-primary)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.25rem",
              color: "var(--color-text-primary)",
              display: "inline-flex",
              justifyContent: "center",
              lineHeight: 1,
              minHeight: "1.75rem",
              padding: "0.35rem 0.55rem",
            }
          : {
              background: "none",
              border: "none",
              color: "var(--color-text-secondary)",
              padding: 0,
            }),
        fontSize: "0.6875rem",
        fontWeight: isButton ? 700 : 600,
        letterSpacing: "0.02em",
        cursor: "pointer",
        transition: STUDIO_INTERACTION_TRANSITION,
        ...style,
      }}
    >
      {children}
    </button>
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

"use client";

interface StudioSelectionSummaryProps {
  slotLabelTitle: string;
  slotLabel: string;
  cursorLabelTitle: string;
  cursorName: string;
  statusLabelTitle: string;
  statusLabel: string;
  typeLabelTitle: string;
  typeLabel: string;
}

export default function StudioSelectionSummary({
  slotLabelTitle,
  slotLabel,
  cursorLabelTitle,
  cursorName,
  statusLabelTitle,
  statusLabel,
  typeLabelTitle,
  typeLabel,
}: StudioSelectionSummaryProps) {
  return (
    <div
      data-testid="studio-selection-summary"
      style={{ display: "grid", gap: "0.625rem", minWidth: 0 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.75rem",
          minWidth: 0,
        }}
      >
        <div style={{ display: "grid", gap: "0.2rem", minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.6875rem",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
            }}
          >
            {cursorLabelTitle}
          </div>
          <div
            title={cursorName}
            style={{
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "var(--color-text-primary)",
              fontSize: "0.875rem",
              fontWeight: 700,
              lineHeight: 1.25,
            }}
          >
            {cursorName}
          </div>
        </div>
        <SummaryPill title={typeLabelTitle} value={typeLabel} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "0.45rem",
        }}
      >
        <SummaryPill title={slotLabelTitle} value={slotLabel} />
        <SummaryPill title={statusLabelTitle} value={statusLabel} accent />
      </div>
    </div>
  );
}

function SummaryPill({
  title,
  value,
  accent = false,
}: {
  title: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      title={`${title}: ${value}`}
      style={{
        minWidth: 0,
        border: "1px solid var(--color-border)",
        backgroundColor: accent ? "var(--color-accent-subtle)" : "var(--color-bg-primary)",
        color: accent ? "var(--color-accent)" : "var(--color-text-secondary)",
        padding: "0.35rem 0.45rem",
        display: "grid",
        gap: "0.12rem",
      }}
    >
      <span
        style={{
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: "0.625rem",
          color: accent ? "var(--color-accent)" : "var(--color-text-muted)",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
      <span
        style={{
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: "0.75rem",
          fontWeight: 650,
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
    </div>
  );
}

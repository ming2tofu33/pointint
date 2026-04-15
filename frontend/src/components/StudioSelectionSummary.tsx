"use client";

import { StudioInspectorRow } from "@/components/StudioInspector";

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
    <div style={{ display: "grid", gap: "0.375rem" }}>
      <StudioInspectorRow label={slotLabelTitle} value={slotLabel} />
      <StudioInspectorRow label={cursorLabelTitle} value={cursorName} />
      <StudioInspectorRow label={statusLabelTitle} value={statusLabel} />
      <StudioInspectorRow label={typeLabelTitle} value={typeLabel} />
    </div>
  );
}

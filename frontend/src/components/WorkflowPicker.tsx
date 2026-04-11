"use client";

import { useTranslations } from "next-intl";

import {
  WORKFLOW_OPTIONS,
  type WorkflowOption,
  type WorkflowOptionId,
} from "@/lib/studioWorkflow";

export interface WorkflowPickerProps {
  onSelectWorkflow?: (workflowId: WorkflowOptionId) => void;
}

export default function WorkflowPicker({
  onSelectWorkflow,
}: WorkflowPickerProps) {
  const t = useTranslations("upload");
  const curOptions = WORKFLOW_OPTIONS.filter((option) => option.family === "cur");
  const aniOptions = WORKFLOW_OPTIONS.filter((option) => option.family === "ani");

  return (
    <section
      aria-label="Workflow picker"
      style={{
        width: "min(40rem, 100%)",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <h1
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          {t("workflowTitle")}
        </h1>
        <p
          style={{
            fontSize: "0.8125rem",
            lineHeight: 1.6,
            color: "var(--color-text-muted)",
          }}
        >
          {t("workflowSub")}
        </p>
      </div>

      <WorkflowGroup
        title={t("curGroup")}
        options={curOptions}
        onSelectWorkflow={onSelectWorkflow}
      />
      <WorkflowGroup
        title={t("aniGroup")}
        options={aniOptions}
        onSelectWorkflow={onSelectWorkflow}
      />
    </section>
  );
}

function WorkflowGroup({
  title,
  options,
  onSelectWorkflow,
}: {
  title: string;
  options: WorkflowOption[];
  onSelectWorkflow?: (workflowId: WorkflowOptionId) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <h2
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "var(--color-text-muted)",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {options.map((option) => (
          <WorkflowCard
            key={option.id}
            option={option}
            onSelectWorkflow={onSelectWorkflow}
          />
        ))}
      </div>
    </div>
  );
}

function WorkflowCard({
  option,
  onSelectWorkflow,
}: {
  option: WorkflowOption;
  onSelectWorkflow?: (workflowId: WorkflowOptionId) => void;
}) {
  const t = useTranslations("upload");
  const isAvailable = option.availability === "available";

  return (
    <button
      type="button"
      disabled={!isAvailable}
      aria-disabled={!isAvailable}
      onClick={() => onSelectWorkflow?.(option.id)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.375rem",
        width: "100%",
        padding: "0.875rem 1rem",
        border: `1px solid ${isAvailable ? "var(--color-accent)" : "var(--color-border)"}`,
        backgroundColor: isAvailable
          ? "var(--color-accent-subtle)"
          : "var(--color-bg-secondary)",
        color: "var(--color-text-primary)",
        textAlign: "left",
        cursor: isAvailable ? "pointer" : "not-allowed",
        opacity: isAvailable ? 1 : 0.7,
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
          {t(option.titleKey)}
        </span>
        <span
          style={{
            fontSize: "0.625rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: isAvailable
              ? "var(--color-accent)"
              : "var(--color-text-muted)",
          }}
        >
          {isAvailable ? t("available") : t("soon")}
        </span>
      </div>
      <span
        style={{
          fontSize: "0.75rem",
          lineHeight: 1.5,
          color: "var(--color-text-muted)",
        }}
      >
        {t(option.descriptionKey)}
      </span>
    </button>
  );
}

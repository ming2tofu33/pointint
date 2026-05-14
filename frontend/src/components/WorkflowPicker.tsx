"use client";

import { useTranslations } from "next-intl";

import {
  WORKFLOW_OPTIONS,
  type WorkflowOption,
  type WorkflowOptionId,
} from "@/lib/studioWorkflow";
import { trackEvent } from "@/lib/analytics";
import InteractiveDotBackground from "@/components/InteractiveDotBackground";

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
      className="workflow-picker-shell"
      data-testid="workflow-picker"
      aria-label="Workflow picker"
      onMouseMove={(event) => {
        setInteractiveDotPosition(
          event.currentTarget,
          event.clientX,
          event.clientY
        );
      }}
      onPointerMove={(event) => {
        setInteractiveDotPosition(
          event.currentTarget,
          event.clientX,
          event.clientY
        );
      }}
    >
      <InteractiveDotBackground
        layerTestId="workflow-picker-dots"
        baseColor="color-mix(in srgb, var(--color-text-primary) 13%, transparent)"
        hoverRadius={190}
      />

      <div className="workflow-picker-panel" data-testid="workflow-picker-panel">
        <header className="workflow-picker-header">
          <h1>{t("workflowTitle")}</h1>
          <p>{t("workflowSub")}</p>
        </header>

        <div className="workflow-picker-groups">
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
        </div>
      </div>
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
    <div className="workflow-picker-group">
      <h2>{title}</h2>
      <div className="workflow-picker-card-list">
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
      className={`workflow-picker-card ${
        isAvailable
          ? "workflow-picker-card--available"
          : "workflow-picker-card--soon"
      }`}
      data-testid={`workflow-card-${option.id}`}
      disabled={!isAvailable}
      aria-disabled={!isAvailable}
      onClick={() => {
        trackEvent("workflow_selected", {
          availability: option.availability,
          family: option.family,
          workflow_id: option.id,
        });
        onSelectWorkflow?.(option.id);
      }}
    >
      <div className="workflow-picker-card-header">
        <span className="workflow-picker-card-title">{t(option.titleKey)}</span>
        <span className="workflow-picker-card-badge">
          {isAvailable ? t("available") : t("soon")}
        </span>
      </div>
      <span className="workflow-picker-card-description">{t(option.descriptionKey)}</span>
    </button>
  );
}

function setInteractiveDotPosition(
  element: HTMLElement,
  clientX: number,
  clientY: number
) {
  const rect = element.getBoundingClientRect();
  element.style.setProperty("--mouse-x", `${clientX - rect.left}px`);
  element.style.setProperty("--mouse-y", `${clientY - rect.top}px`);
}

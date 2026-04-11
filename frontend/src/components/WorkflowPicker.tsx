"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  WORKFLOW_OPTIONS,
  type WorkflowOptionId,
} from "../lib/studioWorkflow";

export interface WorkflowPickerProps {
  onSelectWorkflow?: (workflowId: WorkflowOptionId) => void;
}

export function WorkflowPicker({ onSelectWorkflow }: WorkflowPickerProps) {
  const t = useTranslations("upload");
  const groups = Object.entries(
    WORKFLOW_OPTIONS.reduce(
      (acc, option) => {
        acc[option.family].push(option);
        return acc;
      },
      { cur: [], ani: [] } as Record<
        "cur" | "ani",
        (typeof WORKFLOW_OPTIONS)[number][]
      >
    )
  ) as Array<["cur" | "ani", (typeof WORKFLOW_OPTIONS)[number][]]>;

  return (
    <section aria-label="Workflow picker">
      {groups.map(([family, options]) => (
        <div key={family}>
          <h2>{family === "cur" ? t("curGroup") : t("aniGroup")}</h2>
          <div>
            {options.map((option) => {
              const disabled = option.availability !== "available";

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectWorkflow?.(option.id)}
                >
                  <span>{t(option.titleKey)}</span>
                  <span>{t(option.descriptionKey)}</span>
                  <span>
                    {option.availability === "available"
                      ? t("available")
                      : t("soon")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

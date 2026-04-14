"use client";

import { type CSSProperties } from "react";
import { useTranslations } from "next-intl";

import {
  type SimulationSceneId,
  SIMULATION_SCENE_IDS,
} from "@/lib/simulationScenes";

interface SimulationSceneTabsProps {
  value: SimulationSceneId;
  onChange: (sceneId: SimulationSceneId) => void;
}

const FALLBACK_LABELS: Record<SimulationSceneId, string> = {
  browser: "Browser",
  system: "System Work",
  windowControls: "Window Controls",
};

const FALLBACK_ARIA: Record<SimulationSceneId, string> = {
  browser: "Browser scene",
  system: "System work scene",
  windowControls: "Window controls scene",
};

export default function SimulationSceneTabs({
  value,
  onChange,
}: SimulationSceneTabsProps) {
  const t = useTranslations("simulation");

  return (
    <div
      data-testid="simulation-scene-tabs"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.125rem",
        border: "1px solid var(--simulation-panel-border)",
        backgroundColor: "rgba(255,255,255,0.03)",
      }}
    >
      {SIMULATION_SCENE_IDS.map((sceneId) => {
        const active = sceneId === value;
        const label = getTranslatedLabel(t(sceneIdToLabelKey(sceneId)), sceneId);
        const ariaLabel = getTranslatedAria(
          t(sceneIdToAriaKey(sceneId)),
          sceneId
        );

        return (
          <button
            key={sceneId}
            type="button"
            aria-pressed={active}
            aria-label={ariaLabel}
            onClick={() => onChange(sceneId)}
            style={{
              ...tabStyle,
              color: active
                ? "var(--simulation-panel-text)"
                : "var(--simulation-panel-muted)",
              backgroundColor: active
                ? "var(--simulation-tab-active-bg)"
                : "transparent",
              borderColor: active
                ? "var(--simulation-panel-border)"
                : "transparent",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function sceneIdToLabelKey(sceneId: SimulationSceneId) {
  switch (sceneId) {
    case "browser":
      return "sceneBrowser";
    case "system":
      return "sceneSystem";
    case "windowControls":
      return "sceneWindowControls";
  }
}

function sceneIdToAriaKey(sceneId: SimulationSceneId) {
  switch (sceneId) {
    case "browser":
      return "sceneBrowserAria";
    case "system":
      return "sceneSystemAria";
    case "windowControls":
      return "sceneWindowControlsAria";
  }
}

function getTranslatedLabel(
  translated: string,
  sceneId: SimulationSceneId
) {
  return translated === sceneIdToLabelKey(sceneId)
    ? FALLBACK_LABELS[sceneId]
    : translated;
}

function getTranslatedAria(
  translated: string,
  sceneId: SimulationSceneId
) {
  return translated === sceneIdToAriaKey(sceneId)
    ? FALLBACK_ARIA[sceneId]
    : translated;
}

const tabStyle: CSSProperties = {
  fontSize: "0.6875rem",
  lineHeight: 1,
  border: "1px solid transparent",
  padding: "0.4rem 0.65rem",
  cursor: "pointer",
  transition: "background-color 160ms ease, border-color 160ms ease, color 160ms ease",
};

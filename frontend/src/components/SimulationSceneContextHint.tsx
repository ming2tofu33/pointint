"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { type SimulationSceneId } from "@/lib/simulationScenes";

const SCENE_HINT_KEY: Record<
  SimulationSceneId,
  "browserGuideIntro" | "systemGuideIntro" | "windowGuideIntro"
> = {
  browser: "browserGuideIntro",
  system: "systemGuideIntro",
  windowControls: "windowGuideIntro",
};

export default function SimulationSceneContextHint({
  sceneId,
}: {
  sceneId: SimulationSceneId;
}) {
  const t = useTranslations("simulation");
  const [open, setOpen] = useState(false);
  const hint = t(SCENE_HINT_KEY[sceneId]);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        zIndex: 4,
      }}
    >
      <button
        type="button"
        data-testid="simulation-scene-context-hint"
        aria-label={hint}
        title={hint}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        style={{
          width: "1.5rem",
          height: "1.5rem",
          borderRadius: "999px",
          border: "1px solid var(--simulation-panel-border)",
          backgroundColor: "transparent",
          color: "var(--simulation-panel-muted)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "help",
          fontSize: "0.75rem",
          fontWeight: 700,
          lineHeight: 1,
          padding: 0,
          transition:
            "border-color 160ms ease, color 160ms ease, background-color 160ms ease",
        }}
      >
        i
      </button>
      {open ? (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 0.5rem)",
            minWidth: "13rem",
            maxWidth: "15rem",
            borderRadius: "0.75rem",
            border: "1px solid var(--simulation-panel-border)",
            backgroundColor: "var(--simulation-panel-bg)",
            color: "var(--simulation-panel-text)",
            boxShadow: "0 14px 32px rgba(8, 12, 20, 0.18)",
            padding: "0.625rem 0.75rem",
            fontSize: "0.6875rem",
            lineHeight: 1.45,
            whiteSpace: "normal",
            zIndex: 10,
          }}
        >
          {hint}
        </span>
      ) : null}
    </span>
  );
}

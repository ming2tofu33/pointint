"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { type CursorThemeProject, type SlotId } from "@/lib/cursorThemeProject";
import { STUDIO_INTERACTION_TRANSITION } from "@/components/StudioSurfaceCard";

interface SlotRailProps {
  project: CursorThemeProject;
  selectedSlotId: SlotId;
  pendingBackgroundRemovalSlotIds?: SlotId[];
  processingSlotId?: SlotId | null;
  onSelectSlot: (slotId: SlotId) => void;
}

type RoleSection = "primary" | "hidden";
type SlotStatusTone = "empty" | "ready" | "attention" | "processing";

type RoleDefinition = {
  id: SlotId;
  section: RoleSection;
  labelKey: string;
  hintKey: string;
  glyphSrc: string;
};

type ThemeName = "dark" | "light" | "custom";
type SlotGlyphTheme = "dark" | "light";

const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: "normalSelect",
    section: "primary",
    labelKey: "slotNormalSelect",
    hintKey: "slotNormalSelectHint",
    glyphSrc: "/ui/slot-glyphs/normal.svg",
  },
  {
    id: "textSelect",
    section: "primary",
    labelKey: "slotTextSelect",
    hintKey: "slotTextSelectHint",
    glyphSrc: "/ui/slot-glyphs/text.svg",
  },
  {
    id: "linkSelect",
    section: "primary",
    labelKey: "slotLinkSelect",
    hintKey: "slotLinkSelectHint",
    glyphSrc: "/ui/slot-glyphs/link.svg",
  },
  {
    id: "busy",
    section: "primary",
    labelKey: "slotBusy",
    hintKey: "slotBusyHint",
    glyphSrc: "/ui/slot-glyphs/busy.svg",
  },
  {
    id: "workingInBackground",
    section: "hidden",
    labelKey: "slotWorkingInBackground",
    hintKey: "slotWorkingInBackgroundHint",
    glyphSrc: "/ui/slot-glyphs/working-in-background.svg",
  },
  {
    id: "unavailable",
    section: "hidden",
    labelKey: "slotUnavailable",
    hintKey: "slotUnavailableHint",
    glyphSrc: "/ui/slot-glyphs/unavailable.svg",
  },
  {
    id: "move",
    section: "hidden",
    labelKey: "slotMove",
    hintKey: "slotMoveHint",
    glyphSrc: "/ui/slot-glyphs/move.svg",
  },
  {
    id: "horizontalResize",
    section: "hidden",
    labelKey: "slotHorizontalResize",
    hintKey: "slotHorizontalResizeHint",
    glyphSrc: "/ui/slot-glyphs/horizontal-resize.svg",
  },
  {
    id: "verticalResize",
    section: "hidden",
    labelKey: "slotVerticalResize",
    hintKey: "slotVerticalResizeHint",
    glyphSrc: "/ui/slot-glyphs/vertical-resize.svg",
  },
  {
    id: "diagonalResize1",
    section: "hidden",
    labelKey: "slotDiagonalResize1",
    hintKey: "slotDiagonalResize1Hint",
    glyphSrc: "/ui/slot-glyphs/diagonal-resize-1.svg",
  },
  {
    id: "diagonalResize2",
    section: "hidden",
    labelKey: "slotDiagonalResize2",
    hintKey: "slotDiagonalResize2Hint",
    glyphSrc: "/ui/slot-glyphs/diagonal-resize-2.svg",
  },
];

const PRIMARY_ROLE_DEFINITIONS = ROLE_DEFINITIONS.filter(
  (definition) => definition.section === "primary"
);
const HIDDEN_ROLE_DEFINITIONS = ROLE_DEFINITIONS.filter(
  (definition) => definition.section === "hidden"
);

export default function SlotRail({
  project,
  selectedSlotId,
  pendingBackgroundRemovalSlotIds = [],
  processingSlotId = null,
  onSelectSlot,
}: SlotRailProps) {
  const t = useTranslations("studio");
  const [showAdditionalRoles, setShowAdditionalRoles] = useState(false);
  const pendingBackgroundRemovalSlotSet = new Set(pendingBackgroundRemovalSlotIds);
  const [glyphTheme, setGlyphTheme] = useState<SlotGlyphTheme>(() =>
    resolveSlotGlyphTheme(
      typeof document === "undefined"
        ? "dark"
        : (document.documentElement.getAttribute("data-theme") as ThemeName | null)
    )
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const syncGlyphTheme = () => {
      setGlyphTheme(
        resolveSlotGlyphTheme(
          document.documentElement.getAttribute("data-theme") as ThemeName | null
        )
      );
    };

    syncGlyphTheme();

    const themeObserver = new MutationObserver(() => {
      syncGlyphTheme();
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      themeObserver.disconnect();
    };
  }, []);

  const hiddenConfiguredCount = HIDDEN_ROLE_DEFINITIONS.filter((definition) =>
    isSlotConfigured(project.slots[definition.id])
  ).length;

  const visibleDefinitions = ROLE_DEFINITIONS.filter(
    (definition) => definition.section === "primary" || showAdditionalRoles
  );

  return (
    <nav
      data-testid="slot-rail"
      aria-label={t("slotRailTitle")}
      style={{
        width: "4.25rem",
        borderRight: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-secondary)",
        flexShrink: 0,
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <div
        data-testid="slot-rail-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarGutter: "stable",
          padding: "0.75rem 0.55rem",
          display: "grid",
          gap: "0.45rem",
          alignContent: "start",
          justifyItems: "center",
        }}
      >
        {visibleDefinitions.map((definition, index) => {
          const slot = project.slots[definition.id];
          const filled = isSlotConfigured(slot);
          const slotStatus = getSlotStatus({
            filled,
            isPendingBackgroundRemoval:
              pendingBackgroundRemovalSlotSet.has(definition.id),
            isProcessing: processingSlotId === definition.id,
            t,
          });
          const canSelectSlot = definition.id !== selectedSlotId;
          const shouldInsertExpander =
            definition.section === "primary" &&
            index === PRIMARY_ROLE_DEFINITIONS.length - 1 &&
            HIDDEN_ROLE_DEFINITIONS.length > 0;

          return (
            <div key={definition.id} style={{ display: "grid", gap: "0.75rem" }}>
              <SlotRailCard
                slotId={definition.id}
                selected={definition.id === selectedSlotId}
                slot={slot}
                filled={filled}
                title={t(definition.labelKey)}
                hint={t(definition.hintKey)}
                kindLabel={getKindLabel(slot.kind, t)}
                statusLabel={slotStatus.label}
                statusTone={slotStatus.tone}
                selectedLabel={t("slotSelected")}
                glyphTheme={glyphTheme}
                onSelect={() => {
                  if (canSelectSlot) onSelectSlot(definition.id);
                }}
              />

              {shouldInsertExpander ? (
                <button
                  type="button"
                  data-testid="slot-rail-more"
                  aria-expanded={showAdditionalRoles}
                  aria-controls="slot-rail-additional"
                  onClick={() => setShowAdditionalRoles((current) => !current)}
                  style={{
                    width: "3rem",
                    minHeight: "2.35rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0,
                    padding: 0,
                    borderRadius: "0.25rem",
                    border: `1px solid ${
                      showAdditionalRoles ? "var(--color-accent)" : "var(--color-border)"
                    }`,
                    backgroundColor: showAdditionalRoles
                      ? "var(--color-accent-subtle)"
                      : "var(--color-bg-primary)",
                    color: "var(--color-text-primary)",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: STUDIO_INTERACTION_TRANSITION,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      width: "1px",
                      height: "1px",
                      overflow: "hidden",
                      clipPath: "inset(50%)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        lineHeight: 1.2,
                      }}
                    >
                      {t("slotRailMore")}
                    </span>
                    <span
                      data-testid="slot-rail-more-summary"
                      style={{
                        fontSize: "0.625rem",
                        lineHeight: 1.2,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {hiddenConfiguredCount} {t("slotRailConfigured")}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      fontSize: "0.875rem",
                      lineHeight: 1,
                      color: "var(--color-text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {showAdditionalRoles ? "-" : "+"}
                  </span>
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

interface SlotRailCardProps {
  slotId: SlotId;
  slot: CursorThemeProject["slots"][SlotId];
  filled: boolean;
  selected: boolean;
  title: string;
  hint: string;
  kindLabel: string;
  statusLabel: string;
  statusTone: SlotStatusTone;
  selectedLabel: string;
  glyphTheme: SlotGlyphTheme;
  onSelect: () => void;
}

function SlotRailCard({
  slotId,
  slot,
  filled,
  selected,
  title,
  hint,
  kindLabel,
  statusLabel,
  statusTone,
  selectedLabel,
  glyphTheme,
  onSelect,
}: SlotRailCardProps) {
  const glyphSrc = ROLE_DEFINITIONS.find((definition) => definition.id === slotId)?.glyphSrc;

  return (
    <button
      type="button"
      data-testid={`slot-${slotId}`}
      aria-pressed={selected}
      aria-label={`${title}. ${statusLabel}. ${kindLabel}`}
      title={`${title} - ${hint}`}
      onClick={onSelect}
      style={{
        position: "relative",
        display: "flex",
        width: "3rem",
        minWidth: "3rem",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        padding: 0,
        minHeight: "3rem",
        borderRadius: "0.25rem",
        border: `1px solid ${selected ? "var(--color-accent)" : "var(--color-border)"}`,
        borderLeft: `1px solid ${selected ? "var(--color-accent)" : "var(--color-border)"}`,
        backgroundColor: selected ? "var(--color-accent-subtle)" : "var(--color-bg-primary)",
        boxShadow: "none",
        color: "var(--color-text-primary)",
        cursor: "pointer",
        textAlign: "left",
        transition: STUDIO_INTERACTION_TRANSITION,
      }}
    >
      <div
        data-testid={`slot-badge-stack-${slotId}`}
        style={{
          width: "2rem",
          flexShrink: 0,
          display: "grid",
          gap: 0,
          alignContent: "center",
        }}
      >
        {selected ? (
          <span
            data-testid={`slot-selected-badge-${slotId}`}
            style={{
              position: "absolute",
              top: "0.25rem",
              right: "0.25rem",
              width: "0.42rem",
              height: "0.42rem",
              overflow: "hidden",
              fontSize: 0,
              padding: 0,
              borderRadius: "999px",
              backgroundColor: "rgba(38, 132, 255, 0.16)",
              color: "var(--color-accent)",
              lineHeight: 1.2,
              justifySelf: "start",
            }}
          >
            {selectedLabel}
          </span>
        ) : (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "0.25rem",
              right: "0.25rem",
              width: "0.42rem",
              height: "0.42rem",
              overflow: "hidden",
              fontSize: 0,
              padding: 0,
              borderRadius: "999px",
              visibility: "hidden",
              lineHeight: 1.2,
              justifySelf: "start",
            }}
          >
            {selectedLabel}
          </span>
        )}

        <div
          data-testid={`slot-thumbnail-${slotId}`}
          style={{
            width: "2rem",
            height: "2rem",
            borderRadius: "0",
            border: `1px ${filled ? "solid" : "dashed"} ${
              selected ? "var(--color-accent)" : "var(--color-border)"
            }`,
            backgroundColor: filled
              ? "rgba(255,255,255,0.065)"
              : "rgba(255,255,255,0.025)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <span
            style={{
              width: "1.1rem",
              height: "1.1rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: selected
                ? "color-mix(in srgb, var(--color-accent) 78%, white 8%)"
                : "var(--color-text-muted)",
              lineHeight: 1,
            }}
          >
            <SlotContextGlyph
              glyphSrc={glyphSrc}
              slotId={slotId}
              glyphTheme={glyphTheme}
            />
          </span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clipPath: "inset(50%)",
          whiteSpace: "nowrap",
          minWidth: 0,
          flex: 1,
          display: "grid",
          gap: "0.125rem",
        }}
      >
        <div
          data-testid={`slot-title-${slotId}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              lineHeight: 1.2,
              minWidth: 0,
            }}
          >
            {title}
          </span>
        </div>

        <div
          data-testid={`slot-context-${slotId}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            minWidth: 0,
            color: "var(--color-text-secondary)",
          }}
        >
          <span
            data-testid={`slot-glyph-${slotId}`}
            aria-hidden="true"
            style={{
              width: "16px",
              height: "16px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: selected
                ? "color-mix(in srgb, var(--color-accent) 78%, white 8%)"
                : "var(--color-text-muted)",
            }}
            >
            </span>
          <span
            style={{
              fontSize: "0.6875rem",
              lineHeight: 1.2,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {hint}
          </span>
        </div>

        <div
          data-testid={`slot-status-${slotId}`}
          style={{
            fontSize: "0.625rem",
            color: getStatusToneColor(statusTone, filled),
            lineHeight: 1.2,
            fontWeight:
              statusTone === "attention" || statusTone === "processing"
                ? 700
                : 500,
          }}
        >
          {statusLabel}
        </div>

        <div
          data-testid={`slot-kind-${slotId}`}
          style={{
            fontSize: "0.625rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.2,
          }}
        >
          {kindLabel}
        </div>
      </div>
    </button>
  );
}

function isSlotConfigured(slot: CursorThemeProject["slots"][SlotId]) {
  return Boolean(slot.asset.previewUrl || slot.asset.originalUrl);
}

function getKindLabel(
  kind: CursorThemeProject["slots"][SlotId]["kind"],
  t: ReturnType<typeof useTranslations>
) {
  if (kind === "static") return t("slotStatic");
  if (kind === "animated") return t("slotAnimated");
  return t("slotKindUnset");
}

function getSlotStatus({
  filled,
  isPendingBackgroundRemoval,
  isProcessing,
  t,
}: {
  filled: boolean;
  isPendingBackgroundRemoval: boolean;
  isProcessing: boolean;
  t: ReturnType<typeof useTranslations>;
}): { label: string; tone: SlotStatusTone } {
  if (isProcessing) {
    return { label: t("slotProcessing"), tone: "processing" };
  }

  if (isPendingBackgroundRemoval) {
    return { label: t("slotNeedsDecision"), tone: "attention" };
  }

  if (!filled) {
    return { label: t("slotEmpty"), tone: "empty" };
  }

  return { label: t("slotReady"), tone: "ready" };
}

function getStatusToneColor(tone: SlotStatusTone, filled: boolean) {
  if (tone === "attention") return "var(--color-accent)";
  if (tone === "processing") return "var(--color-text-primary)";
  if (tone === "ready") return "var(--color-text-secondary)";
  return filled ? "var(--color-text-secondary)" : "var(--color-text-muted)";
}

function SlotContextGlyph({
  glyphSrc,
  slotId,
  glyphTheme,
}: {
  glyphSrc: string | undefined;
  slotId: SlotId;
  glyphTheme: SlotGlyphTheme;
}) {
  if (!glyphSrc) return null;

  return (
    <img
      data-testid={`slot-glyph-${slotId}-image`}
      src={getThemedGlyphSrc(glyphSrc, glyphTheme)}
      alt=""
      aria-hidden="true"
      width={16}
      height={16}
      style={{
        display: "block",
        width: "16px",
        height: "16px",
        objectFit: "contain",
      }}
    />
  );
}

function resolveSlotGlyphTheme(themeName: ThemeName | null): SlotGlyphTheme {
  if (themeName === "light" || themeName === "custom") {
    return "light";
  }

  return "dark";
}

function getThemedGlyphSrc(
  glyphSrc: string,
  glyphTheme: SlotGlyphTheme
): string {
  return glyphSrc.replace("/ui/slot-glyphs/", `/ui/slot-glyphs/${glyphTheme}/`);
}

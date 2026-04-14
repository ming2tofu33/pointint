"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { type CursorThemeProject, type SlotId } from "@/lib/cursorThemeProject";
import { STUDIO_INTERACTION_TRANSITION } from "@/components/StudioSurfaceCard";

interface SlotRailProps {
  project: CursorThemeProject;
  selectedSlotId: SlotId;
  onSelectSlot: (slotId: SlotId) => void;
}

type RoleSection = "primary" | "hidden";
type GlyphSpec =
  | { kind: "asset"; src: string }
  | { kind: "svg"; svg: string };

type RoleDefinition = {
  id: SlotId;
  section: RoleSection;
  labelKey: string;
  hintKey: string;
  glyph: GlyphSpec;
};

const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: "normalSelect",
    section: "primary",
    labelKey: "slotNormalSelect",
    hintKey: "slotNormalSelectHint",
    glyph: { kind: "asset", src: "/ui/slot-glyphs/normal.svg" },
  },
  {
    id: "textSelect",
    section: "primary",
    labelKey: "slotTextSelect",
    hintKey: "slotTextSelectHint",
    glyph: { kind: "asset", src: "/ui/slot-glyphs/text.svg" },
  },
  {
    id: "linkSelect",
    section: "primary",
    labelKey: "slotLinkSelect",
    hintKey: "slotLinkSelectHint",
    glyph: { kind: "asset", src: "/ui/slot-glyphs/link.svg" },
  },
  {
    id: "busy",
    section: "primary",
    labelKey: "slotBusy",
    hintKey: "slotBusyHint",
    glyph: {
      kind: "svg",
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-opacity="0.22" stroke-width="1.5" />
          <path d="M8 2.5A5.5 5.5 0 0 1 13.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      `,
    },
  },
  {
    id: "workingInBackground",
    section: "hidden",
    labelKey: "slotWorkingInBackground",
    hintKey: "slotWorkingInBackgroundHint",
    glyph: {
      kind: "svg",
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M7 5l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="11.5" cy="8" r="1.5" fill="currentColor" fill-opacity="0.22" />
        </svg>
      `,
    },
  },
  {
    id: "unavailable",
    section: "hidden",
    labelKey: "slotUnavailable",
    hintKey: "slotUnavailableHint",
    glyph: {
      kind: "svg",
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-opacity="0.22" stroke-width="1.5" />
          <path d="M5.2 10.8 10.8 5.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      `,
    },
  },
  {
    id: "move",
    section: "hidden",
    labelKey: "slotMove",
    hintKey: "slotMoveHint",
    glyph: {
      kind: "svg",
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
          <path d="M8 2.5v11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          <path d="M2.5 8h11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          <path d="M8 2.5 6.5 4M8 2.5 9.5 4M8 13.5 6.5 12M8 13.5 9.5 12M2.5 8 4 6.5M2.5 8 4 9.5M13.5 8 12 6.5M13.5 8 12 9.5"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,
    },
  },
  {
    id: "horizontalResize",
    section: "hidden",
    labelKey: "slotHorizontalResize",
    hintKey: "slotHorizontalResizeHint",
    glyph: {
      kind: "svg",
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M5.5 5.5 3 8l2.5 2.5M10.5 5.5 13 8l-2.5 2.5"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,
    },
  },
  {
    id: "verticalResize",
    section: "hidden",
    labelKey: "slotVerticalResize",
    hintKey: "slotVerticalResizeHint",
    glyph: {
      kind: "svg",
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M5.5 5.5 8 3l2.5 2.5M5.5 10.5 8 13l2.5-2.5"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,
    },
  },
  {
    id: "diagonalResize1",
    section: "hidden",
    labelKey: "slotDiagonalResize1",
    hintKey: "slotDiagonalResize1Hint",
    glyph: {
      kind: "svg",
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
          <path d="M4 12 12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M10 4h2v2M6 12H4v-2"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,
    },
  },
  {
    id: "diagonalResize2",
    section: "hidden",
    labelKey: "slotDiagonalResize2",
    hintKey: "slotDiagonalResize2Hint",
    glyph: {
      kind: "svg",
      svg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
          <path d="M4 4 12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M10 12h2v-2M6 4H4v2"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,
    },
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
  onSelectSlot,
}: SlotRailProps) {
  const t = useTranslations("studio");
  const [showAdditionalRoles, setShowAdditionalRoles] = useState(false);

  const hiddenConfiguredCount = HIDDEN_ROLE_DEFINITIONS.filter((definition) =>
    isSlotConfigured(project.slots[definition.id])
  ).length;

  const visibleDefinitions = ROLE_DEFINITIONS.filter(
    (definition) =>
      definition.section === "primary" || showAdditionalRoles
  );

  return (
    <nav
      data-testid="slot-rail"
      aria-label={t("slotRailTitle")}
      style={{
        width: "13rem",
        borderRight: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-secondary)",
        padding: "1rem 0.75rem",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--color-text-muted)",
          marginBottom: "0.25rem",
        }}
      >
        {t("slotRailTitle")}
      </div>

      {visibleDefinitions.map((definition, index) => {
        const slot = project.slots[definition.id];
        const filled = isSlotConfigured(slot);
        const canSelectSlot = definition.id !== selectedSlotId;
        const shouldInsertExpander =
          definition.section === "primary" &&
          index === PRIMARY_ROLE_DEFINITIONS.length - 1 &&
          HIDDEN_ROLE_DEFINITIONS.length > 0;

        return (
          <div key={definition.id} style={{ display: "grid", gap: "0.625rem" }}>
            <SlotRailCard
              slotId={definition.id}
              selected={definition.id === selectedSlotId}
              slot={slot}
              filled={filled}
              title={t(definition.labelKey)}
              hint={t(definition.hintKey)}
              kindLabel={getKindLabel(slot.kind, t)}
              statusLabel={filled ? t("slotFilled") : t("slotEmpty")}
              selectedLabel={t("slotSelected")}
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
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  padding: "0.625rem 0.75rem",
                  borderRadius: "0.5rem",
                  border: `1px solid ${
                    showAdditionalRoles ? "var(--color-accent)" : "var(--color-border)"
                  }`,
                  backgroundColor: showAdditionalRoles
                    ? "var(--color-accent-subtle)"
                    : "transparent",
                  color: "var(--color-text-primary)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: STUDIO_INTERACTION_TRANSITION,
                }}
              >
                <span
                  style={{
                    display: "grid",
                    gap: "0.125rem",
                    minWidth: 0,
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
                    fontSize: "0.6875rem",
                    color: "var(--color-text-muted)",
                    flexShrink: 0,
                  }}
                >
                  {showAdditionalRoles ? "−" : "+"}
                </span>
              </button>
            ) : null}
          </div>
        );
      })}
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
  selectedLabel: string;
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
  selectedLabel,
  onSelect,
}: SlotRailCardProps) {
  const glyph = ROLE_DEFINITIONS.find((definition) => definition.id === slotId)?.glyph;

  return (
    <button
      type="button"
      data-testid={`slot-${slotId}`}
      aria-pressed={selected}
      onClick={onSelect}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "flex-start",
        gap: "0.625rem",
        padding: "0.75rem",
        minHeight: "4.75rem",
        borderRadius: "0.5rem",
        border: `1px solid ${selected ? "var(--color-accent)" : "var(--color-border)"}`,
        backgroundColor: selected ? "var(--color-accent-subtle)" : "var(--color-bg-primary)",
        boxShadow: selected ? "0 0 0 1px var(--color-accent)" : "none",
        color: "var(--color-text-primary)",
        cursor: "pointer",
        textAlign: "left",
        transition: STUDIO_INTERACTION_TRANSITION,
      }}
    >
      <div
        data-testid={`slot-badge-stack-${slotId}`}
        style={{
          width: "2.125rem",
          flexShrink: 0,
          display: "grid",
          gap: "0.1875rem",
          alignContent: "start",
        }}
      >
        {selected ? (
          <span
            data-testid={`slot-selected-badge-${slotId}`}
            style={{
              fontSize: "0.5625rem",
              padding: "0.125rem 0.25rem",
              borderRadius: "0.1875rem",
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
              fontSize: "0.5625rem",
              padding: "0.125rem 0.25rem",
              borderRadius: "0.1875rem",
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
          {slot.asset.previewUrl ? (
            <img
              src={slot.asset.previewUrl}
              alt=""
              aria-hidden="true"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          ) : (
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                lineHeight: 1,
              }}
            >
              +
            </span>
          )}
        </div>
      </div>

      <div
        style={{
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
              width: "0.875rem",
              height: "0.875rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: selected
                ? "color-mix(in srgb, var(--color-accent) 78%, white 8%)"
                : "var(--color-text-muted)",
            }}
          >
            <SlotContextGlyph glyph={glyph} slotId={slotId} />
          </span>
          <span
            style={{
              fontSize: "0.625rem",
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
            color: filled ? "var(--color-text-secondary)" : "var(--color-text-muted)",
            lineHeight: 1.2,
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

function getKindLabel(kind: CursorThemeProject["slots"][SlotId]["kind"], t: ReturnType<typeof useTranslations>) {
  if (kind === "static") return t("slotStatic");
  if (kind === "animated") return t("slotAnimated");
  return t("slotKindUnset");
}

function SlotContextGlyph({
  glyph,
  slotId,
}: {
  glyph: GlyphSpec | undefined;
  slotId: SlotId;
}) {
  if (!glyph) return null;

  if (glyph.kind === "asset") {
    return (
      <img
        data-testid={`slot-glyph-${slotId}-image`}
        src={glyph.src}
        alt=""
        aria-hidden="true"
        width={14}
        height={14}
        style={{
          display: "block",
          width: "0.875rem",
          height: "0.875rem",
          objectFit: "contain",
        }}
      />
    );
  }

  return (
    <img
      data-testid={`slot-glyph-${slotId}-image`}
      src={svgDataUrl(glyph.svg)}
      alt=""
      aria-hidden="true"
      width={14}
      height={14}
      style={{
        display: "block",
        width: "0.875rem",
        height: "0.875rem",
        objectFit: "contain",
      }}
    />
  );
}

function svgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

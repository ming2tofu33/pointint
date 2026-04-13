"use client";

import { useTranslations } from "next-intl";

import { type CursorThemeProject, type SlotId } from "@/lib/cursorThemeProject";

interface SlotRailProps {
  project: CursorThemeProject;
  selectedSlotId: SlotId;
  onSelectSlot: (slotId: SlotId) => void;
}

const SLOT_ORDER: SlotId[] = ["normal", "text", "link", "button"];

export default function SlotRail({
  project,
  selectedSlotId,
  onSelectSlot,
}: SlotRailProps) {
  const t = useTranslations("studio");

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
        gap: "0.5rem",
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

      {SLOT_ORDER.map((slotId) => {
        const slot = project.slots[slotId];
        const selected = slotId === selectedSlotId;
        const filled = Boolean(slot.asset.previewUrl || slot.asset.originalUrl);
        const slotKindLabel =
          slot.kind === "static"
            ? t("slotStatic")
            : slot.kind === "animated"
              ? t("slotAnimated")
              : t("slotKindUnset");

        return (
          <button
            key={slotId}
            type="button"
            data-testid={`slot-${slotId}`}
            aria-pressed={selected}
            onClick={() => onSelectSlot(slotId)}
            style={{
              display: "flex",
              width: "100%",
              alignItems: "flex-start",
              gap: "0.625rem",
              padding: "0.5rem",
              minHeight: "4.75rem",
              borderRadius: "0.25rem",
              border: `1px solid ${selected ? "var(--color-accent)" : "var(--color-border)"}`,
              backgroundColor: selected
                ? "var(--color-accent-subtle)"
                : "var(--color-bg-primary)",
              color: "var(--color-text-primary)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div
              data-testid={`slot-badge-stack-${slotId}`}
              style={{
                width: "2rem",
                flexShrink: 0,
                display: "grid",
                gap: "0.125rem",
                alignContent: "start",
              }}
            >
              {selected && (
                <span
                  data-testid={`slot-selected-badge-${slotId}`}
                  style={{
                    fontSize: "0.5625rem",
                    padding: "0.125rem 0.25rem",
                    borderRadius: "0.25rem",
                    backgroundColor: "rgba(38, 132, 255, 0.16)",
                    color: "var(--color-accent)",
                    lineHeight: 1.2,
                    justifySelf: "start",
                  }}
                >
                  {t("slotSelected")}
                </span>
              )}

              <div
                data-testid={`slot-thumbnail-${slotId}`}
                style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "0",
                  border: `1px ${filled ? "solid" : "dashed"} ${selected ? "var(--color-accent)" : "var(--color-border)"}`,
                  backgroundColor: "rgba(255,255,255,0.04)",
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
                  {t(`slot${capitalizeSlotId(slotId)}`)}
                </span>
              </div>

              <div
                data-testid={`slot-status-${slotId}`}
                style={{
                  fontSize: "0.625rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.2,
                }}
              >
                {filled ? t("slotFilled") : t("slotEmpty")}
              </div>

              <div
                data-testid={`slot-kind-${slotId}`}
                style={{
                  fontSize: "0.625rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.2,
                }}
              >
                {slotKindLabel}
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

function capitalizeSlotId(slotId: SlotId) {
  return `${slotId.slice(0, 1).toUpperCase()}${slotId.slice(1)}`;
}

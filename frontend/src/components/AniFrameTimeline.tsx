"use client";

import type { CSSProperties } from "react";

import { STUDIO_INTERACTION_TRANSITION } from "@/components/StudioSurfaceCard";

export type AniFrameTimelineFrame = {
  id: string;
  url: string;
  durationMs: number;
  sourceWidth?: number;
  sourceHeight?: number;
  editOverride?: Record<string, unknown> | null;
};

type AniFrameTimelineProps = {
  frames: readonly AniFrameTimelineFrame[];
  selectedFrameId: string | null;
  onSelectFrame: (frameId: string) => void;
  onDeleteFrame: (frameId: string) => void;
  onReorderFrames: (frameIds: string[]) => void;
  style?: CSSProperties;
};

export default function AniFrameTimeline({
  frames,
  selectedFrameId,
  onSelectFrame,
  onDeleteFrame,
  onReorderFrames,
  style,
}: AniFrameTimelineProps) {
  const totalDurationMs = frames.reduce(
    (total, frame) => total + frame.durationMs,
    0
  );
  const canDelete = frames.length > 2;

  return (
    <section
      aria-label="ANI frame timeline"
      data-testid="ani-frame-timeline"
      style={{
        display: "grid",
        gap: "0.75rem",
        borderTop: "1px solid var(--color-border)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
        padding: "0.875rem 0 0",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          color: "var(--color-text-secondary)",
          fontSize: "0.75rem",
          lineHeight: 1.4,
        }}
      >
        <div
          style={{
            color: "var(--color-text-primary)",
            fontSize: "0.8125rem",
            fontWeight: 700,
            letterSpacing: "0.01em",
          }}
        >
          {formatFrameCount(frames.length)}
        </div>
        <div aria-label="Total duration">{formatDuration(totalDurationMs)}</div>
      </div>

      <ol
        style={{
          display: "flex",
          gap: "0.625rem",
          listStyle: "none",
          margin: 0,
          overflowX: "auto",
          padding: "0 0 0.125rem",
        }}
      >
        {frames.map((frame, index) => {
          const frameNumber = index + 1;
          const selected = frame.id === selectedFrameId;
          const edited = hasEditOverride(frame);

          return (
            <li
              key={frame.id}
              data-testid={`ani-frame-${frame.id}`}
              style={{
                display: "grid",
                flex: "0 0 5.25rem",
                gap: "0.45rem",
                minWidth: 0,
              }}
            >
              <button
                type="button"
                aria-label={formatFrameSelectLabel(
                  frameNumber,
                  frame.durationMs,
                  edited
                )}
                aria-pressed={selected}
                onClick={() => onSelectFrame(frame.id)}
                style={{
                  position: "relative",
                  display: "grid",
                  placeItems: "center",
                  aspectRatio: "1",
                  border: selected
                    ? "1px solid var(--color-accent)"
                    : "1px solid color-mix(in srgb, var(--color-border) 86%, white 5%)",
                  borderRadius: "0.85rem",
                  background: selected
                    ? "color-mix(in srgb, var(--color-accent-subtle) 72%, rgba(255,255,255,0.03) 28%)"
                    : "rgba(255,255,255,0.035)",
                  boxShadow: selected
                    ? "0 0 0 1px color-mix(in srgb, var(--color-accent) 42%, transparent), 0 12px 32px rgba(0,0,0,0.24)"
                    : "inset 0 1px 0 rgba(255,255,255,0.035)",
                  cursor: "pointer",
                  overflow: "hidden",
                  padding: "0.45rem",
                  transition: STUDIO_INTERACTION_TRANSITION,
                }}
              >
                <img
                  alt=""
                  src={frame.url}
                  style={{
                    display: "block",
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "0.4rem",
                    top: "0.35rem",
                    borderRadius: "999px",
                    backgroundColor: "rgba(8, 12, 20, 0.72)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    lineHeight: 1,
                    padding: "0.2rem 0.35rem",
                  }}
                >
                  {frameNumber}
                </span>
                {edited ? (
                  <span
                    style={{
                      position: "absolute",
                      right: "0.35rem",
                      top: "0.35rem",
                      borderRadius: "999px",
                      backgroundColor: "var(--color-accent)",
                      color: "#fff",
                      fontSize: "0.5625rem",
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      lineHeight: 1,
                      padding: "0.22rem 0.34rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Edited
                  </span>
                ) : null}
              </button>

              <div
                style={{
                  display: "grid",
                  gap: "0.35rem",
                }}
              >
                <div
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "0.6875rem",
                    lineHeight: 1.25,
                    textAlign: "center",
                  }}
                >
                  {formatDuration(frame.durationMs)}
                </div>

                <div
                  role="group"
                  aria-label={`Frame ${frameNumber} actions`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "0.25rem",
                  }}
                >
                  <TimelineIconButton
                    ariaLabel={`Move frame ${frameNumber} previous`}
                    disabled={index === 0}
                    onClick={() => {
                      onReorderFrames(moveFrame(frames, index, index - 1));
                    }}
                  >
                    Prev
                  </TimelineIconButton>
                  <TimelineIconButton
                    ariaLabel={`Delete frame ${frameNumber}`}
                    disabled={!canDelete}
                    onClick={() => onDeleteFrame(frame.id)}
                  >
                    Del
                  </TimelineIconButton>
                  <TimelineIconButton
                    ariaLabel={`Move frame ${frameNumber} next`}
                    disabled={index === frames.length - 1}
                    onClick={() => {
                      onReorderFrames(moveFrame(frames, index, index + 1));
                    }}
                  >
                    Next
                  </TimelineIconButton>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

type TimelineIconButtonProps = {
  ariaLabel: string;
  children: string;
  disabled: boolean;
  onClick: () => void;
};

function TimelineIconButton({
  ariaLabel,
  children,
  disabled,
  onClick,
}: TimelineIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      style={{
        minWidth: 0,
        border: "1px solid color-mix(in srgb, var(--color-border) 86%, white 4%)",
        borderRadius: "0.5rem",
        backgroundColor: disabled ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.04)",
        color: disabled ? "var(--color-text-muted)" : "var(--color-text-secondary)",
        cursor: disabled ? "default" : "pointer",
        fontSize: "0.625rem",
        fontWeight: 700,
        lineHeight: 1,
        opacity: disabled ? 0.42 : 1,
        overflow: "hidden",
        padding: "0.35rem 0.15rem",
        textOverflow: "ellipsis",
        transition: STUDIO_INTERACTION_TRANSITION,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function formatFrameCount(count: number) {
  return `${count} ${count === 1 ? "frame" : "frames"}`;
}

function formatDuration(durationMs: number) {
  return `${durationMs} ms`;
}

function formatFrameSelectLabel(
  frameNumber: number,
  durationMs: number,
  edited: boolean
) {
  return `Select frame ${frameNumber}, duration ${formatDuration(durationMs)}, ${
    edited ? "edited" : "not edited"
  }`;
}

function hasEditOverride(frame: AniFrameTimelineFrame) {
  const override = frame.editOverride;
  if (!override) return false;

  return Object.values(override).some((value) => value !== undefined);
}

function moveFrame(
  frames: readonly AniFrameTimelineFrame[],
  fromIndex: number,
  toIndex: number
) {
  if (toIndex < 0 || toIndex >= frames.length) {
    return frames.map((frame) => frame.id);
  }

  const next = [...frames];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((frame) => frame.id);
}

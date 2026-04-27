"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";

import { STUDIO_INTERACTION_TRANSITION } from "@/components/StudioSurfaceCard";
import {
  ANI_FRAME_MAX_DURATION_MS,
  ANI_FRAME_MIN_DURATION_MS,
} from "@/lib/aniFrameEdits";

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
  previewFrameId?: string | null;
  isPlaying?: boolean;
  onPlayToggle?: (playing: boolean) => void;
  onSelectFrame: (frameId: string) => void;
  onDeleteFrame: (frameId: string) => void;
  onReorderFrame: (frameId: string, insertionIndex: number) => void;
  onAddFrames: (files: File[], insertionIndex?: number) => void;
  onSetFrameDuration?: (frameId: string, durationMs: number) => void;
  onSetAllFrameDurations?: (durationMs: number) => void;
  style?: CSSProperties;
};

const ACCEPTED_FRAME_FILE_PATTERN = /\.(png|jpe?g|webp)$/i;
const ACCEPTED_FRAME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);
const ANI_SPEED_PRESETS = [
  { id: "slow", durationMs: 160, labelKey: "aniFrameSpeedSlow" },
  { id: "normal", durationMs: 100, labelKey: "aniFrameSpeedNormal" },
  { id: "fast", durationMs: 60, labelKey: "aniFrameSpeedFast" },
] as const;
const FRAME_TILE_SIZE = "5.75rem";

export default function AniFrameTimeline({
  frames,
  selectedFrameId,
  previewFrameId,
  isPlaying = false,
  onPlayToggle,
  onSelectFrame,
  onDeleteFrame,
  onReorderFrame,
  onAddFrames,
  onSetFrameDuration,
  onSetAllFrameDurations,
  style,
}: AniFrameTimelineProps) {
  const t = useTranslations("studio");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedFrameId, setDraggedFrameId] = useState<string | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(
    null
  );
  const [durationDraftByFrameId, setDurationDraftByFrameId] = useState<
    Record<string, string>
  >({});
  const totalDurationMs = frames.reduce(
    (total, frame) => total + frame.durationMs,
    0
  );
  const sharedDurationMs = getSharedFrameDurationMs(frames);
  const canDelete = frames.length > 2;

  useEffect(() => {
    const frameIds = new Set(frames.map((frame) => frame.id));
    setDurationDraftByFrameId((current) => {
      const nextEntries = Object.entries(current).filter(([frameId]) =>
        frameIds.has(frameId)
      );

      return nextEntries.length === Object.keys(current).length
        ? current
        : Object.fromEntries(nextEntries);
    });
  }, [frames]);

  const clearDragState = () => {
    setDraggedFrameId(null);
    setDropIndicatorIndex(null);
  };

  const handleAddInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = getAcceptedFrameFiles(event.target.files);
    if (files.length > 0) {
      onAddFrames(files, frames.length);
    }
    event.target.value = "";
  };

  const handleFrameDragStart = (
    event: DragEvent<HTMLElement>,
    frameId: string
  ) => {
    setDraggedFrameId(frameId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", frameId);
    setInvisibleDragImage(event);
  };

  const handleFrameDragOver = (
    event: DragEvent<HTMLElement>,
    frameIndex: number
  ) => {
    if (!draggedFrameId && !hasDroppedFiles(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = hasDroppedFiles(event) ? "copy" : "move";
    setDropIndicatorIndex(getFrameInsertionIndex(event, frameIndex));
  };

  const handleTimelineDragOver = (event: DragEvent<HTMLElement>) => {
    if (!draggedFrameId && !hasDroppedFiles(event)) {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = hasDroppedFiles(event) ? "copy" : "move";
    setDropIndicatorIndex(frames.length);
  };

  const handleDropAt = (
    event: DragEvent<HTMLElement>,
    fallbackInsertionIndex: number
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const insertionIndex = dropIndicatorIndex ?? fallbackInsertionIndex;
    const files = getAcceptedFrameFiles(event.dataTransfer.files);
    if (files.length > 0) {
      onAddFrames(files, insertionIndex);
      clearDragState();
      return;
    }

    const frameId =
      draggedFrameId || event.dataTransfer.getData("text/plain") || null;
    if (frameId) {
      onReorderFrame(frameId, insertionIndex);
    }

    clearDragState();
  };

  const updateDurationDraft = (frameId: string, value: string) => {
    setDurationDraftByFrameId((current) => ({
      ...current,
      [frameId]: value,
    }));
  };

  const resetDurationDraft = (frameId: string) => {
    setDurationDraftByFrameId((current) => {
      if (!(frameId in current)) {
        return current;
      }

      const { [frameId]: _removed, ...next } = current;
      return next;
    });
  };

  const commitDurationDraft = (frame: AniFrameTimelineFrame) => {
    const draft = durationDraftByFrameId[frame.id] ?? String(frame.durationMs);
    const nextDurationMs = Number(draft);
    resetDurationDraft(frame.id);

    if (!Number.isFinite(nextDurationMs) || draft.trim() === "") {
      return;
    }

    onSetFrameDuration?.(frame.id, nextDurationMs);
  };

  const handleDurationKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    frame: AniFrameTimelineFrame
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitDurationDraft(frame);
      event.currentTarget.blur();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      resetDurationDraft(frame.id);
      event.currentTarget.blur();
    }
  };

  return (
    <section
      aria-label={t("aniFrameTimeline")}
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
            display: "grid",
            gap: "0.2rem",
          }}
        >
          <span
            style={{
              color: "var(--color-text-primary)",
              fontSize: "0.8125rem",
              fontWeight: 700,
              letterSpacing: "0.01em",
            }}
          >
            {frames.length === 1
              ? t("aniFrameCountSingular", { count: frames.length })
              : t("aniFrameCountPlural", { count: frames.length })}
          </span>
          <span>{t("aniFrameTimelineHint")}</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          {onPlayToggle ? (
            <button
              type="button"
              aria-label={
                isPlaying ? t("aniFramePauseLabel") : t("aniFramePlayLabel")
              }
              onClick={() => onPlayToggle(!isPlaying)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                minHeight: "2rem",
                border:
                  "1px solid color-mix(in srgb, var(--color-accent) 44%, var(--color-border))",
                borderRadius: "999px",
                backgroundColor: isPlaying
                  ? "color-mix(in srgb, var(--color-accent) 22%, rgba(255,255,255,0.04))"
                  : "rgba(255,255,255,0.045)",
                color: isPlaying
                  ? "var(--color-text-primary)"
                  : "var(--color-text-secondary)",
                cursor: "pointer",
                fontSize: "0.72rem",
                fontWeight: 800,
                lineHeight: 1,
                padding: "0 0.75rem",
                transition: STUDIO_INTERACTION_TRANSITION,
              }}
            >
              <PlaybackIcon playing={isPlaying} />
              {isPlaying ? t("aniFramePause") : t("aniFramePlay")}
            </button>
          ) : null}

          {onSetAllFrameDurations ? (
            <div
              role="group"
              aria-label={t("aniFrameSpeed")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.18rem",
                border:
                  "1px solid color-mix(in srgb, var(--color-border) 78%, white 5%)",
                borderRadius: "999px",
                backgroundColor: "rgba(255,255,255,0.035)",
                padding: "0.16rem",
              }}
            >
              {ANI_SPEED_PRESETS.map((preset) => {
                const active = sharedDurationMs === preset.durationMs;
                const label = t(preset.labelKey);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-label={t("aniFrameSpeedLabel", {
                      label,
                      duration: preset.durationMs,
                    })}
                    aria-pressed={active}
                    onClick={() => onSetAllFrameDurations(preset.durationMs)}
                    style={{
                      minHeight: "1.65rem",
                      border: "0",
                      borderRadius: "999px",
                      backgroundColor: active
                        ? "color-mix(in srgb, var(--color-accent) 18%, rgba(255,255,255,0.08))"
                        : "transparent",
                      color: active
                        ? "var(--color-text-primary)"
                        : "var(--color-text-muted)",
                      cursor: "pointer",
                      fontSize: "0.67rem",
                      fontWeight: 800,
                      lineHeight: 1,
                      padding: "0 0.55rem",
                      transition: STUDIO_INTERACTION_TRANSITION,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div aria-label={t("aniFrameTotalDuration")}>
            {formatDuration(totalDurationMs)}
          </div>
        </div>
      </div>

      <ol
        className="ani-frame-timeline-strip"
        onDragOver={handleTimelineDragOver}
        onDrop={(event) => handleDropAt(event, frames.length)}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node)) {
            return;
          }
          setDropIndicatorIndex(null);
        }}
        style={{
          display: "flex",
          gap: "0.55rem",
          listStyle: "none",
          margin: 0,
          overflowX: "auto",
          padding: "0.18rem 0.1rem 0.45rem",
          scrollbarColor:
            "color-mix(in srgb, var(--color-accent) 44%, rgba(255,255,255,0.14)) transparent",
          scrollbarWidth: "thin",
        }}
      >
        {frames.map((frame, index) => {
          const frameNumber = index + 1;
          const selected = frame.id === selectedFrameId;
          const previewed = frame.id === previewFrameId;
          const edited = hasEditOverride(frame);

          return (
            <Fragment key={frame.id}>
              {dropIndicatorIndex === index ? <TimelineDropIndicator /> : null}
              <li
                data-testid={`ani-frame-${frame.id}`}
                draggable
                onDragStart={(event) => handleFrameDragStart(event, frame.id)}
                onDragOver={(event) => handleFrameDragOver(event, index)}
                onDrop={(event) =>
                  handleDropAt(
                    event,
                    getFrameInsertionIndex(event, index)
                  )
                }
                onDragEnd={clearDragState}
                style={{
                  position: "relative",
                  display: "grid",
                  flex: `0 0 ${FRAME_TILE_SIZE}`,
                  gap: "0.45rem",
                  minWidth: 0,
                  opacity: draggedFrameId === frame.id ? 0.62 : 1,
                  transition: STUDIO_INTERACTION_TRANSITION,
                }}
              >
                <button
                  type="button"
                  aria-label={t("aniFrameSelectLabel", {
                    frame: frameNumber,
                    duration: formatDuration(frame.durationMs),
                    state: edited
                      ? t("aniFrameEditedState")
                      : t("aniFrameNotEditedState"),
                  })}
                  aria-pressed={selected}
                  onClick={() => onSelectFrame(frame.id)}
                  style={{
                    position: "relative",
                    boxSizing: "border-box",
                    display: "grid",
                    placeItems: "center",
                    height: FRAME_TILE_SIZE,
                    width: "100%",
                    border: selected
                      ? "1px solid var(--color-accent)"
                      : previewed
                        ? "1px solid color-mix(in srgb, var(--color-accent) 62%, var(--color-border))"
                      : "1px solid color-mix(in srgb, var(--color-border) 86%, white 5%)",
                    borderRadius: "0.9rem",
                    background: selected
                      ? "color-mix(in srgb, var(--color-accent-subtle) 72%, rgba(255,255,255,0.03) 28%)"
                      : previewed
                        ? "color-mix(in srgb, var(--color-accent-subtle) 38%, rgba(255,255,255,0.035))"
                      : "rgba(255,255,255,0.035)",
                    boxShadow: selected
                      ? "0 0 0 1px color-mix(in srgb, var(--color-accent) 42%, transparent), 0 12px 32px rgba(0,0,0,0.24)"
                      : previewed
                        ? "0 0 0 1px color-mix(in srgb, var(--color-accent) 28%, transparent), inset 0 0 0 1px rgba(255,255,255,0.04)"
                      : "inset 0 1px 0 rgba(255,255,255,0.035)",
                    cursor: "grab",
                    overflow: "hidden",
                    padding: "0.45rem",
                    transition: STUDIO_INTERACTION_TRANSITION,
                  }}
                >
                  <img
                    alt=""
                    draggable={false}
                    src={frame.url}
                    style={{
                      display: "block",
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                      pointerEvents: "none",
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
                        bottom: "0.35rem",
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
                      {t("aniFrameEdited")}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  aria-label={t("aniFrameDeleteLabel", {
                    frame: frameNumber,
                  })}
                  disabled={!canDelete}
                  draggable={false}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteFrame(frame.id);
                  }}
                  style={{
                    position: "absolute",
                    alignSelf: "start",
                    justifySelf: "end",
                    display: "grid",
                    placeItems: "center",
                    minHeight: "1.42rem",
                    minWidth: "1.42rem",
                    transform: "translate(-0.28rem, 0.28rem)",
                    border: "1px solid color-mix(in srgb, var(--color-error) 44%, var(--color-border))",
                    borderRadius: "999px",
                    backgroundColor: canDelete
                      ? "color-mix(in srgb, var(--color-error) 12%, rgba(8,12,20,0.76))"
                      : "rgba(255,255,255,0.035)",
                    color: canDelete
                      ? "var(--color-error)"
                      : "var(--color-text-muted)",
                    cursor: canDelete ? "pointer" : "default",
                    opacity: canDelete ? 1 : 0.38,
                    padding: 0,
                    transition: STUDIO_INTERACTION_TRANSITION,
                  }}
                >
                  <CloseIcon />
                </button>
                {selected && onSetFrameDuration ? (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.25rem",
                      color: "var(--color-text-muted)",
                      fontSize: "0.6875rem",
                      lineHeight: 1.25,
                    }}
                  >
                    <input
                      type="number"
                      aria-label={t("aniFrameDurationLabel", {
                        frame: frameNumber,
                      })}
                      min={ANI_FRAME_MIN_DURATION_MS}
                      max={ANI_FRAME_MAX_DURATION_MS}
                      step={10}
                      draggable={false}
                      value={
                        durationDraftByFrameId[frame.id] ??
                        String(frame.durationMs)
                      }
                      onChange={(event) =>
                        updateDurationDraft(frame.id, event.target.value)
                      }
                      onBlur={() => commitDurationDraft(frame)}
                      onKeyDown={(event) => handleDurationKeyDown(event, frame)}
                      onClick={(event) => event.stopPropagation()}
                      onPointerDown={(event) => event.stopPropagation()}
                      style={{
                        width: "3.6rem",
                        border:
                          "1px solid color-mix(in srgb, var(--color-accent) 36%, var(--color-border))",
                        borderRadius: "0.48rem",
                        backgroundColor: "rgba(255,255,255,0.045)",
                        color: "var(--color-text-primary)",
                        fontSize: "0.6875rem",
                        fontWeight: 800,
                        lineHeight: 1,
                        padding: "0.25rem 0.32rem",
                        textAlign: "center",
                        outline: "none",
                      }}
                    />
                    <span aria-hidden="true">ms</span>
                  </label>
                ) : (
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
                )}
              </li>
            </Fragment>
          );
        })}
        {dropIndicatorIndex === frames.length ? (
          <TimelineDropIndicator />
        ) : null}
        <li
          style={{
            display: "grid",
            flex: `0 0 ${FRAME_TILE_SIZE}`,
            gap: "0.45rem",
            minWidth: 0,
          }}
        >
          <input
            ref={fileInputRef}
            data-testid="ani-frame-add-input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={handleAddInputChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            aria-label={t("aniFrameAddLabel")}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              if (!hasDroppedFiles(event)) {
                return;
              }
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
              setDropIndicatorIndex(frames.length);
            }}
            onDrop={(event) => handleDropAt(event, frames.length)}
            style={{
              boxSizing: "border-box",
              display: "grid",
              placeItems: "center",
              height: FRAME_TILE_SIZE,
              width: "100%",
              border:
                "1px dashed color-mix(in srgb, var(--color-accent) 56%, var(--color-border))",
              borderRadius: "0.9rem",
              background:
                "color-mix(in srgb, var(--color-accent-subtle) 42%, rgba(255,255,255,0.025))",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              fontSize: "0.6875rem",
              fontWeight: 800,
              lineHeight: 1.2,
              padding: "0.45rem",
              transition: STUDIO_INTERACTION_TRANSITION,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "grid",
                placeItems: "center",
                minHeight: "2rem",
                minWidth: "2rem",
                borderRadius: "999px",
                backgroundColor:
                  "color-mix(in srgb, var(--color-accent) 20%, transparent)",
                color: "var(--color-accent)",
                fontSize: "1.45rem",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              +
            </span>
          </button>
          <div
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.6875rem",
              fontWeight: 700,
              lineHeight: 1.25,
              textAlign: "center",
            }}
          >
            {t("aniFrameAdd")}
          </div>
        </li>
      </ol>
      <style>{`
        .ani-frame-timeline-strip {
          scrollbar-gutter: stable;
        }

        .ani-frame-timeline-strip::-webkit-scrollbar {
          height: 0.38rem;
        }

        .ani-frame-timeline-strip::-webkit-scrollbar-track {
          background: transparent;
        }

        .ani-frame-timeline-strip::-webkit-scrollbar-thumb {
          background:
            linear-gradient(
              90deg,
              color-mix(in srgb, var(--color-accent) 42%, rgba(255,255,255,0.12)),
              color-mix(in srgb, var(--color-accent) 24%, rgba(255,255,255,0.1))
            );
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .ani-frame-timeline-strip::-webkit-scrollbar-thumb:hover {
          background:
            linear-gradient(
              90deg,
              color-mix(in srgb, var(--color-accent) 58%, rgba(255,255,255,0.16)),
              color-mix(in srgb, var(--color-accent) 34%, rgba(255,255,255,0.12))
            );
        }

        .ani-frame-timeline-strip::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
    </section>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 12 12"
      style={{
        display: "block",
        height: "0.58rem",
        width: "0.58rem",
      }}
    >
      <path
        d="M3 3l6 6M9 3L3 9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PlaybackIcon({ playing }: { playing: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 12 12"
      style={{
        display: "block",
        height: "0.72rem",
        width: "0.72rem",
      }}
    >
      {playing ? (
        <>
          <path d="M3.2 2.2v7.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M8.8 2.2v7.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </>
      ) : (
        <path d="M4 2.6 9 6l-5 3.4V2.6Z" fill="currentColor" />
      )}
    </svg>
  );
}

function TimelineDropIndicator() {
  return (
    <li
      aria-hidden="true"
      data-testid="ani-frame-drop-indicator"
      style={{
        alignSelf: "stretch",
        flex: "0 0 0.2rem",
        minHeight: "5.75rem",
        borderRadius: "999px",
        background:
          "linear-gradient(180deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 18%, transparent))",
        boxShadow:
          "0 0 0 1px color-mix(in srgb, var(--color-accent) 32%, transparent), 0 0 18px color-mix(in srgb, var(--color-accent) 34%, transparent)",
      }}
    />
  );
}

function setInvisibleDragImage(event: DragEvent<HTMLElement>) {
  if (
    typeof document === "undefined" ||
    typeof event.dataTransfer.setDragImage !== "function"
  ) {
    return;
  }

  let dragImage = document.querySelector<HTMLElement>(
    "[data-ani-frame-drag-image]"
  );
  if (!dragImage) {
    dragImage = document.createElement("div");
    dragImage.dataset.aniFrameDragImage = "true";
    dragImage.style.position = "fixed";
    dragImage.style.left = "-1000px";
    dragImage.style.top = "-1000px";
    dragImage.style.height = "1px";
    dragImage.style.width = "1px";
    dragImage.style.opacity = "0";
    dragImage.style.pointerEvents = "none";
    document.body.appendChild(dragImage);
  }

  event.dataTransfer.setDragImage(dragImage, 0, 0);
}

function getFrameInsertionIndex(
  event: DragEvent<HTMLElement>,
  frameIndex: number
) {
  const bounds = event.currentTarget.getBoundingClientRect();
  const insertAfter = event.clientX > bounds.left + bounds.width / 2;
  return insertAfter ? frameIndex + 1 : frameIndex;
}

function hasDroppedFiles(event: DragEvent<HTMLElement>) {
  return Array.from(event.dataTransfer.types).includes("Files");
}

function getAcceptedFrameFiles(files: FileList | null) {
  if (!files) {
    return [];
  }

  return Array.from(files).filter((file) => {
    if (ACCEPTED_FRAME_TYPES.has(file.type)) {
      return true;
    }

    return ACCEPTED_FRAME_FILE_PATTERN.test(file.name);
  });
}

function formatDuration(durationMs: number) {
  return `${durationMs} ms`;
}

function getSharedFrameDurationMs(frames: readonly AniFrameTimelineFrame[]) {
  const firstFrame = frames[0];
  if (!firstFrame) {
    return null;
  }

  return frames.every((frame) => frame.durationMs === firstFrame.durationMs)
    ? firstFrame.durationMs
    : null;
}

function hasEditOverride(frame: AniFrameTimelineFrame) {
  const override = frame.editOverride;
  if (!override) return false;

  return Object.values(override).some((value) => value !== undefined);
}

"use client";

import { useId, useRef, useState, type DragEvent, type ReactNode } from "react";

import {
  STUDIO_INTERACTION_TRANSITION,
  default as StudioSurfaceCard,
} from "@/components/StudioSurfaceCard";
import InteractiveDotBackground from "@/components/InteractiveDotBackground";
import {
  DEFAULT_VIDEO_TO_ANI_DURATION_MS,
  DEFAULT_VIDEO_TO_ANI_FPS,
  DEFAULT_VIDEO_TO_ANI_MAX_FRAMES,
} from "@/lib/videoFrameSequence";

export interface VideoToAniQuickOptions {
  startMs: number;
  durationMs: number;
  fps: number;
}

interface VideoToAniOptionsCopy {
  title: string;
  disclosureLabel?: string;
  startLabel: string;
  durationLabel: string;
  fpsLabel: string;
  frameEstimate: (count: number) => string;
}

const DEFAULT_VIDEO_TO_ANI_QUICK_OPTIONS: VideoToAniQuickOptions = {
  startMs: 0,
  durationMs: DEFAULT_VIDEO_TO_ANI_DURATION_MS,
  fps: DEFAULT_VIDEO_TO_ANI_FPS,
};

const VIDEO_DURATION_OPTIONS_MS = [1000, 2000, 3000] as const;
const VIDEO_FPS_OPTIONS = [6, 10, 15] as const;

interface StudioQuickStartProps {
  title: string;
  description: string;
  staticUploadLabel: string;
  staticUploadDescription: string;
  animatedUploadLabel?: string;
  animatedUploadDescription?: string;
  imageSequenceUploadLabel?: string;
  imageSequenceUploadDescription?: string;
  videoUploadLabel?: string;
  videoUploadDescription?: string;
  videoOptionsCopy?: VideoToAniOptionsCopy;
  primarySource?: QuickStartPrimarySource;
  onStaticFile: (file: File) => void;
  onAnimatedFile?: (file: File) => void;
  onImageSequenceFiles?: (files: File[]) => void;
  onVideoFile?: (file: File, options: VideoToAniQuickOptions) => void;
  busy?: boolean;
  busyLabel?: string;
  busyDescription?: string;
}

type QuickStartPrimarySource = "static" | "animated" | "image-sequence" | "video";

export default function StudioQuickStart({
  title,
  description,
  staticUploadLabel,
  staticUploadDescription,
  animatedUploadLabel,
  animatedUploadDescription,
  imageSequenceUploadLabel,
  imageSequenceUploadDescription,
  videoUploadLabel,
  videoUploadDescription,
  videoOptionsCopy,
  primarySource = "static",
  onStaticFile,
  onAnimatedFile,
  onImageSequenceFiles,
  onVideoFile,
  busy = false,
  busyLabel,
  busyDescription,
}: StudioQuickStartProps) {
  const [isRegionDragActive, setIsRegionDragActive] = useState(false);
  const [videoOptions, setVideoOptions] = useState<VideoToAniQuickOptions>(
    DEFAULT_VIDEO_TO_ANI_QUICK_OPTIONS
  );
  const primaryUpload = getPrimaryUploadConfig({
    primarySource,
    staticUploadLabel,
    staticUploadDescription,
    animatedUploadLabel,
    animatedUploadDescription,
    imageSequenceUploadLabel,
    imageSequenceUploadDescription,
    videoUploadLabel,
    videoUploadDescription,
    onStaticFile,
    onAnimatedFile,
    onImageSequenceFiles,
    onVideoFile,
    videoOptions,
  });
  const videoOptionsPanel =
    primarySource === "video" && videoOptionsCopy ? (
      <VideoToAniOptionsPanel
        copy={videoOptionsCopy}
        value={videoOptions}
        onChange={setVideoOptions}
        disabled={busy}
      />
    ) : undefined;

  const handleFiles = (files: FileList | File[]) => {
    if (busy) {
      return;
    }
    primaryUpload.handleFiles(files);
  };

  return (
    <section
      data-testid="studio-quick-start"
      data-drag-active={isRegionDragActive}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsRegionDragActive(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsRegionDragActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsRegionDragActive(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsRegionDragActive(false);
        handleFiles(event.dataTransfer.files);
      }}
      style={{
        width: "100%",
        flex: 1,
        minHeight: 0,
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
        padding: "1rem",
        background: "var(--color-bg-primary)",
      }}
    >
      <div
      style={{
        width: "100%",
        minHeight: 0,
        display: "grid",
        gridTemplateRows:
          primarySource === "static" && animatedUploadLabel
            ? "minmax(0, 1fr) auto"
            : "minmax(0, 1fr)",
        gap: "0.85rem",
      }}
    >
        <QuickUploadSurface
          dataTestId={primaryUpload.dataTestId}
          title={title}
          summary={description}
          label={busy && busyLabel ? busyLabel : primaryUpload.label}
          description={
            busy && busyDescription ? busyDescription : primaryUpload.description
          }
          accept={primaryUpload.accept}
          multiple={primaryUpload.multiple}
          tone="primary"
          disabled={busy}
          parentDragActive={isRegionDragActive}
          afterUpload={videoOptionsPanel}
          onNestedDropHandled={() => setIsRegionDragActive(false)}
          onFiles={handleFiles}
        />

        {primarySource === "static" &&
        animatedUploadLabel &&
        animatedUploadDescription &&
        onAnimatedFile ? (
          <QuickUploadSurface
            dataTestId="studio-quick-start-animated"
            label={animatedUploadLabel}
            description={animatedUploadDescription}
            accept=".gif"
            tone="secondary"
            disabled={busy}
            parentDragActive={isRegionDragActive}
            onNestedDropHandled={() => setIsRegionDragActive(false)}
            onFiles={(files) => {
              if (busy) {
                return;
              }
              const file = Array.from(files).find(isGifFile);
              if (file) {
                onAnimatedFile(file);
              }
            }}
          />
        ) : null}
      </div>
    </section>
  );
}

function QuickUploadSurface({
  dataTestId,
  title,
  summary,
  label,
  description,
  accept,
  multiple = false,
  tone,
  disabled = false,
  parentDragActive = false,
  afterUpload,
  onNestedDropHandled,
  onFiles,
}: {
  dataTestId: string;
  title?: string;
  summary?: string;
  label: string;
  description: string;
  accept: string;
  multiple?: boolean;
  tone: "primary" | "secondary";
  disabled?: boolean;
  parentDragActive?: boolean;
  afterUpload?: ReactNode;
  onNestedDropHandled?: () => void;
  onFiles: (files: FileList | File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const isPrimary = tone === "primary";
  const isSurfaceDragActive = isDragActive || parentDragActive;
  const handleDragEnter = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };
  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragActive(false);
    }
  };
  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    onNestedDropHandled?.();
    if (disabled) {
      return;
    }
    onFiles(event.dataTransfer.files);
  };

  return (
    <StudioSurfaceCard
      data-testid={dataTestId}
      data-drop-target="true"
      data-drag-active={isSurfaceDragActive}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        minHeight: 0,
        padding: isPrimary ? "1.35rem" : "0.6rem",
        borderRadius: "0",
        border: isSurfaceDragActive
          ? "1px solid color-mix(in srgb, var(--color-accent) 76%, white 8%)"
          : "1px solid color-mix(in srgb, var(--color-border) 88%, white 4%)",
        backgroundColor: isSurfaceDragActive
          ? "color-mix(in srgb, var(--color-accent) 7%, var(--color-bg-secondary))"
          : "var(--color-bg-secondary)",
        position: "relative",
        overflow: "hidden",
        display: "grid",
        alignItems: "center",
        justifyItems: "center",
        boxShadow: isSurfaceDragActive
          ? "0 0 0 3px color-mix(in srgb, var(--color-accent) 14%, transparent)"
          : "none",
        transition: STUDIO_INTERACTION_TRANSITION,
      }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
        e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
      }}
    >
      {isPrimary && <InteractiveDotBackground baseColor="color-mix(in srgb, var(--color-text-primary) 13%, transparent)" />}
      <div
        data-testid={`${dataTestId}-content`}
        style={{
          width: "100%",
          display: "grid",
          justifyItems: "center",
          gap: isPrimary ? "1.4rem" : "0.35rem",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {title || summary ? (
          <span
            data-testid={`${dataTestId}-copy`}
            style={{
              display: "grid",
              gap: "0.45rem",
              justifyItems: "center",
              maxWidth: "34rem",
              backgroundColor:
                "color-mix(in srgb, var(--color-bg-secondary) 86%, transparent)",
              padding: "0.4rem 0.55rem",
            }}
          >
            {title ? (
              <h1
                style={{
                  margin: 0,
                  color: "var(--color-text-primary)",
                  fontSize: "1.18rem",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "0",
                }}
              >
                {title}
              </h1>
            ) : null}
            {summary ? (
              <p
                style={{
                  margin: 0,
                  color: "var(--color-text-secondary)",
                  fontSize: "0.78rem",
                  lineHeight: 1.45,
                  whiteSpace: "pre-line",
                }}
              >
                {summary}
              </p>
            ) : null}
          </span>
        ) : null}

        <button
          data-testid={`${dataTestId}-click-target`}
          type="button"
          aria-label={label}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              inputRef.current?.click();
            }
          }}
          style={{
            width: isPrimary ? "min(100%, 17rem)" : "min(100%, 15rem)",
            minHeight: isPrimary ? "6rem" : "3.5rem",
            border: "1px solid var(--color-border)",
            borderRadius: "0",
            backgroundColor: isSurfaceDragActive
              ? "color-mix(in srgb, var(--color-accent) 12%, var(--color-bg-primary))"
              : "var(--color-bg-primary)",
            color: "var(--color-text-primary)",
            cursor: disabled ? "not-allowed" : "pointer",
            display: "grid",
            placeItems: "center",
            padding: isPrimary ? "0.85rem" : "0.65rem",
            textAlign: "center",
            transition: STUDIO_INTERACTION_TRANSITION,
          }}
        >
          <span
            style={{
              display: "grid",
              gap: isPrimary ? "0.42rem" : "0.25rem",
              justifyItems: "center",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                margin: "0 auto",
                width: isPrimary ? "2rem" : "1.5rem",
                height: isPrimary ? "2rem" : "1.5rem",
                borderRadius: "0.25rem",
                display: "grid",
                placeItems: "center",
                backgroundColor: "var(--color-accent-subtle)",
                color: "var(--color-accent)",
                fontSize: isPrimary ? "1.15rem" : "0.9rem",
                lineHeight: 1,
              }}
            >
              +
            </span>
            <span style={{ fontSize: isPrimary ? "1rem" : "0.8rem", fontWeight: 760 }}>
              {label}
            </span>
            <span
              style={{
                maxWidth: "30rem",
                color: "var(--color-text-secondary)",
                fontSize: isPrimary ? "0.82rem" : "0.72rem",
                lineHeight: 1.45,
              }}
            >
              {description}
            </span>
          </span>
        </button>

        {afterUpload}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => {
          if (!disabled && event.target.files) {
            onFiles(event.target.files);
          }
          event.currentTarget.value = "";
        }}
        style={{ display: "none" }}
      />
    </StudioSurfaceCard>
  );
}

function VideoToAniOptionsPanel({
  copy,
  value,
  onChange,
  disabled = false,
}: {
  copy: VideoToAniOptionsCopy;
  value: VideoToAniQuickOptions;
  onChange: (value: VideoToAniQuickOptions) => void;
  disabled?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const frameEstimate = getVideoToAniFrameEstimate(value);
  const startUnitId = useId();
  const collapsedSummary = `${value.durationMs / 1000}s / ${value.fps} fps / ${copy.frameEstimate(
    frameEstimate
  )}`;

  return (
    <div
      style={{
        width: "min(100%, 17rem)",
        display: "grid",
        gap: isExpanded ? "0.65rem" : 0,
        padding: isExpanded ? "0.75rem" : 0,
        border: isExpanded ? "1px solid var(--color-border)" : "0",
        backgroundColor: isExpanded
          ? "color-mix(in srgb, var(--color-bg-primary) 86%, transparent)"
          : "transparent",
        textAlign: "left",
        transition: STUDIO_INTERACTION_TRANSITION,
      }}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          setIsExpanded((current) => !current);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.65rem",
          width: "100%",
          minHeight: "2.15rem",
          border: isExpanded ? "0" : "1px solid var(--color-border)",
          backgroundColor: isExpanded
            ? "transparent"
            : "var(--color-bg-primary)",
          color: "var(--color-text-primary)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.58 : 1,
          padding: isExpanded ? "0 0 0.05rem" : "0 0.7rem",
          textAlign: "left",
          transition: STUDIO_INTERACTION_TRANSITION,
        }}
      >
        <span
          style={{
            display: "grid",
            gap: "0.08rem",
            minWidth: 0,
          }}
        >
          <strong
            style={{
              color: "var(--color-text-primary)",
              fontSize: "0.76rem",
              fontWeight: 780,
            }}
          >
            {copy.disclosureLabel ?? copy.title}
          </strong>
          <span
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.68rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {collapsedSummary}
          </span>
        </span>
        <span
          aria-hidden="true"
          style={{
            color: "var(--color-text-primary)",
            fontSize: "0.82rem",
            fontWeight: 780,
          }}
        >
          {isExpanded ? "^" : "v"}
        </span>
      </button>

      {isExpanded ? (
        <>
          <label
            style={{
              display: "grid",
              gap: "0.32rem",
              color: "var(--color-text-secondary)",
              fontSize: "0.72rem",
              fontWeight: 650,
            }}
          >
            {copy.startLabel}
            <span
              style={{
                position: "relative",
                display: "block",
              }}
            >
              <input
                aria-label={copy.startLabel}
                aria-describedby={startUnitId}
                type="number"
                min={0}
                step={0.1}
                disabled={disabled}
                value={value.startMs / 1000}
                onChange={(event) => {
                  const seconds = Number(event.currentTarget.value);
                  onChange({
                    ...value,
                    startMs: Number.isFinite(seconds)
                      ? Math.round(Math.max(0, seconds) * 1000)
                      : 0,
                  });
                }}
                style={{
                  width: "100%",
                  height: "2.1rem",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-bg-secondary)",
                  color: "var(--color-text-primary)",
                  padding: "0 1.8rem 0 0.65rem",
                }}
              />
              <span
                id={startUnitId}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "0.65rem",
                  transform: "translateY(-50%)",
                  color: "var(--color-text-secondary)",
                  fontSize: "0.72rem",
                  fontWeight: 760,
                  pointerEvents: "none",
                }}
              >
                s
              </span>
            </span>
          </label>

          <OptionButtonGroup label={copy.durationLabel}>
            {VIDEO_DURATION_OPTIONS_MS.map((durationMs) => (
              <OptionButton
                key={durationMs}
                pressed={value.durationMs === durationMs}
                disabled={disabled}
                onClick={() => onChange({ ...value, durationMs })}
              >
                {durationMs / 1000}s
              </OptionButton>
            ))}
          </OptionButtonGroup>

          <OptionButtonGroup label={copy.fpsLabel}>
            {VIDEO_FPS_OPTIONS.map((fps) => (
              <OptionButton
                key={fps}
                pressed={value.fps === fps}
                disabled={disabled}
                onClick={() => onChange({ ...value, fps })}
              >
                {fps} fps
              </OptionButton>
            ))}
          </OptionButtonGroup>
        </>
      ) : null}
    </div>
  );
}

function OptionButtonGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      style={{
        display: "grid",
        gap: "0.32rem",
      }}
    >
      <span
        style={{
          color: "var(--color-text-secondary)",
          fontSize: "0.72rem",
          fontWeight: 650,
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "0.35rem",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function OptionButton({
  pressed,
  disabled = false,
  onClick,
  children,
}: {
  pressed: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      style={{
        minHeight: "2rem",
        border: pressed
          ? "1px solid var(--color-accent)"
          : "1px solid var(--color-border)",
        backgroundColor: pressed
          ? "color-mix(in srgb, var(--color-accent) 18%, var(--color-bg-secondary))"
          : "var(--color-bg-secondary)",
        color: pressed ? "var(--color-accent)" : "var(--color-text-secondary)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.58 : 1,
        fontSize: "0.75rem",
        fontWeight: 760,
      }}
    >
      {children}
    </button>
  );
}

function getVideoToAniFrameEstimate(value: VideoToAniQuickOptions) {
  const frameDurationMs = Math.round(1000 / value.fps);
  return Math.min(
    DEFAULT_VIDEO_TO_ANI_MAX_FRAMES,
    Math.floor(value.durationMs / frameDurationMs)
  );
}

const STATIC_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function getPrimaryUploadConfig({
  primarySource,
  staticUploadLabel,
  staticUploadDescription,
  animatedUploadLabel,
  animatedUploadDescription,
  imageSequenceUploadLabel,
  imageSequenceUploadDescription,
  videoUploadLabel,
  videoUploadDescription,
  onStaticFile,
  onAnimatedFile,
  onImageSequenceFiles,
  onVideoFile,
  videoOptions,
}: {
  primarySource: QuickStartPrimarySource;
  staticUploadLabel: string;
  staticUploadDescription: string;
  animatedUploadLabel?: string;
  animatedUploadDescription?: string;
  imageSequenceUploadLabel?: string;
  imageSequenceUploadDescription?: string;
  videoUploadLabel?: string;
  videoUploadDescription?: string;
  onStaticFile: (file: File) => void;
  onAnimatedFile?: (file: File) => void;
  onImageSequenceFiles?: (files: File[]) => void;
  onVideoFile?: (file: File, options: VideoToAniQuickOptions) => void;
  videoOptions: VideoToAniQuickOptions;
}) {
  if (primarySource === "animated") {
    return {
      dataTestId: "studio-quick-start-animated",
      label: animatedUploadLabel ?? staticUploadLabel,
      description: animatedUploadDescription ?? staticUploadDescription,
      accept: ".gif",
      multiple: false,
      handleFiles: (files: FileList | File[]) => {
        const animatedFile = Array.from(files).find(isGifFile);
        if (animatedFile) {
          onAnimatedFile?.(animatedFile);
        }
      },
    };
  }

  if (primarySource === "image-sequence") {
    return {
      dataTestId: "studio-quick-start-image-sequence",
      label: imageSequenceUploadLabel ?? staticUploadLabel,
      description: imageSequenceUploadDescription ?? staticUploadDescription,
      accept: ".png,.jpg,.jpeg,.webp",
      multiple: true,
      handleFiles: (files: FileList | File[]) => {
        const imageFiles = Array.from(files).filter(isStaticImageFile);
        if (imageFiles.length >= 2) {
          onImageSequenceFiles?.(imageFiles);
        }
      },
    };
  }

  if (primarySource === "video") {
    return {
      dataTestId: "studio-quick-start-video",
      label: videoUploadLabel ?? staticUploadLabel,
      description: videoUploadDescription ?? staticUploadDescription,
      accept: "video/mp4,video/webm,.mp4,.webm",
      multiple: false,
      handleFiles: (files: FileList | File[]) => {
        const videoFile = Array.from(files).find(isVideoFile);
        if (videoFile) {
          onVideoFile?.(videoFile, videoOptions);
        }
      },
    };
  }

  return {
    dataTestId: "studio-quick-start-static",
    label: staticUploadLabel,
    description: staticUploadDescription,
    accept: ".png,.jpg,.jpeg,.webp",
    multiple: false,
    handleFiles: (files: FileList | File[]) => {
      const file = Array.from(files).find(isStaticImageFile);
      if (file) {
        onStaticFile(file);
      }
    },
  };
}

function isStaticImageFile(file: File) {
  if (file.type) {
    return STATIC_IMAGE_TYPES.has(file.type);
  }

  return /\.(png|jpe?g|webp)$/i.test(file.name);
}

function isGifFile(file: File) {
  if (file.type) {
    return file.type === "image/gif";
  }

  return /\.gif$/i.test(file.name);
}

function isVideoFile(file: File) {
  if (file.type) {
    return file.type === "video/mp4" || file.type === "video/webm";
  }

  return /\.(mp4|webm)$/i.test(file.name);
}

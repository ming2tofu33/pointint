"use client";

import { useRef, useState, type DragEvent } from "react";

import {
  STUDIO_INTERACTION_TRANSITION,
  default as StudioSurfaceCard,
} from "@/components/StudioSurfaceCard";
import InteractiveDotBackground from "@/components/InteractiveDotBackground";

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
  primarySource?: QuickStartPrimarySource;
  onStaticFile: (file: File) => void;
  onAnimatedFile?: (file: File) => void;
  onImageSequenceFiles?: (files: File[]) => void;
  onVideoFile?: (file: File) => void;
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
  });

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
  onVideoFile?: (file: File) => void;
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
          onVideoFile?.(videoFile);
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

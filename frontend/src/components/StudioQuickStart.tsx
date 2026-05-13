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
  onStaticFile: (file: File) => void;
  onAnimatedFile?: (file: File) => void;
}

export default function StudioQuickStart({
  title,
  description,
  staticUploadLabel,
  staticUploadDescription,
  animatedUploadLabel,
  animatedUploadDescription,
  onStaticFile,
  onAnimatedFile,
}: StudioQuickStartProps) {
  const [isRegionDragActive, setIsRegionDragActive] = useState(false);

  const handleFiles = (files: FileList | File[]) => {
    const fileList = Array.from(files);
    const staticFile = fileList.find(isStaticImageFile);
    if (staticFile) {
      onStaticFile(staticFile);
      return;
    }

    const animatedFile = fileList.find(isGifFile);
    if (animatedFile && onAnimatedFile) {
      onAnimatedFile(animatedFile);
    }
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
        gridTemplateRows: animatedUploadLabel ? "minmax(0, 1fr) auto" : "minmax(0, 1fr)",
        gap: "0.85rem",
      }}
    >
        <QuickUploadSurface
          dataTestId="studio-quick-start-static"
          title={title}
          summary={description}
          label={staticUploadLabel}
          description={staticUploadDescription}
          accept=".png,.jpg,.jpeg,.webp"
          tone="primary"
          parentDragActive={isRegionDragActive}
          onNestedDropHandled={() => setIsRegionDragActive(false)}
          onFiles={(files) => {
            const fileList = Array.from(files);
            const file = fileList.find(isStaticImageFile);
            if (file) {
              onStaticFile(file);
            }
          }}
        />

        {animatedUploadLabel && animatedUploadDescription && onAnimatedFile ? (
          <QuickUploadSurface
            dataTestId="studio-quick-start-animated"
            label={animatedUploadLabel}
            description={animatedUploadDescription}
            accept=".gif"
            tone="secondary"
            parentDragActive={isRegionDragActive}
            onNestedDropHandled={() => setIsRegionDragActive(false)}
            onFiles={(files) => {
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
  tone,
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
  tone: "primary" | "secondary";
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
          onClick={() => inputRef.current?.click()}
          style={{
            width: isPrimary ? "min(100%, 17rem)" : "min(100%, 15rem)",
            minHeight: isPrimary ? "6rem" : "3.5rem",
            border: "1px solid var(--color-border)",
            borderRadius: "0",
            backgroundColor: isSurfaceDragActive
              ? "color-mix(in srgb, var(--color-accent) 12%, var(--color-bg-primary))"
              : "var(--color-bg-primary)",
            color: "var(--color-text-primary)",
            cursor: "pointer",
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
        onChange={(event) => {
          if (event.target.files) {
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

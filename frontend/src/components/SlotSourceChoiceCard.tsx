"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

type SlotSourceChoiceCardMode = "cur" | "ani";

interface SlotSourceChoiceCardProps {
  title: string;
  description: string;
  ariaLabel: string;
  dataTestId: string;
  mode: SlotSourceChoiceCardMode;
  onFile: (file: File) => void;
  onImageSequenceFiles?: (files: File[]) => void;
}

export default function SlotSourceChoiceCard({
  title,
  description,
  ariaLabel,
  dataTestId,
  mode,
  onFile,
  onImageSequenceFiles,
}: SlotSourceChoiceCardProps) {
  const t = useTranslations("upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const isInteractiveActive = isHovered || isDragActive;
  const acceptedTypes =
    mode === "ani"
      ? ["image/gif"]
      : ["image/png", "image/jpeg", "image/webp"];
  const accept = mode === "ani" ? ".gif" : ".png,.jpg,.jpeg,.webp";
  const helperText = mode === "ani" ? t("aniDropOrClick") : t("dropOrClick");
  const formatText = mode === "ani" ? t("aniFormats") : t("formats");
  const handleFile = (file: File) => {
    if (!acceptedTypes.includes(file.type)) return;
    onFile(file);
  };
  const handleFiles = (files: FileList | File[]) => {
    const fileList = Array.from(files);

    if (mode === "cur" && onImageSequenceFiles) {
      const imageSequenceFiles = fileList.filter(isImageSequenceFrame);
      if (imageSequenceFiles.length >= 2) {
        onImageSequenceFiles(imageSequenceFiles);
        return;
      }
    }

    const file = fileList[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <button
      type="button"
      data-testid={dataTestId}
      aria-label={ariaLabel}
      onClick={() => inputRef.current?.click()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={(event) => {
        event.preventDefault();
        if (!isDragActive) {
          setIsDragActive(true);
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDragActive(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragActive(false);
        handleFiles(event.dataTransfer.files);
      }}
      style={{
        border: isInteractiveActive
          ? "1px solid color-mix(in srgb, var(--color-accent-primary) 56%, white 8%)"
          : "1px solid var(--color-border)",
        borderRadius: "0.25rem",
        minHeight: "15rem",
        padding: "1.125rem",
        backgroundColor: isInteractiveActive
          ? "color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-secondary))"
          : "var(--color-bg-secondary)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "flex-start",
        textAlign: "left",
        cursor: "pointer",
        transition: "border-color 160ms ease, background-color 160ms ease",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <div
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
          {description}
        </div>
      </div>

      <div
        style={{
          width: "100%",
          minHeight: "9.75rem",
          border: isInteractiveActive
            ? "1px dashed color-mix(in srgb, var(--color-accent-primary) 68%, white 12%)"
            : "1px dashed var(--color-border)",
          backgroundColor: isInteractiveActive
            ? "color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-secondary))"
            : "var(--color-bg-primary)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.625rem",
          padding: "1.125rem",
          transition: "border-color 160ms ease, background-color 160ms ease",
        }}
      >
        <div
          style={{
            fontSize: "1.75rem",
            lineHeight: 1,
            color: isInteractiveActive
              ? "var(--color-accent-primary)"
              : "var(--color-text-muted)",
          }}
        >
          +
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {helperText}
        </div>
        <div
          style={{
            fontSize: "0.6875rem",
            color: "var(--color-text-muted)",
          }}
        >
          {formatText}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={mode === "cur" && Boolean(onImageSequenceFiles)}
        onChange={(event) => {
          if (event.target.files) {
            handleFiles(event.target.files);
          }
          event.currentTarget.value = "";
        }}
        style={{ display: "none" }}
      />
    </button>
  );
}

const IMAGE_SEQUENCE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

function isImageSequenceFrame(file: File) {
  if (file.type) {
    return IMAGE_SEQUENCE_TYPES.has(file.type);
  }

  return /\.(png|jpe?g|webp)$/i.test(file.name);
}

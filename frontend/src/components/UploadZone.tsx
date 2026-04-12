"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export type UploadZoneMode = "cur" | "ani";

interface UploadZoneProps {
  onFile: (file: File) => void;
  processing: boolean;
  mode?: UploadZoneMode;
  showChoice?: boolean;
  onRemoveBg?: () => void;
  onSkipBg?: () => void;
  previewUrl?: string;
}

export default function UploadZone({
  onFile,
  processing,
  mode = "cur",
  showChoice,
  onRemoveBg,
  onSkipBg,
  previewUrl,
}: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("upload");
  const acceptedTypes = useMemo(
    () =>
      mode === "ani"
        ? ["image/gif"]
        : ["image/png", "image/jpeg", "image/webp"],
    [mode]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!acceptedTypes.includes(file.type)) return;
      onFile(file);
    },
    [acceptedTypes, onFile]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  if (processing) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          width: "320px",
          height: "320px",
          color: "var(--color-text-muted)",
          fontSize: "0.875rem",
        }}
      >
        <div
          style={{
            width: "2rem",
            height: "2rem",
            border: "2px solid var(--color-border)",
            borderTopColor: "var(--color-accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span>{mode === "ani" ? t("aniPreparing") : t("removingBg")}</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (showChoice && previewUrl) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          width: "320px",
        }}
      >
        <img
          src={previewUrl}
          alt={t("preview")}
          style={{
            width: "160px",
            height: "160px",
            objectFit: "contain",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-tertiary)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            width: "100%",
          }}
        >
          <ChoiceButton
            label={t("removeBg")}
            sub={t("removeBgSub")}
            onClick={onRemoveBg}
            accent
          />
          <ChoiceButton
            label={t("useAsIs")}
            sub={t("skipBgSub")}
            onClick={onSkipBg}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        width: "320px",
        height: "320px",
        border: `2px dashed ${dragging ? "var(--color-accent)" : "var(--color-border)"}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        cursor: "pointer",
        transition: "border-color 0.2s, background-color 0.2s",
        backgroundColor: dragging
          ? "var(--color-accent-subtle)"
          : "transparent",
      }}
    >
      <div
        style={{
          fontSize: "2rem",
          color: dragging ? "var(--color-accent)" : "var(--color-text-muted)",
          transition: "color 0.2s",
        }}
      >
        +
      </div>
      <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
        {mode === "ani" ? t("aniDropOrClick") : t("dropOrClick")}
      </span>
      <span
        style={{
          fontSize: "0.6875rem",
          color: "var(--color-text-muted)",
          opacity: 0.6,
        }}
      >
        {mode === "ani" ? t("aniFormats") : t("formats")}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={mode === "ani" ? ".gif" : ".png,.jpg,.jpeg,.webp"}
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

function ChoiceButton({
  label,
  sub,
  onClick,
  accent,
}: {
  label: string;
  sub: string;
  onClick?: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.125rem",
        padding: "0.75rem 1rem",
        backgroundColor: accent
          ? "var(--color-accent-subtle)"
          : "transparent",
        border: `1px solid ${accent ? "var(--color-accent)" : "var(--color-border)"}`,
        cursor: "pointer",
        transition: "border-color 0.15s",
        textAlign: "left",
      }}
    >
      <span
        style={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: accent
            ? "var(--color-accent)"
            : "var(--color-text-primary)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "0.6875rem",
          color: "var(--color-text-muted)",
        }}
      >
        {sub}
      </span>
    </button>
  );
}

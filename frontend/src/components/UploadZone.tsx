"use client";

import { useCallback, useRef, useState } from "react";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

interface UploadZoneProps {
  onFile: (file: File) => void;
  processing: boolean;
}

export default function UploadZone({ onFile, processing }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED.includes(file.type)) return;
      onFile(file);
    },
    [onFile]
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
        <span>Removing background…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
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
          color: dragging
            ? "var(--color-accent)"
            : "var(--color-text-muted)",
          transition: "color 0.2s",
        }}
      >
        +
      </div>
      <span
        style={{
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
        }}
      >
        Drop image or click to upload
      </span>
      <span
        style={{
          fontSize: "0.6875rem",
          color: "var(--color-text-muted)",
          opacity: 0.6,
        }}
      >
        PNG, JPG, WebP
      </span>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

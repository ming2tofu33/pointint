"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";

const INVALID_CHARS = /[\\/:*?"<>|]/;
const INVALID_DISPLAY = '\\ / : * ? " < > |';

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  variant?: "default" | "stageTitle";
  containerStyle?: CSSProperties;
  inputStyle?: CSSProperties;
}

export default function NameInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  variant = "default",
  containerStyle,
  inputStyle,
}: NameInputProps) {
  const [warning, setWarning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const t = useTranslations("panel");
  const isStageTitle = variant === "stageTitle";

  function handleChange(raw: string) {
    if (INVALID_CHARS.test(raw)) {
      const clean = raw.replace(INVALID_CHARS, "");
      onChange(clean);
      setWarning(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setWarning(false), 2500);
    } else {
      onChange(raw);
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div style={{ position: "relative", ...containerStyle }}>
      <input
        type="text"
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        maxLength={64}
        style={{
          width: "100%",
          fontSize: isStageTitle ? "0.9375rem" : "0.8125rem",
          fontWeight: isStageTitle ? 700 : undefined,
          lineHeight: isStageTitle ? 1.2 : undefined,
          padding: isStageTitle ? "0.05rem 0" : "0.375rem 0.5rem",
          backgroundColor: isStageTitle
            ? "transparent"
            : "var(--color-input-surface)",
          border: isStageTitle
            ? "1px solid transparent"
            : `1px solid ${warning ? "var(--color-warning)" : "var(--color-border)"}`,
          borderBottom: isStageTitle
            ? `1px solid ${warning ? "var(--color-warning)" : "transparent"}`
            : undefined,
          color: "var(--color-text-primary)",
          transition: "border-color 0.2s",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          ...inputStyle,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "calc(100% + 0.5rem)",
          left: 0,
          right: 0,
          padding: "0.5rem 0.625rem",
          backgroundColor: "var(--color-bg-tertiary)",
          border: "1px solid var(--color-warning)",
          fontSize: "0.6875rem",
          color: "var(--color-warning)",
          lineHeight: 1.4,
          opacity: warning ? 1 : 0,
          transform: warning ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <span style={{ fontWeight: 600 }}>{INVALID_DISPLAY}</span>{" "}
        {t("nameInvalidChars")}
      </div>
    </div>
  );
}

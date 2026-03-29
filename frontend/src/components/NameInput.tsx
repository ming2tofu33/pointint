"use client";

import { useEffect, useRef, useState } from "react";

const INVALID_CHARS = /[\\/:*?"<>|]/;
const INVALID_DISPLAY = '\\ / : * ? " < > |';

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function NameInput({ value, onChange, placeholder }: NameInputProps) {
  const [warning, setWarning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleChange(raw: string) {
    if (INVALID_CHARS.test(raw)) {
      // 위험 문자 자동 제거 + 경고 표시
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
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        maxLength={64}
        style={{
          width: "100%",
          fontSize: "0.8125rem",
          padding: "0.375rem 0.5rem",
          backgroundColor: "var(--color-input-surface)",
          border: `1px solid ${warning ? "var(--color-warning)" : "var(--color-border)"}`,
          color: "var(--color-text-primary)",
          transition: "border-color 0.2s",
        }}
      />

      {/* Warning popup */}
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
        <span style={{ fontWeight: 600 }}>
          {INVALID_DISPLAY}
        </span>
        {" "}cannot be used in file names
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { checkCursorHealth, HealthResult } from "@/lib/api";

interface HealthCheckProps {
  imageBlob: Blob | null;
  hotspotX: number;
  hotspotY: number;
}

const STATUS_COLORS: Record<string, string> = {
  pass: "var(--color-success)",
  warn: "var(--color-warning)",
  fail: "var(--color-error)",
};

const STATUS_LABELS: Record<string, string> = {
  pass: "Good",
  warn: "Check",
  fail: "Issue",
};

export default function HealthCheck({
  imageBlob,
  hotspotX,
  hotspotY,
}: HealthCheckProps) {
  const [health, setHealth] = useState<HealthResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!imageBlob) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      const result = await checkCursorHealth(imageBlob, hotspotX, hotspotY);
      setHealth(result);
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [imageBlob, hotspotX, hotspotY]);

  if (!health) return null;

  return (
    <div>
      <h3
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "0.75rem",
        }}
      >
        Health
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <HealthRow label="Visibility" status={health.visibility} />
        <HealthRow label="Hotspot" status={health.hotspot} />
        <HealthRow label="Readability" status={health.readability} />
      </div>

      {health.messages.length > 0 && (
        <div
          style={{
            marginTop: "0.625rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {health.messages.map((msg, i) => (
            <p
              key={i}
              style={{
                fontSize: "0.6875rem",
                color: "var(--color-warning)",
                lineHeight: 1.4,
              }}
            >
              {msg}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function HealthRow({ label, status }: { label: string; status: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "0.8125rem",
      }}
    >
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: STATUS_COLORS[status] || "var(--color-text-muted)",
        }}
      >
        {STATUS_LABELS[status] || status}
      </span>
    </div>
  );
}

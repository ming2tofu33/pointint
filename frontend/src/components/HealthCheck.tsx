"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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

export default function HealthCheck({
  imageBlob,
  hotspotX,
  hotspotY,
}: HealthCheckProps) {
  const [health, setHealth] = useState<HealthResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const t = useTranslations("health");

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

  const statusLabels: Record<string, string> = {
    pass: t("pass"),
    warn: t("warn"),
    fail: t("fail"),
  };

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
        {t("title")}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <HealthRow label={t("visibility")} status={health.visibility} statusLabels={statusLabels} />
        <HealthRow label={t("hotspot")} status={health.hotspot} statusLabels={statusLabels} />
        <HealthRow label={t("readability")} status={health.readability} statusLabels={statusLabels} />
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

function HealthRow({ label, status, statusLabels }: { label: string; status: string; statusLabels: Record<string, string> }) {
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
        {statusLabels[status] || status}
      </span>
    </div>
  );
}

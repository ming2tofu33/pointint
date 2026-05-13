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
  const aggregateStatus = getAggregateStatus([
    health.visibility,
    health.hotspot,
    health.readability,
  ]);

  return (
    <details
      data-testid="health-check"
      style={{
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-bg-primary)",
      }}
    >
      <summary
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          padding: "0.55rem 0.65rem",
          cursor: "pointer",
          listStyle: "none",
          fontSize: "0.75rem",
        }}
      >
        <span
          style={{
            color: "var(--color-text-primary)",
            fontWeight: 650,
          }}
        >
          {t("title")}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            color: STATUS_COLORS[aggregateStatus] || "var(--color-text-muted)",
            fontWeight: 700,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: "0.45rem",
              height: "0.45rem",
              borderRadius: "999px",
              backgroundColor:
                STATUS_COLORS[aggregateStatus] || "var(--color-text-muted)",
            }}
          />
          {statusLabels[aggregateStatus] || aggregateStatus}
        </span>
      </summary>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.375rem",
          padding: "0 0.65rem 0.65rem",
        }}
      >
        <HealthRow label={t("visibility")} status={health.visibility} statusLabels={statusLabels} />
        <HealthRow label={t("hotspot")} status={health.hotspot} statusLabels={statusLabels} />
        <HealthRow label={t("readability")} status={health.readability} statusLabels={statusLabels} />

        {health.messages.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              paddingTop: "0.25rem",
            }}
          >
            {health.messages.map((msg, i) => (
              <p
                key={i}
                style={{
                  margin: 0,
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
    </details>
  );
}

function getAggregateStatus(statuses: string[]) {
  if (statuses.includes("fail")) return "fail";
  if (statuses.includes("warn")) return "warn";
  return "pass";
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

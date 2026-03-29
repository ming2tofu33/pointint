"use client";

import { useTranslations } from "next-intl";

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GuideModal({ open, onClose }: GuideModalProps) {
  const t = useTranslations("guide");

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 90,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "24rem",
          maxWidth: "90vw",
          backgroundColor: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          zIndex: 100,
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Success badge */}
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--color-success)",
            padding: "0.25rem 0.625rem",
            backgroundColor: "rgba(78, 154, 107, 0.1)",
            border: "1px solid rgba(78, 154, 107, 0.2)",
            alignSelf: "flex-start",
          }}
        >
          {t("downloaded")}
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            {t("title")}
          </h2>
          <button
            onClick={onClose}
            aria-label={t("close")}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: "1.25rem",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Steps */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Step number={1} text={t("step1")} />
          <Step number={2} text={t("step2")} />
          <Step number={3} text={t("step3")} />
          <Step number={4} text={t("step4")} />
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            backgroundColor: "var(--color-border)",
          }}
        />

        {/* Restore */}
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.6,
          }}
        >
          {t("restore")}{" "}
          <span style={{ color: "var(--color-text-secondary)" }}>
            {t("restoreFile")}
          </span>{" "}
          → {t("restoreAction")}
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            padding: "0.5rem",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor =
              "var(--color-accent-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-accent)")
          }
        >
          {t("gotIt")}
        </button>
      </div>
    </>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "baseline" }}>
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          color: "var(--color-accent)",
          minWidth: "1.25rem",
        }}
      >
        {number}.
      </span>
      <span
        style={{
          fontSize: "0.8125rem",
          color: "var(--color-text-primary)",
          lineHeight: 1.5,
        }}
      >
        {text}
      </span>
    </div>
  );
}

"use client";

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GuideModal({ open, onClose }: GuideModalProps) {
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
            Apply your cursor
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
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
          <Step number={1} text="Unzip the downloaded file" />
          <Step number={2} text='Right-click install.inf → "Install"' />
          <Step number={3} text="Done. Your cursor is now active." />
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
          To restore default cursor, right-click{" "}
          <span style={{ color: "var(--color-text-secondary)" }}>
            restore-default.inf
          </span>{" "}
          → &quot;Install&quot;
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
          Got it
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

import { useEffect, useId, useRef } from "react";

type InstallGuideCopy = {
  eyebrow: string;
  title: string;
  close: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  restore: string;
  restoreFile: string;
  restoreAction: string;
  gotIt: string;
};

interface LandingInstallGuideModalProps {
  copy: InstallGuideCopy;
  open: boolean;
  onClose: () => void;
}

export default function LandingInstallGuideModal({
  copy,
  open,
  onClose,
}: LandingInstallGuideModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();
  }, [open]);

  if (!open) {
    return null;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusables = [
      closeButtonRef.current,
      confirmButtonRef.current,
    ].filter(Boolean) as HTMLButtonElement[];

    if (focusables.length === 0) {
      return;
    }

    const currentIndex = focusables.findIndex(
      (element) => element === document.activeElement
    );
    const nextIndex = event.shiftKey
      ? (currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1)
      : (currentIndex === -1 || currentIndex === focusables.length - 1
          ? 0
          : currentIndex + 1);

    event.preventDefault();
    focusables[nextIndex]?.focus();
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(7, 10, 20, 0.58)",
          zIndex: 70,
        }}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        style={{
          position: "fixed",
          inset: "50% auto auto 50%",
          transform: "translate(-50%, -50%)",
          zIndex: 80,
          width: "min(34rem, calc(100vw - 2rem))",
          borderRadius: "26px",
          border: "1px solid var(--landing-surface-border)",
          background:
            "linear-gradient(180deg, var(--landing-surface-fill-strong), var(--landing-surface-fill))",
          boxShadow: "0 30px 80px rgba(4, 10, 22, 0.42)",
          backdropFilter: "blur(20px)",
          padding: "1.5rem",
          display: "grid",
          gap: "1.25rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "0.35rem",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "var(--color-text-muted)",
              }}
            >
              {copy.eyebrow}
            </span>
            <h3
              id={titleId}
              style={{
                margin: 0,
                fontSize: "clamp(1.35rem, 3vw, 1.85rem)",
                letterSpacing: "-0.05em",
                lineHeight: 1.05,
              }}
            >
              {copy.title}
            </h3>
          </div>
          <span
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <button
              ref={closeButtonRef}
              type="button"
              aria-label={copy.close}
              onClick={onClose}
              style={{
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "999px",
                border: "1px solid var(--landing-surface-border)",
                background: "rgba(255, 255, 255, 0.06)",
                color: "var(--color-text-primary)",
                cursor: "pointer",
                fontSize: "1rem",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </span>
        </div>

        <div style={{ display: "grid", gap: "0.8rem" }}>
          <GuideStep number="01" text={copy.step1} />
          <GuideStep number="02" text={copy.step2} />
          <GuideStep number="03" text={copy.step3} />
          <GuideStep number="04" text={copy.step4} />
        </div>

        <div
          style={{
            paddingTop: "1rem",
            borderTop: "1px solid var(--landing-surface-border)",
            display: "grid",
            gap: "0.75rem",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              fontSize: "0.92rem",
            }}
          >
            {copy.restore}{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {copy.restoreFile}
            </strong>{" "}
            {copy.restoreAction}
          </p>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              ref={confirmButtonRef}
              type="button"
              onClick={onClose}
              style={{
                minHeight: "2.75rem",
                padding: "0 1rem",
                borderRadius: "999px",
                border: "1px solid var(--landing-surface-border)",
                background: "var(--color-accent)",
                color: "#fff",
                fontSize: "0.92rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 14px 30px rgba(232, 73, 106, 0.22)",
              }}
            >
              {copy.gotIt}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function GuideStep({ number, text }: { number: string; text: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "3rem minmax(0, 1fr)",
        gap: "0.75rem",
        alignItems: "start",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2rem",
          height: "2rem",
          borderRadius: "999px",
          background: "var(--color-accent-subtle)",
          color: "var(--color-accent)",
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
        }}
      >
        {number}
      </span>
      <p
        style={{
          margin: 0,
          color: "var(--color-text-primary)",
          lineHeight: 1.65,
          fontSize: "0.94rem",
        }}
      >
        {text}
      </p>
    </div>
  );
}

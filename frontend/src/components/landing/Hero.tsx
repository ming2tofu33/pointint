"use client";

import Link from "next/link";

export type HeroCopy = {
  logo: string;
  tagline: string;
  sub: string;
  cta: string;
  proofLabel: string;
  proofSourceAlt: string;
  proofCursorAlt: string;
  proofSourceCaption: string;
  proofCursorCaption: string;
};

interface HeroProps {
  copy: HeroCopy;
}

const proofCaptionStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  color: "var(--color-text-secondary)",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};

export default function Hero({ copy }: HeroProps) {
  return (
    <section
      data-testid="hero-proof"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "min(880px, calc(100vh - 3.5rem))",
        width: "100%",
        padding: "clamp(2rem, 5vw, 4rem) 0 clamp(1rem, 2vw, 2rem)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-14% -8% -10%",
          background:
            "radial-gradient(circle at 18% 20%, var(--landing-glow-a), transparent 22%), radial-gradient(circle at 84% 18%, var(--landing-glow-b), transparent 28%)",
          pointerEvents: "none",
          opacity: 0.92,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "min(1200px, calc(100% - 2rem))",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.95fr) minmax(320px, 1.1fr)",
          gap: "clamp(1.5rem, 4vw, 3rem)",
          alignItems: "center",
          minHeight: "inherit",
          padding: 0,
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "1.15rem",
            alignContent: "center",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "fit-content",
              color: "var(--color-text-secondary)",
              fontSize: "0.78rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: "2.5rem",
                height: "1px",
                background: "var(--landing-line)",
              }}
            />
            {copy.logo}
          </span>

          <h1
            style={{
              margin: 0,
              color: "var(--color-text-primary)",
              fontSize: "clamp(3rem, 8vw, 5.9rem)",
              lineHeight: 0.94,
              letterSpacing: "-0.07em",
              maxWidth: "7ch",
              whiteSpace: "pre-line",
            }}
          >
            {copy.tagline}
          </h1>

          <p
            style={{
              margin: 0,
              color: "var(--color-text-secondary)",
              fontSize: "1rem",
              lineHeight: 1.8,
              maxWidth: "34rem",
            }}
          >
            {copy.sub}
          </p>

          <div style={{ paddingTop: "0.35rem" }}>
            <Link
              href="/studio"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "3.35rem",
                padding: "0 1.35rem",
                borderRadius: "999px",
                background: "var(--color-accent)",
                border: "1px solid var(--landing-surface-border)",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: 700,
                boxShadow: "0 16px 36px rgba(232, 73, 106, 0.25)",
              }}
            >
              {copy.cta}
            </Link>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: "1.4rem",
            alignSelf: "stretch",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              width: "fit-content",
              color: "var(--color-text-secondary)",
              fontSize: "0.82rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: "0.55rem",
                height: "0.55rem",
                borderRadius: "50%",
                background: "var(--color-accent)",
                boxShadow: "0 0 16px rgba(232, 73, 106, 0.45)",
              }}
            />
            {copy.proofLabel}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 0.9fr)",
              alignItems: "center",
              gap: "1.4rem",
            }}
          >
            <figure
              style={{
                position: "relative",
                display: "grid",
                gap: "0.9rem",
                transform: "rotate(-2.5deg)",
                margin: 0,
              }}
            >
              <span style={proofCaptionStyle}>{copy.proofSourceCaption}</span>
              <div
                style={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  background:
                    "linear-gradient(180deg, var(--landing-proof-frame-top), var(--landing-proof-frame-bottom))",
                  border: "1px solid var(--landing-surface-border)",
                  boxShadow: "0 24px 60px var(--landing-surface-shadow)",
                }}
              >
                <img
                  alt={copy.proofSourceAlt}
                  src="/landing/proof-source.svg"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                  }}
                />
              </div>
            </figure>

            <div
              aria-hidden="true"
              style={{
                display: "grid",
                placeItems: "center",
                gap: "0.5rem",
                color: "var(--color-accent)",
              }}
            >
              <span
                style={{
                  fontSize: "1.8rem",
                  lineHeight: 1,
                  filter: "drop-shadow(0 0 18px rgba(232, 73, 106, 0.24))",
                }}
              >
                -&gt;
              </span>
            </div>

            <figure
              style={{
                position: "relative",
                display: "grid",
                gap: "0.9rem",
                transform: "translateY(1.25rem)",
                margin: 0,
              }}
            >
              <span style={proofCaptionStyle}>{copy.proofCursorCaption}</span>
              <div
                style={{
                  position: "relative",
                  minHeight: "18rem",
                  display: "grid",
                  placeItems: "center",
                  background:
                    "radial-gradient(circle at 50% 44%, var(--landing-glow-a-soft), transparent 24%), radial-gradient(circle at 50% 50%, var(--landing-glow-b-soft), transparent 42%)",
                  overflow: "hidden",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    width: "14rem",
                    height: "14rem",
                    borderRadius: "50%",
                    border: "1px solid var(--landing-proof-ring)",
                    opacity: 0.55,
                  }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    width: "8.5rem",
                    height: "8.5rem",
                    borderRadius: "50%",
                    background: "var(--landing-glow-a-soft)",
                    filter: "blur(10px)",
                  }}
                />
                <img
                  alt={copy.proofCursorAlt}
                  src="/landing/proof-cursor.svg"
                  style={{
                    position: "relative",
                    display: "block",
                    width: "clamp(8rem, 30vw, 12rem)",
                    height: "auto",
                    filter: "drop-shadow(0 18px 24px rgba(0, 0, 0, 0.28))",
                  }}
                />
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

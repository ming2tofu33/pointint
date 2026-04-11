import Link from "next/link";

export type TrustCopy = {
  title: string;
  facts: string[];
  cta: string;
};

interface TrustCTAProps {
  copy: TrustCopy;
}

export default function TrustCTA({ copy }: TrustCTAProps) {
  return (
    <section
      data-testid="landing-trust"
      style={{
        width: "100%",
        paddingTop: "0.5rem",
      }}
    >
      <div
        style={{
          width: "min(1200px, calc(100% - 2rem))",
          margin: "0 auto",
          display: "grid",
          gap: "1.5rem",
          padding: "clamp(1.35rem, 3vw, 2rem) 0 0",
          borderTop: "1px solid var(--landing-divider)",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            justifyItems: "start",
            maxWidth: "40rem",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(1.7rem, 4vw, 2.5rem)",
              letterSpacing: "-0.06em",
              lineHeight: 1,
              whiteSpace: "pre-line",
            }}
          >
            {copy.title}
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {copy.facts.map((fact) => (
            <div
              key={fact}
              style={{
                padding: "0.95rem 1rem",
                borderRadius: "18px",
                background: "var(--landing-surface-fill)",
                border: "1px solid var(--landing-surface-border)",
                boxShadow: "0 14px 28px var(--landing-surface-shadow)",
                color: "var(--color-text-primary)",
                fontSize: "0.94rem",
                lineHeight: 1.6,
              }}
            >
              {fact}
            </div>
          ))}
        </div>

        <div>
          <Link
            href="/studio"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "3.25rem",
              padding: "0 1.25rem",
              borderRadius: "999px",
              background: "var(--color-accent)",
              border: "1px solid var(--landing-surface-border)",
              color: "#fff",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: 700,
              boxShadow: "0 14px 30px rgba(232, 73, 106, 0.24)",
            }}
          >
            {copy.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

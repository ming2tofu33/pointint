import Link from "next/link";

interface FooterProps {
  tagline: string;
  policyLabel: string;
  privacyLabel: string;
  cookieLabel: string;
  termsLabel: string;
}

export default function Footer({
  tagline,
  policyLabel,
  privacyLabel,
  cookieLabel,
  termsLabel,
}: FooterProps) {
  return (
    <footer
      style={{
        display: "grid",
        gap: "1rem",
        width: "min(1200px, calc(100% - 2rem))",
        margin: "0 auto",
        padding: "1.35rem 0 2.4rem",
        borderTop: "1px solid var(--landing-divider)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: "0.35rem" }}>
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--color-text-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            poin+tint
          </span>
          <span
            style={{
              fontSize: "0.78rem",
              color: "var(--color-text-muted)",
              fontStyle: "italic",
            }}
          >
            {tagline}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gap: "0.5rem",
            justifyItems: "flex-start",
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--color-text-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {policyLabel}
          </span>
          <div
            style={{
              display: "flex",
              gap: "0.85rem",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/privacy"
              style={{
                fontSize: "0.78rem",
                color: "var(--color-text-secondary)",
                textDecoration: "none",
              }}
            >
              {privacyLabel}
            </Link>
            <Link
              href="/cookie-policy"
              style={{
                fontSize: "0.78rem",
                color: "var(--color-text-secondary)",
                textDecoration: "none",
              }}
            >
              {cookieLabel}
            </Link>
            <Link
              href="/terms"
              style={{
                fontSize: "0.78rem",
                color: "var(--color-text-secondary)",
                textDecoration: "none",
              }}
            >
              {termsLabel}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import type { CSSProperties } from "react";
import Link from "next/link";

import type { ContentCta, ContentLink } from "@/lib/contentGrowth";

type HubPage = {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  cta?: ContentCta;
  secondaryCta?: ContentCta;
  related?: ContentLink[];
};

type ContentHubSurfaceProps = {
  eyebrow: string;
  title: string;
  description: string;
  pages: HubPage[];
};

export default function ContentHubSurface({
  eyebrow,
  title,
  description,
  pages,
}: ContentHubSurfaceProps) {
  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div style={eyebrowStyle}>{eyebrow}</div>
        <h1 style={headingStyle}>{title}</h1>
        <p style={descriptionStyle}>{description}</p>
      </section>

      <section aria-label={title} style={gridStyle}>
        {pages.map((page) => (
          <article key={page.path} style={cardStyle}>
            <div style={cardMetaStyle}>{page.eyebrow}</div>
            <h2 style={cardTitleStyle}>
              <Link href={page.path} style={titleLinkStyle}>
                {page.title}
              </Link>
            </h2>
            <p style={cardDescriptionStyle}>{page.description}</p>

            <div style={actionRowStyle}>
              {page.cta ? (
                <Link href={page.cta.href} style={primaryActionStyle}>
                  {page.cta.label}
                </Link>
              ) : null}
              {page.secondaryCta ? (
                <Link href={page.secondaryCta.href} style={secondaryActionStyle}>
                  {page.secondaryCta.label}
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  width: "min(1120px, calc(100% - 2rem))",
  margin: "0 auto",
  padding: "clamp(2rem, 5vw, 4.5rem) 0",
  display: "grid",
  gap: "2.25rem",
};

const heroStyle: CSSProperties = {
  display: "grid",
  gap: "0.9rem",
  maxWidth: "48rem",
};

const eyebrowStyle: CSSProperties = {
  color: "var(--color-accent)",
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const headingStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-primary)",
  fontSize: "3.6rem",
  lineHeight: 1.05,
};

const descriptionStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-secondary)",
  fontSize: "1.05rem",
  lineHeight: 1.75,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(17rem, 1fr))",
  gap: "1rem",
};

const cardStyle: CSSProperties = {
  display: "grid",
  alignContent: "start",
  gap: "0.8rem",
  minHeight: "16rem",
  padding: "1.1rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.5rem",
  backgroundColor: "rgba(255,255,255,0.025)",
};

const cardMetaStyle: CSSProperties = {
  color: "var(--color-text-muted)",
  fontSize: "0.68rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.2rem",
  lineHeight: 1.2,
};

const titleLinkStyle: CSSProperties = {
  color: "var(--color-text-primary)",
  textDecoration: "none",
};

const cardDescriptionStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-secondary)",
  fontSize: "0.92rem",
  lineHeight: 1.65,
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.6rem",
  paddingTop: "0.4rem",
};

const primaryActionStyle: CSSProperties = {
  color: "var(--color-accent)",
  fontSize: "0.82rem",
  fontWeight: 700,
  textDecoration: "none",
};

const secondaryActionStyle: CSSProperties = {
  color: "var(--color-text-secondary)",
  fontSize: "0.82rem",
  fontWeight: 700,
  textDecoration: "none",
};

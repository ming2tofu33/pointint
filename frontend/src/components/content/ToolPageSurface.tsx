import type { CSSProperties } from "react";
import Link from "next/link";

import type { ToolPageContent } from "@/lib/contentGrowth";

type ToolPageSurfaceProps = {
  page: ToolPageContent;
};

export default function ToolPageSurface({ page }: ToolPageSurfaceProps) {
  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div style={eyebrowStyle}>{page.eyebrow}</div>
        <h1 style={headingStyle}>{page.title}</h1>
        <p style={descriptionStyle}>{page.description}</p>
        <div style={ctaRowStyle}>
          <Link href={page.cta.href} className="landing-glass-cta">
            {page.cta.label}
          </Link>
          <Link href={page.secondaryCta.href} style={secondaryLinkStyle}>
            {page.secondaryCta.label}
          </Link>
        </div>
        <div style={proofGridStyle} aria-label="Tool capabilities">
          {page.proofPoints.map((point) => (
            <div key={point} style={proofItemStyle}>
              {point}
            </div>
          ))}
        </div>
      </section>

      <section style={sectionGridStyle} aria-label="Tool details">
        {page.sections.map((section) => (
          <article key={section.title} style={sectionStyle}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            {section.body ? <p style={bodyStyle}>{section.body}</p> : null}
            <ul style={listStyle}>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <FaqBlock faq={page.faq} />
      <RelatedLinks links={page.related} />
    </main>
  );
}

function FaqBlock({ faq }: { faq: ToolPageContent["faq"] }) {
  return (
    <section data-testid="content-page-faq" style={faqStyle} aria-label="FAQ">
      <h2 style={sectionTitleStyle}>FAQ</h2>
      {faq.map((item) => (
        <article key={item.question} style={faqItemStyle}>
          <h3 style={faqQuestionStyle}>{item.question}</h3>
          <p style={bodyStyle}>{item.answer}</p>
        </article>
      ))}
    </section>
  );
}

function RelatedLinks({ links }: { links: ToolPageContent["related"] }) {
  return (
    <section style={relatedStyle} aria-label="Related guides">
      {links.map((link) => (
        <Link key={link.href} href={link.href} style={relatedLinkStyle}>
          {link.label}
        </Link>
      ))}
    </section>
  );
}

const pageStyle: CSSProperties = {
  width: "min(1120px, calc(100% - 2rem))",
  margin: "0 auto",
  padding: "clamp(2rem, 5vw, 4.5rem) 0",
  display: "grid",
  gap: "2.5rem",
};

const heroStyle: CSSProperties = {
  display: "grid",
  gap: "1rem",
  maxWidth: "52rem",
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
  fontSize: "clamp(2.5rem, 7vw, 5rem)",
  lineHeight: 1,
};

const descriptionStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-secondary)",
  fontSize: "1.05rem",
  lineHeight: 1.75,
  maxWidth: "44rem",
};

const ctaRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.9rem",
  paddingTop: "0.5rem",
};

const secondaryLinkStyle: CSSProperties = {
  color: "var(--color-text-secondary)",
  fontSize: "0.9rem",
  fontWeight: 700,
  textDecoration: "none",
};

const proofGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
  gap: "0.75rem",
  paddingTop: "1.25rem",
};

const proofItemStyle: CSSProperties = {
  borderTop: "1px solid var(--color-border)",
  paddingTop: "0.75rem",
  color: "var(--color-text-secondary)",
  fontSize: "0.9rem",
  lineHeight: 1.5,
};

const sectionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
  gap: "1.25rem",
};

const sectionStyle: CSSProperties = {
  display: "grid",
  alignContent: "start",
  gap: "0.75rem",
  paddingTop: "1rem",
  borderTop: "1px solid var(--color-border)",
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-primary)",
  fontSize: "1.35rem",
  lineHeight: 1.2,
};

const bodyStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-secondary)",
  fontSize: "0.95rem",
  lineHeight: 1.7,
};

const listStyle: CSSProperties = {
  margin: 0,
  paddingLeft: "1.1rem",
  color: "var(--color-text-secondary)",
  fontSize: "0.95rem",
  lineHeight: 1.8,
};

const faqStyle: CSSProperties = {
  display: "grid",
  gap: "1rem",
  maxWidth: "48rem",
};

const faqItemStyle: CSSProperties = {
  display: "grid",
  gap: "0.35rem",
  paddingTop: "1rem",
  borderTop: "1px solid var(--color-border)",
};

const faqQuestionStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-primary)",
  fontSize: "1rem",
};

const relatedStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  paddingTop: "1rem",
  borderTop: "1px solid var(--color-border)",
};

const relatedLinkStyle: CSSProperties = {
  color: "var(--color-text-primary)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.5rem",
  padding: "0.6rem 0.8rem",
  textDecoration: "none",
  fontSize: "0.85rem",
};

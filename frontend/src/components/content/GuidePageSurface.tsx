import type { CSSProperties } from "react";
import Link from "next/link";

import type { GuidePageContent } from "@/lib/contentGrowth";

type GuidePageSurfaceProps = {
  page: GuidePageContent;
};

export default function GuidePageSurface({ page }: GuidePageSurfaceProps) {
  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div style={eyebrowStyle}>{page.eyebrow}</div>
        <h1 style={headingStyle}>{page.title}</h1>
        <p style={descriptionStyle}>{page.description}</p>
        <Link href={page.cta.href} className="landing-glass-cta">
          {page.cta.label}
        </Link>
      </section>

      <section style={guideBodyStyle} aria-label="Guide steps">
        {page.sections.map((section, index) => (
          <article key={section.title} style={sectionStyle}>
            <div style={stepNumberStyle}>{String(index + 1).padStart(2, "0")}</div>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <h2 style={sectionTitleStyle}>{section.title}</h2>
              {section.body ? <p style={bodyStyle}>{section.body}</p> : null}
              <ul style={listStyle}>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section data-testid="content-page-faq" style={faqStyle} aria-label="FAQ">
        <h2 style={sectionTitleStyle}>FAQ</h2>
        {page.faq.map((item) => (
          <article key={item.question} style={faqItemStyle}>
            <h3 style={faqQuestionStyle}>{item.question}</h3>
            <p style={bodyStyle}>{item.answer}</p>
          </article>
        ))}
      </section>

      <section style={relatedStyle} aria-label="Related pages">
        {page.related.map((link) => (
          <Link key={link.href} href={link.href} style={relatedLinkStyle}>
            {link.label}
          </Link>
        ))}
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  width: "min(980px, calc(100% - 2rem))",
  margin: "0 auto",
  padding: "clamp(2rem, 5vw, 4.5rem) 0",
  display: "grid",
  gap: "2.5rem",
};

const heroStyle: CSSProperties = {
  display: "grid",
  justifyItems: "start",
  gap: "1rem",
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
  fontSize: "clamp(2.3rem, 6vw, 4.2rem)",
  lineHeight: 1.05,
};

const descriptionStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-secondary)",
  fontSize: "1.05rem",
  lineHeight: 1.75,
};

const guideBodyStyle: CSSProperties = {
  display: "grid",
  gap: "1.35rem",
};

const sectionStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "3rem minmax(0, 1fr)",
  gap: "1rem",
  paddingTop: "1.25rem",
  borderTop: "1px solid var(--color-border)",
};

const stepNumberStyle: CSSProperties = {
  color: "var(--color-accent)",
  fontSize: "0.85rem",
  fontWeight: 700,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  color: "var(--color-text-primary)",
  fontSize: "1.35rem",
  lineHeight: 1.25,
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
  lineHeight: 1.85,
};

const faqStyle: CSSProperties = {
  display: "grid",
  gap: "1rem",
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

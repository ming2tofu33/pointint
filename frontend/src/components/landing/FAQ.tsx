interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section
      style={{
        padding: "4rem 2rem 6rem",
        maxWidth: "42rem",
        margin: "0 auto",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {items.map((item, i) => (
          <details
            key={i}
            style={{
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <summary
              style={{
                padding: "1.25rem 0",
                fontSize: "0.9375rem",
                fontWeight: 500,
                color: "var(--color-text-primary)",
                cursor: "pointer",
                listStyle: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {item.question}
              <span
                style={{
                  fontSize: "1.25rem",
                  color: "var(--color-text-muted)",
                  transition: "transform 0.2s",
                  flexShrink: 0,
                  marginLeft: "1rem",
                }}
              >
                +
              </span>
            </summary>
            <p
              style={{
                padding: "0 0 1.25rem",
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
              }}
            >
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

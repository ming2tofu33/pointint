interface Step {
  number: number;
  title: string;
  sub: string;
}

interface HowItWorksProps {
  steps: Step[];
}

export default function HowItWorks({ steps }: HowItWorksProps) {
  return (
    <section
      style={{
        padding: "6rem 2rem",
        maxWidth: "56rem",
        margin: "0 auto",
      }}
    >
      <div
        className="flex flex-col md:flex-row"
        style={{ gap: "3rem" }}
      >
        {steps.map((step) => (
          <div
            key={step.number}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--color-accent)",
                lineHeight: 1,
              }}
            >
              {step.number}
            </span>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginTop: "0.25rem",
              }}
            >
              {step.title}
            </h3>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
              }}
            >
              {step.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

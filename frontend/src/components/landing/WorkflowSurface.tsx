type WorkflowStep = {
  title: string;
  sub: string;
};

export type WorkflowCopy = {
  title: string;
  sub: string;
  steps: WorkflowStep[];
};

interface WorkflowSurfaceProps {
  copy: WorkflowCopy;
}

export default function WorkflowSurface({ copy }: WorkflowSurfaceProps) {
  return (
    <section
      data-testid="workflow-surface"
      data-surface-mode="page"
      style={{
        width: "100%",
        padding: "clamp(1rem, 2vw, 1.5rem) 0",
      }}
    >
      <div
        style={{
          width: "min(1200px, calc(100% - 2rem))",
          margin: "0 auto",
          display: "grid",
          gap: "1.5rem",
          padding: "clamp(1.35rem, 3vw, 2rem) 0",
        }}
      >
        <div style={{ display: "grid", gap: "0.6rem", maxWidth: "42rem" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(1.7rem, 4vw, 2.6rem)",
              letterSpacing: "-0.06em",
              lineHeight: 1,
              whiteSpace: "pre-line",
            }}
          >
            {copy.title}
          </h2>
          <p
            style={{
              margin: 0,
              color: "var(--color-text-secondary)",
              lineHeight: 1.75,
            }}
          >
            {copy.sub}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "0.9rem",
          }}
        >
          {copy.steps.map((step, index) => (
            <article
              key={step.title}
              style={{
                display: "grid",
                gap: "0.75rem",
                padding: "1rem",
                borderRadius: "20px",
                background: "var(--landing-surface-fill)",
                border: "1px solid var(--landing-surface-border)",
                boxShadow: "0 16px 32px var(--landing-surface-shadow)",
                backdropFilter: "blur(14px)",
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
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                0{index + 1}
              </span>
              <div style={{ display: "grid", gap: "0.35rem" }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.05rem",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "var(--color-text-secondary)",
                    fontSize: "0.94rem",
                    lineHeight: 1.7,
                  }}
                >
                  {step.sub}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

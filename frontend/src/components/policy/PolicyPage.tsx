interface PolicyPageProps {
  title: string;
  body: string;
}

export default function PolicyPage({ title, body }: PolicyPageProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 12% 0%, var(--landing-glow-a, var(--color-accent-glow)), transparent 24%), linear-gradient(180deg, var(--landing-bg-start, var(--color-bg-primary)) 0%, var(--landing-bg-end, var(--color-bg-secondary)) 100%)",
        color: "var(--color-text-primary)",
        padding: "calc(var(--header-height, 72px) + 2rem) 1rem 4rem",
      }}
    >
      <section
        style={{
          width: "min(840px, 100%)",
          margin: "0 auto",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          border: "1px solid var(--landing-surface-border)",
          borderRadius: "28px",
          background:
            "linear-gradient(180deg, var(--landing-surface-fill-strong), var(--landing-surface-fill))",
          boxShadow: "0 20px 48px rgba(4, 10, 22, 0.24)",
        }}
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2rem, 5vw, 3rem)",
              lineHeight: 1.05,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "1rem",
              lineHeight: 1.8,
              color: "var(--color-text-secondary)",
              whiteSpace: "pre-line",
            }}
          >
            {body}
          </p>
        </div>
      </section>
    </main>
  );
}

export type MoodCopy = {
  eyebrow: string;
  title: string;
  sub: string;
};

interface MoodGlimpseProps {
  copy: MoodCopy;
}

export default function MoodGlimpse({ copy }: MoodGlimpseProps) {
  return (
    <section
      data-testid="mood-glimpse"
      data-surface-mode="page"
      style={{
        width: "100%",
        padding: "clamp(0.5rem, 1vw, 1rem) 0",
      }}
    >
      <div
        style={{
          width: "min(1200px, calc(100% - 2rem))",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.9fr) minmax(280px, 1.1fr)",
          gap: "1.5rem",
          alignItems: "center",
          padding: "clamp(1.35rem, 3vw, 2rem) 0",
        }}
      >
        <div style={{ display: "grid", gap: "0.75rem", maxWidth: "34rem" }}>
          <span
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.78rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {copy.eyebrow}
          </span>
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
          aria-hidden="true"
          style={{
            position: "relative",
            minHeight: "19rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "17rem",
              height: "17rem",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              border: "1px solid var(--landing-mood-ring)",
              boxShadow: "0 0 0 40px var(--landing-mood-ring-shadow)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "6.5rem",
              height: "6.5rem",
              left: "18%",
              top: "20%",
              borderRadius: "20px",
              background:
                "linear-gradient(160deg, var(--landing-glow-a-soft), var(--landing-glow-b-soft))",
              transform: "rotate(-12deg)",
              boxShadow: "0 18px 40px var(--landing-surface-shadow)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "5rem",
              height: "10rem",
              right: "18%",
              bottom: "18%",
              borderRadius: "999px",
              background:
                "linear-gradient(180deg, var(--landing-surface-fill-strong), var(--landing-glow-a-soft))",
              transform: "rotate(16deg)",
              boxShadow: "0 18px 40px var(--landing-surface-shadow)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "8.5rem",
              height: "8.5rem",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, var(--landing-glow-a-soft), var(--landing-glow-b-soft), transparent 70%)",
              filter: "blur(4px)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

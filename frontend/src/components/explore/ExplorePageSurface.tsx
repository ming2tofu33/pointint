"use client";

import ShowcaseSurface, {
  type ShowcaseCopy,
} from "@/components/landing/ShowcaseSurface";

interface ExplorePageSurfaceProps {
  title: string;
  sub: string;
  showcase: ShowcaseCopy;
}

export default function ExplorePageSurface({
  title,
  sub,
  showcase,
}: ExplorePageSurfaceProps) {
  return (
    <main
      style={{
        minHeight: "calc(100vh - var(--app-header-height, 4.25rem))",
        padding: "clamp(2rem, 5vw, 4rem) 0 4rem",
        background:
          "radial-gradient(circle at 12% 0%, var(--landing-glow-a, var(--color-accent-glow)), transparent 24%), radial-gradient(circle at 88% 18%, var(--landing-glow-b, rgba(124, 180, 255, 0.16)), transparent 28%), linear-gradient(180deg, var(--landing-bg-start, var(--color-bg-primary)) 0%, var(--landing-bg-end, var(--color-bg-secondary)) 100%)",
      }}
    >
      <div
        style={{
          width: "min(1200px, calc(100% - 2rem))",
          margin: "0 auto",
          display: "grid",
          gap: "1.5rem",
        }}
      >
        <section
          style={{
            display: "grid",
            gap: "0.625rem",
            maxWidth: "42rem",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 0.98,
              letterSpacing: "-0.06em",
              color: "var(--color-text-primary)",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "0.98rem",
              lineHeight: 1.75,
              color: "var(--color-text-secondary)",
            }}
          >
            {sub}
          </p>
        </section>

        <ShowcaseSurface copy={showcase} />
      </div>
    </main>
  );
}

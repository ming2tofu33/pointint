"use client";

import { useEffect, useState } from "react";
import Footer from "@/components/landing/Footer";
import Hero, { type HeroCopy } from "@/components/landing/Hero";
import MoodGlimpse, { type MoodCopy } from "@/components/landing/MoodGlimpse";
import ShowcaseSurface, {
  type ShowcaseCopy,
} from "@/components/landing/ShowcaseSurface";
import TrustCTA, { type TrustCopy } from "@/components/landing/TrustCTA";
import WaterCanvas from "@/components/landing/WaterCanvas";
import WorkflowSurface, {
  type WorkflowCopy,
} from "@/components/landing/WorkflowSurface";

export type LandingCopy = {
  hero: HeroCopy;
  workflow: WorkflowCopy;
  showcase: ShowcaseCopy;
  mood: MoodCopy;
  trust: TrustCopy;
  footer: {
    tagline: string;
  };
};

interface LandingPageProps {
  copy: LandingCopy;
}

const DESKTOP_SNAP_QUERY = "(min-width: 960px)";
const HEADER_SNAP_OFFSET = "5rem";

export default function LandingPage({ copy }: LandingPageProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const media = window.matchMedia(DESKTOP_SNAP_QUERY);

    function syncSnapMode() {
      if (media.matches) {
        root.style.scrollSnapType = "y mandatory";
        root.style.scrollPaddingTop = HEADER_SNAP_OFFSET;
        body.style.scrollSnapType = "y mandatory";
        body.style.scrollPaddingTop = HEADER_SNAP_OFFSET;
        return;
      }

      root.style.removeProperty("scroll-snap-type");
      root.style.removeProperty("scroll-padding-top");
      body.style.removeProperty("scroll-snap-type");
      body.style.removeProperty("scroll-padding-top");
    }

    syncSnapMode();
    media.addEventListener("change", syncSnapMode);

    return () => {
      media.removeEventListener("change", syncSnapMode);
      root.style.removeProperty("scroll-snap-type");
      root.style.removeProperty("scroll-padding-top");
      body.style.removeProperty("scroll-snap-type");
      body.style.removeProperty("scroll-padding-top");
    };
  }, []);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    setMousePos({
      x: event.clientX,
      y: event.clientY,
    });
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        isolation: "isolate",
        background:
          "radial-gradient(circle at 12% 0%, var(--landing-glow-a, var(--color-accent-glow)), transparent 24%), radial-gradient(circle at 88% 18%, var(--landing-glow-b, rgba(124, 180, 255, 0.16)), transparent 28%), linear-gradient(180deg, var(--landing-bg-start, var(--color-bg-primary)) 0%, var(--landing-bg-end, var(--color-bg-secondary)) 100%)",
        color: "var(--color-text-primary)",
        ["--landing-header-offset" as string]: HEADER_SNAP_OFFSET,
      }}
    >
      <WaterCanvas
        mouseX={mousePos.x}
        mouseY={mousePos.y}
        variant="page"
        motionScale={0.72}
      />
      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
        }}
      >
        <div className="landing-stack">
          <div className="landing-panel landing-panel--hero">
            <Hero copy={copy.hero} />
          </div>
          <div className="landing-panel landing-panel--workflow">
            <WorkflowSurface copy={copy.workflow} />
          </div>
          <div className="landing-panel landing-panel--showcase">
            <ShowcaseSurface copy={copy.showcase} />
          </div>
          <div className="landing-panel landing-panel--mood">
            <MoodGlimpse copy={copy.mood} />
          </div>
          <div className="landing-tail">
            <TrustCTA copy={copy.trust} />
          </div>
        </div>
      </main>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Footer tagline={copy.footer.tagline} />
      </div>
      <style>{`
        .landing-stack {
          display: grid;
          gap: clamp(3.75rem, 8vw, 7rem);
          padding: 0 0 4.5rem;
        }

        .landing-panel,
        .landing-tail {
          position: relative;
        }

        @media (min-width: 960px) {
          .landing-stack {
            gap: 0;
          }

          .landing-panel {
            min-height: calc(100svh - var(--landing-header-offset));
            display: flex;
            align-items: center;
            justify-content: center;
            scroll-snap-align: start;
            scroll-snap-stop: always;
          }

          .landing-panel--hero {
            align-items: stretch;
          }

          .landing-panel--hero :global(section[data-testid="hero-proof"]) {
            width: 100%;
            min-height: calc(100svh - var(--landing-header-offset));
          }

          .landing-panel--workflow :global(section[data-testid="workflow-surface"]),
          .landing-panel--showcase :global(section[data-testid="showcase-surface"]),
          .landing-panel :global(section[data-testid="mood-glimpse"]) {
            width: 100%;
            min-height: auto;
            padding-top: 0;
            padding-bottom: 0;
          }

          .landing-tail {
            padding-top: clamp(2.75rem, 6vw, 4.5rem);
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import LandingInstallGuideModal from "@/components/landing/LandingInstallGuideModal";

type ShowcaseCardCopy = {
  id: string;
  title: string;
  description: string;
  badge: string;
  downloadLabel: string;
  previewLabel: string;
  previewSrc: string;
  bundleHref: string;
  bundleFileName: string;
  accent: string;
};

type InstallGuideCopy = {
  eyebrow: string;
  title: string;
  close: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  restore: string;
  restoreFile: string;
  restoreAction: string;
  gotIt: string;
};

export type ShowcaseCopy = {
  eyebrow: string;
  title: string;
  sub: string;
  installStripTitle: string;
  installStripBody: string;
  installStripCta: string;
  studioCta: string;
  installGuide: InstallGuideCopy;
  samples: ShowcaseCardCopy[];
};

interface ShowcaseSurfaceProps {
  copy: ShowcaseCopy;
}

export default function ShowcaseSurface({ copy }: ShowcaseSurfaceProps) {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <section
      data-testid="showcase-surface"
      data-surface-mode="page"
      style={{
        width: "100%",
        padding: "clamp(0.5rem, 1.2vw, 1rem) 0",
      }}
    >
      <div
        style={{
          width: "min(1200px, calc(100% - 2rem))",
          margin: "0 auto",
          display: "grid",
          gap: "1.25rem",
          padding: "clamp(1.35rem, 3vw, 2rem) 0",
        }}
      >
        <div style={{ display: "grid", gap: "0.65rem", maxWidth: "43rem" }}>
          <span
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.76rem",
              letterSpacing: "0.14em",
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
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "0.9rem",
          }}
        >
          {copy.samples.map((sample) => (
            <article
              key={sample.id}
              style={{
                position: "relative",
                display: "grid",
                gap: "0.9rem",
                padding: "1rem",
                borderRadius: "22px",
                background:
                  "linear-gradient(180deg, var(--landing-surface-fill-strong), var(--landing-surface-fill))",
                border: "1px solid var(--landing-surface-border)",
                boxShadow: "0 18px 38px var(--landing-surface-shadow)",
                backdropFilter: "blur(16px)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "0 auto auto 0",
                  width: "100%",
                  height: "0.24rem",
                  background: `linear-gradient(90deg, ${sample.accent}, transparent 90%)`,
                }}
              />
              <div
                style={{
                  display: "grid",
                  gap: "0.75rem",
                  paddingTop: "0.25rem",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "1.35 / 1",
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background:
                      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 36%), linear-gradient(140deg, rgba(15, 20, 35, 0.96), rgba(8, 12, 22, 0.86))",
                  }}
                >
                  <img
                    src={sample.previewSrc}
                    alt={sample.previewLabel}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      inset: "0.9rem auto auto 0.9rem",
                      padding: "0.35rem 0.65rem",
                      borderRadius: "999px",
                      background: "rgba(3, 6, 12, 0.56)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#fff",
                      fontSize: "0.72rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {sample.badge}
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gap: "0.35rem",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.08rem",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {sample.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: "var(--color-text-secondary)",
                      fontSize: "0.93rem",
                      lineHeight: 1.65,
                    }}
                  >
                    {sample.description}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "0.78rem",
                    }}
                  >
                    {sample.bundleFileName}
                  </span>
                  <a
                    href={sample.bundleHref}
                    download
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "2.5rem",
                      padding: "0 0.95rem",
                      borderRadius: "999px",
                      background: "var(--color-accent)",
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      boxShadow: "0 12px 24px rgba(232, 73, 106, 0.18)",
                    }}
                  >
                    {sample.downloadLabel}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gap: "1rem",
            alignItems: "center",
            padding: "1rem 1.1rem",
            borderRadius: "20px",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(124, 180, 255, 0.08))",
            border: "1px solid var(--landing-surface-border)",
            boxShadow: "0 16px 32px var(--landing-surface-shadow)",
          }}
        >
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <strong
              style={{
                fontSize: "0.92rem",
                letterSpacing: "-0.02em",
              }}
            >
              {copy.installStripTitle}
            </strong>
            <p
              style={{
                margin: 0,
                color: "var(--color-text-secondary)",
                lineHeight: 1.65,
                fontSize: "0.92rem",
              }}
            >
              {copy.installStripBody}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              style={{
                minHeight: "2.8rem",
                padding: "0 1rem",
                borderRadius: "999px",
                border: "1px solid var(--landing-surface-border)",
                background: "rgba(255, 255, 255, 0.06)",
                color: "var(--color-text-primary)",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {copy.installStripCta}
            </button>
            <Link
              href="/studio"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "2.8rem",
                padding: "0 1rem",
                borderRadius: "999px",
                border: "1px solid var(--landing-surface-border)",
                background: "var(--color-accent)",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
                boxShadow: "0 14px 30px rgba(232, 73, 106, 0.22)",
              }}
            >
              {copy.studioCta}
            </Link>
          </div>
        </div>
      </div>

      <LandingInstallGuideModal
        copy={copy.installGuide}
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </section>
  );
}

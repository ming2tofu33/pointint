"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { setLandingFile } from "@/lib/landingStore";
import WaterCanvas from "./WaterCanvas";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

export default function Hero() {
  const t = useTranslations("landing");
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setIsDesktop(window.matchMedia("(pointer: fine)").matches);
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!isDesktop) return;
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (!isDesktop) return;

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      setError("PNG, JPG, WebP only");
      setTimeout(() => setError(null), 2500);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(t("fileTooLarge"));
      setTimeout(() => setError(null), 2500);
      return;
    }

    setLandingFile(file);
    router.push("/studio?fromLanding=true");
  }

  return (
    <section
      ref={heroRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderBottom: dragging
          ? "2px solid var(--color-accent)"
          : "2px solid transparent",
        transition: "border-color 0.2s",
      }}
    >
      {/* Water surface */}
      {!reducedMotion && <WaterCanvas />}

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          {t("logo")}
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            color: "var(--color-text-secondary)",
            fontStyle: "italic",
          }}
        >
          {t("tagline")}
        </p>

        <div style={{ height: "2rem" }} />

        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-text-muted)",
            transition: "color 0.2s",
            ...(dragging ? { color: "var(--color-accent)" } : {}),
          }}
        >
          {dragging ? t("dropActive") : isDesktop ? t("dropHint") : ""}
        </p>

        <Link
          href="/studio"
          style={{
            display: "inline-block",
            fontSize: "0.875rem",
            fontWeight: 600,
            padding: "0.75rem 2rem",
            backgroundColor: "var(--color-accent)",
            color: "#fff",
            textDecoration: "none",
            transition: "background-color 0.2s",
            marginTop: "0.5rem",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor =
              "var(--color-accent-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-accent)")
          }
        >
          {t("startCreating")}
        </Link>

        {error && (
          <p
            role="alert"
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-error)",
              marginTop: "0.5rem",
            }}
          >
            {error}
          </p>
        )}
      </div>
    </section>
  );
}

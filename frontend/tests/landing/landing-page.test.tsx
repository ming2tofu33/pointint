import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LandingPage, { type LandingCopy } from "@/components/landing/LandingPage";
import { showcaseSamples } from "@/lib/showcaseSamples";

const showcaseSampleCopy = [
  {
    title: "Aurora Glass",
    description: "A soft, glassy pointer bundle with a calm hover feel.",
    badge: "Available",
    downloadLabel: "Download bundle",
    previewLabel: "Aurora Glass sample preview",
  },
  {
    title: "Studio Signal",
    description:
      "A crisp cursor bundle with a sharp red accent and steady motion.",
    badge: "Available",
    downloadLabel: "Download bundle",
    previewLabel: "Studio Signal sample preview",
  },
  {
    title: "Night Orbit",
    description:
      "A darker sample bundle with a quiet glow and circular pointer path.",
    badge: "Available",
    downloadLabel: "Download bundle",
    previewLabel: "Night Orbit sample preview",
  },
];

const copy = {
  hero: {
    logo: "Pointint",
    tagline: "Your Point, Your Tint.",
    sub: "Turn a favorite image into a Windows cursor you can use right away.",
    cta: "Start with image",
    proofLabel: "Image to cursor",
    proofSourceAlt: "Landing proof source image",
    proofCursorAlt: "Landing proof cursor result",
    proofSourceCaption: "Source image",
    proofCursorCaption: "Cursor result",
  },
  workflow: {
    title: "Three steps, no clutter",
    sub: "Upload an image, refine it, preview the cursor, and apply it on Windows.",
    steps: [
      {
        title: "Upload",
        sub: "PNG, JPG, or WebP enters the flow automatically.",
      },
      {
        title: "Edit",
        sub: "Position, resize, and set your hotspot.",
      },
      {
        title: "Download",
        sub: "Get your .cur file with one-click Windows installer.",
      },
    ],
  },
  showcase: {
    eyebrow: "Showcase",
    title: "Showcase",
    sub: "First-party sample cursor bundles you can download and install immediately.",
    installStripTitle: "Install summary",
    installStripBody:
      "Each bundle includes .cur, install.inf, and restore-default.inf so you can install it on Windows and roll back later.",
    installStripCta: "View install guide",
    studioCta: "Open studio",
    installGuide: {
      eyebrow: "Install guide",
      title: "Install your sample cursor bundle",
      close: "Close",
      step1: "Unzip the downloaded file.",
      step2: 'Right-click install.inf and choose "Install".',
      step3:
        'Open Settings > Mouse > Additional mouse settings > Pointers tab.',
      step4: 'Select "Pointint" from the Scheme dropdown and click OK.',
      restore: "To restore the default cursor, right-click",
      restoreFile: "restore-default.inf",
      restoreAction: '"Install"',
      gotIt: "Got it",
    },
    samples: showcaseSamples.map((sample, index) => ({
      ...sample,
      ...showcaseSampleCopy[index],
    })),
  },
  mood: {
    eyebrow: "Pointint for Moniterior",
    title: "A small pointer can change\nthe feel of a whole desktop",
    sub: "This first product stays focused on cursors while hinting at the broader Pointint world of desktop objects.",
  },
  trust: {
    title: "Ready to try right now",
    facts: [
      "Supports PNG, JPG, and WebP",
      "Downloads a Windows-ready .cur",
      "Free to start",
      "Includes an apply guide",
    ],
    cta: "Start with image",
  },
  footer: {
    tagline: "Your Point, Your Tint.",
  },
} satisfies LandingCopy;

describe("LandingPage", () => {
  it("renders showcase between workflow and mood", () => {
    const { container } = render(<LandingPage copy={copy} />);

    const pageSections = Array.from(
      container.querySelectorAll("section[data-surface-mode='page']")
    );

    expect(pageSections.map((section) => section.getAttribute("data-testid"))).toEqual([
      "workflow-surface",
      "showcase-surface",
      "mood-glimpse",
    ]);
    expect(screen.getByTestId("showcase-surface")).toBeInTheDocument();
  });
});

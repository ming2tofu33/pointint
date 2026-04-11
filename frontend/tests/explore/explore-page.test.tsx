import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const messages = {
  explore: {
    title: "Explore",
    sub: "Browse curated Pointint samples.",
  },
  landing: {
    showcaseEyebrow: "Showcase",
    showcaseTitle: "Showcase",
    showcaseSub: "First-party sample cursor bundles you can download and install immediately.",
    showcaseStripTitle: "Install summary",
    showcaseStripBody:
      "Each bundle includes .cur, install.inf, and restore-default.inf so you can install it on Windows and roll back later.",
    showcaseStripCta: "View install guide",
    showcaseStudioCta: "Open studio",
    showcaseGuideEyebrow: "Install guide",
    showcaseGuideTitle: "Install your sample cursor bundle",
    showcaseBadge: "Available",
    showcaseDownloadLabel: "Download bundle",
    showcaseSampleAuroraGlassTitle: "Aurora Glass",
    showcaseSampleAuroraGlassSub: "A soft, glassy pointer bundle with a calm hover feel.",
    showcaseSampleAuroraGlassAlt: "Aurora Glass sample preview",
    showcaseSampleStudioSignalTitle: "Studio Signal",
    showcaseSampleStudioSignalSub:
      "A crisp cursor bundle with a sharp red accent and steady motion.",
    showcaseSampleStudioSignalAlt: "Studio Signal sample preview",
    showcaseSampleNightOrbitTitle: "Night Orbit",
    showcaseSampleNightOrbitSub:
      "A darker sample bundle with a quiet glow and circular pointer path.",
    showcaseSampleNightOrbitAlt: "Night Orbit sample preview",
  },
  guide: {
    close: "Close",
    step1: "Unzip the downloaded file",
    step2: 'Right-click install.inf and choose "Install".',
    step3:
      "Open Settings > Mouse > Additional mouse settings > Pointers tab.",
    step4: 'Select "Pointint" from the Scheme dropdown and click OK.',
    restore: "To restore the default cursor, right-click",
    restoreFile: "restore-default.inf",
    restoreAction: '"Install"',
    gotIt: "Got it",
  },
} as const;

vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: keyof typeof messages) => {
    const scoped = messages[namespace];
    return (key: string) => scoped[key as keyof typeof scoped] ?? key;
  },
}));

import ExplorePage from "@/app/explore/page";

describe("Explore page", () => {
  it("renders an Explore heading and sample downloads", async () => {
    const Page = await ExplorePage();

    render(Page);

    expect(
      screen.getByRole("heading", { level: 1, name: "Explore" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Download bundle" })).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Open studio" })).toHaveAttribute(
      "href",
      "/studio"
    );
  });
});

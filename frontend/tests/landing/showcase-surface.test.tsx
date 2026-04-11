import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ShowcaseSurface from "@/components/landing/ShowcaseSurface";
import { showcaseSamples } from "@/lib/showcaseSamples";

const copy = {
  title: "Showcase",
  sub: "First-party sample cursor bundles you can download and install immediately.",
  installStripTitle: "Install summary",
  installStripBody:
    "Each bundle ships with a ready-to-install cursor pack and a short setup guide.",
  installStripCta: "View install guide",
  installGuide: {
    title: "Install your sample cursor bundle",
    close: "Close",
    step1: "Unzip the downloaded file.",
    step2: 'Right-click install.inf and choose "Install".',
    step3: 'Open Settings > Mouse > Additional mouse settings > Pointers tab.',
    step4: 'Select "Pointint" from the Scheme dropdown and click OK.',
    restore: "To restore the default cursor, right-click",
    restoreFile: "restore-default.inf",
    restoreAction: '"Install"',
    gotIt: "Got it",
  },
  samples: showcaseSamples.map((sample, index) => [
    {
      title: "Aurora Glass",
      description:
        "A soft, glassy pointer bundle with a calm hover feel.",
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
  ][index]),
};

describe("ShowcaseSurface", () => {
  it("shows three sample bundles and opens the install guide modal", () => {
    render(<ShowcaseSurface copy={copy} />);

    expect(screen.getByTestId("showcase-surface")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Showcase" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "First-party sample cursor bundles you can download and install immediately."
      )
    ).toBeInTheDocument();

    const bundleLinks = screen.getAllByRole("link", { name: "Download bundle" });

    expect(bundleLinks).toHaveLength(3);
    expect(bundleLinks[0]).toHaveAttribute("href", showcaseSamples[0].bundleHref);
    expect(bundleLinks[1]).toHaveAttribute("href", showcaseSamples[1].bundleHref);
    expect(bundleLinks[2]).toHaveAttribute("href", showcaseSamples[2].bundleHref);

    fireEvent.click(screen.getByRole("button", { name: "View install guide" }));

    expect(
      screen.getByRole("heading", { level: 3, name: "Install your sample cursor bundle" })
    ).toBeInTheDocument();
    expect(screen.getByText("Unzip the downloaded file.")).toBeInTheDocument();
    expect(screen.getByText("restore-default.inf")).toBeInTheDocument();
  });
});

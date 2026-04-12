import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ShowcaseSurface, {
  type ShowcaseCopy,
} from "@/components/landing/ShowcaseSurface";
import { showcaseSamples } from "@/lib/showcaseSamples";

const { trackEventMock } = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

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
    step3: 'Open Settings > Mouse > Additional mouse settings > Pointers tab.',
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
} satisfies ShowcaseCopy;

describe("ShowcaseSurface", () => {
  beforeEach(() => {
    trackEventMock.mockReset();
  });

  it("shows three sample bundles and opens the install guide modal", () => {
    render(<ShowcaseSurface copy={copy} />);

    expect(screen.getByTestId("showcase-surface")).toBeInTheDocument();
    expect(screen.getByTestId("showcase-surface")).toHaveAttribute("id", "showcase");
    expect(screen.getByRole("heading", { level: 2, name: "Showcase" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "First-party sample cursor bundles you can download and install immediately."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Each bundle includes .cur, install.inf, and restore-default.inf so you can install it on Windows and roll back later."
      )
    ).toBeInTheDocument();

    const bundleLinks = screen.getAllByRole("link", { name: "Download bundle" });

    expect(bundleLinks).toHaveLength(3);
    expect(bundleLinks[0]).toHaveAttribute("href", showcaseSamples[0].bundleHref);
    expect(bundleLinks[1]).toHaveAttribute("href", showcaseSamples[1].bundleHref);
    expect(bundleLinks[2]).toHaveAttribute("href", showcaseSamples[2].bundleHref);
    expect(screen.getByRole("link", { name: "Open studio" })).toHaveAttribute(
      "href",
      "/studio"
    );

    fireEvent.click(bundleLinks[0]);

    expect(trackEventMock).toHaveBeenCalledWith("sample_bundle_downloaded", {
      sample_id: showcaseSamples[0].id,
      source: "landing",
    });

    fireEvent.click(screen.getByRole("button", { name: "View install guide" }));

    const dialog = screen.getByRole("dialog");

    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Install guide")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    expect(
      screen.getByRole("heading", { level: 3, name: "Install your sample cursor bundle" })
    ).toBeInTheDocument();
    expect(screen.getByText("Unzip the downloaded file.")).toBeInTheDocument();
    expect(screen.getByText("restore-default.inf")).toBeInTheDocument();
    expect(trackEventMock).toHaveBeenCalledWith("install_guide_opened", {
      source: "showcase_surface",
    });

    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

import React from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { trackEventMock } = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

import ExplorePageSurface from "@/components/explore/ExplorePageSurface";

describe("explore analytics events", () => {
  beforeEach(() => {
    trackEventMock.mockReset();
  });

  it("tracks explore entry when the surface mounts", () => {
    render(
      <ExplorePageSurface
        title="Explore"
        sub="Browse curated Pointint samples."
        showcase={{
          eyebrow: "Showcase",
          title: "Showcase",
          sub: "Sample bundles.",
          installStripTitle: "Install summary",
          installStripBody: "Body",
          installStripCta: "View install guide",
          studioCta: "Open studio",
          installGuide: {
            eyebrow: "Install guide",
            title: "Install your sample cursor bundle",
            close: "Close",
            step1: "One",
            step2: "Two",
            step3: "Three",
            step4: "Four",
            restore: "Restore",
            restoreFile: "restore-default.inf",
            restoreAction: "Install",
            gotIt: "Got it",
          },
          samples: [],
        }}
      />
    );

    expect(trackEventMock).toHaveBeenCalledWith("explore_opened", {
      source: "explore_page",
    });
  });
});

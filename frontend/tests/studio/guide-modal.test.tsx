import React from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import GuideModal from "@/components/GuideModal";

const { trackEventMock } = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

const messages = {
  guide: {
    downloaded: "Download complete",
    title: "Apply your cursor",
    aniTitle: "Apply your animated cursor",
    close: "Close",
    step1: "Unzip the downloaded file",
    step2: "Right-click install.inf then choose Install",
    step3: "Open Settings > Mouse > Additional mouse settings > Pointers tab",
    step4: 'Select "Pointint" from the Scheme dropdown and click OK',
    aniStep1: "Open Settings > Mouse > Additional mouse settings > Pointers tab",
    aniStep2: 'Select a cursor role and choose "Browse"',
    aniStep3: "Pick the downloaded .ani file",
    aniStep4: 'Save the scheme if you want to reuse it later',
    restore: "To restore the default cursor, right-click",
    restoreFile: "restore-default.inf",
    restoreAction: 'then choose "Install"',
    gotIt: "Got it",
    exploreCta: "Open Explore",
  },
};

describe("GuideModal", () => {
  beforeEach(() => {
    trackEventMock.mockReset();
  });

  it("renders as a viewport-safe dialog with an explore link", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <GuideModal open={true} onClose={() => {}} />
      </NextIntlClientProvider>
    );

    const dialog = screen.getByRole("dialog", { name: "Apply your cursor" });

    expect(dialog).toHaveStyle({
      boxSizing: "border-box",
      width: "min(28rem, calc(100vw - 2rem))",
      maxHeight: "calc(100vh - 2rem)",
      overflowY: "auto",
    });
    expect(screen.getByRole("link", { name: "Open Explore" })).toHaveAttribute(
      "href",
      "/explore"
    );
    expect(trackEventMock).toHaveBeenCalledWith("install_guide_opened", {
      source: "studio_download",
      variant: "cur",
    });
  });

  it("renders ANI-specific guidance when requested", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <GuideModal open={true} onClose={() => {}} variant="ani" />
      </NextIntlClientProvider>
    );

    expect(
      screen.getByRole("dialog", { name: "Apply your animated cursor" })
    ).toBeInTheDocument();
    expect(screen.getByText('Select a cursor role and choose "Browse"')).toBeInTheDocument();
    expect(screen.queryByText("restore-default.inf")).toBeNull();
    expect(trackEventMock).toHaveBeenCalledWith("install_guide_opened", {
      source: "studio_download",
      variant: "ani",
    });
  });
});

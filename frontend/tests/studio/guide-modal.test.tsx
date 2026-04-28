import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
    packageTitle: "Apply your cursor set",
    title: "Apply your cursor",
    aniTitle: "Apply your animated cursor",
    close: "Close",
    step1: "Extract the downloaded ZIP",
    step2: "Right-click install.inf then choose Install",
    step3: "Open Settings > Mouse > Additional mouse settings > Pointers tab",
    step4: 'Select "Pointint" from the Scheme dropdown, then click OK',
    aniStep1: "Open Settings > Mouse > Additional mouse settings > Pointers tab",
    aniStep2: 'Select a cursor role and choose "Browse"',
    aniStep3: "Pick the downloaded .ani file",
    aniStep4: 'Save the scheme if you want to reuse it later',
    curStep1: "Open Settings > Mouse > Additional mouse settings > Pointers tab",
    curStep2: 'Select a cursor role and choose "Browse"',
    curStep3: "Pick the downloaded .cur file",
    curStep4: 'Save the scheme if you want to reuse it later',
    restore: "To remove the Pointint pointer set from the list, right-click",
    restoreFile: "restore-default.inf",
    restoreAction:
      'then choose "Install". If Pointint is active, switch to Windows Default in pointer settings.',
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

    const dialog = screen.getByRole("dialog", { name: "Apply your cursor set" });

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
      variant: "package",
    });
  });

  it("tracks the post-download Explore CTA", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <GuideModal open={true} onClose={() => {}} variant="ani" />
      </NextIntlClientProvider>
    );

    const exploreLink = screen.getByRole("link", { name: "Open Explore" });
    exploreLink.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(exploreLink);

    expect(trackEventMock).toHaveBeenCalledWith("post_download_cta_clicked", {
      cta: "explore",
      target: "/explore",
      variant: "ani",
    });
  });

  it("renders CUR-specific guidance without ZIP steps", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <GuideModal open={true} onClose={() => {}} variant="cur" />
      </NextIntlClientProvider>
    );

    expect(
      screen.getByRole("dialog", { name: "Apply your cursor" })
    ).toBeInTheDocument();
    expect(screen.getByText("Pick the downloaded .cur file")).toBeInTheDocument();
    expect(screen.queryByText("Extract the downloaded ZIP")).toBeNull();
    expect(screen.queryByText("restore-default.inf")).toBeNull();
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

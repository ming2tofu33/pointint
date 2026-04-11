import React from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import GuideModal from "@/components/GuideModal";

const messages = {
  guide: {
    downloaded: "Download complete",
    title: "Apply your cursor",
    close: "Close",
    step1: "Unzip the downloaded file",
    step2: "Right-click install.inf then choose Install",
    step3: "Open Settings > Mouse > Additional mouse settings > Pointers tab",
    step4: 'Select "Pointint" from the Scheme dropdown and click OK',
    restore: "To restore the default cursor, right-click",
    restoreFile: "restore-default.inf",
    restoreAction: 'then choose "Install"',
    gotIt: "Got it",
    exploreCta: "Open Explore",
  },
};

describe("GuideModal", () => {
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
  });
});

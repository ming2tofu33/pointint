import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "@/components/Header";

const mockUsePathname = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ refresh: mockRefresh }),
}));

const messages = {
  nav: {
    home: "Home",
    studio: "Studio",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    openUtilityMenu: "Open utility menu",
    closeUtilityMenu: "Close utility menu",
    language: "Language",
    english: "English",
    korean: "Korean",
    login: "Log in",
    comingSoon: "Coming soon",
  },
};

describe("Header", () => {
  beforeEach(() => {
    mockUsePathname.mockReset();
    mockRefresh.mockReset();
    document.cookie = "NEXT_LOCALE=en;path=/";
  });

  it("shows Home and Studio navigation with Home active on the landing page", () => {
    mockUsePathname.mockReturnValue("/");

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );

    const homeLink = screen.getByRole("link", { name: "Home" });
    const studioLink = screen.getByRole("link", { name: "Studio" });

    expect(homeLink).toHaveAttribute("href", "/");
    expect(studioLink).toHaveAttribute("href", "/studio");
    expect(homeLink).toHaveAttribute("aria-current", "page");
    expect(studioLink).not.toHaveAttribute("aria-current");
  });

  it("marks Studio active on the studio page", () => {
    mockUsePathname.mockReturnValue("/studio");

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );

    const studioLink = screen.getByRole("link", { name: "Studio" });
    expect(studioLink).toHaveAttribute("aria-current", "page");
  });

  it("opens the utility menu with explicit language options and a disabled login action", () => {
    mockUsePathname.mockReturnValue("/");

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open utility menu" })
    );

    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Korean" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeDisabled();
  });

  it("refreshes the page after choosing a locale from the utility menu", () => {
    mockUsePathname.mockReturnValue("/");

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open utility menu" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Korean" }));

    expect(document.cookie).toContain("NEXT_LOCALE=ko");
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});

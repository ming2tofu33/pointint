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
    tools: "Tools",
    guides: "Guides",
    explore: "Explore",
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

  it("uses the logo as the home link and shows content and product navigation", () => {
    mockUsePathname.mockReturnValue("/");

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );

    const toolsLink = screen.getByRole("link", { name: "Tools" });
    const guidesLink = screen.getByRole("link", { name: "Guides" });
    const exploreLink = screen.getByRole("link", { name: "Explore" });
    const studioLink = screen.getByRole("link", { name: "Studio" });
    const logoLink = screen.getByRole("link", { name: "poin+tint" });

    expect(logoLink).toHaveAttribute("href", "/");
    expect(toolsLink).toHaveAttribute("href", "/tools");
    expect(guidesLink).toHaveAttribute("href", "/guides");
    expect(exploreLink).toHaveAttribute("href", "/explore");
    expect(studioLink).toHaveAttribute("href", "/studio");
    expect(screen.queryByRole("link", { name: "Home" })).toBeNull();
    expect(toolsLink).not.toHaveAttribute("aria-current");
    expect(guidesLink).not.toHaveAttribute("aria-current");
    expect(exploreLink).not.toHaveAttribute("aria-current");
    expect(studioLink).not.toHaveAttribute("aria-current");
  });

  it("marks Tools active on tool detail pages", () => {
    mockUsePathname.mockReturnValue("/tools/image-to-cursor");

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );

    expect(screen.getByRole("link", { name: "Tools" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("marks Guides active on guide detail pages", () => {
    mockUsePathname.mockReturnValue("/guides/what-is-cursor-hotspot");

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );

    expect(screen.getByRole("link", { name: "Guides" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("marks Explore active on the explore page", () => {
    mockUsePathname.mockReturnValue("/explore");

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );

    const exploreLink = screen.getByRole("link", { name: "Explore" });
    expect(exploreLink).toHaveAttribute("aria-current", "page");
  });

  it("uses shared black-glass header tokens instead of landing-only tokens", () => {
    mockUsePathname.mockReturnValue("/studio");

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );

    const header = screen.getByRole("banner");
    const style = header.getAttribute("style") ?? "";

    expect(style).toContain("var(--app-header-border)");
    expect(style).toContain("var(--app-header-highlight)");
    expect(style).toContain("var(--app-header-backdrop)");
    expect(style).toContain("var(--app-header-shadow)");
    expect(style).not.toContain("--landing-header-backdrop");
  });

  it("defines a hover and focus underline for navigation links", () => {
    mockUsePathname.mockReturnValue("/");

    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );

    const styleTag = container.querySelector("style");
    const cssText = styleTag?.textContent ?? "";

    expect(cssText).toContain(".app-header-link:hover");
    expect(cssText).toContain(".app-header-link:focus-visible");
    expect(cssText).toContain(".app-header-link[aria-current=\"page\"]");
    expect(cssText).toContain("inset 0 -2px 0 var(--color-accent)");
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

  it("renders the utility menu on an opaque surface instead of reusing the translucent header backdrop", () => {
    mockUsePathname.mockReturnValue("/");

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open utility menu" })
    );

    const menu = screen.getByRole("menu");
    const style = menu.getAttribute("style") ?? "";

    expect(style).toContain("background-color: var(--color-bg-card)");
    expect(style).toContain("background-image:");
    expect(style).not.toContain("var(--app-header-backdrop)");
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

  it("uses a profile icon for the utility trigger instead of the ellipsis icon", () => {
    mockUsePathname.mockReturnValue("/");

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );

    const trigger = screen.getByRole("button", { name: "Open utility menu" });
    const icon = trigger.querySelector("svg");

    expect(icon?.querySelectorAll("path")).toHaveLength(2);
    expect(icon?.querySelector("circle")).toBeNull();
  });
});

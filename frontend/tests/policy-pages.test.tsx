import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const messages = {
  policy: {
    privacyTitle: "Privacy Policy",
    privacyBody: "Privacy body",
    cookieTitle: "Cookie Policy",
    cookieBody: "Cookie body",
    termsTitle: "Terms of Service",
    termsBody: "Terms body",
  },
};

vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: keyof typeof messages) => {
    const scoped = messages[namespace];
    return (key: string) => scoped[key as keyof typeof scoped] ?? key;
  },
}));

import PrivacyPage from "@/app/privacy/page";
import CookiePolicyPage from "@/app/cookie-policy/page";
import TermsPage from "@/app/terms/page";

describe("policy pages", () => {
  it("renders the privacy page", async () => {
    render(await PrivacyPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Privacy Policy" })
    ).toBeInTheDocument();
    expect(screen.getByText("Privacy body")).toBeInTheDocument();
  });

  it("renders the cookie policy page", async () => {
    render(await CookiePolicyPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Cookie Policy" })
    ).toBeInTheDocument();
    expect(screen.getByText("Cookie body")).toBeInTheDocument();
  });

  it("renders the terms page", async () => {
    render(await TermsPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Terms of Service" })
    ).toBeInTheDocument();
    expect(screen.getByText("Terms body")).toBeInTheDocument();
  });
});

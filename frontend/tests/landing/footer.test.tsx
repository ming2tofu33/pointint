import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Footer from "@/components/landing/Footer";

describe("Footer", () => {
  it("renders a policy group with privacy, cookie, and terms links", () => {
    render(
      <Footer
        tagline="Your Point, Your Tint."
        policyLabel="Policy"
        privacyLabel="Privacy Policy"
        cookieLabel="Cookie Policy"
        termsLabel="Terms of Service"
      />
    );

    expect(screen.getByText("Policy")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Privacy Policy" })
    ).toHaveAttribute("href", "/privacy");
    expect(
      screen.getByRole("link", { name: "Cookie Policy" })
    ).toHaveAttribute("href", "/cookie-policy");
    expect(
      screen.getByRole("link", { name: "Terms of Service" })
    ).toHaveAttribute("href", "/terms");
  });
});

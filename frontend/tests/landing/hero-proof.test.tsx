import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Hero from "@/components/landing/Hero";

describe("Hero", () => {
  it("prioritizes proof over decorative copy", () => {
    render(
      <Hero
        copy={{
          logo: "poin+tint",
          tagline: "Your Point,\nYour Tint.",
          sub: "좋아하는 이미지를 Windows에서 바로 쓸 수 있는 커서로 바꿔보세요.",
          cta: "이미지로 시작하기",
          proofLabel: "From image to cursor",
          proofSourceAlt: "Landing proof source",
          proofCursorAlt: "Landing proof cursor result",
          proofSourceCaption: "Source image",
          proofCursorCaption: "Cursor result",
        }}
      />
    );

    const heading = screen.getByRole("heading", {
      level: 1,
      name: /Your Point,\s*Your Tint\./,
    });

    expect(heading).toBeInTheDocument();
    expect(heading).toHaveStyle({ whiteSpace: "pre-line" });
    expect(heading.textContent).toContain("\n");
    expect(screen.getByAltText("Landing proof source")).toBeInTheDocument();
    expect(
      screen.getByAltText("Landing proof cursor result")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "이미지로 시작하기" })
    ).toBeInTheDocument();
  });
});

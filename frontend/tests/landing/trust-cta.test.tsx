import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TrustCTA from "@/components/landing/TrustCTA";

describe("TrustCTA", () => {
  it("uses compact facts instead of a FAQ-heavy layout", () => {
    render(
      <TrustCTA
        copy={{
          title: "지금 바로\n써볼 수 있는 이유",
          facts: [
            "PNG, JPG, WebP 지원",
            "Windows용 .cur 다운로드",
            "무료로 시작 가능",
            "적용 가이드 제공",
          ],
          cta: "이미지로 시작하기",
        }}
      />
    );

    const heading = screen.getByRole("heading", {
      level: 2,
      name: /지금 바로\s*써볼 수 있는 이유/,
    });

    expect(heading).toHaveStyle({ whiteSpace: "pre-line" });
    expect(heading.textContent).toContain("\n");
    expect(screen.getByText("PNG, JPG, WebP 지원")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "이미지로 시작하기" })
    ).toBeInTheDocument();
    expect(
      screen.queryByText("커서를 어떻게 만들 수 있나요?")
    ).not.toBeInTheDocument();
  });
});

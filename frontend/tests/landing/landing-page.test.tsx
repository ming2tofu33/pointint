import React from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import LandingPage from "@/components/landing/LandingPage";

const copy = {
  hero: {
    logo: "poin+tint",
    tagline: "Your Point, Your Tint.",
    sub: "좋아하는 이미지를 Windows에서 바로 쓸 수 있는 커서로 바꿔보세요.",
    cta: "이미지로 시작하기",
    proofLabel: "From image to cursor",
    proofSourceAlt: "Landing proof source",
    proofCursorAlt: "Landing proof cursor result",
    proofSourceCaption: "Source image",
    proofCursorCaption: "Cursor result",
  },
  workflow: {
    title: "업로드",
    sub: "이미지를 올리고 커서를 다듬은 뒤 바로 적용해보세요.",
    steps: [
      {
        title: "업로드",
        sub: "PNG, JPG, WebP 이미지를 바로 시작점으로 가져옵니다.",
      },
      {
        title: "다듬기",
        sub: "배경을 정리하고 위치와 핫스팟을 정돈합니다.",
      },
      {
        title: "확인하고 적용",
        sub: "미리 본 뒤 .cur 파일로 내려받아 바로 적용합니다.",
      },
    ],
  },
  mood: {
    eyebrow: "Pointint for 모니테리어",
    title: "커서에서 시작되는 화면의 분위기",
    sub: "Pointint는 작은 포인터에서부터 화면의 표정을 바꾸는 경험을 만듭니다.",
  },
  trust: {
    title: "Windows 커서 적용까지 한 번에",
    facts: [
      "PNG, JPG, WebP 지원",
      "Windows용 .cur 다운로드",
      "무료로 시작 가능",
      "적용 가이드 제공",
    ],
    cta: "이미지로 시작하기",
  },
  footer: {
    tagline: "Your Point, Your Tint.",
  },
};

describe("LandingPage", () => {
  it("renders the four-section landing shell with two CTA links", () => {
    render(
      <NextIntlClientProvider
        locale="ko"
        messages={{ nav: { studio: "스튜디오" } }}
      >
        <LandingPage copy={copy} />
      </NextIntlClientProvider>
    );

    expect(screen.getByTestId("hero-proof")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-surface")).toBeInTheDocument();
    expect(screen.getByTestId("mood-glimpse")).toBeInTheDocument();
    expect(screen.getByTestId("landing-trust")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "이미지로 시작하기" })
    ).toHaveLength(2);
  });
});

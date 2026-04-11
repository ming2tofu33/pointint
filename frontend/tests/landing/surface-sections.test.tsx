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
    title: "세 단계면\n충분합니다",
    sub: "이미지를 올리고, 다듬고, 확인한 뒤 바로 Windows에 적용하세요.",
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
    title: "작은 포인터에서부터\n화면의 분위기가 달라집니다",
    sub: "커서로 시작하지만, Pointint는 더 넓은 데스크톱 오브젝트 감각으로 이어집니다.",
  },
  trust: {
    title: "지금 바로\n써볼 수 있는 이유",
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

describe("LandingPage surfaces", () => {
  it("places workflow and mood sections on atmospheric page surfaces", () => {
    render(
      <NextIntlClientProvider locale="ko" messages={{ nav: { studio: "스튜디오" } }}>
        <LandingPage copy={copy} />
      </NextIntlClientProvider>
    );

    expect(screen.getByTestId("workflow-surface")).toHaveAttribute(
      "data-surface-mode",
      "page"
    );
    expect(screen.getByText("업로드")).toBeInTheDocument();
    expect(screen.getByText("다듬기")).toBeInTheDocument();
    expect(screen.getByText("확인하고 적용")).toBeInTheDocument();
    expect(screen.getByTestId("mood-glimpse")).toHaveAttribute(
      "data-surface-mode",
      "page"
    );

    const workflowHeading = screen.getByRole("heading", {
      level: 2,
      name: /세 단계면\s*충분합니다/,
    });
    const moodHeading = screen.getByRole("heading", {
      level: 2,
      name: /작은 포인터에서부터\s*화면의 분위기가 달라집니다/,
    });

    expect(workflowHeading).toHaveStyle({ whiteSpace: "pre-line" });
    expect(moodHeading).toHaveStyle({ whiteSpace: "pre-line" });
    expect(workflowHeading.textContent).toContain("\n");
    expect(moodHeading.textContent).toContain("\n");
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import LandingPage, { type LandingCopy } from "@/components/landing/LandingPage";
import { showcaseSamples } from "@/lib/showcaseSamples";

const showcaseSampleCopy = [
  {
    title: "Aurora Glass",
    description: "부드럽고 유리 같은 느낌의 포인터 번들입니다.",
    badge: "사용 가능",
    downloadLabel: "번들 다운로드",
    previewLabel: "Aurora Glass 샘플 미리보기",
  },
  {
    title: "Studio Signal",
    description: "선명한 빨간 포인트와 안정적인 움직임을 가진 커서 번들입니다.",
    badge: "사용 가능",
    downloadLabel: "번들 다운로드",
    previewLabel: "Studio Signal 샘플 미리보기",
  },
  {
    title: "Night Orbit",
    description: "차분한 빛과 원형 궤적 느낌을 가진 어두운 샘플 번들입니다.",
    badge: "사용 가능",
    downloadLabel: "번들 다운로드",
    previewLabel: "Night Orbit 샘플 미리보기",
  },
];

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
  showcase: {
    eyebrow: "쇼케이스",
    title: "쇼케이스",
    sub: "Pointint 팀이 직접 준비한 샘플 커서 번들을 바로 내려받아 설치할 수 있습니다.",
    installStripTitle: "설치 요약",
    installStripBody:
      "각 번들은 .cur, install.inf, restore-default.inf를 함께 담아 바로 설치하고 나중에 복원할 수 있습니다.",
    installStripCta: "설치 안내 보기",
    studioCta: "스튜디오 열기",
    installGuide: {
      eyebrow: "설치 안내",
      title: "샘플 커서 번들 설치하기",
      close: "닫기",
      step1: "압축을 풉니다.",
      step2: "install.inf를 우클릭한 뒤 설치를 선택합니다.",
      step3: "설정 > 마우스 > 추가 마우스 설정 > 포인터 탭을 엽니다.",
      step4: "구성표에서 Pointint를 선택하고 확인을 누릅니다.",
      restore: "기본 커서로 복원하려면",
      restoreFile: "restore-default.inf",
      restoreAction: "를 설치합니다.",
      gotIt: "확인",
    },
    samples: showcaseSamples.map((sample, index) => ({
      ...sample,
      ...showcaseSampleCopy[index],
    })),
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
} satisfies LandingCopy;

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

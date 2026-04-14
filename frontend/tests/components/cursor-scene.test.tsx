import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const SIMULATION_TRANSLATIONS: Record<string, string> = {
  browserAddress: "docs.pointtint.com/windows/cursor-theme",
  browserTabDocumentation: "설치 가이드",
  browserTabDownloads: "다운로드",
  browserTabSupport: "지원",
  browserTitleInstallTheme: "커서 테마 설치하기",
  browserBodyInstallTheme:
    "마우스 설정을 열고 포인터 탭에서 Pointtint가 내보낸 파일로 기본 구성을 바꾸세요.",
  browserBadgeWindows11: "Windows 11",
  browserBadgeSetupTime: "설정 4분",
  browserQuickActions: "빠른 작업",
  browserOpenCursorSettings: "커서 설정 열기",
  browserApplyTheme: "테마 적용",
  browserSearchSettings: "설정 검색",
  browserSearchValue: "포인터 구성표",
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => SIMULATION_TRANSLATIONS[key] ?? key,
}));

import CursorScene from "@/components/CursorScene";

describe("CursorScene", () => {
  it("renders simulation copy through translation keys", () => {
    render(<CursorScene />);

    expect(screen.getByText("설치 가이드")).not.toBeNull();
    expect(screen.getByText("다운로드")).not.toBeNull();
    expect(screen.getByText("지원")).not.toBeNull();
    expect(screen.getByText("커서 테마 설치하기")).not.toBeNull();
    expect(screen.getByText("빠른 작업")).not.toBeNull();
    expect(screen.getByDisplayValue("포인터 구성표")).not.toBeNull();
  });
});

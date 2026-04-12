import React from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { trackEventMock, useStudioMock, searchParamsState, replaceMock } =
  vi.hoisted(() => ({
    trackEventMock: vi.fn(),
    useStudioMock: vi.fn(),
    searchParamsState: {
      current: new URLSearchParams(""),
    },
    replaceMock: vi.fn(),
  }));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParamsState.current,
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

vi.mock("@/lib/landingStore", () => ({
  getLandingFile: vi.fn(),
  clearLandingFile: vi.fn(),
}));

vi.mock("@/lib/useStudio", () => ({
  useStudio: useStudioMock,
}));

vi.mock("@/components/WorkflowPicker", () => ({
  default: () => <div data-testid="workflow-picker" />,
}));

vi.mock("@/components/UploadZone", () => ({
  default: () => <div data-testid="upload-zone" />,
}));

vi.mock("@/components/MobileGuard", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/StudioBar", () => ({
  default: () => <div data-testid="studio-bar" />,
}));

vi.mock("@/components/CursorCanvas", () => ({
  default: () => <div data-testid="cursor-canvas" />,
}));

vi.mock("@/components/GuideModal", () => ({
  default: () => null,
}));

vi.mock("@/components/HealthCheck", () => ({
  default: () => null,
}));

vi.mock("@/components/Simulation", () => ({
  default: () => null,
}));

vi.mock("@/components/NameInput", () => ({
  default: () => <input data-testid="name-input" />,
}));

import StudioPage from "@/app/studio/page";

describe("StudioPage analytics", () => {
  beforeEach(() => {
    trackEventMock.mockReset();
    searchParamsState.current = new URLSearchParams("");
    replaceMock.mockReset();

    useStudioMock.mockReturnValue({
      state: "workflow-pick",
      cursor: null,
      error: null,
      downloading: false,
      showGuide: false,
      showOriginal: false,
      previewUrl: null,
      selectFile: vi.fn(),
      selectWorkflow: vi.fn(),
      processBgRemoval: vi.fn(),
      skipBgRemoval: vi.fn(),
      toggleOriginal: vi.fn(),
      retryBgRemoval: vi.fn(),
      setHotspot: vi.fn(),
      setOffset: vi.fn(),
      setScale: vi.fn(),
      setFitMode: vi.fn(),
      setCursorSize: vi.fn(),
      setCursorName: vi.fn(),
      recommendHotspot: vi.fn(),
      reset: vi.fn(),
      download: vi.fn(),
      closeGuide: vi.fn(),
    });
  });

  it("tracks a studio entry when the page mounts", () => {
    render(<StudioPage />);

    expect(trackEventMock).toHaveBeenCalledWith("studio_entry", {
      source: "studio_page",
    });
  });
});

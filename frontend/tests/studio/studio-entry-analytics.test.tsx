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

vi.mock("@/components/StudioHeaderControls", () => ({
  default: () => <div data-testid="studio-header-controls" />,
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
import { createCursorThemeProject } from "@/lib/cursorThemeProject";

describe("StudioPage analytics", () => {
  beforeEach(() => {
    trackEventMock.mockReset();
    searchParamsState.current = new URLSearchParams("");
    replaceMock.mockReset();

    useStudioMock.mockReturnValue({
      state: "editing",
      project: createCursorThemeProject(),
      selectedSlotId: "normalSelect",
      editingSlotId: "normalSelect",
      cursor: null,
      ani: null,
      error: null,
      downloading: false,
      showGuide: false,
      downloadGuideVariant: "package",
      showOriginal: false,
      previewUrl: null,
      pendingBackgroundRemovalSlotIds: [],
      selectFile: vi.fn(),
      selectAniFile: vi.fn(),
      selectVideoFile: vi.fn(),
      selectSlot: vi.fn(),
      selectSelectedSlotStaticFile: vi.fn(),
      selectSelectedSlotAnimatedFile: vi.fn(),
      selectSelectedSlotVideoFile: vi.fn(),
      selectSelectedSlotImageSequenceFiles: vi.fn(),
      selectAniFrame: vi.fn(),
      deleteAniFrame: vi.fn(),
      moveAniFrame: vi.fn(),
      reorderAniFrame: vi.fn(),
      insertAniFrameFiles: vi.fn(),
      setAniFrameDuration: vi.fn(),
      setAllAniFrameDurations: vi.fn(),
      setSelectedAniFrameEditOverride: vi.fn(),
      resetSelectedAniFrameEdit: vi.fn(),
      processBgRemoval: vi.fn(),
      skipBgRemoval: vi.fn(),
      toggleOriginal: vi.fn(),
      retryBgRemoval: vi.fn(),
      setHotspot: vi.fn(),
      setOffset: vi.fn(),
      setScale: vi.fn(),
      setFitMode: vi.fn(),
      applyImageTransform: vi.fn(),
      setCursorSize: vi.fn(),
      setAniCursorSize: vi.fn(),
      setCursorName: vi.fn(),
      recommendHotspot: vi.fn(),
      endContinuousHistoryAction: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: false,
      canRedo: false,
      reset: vi.fn(),
      canDownloadAll: false,
      canDownload: false,
      canDownloadGif: false,
      downloadAll: vi.fn(),
      download: vi.fn(),
      downloadGif: vi.fn(),
      closeGuide: vi.fn(),
    });
  });

  it("tracks a studio entry when the page mounts", () => {
    render(<StudioPage />);

    expect(trackEventMock).toHaveBeenCalledWith("studio_entry", {
      source: "studio_page",
    });
  });

  it("tracks workflow-targeted studio entries from tool CTAs", () => {
    searchParamsState.current = new URLSearchParams(
      "workflow=ani-animated-gif"
    );

    render(<StudioPage />);

    expect(trackEventMock).toHaveBeenCalledWith("studio_entry", {
      source: "studio_page",
      workflow: "ani-animated-gif",
    });
  });

  it("tracks Video to ANI workflow-targeted studio entries", () => {
    searchParamsState.current = new URLSearchParams(
      "workflow=ani-video-to-ani"
    );

    render(<StudioPage />);

    expect(trackEventMock).toHaveBeenCalledWith("studio_entry", {
      source: "studio_page",
      workflow: "ani-video-to-ani",
    });
  });
});

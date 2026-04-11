// @vitest-environment jsdom

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type StudioState } from "../../src/lib/studioWorkflow";

const {
  WorkflowPickerMock,
  UploadZoneMock,
  MobileGuardMock,
  StudioBarMock,
  useStudioMock,
  replaceMock,
  getLandingFileMock,
  clearLandingFileMock,
  selectFileMock,
  selectWorkflowMock,
  searchParamsState,
} = vi.hoisted(() => ({
  WorkflowPickerMock: vi.fn(() => <div data-testid="workflow-picker" />),
  UploadZoneMock: vi.fn(() => <div data-testid="upload-zone" />),
  MobileGuardMock: vi.fn(
    ({ children }: { children: React.ReactNode }) => <>{children}</>
  ),
  StudioBarMock: vi.fn(() => <div data-testid="studio-bar" />),
  useStudioMock: vi.fn(),
  replaceMock: vi.fn(),
  getLandingFileMock: vi.fn(),
  clearLandingFileMock: vi.fn(),
  selectFileMock: vi.fn(),
  selectWorkflowMock: vi.fn(),
  searchParamsState: {
    current: new URLSearchParams(""),
  },
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

vi.mock("../../src/lib/landingStore", () => ({
  getLandingFile: getLandingFileMock,
  clearLandingFile: clearLandingFileMock,
}));

vi.mock("../../src/lib/useStudio", () => ({
  useStudio: useStudioMock,
}));

vi.mock("../../src/components/WorkflowPicker", () => ({
  WorkflowPicker: WorkflowPickerMock,
}));

vi.mock("../../src/components/UploadZone", () => ({
  default: UploadZoneMock,
}));

vi.mock("../../src/components/MobileGuard", () => ({
  default: MobileGuardMock,
}));

vi.mock("../../src/components/StudioBar", () => ({
  default: StudioBarMock,
}));

vi.mock("../../src/components/CursorCanvas", () => ({
  default: () => <div data-testid="cursor-canvas" />,
}));

vi.mock("../../src/components/GuideModal", () => ({
  default: () => null,
}));

vi.mock("../../src/components/HealthCheck", () => ({
  default: () => null,
}));

vi.mock("../../src/components/Simulation", () => ({
  default: () => null,
}));

vi.mock("../../src/components/NameInput", () => ({
  default: () => <input data-testid="name-input" />,
}));

vi.mock("../../src/components/SettingsBar", () => ({
  default: () => null,
}));

import StudioPage from "../../src/app/studio/page";

function renderStudio(state: StudioState) {
  useStudioMock.mockReturnValue({
    state,
    cursor: null,
    error: null,
    downloading: false,
    showGuide: false,
    showOriginal: false,
    previewUrl: null,
    selectFile: selectFileMock,
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
    reset: vi.fn(),
    download: vi.fn(),
    closeGuide: vi.fn(),
    rendered: null,
    selectWorkflow: selectWorkflowMock,
  });

  return render(<StudioPage />);
}

beforeEach(() => {
  WorkflowPickerMock.mockClear();
  UploadZoneMock.mockClear();
  MobileGuardMock.mockClear();
  StudioBarMock.mockClear();
  useStudioMock.mockReset();
  selectFileMock.mockReset();
  selectWorkflowMock.mockReset();
  replaceMock.mockReset();
  getLandingFileMock.mockReset();
  clearLandingFileMock.mockReset();
  searchParamsState.current = new URLSearchParams("");
});

afterEach(() => {
  cleanup();
});

describe("Studio entry gate", () => {
  it("renders the workflow picker first and passes through workflow selection", () => {
    renderStudio("workflow-pick");

    expect(screen.getByTestId("workflow-picker")).not.toBeNull();
    expect(screen.queryByTestId("upload-zone")).toBeNull();
    expect(WorkflowPickerMock).toHaveBeenCalledTimes(1);
    expect(WorkflowPickerMock.mock.calls[0][0].onSelectWorkflow).toBe(
      selectWorkflowMock
    );
  });

  it("renders the upload zone after the CUR workflow is selected", () => {
    renderStudio("cur-upload");

    expect(screen.getByTestId("upload-zone")).not.toBeNull();
    expect(screen.queryByTestId("workflow-picker")).toBeNull();
    expect(UploadZoneMock).toHaveBeenCalledTimes(1);

    const uploadProps = UploadZoneMock.mock.calls[0][0];
    expect(uploadProps.onFile).toBe(selectFileMock);
    expect(uploadProps.processing).toBe(false);
    expect(uploadProps).not.toHaveProperty("showChoice");
    expect(uploadProps).not.toHaveProperty("previewUrl");
    expect(uploadProps).not.toHaveProperty("onRemoveBg");
    expect(uploadProps).not.toHaveProperty("onSkipBg");
  });

  it("preserves the landing handoff path when a file is staged", () => {
    const stagedFile = new File(["cursor"], "landing.png", {
      type: "image/png",
    });
    searchParamsState.current = new URLSearchParams("fromLanding=true");
    getLandingFileMock.mockReturnValue(stagedFile);

    renderStudio("workflow-pick");

    expect(selectFileMock).toHaveBeenCalledTimes(1);
    expect(selectFileMock).toHaveBeenCalledWith(stagedFile);
    expect(clearLandingFileMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/studio");
  });
});

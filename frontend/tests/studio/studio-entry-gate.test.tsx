import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type StudioState } from "@/lib/studioWorkflow";

const {
  UploadZoneMock,
  MobileGuardMock,
  StudioBarMock,
  SimulationMock,
  AniSimulationMock,
  useStudioMock,
  replaceMock,
  getLandingFileMock,
  clearLandingFileMock,
  selectFileMock,
  selectAniFileMock,
  selectSlotMock,
  selectSlotStaticFileMock,
  selectSlotAnimatedFileMock,
  searchParamsState,
} = vi.hoisted(() => ({
  UploadZoneMock: vi.fn(() => <div data-testid="upload-zone" />),
  MobileGuardMock: vi.fn(({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )),
  StudioBarMock: vi.fn(() => <div data-testid="studio-bar" />),
  SimulationMock: vi.fn(() => <div data-testid="simulation" />),
  AniSimulationMock: vi.fn(() => <div data-testid="ani-simulation" />),
  useStudioMock: vi.fn(),
  replaceMock: vi.fn(),
  getLandingFileMock: vi.fn(),
  clearLandingFileMock: vi.fn(),
  selectFileMock: vi.fn(),
  selectAniFileMock: vi.fn(),
  selectSlotMock: vi.fn(),
  selectSlotStaticFileMock: vi.fn(),
  selectSlotAnimatedFileMock: vi.fn(),
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

vi.mock("@/lib/landingStore", () => ({
  getLandingFile: getLandingFileMock,
  clearLandingFile: clearLandingFileMock,
}));

vi.mock("@/lib/useStudio", () => ({
  useStudio: useStudioMock,
}));

vi.mock("@/components/UploadZone", () => ({
  default: UploadZoneMock,
}));

vi.mock("@/components/MobileGuard", () => ({
  default: MobileGuardMock,
}));

vi.mock("@/components/StudioBar", () => ({
  default: StudioBarMock,
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
  default: SimulationMock,
}));

vi.mock("@/components/AniSimulation", () => ({
  default: AniSimulationMock,
}));

vi.mock("@/components/NameInput", () => ({
  default: () => <input data-testid="name-input" />,
}));

vi.mock("@/components/SettingsBar", () => ({
  default: () => null,
}));

import StudioPage from "@/app/studio/page";

function createEditingCursor(overrides: Record<string, unknown> = {}) {
  return {
    originalFile: new File(["cursor"], "cursor.png", { type: "image/png" }),
    originalUrl: "blob:original",
    processedUrl: "blob:processed",
    processedBlob: new Blob(["processed"], { type: "image/png" }),
    sourceWidth: 96,
    sourceHeight: 96,
    hotspotX: 24,
    hotspotY: 18,
    hotspotMode: "auto",
    renderedHotspotX: 3,
    renderedHotspotY: 2,
    renderedBlob: new Blob(["preview"], { type: "image/png" }),
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    fitMode: "contain",
    cursorSize: 32,
    cursorName: "cursor",
    ...overrides,
  };
}

function createAniAsset(overrides: Record<string, unknown> = {}) {
  return {
    originalFile: new File(["gif"], "orbit.gif", { type: "image/gif" }),
    originalUrl: "blob:ani-original",
    sourceWidth: 96,
    sourceHeight: 96,
    hotspotX: 24,
    hotspotY: 18,
    hotspotMode: "auto",
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    fitMode: "contain",
    cursorSize: 32,
    cursorName: "orbit",
    ...overrides,
  };
}

function createProject() {
  const slot = (id: "normal" | "text" | "link" | "button") => ({
    id,
    kind: null,
    asset: {
      fileName: null,
      originalUrl: null,
      previewUrl: null,
    },
    editing: {
      cursorName: id,
      cursorSize: 32,
      fitMode: "contain",
      hotspotMode: "auto",
      hotspotX: 0,
      hotspotY: 0,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    },
  });

  return {
    slots: {
      normal: slot("normal"),
      text: slot("text"),
      link: slot("link"),
      button: slot("button"),
    },
  };
}

function createStaticSlotAsset(
  id: "normal" | "text" | "link" | "button",
  previewUrl: string
) {
  return {
    id,
    kind: "static",
    asset: {
      fileName: `${id}.png`,
      originalUrl: `blob:${id}-original`,
      previewUrl,
    },
    editing: {
      cursorName: id,
      cursorSize: 32,
      fitMode: "contain",
      hotspotMode: "auto",
      hotspotX: 12,
      hotspotY: 8,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    },
  };
}

function createAnimatedSlotAsset(
  id: "normal" | "text" | "link" | "button",
  previewUrl: string
) {
  return {
    id,
    kind: "animated",
    asset: {
      fileName: `${id}.gif`,
      originalUrl: `blob:${id}-original`,
      previewUrl,
    },
    editing: {
      cursorName: id,
      cursorSize: 32,
      fitMode: "contain",
      hotspotMode: "auto",
      hotspotX: 12,
      hotspotY: 8,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    },
  };
}

function renderStudio(
  state: StudioState,
  options: {
    cursor?: Record<string, unknown> | null;
    ani?: Record<string, unknown> | null;
    selectedSlotId?: "normal" | "text" | "link" | "button";
    project?: ReturnType<typeof createProject>;
    previewUrl?: string | null;
  } = {}
) {
  const hasCursorOverride = Object.prototype.hasOwnProperty.call(options, "cursor");
  const hasAniOverride = Object.prototype.hasOwnProperty.call(options, "ani");

  const cursor =
    state === "editing" || state === "uploaded"
      ? hasCursorOverride
        ? options.cursor === null
          ? null
          : createEditingCursor(options.cursor ?? {})
        : createEditingCursor()
      : null;
  const ani =
    state === "ani-editing"
      ? hasAniOverride
        ? options.ani === null
          ? null
          : createAniAsset(options.ani ?? {})
        : createAniAsset()
      : null;

  useStudioMock.mockReturnValue({
    state,
    cursor,
    ani,
    project: options.project ?? createProject(),
    selectedSlotId: options.selectedSlotId ?? "normal",
    editingSlotId: options.selectedSlotId ?? "normal",
    error: null,
    downloading: false,
    showGuide: false,
    showOriginal: false,
    previewUrl: options.previewUrl ?? null,
    selectFile: selectFileMock,
    selectAniFile: selectAniFileMock,
    selectSelectedSlotStaticFile: selectSlotStaticFileMock,
    selectSelectedSlotAnimatedFile: selectSlotAnimatedFileMock,
    processBgRemoval: vi.fn(),
    skipBgRemoval: vi.fn(),
    toggleOriginal: vi.fn(),
    retryBgRemoval: vi.fn(),
    setHotspot: vi.fn(),
    setOffset: vi.fn(),
    setScale: vi.fn(),
    setFitMode: vi.fn(),
    setCursorSize: vi.fn(),
    setAniCursorSize: vi.fn(),
    setCursorName: vi.fn(),
    selectSlot: selectSlotMock,
    recommendHotspot: vi.fn(),
    reset: vi.fn(),
    download: vi.fn(),
    closeGuide: vi.fn(),
  });

  return render(<StudioPage />);
}

beforeEach(() => {
  UploadZoneMock.mockClear();
  MobileGuardMock.mockClear();
  StudioBarMock.mockClear();
  SimulationMock.mockClear();
  AniSimulationMock.mockClear();
  useStudioMock.mockReset();
  selectFileMock.mockReset();
  selectAniFileMock.mockReset();
  selectSlotMock.mockReset();
  selectSlotStaticFileMock.mockReset();
  selectSlotAnimatedFileMock.mockReset();
  replaceMock.mockReset();
  getLandingFileMock.mockReset();
  clearLandingFileMock.mockReset();
  searchParamsState.current = new URLSearchParams("");
});

afterEach(() => {
  cleanup();
});

describe("Studio entry gate", () => {
  it("renders the default slot source entry instead of the workflow picker", () => {
    renderStudio("editing", {
      cursor: null,
    });

    const themeScope = screen.getByTestId("studio-theme-scope");

    expect(themeScope).toHaveStyle({
      "--color-bg-primary": "var(--studio-bg-primary)",
      "--color-bg-secondary": "var(--studio-bg-secondary)",
      "--color-border": "var(--studio-border)",
    });
    expect(screen.getByTestId("studio-empty-slot-state")).not.toBeNull();
    expect(screen.getByText("emptySlotDescription")).not.toBeNull();
    expect(screen.getByRole("button", { name: "emptySlotStaticStart" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "emptySlotAnimatedStart" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "moreSourceOptions" })).not.toBeNull();
    expect(screen.getByText("dropOrClick")).not.toBeNull();
    expect(screen.getByText("aniDropOrClick")).not.toBeNull();
    expect(screen.getByText("formats")).not.toBeNull();
    expect(screen.getByText("aniFormats")).not.toBeNull();
    expect(screen.queryByTestId("studio-showcase-rail")).toBeNull();
    expect(screen.queryByTestId("upload-zone")).toBeNull();
    expect(screen.getByRole("button", { name: "emptySlotStaticStart" })).toHaveStyle({
      minHeight: "15rem",
    });
    expect(screen.getByRole("button", { name: "emptySlotAnimatedStart" })).toHaveStyle({
      minHeight: "15rem",
    });
  });

  it("renders an ANI editing shell with shared framing controls", () => {
    renderStudio("ani-editing");

    expect(screen.getByTestId("ani-editor-shell")).not.toBeNull();
    expect(screen.getByTestId("ani-editor-shell-workspace")).toHaveStyle({
      flexDirection: "column",
    });
    expect(screen.getByTestId("studio-simulation-footer")).not.toBeNull();
    expect(screen.queryByTestId("workflow-picker")).toBeNull();
    expect(screen.queryByTestId("upload-zone")).toBeNull();
    expect(StudioBarMock).toHaveBeenCalledTimes(1);

    const barProps = StudioBarMock.mock.calls[0][0];
    expect(barProps.actionLabel).toBe("exportAni");
    expect(barProps.onDownload).toBeDefined();
    expect(screen.getByText("actualSize")).not.toBeNull();
    expect(screen.getByRole("button", { name: "32" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "48" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "64" })).not.toBeNull();
    expect(screen.getByTestId("ani-simulation")).not.toBeNull();
  });

  it("preserves the landing handoff path when a file is staged", () => {
    const stagedFile = new File(["cursor"], "landing.png", {
      type: "image/png",
    });
    searchParamsState.current = new URLSearchParams("fromLanding=true");
    getLandingFileMock.mockReturnValue(stagedFile);

    renderStudio("editing", {
      cursor: null,
    });

    expect(selectFileMock).toHaveBeenCalledTimes(1);
    expect(selectFileMock).toHaveBeenCalledWith(stagedFile);
    expect(clearLandingFileMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/studio");
  });

  it("shows hotspot recommendation status and action in editing mode", () => {
    renderStudio("editing", {
      cursor: {
        hotspotMode: "auto",
      },
    });

    expect(screen.getAllByText("position").length).toBeGreaterThan(0);
    expect(screen.getByText("recommended")).not.toBeNull();
    expect(screen.getByText("recommendHotspotAgain")).not.toBeNull();
  });

  it("renders a slot rail in the studio shell for slot-based editing", () => {
    renderStudio("editing");

    expect(screen.getByTestId("slot-rail")).not.toBeNull();
  });

  it("shows an empty editor state when a non-populated slot is selected", () => {
    renderStudio("editing", {
      selectedSlotId: "text",
      cursor: null,
    });

    expect(screen.getByTestId("slot-text")).not.toBeNull();
    expect(screen.getByTestId("studio-empty-slot-state")).not.toBeNull();
    expect(screen.getByRole("button", { name: "emptySlotStaticStart" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "emptySlotAnimatedStart" })).not.toBeNull();
    expect(screen.queryByTestId("cursor-canvas")).toBeNull();
    expect(screen.queryByText("actualSize")).toBeNull();
    expect(StudioBarMock.mock.calls[0][0].canDownload).toBe(false);
  });

  it("reveals secondary source options inline for empty slots", () => {
    renderStudio("editing", {
      cursor: null,
    });

    fireEvent.click(screen.getByRole("button", { name: "moreSourceOptions" }));

    expect(screen.getByText("emptySlotMultiplePngs")).not.toBeNull();
    expect(screen.getAllByText("soon").length).toBeGreaterThan(0);
    expect(screen.getByText("emptySlotAiGenerate")).not.toBeNull();
  });

  it("accepts dropped files in the slot source entry cards", () => {
    const staticFile = new File(["static"], "cursor.png", { type: "image/png" });
    const animatedFile = new File(["animated"], "cursor.gif", { type: "image/gif" });

    renderStudio("editing", {
      cursor: null,
    });

    fireEvent.drop(screen.getByRole("button", { name: "emptySlotStaticStart" }), {
      dataTransfer: { files: [staticFile] },
    });
    fireEvent.drop(screen.getByRole("button", { name: "emptySlotAnimatedStart" }), {
      dataTransfer: { files: [animatedFile] },
    });

    expect(selectSlotStaticFileMock).toHaveBeenCalledWith(staticFile);
    expect(selectSlotAnimatedFileMock).toHaveBeenCalledWith(animatedFile);
  });

  it("highlights the slot source card on hover with the accent border", () => {
    renderStudio("editing", {
      cursor: null,
    });

    const staticButton = screen.getByRole("button", { name: "emptySlotStaticStart" });

    fireEvent.mouseEnter(staticButton);

    expect(staticButton).toHaveStyle({
      border: "1px solid color-mix(in srgb, var(--color-accent-primary) 56%, white 8%)",
    });
  });

  it("does not enable download when the normal slot has no bound asset", () => {
    renderStudio("editing", {
      selectedSlotId: "normal",
      cursor: null,
    });

    expect(StudioBarMock.mock.calls[0][0].canDownload).toBe(false);
  });

  it("keeps download disabled when only a non-normal slot is populated", () => {
    const project = createProject();
    project.slots.text = createStaticSlotAsset("text", "blob:text-preview");

    renderStudio("editing", {
      project,
      selectedSlotId: "text",
    });

    expect(StudioBarMock.mock.calls[0][0].canDownload).toBe(false);
  });

  it("passes slot simulation sources into the CUR simulation", () => {
    const project = createProject();
    project.slots.normal = createStaticSlotAsset("normal", "blob:normal-preview");
    project.slots.text = createStaticSlotAsset("text", "blob:text-preview");

    renderStudio("editing", {
      project,
      selectedSlotId: "normal",
      previewUrl: "blob:normal-active-preview",
    });

    const props = SimulationMock.mock.calls.at(-1)?.[0];
    expect(props?.slotSources?.normal).toBeTruthy();
    expect(props?.slotSources?.text).toBeTruthy();
  });

  it("passes slot simulation sources into the ANI simulation", () => {
    const project = createProject();
    project.slots.normal = createStaticSlotAsset("normal", "blob:normal-preview");
    project.slots.link = createAnimatedSlotAsset("link", "blob:link-preview");

    renderStudio("ani-editing", {
      project,
      selectedSlotId: "link",
    });

    const props = AniSimulationMock.mock.calls.at(-1)?.[0];
    expect(props?.slotSources?.normal).toBeTruthy();
    expect(props?.slotSources?.link).toBeTruthy();
    expect(props?.slotSources?.link?.kind).toBe("animated");
  });
});

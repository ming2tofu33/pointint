import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import en from "@/i18n/messages/en.json";
import ko from "@/i18n/messages/ko.json";
import {
  WORKFLOW_OPTIONS,
  isSelectableWorkflow,
  type StudioState,
} from "@/lib/studioWorkflow";

const STUDIO_TRANSLATIONS: Record<string, string> = {
  slotRailTitle: "Windows roles",
  slotRailMore: "Additional 7 cursors",
  slotRailConfigured: "configured",
  slotSelected: "Selected",
  recommended: "Recommended (t)",
  manual: "Manual (t)",
  slotFilled: "Configured",
  slotEmpty: "Empty",
  slotStatic: "Static",
  slotAnimated: "Animated",
  slotKindUnset: "Unset",
  slotNormalSelect: "Normal Select",
  slotNormalSelectHint: "Pointer on the desktop",
  slotTextSelect: "Text Select",
  slotTextSelectHint: "Text input area",
  slotLinkSelect: "Link Select",
  slotLinkSelectHint: "Link hover",
  slotBusy: "Busy",
  slotBusyHint: "Waiting cursor",
  slotWorkingInBackground: "Working in Background",
  slotWorkingInBackgroundHint: "Task continues in the background",
  slotUnavailable: "Unavailable",
  slotUnavailableHint: "Unavailable state",
  slotMove: "Move",
  slotMoveHint: "Move selection",
  slotHorizontalResize: "Horizontal Resize",
  slotHorizontalResizeHint: "Resize horizontally",
  slotVerticalResize: "Vertical Resize",
  slotVerticalResizeHint: "Resize vertically",
  slotDiagonalResize1: "Diagonal Resize 1",
  slotDiagonalResize1Hint: "Resize diagonally",
  slotDiagonalResize2: "Diagonal Resize 2",
  slotDiagonalResize2Hint: "Resize diagonally",
  emptySlotStatic: "Static image",
  emptySlotAnimated: "Animated GIF",
  emptySlotMore: "More options",
  emptySlotMultiplePngs: "GIF Maker",
  emptySlotAiGenerate: "AI generate",
  soon: "Soon",
  themeLight: "Light mode",
  themeDark: "Dark mode",
  themeModeSwitch: "simulation theme mode",
  downloadAllRoles: "Download all roles (t)",
  downloadCurrentSlot: "Download current slot (t)",
  backgroundPendingDownloadTitle: "Finish background choices",
  backgroundPendingDownloadSummary: "Pending slots",
  backgroundPendingDownloadAction: "Review slot",
  viewZoom: "View zoom",
  compactGuidanceTitle: "Compact guidance",
  backgroundDecisionCompactTitle: "Background removal pending",
  backgroundDecisionCompactSummary:
    "Choose whether to remove the background before entering the full editor.",
  backgroundDecisionTitle: "Background removal",
  backgroundDecisionSummary:
    "Decide whether this static cursor should keep its background before you continue editing.",
  backgroundDecisionHint:
    "Review the edge detail in the canvas, then choose the version you want to keep in the slot.",
  backgroundProcessingTitle: "Removing background",
  backgroundProcessingSummary:
    "Pointtint is preparing a transparent version of this image. Stay in the studio and keep reviewing the canvas.",
  imageSequenceMinimumError: "Select at least 2 PNG, JPG, or WebP frames.",
};

function humanizeStudioKey(key: string) {
  return (
    STUDIO_TRANSLATIONS[key] ??
    key
      .replace(/^studio\./, "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .replace(/\./g, " ")
      .trim()
      .toLowerCase()
  );
}

const {
  UploadZoneMock,
  MobileGuardMock,
  StudioBarMock,
  SimulationMock,
  AniSimulationMock,
  HealthCheckMock,
  useStudioMock,
  replaceMock,
  getLandingFileMock,
  clearLandingFileMock,
  selectFileMock,
  selectAniFileMock,
  selectSlotMock,
  selectSlotStaticFileMock,
  selectSlotAnimatedFileMock,
  selectSlotImageSequenceFilesMock,
  setOffsetMock,
  setHotspotMock,
  undoMock,
  redoMock,
  searchParamsState,
} = vi.hoisted(() => ({
  UploadZoneMock: vi.fn(() => <div data-testid="upload-zone" />),
  MobileGuardMock: vi.fn(({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )),
  StudioBarMock: vi.fn(() => <div data-testid="studio-bar" />),
  SimulationMock: vi.fn(() => <div data-testid="simulation" />),
  AniSimulationMock: vi.fn(() => <div data-testid="ani-simulation" />),
  HealthCheckMock: vi.fn(() => <div data-testid="health-check" />),
  useStudioMock: vi.fn(),
  replaceMock: vi.fn(),
  getLandingFileMock: vi.fn(),
  clearLandingFileMock: vi.fn(),
  selectFileMock: vi.fn(),
  selectAniFileMock: vi.fn(),
  selectSlotMock: vi.fn(),
  selectSlotStaticFileMock: vi.fn(),
  selectSlotAnimatedFileMock: vi.fn(),
  selectSlotImageSequenceFilesMock: vi.fn(),
  setOffsetMock: vi.fn(),
  setHotspotMock: vi.fn(),
  undoMock: vi.fn(),
  redoMock: vi.fn(),
  searchParamsState: {
    current: new URLSearchParams(""),
  },
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => humanizeStudioKey(key),
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
  default: HealthCheckMock,
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

const windowsRoleIds = [
  "normalSelect",
  "textSelect",
  "linkSelect",
  "busy",
  "workingInBackground",
  "unavailable",
  "move",
  "horizontalResize",
  "verticalResize",
  "diagonalResize1",
  "diagonalResize2",
] as const;

type WindowsRoleId = (typeof windowsRoleIds)[number];

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
  const slot = (id: WindowsRoleId) => ({
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

  const slots = {
      normal: slot("normal"),
      text: slot("text"),
      link: slot("link"),
      button: slot("button"),
      normalSelect: slot("normalSelect"),
      textSelect: slot("textSelect"),
      linkSelect: slot("linkSelect"),
      busy: slot("busy"),
      workingInBackground: slot("workingInBackground"),
      unavailable: slot("unavailable"),
      move: slot("move"),
      horizontalResize: slot("horizontalResize"),
      verticalResize: slot("verticalResize"),
      diagonalResize1: slot("diagonalResize1"),
      diagonalResize2: slot("diagonalResize2"),
  };

  return {
    slots: Object.defineProperties(slots, {
      normalSelect: {
        value: slots.normal,
        enumerable: false,
        configurable: true,
        writable: true,
      },
      textSelect: {
        value: slots.text,
        enumerable: false,
        configurable: true,
        writable: true,
      },
      linkSelect: {
        value: slots.link,
        enumerable: false,
        configurable: true,
        writable: true,
      },
      busySelect: {
        value: slots.button,
        enumerable: false,
        configurable: true,
        writable: true,
      },
      busy: {
        value: slots.busy,
        enumerable: true,
        configurable: true,
        writable: true,
      },
    }),
  };
}

function createStaticSlotAsset(
  id: WindowsRoleId,
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
  id: WindowsRoleId,
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
    selectedSlotId?: WindowsRoleId;
    project?: ReturnType<typeof createProject>;
    previewUrl?: string | null;
    pendingBackgroundRemovalSlotIds?: WindowsRoleId[];
  } = {}
) {
  useStudioMock.mockReturnValue(createStudioReturn(state, options));

  return render(<StudioPage />);
}

function createStudioReturn(
  state: StudioState,
  options: {
    cursor?: Record<string, unknown> | null;
    ani?: Record<string, unknown> | null;
    selectedSlotId?: WindowsRoleId;
    project?: ReturnType<typeof createProject>;
    previewUrl?: string | null;
    pendingBackgroundRemovalSlotIds?: WindowsRoleId[];
  } = {}
) {
  const hasCursorOverride = Object.prototype.hasOwnProperty.call(options, "cursor");
  const hasAniOverride = Object.prototype.hasOwnProperty.call(options, "ani");

  const cursor =
    state === "editing" || state === "uploaded" || state === "processing"
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
  const project = options.project ?? createProject();
  const selectedSlotId = options.selectedSlotId ?? "normalSelect";
  const selectedSlot = project.slots[selectedSlotId];
  const normalSlot = project.slots.normalSelect;
  const selectedSlotBound = Boolean(
    selectedSlot.asset.originalUrl ||
      selectedSlot.asset.previewUrl ||
      cursor ||
      ani
  );
  const hasConfiguredRoleIncludingAliases = Object.getOwnPropertyNames(
    project.slots
  ).some((key) => {
    const slot = project.slots[key as keyof typeof project.slots];
    return Boolean(slot && typeof slot === "object" && "kind" in slot && slot.kind !== null);
  });

  return {
    state,
    cursor,
    ani,
    project,
    selectedSlotId,
    editingSlotId: selectedSlotId,
    error: null,
    downloading: false,
    showGuide: false,
    showOriginal: false,
    previewUrl: options.previewUrl ?? null,
    pendingBackgroundRemovalSlotIds:
      options.pendingBackgroundRemovalSlotIds ?? [],
    selectFile: selectFileMock,
    selectAniFile: selectAniFileMock,
    selectSelectedSlotStaticFile: selectSlotStaticFileMock,
    selectSelectedSlotAnimatedFile: selectSlotAnimatedFileMock,
    selectSelectedSlotImageSequenceFiles: selectSlotImageSequenceFilesMock,
    processBgRemoval: vi.fn(),
    skipBgRemoval: vi.fn(),
    toggleOriginal: vi.fn(),
    retryBgRemoval: vi.fn(),
    setHotspot: setHotspotMock,
    setOffset: setOffsetMock,
    setScale: vi.fn(),
    setFitMode: vi.fn(),
    setCursorSize: vi.fn(),
    setAniCursorSize: vi.fn(),
    setCursorName: vi.fn(),
    selectSlot: selectSlotMock,
    recommendHotspot: vi.fn(),
    undo: undoMock,
    redo: redoMock,
    canUndo: true,
    canRedo: true,
    reset: vi.fn(),
    canDownloadAll:
      hasConfiguredRoleIncludingAliases &&
      !(options.pendingBackgroundRemovalSlotIds?.length ?? 0),
    canDownload: hasConfiguredRoleIncludingAliases,
    canSecondaryDownload: state !== "uploaded" && selectedSlotBound,
    downloadAll: vi.fn(),
    download: vi.fn(),
    closeGuide: vi.fn(),
  };
}

beforeEach(() => {
  UploadZoneMock.mockClear();
  MobileGuardMock.mockClear();
  StudioBarMock.mockClear();
  SimulationMock.mockClear();
  AniSimulationMock.mockClear();
  HealthCheckMock.mockClear();
  useStudioMock.mockReset();
  selectFileMock.mockReset();
  selectAniFileMock.mockReset();
  selectSlotMock.mockReset();
  selectSlotStaticFileMock.mockReset();
  selectSlotAnimatedFileMock.mockReset();
  selectSlotImageSequenceFilesMock.mockReset();
  setOffsetMock.mockReset();
  setHotspotMock.mockReset();
  undoMock.mockReset();
  redoMock.mockReset();
  replaceMock.mockReset();
  getLandingFileMock.mockReset();
  clearLandingFileMock.mockReset();
  searchParamsState.current = new URLSearchParams("");
});

afterEach(() => {
  cleanup();
});

describe("Studio entry gate", () => {
  it("promotes the multiple-image GIF Maker source while keeping AI generation deferred", () => {
    const aniOptions = WORKFLOW_OPTIONS.filter((option) => option.family === "ani");
    const gifMakerOption = WORKFLOW_OPTIONS.find(
      (option) => option.id === "ani-multiple-pngs"
    );
    const aiGenerateOption = WORKFLOW_OPTIONS.find(
      (option) => option.id === "ani-ai-generate"
    );

    expect({
      firstAniWorkflowId: aniOptions[0]?.id,
      gifMakerAvailability: gifMakerOption?.availability,
      gifMakerSelectable:
        gifMakerOption && isSelectableWorkflow(gifMakerOption.id),
      gifMakerEnglishTitle: en.upload.aniMultiplePngs,
      gifMakerKoreanTitle: ko.upload.aniMultiplePngs,
      emptySlotEnglishTitle: en.studio.emptySlotMultiplePngs,
      emptySlotKoreanTitle: ko.studio.emptySlotMultiplePngs,
      aiGenerateAvailability: aiGenerateOption?.availability,
      aiGenerateSelectable:
        aiGenerateOption && isSelectableWorkflow(aiGenerateOption.id),
    }).toEqual({
      firstAniWorkflowId: "ani-multiple-pngs",
      gifMakerAvailability: "available",
      gifMakerSelectable: true,
      gifMakerEnglishTitle: "GIF Maker",
      gifMakerKoreanTitle: "여러 이미지로 애니메이션 만들기",
      emptySlotEnglishTitle: "GIF Maker",
      emptySlotKoreanTitle: "여러 이미지로 애니메이션 만들기",
      aiGenerateAvailability: "soon",
      aiGenerateSelectable: false,
    });
  });

  it("shows GIF Maker as a non-Soon expanded slot source while AI generation stays Soon", () => {
    renderStudio("editing", {
      cursor: null,
    });

    fireEvent.click(
      screen.getByRole("button", { name: "more source options" })
    );

    expect({
      gifMakerVisible: Boolean(screen.queryByText("GIF Maker")),
      aiGenerateVisible: Boolean(screen.queryByText("AI generate")),
      soonBadgeCount: screen.getAllByText("Soon").length,
    }).toEqual({
      gifMakerVisible: true,
      aiGenerateVisible: true,
      soonBadgeCount: 1,
    });
  });

  it("passes multiple valid image frames from the GIF Maker source input", () => {
    const firstFrame = new File(["one"], "frame-01.png", { type: "image/png" });
    const secondFrame = new File(["two"], "frame-02.webp", { type: "image/webp" });
    const gifFile = new File(["animated"], "animated.gif", { type: "image/gif" });
    const renamedGifFile = new File(["animated"], "renamed.png", {
      type: "image/gif",
    });
    const textFile = new File(["notes"], "notes.txt", { type: "text/plain" });

    renderStudio("editing", {
      cursor: null,
    });

    const moreOptionsButton = screen.getByRole("button", {
      name: "more source options",
    });
    expect(moreOptionsButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(moreOptionsButton);
    expect(moreOptionsButton).toHaveAttribute("aria-expanded", "true");

    const gifMaker = screen.getByTestId("studio-empty-slot-source-gif-maker");
    const fileInput = gifMaker.parentElement?.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement | null;

    expect(fileInput).not.toBeNull();
    expect(fileInput).toHaveAttribute("multiple");
    expect(fileInput).toHaveAttribute("accept", ".png,.jpg,.jpeg,.webp");

    fireEvent.click(gifMaker);
    fireEvent.change(fileInput!, {
      target: {
        files: [textFile, firstFrame, gifFile, renamedGifFile, secondFrame],
      },
    });

    expect(selectSlotImageSequenceFilesMock).toHaveBeenCalledTimes(1);
    expect(selectSlotImageSequenceFilesMock).toHaveBeenCalledWith([
      firstFrame,
      secondFrame,
    ]);
    expect(selectSlotAnimatedFileMock).not.toHaveBeenCalled();
  });

  it("passes multiple valid dropped frames from the GIF Maker source", () => {
    const firstFrame = new File(["one"], "frame-01.jpg", { type: "image/jpeg" });
    const secondFrame = new File(["two"], "frame-02.png", { type: "image/png" });
    const gifFile = new File(["animated"], "animated.gif", { type: "image/gif" });

    renderStudio("editing", {
      cursor: null,
    });

    fireEvent.click(
      screen.getByRole("button", { name: "more source options" })
    );

    fireEvent.drop(screen.getByTestId("studio-empty-slot-source-gif-maker"), {
      dataTransfer: { files: [gifFile, firstFrame, secondFrame] },
    });

    expect(selectSlotImageSequenceFilesMock).toHaveBeenCalledTimes(1);
    expect(selectSlotImageSequenceFilesMock).toHaveBeenCalledWith([
      firstFrame,
      secondFrame,
    ]);
    expect(selectSlotAnimatedFileMock).not.toHaveBeenCalled();
  });

  it("requires at least two valid frames before using the GIF Maker source", () => {
    const onlyFrame = new File(["one"], "frame-01.png", { type: "image/png" });
    const gifFile = new File(["animated"], "animated.gif", { type: "image/gif" });

    renderStudio("editing", {
      cursor: null,
    });

    fireEvent.click(
      screen.getByRole("button", { name: "more source options" })
    );

    fireEvent.drop(screen.getByTestId("studio-empty-slot-source-gif-maker"), {
      dataTransfer: { files: [onlyFrame, gifFile] },
    });

    expect(selectSlotImageSequenceFilesMock).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Select at least 2 PNG, JPG, or WebP frames."
    );
  });

  it("renders the default slot source entry instead of the workflow picker", () => {
    renderStudio("editing", {
      cursor: null,
    });

    expect(screen.getByTestId("studio-theme-scope")).toBeVisible();
    expect(screen.getByTestId("studio-theme-scope")).toHaveStyle({
      overflow: "hidden",
    });
    expect(screen.getByTestId("studio-empty-slot-source-cards")).toBeVisible();
    expect(screen.getByTestId("studio-empty-slot-source-static")).toBeVisible();
    expect(screen.getByTestId("studio-empty-slot-source-animated")).toBeVisible();
    expect(screen.getByTestId("studio-stage-header")).not.toBeNull();
    expect(screen.queryByTestId("studio-stage-actions")).toBeNull();
    expect(screen.queryByTestId("studio-showcase-rail")).toBeNull();
    expect(screen.queryByTestId("upload-zone")).toBeNull();
    expect(screen.queryByTestId("studio-tool-rail")).toBeNull();
    expect(screen.getByTestId("studio-inspector-compact-guidance")).not.toBeNull();
    expect(screen.queryByTestId("studio-inspector-empty-notice")).toBeNull();
  });

  it("groups the empty-slot sources into a dedicated source-card region", () => {
    renderStudio("editing", {
      cursor: null,
    });

    expect(screen.getByTestId("studio-empty-slot-source-cards")).toBeVisible();
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(2);
  });

  it("shows a dedicated stage header and action region in editing mode", () => {
    renderStudio("editing");

    expect(screen.getByTestId("studio-stage-header")).not.toBeNull();
    expect(screen.getByTestId("studio-stage-actions")).not.toBeNull();
    expect(screen.queryByTestId("studio-tool-rail")).toBeNull();
  });

  it("renders an ANI editing shell with shared framing controls", () => {
    const project = createProject();
    project.slots.normalSelect = createStaticSlotAsset(
      "normalSelect",
      "blob:normal-preview"
    );
    project.slots.linkSelect = createAnimatedSlotAsset(
      "linkSelect",
      "blob:link-preview"
    );

    renderStudio("ani-editing", {
      project,
      selectedSlotId: "linkSelect",
    });

    expect(screen.getByTestId("ani-editor-shell")).not.toBeNull();
    expect(screen.getByTestId("ani-editor-shell-workspace")).toHaveStyle({
      flexDirection: "column",
    });
    expect(screen.getByTestId("studio-stage-header")).not.toBeNull();
    expect(screen.getByTestId("studio-stage-actions")).not.toBeNull();
    expect(screen.queryByTestId("studio-tool-rail")).toBeNull();
    expect(screen.queryByTestId("workflow-picker")).toBeNull();
    expect(screen.queryByTestId("upload-zone")).toBeNull();
    expect(StudioBarMock).toHaveBeenCalledTimes(1);

    const barProps = StudioBarMock.mock.calls[0][0];
    expect(barProps.onDownload).toBeDefined();
    expect(barProps.onSecondaryDownload).toBeDefined();
    expect(barProps.primaryActionLabel).toBe("Download all roles (t)");
    expect(barProps.secondaryActionLabel).toBe("Download current slot (t)");
    expect(screen.getByTestId("studio-inspector-actual-size-card")).not.toBeNull();
    expect(screen.getByTestId("studio-inspector-summary-card")).not.toBeNull();
  });

  it("shows the one-shot background comparison preview after static background removal completes", () => {
    renderStudio("editing", {
      previewUrl: "blob:preview",
      cursor: {
        originalUrl: "blob:original",
        processedUrl: "blob:processed",
      },
    });

    expect(
      screen.queryByTestId("background-compare-preview")
    ).not.toBeInTheDocument();
  });

  it("reads the ANI inspector as grouped summary and preview sections", () => {
    renderStudio("ani-editing");

    const inspector = screen.getByTestId("studio-inspector");

    expect(inspector).not.toBeNull();
    expect(screen.getByTestId("studio-inspector-summary-card")).not.toBeNull();
    expect(screen.getByTestId("studio-inspector-actual-size-card")).not.toBeNull();
    expect(screen.queryByTestId("studio-inspector-quick-actions")).toBeNull();
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

  it("shows hotspot recommendation status in editing mode without inspector duplication", () => {
    renderStudio("editing", {
      cursor: {
        hotspotMode: "auto",
      },
    });

    expect(screen.getByTestId("studio-inspector-quick-actions")).toBeVisible();
    expect(
      screen.getByRole("button", { name: /recommend hotspot again/i })
    ).toBeVisible();
  });

  it("renders the stage view zoom control in editing mode", () => {
    renderStudio("editing");

    expect(screen.getByRole("group", { name: "View zoom" })).toBeVisible();
    expect(screen.getByRole("button", { name: "1.5x" })).toBeVisible();
  });

  it("renders the simulation footer when the normalSelect slot is configured", () => {
    const project = createProject();
    project.slots.normalSelect = createStaticSlotAsset(
      "normalSelect",
      "blob:normal-preview"
    );

    renderStudio("editing", {
      project,
      cursor: createEditingCursor(),
    });

    expect(screen.getByTestId("simulation")).not.toBeNull();
    expect(SimulationMock).toHaveBeenCalledTimes(1);
  });

  it("renders the ANI simulation footer when the normalSelect slot is configured", () => {
    const project = createProject();
    project.slots.normalSelect = createStaticSlotAsset(
      "normalSelect",
      "blob:normal-preview"
    );

    renderStudio("ani-editing", {
      project,
      selectedSlotId: "linkSelect",
    });

    expect(screen.getByTestId("ani-simulation")).not.toBeNull();
    expect(AniSimulationMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the simulation theme mode shared when switching from CUR editing to ANI editing", () => {
    const project = createProject();
    project.slots.normalSelect = createStaticSlotAsset(
      "normalSelect",
      "blob:normal-preview"
    );

    let currentStudioReturn = createStudioReturn("editing", {
      project,
      previewUrl: "blob:preview",
    });

    useStudioMock.mockImplementation(() => currentStudioReturn);

    const view = render(<StudioPage />);

    fireEvent.click(screen.getByRole("switch", { name: "simulation theme mode" }));

    currentStudioReturn = createStudioReturn("ani-editing", {
      project,
      selectedSlotId: "linkSelect",
    });

    view.rerender(<StudioPage />);

    expect(AniSimulationMock).toHaveBeenCalled();
    expect(AniSimulationMock.mock.calls.at(-1)?.[0]).toMatchObject({
      themeMode: "light",
    });
  });

  it("restores the CUR health check in the inspector when a rendered cursor is available", () => {
    renderStudio("editing");

    expect(screen.getByTestId("health-check")).not.toBeNull();
    expect(HealthCheckMock).toHaveBeenCalled();
    expect(HealthCheckMock.mock.calls.at(-1)?.[0]).toMatchObject({
      imageBlob: expect.any(Blob),
      hotspotX: 3,
      hotspotY: 2,
    });
  });

  it("renders a slot rail in the studio shell for slot-based editing", () => {
    renderStudio("editing");

    expect(screen.getByTestId("slot-rail")).not.toBeNull();
  });

  it("shows an empty editor state when a non-populated slot is selected", () => {
    renderStudio("editing", {
      selectedSlotId: "textSelect",
      cursor: null,
    });

    expect(screen.getByTestId("slot-textSelect")).not.toBeNull();
    expect(screen.getByTestId("studio-stage-header")).not.toBeNull();
    expect(screen.getByTestId("studio-empty-slot-source-static")).toBeVisible();
    expect(screen.queryByTestId("studio-tool-rail")).toBeNull();
    expect(screen.queryByTestId("cursor-canvas")).toBeNull();
    expect(StudioBarMock.mock.calls[0][0].canDownload).toBe(false);
  });

  it("keeps uploaded background-removal choice inside the editor with an inline overlay", () => {
    renderStudio("uploaded");

    expect(
      screen.getByTestId("background-removal-decision-overlay")
    ).not.toBeNull();
    expect(
      screen.getByTestId("background-removal-decision-overlay")
    ).toHaveStyle({
      alignItems: "flex-end",
    });
    expect(screen.getByTestId("cursor-canvas")).not.toBeNull();
    expect(screen.queryByTestId("studio-tool-rail")).toBeNull();
    expect(screen.queryByTestId("studio-inspector-empty-notice")).toBeNull();
    expect(screen.queryByTestId("upload-zone")).toBeNull();
  });

  it("anchors the processing overlay to the lower edge of the canvas area", () => {
    renderStudio("processing");

    expect(
      screen.getByTestId("background-removal-processing-overlay")
    ).toHaveStyle({
      alignItems: "flex-end",
    });
  });

  it("accepts dropped files in the slot source entry cards", () => {
    const staticFile = new File(["static"], "cursor.png", { type: "image/png" });
    const animatedFile = new File(["animated"], "cursor.gif", { type: "image/gif" });

    renderStudio("editing", {
      cursor: null,
    });

    fireEvent.drop(screen.getByTestId("studio-empty-slot-source-static"), {
      dataTransfer: { files: [staticFile] },
    });
    fireEvent.drop(screen.getByTestId("studio-empty-slot-source-animated"), {
      dataTransfer: { files: [animatedFile] },
    });

    expect(selectSlotStaticFileMock).toHaveBeenCalledWith(staticFile);
    expect(selectSlotAnimatedFileMock).toHaveBeenCalledWith(animatedFile);
  });

  it("shows an inline confirm before replacing a populated slot from the stage drop surface", () => {
    const replacementFile = new File(["replacement"], "replacement.png", {
      type: "image/png",
    });

    renderStudio("editing");

    fireEvent.drop(screen.getByTestId("slot-replacement-surface"), {
      dataTransfer: { files: [replacementFile] },
    });

    expect(selectSlotStaticFileMock).not.toHaveBeenCalled();
    const confirm = screen.getByTestId("slot-replacement-confirm");
    expect(confirm).not.toBeNull();

    fireEvent.click(
      within(confirm).getByRole("button", { name: "confirm replace" })
    );

    expect(selectSlotStaticFileMock).toHaveBeenCalledTimes(1);
    expect(selectSlotStaticFileMock).toHaveBeenCalledWith(replacementFile);
  });

  it("highlights the slot source card on hover with the accent border", () => {
    renderStudio("editing", {
      cursor: null,
    });

    const staticButton = screen.getByTestId("studio-empty-slot-source-static");

    fireEvent.mouseEnter(staticButton);

    expect(staticButton).toHaveStyle({
      border: "1px solid color-mix(in srgb, var(--color-accent-primary) 56%, white 8%)",
    });
  });

  it("enables current-slot export when a configured non-normal role is selected", () => {
    const project = createProject();
    project.slots.textSelect = createStaticSlotAsset(
      "textSelect",
      "blob:text-preview"
    );

    renderStudio("editing", {
      project,
      selectedSlotId: "textSelect",
    });

    expect(StudioBarMock.mock.calls[0][0].canDownload).toBe(true);
    expect(StudioBarMock.mock.calls[0][0].canSecondaryDownload).toBe(true);
  });

  it("enables full-set export when only a non-normal slot is populated", () => {
    const project = createProject();
    project.slots.textSelect = createStaticSlotAsset(
      "textSelect",
      "blob:text-preview"
    );

    renderStudio("editing", {
      project,
      selectedSlotId: "textSelect",
    });

    expect(StudioBarMock.mock.calls[0][0].canDownload).toBe(true);
    expect(StudioBarMock.mock.calls[0][0].canSecondaryDownload).toBe(true);
  });

  it("shows pending background decisions before allowing full-set export", () => {
    const project = createProject();
    project.slots.textSelect = createStaticSlotAsset(
      "textSelect",
      "blob:text-preview"
    );

    renderStudio("editing", {
      project,
      selectedSlotId: "linkSelect",
      pendingBackgroundRemovalSlotIds: ["textSelect"],
    });

    expect(StudioBarMock.mock.calls[0][0].canDownload).toBe(false);
    expect(screen.getByTestId("pending-background-decision-notice")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Review slot" }));

    expect(selectSlotMock).toHaveBeenCalledWith("textSelect");
  });

  it("wires undo and redo keyboard shortcuts into the studio shell", () => {
    renderStudio("editing");

    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    fireEvent.keyDown(window, { key: "Z", ctrlKey: true, shiftKey: true });
    fireEvent.keyDown(window, { key: "y", ctrlKey: true });

    expect(undoMock).toHaveBeenCalledTimes(1);
    expect(redoMock).toHaveBeenCalledTimes(2);
  });

  it("shows numeric cursor position inputs and wires them to offset updates", () => {
    renderStudio("editing");

    const offsetXInput = screen.getByLabelText(/offset x/i);
    const offsetYInput = screen.getByLabelText(/offset y/i);

    expect(offsetXInput).toHaveValue(0);
    expect(offsetYInput).toHaveValue(0);

    fireEvent.change(offsetXInput, { target: { value: "14" } });
    fireEvent.change(offsetYInput, { target: { value: "-8" } });

    expect(setOffsetMock).toHaveBeenNthCalledWith(1, 14, 0);
    expect(setOffsetMock).toHaveBeenNthCalledWith(2, 0, -8);
  });

  it("shows numeric hotspot inputs and wires them to hotspot updates", () => {
    renderStudio("editing");

    const hotspotXInput = screen.getByLabelText(/hotspot x/i);
    const hotspotYInput = screen.getByLabelText(/hotspot y/i);

    expect(hotspotXInput).toHaveValue(24);
    expect(hotspotYInput).toHaveValue(18);

    fireEvent.change(hotspotXInput, { target: { value: "11" } });
    fireEvent.change(hotspotYInput, { target: { value: "7" } });

    expect(setHotspotMock).toHaveBeenNthCalledWith(1, 11, 18);
    expect(setHotspotMock).toHaveBeenNthCalledWith(2, 24, 7);
  });

  it("shows numeric hotspot inputs for ani editing and wires them to hotspot updates", () => {
    renderStudio("ani-editing");

    const hotspotXInput = screen.getByLabelText(/hotspot x/i);
    const hotspotYInput = screen.getByLabelText(/hotspot y/i);

    expect(hotspotXInput).toHaveValue(24);
    expect(hotspotYInput).toHaveValue(18);

    fireEvent.change(hotspotXInput, { target: { value: "9" } });
    fireEvent.change(hotspotYInput, { target: { value: "5" } });

    expect(setHotspotMock).toHaveBeenNthCalledWith(1, 9, 18);
    expect(setHotspotMock).toHaveBeenNthCalledWith(2, 24, 5);
  });
});

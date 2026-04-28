import {
  act,
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
  untitledProject: "Untitled cursor set (t)",
  saveProject: "Save (t)",
  saveProjectLoginRequired: "Login required (t)",
  saveProjectLoginRequiredDescription: "Log in to save project (t)",
  downloadAllRoles: "Download all (t)",
  downloadAllRolesLabel: "Download Windows cursor set (t)",
  downloadGif: "Save GIF (t)",
  downloadGifLabel: "Export as GIF file (t)",
  downloadCurrentSlot: "Current cursor (t)",
  downloadCurrentSlotLabel: "Download current slot (t)",
  downloadCurrentCur: "Current cursor (t)",
  downloadCurrentCurLabel: "Download Windows cursor file (t)",
  downloadCurrentAni: "ANI cursor (t)",
  downloadCurrentAniLabel: "Download Windows animated cursor file (t)",
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
  aniFrameTimeline: "ANI frame timeline",
  aniFrameCountSingular: "{count} frame",
  aniFrameCountPlural: "{count} frames",
  aniFrameTotalDuration: "Total duration",
  aniFrameTimelineHint: "Click to select. Drag to reorder.",
  aniFrameEdited: "Edited",
  aniFrameEditedState: "edited",
  aniFrameNotEditedState: "not edited",
  aniFrameSelectLabel: "Select frame {frame}, duration {duration}, {state}",
  aniFrameActions: "Frame {frame} actions",
  aniFrameMovePrevious: "Previous",
  aniFrameMoveNext: "Next",
  aniFrameDelete: "Delete",
  aniFrameMovePreviousLabel: "Move frame {frame} previous",
  aniFrameMoveNextLabel: "Move frame {frame} next",
  aniFrameDeleteLabel: "Delete frame {frame}",
  aniFrameAdd: "Add frame",
  aniFrameAddLabel: "Add image frames",
  aniFrameDurationLabel: "Frame {frame} duration in milliseconds",
  aniFramePlay: "Play",
  aniFramePause: "Pause",
  aniFramePlayLabel: "Play animation",
  aniFramePauseLabel: "Pause animation",
  aniFrameSpeed: "Animation speed",
  aniFrameSpeedSlow: "Slow",
  aniFrameSpeedNormal: "Normal",
  aniFrameSpeedFast: "Fast",
  aniFrameSpeedLabel: "{label} speed, {duration} ms per frame",
};

function humanizeStudioKey(
  key: string,
  values?: Record<string, string | number>
) {
  const message =
    STUDIO_TRANSLATIONS[key] ??
    key
      .replace(/^studio\./, "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .replace(/\./g, " ")
      .trim()
      .toLowerCase();

  return Object.entries(values ?? {}).reduce(
    (current, [name, value]) => current.replaceAll(`{${name}}`, String(value)),
    message
  );
}

const {
  UploadZoneMock,
  MobileGuardMock,
  StudioBarMock,
  GuideModalMock,
  SimulationMock,
  AniSimulationMock,
  CursorCanvasMock,
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
  selectAniFrameMock,
  deleteAniFrameMock,
  moveAniFrameMock,
  reorderAniFrameMock,
  insertAniFrameFilesMock,
  setAniFrameDurationMock,
  setAllAniFrameDurationsMock,
  processBgRemovalMock,
  skipBgRemovalMock,
  setOffsetMock,
  setHotspotMock,
  setScaleMock,
  setFitModeMock,
  undoMock,
  redoMock,
  searchParamsState,
} = vi.hoisted(() => ({
  UploadZoneMock: vi.fn(() => <div data-testid="upload-zone" />),
  MobileGuardMock: vi.fn(({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )),
  StudioBarMock: vi.fn(() => <div data-testid="studio-bar" />),
  GuideModalMock: vi.fn(() => null),
  SimulationMock: vi.fn(() => <div data-testid="simulation" />),
  AniSimulationMock: vi.fn(() => <div data-testid="ani-simulation" />),
  CursorCanvasMock: vi.fn(() => <div data-testid="cursor-canvas" />),
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
  selectAniFrameMock: vi.fn(),
  deleteAniFrameMock: vi.fn(),
  moveAniFrameMock: vi.fn(),
  reorderAniFrameMock: vi.fn(),
  insertAniFrameFilesMock: vi.fn(),
  setAniFrameDurationMock: vi.fn(),
  setAllAniFrameDurationsMock: vi.fn(),
  processBgRemovalMock: vi.fn(),
  skipBgRemovalMock: vi.fn(),
  setOffsetMock: vi.fn(),
  setHotspotMock: vi.fn(),
  setScaleMock: vi.fn(),
  setFitModeMock: vi.fn(),
  undoMock: vi.fn(),
  redoMock: vi.fn(),
  searchParamsState: {
    current: new URLSearchParams(""),
  },
}));

vi.mock("next-intl", () => ({
  useTranslations:
    () => (key: string, values?: Record<string, string | number>) =>
      humanizeStudioKey(key, values),
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
  default: CursorCanvasMock,
}));

vi.mock("@/components/GuideModal", () => ({
  default: GuideModalMock,
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
    rotation: 0,
    flipX: false,
    flipY: false,
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
    sourceKind: "gif",
    frames: [],
    selectedFrameId: null,
    globalEdit: {
      fitMode: "contain",
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      flipX: false,
      flipY: false,
    },
    sourceWidth: 96,
    sourceHeight: 96,
    hotspotX: 24,
    hotspotY: 18,
    hotspotMode: "auto",
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    rotation: 0,
    flipX: false,
    flipY: false,
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
      rotation: 0,
      flipX: false,
      flipY: false,
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
      rotation: 0,
      flipX: false,
      flipY: false,
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
      rotation: 0,
      flipX: false,
      flipY: false,
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
    showGuide?: boolean;
    downloadGuideVariant?: "package" | "cur" | "ani";
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
    showGuide?: boolean;
    downloadGuideVariant?: "package" | "cur" | "ani";
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
    showGuide: options.showGuide ?? false,
    downloadGuideVariant: options.downloadGuideVariant ?? "package",
    showOriginal: false,
    previewUrl: options.previewUrl ?? null,
    pendingBackgroundRemovalSlotIds:
      options.pendingBackgroundRemovalSlotIds ?? [],
    selectFile: selectFileMock,
    selectAniFile: selectAniFileMock,
    selectSelectedSlotStaticFile: selectSlotStaticFileMock,
    selectSelectedSlotAnimatedFile: selectSlotAnimatedFileMock,
    selectSelectedSlotImageSequenceFiles: selectSlotImageSequenceFilesMock,
    processBgRemoval: processBgRemovalMock,
    skipBgRemoval: skipBgRemovalMock,
    toggleOriginal: vi.fn(),
    retryBgRemoval: vi.fn(),
    setHotspot: setHotspotMock,
    setOffset: setOffsetMock,
    setScale: setScaleMock,
    setFitMode: setFitModeMock,
    applyImageTransform: vi.fn(),
    setCursorSize: vi.fn(),
    setAniCursorSize: vi.fn(),
    setCursorName: vi.fn(),
    selectSlot: selectSlotMock,
    selectAniFrame: selectAniFrameMock,
    deleteAniFrame: deleteAniFrameMock,
    moveAniFrame: moveAniFrameMock,
    reorderAniFrame: reorderAniFrameMock,
    insertAniFrameFiles: insertAniFrameFilesMock,
    setAniFrameDuration: setAniFrameDurationMock,
    setAllAniFrameDurations: setAllAniFrameDurationsMock,
    setSelectedAniFrameEditOverride: vi.fn(),
    resetSelectedAniFrameEdit: vi.fn(),
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
    canDownloadGif:
      state === "ani-editing" && ani?.sourceKind === "image-sequence",
    canSecondaryDownload: state !== "uploaded" && selectedSlotBound,
    downloadAll: vi.fn(),
    download: vi.fn(),
    downloadGif: vi.fn(),
    closeGuide: vi.fn(),
  };
}

beforeEach(() => {
  UploadZoneMock.mockClear();
  MobileGuardMock.mockClear();
  StudioBarMock.mockClear();
  GuideModalMock.mockClear();
  SimulationMock.mockClear();
  AniSimulationMock.mockClear();
  CursorCanvasMock.mockClear();
  HealthCheckMock.mockClear();
  useStudioMock.mockReset();
  selectFileMock.mockReset();
  selectAniFileMock.mockReset();
  selectSlotMock.mockReset();
  selectSlotStaticFileMock.mockReset();
  selectSlotAnimatedFileMock.mockReset();
  selectSlotImageSequenceFilesMock.mockReset();
  selectAniFrameMock.mockReset();
  deleteAniFrameMock.mockReset();
  moveAniFrameMock.mockReset();
  reorderAniFrameMock.mockReset();
  insertAniFrameFilesMock.mockReset();
  setAniFrameDurationMock.mockReset();
  setAllAniFrameDurationsMock.mockReset();
  processBgRemovalMock.mockReset();
  skipBgRemovalMock.mockReset();
  setOffsetMock.mockReset();
  setHotspotMock.mockReset();
  setScaleMock.mockReset();
  setFitModeMock.mockReset();
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
    expect(
      screen.queryByTestId("studio-inspector-compact-guidance")
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("studio-inspector-empty-notice")).toBeNull();
  });

  it("keeps the background-removal decision in the stage flow without duplicating the pending banner", () => {
    renderStudio("uploaded", {
      pendingBackgroundRemovalSlotIds: ["normalSelect"],
    });

    expect(
      screen.queryByTestId("pending-background-decision-notice")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("background-removal-decision-dock")).toBeVisible();
    expect(
      screen.queryByTestId("background-removal-decision-overlay")
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("background-removal-decision-dock")
    ).toHaveStyle({
      position: "relative",
      flexShrink: "0",
    });

    fireEvent.click(
      within(screen.getByTestId("background-removal-decision-dock")).getByRole(
        "button",
        { name: /use as is/i }
      )
    );

    expect(skipBgRemovalMock).toHaveBeenCalledTimes(1);
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
    expect(barProps.canSaveProject).toBe(false);
    expect(barProps.projectTitleLabel).toBe("Untitled cursor set (t)");
    expect(barProps.saveProjectLabel).toBe("Save (t)");
    expect(barProps.saveProjectStatusLabel).toBe("Login required (t)");
    expect(barProps.saveProjectDescription).toBe("Log in to save project (t)");
    expect(barProps.primaryActionLabel).toBe("Download all (t)");
    expect(barProps.primaryActionDescription).toBe(
      "Download Windows cursor set (t)"
    );
    expect(barProps.secondaryActionLabel).toBe("ANI cursor (t)");
    expect(barProps.secondaryActionDescription).toBe(
      "Download Windows animated cursor file (t)"
    );
    expect(screen.getByTestId("studio-inspector-actual-size-card")).not.toBeNull();
    expect(screen.getByTestId("studio-inspector-summary-card")).not.toBeNull();
  });

  it("labels the current-slot download as an ANI file in animated editing", () => {
    renderStudio("ani-editing");

    const barProps = StudioBarMock.mock.calls[0][0];

    expect(barProps.secondaryActionLabel).toBe("ANI cursor (t)");
    expect(barProps.secondaryActionDescription).toBe(
      "Download Windows animated cursor file (t)"
    );
  });

  it("offers a separate GIF export action for image sequence animations", () => {
    renderStudio("ani-editing", {
      ani: {
        sourceKind: "image-sequence",
        originalUrl: "blob:frame-1",
        selectedFrameId: "frame-1",
        frames: [
          {
            id: "frame-1",
            file: new File(["one"], "frame-001.png", { type: "image/png" }),
            url: "blob:frame-1",
            sourceWidth: 64,
            sourceHeight: 64,
            durationMs: 100,
          },
          {
            id: "frame-2",
            file: new File(["two"], "frame-002.png", { type: "image/png" }),
            url: "blob:frame-2",
            sourceWidth: 64,
            sourceHeight: 64,
            durationMs: 100,
          },
        ],
      },
    });

    const barProps = StudioBarMock.mock.calls[0][0];

    expect(barProps.tertiaryActionLabel).toBe("Save GIF (t)");
    expect(barProps.tertiaryActionDescription).toBe("Export as GIF file (t)");
    expect(barProps.canTertiaryDownload).toBe(true);
  });

  it("passes the active download guide variant to the guide modal", () => {
    renderStudio("ani-editing", {
      showGuide: true,
      downloadGuideVariant: "ani",
    });

    expect(GuideModalMock.mock.calls.at(-1)?.[0]).toMatchObject({
      open: true,
      variant: "ani",
    });
  });

  it("passes the selected image sequence frame URL to the ANI canvas", () => {
    renderStudio("ani-editing", {
      ani: {
        sourceKind: "image-sequence",
        originalUrl: "blob:frame-1",
        selectedFrameId: "frame-2",
        frames: [
          {
            id: "frame-1",
            file: new File(["one"], "frame-001.png", { type: "image/png" }),
            url: "blob:frame-1",
            sourceWidth: 64,
            sourceHeight: 64,
            durationMs: 100,
          },
          {
            id: "frame-2",
            file: new File(["two"], "frame-002.png", { type: "image/png" }),
            url: "blob:frame-2",
            sourceWidth: 64,
            sourceHeight: 64,
            durationMs: 100,
          },
        ],
      },
    });

    expect(CursorCanvasMock.mock.calls.at(-1)?.[0]).toMatchObject({
      imageUrl: "blob:frame-2",
    });
  });

  it("shows image sequence frames as selectable timeline thumbnails", () => {
    renderStudio("ani-editing", {
      ani: {
        sourceKind: "image-sequence",
        originalUrl: "blob:frame-1",
        selectedFrameId: "frame-1",
        frames: [
          {
            id: "frame-1",
            file: new File(["one"], "frame-001.png", { type: "image/png" }),
            url: "blob:frame-1",
            sourceWidth: 64,
            sourceHeight: 64,
            durationMs: 100,
          },
          {
            id: "frame-2",
            file: new File(["two"], "frame-002.png", { type: "image/png" }),
            url: "blob:frame-2",
            sourceWidth: 64,
            sourceHeight: 64,
            durationMs: 125,
          },
        ],
      },
    });

    expect(screen.getByTestId("ani-frame-timeline")).toBeVisible();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Select frame 2, duration 125 ms, not edited",
      })
    );

    expect(selectAniFrameMock).toHaveBeenCalledWith("frame-2");
  });

  it("routes selected ANI frame duration edits from the timeline", () => {
    renderStudio("ani-editing", {
      ani: {
        sourceKind: "image-sequence",
        originalUrl: "blob:frame-1",
        selectedFrameId: "frame-2",
        frames: [
          {
            id: "frame-1",
            file: new File(["one"], "frame-001.png", { type: "image/png" }),
            url: "blob:frame-1",
            sourceWidth: 64,
            sourceHeight: 64,
            durationMs: 100,
          },
          {
            id: "frame-2",
            file: new File(["two"], "frame-002.png", { type: "image/png" }),
            url: "blob:frame-2",
            sourceWidth: 64,
            sourceHeight: 64,
            durationMs: 125,
          },
        ],
      },
    });

    const durationInput = screen.getByRole("spinbutton", {
      name: "Frame 2 duration in milliseconds",
    });

    fireEvent.change(durationInput, { target: { value: "180" } });
    fireEvent.blur(durationInput);

    expect(setAniFrameDurationMock).toHaveBeenCalledWith("frame-2", 180);
  });

  it("plays image sequence frames inside the ANI canvas preview", () => {
    vi.useFakeTimers();

    try {
      renderStudio("ani-editing", {
        ani: {
          sourceKind: "image-sequence",
          originalUrl: "blob:frame-1",
          selectedFrameId: "frame-1",
          frames: [
            {
              id: "frame-1",
              file: new File(["one"], "frame-001.png", { type: "image/png" }),
              url: "blob:frame-1",
              sourceWidth: 64,
              sourceHeight: 64,
              durationMs: 40,
            },
            {
              id: "frame-2",
              file: new File(["two"], "frame-002.png", { type: "image/png" }),
              url: "blob:frame-2",
              sourceWidth: 64,
              sourceHeight: 64,
              durationMs: 40,
            },
          ],
        },
      });

      fireEvent.click(screen.getByRole("button", { name: "Play animation" }));
      expect(CursorCanvasMock.mock.calls.at(-1)?.[0]).toMatchObject({
        imageUrl: "blob:frame-1",
      });

      act(() => {
        vi.advanceTimersByTime(40);
      });

      expect(CursorCanvasMock.mock.calls.at(-1)?.[0]).toMatchObject({
        imageUrl: "blob:frame-2",
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("defaults ANI image sequences to all-frame edits and can route transforms to the selected frame", () => {
    renderStudio("ani-editing", {
      ani: {
        sourceKind: "image-sequence",
        originalUrl: "blob:frame-1",
        selectedFrameId: "frame-2",
        frames: [
          {
            id: "frame-1",
            file: new File(["one"], "frame-001.png", { type: "image/png" }),
            url: "blob:frame-1",
            sourceWidth: 64,
            sourceHeight: 64,
            durationMs: 100,
          },
          {
            id: "frame-2",
            file: new File(["two"], "frame-002.png", { type: "image/png" }),
            url: "blob:frame-2",
            sourceWidth: 64,
            sourceHeight: 64,
            durationMs: 100,
          },
        ],
      },
    });

    const editScope = screen.getByRole("group", { name: /edit scope/i });
    const allFrames = within(editScope).getByRole("button", {
      name: /all frames/i,
    });
    const selectedFrame = within(editScope).getByRole("button", {
      name: /selected frame/i,
    });

    expect(allFrames).toHaveAttribute("aria-pressed", "true");

    fireEvent.change(screen.getByRole("slider"), {
      target: { value: "1.25" },
    });
    fireEvent.change(screen.getByLabelText(/offset y/i), {
      target: { value: "7" },
    });

    expect(setScaleMock).toHaveBeenLastCalledWith(1.25, "all-frames");
    expect(setOffsetMock).toHaveBeenLastCalledWith(0, 7, "all-frames");

    setScaleMock.mockClear();
    setOffsetMock.mockClear();
    setHotspotMock.mockClear();

    fireEvent.click(selectedFrame);
    fireEvent.change(screen.getByRole("slider"), {
      target: { value: "1.5" },
    });
    fireEvent.change(screen.getByLabelText(/offset x/i), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByLabelText(/hotspot x/i), {
      target: { value: "9" },
    });

    expect(selectedFrame).toHaveAttribute("aria-pressed", "true");
    expect(setScaleMock).toHaveBeenLastCalledWith(1.5, "selected-frame");
    expect(setOffsetMock).toHaveBeenLastCalledWith(12, 0, "selected-frame");
    expect(setHotspotMock).toHaveBeenLastCalledWith(9, 18);
  });

  it("preserves the untouched global offset axis when all-frame editing with a selected-frame override", () => {
    renderStudio("ani-editing", {
      ani: {
        sourceKind: "image-sequence",
        originalUrl: "blob:frame-2",
        selectedFrameId: "frame-2",
        globalEdit: {
          fitMode: "contain",
          scale: 1,
          offsetX: 3,
          offsetY: -4,
        },
        fitMode: "contain",
        scale: 1,
        offsetX: 3,
        offsetY: 20,
        frames: [
          {
            id: "frame-1",
            file: new File(["one"], "frame-001.png", { type: "image/png" }),
            url: "blob:frame-1",
            sourceWidth: 64,
            sourceHeight: 64,
            durationMs: 100,
          },
          {
            id: "frame-2",
            file: new File(["two"], "frame-002.png", { type: "image/png" }),
            url: "blob:frame-2",
            sourceWidth: 64,
            sourceHeight: 64,
            durationMs: 100,
            editOverride: {
              offsetY: 20,
            },
          },
        ],
      },
    });

    const editScope = screen.getByRole("group", { name: /edit scope/i });
    expect(
      within(editScope).getByRole("button", { name: /all frames/i })
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText(/offset y/i)).toHaveValue(-4);

    fireEvent.change(screen.getByLabelText(/offset x/i), {
      target: { value: "12" },
    });

    expect(setOffsetMock).toHaveBeenLastCalledWith(12, -4, "all-frames");
    expect(setHotspotMock).not.toHaveBeenCalled();
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

  it("keeps uploaded background-removal choice inside the editor with an inline dock", () => {
    renderStudio("uploaded");

    expect(screen.getByTestId("background-removal-decision-dock")).not.toBeNull();
    expect(screen.getByTestId("background-removal-decision-dock")).toHaveStyle({
      position: "relative",
      flexShrink: "0",
    });
    expect(screen.getByTestId("cursor-canvas")).not.toBeNull();
    expect(screen.queryByTestId("studio-tool-rail")).toBeNull();
    expect(screen.queryByTestId("studio-inspector-empty-notice")).toBeNull();
    expect(screen.queryByTestId("upload-zone")).toBeNull();
  });

  it("keeps the processing state in the same inline dock position", () => {
    renderStudio("processing");

    expect(screen.getByTestId("background-removal-processing-dock")).toHaveStyle({
      position: "relative",
      flexShrink: "0",
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

  it("routes multiple image drops on the static source card to GIF Maker frames", () => {
    const firstFrame = new File(["one"], "frame-01.png", { type: "image/png" });
    const secondFrame = new File(["two"], "frame-02.webp", { type: "image/webp" });

    renderStudio("editing", {
      cursor: null,
    });

    fireEvent.drop(screen.getByTestId("studio-empty-slot-source-static"), {
      dataTransfer: { files: [firstFrame, secondFrame] },
    });

    expect(selectSlotStaticFileMock).not.toHaveBeenCalled();
    expect(selectSlotImageSequenceFilesMock).toHaveBeenCalledWith([
      firstFrame,
      secondFrame,
    ]);
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

  it("routes multiple replacement frames from the populated stage drop surface to GIF Maker", () => {
    const firstFrame = new File(["one"], "replace-01.png", {
      type: "image/png",
    });
    const secondFrame = new File(["two"], "replace-02.webp", {
      type: "image/webp",
    });

    renderStudio("editing");

    fireEvent.drop(screen.getByTestId("slot-replacement-surface"), {
      dataTransfer: { files: [firstFrame, secondFrame] },
    });

    expect(selectSlotStaticFileMock).not.toHaveBeenCalled();
    const confirm = screen.getByTestId("slot-replacement-confirm");
    expect(confirm).not.toBeNull();

    fireEvent.click(
      within(confirm).getByRole("button", { name: "confirm replace" })
    );

    expect(selectSlotStaticFileMock).not.toHaveBeenCalled();
    expect(selectSlotImageSequenceFilesMock).toHaveBeenCalledWith([
      firstFrame,
      secondFrame,
    ]);
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

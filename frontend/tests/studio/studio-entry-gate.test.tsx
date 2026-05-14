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
  currentCursor: "Current cursor",
  role: "Role",
  fileName: "File name",
  format: "Format",
  adjust: "Adjust",
  autoHotspot: "Auto hotspot",
  manualHotspot: "Manual hotspot",
  fitContain: "Fit whole",
  fitCover: "Fill area",
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
  emptySlotStaticStart: "Start with Static Image",
  emptySlotAnimated: "Animated GIF",
  emptySlotAnimatedStart: "Start with Animated GIF",
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
  videoExtractingTitle: "Extracting frames...",
  videoExtractingDescription:
    "Pointint is turning the video into editable animation frames.",
  videoOptionsTitle: "Extract settings",
  videoOptionsDisclosure: "More settings",
  videoStartLabel: "Start",
  videoDurationLabel: "Length",
  videoFpsLabel: "FPS",
  videoFrameEstimate: "Up to {count} frames",
  videoBackgroundDecisionTitle: "Remove the background?",
  videoBackgroundDecisionDescription:
    "Use transparent frames for sticker-like animated cursors.",
  videoBackgroundKeep: "Use as is",
  videoBackgroundRemove: "Remove background",
  videoBackgroundProcessingTitle: "Removing backgrounds",
  videoBackgroundProcessingDescription: "{completed} / {total} frames processed",
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
  actualSize: "Actual size",
  sizeSummary: "Size",
  sourceSize: "Source size",
  outputSize: "Output size",
  lightPreview: "Light preview",
  darkPreview: "Dark preview",
  quickStartTitle: "Drop an image. Get a cursor.",
  quickStartDescription:
    "Pointint will pick the default framing and hotspot for you. You can fine-tune later if you want.",
  quickResultTitle: "Your cursor is ready",
  quickResultDescription:
    "Download it now, or open fine-tuning if you want to adjust the details.",
  quickDownload: "Download cursor",
  quickDownloadDescription: "Download the current cursor file",
  openAdvancedEditor: "Fine-tune",
  closeAdvancedEditor: "Back to simple view",
  quickBackgroundRemoveTitle: "Remove the background?",
  quickBackgroundRemoveDescription:
    "Use AI background removal for sticker-like cursor images.",
  quickUseAsIs: "Use as is",
  quickRemoveBackground: "Remove background",
  expandToWindowsSet: "Build full Windows set",
  slotEmptyTitle: "Choose media for this slot",
  slotEmptySub: "Choose Static Image or Animated GIF to fill the selected slot.",
  emptySlotDescription:
    "Choose a source for this slot, then edit and preview it in the simulation.",
  simulationPreview: "Simulation preview",
  collapseSimulation: "Collapse",
  expandSimulation: "Expand",
  slotStaticUpload: "Static Image",
  slotStaticUploadSub: "Upload a PNG, JPG, JPEG, or WebP image.",
  slotAniUpload: "Animated GIF",
  slotAniUploadSub: "Upload a GIF for an animated cursor slot.",
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
  StudioHeaderControlsMock,
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
  selectVideoFileMock,
  selectSlotMock,
  selectSlotStaticFileMock,
  selectSlotAnimatedFileMock,
  selectSelectedSlotVideoFileMock,
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
  keepExtractedVideoBackgroundMock,
  removeExtractedVideoBackgroundMock,
  setOffsetMock,
  setHotspotMock,
  setScaleMock,
  setFitModeMock,
  setCursorNameMock,
  undoMock,
  redoMock,
  searchParamsState,
} = vi.hoisted(() => ({
  UploadZoneMock: vi.fn(() => <div data-testid="upload-zone" />),
  MobileGuardMock: vi.fn(({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )),
  StudioHeaderControlsMock: vi.fn(() => (
    <div data-testid="studio-header-controls" />
  )),
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
  selectVideoFileMock: vi.fn(),
  selectSlotMock: vi.fn(),
  selectSlotStaticFileMock: vi.fn(),
  selectSlotAnimatedFileMock: vi.fn(),
  selectSelectedSlotVideoFileMock: vi.fn(),
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
  keepExtractedVideoBackgroundMock: vi.fn(),
  removeExtractedVideoBackgroundMock: vi.fn(),
  setOffsetMock: vi.fn(),
  setHotspotMock: vi.fn(),
  setScaleMock: vi.fn(),
  setFitModeMock: vi.fn(),
  setCursorNameMock: vi.fn(),
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

vi.mock("@/components/StudioHeaderControls", () => ({
  default: StudioHeaderControlsMock,
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
  default: ({
    ariaLabel,
    onChange,
    value,
  }: {
    ariaLabel?: string;
    onChange?: (value: string) => void;
    value?: string;
  }) => (
    <input
      aria-label={ariaLabel}
      data-testid="name-input"
      value={value ?? ""}
      onChange={(event) => onChange?.(event.currentTarget.value)}
    />
  ),
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

function createPendingVideoAniDecision() {
  return {
    slotId: "normalSelect",
    previous: {},
    ani: createAniAsset({
      sourceKind: "image-sequence",
      originalFile: new File(["frame-1"], "frame-001.png", {
        type: "image/png",
      }),
      originalUrl: "blob:video-frame-1",
      selectedFrameId: "video-frame-1",
      frames: [
        {
          id: "video-frame-1",
          file: new File(["frame-1"], "frame-001.png", {
            type: "image/png",
          }),
          url: "blob:video-frame-1",
          sourceWidth: 96,
          sourceHeight: 96,
          durationMs: 100,
        },
        {
          id: "video-frame-2",
          file: new File(["frame-2"], "frame-002.png", {
            type: "image/png",
          }),
          url: "blob:video-frame-2",
          sourceWidth: 96,
          sourceHeight: 96,
          durationMs: 100,
        },
        {
          id: "video-frame-3",
          file: new File(["frame-3"], "frame-003.png", {
            type: "image/png",
          }),
          url: "blob:video-frame-3",
          sourceWidth: 96,
          sourceHeight: 96,
          durationMs: 100,
        },
      ],
    }),
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
    pendingAniBackgroundDecision?:
      | ReturnType<typeof createPendingVideoAniDecision>
      | null;
    aniBackgroundProgress?: { completed: number; total: number } | null;
    showGuide?: boolean;
    downloadGuideVariant?: "package" | "cur" | "ani";
    experienceMode?: "quick" | "advanced";
  } = {}
) {
  useStudioMock.mockReturnValue(createStudioReturn(state, options));

  const view = render(<StudioPage />);
  if (options.experienceMode !== "quick") {
    const advancedButton = screen.queryByRole("button", {
      name: /open advanced editor|fine-tune|세부 조정/i,
    });
    if (advancedButton) {
      fireEvent.click(advancedButton);
    }
  }

  return view;
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
    pendingAniBackgroundDecision?:
      | ReturnType<typeof createPendingVideoAniDecision>
      | null;
    aniBackgroundProgress?: { completed: number; total: number } | null;
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
    pendingAniBackgroundDecision: options.pendingAniBackgroundDecision ?? null,
    aniBackgroundProgress: options.aniBackgroundProgress ?? null,
    selectFile: selectFileMock,
    selectAniFile: selectAniFileMock,
    selectVideoFile: selectVideoFileMock,
    selectSelectedSlotStaticFile: selectSlotStaticFileMock,
    selectSelectedSlotAnimatedFile: selectSlotAnimatedFileMock,
    selectSelectedSlotVideoFile: selectSelectedSlotVideoFileMock,
    selectSelectedSlotImageSequenceFiles: selectSlotImageSequenceFilesMock,
    processBgRemoval: processBgRemovalMock,
    skipBgRemoval: skipBgRemovalMock,
    keepExtractedVideoBackground: keepExtractedVideoBackgroundMock,
    removeExtractedVideoBackground: removeExtractedVideoBackgroundMock,
    toggleOriginal: vi.fn(),
    retryBgRemoval: vi.fn(),
    setHotspot: setHotspotMock,
    setOffset: setOffsetMock,
    setScale: setScaleMock,
    setFitMode: setFitModeMock,
    applyImageTransform: vi.fn(),
    setCursorSize: vi.fn(),
    setAniCursorSize: vi.fn(),
    setCursorName: setCursorNameMock,
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
  StudioHeaderControlsMock.mockClear();
  GuideModalMock.mockClear();
  SimulationMock.mockClear();
  AniSimulationMock.mockClear();
  CursorCanvasMock.mockClear();
  HealthCheckMock.mockClear();
  useStudioMock.mockReset();
  selectFileMock.mockReset();
  selectAniFileMock.mockReset();
  selectVideoFileMock.mockReset();
  selectSlotMock.mockReset();
  selectSlotStaticFileMock.mockReset();
  selectSlotAnimatedFileMock.mockReset();
  selectSelectedSlotVideoFileMock.mockReset();
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
  keepExtractedVideoBackgroundMock.mockReset();
  removeExtractedVideoBackgroundMock.mockReset();
  setOffsetMock.mockReset();
  setHotspotMock.mockReset();
  setScaleMock.mockReset();
  setFitModeMock.mockReset();
  setCursorNameMock.mockReset();
  undoMock.mockReset();
  redoMock.mockReset();
  replaceMock.mockReset();
  getLandingFileMock.mockReset();
  clearLandingFileMock.mockReset();
  searchParamsState.current = new URLSearchParams("");
  window.localStorage.clear();
  document.documentElement.setAttribute("data-theme", "dark");
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

  it("shows the quick-start upload surface before advanced editing controls", () => {
    searchParamsState.current = new URLSearchParams(
      "workflow=cur-static-image"
    );

    renderStudio("editing", {
      cursor: null,
      experienceMode: "quick",
    });

    expect(screen.getByTestId("studio-quick-start")).toBeVisible();
    expect(screen.getByTestId("studio-quick-start-static")).toBeVisible();
    expect(screen.queryByTestId("studio-quick-start-animated")).toBeNull();
    expect(screen.queryByTestId("slot-rail")).not.toBeInTheDocument();
    expect(screen.queryByTestId("studio-inspector")).not.toBeInTheDocument();
  });

  it("shows the dotted CUR and ANI guide before a direct studio upload choice", () => {
    renderStudio("editing", {
      cursor: null,
      experienceMode: "quick",
    });

    const picker = screen.getByTestId("workflow-picker");

    expect(picker).toBeVisible();
    expect(screen.getByTestId("workflow-picker-dots-base")).toBeInTheDocument();
    expect(screen.getByTestId("workflow-picker-dots-hover")).toBeInTheDocument();
    expect(screen.queryByTestId("studio-quick-start")).toBeNull();
  });

  it("keeps the top bar download actions disabled in quick result mode", () => {
    const project = createProject();
    project.slots.normalSelect = createStaticSlotAsset(
      "normalSelect",
      "blob:normal-preview"
    );

    renderStudio("editing", {
      project,
      previewUrl: "blob:preview",
      experienceMode: "quick",
    });

    expect(screen.getByTestId("studio-quick-result")).toBeVisible();
    expect(StudioHeaderControlsMock.mock.calls[0][0]).toMatchObject({
      canDownload: false,
      canSecondaryDownload: false,
      canTertiaryDownload: false,
      onDownload: undefined,
      onSecondaryDownload: undefined,
      onTertiaryDownload: undefined,
    });
    expect(
      screen.getByRole("button", { name: "Download the current cursor file" })
    ).toBeEnabled();
  });

  it("passes a valid image from the quick-start static input", () => {
    const firstFrame = new File(["one"], "frame-01.png", { type: "image/png" });
    const textFile = new File(["notes"], "notes.txt", { type: "text/plain" });
    searchParamsState.current = new URLSearchParams(
      "workflow=cur-static-image"
    );

    renderStudio("editing", {
      cursor: null,
      experienceMode: "quick",
    });

    const quickStatic = screen.getByTestId("studio-quick-start-static");
    const fileInput = quickStatic.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement | null;

    expect(fileInput).not.toBeNull();
    expect(fileInput).toHaveAttribute("accept", ".png,.jpg,.jpeg,.webp");

    fireEvent.change(fileInput!, {
      target: {
        files: [textFile, firstFrame],
      },
    });

    expect(selectSlotStaticFileMock).toHaveBeenCalledWith(firstFrame);
    expect(selectFileMock).not.toHaveBeenCalled();
    expect(selectSlotImageSequenceFilesMock).not.toHaveBeenCalled();
  });

  it("uses the first valid dropped frame from the quick-start static surface", () => {
    const firstFrame = new File(["one"], "frame-01.jpg", { type: "image/jpeg" });
    const secondFrame = new File(["two"], "frame-02.png", { type: "image/png" });
    const gifFile = new File(["animated"], "animated.gif", { type: "image/gif" });
    searchParamsState.current = new URLSearchParams(
      "workflow=cur-static-image"
    );

    renderStudio("editing", {
      cursor: null,
      experienceMode: "quick",
    });

    fireEvent.drop(screen.getByTestId("studio-quick-start-static"), {
      dataTransfer: { files: [gifFile, firstFrame, secondFrame] },
    });

    expect(selectSlotStaticFileMock).toHaveBeenCalledWith(firstFrame);
    expect(selectFileMock).not.toHaveBeenCalled();
    expect(selectSlotImageSequenceFilesMock).not.toHaveBeenCalled();
  });

  it("uses one valid quick-start image as a static cursor upload", () => {
    const onlyFrame = new File(["one"], "frame-01.png", { type: "image/png" });
    const gifFile = new File(["animated"], "animated.gif", { type: "image/gif" });
    searchParamsState.current = new URLSearchParams(
      "workflow=cur-static-image"
    );

    renderStudio("editing", {
      cursor: null,
      experienceMode: "quick",
    });

    fireEvent.drop(screen.getByTestId("studio-quick-start-static"), {
      dataTransfer: { files: [onlyFrame, gifFile] },
    });

    expect(selectSlotImageSequenceFilesMock).not.toHaveBeenCalled();
    expect(selectSlotStaticFileMock).toHaveBeenCalledWith(onlyFrame);
    expect(selectFileMock).not.toHaveBeenCalled();
  });

  it("renders the workflow-targeted quick-start entry without the picker", () => {
    searchParamsState.current = new URLSearchParams(
      "workflow=cur-static-image"
    );

    renderStudio("editing", {
      cursor: null,
      experienceMode: "quick",
    });

    expect(screen.getByTestId("studio-theme-scope")).toBeVisible();
    expect(screen.getByTestId("studio-theme-scope")).toHaveStyle({
      overflow: "hidden",
    });
    expect(screen.getByTestId("studio-theme-scope").getAttribute("style")).toContain(
      "color-scheme: var(--studio-color-scheme)"
    );
    expect(screen.getByTestId("studio-quick-start")).toBeVisible();
    expect(screen.getByTestId("studio-quick-start-static")).toBeVisible();
    expect(screen.queryByTestId("studio-quick-start-animated")).toBeNull();
    expect(screen.queryByTestId("workflow-picker")).toBeNull();
    expect(screen.queryByTestId("studio-stage-header")).toBeNull();
    expect(screen.queryByTestId("studio-stage-actions")).toBeNull();
    expect(screen.queryByTestId("studio-showcase-rail")).toBeNull();
    expect(screen.queryByTestId("upload-zone")).toBeNull();
    expect(screen.queryByTestId("studio-tool-rail")).toBeNull();
    expect(
      screen.queryByTestId("studio-inspector-compact-guidance")
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("studio-inspector-empty-notice")).toBeNull();
  });

  it("routes the ANI GIF workflow guide to animated cursor upload", () => {
    const gifFile = new File(["gif"], "cursor.gif", { type: "image/gif" });
    searchParamsState.current = new URLSearchParams(
      "workflow=ani-animated-gif"
    );

    renderStudio("editing", {
      cursor: null,
      experienceMode: "quick",
    });

    const quickAnimated = screen.getByTestId("studio-quick-start-animated");
    const input = quickAnimated.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement | null;

    expect(screen.queryByTestId("workflow-picker")).toBeNull();
    expect(screen.queryByTestId("studio-quick-start-static")).toBeNull();
    expect(input).not.toBeNull();
    expect(input).toHaveAttribute("accept", ".gif");

    fireEvent.change(input!, {
      target: {
        files: [gifFile],
      },
    });

    expect(selectAniFileMock).toHaveBeenCalledWith(gifFile);
    expect(selectSlotStaticFileMock).not.toHaveBeenCalled();
  });

  it("routes the Video to ANI workflow guide to video upload with extraction options", () => {
    searchParamsState.current = new URLSearchParams(
      "workflow=ani-video-to-ani"
    );
    renderStudio("editing", { cursor: null, experienceMode: "quick" });
    expect(screen.queryByTestId("workflow-picker")).toBeNull();
    const videoSurface = screen.getByTestId("studio-quick-start-video");
    fireEvent.click(screen.getByRole("button", { name: /More settings/ }));
    fireEvent.change(screen.getByLabelText("Start"), {
      target: { value: "1.5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "2s" }));
    fireEvent.click(screen.getByRole("button", { name: "15 fps" }));

    const input = videoSurface.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(["video"], "cat.webm", { type: "video/webm" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(selectVideoFileMock).toHaveBeenCalledWith(file, {
      startMs: 1500,
      durationMs: 2000,
      fps: 15,
    });
    expect(selectSelectedSlotVideoFileMock).not.toHaveBeenCalled();
  });

  it("shows video extraction progress while the hook is in ani-upload state", () => {
    searchParamsState.current = new URLSearchParams(
      "workflow=ani-video-to-ani"
    );
    renderStudio("ani-upload", { experienceMode: "quick" });
    expect(screen.getByText("Extracting frames...")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Pointint is turning the video into editable animation frames."
      )
    ).toBeInTheDocument();
  });

  it("routes extracted video frames to the background decision screen", () => {
    renderStudio("ani-background-decision", {
      pendingAniBackgroundDecision: createPendingVideoAniDecision(),
      experienceMode: "advanced",
    });

    const decision = screen.getByTestId("ani-background-decision");

    expect(decision).toBeVisible();
    expect(screen.getByText("Remove the background?")).toBeVisible();
    expect(
      screen.getByText(
        "Use transparent frames for sticker-like animated cursors."
      )
    ).toBeVisible();
    expect(screen.getAllByRole("img")).toHaveLength(3);

    fireEvent.click(
      within(decision).getByRole("button", { name: "Use as is" })
    );
    fireEvent.click(
      within(decision).getByRole("button", { name: "Remove background" })
    );

    expect(keepExtractedVideoBackgroundMock).toHaveBeenCalledTimes(1);
    expect(removeExtractedVideoBackgroundMock).toHaveBeenCalledTimes(1);
  });

  it("shows extracted video background-removal progress without allowing duplicate actions", () => {
    renderStudio("ani-background-processing", {
      pendingAniBackgroundDecision: createPendingVideoAniDecision(),
      aniBackgroundProgress: { completed: 7, total: 30 },
      experienceMode: "advanced",
    });

    const decision = screen.getByTestId("ani-background-decision");

    expect(screen.getByText("Removing backgrounds")).toBeVisible();
    expect(screen.getByText("7 / 30 frames processed")).toBeVisible();
    expect(
      screen.getByRole("status", {
        name: "7 / 30 frames processed",
      })
    ).toBeInTheDocument();
    expect(
      within(decision).getByRole("button", { name: "Use as is" })
    ).toBeDisabled();
    expect(
      within(decision).getByRole("button", { name: "Remove background" })
    ).toBeDisabled();
  });

  it("keeps the background-removal decision in the quick flow without duplicating the pending banner", () => {
    renderStudio("uploaded", {
      pendingBackgroundRemovalSlotIds: ["normalSelect"],
      experienceMode: "quick",
    });

    expect(
      screen.queryByTestId("pending-background-decision-notice")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("studio-quick-background-decision")).toBeVisible();
    expect(
      screen.queryByTestId("background-removal-decision-overlay")
    ).not.toBeInTheDocument();

    fireEvent.click(
      within(screen.getByTestId("studio-quick-background-decision")).getByRole(
        "button",
        { name: /use as is/i }
      )
    );

    expect(skipBgRemovalMock).toHaveBeenCalledTimes(1);
  });

  it("groups the quick-start sources into a dedicated upload region", () => {
    searchParamsState.current = new URLSearchParams(
      "workflow=cur-static-image"
    );

    renderStudio("editing", {
      cursor: null,
      experienceMode: "quick",
    });

    expect(screen.getByTestId("studio-quick-start")).toBeVisible();
    expect(screen.getByTestId("studio-quick-start-static")).toBeVisible();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("uses a studio app shell with compact tool rail and floating canvas toolbar", () => {
    renderStudio("editing");

    expect(screen.getByTestId("studio-app-shell")).toBeVisible();
    expect(screen.getByTestId("studio-stage-canvas")).toBeVisible();
    expect(screen.getByTestId("slot-rail")).toHaveStyle({
      width: "4.25rem",
    });
    expect(screen.getByTestId("studio-stage-header")).not.toBeNull();
    expect(screen.getByTestId("studio-stage-actions")).toHaveStyle({
      position: "absolute",
      width: "max-content",
      maxWidth: "calc(100% - 0.75rem)",
    });
  });

  it("keeps static editor dots inside the stage canvas only", () => {
    renderStudio("editing");

    const editorMain = screen.getByTestId("studio-editor-main");
    const stageCanvas = screen.getByTestId("studio-stage-canvas");

    expect(screen.queryByTestId("studio-editor-dots-base")).toBeNull();
    expect(screen.queryByTestId("studio-editor-dots-hover")).toBeNull();
    expect(screen.getByTestId("studio-stage-dots-base")).toBeInTheDocument();
    expect(screen.getByTestId("studio-stage-dots-hover")).toBeInTheDocument();

    fireEvent.mouseMove(editorMain, { clientX: 128, clientY: 96 });
    fireEvent.mouseMove(stageCanvas, { clientX: 160, clientY: 104 });

    expect(editorMain.style.getPropertyValue("--mouse-x")).toBe("");
    expect(editorMain.style.getPropertyValue("--mouse-y")).toBe("");
    expect(stageCanvas.style.getPropertyValue("--mouse-x")).toBe("160px");
    expect(stageCanvas.style.getPropertyValue("--mouse-y")).toBe("104px");
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
    expect(screen.getByTestId("studio-stage-actions")).toHaveStyle({
      width: "max-content",
      maxWidth: "calc(100% - 0.75rem)",
    });
    expect(screen.queryByTestId("studio-tool-rail")).toBeNull();
    expect(screen.queryByTestId("workflow-picker")).toBeNull();
    expect(screen.queryByTestId("upload-zone")).toBeNull();
    expect(StudioHeaderControlsMock).toHaveBeenCalledTimes(1);

    const barProps = StudioHeaderControlsMock.mock.calls[0][0];
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
    expect(screen.queryByTestId("studio-inspector-status-strip")).toBeNull();
    expect(screen.getByTestId("studio-output-preview-strip")).toBeVisible();
    expect(screen.getAllByTestId("studio-output-mini-preview")).toHaveLength(2);
    expect(screen.getByText("Adjust")).toBeVisible();
    expect(screen.getByText("Auto hotspot")).toBeVisible();
    expect(
      screen.queryByTestId("studio-inspector-actual-size-card")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("studio-inspector-summary-card")
    ).not.toBeInTheDocument();
  });

  it("keeps ANI editor dots inside the stage canvas only", () => {
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

    const editorMain = screen.getByTestId("ani-editor-shell-main");
    const stageCanvas = screen.getByTestId("studio-stage-canvas");

    expect(screen.queryByTestId("ani-editor-dots-base")).toBeNull();
    expect(screen.queryByTestId("ani-editor-dots-hover")).toBeNull();
    expect(screen.getByTestId("ani-stage-dots-base")).toBeInTheDocument();
    expect(screen.getByTestId("ani-stage-dots-hover")).toBeInTheDocument();

    fireEvent.mouseMove(editorMain, { clientX: 144, clientY: 120 });
    fireEvent.mouseMove(stageCanvas, { clientX: 180, clientY: 132 });

    expect(editorMain.style.getPropertyValue("--mouse-x")).toBe("");
    expect(editorMain.style.getPropertyValue("--mouse-y")).toBe("");
    expect(stageCanvas.style.getPropertyValue("--mouse-x")).toBe("180px");
    expect(stageCanvas.style.getPropertyValue("--mouse-y")).toBe("132px");
  });

  it("labels the current-slot download as an ANI file in animated editing", () => {
    renderStudio("ani-editing");

    const barProps = StudioHeaderControlsMock.mock.calls[0][0];

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

    const barProps = StudioHeaderControlsMock.mock.calls[0][0];

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

    fireEvent.change(screen.getByRole("slider", { name: /scale/i }), {
      target: { value: "1.25" },
    });
    fireEvent.change(screen.getByRole("slider", { name: /^offset y$/i }), {
      target: { value: "7" },
    });

    expect(setScaleMock).toHaveBeenLastCalledWith(1.25, "all-frames");
    expect(setOffsetMock).toHaveBeenLastCalledWith(0, 7, "all-frames");

    setScaleMock.mockClear();
    setOffsetMock.mockClear();
    setHotspotMock.mockClear();

    fireEvent.click(selectedFrame);
    fireEvent.change(screen.getByRole("slider", { name: /scale/i }), {
      target: { value: "1.5" },
    });
    fireEvent.change(screen.getByRole("slider", { name: /^offset x$/i }), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByRole("slider", { name: /^hotspot x$/i }), {
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
    expect(screen.getByRole("slider", { name: /^offset y$/i })).toHaveValue("-4");

    fireEvent.change(screen.getByRole("slider", { name: /^offset x$/i }), {
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

  it("reads the ANI inspector as a compact properties panel", () => {
    renderStudio("ani-editing");

    const header = screen.getByTestId("studio-stage-header");
    const inspector = screen.getByTestId("studio-inspector");
    const currentGroup = screen.getByTestId("studio-inspector-group-current");
    const outputGroup = screen.getByTestId("studio-inspector-group-image");
    const actualSize = within(outputGroup).getByText("Actual size");
    const size = within(outputGroup).getByText("Size");

    expect(within(header).getByRole("textbox", { name: /name/i })).toHaveValue(
      "orbit"
    );
    expect(within(header).queryByText("Normal Select")).toBeNull();
    expect(within(header).queryByText("ANI")).toBeNull();
    expect(within(header).queryByText("Recommended (t)")).toBeNull();
    expect(inspector).not.toBeNull();
    expect(inspector).toHaveStyle({
      backgroundColor: "var(--studio-chrome-bg)",
    });
    expect(within(currentGroup).getByText("Current cursor")).toBeVisible();
    expect(within(currentGroup).getByText("Role")).toBeVisible();
    expect(within(currentGroup).getByText("Normal Select")).toBeVisible();
    expect(within(currentGroup).getByText("File name")).toBeVisible();
    expect(within(currentGroup).getByText("orbit")).toBeVisible();
    expect(within(currentGroup).getByText("Format")).toBeVisible();
    expect(within(currentGroup).getByText("Animated")).toBeVisible();
    expect(
      within(inspector).queryByTestId("studio-inspector-status-strip")
    ).toBeNull();
    expect(screen.getByTestId("studio-output-preview-strip")).toBeVisible();
    expect(
      actualSize.compareDocumentPosition(size) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(within(inspector).getByText("Adjust")).toBeVisible();
    expect(screen.getByRole("button", { name: /center/i })).toHaveStyle({
      border: "1px solid var(--color-border)",
      backgroundColor: "var(--color-bg-primary)",
      padding: "0.35rem 0.55rem",
    });
    expect(within(inspector).getByText("Auto hotspot")).toBeVisible();
    expect(screen.queryByTestId("studio-hotspot-target")).toBeNull();
    expect(
      screen.getByRole("button", { name: /recommend hotspot again/i })
    ).toHaveStyle({
      border: "1px solid var(--color-border)",
      backgroundColor: "var(--color-bg-primary)",
      padding: "0.35rem 0.55rem",
    });
    expect(
      screen.queryByTestId("studio-inspector-summary-card")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("studio-inspector-actual-size-card")
    ).not.toBeInTheDocument();
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

  it("shows a contextual hotspot mode without the old inspector status summary", () => {
    renderStudio("editing", {
      cursor: {
        cursorName: "arrow",
        hotspotMode: "auto",
      },
    });

    const header = screen.getByTestId("studio-stage-header");
    const inspector = screen.getByTestId("studio-inspector");
    const currentGroup = screen.getByTestId("studio-inspector-group-current");

    expect(within(header).getByRole("textbox", { name: /name/i })).toHaveValue(
      "arrow"
    );
    expect(within(header).queryByText("Normal Select")).toBeNull();
    expect(within(header).queryByText(/CUR|STATIC/)).toBeNull();
    expect(within(header).queryByText("Recommended (t)")).toBeNull();
    expect(within(currentGroup).getByText("Current cursor")).toBeVisible();
    expect(within(currentGroup).getByText("Role")).toBeVisible();
    expect(within(currentGroup).getByText("Normal Select")).toBeVisible();
    expect(within(currentGroup).getByText("File name")).toBeVisible();
    expect(within(currentGroup).getByText("arrow")).toBeVisible();
    expect(within(currentGroup).getByText("Format")).toBeVisible();
    expect(within(currentGroup).getByText("Static")).toBeVisible();
    expect(
      within(inspector).queryByTestId("studio-inspector-status-strip")
    ).toBeNull();
    expect(inspector).toHaveStyle({
      backgroundColor: "var(--studio-chrome-bg)",
    });
    expect(within(inspector).getByText("Auto hotspot")).toBeVisible();
    expect(screen.getByRole("button", { name: /center/i })).toHaveStyle({
      border: "1px solid var(--color-border)",
      backgroundColor: "var(--color-bg-primary)",
      padding: "0.35rem 0.55rem",
    });
    expect(within(inspector).queryByText("Recommended (t)")).toBeNull();
    expect(
      screen.getByRole("button", { name: /recommend hotspot again/i })
    ).toHaveStyle({
      border: "1px solid var(--color-border)",
      backgroundColor: "var(--color-bg-primary)",
      padding: "0.35rem 0.55rem",
    });
  });

  it("renders the stage view zoom control in editing mode", () => {
    renderStudio("editing");

    expect(screen.getByRole("group", { name: "View zoom" })).toBeVisible();
    expect(screen.getByRole("button", { name: "1.5x" })).toBeVisible();
  });

  it("edits the static cursor name from the stage header instead of the inspector", () => {
    renderStudio("editing");

    const header = screen.getByTestId("studio-stage-header");
    const nameInput = within(header).getByRole("textbox", { name: /name/i });

    expect(nameInput).toHaveValue("cursor");

    fireEvent.change(nameInput, { target: { value: "cursor-alt" } });

    expect(setCursorNameMock).toHaveBeenCalledWith("cursor-alt");
    expect(
      within(screen.getByTestId("studio-inspector")).queryByTestId("name-input")
    ).toBeNull();
  });

  it("edits the animated cursor name from the stage header instead of the inspector", () => {
    renderStudio("ani-editing", {
      ani: {
        cursorName: "orbit",
      },
    });

    const header = screen.getByTestId("studio-stage-header");
    const nameInput = within(header).getByRole("textbox", { name: /name/i });

    expect(nameInput).toHaveValue("orbit");

    fireEvent.change(nameInput, { target: { value: "orbit-alt" } });

    expect(setCursorNameMock).toHaveBeenCalledWith("orbit-alt");
    expect(
      within(screen.getByTestId("studio-inspector")).queryByTestId("name-input")
    ).toBeNull();
  });

  it("shows actual-size previews before source and output size controls", () => {
    renderStudio("editing", {
      previewUrl: "blob:preview",
      cursor: {
        sourceWidth: 96,
        sourceHeight: 80,
        cursorSize: 48,
      },
    });

    const inspector = screen.getByTestId("studio-inspector");
    const outputGroup = screen.getByTestId("studio-inspector-group-image");
    const actualSize = within(outputGroup).getByText("Actual size");
    const size = within(outputGroup).getByText("Size");

    expect(within(inspector).getByText("Size")).toBeVisible();
    expect(
      actualSize.compareDocumentPosition(size) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(outputGroup).toHaveTextContent("Source size 96 x 80");
    expect(outputGroup).toHaveTextContent("Output size 48 x 48");
    expect(within(outputGroup).getAllByText("Size")).toHaveLength(1);
    expect(within(outputGroup).getByText("Fit whole")).toBeVisible();
    expect(screen.queryByText("Framing")).toBeNull();
  });

  it("starts the static simulation preview expanded and removes simple-view escape", () => {
    const project = createProject();
    project.slots.normalSelect = createStaticSlotAsset(
      "normalSelect",
      "blob:normal-preview"
    );

    renderStudio("editing", {
      project,
      cursor: createEditingCursor(),
    });

    expect(screen.getByTestId("studio-simulation-footer")).toBeVisible();
    expect(screen.getByTestId("studio-simulation-body")).toBeVisible();
    expect(screen.getByTestId("simulation")).not.toBeNull();
    expect(SimulationMock).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("button", { name: "Back to simple view" })
    ).toBeNull();

    fireEvent.click(screen.getByTestId("studio-simulation-toggle"));

    expect(screen.queryByTestId("studio-simulation-body")).toBeNull();
    expect(screen.queryByTestId("simulation")).toBeNull();
    expect(SimulationMock).toHaveBeenCalledTimes(1);
  });

  it("defaults the simulation preview to light mode when the current site theme is light", () => {
    document.documentElement.setAttribute("data-theme", "light");
    const project = createProject();
    project.slots.normalSelect = createStaticSlotAsset(
      "normalSelect",
      "blob:normal-preview"
    );

    renderStudio("editing", {
      project,
      cursor: createEditingCursor(),
    });

    expect(SimulationMock).toHaveBeenCalled();
    expect(SimulationMock.mock.calls.at(-1)?.[0]).toMatchObject({
      themeMode: "light",
    });
  });

  it("defaults the simulation preview to dark mode when the current site theme is dark", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    const project = createProject();
    project.slots.normalSelect = createStaticSlotAsset(
      "normalSelect",
      "blob:normal-preview"
    );

    renderStudio("editing", {
      project,
      cursor: createEditingCursor(),
    });

    expect(SimulationMock).toHaveBeenCalled();
    expect(SimulationMock.mock.calls.at(-1)?.[0]).toMatchObject({
      themeMode: "dark",
    });
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

    fireEvent.click(screen.getByRole("button", { name: "Fine-tune" }));
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
    searchParamsState.current = new URLSearchParams(
      "workflow=cur-static-image"
    );

    renderStudio("editing", {
      selectedSlotId: "textSelect",
      cursor: null,
      experienceMode: "quick",
    });

    expect(screen.getByTestId("studio-quick-start")).toBeVisible();
    expect(screen.getByTestId("studio-quick-start-static")).toBeVisible();
    expect(screen.queryByTestId("studio-tool-rail")).toBeNull();
    expect(screen.queryByTestId("cursor-canvas")).toBeNull();
    expect(StudioHeaderControlsMock.mock.calls[0][0].canDownload).toBe(false);
  });

  it("shows the dotted static and GIF chooser when switching to an empty slot from the editor", () => {
    const project = createProject();
    project.slots.normalSelect = createStaticSlotAsset(
      "normalSelect",
      "blob:normal-preview"
    );

    let currentStudioReturn = createStudioReturn("editing", {
      project,
      selectedSlotId: "normalSelect",
      cursor: createEditingCursor(),
      previewUrl: "blob:preview",
    });

    useStudioMock.mockImplementation(() => currentStudioReturn);

    const view = render(<StudioPage />);

    fireEvent.click(screen.getByRole("button", { name: "Fine-tune" }));

    currentStudioReturn = createStudioReturn("editing", {
      project,
      selectedSlotId: "textSelect",
      cursor: null,
      previewUrl: null,
    });

    view.rerender(<StudioPage />);

    expect(screen.queryByTestId("studio-editor-dots-base")).toBeNull();
    expect(screen.queryByTestId("studio-editor-dots-hover")).toBeNull();
    expect(screen.getByTestId("studio-empty-slot-state")).toBeVisible();
    expect(screen.getByTestId("studio-empty-slot-dots-base")).toBeInTheDocument();
    expect(screen.getByTestId("studio-empty-slot-dots-hover")).toBeInTheDocument();
    expect(screen.getByTestId("studio-simulation-footer")).toHaveStyle({
      height: "3rem",
      flexBasis: "3rem",
    });
    expect(screen.queryByTestId("studio-simulation-body")).toBeNull();
    expect(screen.getByTestId("studio-simulation-toggle")).toHaveTextContent(
      "Expand"
    );
    expect(screen.queryByTestId("studio-selection-summary")).toBeNull();
    expect(screen.queryByTestId("studio-inspector-compact-guidance")).toBeNull();
    expect(screen.getByTestId("studio-inspector-group-current")).toBeVisible();
    expect(screen.getByTestId("studio-inspector-group-source")).toBeVisible();
    expect(
      within(screen.getByTestId("studio-inspector-group-current")).getByText(
        "Text Select"
      )
    ).toBeVisible();
    expect(
      within(screen.getByTestId("studio-inspector-group-current")).getByText(
        "Empty"
      )
    ).toBeVisible();
    expect(
      within(screen.getByTestId("studio-inspector-group-current")).getByText(
        "Unset"
      )
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Start with Static Image" })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Start with Animated GIF" })
    ).toBeVisible();
  });

  it("keeps the editor shell when an empty slot is selected after starting from the ANI workflow", () => {
    searchParamsState.current = new URLSearchParams(
      "workflow=ani-animated-gif"
    );
    const project = createProject();
    project.slots.normalSelect = createAnimatedSlotAsset(
      "normalSelect",
      "blob:normal-preview"
    );

    let currentStudioReturn = createStudioReturn("ani-editing", {
      project,
      selectedSlotId: "normalSelect",
    });

    useStudioMock.mockImplementation(() => currentStudioReturn);

    const view = render(<StudioPage />);

    expect(screen.getByTestId("ani-editor-shell")).toBeVisible();

    fireEvent.click(screen.getByTestId("slot-title-textSelect"));

    expect(selectSlotMock).toHaveBeenCalledWith("textSelect");

    currentStudioReturn = createStudioReturn("editing", {
      project,
      selectedSlotId: "textSelect",
      cursor: null,
      previewUrl: null,
    });

    view.rerender(<StudioPage />);

    expect(screen.getByTestId("studio-app-shell")).toBeVisible();
    expect(screen.getByTestId("studio-empty-slot-state")).toBeVisible();
    expect(screen.getByTestId("studio-simulation-footer")).toHaveStyle({
      height: "3rem",
      flexBasis: "3rem",
    });
    expect(screen.queryByTestId("studio-simulation-body")).toBeNull();
    expect(screen.getByTestId("studio-inspector-group-current")).toBeVisible();
    expect(screen.getByTestId("studio-inspector-group-source")).toBeVisible();
    expect(screen.queryByTestId("studio-selection-summary")).toBeNull();
    expect(screen.queryByTestId("studio-quick-start")).toBeNull();
  });

  it("keeps uploaded background-removal choice inside the quick flow", () => {
    renderStudio("uploaded", {
      experienceMode: "quick",
    });

    expect(screen.getByTestId("studio-quick-background-decision")).toBeVisible();
    expect(screen.queryByTestId("background-removal-decision-dock")).toBeNull();
    expect(screen.queryByTestId("cursor-canvas")).toBeNull();
    expect(screen.queryByTestId("studio-tool-rail")).toBeNull();
    expect(screen.queryByTestId("studio-inspector-empty-notice")).toBeNull();
    expect(screen.queryByTestId("upload-zone")).toBeNull();
  });

  it("keeps the processing state in the quick background decision position", () => {
    renderStudio("processing", {
      experienceMode: "quick",
    });

    expect(screen.getByTestId("studio-quick-background-processing")).toBeVisible();
  });

  it("accepts dropped files in the quick-start source surfaces", () => {
    const staticFile = new File(["static"], "cursor.png", { type: "image/png" });
    searchParamsState.current = new URLSearchParams(
      "workflow=cur-static-image"
    );

    renderStudio("editing", {
      cursor: null,
      experienceMode: "quick",
    });

    fireEvent.drop(screen.getByTestId("studio-quick-start-static"), {
      dataTransfer: { files: [staticFile] },
    });

    expect(selectSlotStaticFileMock).toHaveBeenCalledWith(staticFile);
    expect(selectFileMock).not.toHaveBeenCalled();
    expect(selectAniFileMock).not.toHaveBeenCalled();
  });

  it("does not expose GIF Maker routing on the quick static surface", () => {
    const firstFrame = new File(["one"], "frame-01.png", { type: "image/png" });
    const secondFrame = new File(["two"], "frame-02.webp", { type: "image/webp" });
    searchParamsState.current = new URLSearchParams(
      "workflow=cur-static-image"
    );

    renderStudio("editing", {
      cursor: null,
      experienceMode: "quick",
    });

    fireEvent.drop(screen.getByTestId("studio-quick-start-static"), {
      dataTransfer: { files: [firstFrame, secondFrame] },
    });

    expect(selectSlotStaticFileMock).toHaveBeenCalledWith(firstFrame);
    expect(selectFileMock).not.toHaveBeenCalled();
    expect(selectSlotImageSequenceFilesMock).not.toHaveBeenCalled();
  });

  it("routes quick-start uploads to the selected empty role", () => {
    const staticFile = new File(["static"], "text-role.png", {
      type: "image/png",
    });
    searchParamsState.current = new URLSearchParams(
      "workflow=cur-static-image"
    );

    renderStudio("editing", {
      selectedSlotId: "textSelect",
      cursor: null,
      experienceMode: "quick",
    });

    fireEvent.drop(screen.getByTestId("studio-quick-start-static"), {
      dataTransfer: { files: [staticFile] },
    });

    expect(selectSlotStaticFileMock).toHaveBeenCalledWith(staticFile);
    expect(selectFileMock).not.toHaveBeenCalled();
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

  it("highlights the quick-start static surface during drag", () => {
    searchParamsState.current = new URLSearchParams(
      "workflow=cur-static-image"
    );

    renderStudio("editing", {
      cursor: null,
      experienceMode: "quick",
    });

    const staticButton = screen.getByTestId("studio-quick-start-static");

    fireEvent.dragEnter(staticButton, { dataTransfer: { files: [] } });

    expect(staticButton).toHaveAttribute("data-drag-active", "true");
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

    const barProps = StudioHeaderControlsMock.mock.calls.at(-1)?.[0];
    expect(barProps.canDownload).toBe(true);
    expect(barProps.canSecondaryDownload).toBe(true);
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

    const barProps = StudioHeaderControlsMock.mock.calls.at(-1)?.[0];
    expect(barProps.canDownload).toBe(true);
    expect(barProps.canSecondaryDownload).toBe(true);
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

    expect(StudioHeaderControlsMock.mock.calls[0][0].canDownload).toBe(false);
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

  it("shows borderless cursor position sliders and wires them to offset updates", () => {
    renderStudio("editing");

    const offsetXInput = screen.getByRole("slider", { name: /offset x/i });
    const offsetYInput = screen.getByRole("slider", { name: /offset y/i });

    expect(offsetXInput).toHaveAttribute("data-borderless", "true");
    expect(offsetYInput).toHaveAttribute("data-borderless", "true");
    expect(offsetXInput).toHaveValue("0");
    expect(offsetYInput).toHaveValue("0");

    fireEvent.change(offsetXInput, { target: { value: "14" } });
    fireEvent.change(offsetYInput, { target: { value: "-8" } });

    expect(setOffsetMock).toHaveBeenNthCalledWith(1, 14, 0);
    expect(setOffsetMock).toHaveBeenNthCalledWith(2, 0, -8);
  });

  it("lets the scale value text edit the static inspector slider", () => {
    renderStudio("editing");

    fireEvent.click(screen.getByRole("button", { name: /edit scale value/i }));
    const input = screen.getByRole("textbox", { name: /scale value/i });

    expect(input).toHaveValue("100");

    fireEvent.change(input, { target: { value: "150" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(setScaleMock).toHaveBeenLastCalledWith(1.5);
  });

  it("shows hotspot sliders and wires them to hotspot updates", () => {
    renderStudio("editing");

    const hotspotXInput = screen.getByRole("slider", { name: /hotspot x/i });
    const hotspotYInput = screen.getByRole("slider", { name: /hotspot y/i });

    expect(hotspotXInput).toHaveValue("24");
    expect(hotspotYInput).toHaveValue("18");

    fireEvent.change(hotspotXInput, { target: { value: "11" } });
    fireEvent.change(hotspotYInput, { target: { value: "7" } });

    expect(setHotspotMock).toHaveBeenNthCalledWith(1, 11, 18);
    expect(setHotspotMock).toHaveBeenNthCalledWith(2, 24, 7);
  });

  it("shows hotspot sliders for ani editing and wires them to hotspot updates", () => {
    renderStudio("ani-editing");

    const hotspotXInput = screen.getByRole("slider", { name: /hotspot x/i });
    const hotspotYInput = screen.getByRole("slider", { name: /hotspot y/i });

    expect(hotspotXInput).toHaveValue("24");
    expect(hotspotYInput).toHaveValue("18");

    fireEvent.change(hotspotXInput, { target: { value: "9" } });
    fireEvent.change(hotspotYInput, { target: { value: "5" } });

    expect(setHotspotMock).toHaveBeenNthCalledWith(1, 9, 18);
    expect(setHotspotMock).toHaveBeenNthCalledWith(2, 24, 5);
  });
});

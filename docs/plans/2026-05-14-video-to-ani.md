# Video to ANI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Studio workflow that turns an uploaded video into an ordered frame sequence and opens the existing ANI editor so users can export a Windows `.ani` cursor.

**Architecture:** Do not build a separate video editor. Add `Video to ANI` as another source maker: `video file -> extracted PNG frame sequence -> existing image-sequence AniData -> current ANI timeline/editor/export`. Frame extraction should run client-side with `HTMLVideoElement` and `canvas` in v1, with a testable dependency-injection seam so unit tests do not depend on real browser media decoding.

**Tech Stack:** Next.js 15, React 19, TypeScript, HTMLVideoElement, Canvas, Vitest, React Testing Library, Playwright/browser QA, existing Pointint ANI editor/export path

---

## Execution Status

> **Updated:** 2026-05-14
> **Status:** implemented / QA passed / ready for commit

Implemented:

- Added a selectable Studio `Video to ANI` workflow card.
- Added client-side MP4/WebM frame extraction with 3s / 10fps / 30-frame defaults.
- Reused the existing image-sequence ANI editor and export path.
- Added Korean and English upload/progress copy.

QA evidence:

- `npm exec vitest run tests/studio/workflow-picker.test.tsx tests/i18n-ko-slot-copy.test.ts tests/lib/video-frame-sequence.test.ts tests/studio/use-studio-workflow.test.tsx tests/components/studio-quick-start.test.tsx tests/studio/studio-entry-gate.test.tsx tests/studio/studio-entry-analytics.test.tsx tests/header.test.tsx tests/components/studio-bar.test.tsx` passed: 9 files / 152 tests.
- `npm test --` passed: 61 files / 353 tests.
- `npm run build` passed after clearing stale `.next` build output.
- Browser QA passed on `/studio?workflow=ani-video-to-ani`: generated a valid WebM in browser, uploaded it through the video surface, and confirmed the ANI editor opened with extracted timeline frames.

Follow-up:

- Keep MOV/HEVC, backend FFmpeg, and trim UI as follow-up options.

---

## Scope

### In Scope

- Add a selectable `Video to ANI` workflow card in Studio.
- Accept `.mp4` and `.webm` video uploads in v1.
- Extract the first short segment of the video into PNG frame files.
- Convert extracted frames into the existing `sourceKind: "image-sequence"` ANI model.
- Open the existing ANI editor timeline after extraction.
- Preserve frame duration so exported `.ani` timing matches the selected extraction preset.
- Add Korean and English copy together.
- Add unit/component/integration tests before implementation.
- Browser-QA the full workflow from `/studio?workflow=ani-video-to-ani` to ANI editor/export readiness.

### Out of Scope

- MOV/HEVC support. Browser support is inconsistent; solve later with backend/FFmpeg if needed.
- Full video trimming UI. v1 extracts a compact default segment, then users can delete/reorder frames in the existing timeline.
- Backend video processing. Keep v1 frontend-only unless browser extraction proves impossible.
- New `.ani` exporter. Reuse the current backend/export route.
- Auth-backed saved projects.

## Product Decision

Use this v1 behavior:

```text
Studio workflow picker
-> Video to ANI
-> Upload MP4/WebM
-> Extract first 3 seconds at 10 fps, capped at 30 frames
-> Open existing ANI editor timeline
-> User can delete/reorder/change frame timing
-> Export ANI cursor
```

Reasoning:

- It matches the user's mental model from tools like ezgif without creating a separate editor surface.
- The current timeline already solves frame cleanup, ordering, timing, transform, hotspot, GIF save, and ANI export.
- The default cap prevents large videos from freezing the browser.
- A trim UI can be added later after the core source-maker path is proven.

---

### Task 1: Add the Video to ANI workflow option

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\studioWorkflow.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\en.json`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\ko.json`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\workflow-picker.test.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\i18n-ko-slot-copy.test.ts`

**Step 1: Write the failing workflow-picker test**

Add assertions that Studio renders an available `Video to ANI` card in the ANI group:

```ts
expect(screen.getByTestId("workflow-card-ani-video-to-ani")).toHaveClass(
  "workflow-picker-card--available"
);
expect(
  screen.getByRole("button", { name: /video to ani|동영상/i })
).toBeEnabled();
```

Add a click assertion:

```ts
await user.click(screen.getByTestId("workflow-card-ani-video-to-ani"));
expect(onSelectWorkflow).toHaveBeenCalledWith("ani-video-to-ani");
```

**Step 2: Write the failing i18n test**

Add required key coverage:

```ts
expect(ko.upload.aniVideoToAni).toBeTruthy();
expect(ko.upload.aniVideoToAniSub).toBeTruthy();
expect(en.upload.aniVideoToAni).toBeTruthy();
expect(en.upload.aniVideoToAniSub).toBeTruthy();
```

**Step 3: Run tests to verify failure**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/workflow-picker.test.tsx tests/i18n-ko-slot-copy.test.ts
```

Expected: FAIL because `ani-video-to-ani` and its messages do not exist.

**Step 4: Implement the workflow option**

Update `studioWorkflow.ts`:

```ts
export type WorkflowOptionId =
  | "cur-static-image"
  | "cur-ai-generate"
  | "ani-multiple-pngs"
  | "ani-animated-gif"
  | "ani-video-to-ani"
  | "ani-ai-generate";

export const ANI_VIDEO_TO_ANI_WORKFLOW_ID: WorkflowOptionId =
  "ani-video-to-ani";
```

Add the option near the existing ANI source makers:

```ts
{
  id: "ani-video-to-ani",
  family: "ani",
  titleKey: "aniVideoToAni",
  descriptionKey: "aniVideoToAniSub",
  availability: "available",
}
```

Update `isSelectableWorkflow`:

```ts
workflowId === ANI_VIDEO_TO_ANI_WORKFLOW_ID
```

Add messages.

English:

```json
"aniVideoToAni": "Video to ANI",
"aniVideoToAniSub": "Turn a short MP4 or WebM clip into an animated Windows cursor"
```

Korean:

```json
"aniVideoToAni": "동영상으로 애니메이션 만들기",
"aniVideoToAniSub": "짧은 MP4 또는 WebM 영상을 애니메이션 Windows 커서로 바꿉니다"
```

**Step 5: Run tests to verify pass**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/workflow-picker.test.tsx tests/i18n-ko-slot-copy.test.ts
```

Expected: PASS.

**Step 6: Commit**

```powershell
git add frontend/src/lib/studioWorkflow.ts frontend/src/i18n/messages/en.json frontend/src/i18n/messages/ko.json frontend/tests/studio/workflow-picker.test.tsx frontend/tests/i18n-ko-slot-copy.test.ts
git commit -m "feat(studio): add video to ani workflow option"
```

---

### Task 2: Build a testable video frame extractor

**Files:**

- Create: `C:\Users\amy\Desktop\pointint\frontend\src\lib\videoFrameSequence.ts`
- Create: `C:\Users\amy\Desktop\pointint\frontend\tests\lib\video-frame-sequence.test.ts`

**Step 1: Write the failing extractor tests**

Test the pure extraction contract with mocked dependencies:

```ts
it("extracts capped PNG frames with stable durations", async () => {
  const file = new File(["video"], "cat.webm", { type: "video/webm" });
  const blob = new Blob(["png"], { type: "image/png" });
  const captureFrame = vi.fn(async () => document.createElement("canvas"));

  const result = await extractVideoFrameFiles(
    file,
    { durationMs: 3000, fps: 10, maxFrames: 30 },
    {
      loadMetadata: async () => ({
        width: 640,
        height: 360,
        durationMs: 5000,
      }),
      captureFrame,
      canvasToBlob: async () => blob,
    }
  );

  expect(result.width).toBe(640);
  expect(result.height).toBe(360);
  expect(result.frames).toHaveLength(30);
  expect(result.frames[0]?.durationMs).toBe(100);
  expect(result.frames[0]?.file.name).toBe("cat-frame-001.png");
  expect(captureFrame).toHaveBeenCalledWith(file, 0, expect.anything());
  expect(captureFrame).toHaveBeenLastCalledWith(file, 2900, expect.anything());
});
```

Also test:

```ts
it("uses the video duration when the clip is shorter than the default segment", async () => {});
it("throws when metadata has no drawable size", async () => {});
it("throws when fewer than two frames can be extracted", async () => {});
it("sanitizes frame file names", async () => {});
```

**Step 2: Run the test to verify failure**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/lib/video-frame-sequence.test.ts
```

Expected: FAIL because `videoFrameSequence.ts` does not exist.

**Step 3: Implement the types and constants**

Create:

```ts
export const DEFAULT_VIDEO_TO_ANI_DURATION_MS = 3000;
export const DEFAULT_VIDEO_TO_ANI_FPS = 10;
export const DEFAULT_VIDEO_TO_ANI_MAX_FRAMES = 30;

export interface ExtractedVideoFrameFile {
  file: File;
  durationMs: number;
}

export interface ExtractedVideoFrameSequence {
  width: number;
  height: number;
  frames: ExtractedVideoFrameFile[];
}

export interface ExtractVideoFrameOptions {
  startMs?: number;
  durationMs?: number;
  fps?: number;
  maxFrames?: number;
}
```

**Step 4: Implement dependency injection**

Use this shape so tests do not rely on real media decoding:

```ts
interface VideoMetadata {
  width: number;
  height: number;
  durationMs: number;
}

interface ExtractVideoFrameDependencies {
  loadMetadata?: (file: File) => Promise<VideoMetadata>;
  captureFrame?: (
    file: File,
    timeMs: number,
    metadata: VideoMetadata
  ) => Promise<HTMLCanvasElement>;
  canvasToBlob?: (canvas: HTMLCanvasElement) => Promise<Blob>;
}
```

**Step 5: Implement `extractVideoFrameFiles`**

The important behavior:

```ts
const fps = clampPositiveInteger(options.fps, DEFAULT_VIDEO_TO_ANI_FPS);
const frameDurationMs = Math.round(1000 / fps);
const usableDurationMs = Math.min(
  options.durationMs ?? DEFAULT_VIDEO_TO_ANI_DURATION_MS,
  Math.max(0, metadata.durationMs - startMs)
);
const frameCount = Math.min(
  options.maxFrames ?? DEFAULT_VIDEO_TO_ANI_MAX_FRAMES,
  Math.floor(usableDurationMs / frameDurationMs)
);
```

Rules:

- Throw if width or height is missing.
- Throw if `frameCount < 2`.
- Capture frames at `startMs + index * frameDurationMs`.
- Convert each canvas to PNG.
- Name frames as `<safe-stem>-frame-001.png`.
- Use `durationMs: frameDurationMs` on every extracted frame.

**Step 6: Implement browser metadata and capture helpers**

Implementation notes:

- `loadVideoMetadata(file)` creates an object URL, attaches it to a `<video>`, waits for `loadedmetadata`, then revokes the URL.
- `captureVideoFrame(file, timeMs, metadata)` creates a video element, seeks to `timeMs / 1000`, waits for `seeked`, draws into a canvas sized to `metadata.width x metadata.height`, then revokes the URL.
- Keep helpers small because browser media APIs are brittle.
- Use event listeners with cleanup and reject on `error`.

**Step 7: Run extractor tests**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/lib/video-frame-sequence.test.ts
```

Expected: PASS.

**Step 8: Commit**

```powershell
git add frontend/src/lib/videoFrameSequence.ts frontend/tests/lib/video-frame-sequence.test.ts
git commit -m "feat(studio): extract video frames for ani source"
```

---

### Task 3: Wire video extraction into `useStudio`

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-workflow.test.tsx`

**Step 1: Mock the extractor in the workflow test**

Extend the current `gifFrameSequence` mock pattern with `videoFrameSequence`:

```ts
const extractVideoFrameFilesMock = vi.fn();

vi.mock("@/lib/videoFrameSequence", () => ({
  extractVideoFrameFiles: extractVideoFrameFilesMock,
}));
```

**Step 2: Write the failing hook test**

Add:

```ts
it("creates an image-sequence ANI from a video file", async () => {
  extractVideoFrameFilesMock.mockResolvedValueOnce({
    width: 640,
    height: 360,
    frames: [
      { file: new File(["a"], "video-frame-001.png", { type: "image/png" }), durationMs: 100 },
      { file: new File(["b"], "video-frame-002.png", { type: "image/png" }), durationMs: 100 },
    ],
  });

  const { result } = renderUseStudio();
  const file = new File(["video"], "cat.webm", { type: "video/webm" });

  await act(async () => {
    await result.current.selectVideoFile(file);
  });

  expect(extractVideoFrameFilesMock).toHaveBeenCalledWith(file);
  expect(result.current.state).toBe("ani-editing");
  expect(result.current.ani?.sourceKind).toBe("image-sequence");
  expect(result.current.ani?.frames).toHaveLength(2);
  expect(result.current.ani?.frames[0]?.durationMs).toBe(100);
});
```

Add a selected-slot variant:

```ts
await result.current.selectSelectedSlotVideoFile(file);
expect(result.current.selectedSlotId).toBe("normal");
expect(result.current.project.slots.normal.kind).toBe("animated");
```

Add an error variant:

```ts
extractVideoFrameFilesMock.mockRejectedValueOnce(new Error("Unsupported video"));
await result.current.selectVideoFile(file);
expect(result.current.error).toBe("Unsupported video");
```

**Step 3: Run the hook test to verify failure**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-workflow.test.tsx
```

Expected: FAIL because video selection functions do not exist.

**Step 4: Import the extractor**

Add:

```ts
import {
  extractVideoFrameFiles,
  type ExtractedVideoFrameSequence,
} from "./videoFrameSequence";
```

**Step 5: Add video-to-AniData helper**

Add beside `createAniFromExtractedGifFrames`:

```ts
function createAniFromExtractedVideoFrames(
  extractedVideo: ExtractedVideoFrameSequence,
  slotId: WindowsRoleSlotId
): AniData {
  return createAniFromFrameFiles(extractedVideo.frames, slotId, {
    preserveOrder: true,
    sourceWidth: extractedVideo.width,
    sourceHeight: extractedVideo.height,
  });
}
```

**Step 6: Add `uploadVideoFileToSlot`**

Implement a sibling to `uploadImageSequenceFilesToSlot`:

```ts
const uploadVideoFileToSlot = useCallback(
  async (slotId: WindowsRoleSlotId, file: File) => {
    trackEvent("upload_started", {
      input_kind: "video",
      slot_id: slotId,
      source: "studio",
    });

    const requestId = beginAssetLoadRequest();
    const previous = takeSnapshot();
    clearActiveHistoryAction();
    setError(null);
    cleanupSlotReplacement(slotId);
    clearPreview();
    cancelBgRemovalRequest();
    setState("ani-upload");

    try {
      const extractedVideo = await extractVideoFrameFiles(file);
      if (!isAssetLoadRequestActive(requestId)) return;

      const nextAni = createAniFromExtractedVideoFrames(extractedVideo, slotId);
      const dimensions = await loadImageDimensions(nextAni.originalUrl);
      if (!isAssetLoadRequestActive(requestId)) {
        revokeAniObjectUrls(nextAni);
        return;
      }

      const hydratedFrames = await loadAniFrameDimensions(
        nextAni.frames,
        dimensions,
        () => isAssetLoadRequestActive(requestId)
      );
      if (!hydratedFrames) {
        revokeAniObjectUrls(nextAni);
        return;
      }

      const hydratedAni = syncAniActiveFrame({
        ...nextAni,
        frames: hydratedFrames,
      });

      const { historySnapshot, replacedAni } =
        prepareImageSequenceReplacementSnapshot(previous, slotId);

      pushHistoryForAction(historySnapshot, "replaceSlot");
      setCursor(null);
      setAni(hydratedAni);
      commitSlotState(slotId, createAnimatedSlotState(hydratedAni));
      setState("ani-editing");

      if (replacedAni?.sourceKind === "image-sequence") {
        revokeAniObjectUrlsNotRetained(replacedAni, [
          ...undoStackRef.current,
          ...redoStackRef.current,
        ]);
      }
    } catch (err) {
      if (!isAssetLoadRequestActive(requestId)) return;
      setError(err instanceof Error ? err.message : "Failed to extract video");
      setState("editing");
    }
  },
  [/* same dependency discipline as image sequence upload */]
);
```

**Step 7: Expose selection functions**

Add:

```ts
const selectVideoFile = useCallback(
  (file: File) => uploadVideoFileToSlot(DEFAULT_PRIMARY_ROLE_SLOT_ID, file),
  [uploadVideoFileToSlot]
);

const selectSelectedSlotVideoFile = useCallback(
  (file: File) => uploadVideoFileToSlot(selectedSlotId, file),
  [selectedSlotId, uploadVideoFileToSlot]
);
```

Return both from the hook.

**Step 8: Run hook tests**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-workflow.test.tsx
```

Expected: PASS.

**Step 9: Commit**

```powershell
git add frontend/src/lib/useStudio.ts frontend/tests/studio/use-studio-workflow.test.tsx
git commit -m "feat(studio): route video uploads into ani editor"
```

---

### Task 4: Extend `StudioQuickStart` for video uploads

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioQuickStart.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\components\studio-quick-start.test.tsx`

**Step 1: Write the failing component test**

Add:

```ts
it("can use a video as the primary guide upload", async () => {
  const onVideoFile = vi.fn();

  render(
    <StudioQuickStart
      title="Video to ANI"
      description="Upload a short clip"
      staticUploadLabel="Choose image"
      staticUploadDescription="Image"
      videoUploadLabel="Choose video"
      videoUploadDescription="MP4 or WebM"
      primarySource="video"
      onStaticFile={vi.fn()}
      onVideoFile={onVideoFile}
    />
  );

  const surface = screen.getByTestId("studio-quick-start-video");
  const input = surface.querySelector("input[type='file']") as HTMLInputElement;
  const file = new File(["video"], "cat.webm", { type: "video/webm" });

  await userEvent.upload(input, file);

  expect(onVideoFile).toHaveBeenCalledWith(file);
  expect(input.accept).toContain(".webm");
  expect(input.accept).toContain(".mp4");
});
```

Also test drag/drop:

```ts
fireEvent.drop(surface, {
  dataTransfer: { files: [new File(["video"], "cat.mp4", { type: "video/mp4" })] },
});
expect(onVideoFile).toHaveBeenCalled();
```

**Step 2: Run component test to verify failure**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/studio-quick-start.test.tsx
```

Expected: FAIL because `primarySource="video"` is unsupported.

**Step 3: Extend props and type**

Update:

```ts
type QuickStartPrimarySource =
  | "static"
  | "animated"
  | "image-sequence"
  | "video";
```

Add props:

```ts
videoUploadLabel?: string;
videoUploadDescription?: string;
onVideoFile?: (file: File) => void;
busy?: boolean;
busyLabel?: string;
busyDescription?: string;
```

**Step 4: Add video upload config**

Add to `getPrimaryUploadConfig`:

```ts
if (primarySource === "video") {
  return {
    dataTestId: "studio-quick-start-video",
    label: videoUploadLabel ?? staticUploadLabel,
    description: videoUploadDescription ?? staticUploadDescription,
    accept: "video/mp4,video/webm,.mp4,.webm",
    multiple: false,
    handleFiles: (files: FileList | File[]) => {
      const videoFile = Array.from(files).find(isVideoFile);
      if (videoFile) {
        onVideoFile?.(videoFile);
      }
    },
  };
}
```

Add helper:

```ts
function isVideoFile(file: File) {
  if (file.type) {
    return file.type === "video/mp4" || file.type === "video/webm";
  }

  return /\.(mp4|webm)$/i.test(file.name);
}
```

**Step 5: Add busy state support**

When `busy` is true:

- Disable the click target.
- Replace label with `busyLabel`.
- Replace description with `busyDescription`.
- Keep the card height stable.

**Step 6: Run component tests**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/studio-quick-start.test.tsx
```

Expected: PASS.

**Step 7: Commit**

```powershell
git add frontend/src/components/StudioQuickStart.tsx frontend/tests/components/studio-quick-start.test.tsx
git commit -m "feat(studio): support video quick start uploads"
```

---

### Task 5: Wire the Studio page route and copy

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\en.json`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\ko.json`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Extend the StudioPage hook mock**

Add mock functions to the test setup:

```ts
const selectVideoFileMock = vi.fn();
const selectSelectedSlotVideoFileMock = vi.fn();
```

Return:

```ts
selectVideoFile: selectVideoFileMock,
selectSelectedSlotVideoFile: selectSelectedSlotVideoFileMock,
```

**Step 2: Write the failing route test**

Add:

```ts
it("routes the Video to ANI workflow guide to video upload", async () => {
  setSearchParams("workflow=ani-video-to-ani");
  renderStudioPage();

  expect(screen.queryByTestId("workflow-picker")).toBeNull();
  const videoSurface = screen.getByTestId("studio-quick-start-video");
  const input = videoSurface.querySelector("input[type='file']") as HTMLInputElement;
  const file = new File(["video"], "cat.webm", { type: "video/webm" });

  await userEvent.upload(input, file);

  expect(selectVideoFileMock).toHaveBeenCalledWith(file);
});
```

Add a loading-state test:

```ts
it("shows video extraction progress while the hook is in ani-upload state", () => {
  setSearchParams("workflow=ani-video-to-ani");
  mockUseStudioState({ state: "ani-upload" });
  renderStudioPage();

  expect(screen.getByText(/extracting|프레임/i)).toBeInTheDocument();
});
```

**Step 3: Run test to verify failure**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
```

Expected: FAIL because StudioPage does not know the video workflow.

**Step 4: Import the workflow constant**

Add:

```ts
ANI_VIDEO_TO_ANI_WORKFLOW_ID,
```

from `@/lib/studioWorkflow`.

**Step 5: Destructure hook functions**

Add:

```ts
selectVideoFile,
selectSelectedSlotVideoFile,
```

from `useStudio()`.

**Step 6: Extend `getQuickStartConfig`**

Add:

```ts
if (workflowId === ANI_VIDEO_TO_ANI_WORKFLOW_ID) {
  return {
    title: tu("aniVideoToAni"),
    description: tu("aniVideoToAniSub"),
    primarySource: "video" as const,
  };
}
```

**Step 7: Pass video props into `StudioQuickStart`**

Add:

```tsx
videoUploadLabel={tu("aniVideoToAni")}
videoUploadDescription={tu("aniVideoToAniSub")}
busy={state === "ani-upload" && activeWorkflowId === ANI_VIDEO_TO_ANI_WORKFLOW_ID}
busyLabel={t("videoExtractingTitle")}
busyDescription={t("videoExtractingDescription")}
onVideoFile={
  quickStartConfig.primarySource === "video"
    ? (file) => {
        setExperienceMode("advanced");
        if (activeWorkflowId === ANI_VIDEO_TO_ANI_WORKFLOW_ID) {
          selectVideoFile(file);
          return;
        }

        selectSelectedSlotVideoFile(file);
      }
    : undefined
}
```

**Step 8: Add Studio copy**

English:

```json
"videoExtractingTitle": "Extracting frames...",
"videoExtractingDescription": "Pointint is turning the video into editable animation frames."
```

Korean:

```json
"videoExtractingTitle": "프레임을 추출하는 중...",
"videoExtractingDescription": "동영상을 편집 가능한 애니메이션 프레임으로 바꾸고 있습니다."
```

**Step 9: Run route tests**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
```

Expected: PASS.

**Step 10: Commit**

```powershell
git add frontend/src/app/studio/page.tsx frontend/src/i18n/messages/en.json frontend/src/i18n/messages/ko.json frontend/tests/studio/studio-entry-gate.test.tsx
git commit -m "feat(studio): wire video workflow into studio"
```

---

### Task 6: Add analytics coverage for the new source maker

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-analytics.test.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`

**Step 1: Write the failing analytics test**

Add:

```ts
it("tracks Video to ANI workflow selection and video upload start", async () => {
  renderStudioPageWithSearch("workflow=ani-video-to-ani");

  expect(trackEventMock).toHaveBeenCalledWith("studio_opened", {
    source: "studio",
    workflow: "ani-video-to-ani",
  });

  await act(async () => {
    await result.current.selectVideoFile(
      new File(["video"], "cat.webm", { type: "video/webm" })
    );
  });

  expect(trackEventMock).toHaveBeenCalledWith("upload_started", {
    input_kind: "video",
    slot_id: "normal",
    source: "studio",
  });
});
```

**Step 2: Run analytics test to verify failure**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-analytics.test.tsx
```

Expected: FAIL until workflow ID and upload tracking are fully wired.

**Step 3: Implement minimal analytics alignment**

Keep existing event names. Only add `workflow: "ani-video-to-ani"` and `input_kind: "video"` where the current system already tracks comparable source-maker actions.

Do not create new analytics event names unless the existing event cannot represent the action.

**Step 4: Run analytics test**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-analytics.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```powershell
git add frontend/tests/studio/studio-entry-analytics.test.tsx frontend/src/lib/useStudio.ts
git commit -m "test(studio): cover video to ani analytics"
```

---

### Task 7: Browser QA the workflow

**Files:**

- No production file changes expected.
- Optional fixture: `C:\Users\amy\Desktop\pointint\frontend\tests\fixtures\video-to-ani-sample.webm`

**Step 1: Create or source a tiny video fixture**

Preferred:

- Use a very small WebM fixture under `frontend/tests/fixtures`.
- Keep it under 200 KB.
- Use a simple 1-2 second clip with visible motion.

If adding a binary fixture is not desirable, use manual QA with a local test video and record the exact file used in the QA note.

**Step 2: Run the app on port 3000**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm run dev -- --port 3000
```

**Step 3: Browser-check the route**

Open:

```text
http://localhost:3000/studio?workflow=ani-video-to-ani
```

Verify:

- Workflow picker is skipped.
- Main upload surface says Video to ANI.
- MP4/WebM upload is accepted.
- Extraction progress appears and does not collapse the layout.
- Existing ANI editor opens after extraction.
- Timeline shows multiple frames.
- Frame durations are around 100ms by default.
- `ANI 커서` download remains available.
- `GIF 저장` still works if the current GIF export path supports image sequences.
- Browser console has no errors.

**Step 4: Run automated tests**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm test --
npm run build
```

Expected: both PASS.

**Step 5: Record QA evidence**

Update this plan under `Execution Status` with:

- focused test result
- full test result
- build result
- browser QA route
- fixture name or manual file used

**Step 6: Commit only if QA changed docs or fixtures**

```powershell
git add docs/plans/2026-05-14-video-to-ani.md frontend/tests/fixtures/video-to-ani-sample.webm
git commit -m "test(studio): verify video to ani workflow"
```

---

### Task 8: Update sprint docs after implementation

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\point\06-Implementation\ACTIVE_SPRINT.md`
- Modify: `C:\Users\amy\Desktop\pointint\docs\plans\2026-05-14-video-to-ani.md`

**Step 1: Update execution status**

Add near the top of this plan:

```markdown
## Execution Status

> **Updated:** YYYY-MM-DD
> **Status:** implemented / QA passed / ready to commit

Implemented:

- Video to ANI workflow card is selectable.
- MP4/WebM uploads extract into image-sequence ANI frames.
- Existing ANI editor opens with extracted frames.
- ANI export path remains unchanged.

QA evidence:

- `npm exec vitest run ...` passed.
- `npm test --` passed.
- `npm run build` passed.
- Browser QA passed on `/studio?workflow=ani-video-to-ani`.
```

**Step 2: Update active sprint**

Move `Phase 1.5 / Video to ANI` from `queued` to `complete` only after browser QA passes.

If implementation is partial, keep it as `in progress` and list the exact blocker.

**Step 3: Commit docs**

```powershell
git add point/06-Implementation/ACTIVE_SPRINT.md docs/plans/2026-05-14-video-to-ani.md
git commit -m "docs: update video to ani sprint status"
```

---

## Testing Commands

Run focused tests during implementation:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/workflow-picker.test.tsx
npm exec vitest run tests/lib/video-frame-sequence.test.ts
npm exec vitest run tests/studio/use-studio-workflow.test.tsx
npm exec vitest run tests/components/studio-quick-start.test.tsx
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
npm exec vitest run tests/studio/studio-entry-analytics.test.tsx
```

Run full verification before commit/push:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm test --
npm run build
```

---

## Acceptance Criteria

- `/studio?workflow=ani-video-to-ani` opens directly to a video upload surface.
- `.mp4` and `.webm` uploads are accepted.
- Video extraction produces at least two editable timeline frames.
- Default extraction is capped at 30 frames and about 3 seconds.
- Extracted frame durations are preserved in the ANI timeline.
- Existing timeline interactions still work: select, delete, reorder, per-frame duration, transform, hotspot.
- Existing ANI export still works.
- Existing GIF Maker and Animated GIF workflows are not regressed.
- Korean and English copy both render without missing-message errors.
- Browser console has no runtime errors during the Video to ANI happy path.

---

## Follow-Up Options

- Add a compact trim/preset step before extraction: start time, duration, FPS.
- Add backend FFmpeg extraction for MOV/HEVC and longer videos.
- Add a public `/tools/video-to-ani-cursor` SEO page after the Studio workflow is stable.
- Add a sample video fixture and visual smoke test if binary fixtures are acceptable.
- Add a source-kind value like `sourceKind: "video-sequence"` only if analytics or UX later needs to distinguish video-derived sequences from image-derived sequences inside the editor.

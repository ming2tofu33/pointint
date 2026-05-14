# Video to ANI Controls Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users choose a compact extraction range and FPS before uploading a video into the existing Video to ANI workflow.

**Architecture:** Keep Video to ANI as a source-maker, not a separate video editor. Add a small pre-upload control strip to the current video quick-start surface, pass the selected options through `StudioPage -> useStudio -> extractVideoFrameFiles`, and continue opening the existing image-sequence ANI editor after extraction.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, React Testing Library, Playwright/browser QA, existing `HTMLVideoElement` + canvas frame extraction

---

## Execution Status

> **Updated:** 2026-05-14
> **Status:** implemented / QA passed

Implemented:

- Added start-time, duration, and FPS controls to the Video to ANI upload surface.
- Preserved current defaults: start `0s`, duration `3s`, FPS `10`, max frames `30`.
- Passed selected extraction options into the existing browser frame extractor.
- Kept post-extraction editing in the existing ANI timeline.

QA evidence:

- Focused suite passed: `134` tests across extractor, workflow hook, quick-start, route, and i18n coverage.
- Full frontend test suite passed: `359` tests.
- Production build passed with `npm run build`.
- Browser QA passed on `/studio?workflow=ani-video-to-ani`: changed settings to `0s / 1s / 6fps`, uploaded a real WebM sample, and entered the ANI editor with `5` extracted frames and no console errors.

---

## Product Decision

Use a compact pre-upload settings strip:

```text
Video to ANI
Extract settings
Start: [0.0 s]
Length: [1s] [2s] [3s]
FPS: [6] [10] [15]
Estimate: up to N frames
Upload MP4/WebM
```

Reasoning:

- Users need control before extraction, not after the file is already converted.
- The existing ANI timeline already handles delete/reorder/per-frame timing after extraction.
- Numeric start time plus preset duration/FPS gives enough control without turning this into a full video editor.
- Keeping max frames fixed at `30` protects browser performance and avoids another decision.

---

## Scope

### In Scope

- Show Video to ANI extraction controls only when `StudioQuickStart` uses `primarySource="video"`.
- Support:
  - start time in seconds, numeric input, min `0`, step `0.1`
  - duration presets: `1s`, `2s`, `3s`
  - FPS presets: `6`, `10`, `15`
  - estimated frame count from selected duration/FPS, capped at `30`
- Pass options into both primary-role and selected-slot video uploads.
- Add Korean and English copy together.
- Add focused unit/component/page tests before implementation.
- Browser-QA the happy path with a generated WebM.

### Out of Scope

- Drag handles / timeline trimming UI.
- Video preview thumbnails before extraction.
- MOV/HEVC support.
- Backend FFmpeg extraction.
- Exposing max-frame controls to users.

---

## Data Model

Use the existing extractor options shape:

```ts
export interface ExtractVideoFrameOptions {
  startMs?: number;
  durationMs?: number;
  fps?: number;
  maxFrames?: number;
}
```

Add a UI-focused normalized type near the quick-start component or in `videoFrameSequence.ts`:

```ts
export interface VideoToAniQuickOptions {
  startMs: number;
  durationMs: number;
  fps: number;
}
```

Default:

```ts
const DEFAULT_VIDEO_TO_ANI_QUICK_OPTIONS: VideoToAniQuickOptions = {
  startMs: 0,
  durationMs: DEFAULT_VIDEO_TO_ANI_DURATION_MS,
  fps: DEFAULT_VIDEO_TO_ANI_FPS,
};
```

Frame estimate:

```ts
function getVideoToAniFrameEstimate(options: VideoToAniQuickOptions) {
  return Math.min(
    DEFAULT_VIDEO_TO_ANI_MAX_FRAMES,
    Math.floor(options.durationMs / Math.round(1000 / options.fps))
  );
}
```

---

### Task 1: Pass video extraction options through `useStudio`

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-workflow.test.tsx`

**Step 1: Write the failing hook test**

Update the existing video upload test to pass options:

```ts
await act(async () => {
  await result.current.selectVideoFile(file, {
    startMs: 500,
    durationMs: 2000,
    fps: 15,
  });
  await Promise.resolve();
});

expect(extractVideoFrameFilesMock).toHaveBeenCalledWith(file, {
  startMs: 500,
  durationMs: 2000,
  fps: 15,
});
```

Add equivalent selected-slot coverage:

```ts
await act(async () => {
  await result.current.selectSelectedSlotVideoFile(file, {
    startMs: 1200,
    durationMs: 1000,
    fps: 6,
  });
  await Promise.resolve();
});

expect(extractVideoFrameFilesMock).toHaveBeenCalledWith(file, {
  startMs: 1200,
  durationMs: 1000,
  fps: 6,
});
```

**Step 2: Run test to verify failure**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-workflow.test.tsx
```

Expected: FAIL because `selectVideoFile` and `selectSelectedSlotVideoFile` currently accept only `file`.

**Step 3: Implement minimal hook plumbing**

Import the type:

```ts
import type { ExtractVideoFrameOptions } from "./videoFrameSequence";
```

Change internal upload signature:

```ts
const uploadVideoFileToSlot = useCallback(
  async (
    slotId: WindowsRoleSlotId,
    file: File,
    options: ExtractVideoFrameOptions = {}
  ) => {
    // existing code
    const extractedVideo = await extractVideoFrameFiles(file, options);
  },
  [/* existing deps */]
);
```

Change public functions:

```ts
const selectVideoFile = useCallback(
  (file: File, options?: ExtractVideoFrameOptions) =>
    uploadVideoFileToSlot(DEFAULT_PRIMARY_ROLE_SLOT_ID, file, options),
  [uploadVideoFileToSlot]
);

const selectSelectedSlotVideoFile = useCallback(
  (file: File, options?: ExtractVideoFrameOptions) =>
    uploadVideoFileToSlot(selectedSlotId, file, options),
  [selectedSlotId, uploadVideoFileToSlot]
);
```

**Step 4: Run test to verify pass**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-workflow.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```powershell
git add frontend/src/lib/useStudio.ts frontend/tests/studio/use-studio-workflow.test.tsx
git commit -m "feat(studio): pass video extraction options"
```

---

### Task 2: Add the compact Video to ANI controls to quick start

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioQuickStart.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\components\studio-quick-start.test.tsx`

**Step 1: Write the failing component test**

Add a test that renders video quick-start and verifies the controls:

```tsx
render(
  <StudioQuickStart
    title="Video to ANI"
    description="Turn video into frames"
    staticUploadLabel="Upload image"
    staticUploadDescription="PNG"
    videoUploadLabel="Upload video"
    videoUploadDescription="MP4 or WebM"
    primarySource="video"
    videoOptionsCopy={{
      title: "Extract settings",
      startLabel: "Start",
      durationLabel: "Length",
      fpsLabel: "FPS",
      frameEstimate: (count) => `Up to ${count} frames`,
    }}
    onStaticFile={vi.fn()}
    onVideoFile={onVideoFile}
  />
);

expect(screen.getByText("Extract settings")).toBeInTheDocument();
expect(screen.getByLabelText("Start")).toHaveValue(0);
expect(screen.getByRole("button", { name: "3s" })).toHaveAttribute(
  "aria-pressed",
  "true"
);
expect(screen.getByRole("button", { name: "10 fps" })).toHaveAttribute(
  "aria-pressed",
  "true"
);
expect(screen.getByText("Up to 30 frames")).toBeInTheDocument();
```

Add a test that changing controls affects upload:

```tsx
fireEvent.change(screen.getByLabelText("Start"), {
  target: { value: "1.5" },
});
fireEvent.click(screen.getByRole("button", { name: "2s" }));
fireEvent.click(screen.getByRole("button", { name: "15 fps" }));

fireEvent.change(input, { target: { files: [file] } });

expect(onVideoFile).toHaveBeenCalledWith(file, {
  startMs: 1500,
  durationMs: 2000,
  fps: 15,
});
```

**Step 2: Run test to verify failure**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/studio-quick-start.test.tsx
```

Expected: FAIL because the controls and second callback parameter do not exist.

**Step 3: Implement the UI state and callback**

Extend props:

```ts
interface StudioQuickStartProps {
  // existing props
  videoOptionsCopy?: VideoToAniOptionsCopy;
  onVideoFile?: (file: File, options: VideoToAniQuickOptions) => void;
}

interface VideoToAniOptionsCopy {
  title: string;
  startLabel: string;
  durationLabel: string;
  fpsLabel: string;
  frameEstimate: (count: number) => string;
}
```

Add local state:

```ts
const [videoOptions, setVideoOptions] = useState<VideoToAniQuickOptions>({
  startMs: 0,
  durationMs: DEFAULT_VIDEO_TO_ANI_DURATION_MS,
  fps: DEFAULT_VIDEO_TO_ANI_FPS,
});
```

Render controls before the upload click target only for `primarySource === "video"`:

```tsx
{isPrimary && primarySource === "video" && videoOptionsCopy ? (
  <VideoToAniOptionsPanel
    copy={videoOptionsCopy}
    value={videoOptions}
    onChange={setVideoOptions}
  />
) : null}
```

Pass options on upload:

```ts
if (videoFile) {
  onVideoFile?.(videoFile, videoOptions);
}
```

**Step 4: Implement minimal accessible controls**

Use segmented buttons:

```tsx
const DURATION_OPTIONS = [1000, 2000, 3000];
const FPS_OPTIONS = [6, 10, 15];
```

Start input:

```tsx
<input
  aria-label={copy.startLabel}
  type="number"
  min={0}
  step={0.1}
  value={value.startMs / 1000}
  onChange={(event) => {
    const seconds = Number(event.currentTarget.value);
    onChange({
      ...value,
      startMs: Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : 0,
    });
  }}
/>
```

Duration and FPS buttons:

```tsx
<button
  type="button"
  aria-pressed={value.durationMs === durationMs}
  onClick={() => onChange({ ...value, durationMs })}
>
  {durationMs / 1000}s
</button>
```

**Step 5: Run test to verify pass**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/studio-quick-start.test.tsx
```

Expected: PASS.

**Step 6: Commit**

```powershell
git add frontend/src/components/StudioQuickStart.tsx frontend/tests/components/studio-quick-start.test.tsx
git commit -m "feat(studio): add video extraction controls"
```

---

### Task 3: Wire StudioPage copy and route-level behavior

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\en.json`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\ko.json`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\i18n-ko-slot-copy.test.ts`

**Step 1: Write failing i18n key coverage**

Add assertions:

```ts
expect(en.studio.videoOptionsTitle).toBe("Extract settings");
expect(ko.studio.videoOptionsTitle).toBe("추출 설정");
expect(en.studio.videoStartLabel).toBe("Start");
expect(ko.studio.videoStartLabel).toBe("시작");
expect(en.studio.videoDurationLabel).toBe("Length");
expect(ko.studio.videoDurationLabel).toBe("길이");
expect(en.studio.videoFpsLabel).toBe("FPS");
expect(ko.studio.videoFpsLabel).toBe("FPS");
expect(en.studio.videoFrameEstimate).toBeTruthy();
expect(ko.studio.videoFrameEstimate).toBeTruthy();
```

**Step 2: Write failing page route test**

In `studio-entry-gate.test.tsx`, add a Video to ANI test:

```tsx
renderStudio("editing", { cursor: null, experienceMode: "quick" });

fireEvent.change(screen.getByLabelText("Start"), {
  target: { value: "1.5" },
});
fireEvent.click(screen.getByRole("button", { name: "2s" }));
fireEvent.click(screen.getByRole("button", { name: "15 fps" }));

fireEvent.change(input, { target: { files: [file] } });

expect(selectVideoFileMock).toHaveBeenCalledWith(file, {
  startMs: 1500,
  durationMs: 2000,
  fps: 15,
});
```

**Step 3: Run tests to verify failure**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx tests/i18n-ko-slot-copy.test.ts
```

Expected: FAIL because StudioPage does not pass option copy or option values.

**Step 4: Add messages**

English:

```json
"videoOptionsTitle": "Extract settings",
"videoStartLabel": "Start",
"videoDurationLabel": "Length",
"videoFpsLabel": "FPS",
"videoFrameEstimate": "Up to {count} frames"
```

Korean:

```json
"videoOptionsTitle": "추출 설정",
"videoStartLabel": "시작",
"videoDurationLabel": "길이",
"videoFpsLabel": "FPS",
"videoFrameEstimate": "최대 {count}프레임"
```

**Step 5: Wire StudioPage**

Pass the copy object:

```tsx
videoOptionsCopy={{
  title: t("videoOptionsTitle"),
  startLabel: t("videoStartLabel"),
  durationLabel: t("videoDurationLabel"),
  fpsLabel: t("videoFpsLabel"),
  frameEstimate: (count) => t("videoFrameEstimate", { count }),
}}
```

Update callback signatures:

```tsx
onVideoFile={
  quickStartConfig.primarySource === "video"
    ? (file, options) => {
        setExperienceMode("advanced");
        if (activeWorkflowId === ANI_VIDEO_TO_ANI_WORKFLOW_ID) {
          selectVideoFile(file, options);
          return;
        }

        selectSelectedSlotVideoFile(file, options);
      }
    : undefined
}
```

**Step 6: Run tests to verify pass**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx tests/i18n-ko-slot-copy.test.ts
```

Expected: PASS.

**Step 7: Commit**

```powershell
git add frontend/src/app/studio/page.tsx frontend/src/i18n/messages/en.json frontend/src/i18n/messages/ko.json frontend/tests/studio/studio-entry-gate.test.tsx frontend/tests/i18n-ko-slot-copy.test.ts
git commit -m "feat(studio): wire video extraction settings"
```

---

### Task 4: Extractor edge coverage for option behavior

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\lib\video-frame-sequence.test.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\videoFrameSequence.ts` only if tests reveal a bug

**Step 1: Write focused option tests**

Add tests that lock current extractor behavior:

```ts
it("uses start, duration, and fps to choose capture times", async () => {
  const capturedTimes: number[] = [];

  await extractVideoFrameFiles(
    file,
    { startMs: 500, durationMs: 2000, fps: 4 },
    {
      loadMetadata: async () => ({
        width: 100,
        height: 100,
        durationMs: 5000,
      }),
      captureFrame: async (_file, timeMs) => {
        capturedTimes.push(timeMs);
        return document.createElement("canvas");
      },
      canvasToBlob: async () => new Blob(["png"], { type: "image/png" }),
    }
  );

  expect(capturedTimes).toEqual([500, 750, 1000, 1250, 1500, 1750, 2000, 2250]);
});
```

Add a frame-cap test:

```ts
it("caps high fps extraction at 30 frames", async () => {
  const result = await extractVideoFrameFiles(file, {
    durationMs: 3000,
    fps: 30,
    maxFrames: 30,
  }, dependencies);

  expect(result.frames).toHaveLength(30);
});
```

**Step 2: Run test**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/lib/video-frame-sequence.test.ts
```

Expected: PASS. If it fails, fix only the extractor behavior needed by the tests.

**Step 3: Commit**

```powershell
git add frontend/tests/lib/video-frame-sequence.test.ts frontend/src/lib/videoFrameSequence.ts
git commit -m "test(studio): cover video extraction options"
```

---

### Task 5: Browser QA and documentation closeout

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\docs\plans\2026-05-14-video-to-ani-controls.md`
- Modify: `C:\Users\amy\Desktop\pointint\point\06-Implementation\ACTIVE_SPRINT.md`

**Step 1: Run focused tests**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/lib/video-frame-sequence.test.ts tests/studio/use-studio-workflow.test.tsx tests/components/studio-quick-start.test.tsx tests/studio/studio-entry-gate.test.tsx tests/i18n-ko-slot-copy.test.ts
```

Expected: PASS.

**Step 2: Run full verification**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm test --
npm run build
```

Expected: PASS.

**Step 3: Browser QA**

Start dev server:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm run dev -- --port 3000
```

Open:

```text
http://localhost:3000/studio?workflow=ani-video-to-ani
```

Verify:

- Video to ANI upload surface is visible.
- Extraction settings are visible.
- Changing start/duration/FPS updates the frame estimate.
- Uploading a generated WebM enters the ANI editor.
- Extracted frame count matches the selected duration/FPS within the `30` frame cap.
- Browser console has no runtime errors.

**Step 4: Update docs**

Update this plan's `Execution Status`:

```markdown
> **Status:** implemented / QA passed / ready for commit

QA evidence:

- focused tests passed
- `npm test --` passed
- `npm run build` passed
- Browser QA passed on `/studio?workflow=ani-video-to-ani`
```

Update `ACTIVE_SPRINT.md`:

- Move `Video to ANI Controls` to complete.
- Add follow-up choices: video preview thumbnail, trim UI, MOV/HEVC backend extraction.

**Step 5: Commit docs**

```powershell
git add docs/plans/2026-05-14-video-to-ani-controls.md point/06-Implementation/ACTIVE_SPRINT.md
git commit -m "docs: update video to ani controls status"
```

---

## Testing Commands

Focused:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/lib/video-frame-sequence.test.ts
npm exec vitest run tests/studio/use-studio-workflow.test.tsx
npm exec vitest run tests/components/studio-quick-start.test.tsx
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
npm exec vitest run tests/i18n-ko-slot-copy.test.ts
```

Full:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm test --
npm run build
```

---

## Acceptance Criteria

- `/studio?workflow=ani-video-to-ani` shows extraction controls before upload.
- Defaults remain `0s`, `3s`, `10fps`.
- Users can change start time, duration, and FPS before selecting a file.
- Upload passes selected options to `extractVideoFrameFiles`.
- Frame estimate updates when duration/FPS changes.
- Video extraction still caps at 30 frames.
- Existing GIF Maker and image-sequence workflows are not regressed.
- Korean and English copy render without missing-message errors.
- Browser QA confirms the selected settings produce editable ANI timeline frames.

---

## Follow-Up Options

- Add a tiny video preview thumbnail beside the controls.
- Add a real trim scrubber if users need visual start/end selection.
- Add backend FFmpeg extraction for MOV/HEVC.
- Add `/tools/video-to-ani-cursor` once controls are stable.

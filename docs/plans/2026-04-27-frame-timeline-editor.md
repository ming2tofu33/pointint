# Frame Timeline Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a frame timeline editor for image-sequence ANI sources so users can select, reorder, delete, time, and individually adjust frames while keeping hotspot global.

**Architecture:** Extend the existing `AniData` image-sequence path from a flat shared-edit model into a global-baseline plus per-frame override model. The frontend owns frame selection, effective edit resolution, canvas preview, timeline controls, and pre-export frame rasterization; the backend only needs per-frame duration support for packaging rendered PNG frames into `.ani`.

**Tech Stack:** Next.js App Router, React, TypeScript, next-intl, Vitest, FastAPI, Python, Pillow, Pytest, Playwright CLI for final UI-flow verification

---

### Task 1: Add frame-edit model helpers

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\lib\aniFrameEdits.ts`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\lib\ani-frame-edits.test.ts`

**Step 1: Write the failing test**

Cover these behaviors:

- `resolveAniFrameEdit(globalEdit, frame)` returns global values when the frame has no override.
- frame override values replace only the provided fields.
- `createAniFrameId()` returns stable unique ids for imported frames.
- `createAniFramesFromFiles(files)` sorts by filename and assigns default `durationMs = 100`.

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm test -- tests/lib/ani-frame-edits.test.ts
```

Expected: FAIL because the helper file does not exist.

**Step 2: Implement the helper module**

Add:

```ts
export type AniFrameEdit = {
  fitMode: FitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
};

export type AniFrameEditOverride = Partial<AniFrameEdit>;
```

Include helpers for defaults, effective edit resolution, frame id generation, and safe duration clamping.

**Step 3: Run test to verify it passes**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm test -- tests/lib/ani-frame-edits.test.ts
```

Expected: PASS.

**Step 4: Commit**

```powershell
git add frontend/src/lib/aniFrameEdits.ts frontend/src/lib/useStudio.ts frontend/tests/lib/ani-frame-edits.test.ts
git commit -m "feat(studio): add ani frame edit helpers"
```

### Task 2: Migrate image-sequence state to selected frames

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-workflow.test.tsx`

**Step 1: Write the failing test**

Add tests that:

- uploading an image sequence creates frame ids, dimensions, duration, and selected first frame.
- selecting a frame changes the active frame without changing global hotspot.
- replacing an image sequence revokes all old frame URLs.
- undo/redo preserves selected frame and frame overrides.

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm test -- tests/studio/use-studio-workflow.test.tsx
```

Expected: FAIL because frames do not yet contain the new model fields.

**Step 2: Implement state migration**

Update `AniData` so image-sequence sources can store:

- `frames[]` with ids, dimensions, duration, and `editOverride`
- `selectedFrameId`
- `globalEdit`

Keep compatibility accessors for existing GIF behavior until the editor UI is migrated.

**Step 3: Run test to verify it passes**

Run the same test command.

Expected: PASS.

**Step 4: Commit**

```powershell
git add frontend/src/lib/useStudio.ts frontend/tests/studio/use-studio-workflow.test.tsx
git commit -m "feat(studio): track selected ani sequence frames"
```

### Task 3: Build frame timeline component

**Files:**
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniFrameTimeline.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\ani-frame-timeline.test.tsx`

**Step 1: Write the failing test**

Cover:

- renders frame count and total duration.
- clicking a thumbnail selects the frame.
- delete action is disabled when only two frames remain.
- move previous / move next actions emit reordered frame ids.
- modified frames show a visible edited marker.

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm test -- tests/components/ani-frame-timeline.test.tsx
```

Expected: FAIL because the component does not exist.

**Step 2: Implement component**

Use a compact horizontal strip with explicit buttons. Do not implement drag reorder in this slice.

**Step 3: Run test to verify it passes**

Run the same test command.

Expected: PASS.

**Step 4: Commit**

```powershell
git add frontend/src/components/AniFrameTimeline.tsx frontend/tests/components/ani-frame-timeline.test.tsx
git commit -m "feat(studio): add ani frame timeline"
```

### Task 4: Wire timeline actions into `useStudio`

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-workflow.test.tsx`

**Step 1: Write the failing test**

Add tests for:

- `selectAniFrame(frameId)`
- `deleteAniFrame(frameId)`
- `moveAniFrame(frameId, direction)`
- `setAniFrameDuration(frameId, durationMs)`
- `resetSelectedAniFrameEdit()`

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm test -- tests/studio/use-studio-workflow.test.tsx -t "ani frame"
```

Expected: FAIL because actions do not exist.

**Step 2: Implement actions**

All actions must push undo history once per user action and must not allow fewer than two image-sequence frames.

**Step 3: Run test to verify it passes**

Run the same test command.

Expected: PASS.

**Step 4: Commit**

```powershell
git add frontend/src/lib/useStudio.ts frontend/tests/studio/use-studio-workflow.test.tsx
git commit -m "feat(studio): add ani frame timeline actions"
```

### Task 5: Edit selected frame on canvas

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniEditorShell.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-workflow.test.tsx`

**Step 1: Write the failing test**

Cover:

- selected frame URL is passed to `CursorCanvas`.
- changing scale/offset in `Selected frame` scope writes a frame override.
- changing scale/offset in `All frames` scope writes the global baseline.
- hotspot changes remain global.

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm test -- tests/studio/studio-entry-gate.test.tsx tests/studio/use-studio-workflow.test.tsx
```

Expected: FAIL because editor scope does not exist.

**Step 2: Implement edit scope**

Add an edit-scope segmented control to the inspector:

- `All frames`
- `Selected frame`

Keep default scope as `All frames`.

**Step 3: Run test to verify it passes**

Run the same test command.

Expected: PASS.

**Step 4: Commit**

```powershell
git add frontend/src/components/AniEditorShell.tsx frontend/src/app/studio/page.tsx frontend/src/lib/useStudio.ts frontend/tests/studio/studio-entry-gate.test.tsx frontend/tests/studio/use-studio-workflow.test.tsx
git commit -m "feat(studio): edit selected ani frames"
```

### Task 6: Add timeline playback preview

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniFrameTimeline.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniEditorShell.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\ani-frame-timeline.test.tsx`

**Step 1: Write the failing test**

Cover:

- play starts advancing frames by duration.
- pause stops advancement.
- manual frame selection pauses playback.
- total duration is displayed.

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm test -- tests/components/ani-frame-timeline.test.tsx
```

Expected: FAIL because playback controls do not exist.

**Step 2: Implement playback**

Use `setTimeout` based on selected frame duration. Pause before editing gestures.

**Step 3: Run test to verify it passes**

Run the same test command.

Expected: PASS.

**Step 4: Commit**

```powershell
git add frontend/src/components/AniFrameTimeline.tsx frontend/src/components/AniEditorShell.tsx frontend/tests/components/ani-frame-timeline.test.tsx
git commit -m "feat(studio): preview ani frame timeline playback"
```

### Task 7: Render per-frame edits before export

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\api.ts`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-workflow.test.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\lib\api.test.ts`

**Step 1: Write the failing test**

Cover:

- `createAniExportDownload()` rasterizes every image-sequence frame with its effective edit.
- generated sequence request sends rendered frame blobs, not only original files.
- per-frame durations are sent in order.
- GIF upload still calls the GIF ANI endpoint.

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm test -- tests/studio/use-studio-workflow.test.tsx tests/lib/api.test.ts
```

Expected: FAIL because export still sends original image files with shared geometry.

**Step 2: Implement export rendering**

Use existing square rasterization utilities for each frame. Pass backend neutral geometry for already-rendered frames and send global hotspot.

**Step 3: Run test to verify it passes**

Run the same test command.

Expected: PASS.

**Step 4: Commit**

```powershell
git add frontend/src/lib/useStudio.ts frontend/src/lib/api.ts frontend/tests/studio/use-studio-workflow.test.tsx frontend/tests/lib/api.test.ts
git commit -m "feat(studio): export per-frame ani edits"
```

### Task 8: Support per-frame durations in backend sequence ANI

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\backend\app\api\ani.py`
- Modify: `C:\Users\amy\Desktop\pointint\backend\app\services\ani.py`
- Test: `C:\Users\amy\Desktop\pointint\backend\tests\test_ani.py`

**Step 1: Write the failing test**

Add API and service tests for:

- two frames with different durations produce valid ANI.
- duration count must match frame count when supplied.
- invalid duration values return `400`.

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\backend
.venv\Scripts\python.exe -m pytest tests/test_ani.py -k sequence -v
```

Expected: FAIL because sequence route only accepts shared duration.

**Step 2: Implement duration list support**

Accept a JSON list field such as `durations_ms`. Keep `duration_ms` as backward-compatible fallback.

**Step 3: Run test to verify it passes**

Run the same test command.

Expected: PASS.

**Step 4: Commit**

```powershell
git add backend/app/api/ani.py backend/app/services/ani.py backend/tests/test_ani.py
git commit -m "feat(backend): support ani frame durations"
```

### Task 9: Make image-sequence simulation preview use frames

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniSimulation.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\aniPreviewFrames.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\slotSimulationSources.ts`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\lib\ani-preview-frames.test.ts`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\ani-simulation.test.tsx`

**Step 1: Write the failing test**

Cover:

- image-sequence preview builds from frame URLs and durations.
- preview does not try to decode the first frame as a GIF.
- simulation uses effective edited frames.

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm test -- tests/lib/ani-preview-frames.test.ts tests/components/ani-simulation.test.tsx
```

Expected: FAIL because the current preview path is GIF-decoder oriented.

**Step 2: Implement frame-list preview source**

Add a code path that accepts already-known frame URLs and durations.

**Step 3: Run test to verify it passes**

Run the same test command.

Expected: PASS.

**Step 4: Commit**

```powershell
git add frontend/src/components/AniSimulation.tsx frontend/src/lib/aniPreviewFrames.ts frontend/src/lib/slotSimulationSources.ts frontend/tests/lib/ani-preview-frames.test.ts frontend/tests/components/ani-simulation.test.tsx
git commit -m "feat(studio): preview image sequence frames"
```

### Task 10: End-to-end verification

**Files:**
- No source edits expected unless verification finds a defect.

**Step 1: Run frontend test suite**

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm test
```

Expected: PASS.

**Step 2: Run backend ANI tests**

```powershell
cd C:\Users\amy\Desktop\pointint\backend
.venv\Scripts\python.exe -m pytest tests/test_ani.py -v
```

Expected: PASS.

**Step 3: Build frontend**

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm run build
```

Expected: PASS.

**Step 4: Verify with Playwright**

Use Playwright CLI against Studio:

```powershell
cd C:\Users\amy\Desktop\pointint
npx --yes --package @playwright/cli playwright-cli open http://localhost:3000/studio
```

Verify:

- drop two image frames
- timeline appears
- selected-frame edit marks only one frame as edited
- global hotspot remains unchanged
- export succeeds

**Step 5: Commit final polish if needed**

```powershell
git status --short
git add <verified-fix-files>
git commit -m "fix(studio): polish ani frame timeline editor"
```


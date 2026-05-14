# Video to ANI Background Removal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users optionally remove backgrounds from frames extracted by the Video to ANI workflow before entering the ANI editor.

> **Status:** Implemented / QA passed on 2026-05-14.
>
> **Implementation commits:**
> - `81936a9 feat(studio): add video frame background decision state`
> - `c3ddb40 feat(studio): remove backgrounds from extracted video frames`
> - `dc650de feat(studio): add ani background decision UI`
> - `d1c32de feat(studio): prompt for video frame background removal`
>
> **QA evidence:**
> - Focused tests passed: `npm exec vitest run tests/studio/use-studio-workflow.test.tsx tests/components/ani-background-decision.test.tsx tests/studio/studio-entry-gate.test.tsx tests/i18n-ko-slot-copy.test.ts`
> - Full test suite passed: `npm test --` with 367 tests.
> - Production build passed: `npm run build`.
> - Browser QA passed for `Video to ANI upload -> background decision -> Use as is -> ANI editor`.
> - Live browser QA did not run the paid frame-by-frame removal path; that path is covered by hook, component, route, failure-state, and i18n tests.

**Architecture:** Keep Video to ANI as `video -> extracted PNG frames -> optional frame background cleanup -> existing ANI editor`. Do not auto-remove backgrounds because frame-by-frame AI removal can be slow and can introduce flicker. Add a small post-extraction decision step that lets users choose `use as is` or `remove background`, then commit the final image sequence into the existing slot/editor model.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, React Testing Library, existing `removeBackground(file)` API, existing `trimTransparentImageBlob`, existing image-sequence ANI editor/export path

---

## Product Decision

Use a post-extraction choice:

```text
Video frames extracted
Preview: first 3 frames

[Use as is]
[Remove background from frames]
```

If the user chooses background removal:

```text
Removing backgrounds
7 / 30 frames processed
```

Reasoning:

- PNG supports transparency, but extracted video frames are still opaque until we remove pixels.
- Users should not pay the time cost unless they need transparency.
- This avoids making the first upload screen feel more complex.
- It reuses the existing ANI editor after the media is ready.

---

## Scope

### In Scope

- Show the decision only for frames extracted from Video to ANI.
- Let the user continue with original frames.
- Let the user run existing AI background removal across extracted frames.
- Preserve frame order, frame durations, selected slot, hotspot defaults, and image-sequence editing behavior.
- Show frame-processing progress.
- Add Korean and English copy together.
- Add focused hook, component, route, and i18n tests.

### Out of Scope

- Automatic background removal by default.
- Per-frame manual mask editing.
- Video-aware temporal segmentation model.
- Chroma-key/solid-color removal UI.
- Backend batch endpoint.
- Parallel processing tuning beyond safe v1 behavior.

---

## Implementation Shape

### State

Add a dedicated state instead of overloading static-slot background decisions:

```ts
export type StudioState =
  | "workflow-pick"
  | "cur-upload"
  | "ani-upload"
  | "ani-background-decision"
  | "ani-background-processing"
  | "uploaded"
  | "processing"
  | "editing"
  | "ani-editing";
```

Add hook state near ANI upload state:

```ts
interface PendingAniBackgroundDecision {
  slotId: WindowsRoleSlotId;
  ani: AniData;
  previous: StudioSnapshot;
}

interface AniBackgroundProgress {
  completed: number;
  total: number;
}
```

### Flow

Current:

```text
selectVideoFile -> extractVideoFrameFiles -> create ANI -> setState("ani-editing")
```

New:

```text
selectVideoFile
-> extractVideoFrameFiles
-> create hydrated ANI
-> setPendingAniBackgroundDecision(...)
-> setState("ani-background-decision")

Use as is
-> commit pending ANI
-> setState("ani-editing")

Remove background
-> setState("ani-background-processing")
-> removeBackground(frame.file) sequentially
-> trimTransparentImageBlob(result)
-> rebuild ANI with cleaned frames
-> commit cleaned ANI
-> setState("ani-editing")
```

---

## Task 1: Hook State And Keep-As-Is Path

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\studioWorkflow.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-workflow.test.tsx`

**Step 1: Write the failing hook test**

Add a test that `selectVideoFile` stops at the new decision state:

```ts
await act(async () => {
  await result.current.selectVideoFile(file, {
    startMs: 0,
    durationMs: 1000,
    fps: 6,
  });
});

expect(result.current.state).toBe("ani-background-decision");
expect(result.current.pendingAniBackgroundDecision?.ani.sourceKind).toBe(
  "image-sequence"
);
expect(result.current.ani).toBeNull();
```

Add a keep-as-is test:

```ts
await act(async () => {
  result.current.keepExtractedVideoBackground();
});

expect(result.current.state).toBe("ani-editing");
expect(result.current.ani?.sourceKind).toBe("image-sequence");
expect(result.current.pendingAniBackgroundDecision).toBeNull();
```

**Step 2: Run test to verify failure**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-workflow.test.tsx
```

Expected: FAIL because the new state and public keep action do not exist.

**Step 3: Implement minimal hook state**

- Add `"ani-background-decision"` to `StudioState`.
- Add `pendingAniBackgroundDecision` state in `useStudio`.
- Extract the current final commit logic from `uploadVideoFileToSlot` into a helper:

```ts
function commitHydratedAniSequence(
  hydratedAni: AniData,
  previous: StudioSnapshot,
  slotId: WindowsRoleSlotId
) {
  const { historySnapshot, replacedAni } =
    prepareImageSequenceReplacementSnapshot(previous, slotId);

  pushHistoryForAction(historySnapshot, "replaceSlot");
  setCursor(null);
  setAni(hydratedAni);
  commitSlotState(slotId, createAnimatedSlotState(hydratedAni));
  setPendingAniBackgroundDecision(null);
  setState("ani-editing");

  if (replacedAni?.sourceKind === "image-sequence") {
    revokeAniObjectUrlsNotRetained(replacedAni, [
      ...undoStackRef.current,
      ...redoStackRef.current,
    ]);
  }
}
```

- After video extraction/hydration, set:

```ts
setPendingAniBackgroundDecision({
  slotId,
  ani: hydratedAni,
  previous,
});
setState("ani-background-decision");
```

- Add public action:

```ts
const keepExtractedVideoBackground = useCallback(() => {
  if (!pendingAniBackgroundDecision) return;
  commitHydratedAniSequence(
    pendingAniBackgroundDecision.ani,
    pendingAniBackgroundDecision.previous,
    pendingAniBackgroundDecision.slotId
  );
}, [pendingAniBackgroundDecision, commitHydratedAniSequence]);
```

**Step 4: Run test to verify pass**

Run:

```powershell
npm exec vitest run tests/studio/use-studio-workflow.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```powershell
git add frontend/src/lib/studioWorkflow.ts frontend/src/lib/useStudio.ts frontend/tests/studio/use-studio-workflow.test.tsx
git commit -m "feat(studio): add video frame background decision state"
```

---

## Task 2: Frame Background Removal Processor

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-workflow.test.tsx`

**Step 1: Write failing processor tests**

Test that removing backgrounds processes each extracted frame:

```ts
removeBackgroundMock
  .mockResolvedValueOnce(new Blob(["clean-1"], { type: "image/png" }))
  .mockResolvedValueOnce(new Blob(["clean-2"], { type: "image/png" }));

trimTransparentImageBlobMock
  .mockResolvedValueOnce(new Blob(["trim-1"], { type: "image/png" }))
  .mockResolvedValueOnce(new Blob(["trim-2"], { type: "image/png" }));

await act(async () => {
  await result.current.removeExtractedVideoBackground();
});

expect(removeBackgroundMock).toHaveBeenCalledTimes(2);
expect(trimTransparentImageBlobMock).toHaveBeenCalledTimes(2);
expect(result.current.state).toBe("ani-editing");
expect(result.current.ani?.frames).toHaveLength(2);
```

Test progress:

```ts
expect(result.current.aniBackgroundProgress).toEqual({
  completed: 2,
  total: 2,
});
```

Test failure:

```ts
removeBackgroundMock.mockRejectedValueOnce(new Error("Background service failed"));

await act(async () => {
  await result.current.removeExtractedVideoBackground();
});

expect(result.current.state).toBe("ani-background-decision");
expect(result.current.error).toBe("Background service failed");
```

**Step 2: Run test to verify failure**

Run:

```powershell
npm exec vitest run tests/studio/use-studio-workflow.test.tsx
```

Expected: FAIL because the processor action and progress state do not exist.

**Step 3: Implement safe v1 processor**

Use sequential processing for v1. This is slower, but avoids overwhelming the current background-removal backend/HF path.

```ts
const removeExtractedVideoBackground = useCallback(async () => {
  if (!pendingAniBackgroundDecision) return;

  setError(null);
  setState("ani-background-processing");

  const sourceAni = pendingAniBackgroundDecision.ani;
  const total = sourceAni.frames.length;
  setAniBackgroundProgress({ completed: 0, total });

  try {
    const cleanedFrames: AniFrameData[] = [];

    for (const [index, frame] of sourceAni.frames.entries()) {
      const removedBlob = await removeBackground(frame.file);
      const trimmedBlob = await trimTransparentImageBlob(removedBlob);
      const cleanedFile = new File(
        [trimmedBlob],
        frame.file.name.replace(/\.png$/i, "-transparent.png"),
        { type: "image/png" }
      );
      const cleanedUrl = URL.createObjectURL(cleanedFile);

      cleanedFrames.push({
        ...frame,
        file: cleanedFile,
        originalUrl: cleanedUrl,
      });

      setAniBackgroundProgress({ completed: index + 1, total });
    }

    const cleanedAni = syncAniActiveFrame({
      ...sourceAni,
      frames: cleanedFrames,
      originalFile: cleanedFrames[0].file,
      originalUrl: cleanedFrames[0].originalUrl,
    });

    commitHydratedAniSequence(
      cleanedAni,
      pendingAniBackgroundDecision.previous,
      pendingAniBackgroundDecision.slotId
    );
  } catch (err) {
    setState("ani-background-decision");
    setError(err instanceof Error ? err.message : "Failed to remove backgrounds");
  }
}, [pendingAniBackgroundDecision, removeBackground, trimTransparentImageBlob]);
```

Important cleanup:

- Revoke cleaned object URLs if processing fails after creating some.
- Do not revoke original pending ANI URLs until the final cleaned ANI is committed or the user cancels/replaces the upload.
- Keep frame durations unchanged.

**Step 4: Run test to verify pass**

Run:

```powershell
npm exec vitest run tests/studio/use-studio-workflow.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```powershell
git add frontend/src/lib/useStudio.ts frontend/tests/studio/use-studio-workflow.test.tsx
git commit -m "feat(studio): remove backgrounds from extracted video frames"
```

---

## Task 3: Decision UI Component

**Files:**

- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniBackgroundDecision.tsx`
- Create: `C:\Users\amy\Desktop\pointint\frontend\tests\components\ani-background-decision.test.tsx`

**Step 1: Write failing component tests**

Test default decision state:

```tsx
render(
  <AniBackgroundDecision
    title="Remove the background?"
    description="Use transparent frames for sticker-like animations."
    keepLabel="Use as is"
    removeLabel="Remove background"
    framePreviewUrls={["blob:1", "blob:2", "blob:3"]}
    onKeep={onKeep}
    onRemove={onRemove}
  />
);

expect(screen.getByText("Remove the background?")).toBeVisible();
expect(screen.getAllByRole("img")).toHaveLength(3);
fireEvent.click(screen.getByRole("button", { name: "Use as is" }));
expect(onKeep).toHaveBeenCalled();
```

Test processing state:

```tsx
render(
  <AniBackgroundDecision
    processing
    progress={{ completed: 7, total: 30 }}
    processingTitle="Removing backgrounds"
    processingDescription="7 / 30 frames processed"
    ...
  />
);

expect(screen.getByText("7 / 30 frames processed")).toBeVisible();
expect(screen.getByRole("button", { name: "Use as is" })).toBeDisabled();
expect(screen.getByRole("button", { name: "Remove background" })).toBeDisabled();
```

**Step 2: Run test to verify failure**

Run:

```powershell
npm exec vitest run tests/components/ani-background-decision.test.tsx
```

Expected: FAIL because the component does not exist.

**Step 3: Implement component**

Use the same visual language as `StudioQuickBackgroundDecision`, but make it ANI-specific:

- Centered card in the quick-start region.
- 3 small frame thumbnails.
- Primary action: remove background.
- Secondary action: use as is.
- Processing state disables both actions.

**Step 4: Run test to verify pass**

Run:

```powershell
npm exec vitest run tests/components/ani-background-decision.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```powershell
git add frontend/src/components/AniBackgroundDecision.tsx frontend/tests/components/ani-background-decision.test.tsx
git commit -m "feat(studio): add ani background decision UI"
```

---

## Task 4: Wire UI Into StudioPage And i18n

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\en.json`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\ko.json`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\i18n-ko-slot-copy.test.ts`

**Step 1: Write failing route tests**

Test decision screen:

```tsx
renderStudio("ani-background-decision", {
  pendingAniBackgroundDecision: createPendingVideoAniDecision(),
});

expect(screen.getByTestId("ani-background-decision")).toBeVisible();
expect(screen.getByRole("button", { name: "Use as is" })).toBeVisible();
expect(screen.getByRole("button", { name: "Remove background" })).toBeVisible();
```

Test processing:

```tsx
renderStudio("ani-background-processing", {
  pendingAniBackgroundDecision: createPendingVideoAniDecision(),
  aniBackgroundProgress: { completed: 7, total: 30 },
});

expect(screen.getByText("7 / 30 frames processed")).toBeVisible();
```

**Step 2: Add i18n assertions**

Add EN:

```json
"videoBackgroundDecisionTitle": "Remove the background?",
"videoBackgroundDecisionDescription": "Use transparent frames for sticker-like animated cursors.",
"videoBackgroundKeep": "Use as is",
"videoBackgroundRemove": "Remove background",
"videoBackgroundProcessingTitle": "Removing backgrounds",
"videoBackgroundProcessingDescription": "{completed} / {total} frames processed"
```

Add KO:

```json
"videoBackgroundDecisionTitle": "배경을 제거할까요?",
"videoBackgroundDecisionDescription": "스티커처럼 보이는 애니메이션 커서에는 투명 프레임이 잘 맞습니다.",
"videoBackgroundKeep": "그대로 사용",
"videoBackgroundRemove": "배경 제거",
"videoBackgroundProcessingTitle": "배경 제거 중",
"videoBackgroundProcessingDescription": "{completed} / {total}프레임 처리 중"
```

**Step 3: Run tests to verify failure**

Run:

```powershell
npm exec vitest run tests/studio/studio-entry-gate.test.tsx tests/i18n-ko-slot-copy.test.ts
```

Expected: FAIL.

**Step 4: Wire StudioPage**

Add a render branch before `showAdvancedAniShell`:

```tsx
{showAniBackgroundDecision && pendingAniBackgroundDecision ? (
  <AniBackgroundDecision
    title={t("videoBackgroundDecisionTitle")}
    description={t("videoBackgroundDecisionDescription")}
    keepLabel={t("videoBackgroundKeep")}
    removeLabel={t("videoBackgroundRemove")}
    processing={state === "ani-background-processing"}
    processingTitle={t("videoBackgroundProcessingTitle")}
    processingDescription={t("videoBackgroundProcessingDescription", {
      completed: aniBackgroundProgress?.completed ?? 0,
      total: aniBackgroundProgress?.total ?? pendingAniBackgroundDecision.ani.frames.length,
    })}
    progress={aniBackgroundProgress}
    framePreviewUrls={pendingAniBackgroundDecision.ani.frames
      .slice(0, 3)
      .map((frame) => frame.url)}
    onKeep={keepExtractedVideoBackground}
    onRemove={removeExtractedVideoBackground}
  />
) : null}
```

**Step 5: Run tests to verify pass**

Run:

```powershell
npm exec vitest run tests/studio/studio-entry-gate.test.tsx tests/i18n-ko-slot-copy.test.ts
```

Expected: PASS.

**Step 6: Commit**

```powershell
git add frontend/src/app/studio/page.tsx frontend/src/i18n/messages/en.json frontend/src/i18n/messages/ko.json frontend/tests/studio/studio-entry-gate.test.tsx frontend/tests/i18n-ko-slot-copy.test.ts
git commit -m "feat(studio): prompt for video frame background removal"
```

---

## Task 5: QA And Docs

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\docs\plans\2026-05-14-video-to-ani-background-removal.md`
- Modify: `C:\Users\amy\Desktop\pointint\point\06-Implementation\ACTIVE_SPRINT.md`

**Step 1: Run focused tests**

Run:

```powershell
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-workflow.test.tsx tests/components/ani-background-decision.test.tsx tests/studio/studio-entry-gate.test.tsx tests/i18n-ko-slot-copy.test.ts
```

Expected: PASS.

**Step 2: Run full verification**

Run:

```powershell
npm test --
npm run build
```

Expected: PASS.

**Step 3: Browser QA**

Open:

```text
http://localhost:3000/studio?workflow=ani-video-to-ani
```

Verify:

- Video upload still starts from the simple card.
- Extraction settings remain optional/collapsed.
- Uploading a WebM shows the background decision screen.
- `Use as is` enters the ANI editor with original frames.
- `Remove background` shows progress and then enters the ANI editor.
- If backend removal fails, user returns to the decision screen with an error and can use original frames.
- Console has no runtime errors.

**Step 4: Update docs**

Update this plan:

```markdown
> **Status:** Implemented / QA passed

QA evidence:
- focused tests passed
- `npm test --` passed
- `npm run build` passed
- Browser QA passed for `Use as is`; `Remove background` covered by hook/component/route tests
```

Update `ACTIVE_SPRINT.md`:

- Add `Phase 1.5 / Video to ANI Background Removal` as complete.
- Add follow-up options:
  - batch backend endpoint
  - chroma-key/solid-color remover
  - temporal segmentation/fine-tuned model

**Step 5: Commit**

```powershell
git add docs/plans/2026-05-14-video-to-ani-background-removal.md point/06-Implementation/ACTIVE_SPRINT.md
git commit -m "docs: update video background removal status"
```

---

## Acceptance Criteria

- Video to ANI does not auto-remove backgrounds.
- After frame extraction, users can choose whether to keep or remove backgrounds.
- Background removal processes every extracted frame and preserves frame durations/order.
- Progress shows `completed / total`.
- Failure does not discard the extracted frames.
- Korean and English copy render without missing-message errors.
- Existing GIF Maker, multiple-image ANI, and static CUR background-removal flows still pass tests.
- Browser QA confirms the keep path; tests cover the remove path, progress, and failure fallback.

---

## Follow-Up Options

- Add concurrency limit `2` after measuring backend stability.
- Add solid-color/chroma-key removal for fast white/green/black backgrounds.
- Add backend `/api/remove-background-batch` to reduce request overhead.
- Evaluate video/temporal segmentation if frame-to-frame flicker becomes visible.

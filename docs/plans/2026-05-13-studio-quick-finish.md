# Studio Quick Finish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Change Studio's default CUR experience from a visible professional editor into a quick completion flow where users upload an image, confirm the generated cursor, and download before seeing advanced controls.

**Architecture:** Keep the current `useStudio` state machine, slot model, canvas, inspector, and simulation runtime. Add a thin experience layer in `StudioPage` that defaults static-image CUR users into `quick` mode and moves the existing slot rail / inspector / simulation workspace behind an explicit `세부 조정` action. ANI editing remains on the existing advanced shell for this slice.

**Tech Stack:** Next.js 15, React 19, TypeScript, next-intl, Vitest, React Testing Library, existing Pointint Studio components

---

## Scope

### In Scope

- Static image `.cur` quick-finish flow.
- Default quick mode for first-time Studio image uploads.
- Clear result state with primary `이대로 다운로드` action.
- Explicit `세부 조정` action that reveals the existing advanced Studio editor.
- Compact background-removal decision inside the quick flow.
- Korean and English copy updates together.
- Focused tests for default quick mode, advanced reveal, and download hierarchy.

### Out of Scope

- Full ANI/GIF Maker redesign.
- Auth-backed project saving.
- Changing cursor rendering/export behavior.
- Removing any advanced controls.
- Reworking backend APIs.

---

## UX Contract

Default static CUR flow:

```text
Empty Studio
-> Upload image
-> Optional background decision
-> Quick result
-> Download or open advanced editor
```

Quick mode must hide:

- 11-role slot rail
- right inspector control stack
- simulation footer
- hotspot/scale/position/framing controls
- undo/redo action row

Quick mode must show:

- selected output preview
- cursor name/type/status summary
- actual-size light/dark confidence preview
- primary download action
- secondary advanced editor action
- optional `Windows 전체 세트로 확장` path when available

---

### Task 1: Lock the quick-finish contract in tests

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\components\studio-bar.test.tsx`
- Create: `C:\Users\amy\Desktop\pointint\frontend\tests\components\studio-quick-result.test.tsx`
- Create: `C:\Users\amy\Desktop\pointint\frontend\tests\components\studio-quick-start.test.tsx`

**Step 1: Add failing Studio shell assertions**

Add expectations that after a static image reaches `editing`:

```ts
expect(screen.getByTestId("studio-quick-result")).toBeInTheDocument();
expect(screen.queryByTestId("slot-rail")).not.toBeInTheDocument();
expect(screen.queryByTestId("studio-inspector")).not.toBeInTheDocument();
expect(screen.queryByTestId("studio-simulation-footer")).not.toBeInTheDocument();
expect(screen.getByRole("button", { name: /download|다운로드/i })).toBeEnabled();
expect(screen.getByRole("button", { name: /fine-tune|세부 조정/i })).toBeEnabled();
```

Add a second assertion that clicking the advanced action reveals:

```ts
expect(screen.getByTestId("slot-rail")).toBeInTheDocument();
expect(screen.getByTestId("studio-inspector")).toBeInTheDocument();
```

**Step 2: Add component-level quick-result assertions**

Test that `StudioQuickResult` renders:

- output preview
- actual-size preview
- primary download button
- advanced editor button
- optional secondary full-set button

**Step 3: Add StudioBar assertions**

Update `studio-bar.test.tsx` so the primary header action can read as a compact editor header while the quick result owns the main download CTA.

**Step 4: Run tests to verify failure**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx tests/components/studio-bar.test.tsx tests/components/studio-quick-result.test.tsx tests/components/studio-quick-start.test.tsx
```

Expected: FAIL because the quick-start/result components and mode switch do not exist yet.

**Step 5: Commit**

Do not commit yet. This task is complete only after the implementation tasks below make the tests pass.

---

### Task 2: Add quick-finish i18n copy

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\en.json`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\ko.json`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\i18n-ko-slot-copy.test.ts`

**Step 1: Add failing i18n coverage**

Add key coverage for:

- `studio.quickStartTitle`
- `studio.quickStartDescription`
- `studio.quickResultTitle`
- `studio.quickResultDescription`
- `studio.quickDownload`
- `studio.quickDownloadDescription`
- `studio.openAdvancedEditor`
- `studio.closeAdvancedEditor`
- `studio.quickBackgroundRemoveTitle`
- `studio.quickBackgroundRemoveDescription`
- `studio.quickUseAsIs`
- `studio.quickRemoveBackground`
- `studio.expandToWindowsSet`

**Step 2: Run test to verify it fails**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/i18n-ko-slot-copy.test.ts
```

Expected: FAIL because the new keys do not exist.

**Step 3: Add copy**

Use direct, low-cognitive-load copy.

English:

```json
{
  "quickStartTitle": "Drop an image. Get a cursor.",
  "quickStartDescription": "Pointint will pick the default framing and hotspot for you. You can fine-tune later if you want.",
  "quickResultTitle": "Your cursor is ready",
  "quickResultDescription": "Download it now, or open fine-tuning if you want to adjust the details.",
  "quickDownload": "Download cursor",
  "quickDownloadDescription": "Download the current cursor file",
  "openAdvancedEditor": "Fine-tune",
  "closeAdvancedEditor": "Back to simple view",
  "quickBackgroundRemoveTitle": "Remove the background?",
  "quickBackgroundRemoveDescription": "Use AI background removal for sticker-like cursor images.",
  "quickUseAsIs": "Use as is",
  "quickRemoveBackground": "Remove background",
  "expandToWindowsSet": "Build full Windows set"
}
```

Korean:

```json
{
  "quickStartTitle": "이미지를 넣으면 커서로 완성합니다",
  "quickStartDescription": "기본 프레이밍과 핫스팟은 Pointint가 먼저 맞춥니다. 필요하면 나중에 세부 조정할 수 있습니다.",
  "quickResultTitle": "커서가 준비됐어요",
  "quickResultDescription": "바로 다운로드하거나, 필요할 때만 세부 조정을 열어보세요.",
  "quickDownload": "이대로 다운로드",
  "quickDownloadDescription": "현재 커서 파일을 다운로드합니다",
  "openAdvancedEditor": "세부 조정",
  "closeAdvancedEditor": "간단히 보기",
  "quickBackgroundRemoveTitle": "배경을 제거할까요?",
  "quickBackgroundRemoveDescription": "스티커처럼 보이는 커서에는 AI 배경 제거가 잘 맞습니다.",
  "quickUseAsIs": "그대로 완성",
  "quickRemoveBackground": "배경 제거하고 완성",
  "expandToWindowsSet": "Windows 전체 세트로 확장"
}
```

**Step 4: Run test to verify it passes**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/i18n-ko-slot-copy.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/i18n/messages/en.json frontend/src/i18n/messages/ko.json frontend/tests/i18n-ko-slot-copy.test.ts
git commit -m "feat(studio): add quick finish copy"
```

---

### Task 3: Build `StudioQuickStart`

**Files:**

- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioQuickStart.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\studio-quick-start.test.tsx`

**Step 1: Write failing component tests**

Test that the component:

- renders one dominant drop/click upload surface
- accepts static image files
- exposes secondary ANI/GIF entry as a quieter option only if callbacks are provided
- shows drag-hover state without changing layout

**Step 2: Run test to verify it fails**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/studio-quick-start.test.tsx
```

Expected: FAIL because `StudioQuickStart` does not exist.

**Step 3: Implement the component**

Create a client component with props:

```ts
interface StudioQuickStartProps {
  title: string;
  description: string;
  staticUploadLabel: string;
  staticUploadDescription: string;
  animatedUploadLabel?: string;
  animatedUploadDescription?: string;
  onStaticFile: (file: File) => void;
  onAnimatedFile?: (file: File) => void;
  onImageSequenceFiles?: (files: File[]) => void;
}
```

Implementation rules:

- Use a hidden `<input type="file">` for click upload.
- Accept `.png,.jpg,.jpeg,.webp` for static upload.
- Support drag/drop on the whole card.
- Use `STUDIO_INTERACTION_TRANSITION` for hover/focus consistency.
- Do not include slot terminology in the primary copy.

**Step 4: Run test to verify it passes**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/studio-quick-start.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/components/StudioQuickStart.tsx frontend/tests/components/studio-quick-start.test.tsx
git commit -m "feat(studio): add quick start upload surface"
```

---

### Task 4: Build `StudioQuickResult`

**Files:**

- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioQuickResult.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\studio-quick-result.test.tsx`

**Step 1: Write failing component tests**

Test that the component:

- renders `data-testid="studio-quick-result"`
- shows the rendered cursor preview
- shows actual-size light/dark previews
- renders the primary download button
- renders the advanced editor button
- renders optional full-set expansion action
- disables download while `downloading` or when `canDownload` is false

**Step 2: Run test to verify it fails**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/studio-quick-result.test.tsx
```

Expected: FAIL because `StudioQuickResult` does not exist.

**Step 3: Implement the component**

Create props:

```ts
interface StudioQuickResultProps {
  title: string;
  description: string;
  previewUrl: string;
  cursorName: string;
  cursorSize: number;
  hotspotLabel: string;
  typeLabel: string;
  downloading: boolean;
  canDownload: boolean;
  downloadLabel: string;
  downloadDescription: string;
  advancedLabel: string;
  onDownload: () => void;
  onOpenAdvanced: () => void;
  fullSetLabel?: string;
  fullSetDescription?: string;
  canDownloadFullSet?: boolean;
  onDownloadFullSet?: () => void;
}
```

Use a simple visual hierarchy:

- large preview stage
- small confidence strip
- primary action group
- quiet advanced action

Do not render inspector controls here.

**Step 4: Run test to verify it passes**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/studio-quick-result.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/components/StudioQuickResult.tsx frontend/tests/components/studio-quick-result.test.tsx
git commit -m "feat(studio): add quick result screen"
```

---

### Task 5: Wire quick mode into `StudioPage`

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Add failing integration coverage**

In `studio-entry-gate.test.tsx`, cover:

- empty static Studio shows `StudioQuickStart`
- static image editing shows `StudioQuickResult`
- `SlotRail` and `StudioInspector` are absent in quick result
- clicking `세부 조정` reveals the existing advanced shell
- clicking `간단히 보기` from advanced returns to quick result
- ANI editing still enters the existing ANI editor shell

**Step 2: Run test to verify it fails**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
```

Expected: FAIL because `StudioPage` always renders the advanced shell.

**Step 3: Add experience mode**

Add local state in `StudioPage`:

```ts
type StudioExperienceMode = "quick" | "advanced";

const [experienceMode, setExperienceMode] =
  useState<StudioExperienceMode>("quick");
```

Derived booleans:

```ts
const isStaticCursorEditing =
  state === "editing" && Boolean(cursor) && selectedSlotBound;

const showQuickStart =
  state !== "ani-editing" &&
  !selectedSlotBound &&
  experienceMode === "quick";

const showQuickResult =
  isStaticCursorEditing &&
  experienceMode === "quick";

const showAdvancedStaticShell =
  showStaticStudioShell &&
  experienceMode === "advanced";
```

Reset rules:

- When a new file is selected through quick start, keep mode `quick`.
- When user selects another slot from advanced mode, keep `advanced`.
- When `reset()` is called, return to `quick`.
- When `state === "ani-editing"`, ignore quick result and render current ANI shell.

**Step 4: Render quick start**

When `showQuickStart` is true, render `StudioQuickStart` instead of the advanced static shell.

Wire:

- `onStaticFile={selectFile}` for first static upload
- optional `onAnimatedFile={selectAniFile}`
- optional image sequence if the existing callbacks can safely be reused

**Step 5: Render quick result**

When `showQuickResult` is true, render `StudioQuickResult`.

Wire:

- preview from `previewUrl`
- download from `download`
- full set from `downloadAll` when `canDownloadAll`
- advanced from `setExperienceMode("advanced")`

**Step 6: Add advanced close action**

In advanced mode, expose a subtle `간단히 보기` control near the stage header or StudioBar.

Do not put it in the inspector because the action changes the whole layout, not one property.

**Step 7: Run test to verify it passes**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
```

Expected: PASS.

**Step 8: Commit**

```bash
git add frontend/src/app/studio/page.tsx frontend/tests/studio/studio-entry-gate.test.tsx
git commit -m "feat(studio): default static images to quick finish"
```

---

### Task 6: Convert background-removal choice into quick flow

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioQuickBackgroundDecision.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-workflow.test.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\studio-quick-result.test.tsx`

**Step 1: Write failing tests**

Cover:

- when `state === "uploaded"`, quick mode shows a compact decision under the preview
- `배경 제거하고 완성` calls `processBgRemoval`
- `그대로 완성` calls `skipBgRemoval`
- when `state === "processing"`, quick mode shows a non-jumping processing state
- once processing ends, the decision does not reappear

**Step 2: Run tests to verify failure**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-workflow.test.tsx tests/components/studio-quick-result.test.tsx
```

Expected: FAIL because the decision still lives inside the advanced canvas stage.

**Step 3: Implement `StudioQuickBackgroundDecision`**

Props:

```ts
interface StudioQuickBackgroundDecisionProps {
  title: string;
  description: string;
  removeLabel: string;
  keepLabel: string;
  processing?: boolean;
  onRemove: () => void;
  onKeep: () => void;
}
```

Rules:

- Render inline inside quick result area, not as a floating modal.
- Keep height stable between decision and processing states.
- Do not add a large shadow or overlay.

**Step 4: Wire into `StudioPage`**

When quick mode is active:

- `uploaded` shows quick decision.
- `processing` shows quick processing state.
- advanced mode keeps the existing advanced canvas decision dock.

**Step 5: Run tests to verify pass**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-workflow.test.tsx tests/components/studio-quick-result.test.tsx
```

Expected: PASS.

**Step 6: Commit**

```bash
git add frontend/src/app/studio/page.tsx frontend/src/components/StudioQuickBackgroundDecision.tsx frontend/tests/studio/use-studio-workflow.test.tsx frontend/tests/components/studio-quick-result.test.tsx
git commit -m "feat(studio): simplify background decision flow"
```

---

### Task 7: Adjust `StudioBar` for quick vs advanced hierarchy

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioBar.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\studio-bar.test.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Write failing tests**

Test:

- in quick mode, the header does not compete with the main result CTA
- in advanced mode, header actions remain available
- save/login-required copy stays visible but quiet
- download menu still supports current slot / GIF when relevant

**Step 2: Run test to verify failure**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/studio-bar.test.tsx tests/studio/studio-entry-gate.test.tsx
```

Expected: FAIL if the header still presents the strongest download action in quick mode.

**Step 3: Add a display mode prop**

Add:

```ts
type StudioBarMode = "quick" | "advanced";
```

Rules:

- `quick`: header keeps project/save context, but primary download is visually quiet or hidden.
- `advanced`: current StudioBar behavior remains.

**Step 4: Wire from `StudioPage`**

Pass:

```tsx
mode={experienceMode}
```

For `ani-editing`, pass `advanced`.

**Step 5: Run tests to verify pass**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/studio-bar.test.tsx tests/studio/studio-entry-gate.test.tsx
```

Expected: PASS.

**Step 6: Commit**

```bash
git add frontend/src/components/StudioBar.tsx frontend/src/app/studio/page.tsx frontend/tests/components/studio-bar.test.tsx frontend/tests/studio/studio-entry-gate.test.tsx
git commit -m "feat(studio): align header actions with quick mode"
```

---

### Task 8: Polish layout and accessibility

**Files:**

- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioQuickStart.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioQuickResult.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioQuickBackgroundDecision.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Test: related component and studio tests

**Step 1: Add accessibility checks to tests**

Assert:

- upload surface has a button role or label
- download and advanced buttons have clear accessible names
- background decision buttons have unique labels
- advanced mode toggle can be reached by keyboard

**Step 2: Run focused tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/studio-quick-start.test.tsx tests/components/studio-quick-result.test.tsx tests/studio/studio-entry-gate.test.tsx
```

Expected: PASS after implementation.

**Step 3: Run broader frontend tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm test --
```

Expected: PASS.

**Step 4: Manual browser QA**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm run dev
```

Check:

- `/studio` empty state feels simple and upload-first.
- static image upload lands in quick result, not advanced editor.
- background removal decision does not shift the canvas awkwardly.
- `이대로 다운로드` works.
- `세부 조정` reveals slot rail / inspector / simulation.
- `간단히 보기` returns to quick result.
- ANI/GIF Maker still opens existing ANI editor.
- Korean and English copy both render without `MISSING_MESSAGE`.

**Step 5: Commit**

```bash
git add frontend/src/components/StudioQuickStart.tsx frontend/src/components/StudioQuickResult.tsx frontend/src/components/StudioQuickBackgroundDecision.tsx frontend/src/app/studio/page.tsx frontend/tests
git commit -m "polish(studio): refine quick finish accessibility and layout"
```

---

## Implementation Notes

- Do not delete the current advanced Studio shell.
- Do not change export math, hotspot recommendation, or background-removal API behavior.
- Keep quick mode as a presentation layer. `useStudio` should only change if a reset hook or explicit mode reset needs to be exposed.
- If `StudioPage` becomes too large, extract `StudioAdvancedWorkspace` only after quick mode is passing. Avoid mixing extraction with behavior changes in the same commit.
- Keep Korean and English messages synchronized in the same task.
- Prefer component-level tests for new quick components and integration tests for `StudioPage` routing between quick and advanced.

---

## Suggested Commit Order

1. `feat(studio): add quick finish copy`
2. `feat(studio): add quick start upload surface`
3. `feat(studio): add quick result screen`
4. `feat(studio): default static images to quick finish`
5. `feat(studio): simplify background decision flow`
6. `feat(studio): align header actions with quick mode`
7. `polish(studio): refine quick finish accessibility and layout`

---

## Acceptance Criteria

- Static image users can complete upload-to-download without seeing advanced controls.
- The first post-upload screen communicates completion, not editing workload.
- Advanced controls are one explicit click away and preserve current capabilities.
- Background removal feels inline and does not introduce modal-like visual noise.
- Current CUR download, full-set download, background removal, and advanced edit functions still work.
- ANI/GIF Maker is not regressed.
- `npm test --` passes in `frontend`.
- No missing i18n message errors in `ko` or `en`.

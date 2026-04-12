# Unified Cursor Simulation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current CSS-cursor simulation with a shared simulation engine that works for both `CUR` and `ANI` while keeping preview/export parity.

**Architecture:** Build a shared `CursorSimulationSurface` with a fake cursor layer, then migrate `CUR` to it first, and finally connect `ANI` through an animated frame source that applies the current editor transforms to every frame. Keep the user-facing label as `시뮬레이션`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, existing Pointint cursor framing helpers

---

### Task 1: Lock the new simulation contract in tests

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`
- Create: `C:\Users\amy\Desktop\pointint\frontend\tests\components\cursor-simulation-surface.test.tsx`
- Create: `C:\Users\amy\Desktop\pointint\frontend\tests\lib\cursor-sources.test.ts`

**Step 1: Write the failing tests**

- Add a test that `CUR` editing renders the new simulation component instead of the legacy CSS-cursor simulation.
- Add a test that `ANI` editing also renders the same simulation component.
- Add source-contract tests for:
  - static source always returns the same frame
  - animated source returns frames by elapsed time

**Step 2: Run the tests to verify they fail**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests\studio\studio-entry-gate.test.tsx tests\components\cursor-simulation-surface.test.tsx tests\lib\cursor-sources.test.ts
```

Expected:

- failure because the shared simulation surface and source helpers do not exist yet

**Step 3: Commit the failing tests**

```bash
git add frontend/tests/studio/studio-entry-gate.test.tsx frontend/tests/components/cursor-simulation-surface.test.tsx frontend/tests/lib/cursor-sources.test.ts
git commit -m "test(simulation): add shared cursor simulation contract"
```

### Task 2: Build the shared simulation shell

**Files:**
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\CursorSimulationSurface.tsx`
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\CursorPreviewLayer.tsx`
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\CursorScene.tsx`

**Step 1: Write the minimal implementation**

- `CursorSimulationSurface` should:
  - track pointer position
  - hide the native cursor in the simulation region
  - manage background mode
  - render scene + preview layer
- `CursorScene` should expose four zones:
  - neutral
  - text
  - link
  - button
- `CursorPreviewLayer` should render the supplied frame at pointer position minus hotspot

**Step 2: Run the new tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests\components\cursor-simulation-surface.test.tsx
```

Expected:

- the shared simulation surface tests pass

**Step 3: Commit**

```bash
git add frontend/src/components/CursorSimulationSurface.tsx frontend/src/components/CursorPreviewLayer.tsx frontend/src/components/CursorScene.tsx frontend/tests/components/cursor-simulation-surface.test.tsx
git commit -m "feat(simulation): add shared cursor simulation shell"
```

### Task 3: Add shared cursor source helpers

**Files:**
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\lib\cursorSources.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\lib\cursor-sources.test.ts`

**Step 1: Implement the source contract**

- Add a static source helper:
  - `createStaticCursorSource(frame, hotspot, outputSize)`
- Add an animated source helper:
  - `createAnimatedCursorSource(frames, hotspot, outputSize)`
- Add `getFrameAtTime(now)` behavior

**Step 2: Run the source tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests\lib\cursor-sources.test.ts
```

Expected:

- source tests pass

**Step 3: Commit**

```bash
git add frontend/src/lib/cursorSources.ts frontend/tests/lib/cursor-sources.test.ts
git commit -m "feat(simulation): add static and animated cursor sources"
```

### Task 4: Migrate CUR to the shared simulation engine

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Replace usage in: `C:\Users\amy\Desktop\pointint\frontend\src\components\Simulation.tsx`
- Optionally retire: `C:\Users\amy\Desktop\pointint\frontend\src\components\Simulation.tsx`
- Modify tests: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Write or refine the failing CUR migration test**

- Assert that `CUR` editing mounts the shared simulation surface
- Assert that the legacy CSS-cursor simulation path is no longer the source of truth

**Step 2: Implement the migration**

- Build the static source from the existing rendered preview frame
- Pass mapped hotspot and actual rendered image into the new simulation surface
- Keep actual-size preview unchanged for now

**Step 3: Run focused tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests\studio\studio-entry-gate.test.tsx
```

Expected:

- `CUR` entry/simulation tests pass

**Step 4: Commit**

```bash
git add frontend/src/app/studio/page.tsx frontend/src/components/Simulation.tsx frontend/tests/studio/studio-entry-gate.test.tsx
git commit -m "feat(simulation): migrate cur preview to shared engine"
```

### Task 5: Add ANI frame rendering for simulation

**Files:**
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\lib\aniPreviewFrames.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\cursorFrame.ts`
- Create: `C:\Users\amy\Desktop\pointint\frontend\tests\lib\ani-preview-frames.test.ts`

**Step 1: Write the failing test**

- Verify that ANI preview frames are derived from GIF frames after applying:
  - fit mode
  - scale
  - offset
  - output size
- Verify that the output is suitable for animation playback

**Step 2: Run the test and confirm failure**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests\lib\ani-preview-frames.test.ts
```

Expected:

- failure because ANI preview frame rendering does not exist yet

**Step 3: Implement the minimal renderer**

- Decode GIF frames on the client
- Apply the same framing math used by export preview
- Return rendered frames plus durations

**Step 4: Re-run the test**

Expected:

- ANI preview frame tests pass

**Step 5: Commit**

```bash
git add frontend/src/lib/aniPreviewFrames.ts frontend/src/lib/cursorFrame.ts frontend/tests/lib/ani-preview-frames.test.ts
git commit -m "feat(simulation): add ani preview frame renderer"
```

### Task 6: Connect ANI to the shared simulation engine

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniEditorShell.tsx`
- Modify tests: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Write or refine the failing ANI integration test**

- Assert that ANI editing mounts the shared simulation surface
- Assert that ANI actual-size preview remains visible
- Assert that ANI simulation is sourced from rendered frames, not the raw GIF

**Step 2: Implement the integration**

- Build the animated source from rendered ANI preview frames
- Feed it into the shared simulation surface
- Keep actual-size ANI preview driven by the same source contract

**Step 3: Run focused tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests\studio\studio-entry-gate.test.tsx tests\lib\ani-preview-frames.test.ts
```

Expected:

- ANI integration tests pass

**Step 4: Commit**

```bash
git add frontend/src/app/studio/page.tsx frontend/src/components/AniEditorShell.tsx frontend/tests/studio/studio-entry-gate.test.tsx
git commit -m "feat(simulation): connect ani preview to shared engine"
```

### Task 7: Regression pass and cleanup

**Files:**
- Modify as needed:
  - `C:\Users\amy\Desktop\pointint\frontend\src\components\Simulation.tsx`
  - `C:\Users\amy\Desktop\pointint\frontend\src\components\AniSimulation.tsx`
  - `C:\Users\amy\Desktop\pointint\frontend\src\components\FramedCursorPreview.tsx`
- Tests:
  - `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-workflow.test.tsx`
  - `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`
  - `C:\Users\amy\Desktop\pointint\frontend\tests\components\cursor-simulation-surface.test.tsx`

**Step 1: Remove dead simulation paths**

- Delete or retire CSS-cursor-only behavior that is no longer needed
- Keep compatibility helpers only if they still serve actual-size preview or export parity

**Step 2: Run the relevant test set**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests\studio\use-studio-workflow.test.tsx tests\studio\studio-entry-gate.test.tsx tests\components\cursor-simulation-surface.test.tsx tests\lib\cursor-sources.test.ts tests\lib\ani-preview-frames.test.ts
```

Expected:

- all focused preview/simulation tests pass

**Step 3: Run the full frontend build**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm run build
```

Expected:

- successful production build

**Step 4: Commit**

```bash
git add frontend
git commit -m "refactor(simulation): unify cur and ani preview engine"
```

### Task 8: Follow-up docs sync

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\point\06-Implementation\ACTIVE_SPRINT.md`
- Modify: `C:\Users\amy\Desktop\pointint\point\06-Implementation\Phase-Flow.md`
- Modify: `C:\Users\amy\Desktop\pointint\point\10-Journal\QUICK-DECISIONS.md`

**Step 1: Update execution status**

- Record that preview parity for ANI now includes simulation parity
- Note that the simulation engine is now shared between `CUR` and `ANI`

**Step 2: Verify docs**

- Check that sprint and phase documents match the shipped implementation

**Step 3: Commit**

```bash
git add point/06-Implementation/ACTIVE_SPRINT.md point/06-Implementation/Phase-Flow.md point/10-Journal/QUICK-DECISIONS.md
git commit -m "docs(point): sync unified cursor simulation rollout"
```

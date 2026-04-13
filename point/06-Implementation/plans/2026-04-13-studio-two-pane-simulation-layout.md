# Studio Two-Pane Simulation Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rework the studio editing layout so the center workspace becomes a vertical split with editing on top and a large collapsible simulation pane below for both `CUR` and `ANI`.

**Architecture:** Keep the existing left tool rail and right property panel, but replace the footer-based simulation strip with a shared in-workspace simulation pane. Reuse the common simulation engine, redesign the default scene to feel browser-like, and keep the editing canvas in the top pane for precision.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, existing Pointint studio components

---

### Task 1: Lock the new layout contract in tests

**Files:**
- Create: `C:\Users\amy\Desktop\pointint\frontend\tests\components\simulation-pane.test.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Write the failing tests**

- Add a shared pane-shell test that verifies:
  - expanded pane height
  - collapsed pane height
  - body hidden when collapsed
  - toggle remains visible
- Add a studio test that verifies:
  - editing mode still renders the editor shell
  - simulation remains mounted through the pane shell

**Step 2: Run the tests to verify they fail**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/simulation-pane.test.tsx tests/studio/studio-entry-gate.test.tsx
```

Expected:

- failures because the shared pane shell and new layout contract do not exist yet

### Task 2: Build the shared simulation pane shell

**Files:**
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\SimulationPane.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\simulation-pane.test.tsx`

**Step 1: Implement the minimal pane shell**

- Add a header row with:
  - simulation label
  - collapse/expand control
- Support:
  - expanded height around `15rem`
  - collapsed height around `3rem`
- Hide body content when collapsed

**Step 2: Run the pane tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/simulation-pane.test.tsx
```

Expected:

- pane-shell tests pass

### Task 3: Move CUR editing into a vertical split workspace

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`

**Step 1: Refactor editing-mode center workspace**

- Replace the footer simulation strip with a center-column split:
  - top pane for `CursorCanvas`
  - bottom pane for `SimulationPane`
- Keep:
  - left tool rail
  - right property panel
  - upload / workflow states unchanged

**Step 2: Run the relevant studio tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
```

Expected:

- editing-state tests still pass

### Task 4: Move ANI editing into the same vertical split model

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniEditorShell.tsx`

**Step 1: Refactor ANI shell**

- Keep the current ANI canvas in the top pane
- Mount the shared `SimulationPane` below it
- Preserve ANI-specific controls and actual-size previews

**Step 2: Run focused ANI tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx tests/components/ani-simulation.test.tsx
```

Expected:

- ANI editor tests still pass

### Task 5: Redesign the default simulation scene

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\CursorScene.tsx`
- Modify translations only if needed:
  - `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\en.json`
  - `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\ko.json`

**Step 1: Replace demo-copy blocks with a browser-like scene**

- Remove literal labels such as:
  - `Neutral space`
  - `Sample body text to exercise a text cursor state.`
- Add a more believable UI scene with:
  - top chrome/header
  - body copy block
  - link
  - button
  - input
- Keep hover zones for:
  - neutral
  - text
  - link
  - button

**Step 2: Run component tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/cursor-simulation-surface.test.tsx tests/components/simulation.test.tsx tests/components/ani-simulation.test.tsx
```

Expected:

- shared simulation tests still pass

### Task 6: Full regression and build verification

**Files:**
- Verify all touched files above

**Step 1: Run focused regression**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/simulation-pane.test.tsx tests/components/simulation.test.tsx tests/components/ani-simulation.test.tsx tests/studio/studio-entry-gate.test.tsx tests/lib/ani-preview-frames.test.ts
```

Expected:

- all relevant tests pass

**Step 2: Run production build**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm run build
```

Expected:

- successful build with no type errors

### Task 7: Documentation sync

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\point\06-Implementation\ACTIVE_SPRINT.md`
- Modify: `C:\Users\amy\Desktop\pointint\point\10-Journal\QUICK-DECISIONS.md`

**Step 1: Record the layout decision**

- note that simulation is no longer a footer strip
- note that the workspace is now `top editing / bottom simulation`

**Step 2: Commit**

- keep this in the feature commit if docs remain small

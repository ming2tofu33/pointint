# Slot-Based Cursor Theme Studio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert Pointint Studio into a slot-based cursor theme editor where `normal`, `text`, `link`, and `button` slots are edited one at a time but simulated together.

**Architecture:** Replace the current single-asset Studio state with a `CursorThemeProject` that owns four fixed slots. Reuse the existing canvas and property panel for the selected slot, introduce a slot rail for navigation, and drive the simulation from a slot-to-zone source map so `CUR` and `ANI` share one runtime structure.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, existing Pointint Studio components and cursor source abstractions

---

### Task 1: Lock the slot-based project contract in tests

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-workflow.test.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`
- Create: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-slots.test.tsx`

**Step 1: Write the failing tests**

- Add tests that describe the new Studio state shape:
  - Studio owns slots for `normal`, `text`, `link`, and `button`
  - one slot is selected at a time
  - selecting a different slot swaps the bound editing target
- Add a UI test that expects a slot rail to exist in the Studio shell

**Step 2: Run test to verify it fails**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-slots.test.tsx tests/studio/studio-entry-gate.test.tsx
```

Expected:

- failures because Studio still assumes a single cursor asset

### Task 2: Introduce the slot-based project model in `useStudio`

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Create if needed: `C:\Users\amy\Desktop\pointint\frontend\src\lib\cursorThemeProject.ts`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-slots.test.tsx`

**Step 1: Implement the minimal slot state**

- Introduce a `CursorThemeProject`
- Add fixed slots:
  - `normal`
  - `text`
  - `link`
  - `button`
- Track:
  - selected slot id
  - slot asset kind (`static` or `animated`)
  - slot editing values

**Step 2: Keep current actions working through the selected slot**

- existing editor mutations should target the currently selected slot
- do not redesign export yet

**Step 3: Run the new state tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-slots.test.tsx
```

Expected:

- slot-state tests pass

### Task 3: Add the slot rail UI

**Files:**
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\SlotRail.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Modify if ANI shell composition requires it: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniEditorShell.tsx`
- Modify translations:
  - `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\en.json`
  - `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\ko.json`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Write the minimal rail**

- render four fixed slot items
- show:
  - label
  - empty/filled state
  - `Static` / `Animated`
  - thumbnail when available

**Step 2: Wire selection**

- clicking a slot switches the selected slot in `useStudio`
- current editor surface rebinds to that slot

**Step 3: Run focused UI tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
```

Expected:

- Studio shell tests pass with the new slot rail visible

### Task 4: Rebind the editor surface to the selected slot

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniEditorShell.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\CursorCanvas.tsx` only if slot rebinding requires prop cleanup
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Replace direct single-asset reads**

- read the selected slot instead of one global cursor/ani object
- show:
  - edit UI when selected slot is filled
  - empty state when selected slot is empty

**Step 2: Preserve current tool semantics**

- `move`
- `hotspot`
- framing
- scale
- size
- naming

These continue to apply only to the selected slot.

**Step 3: Run focused regression**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx tests/studio/use-studio-hotspot.test.tsx
```

Expected:

- selected-slot editing works and existing hotspot behavior still passes

### Task 5: Add empty-slot input flow

**Files:**
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\SlotEmptyState.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Add the empty-slot picker**

For an empty selected slot, render two actions:

- `Static Image`
- `Animated GIF`

**Step 2: Route uploads into the selected slot**

- static image upload populates the selected slot as `static`
- animated GIF upload populates the selected slot as `animated`

**Step 3: Run UI tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx tests/studio/use-studio-workflow.test.tsx
```

Expected:

- empty-slot flow works for both static and animated paths

### Task 6: Make the simulation consume the slot set

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\Simulation.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniSimulation.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\CursorSimulationSurface.tsx`
- Create if needed: `C:\Users\amy\Desktop\pointint\frontend\src\lib\slotSimulationSources.ts`
- Test:
  - `C:\Users\amy\Desktop\pointint\frontend\tests\components\simulation.test.tsx`
  - `C:\Users\amy\Desktop\pointint\frontend\tests\components\ani-simulation.test.tsx`
  - `C:\Users\amy\Desktop\pointint\frontend\tests\components\cursor-simulation-surface.test.tsx`

**Step 1: Build the slot-to-zone source map**

- neutral -> `normal`
- text -> `text`
- link -> `link`
- button -> `button`

**Step 2: Provide a fallback strategy**

- if a slot is empty, fall back to `normal`
- if `normal` is empty, show the existing simulation placeholder

**Step 3: Run simulation tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/simulation.test.tsx tests/components/ani-simulation.test.tsx tests/components/cursor-simulation-surface.test.tsx
```

Expected:

- simulation changes source by hovered zone

### Task 7: Add download guard for minimum valid projects

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioBar.tsx` only if button messaging needs refinement
- Test:
  - `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-slots.test.tsx`
  - `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Define the v1 rule**

- download remains disabled until `normal` exists

**Step 2: Keep export minimal**

- do not redesign set export in this slice
- keep current export semantics focused on the active path while the slot model lands

**Step 3: Run the tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-slots.test.tsx tests/studio/studio-entry-gate.test.tsx
```

Expected:

- download gating is stable

### Task 8: Full regression and build verification

**Files:**
- Verify all touched files above

**Step 1: Run focused regression**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-slots.test.tsx tests/studio/studio-entry-gate.test.tsx tests/studio/use-studio-hotspot.test.tsx tests/studio/use-studio-workflow.test.tsx tests/components/cursor-simulation-surface.test.tsx tests/components/simulation.test.tsx tests/components/ani-simulation.test.tsx
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

### Task 9: Documentation sync

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\point\06-Implementation\ACTIVE_SPRINT.md`
- Modify: `C:\Users\amy\Desktop\pointint\point\10-Journal\QUICK-DECISIONS.md`

**Step 1: Record the Studio model change**

- note that Studio is now moving toward a slot-based cursor theme editor
- note that simulation is state-driven by slot mappings

**Step 2: Commit**

```bash
git add frontend/src frontend/tests point/06-Implementation/ACTIVE_SPRINT.md point/10-Journal/QUICK-DECISIONS.md
git commit -m "feat(frontend): add slot-based cursor theme studio foundation"
```

# Studio Clean Editor Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign `/studio` as a clean editor interface based on `frontend/example/cursor studio.html`, using Pointint's pink accent and preserving current Studio behavior.

**Architecture:** Keep `useStudio` and the existing state machine intact. Re-skin Studio-specific components and the `/studio` page shell into a consistent editor layout: compact top bar, role rail, central workspace, and right inspector. Quick mode remains a presentation layer for static image upload/result, while advanced mode keeps the full slot, canvas, simulation, and inspector capabilities.

**Tech Stack:** Next.js 15, React 19, TypeScript, next-intl, CSS variables in `globals.css`, Vitest, React Testing Library.

---

### Task 1: Lock the Studio Editor Visual Tokens

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\globals.css`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioSurfaceCard.tsx`

**Steps:**
1. Tune `--studio-*` tokens to cleaner editor surfaces in light/dark/custom themes.
2. Reduce Studio card radius to 0.5rem or less.
3. Keep focus styling and reduced-motion behavior.
4. Run focused Studio component tests.

### Task 2: Restyle Quick Mode

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioQuickStart.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioQuickResult.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioQuickBackgroundDecision.tsx`

**Steps:**
1. Remove hero-like radial/glow treatment.
2. Use editor canvas panels, thin borders, square-ish upload/drop surfaces.
3. Keep drag/drop, download, advanced, and background actions unchanged.
4. Run quick component tests.

### Task 3: Restyle the Advanced Editor Shell

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioBar.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\SlotRail.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioInspector.tsx`

**Steps:**
1. Make `StudioBar` feel like the example's compact editor header.
2. Convert `SlotRail` into a cleaner left rail/list with tighter cards.
3. Convert inspector cards into one right properties panel.
4. Keep all existing event handlers and test IDs.
5. Run Studio integration tests.

### Task 4: Polish and Verify

**Files:**
- Modify only files touched above as needed.

**Steps:**
1. Run focused tests:
   `npm exec vitest run tests/components/studio-quick-start.test.tsx tests/components/studio-quick-result.test.tsx tests/components/studio-quick-background-decision.test.tsx tests/components/studio-bar.test.tsx tests/components/slot-rail.test.tsx tests/components/studio-inspector.test.tsx tests/studio/studio-entry-gate.test.tsx`
2. Run broader frontend tests if focused tests pass.
3. Start the dev server and inspect `/studio` in a browser.
4. Fix visible overlap, cramped text, or missing controls.

# Hotspot Recommendation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add rule-based hotspot recommendation that auto-applies once in the editor and preserves manual user control.

**Architecture:** Keep recommendation logic on the client so it runs against the same framed square render used by preview and export. Add a pure alpha-mask recommendation helper, then wire it into `useStudio` with a small hotspot mode state machine.

**Tech Stack:** Next.js, React hooks, TypeScript, Vitest

---

### Task 1: Add failing algorithm tests

**Files:**
- Modify: `frontend/tests/lib/cursorFrame.test.ts`
- Modify: `frontend/src/lib/cursorFrame.ts`

**Step 1: Write the failing test**

Add tests for:

- a pointed alpha mask returns the top-left-leading tip
- isolated top-left noise is ignored in favor of the supported tip
- empty alpha mask returns `null`

**Step 2: Run test to verify it fails**

Run: `npm exec vitest run frontend/tests/lib/cursorFrame.test.ts`

Expected: FAIL because hotspot recommendation helpers do not exist yet.

**Step 3: Write minimal implementation**

Add pure helpers in `cursorFrame.ts`:

- `suggestHotspotFromAlphaMask`
- optional small internal utilities for boundary/support scoring

**Step 4: Run test to verify it passes**

Run: `npm exec vitest run frontend/tests/lib/cursorFrame.test.ts`

Expected: PASS

### Task 2: Add failing hook tests

**Files:**
- Modify: `frontend/tests/studio/use-studio-workflow.test.tsx`
- Modify: `frontend/src/lib/useStudio.ts`
- Modify: `frontend/src/lib/cursorFrame.ts`

**Step 1: Write the failing test**

Add tests for:

- editor entry auto-applies a suggested hotspot
- manual hotspot changes are not overwritten by later automatic recomputation
- explicit re-recommend applies the suggestion again

**Step 2: Run test to verify it fails**

Run: `npm exec vitest run frontend/tests/studio/use-studio-workflow.test.tsx`

Expected: FAIL because hotspot recommendation state and API are missing.

**Step 3: Write minimal implementation**

Update `useStudio.ts` to:

- track hotspot mode
- compute recommendation after the editor render is ready
- avoid overwriting manual hotspot
- expose an explicit `recommendHotspot` action

**Step 4: Run test to verify it passes**

Run: `npm exec vitest run frontend/tests/studio/use-studio-workflow.test.tsx`

Expected: PASS

### Task 3: Add studio panel UI

**Files:**
- Modify: `frontend/src/app/studio/page.tsx`
- Modify: `frontend/src/i18n/messages/en.json`
- Modify: `frontend/src/i18n/messages/ko.json`
- Modify: `frontend/tests/studio/studio-entry-gate.test.tsx`

**Step 1: Write the failing test**

Add a studio page test that expects the hotspot panel to show:

- hotspot state text
- recommendation action button

**Step 2: Run test to verify it fails**

Run: `npm exec vitest run frontend/tests/studio/studio-entry-gate.test.tsx`

Expected: FAIL because the UI does not expose recommendation state/action yet.

**Step 3: Write minimal implementation**

Update the hotspot panel to show:

- coordinates
- state text
- recommend / recommend again button
- reset button

**Step 4: Run test to verify it passes**

Run: `npm exec vitest run frontend/tests/studio/studio-entry-gate.test.tsx`

Expected: PASS

### Task 4: Verify and sync docs

**Files:**
- Modify: `point/06-Implementation/ACTIVE_SPRINT.md`
- Modify: `point/10-Journal/QUICK-DECISIONS.md`

**Step 1: Run focused frontend tests**

Run:

```bash
npm exec vitest run frontend/tests/lib/cursorFrame.test.ts frontend/tests/studio/use-studio-workflow.test.tsx frontend/tests/studio/studio-entry-gate.test.tsx
```

Expected: PASS

**Step 2: Run build**

Run: `cd frontend; npm run build`

Expected: PASS

**Step 3: Sync docs**

Record that `P1-HOTSPOT-01` moved from scoped to done if the implementation and tests are green.

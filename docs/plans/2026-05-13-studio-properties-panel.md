# Studio Properties Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the `/studio` right-side work panel into a clean properties inspector that matches the cursor studio reference while preserving the existing editing controls.

**Architecture:** Keep the existing Studio data flow and editor state intact, but flatten the inspector chrome so the right side reads as one properties panel instead of stacked cards. Move preview/status content into compact sections, then update tests around the new structure and verify the real `/studio` route in-browser.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library, Browser/Playwright verification.

---

### Task 1: Inspector Shell

**Files:**
- Modify: `frontend/src/components/StudioInspector.tsx`
- Modify: `frontend/src/components/StudioSelectionSummary.tsx`
- Test: `frontend/tests/components/studio-inspector.test.tsx`

**Step 1: Write the failing test**

Update the inspector component test to expect:
- `studio-inspector-status-strip` is rendered.
- `studio-inspector-sections` is rendered.
- legacy card test IDs `studio-inspector-summary-card` and `studio-inspector-actual-size-card` are absent.
- quick actions still render when provided.

**Step 2: Run test to verify it fails**

Run: `npm exec vitest run tests/components/studio-inspector.test.tsx`
Expected: FAIL because the current inspector still renders card wrappers.

**Step 3: Implement the minimal code**

Flatten `StudioInspector` into:
- a compact status strip for `summary`
- optional inline preview area
- optional quick action strip
- one properties section container for `children`

Update `StudioSelectionSummary` so it presents slot/type/status/name as concise badges and a single filename line.

**Step 4: Run test to verify it passes**

Run: `npm exec vitest run tests/components/studio-inspector.test.tsx`
Expected: PASS.

### Task 2: Output Preview Placement

**Files:**
- Modify: `frontend/src/app/studio/page.tsx`
- Modify: `frontend/src/components/AniEditorShell.tsx`
- Test: `frontend/tests/studio/studio-entry-gate.test.tsx`

**Step 1: Write the failing test**

Update `/studio` tests to expect:
- quick upload and ANI editing use `studio-inspector-status-strip`
- actual-size preview cards are absent
- mini preview blocks live inside the Output section

**Step 2: Run test to verify it fails**

Run: `npm exec vitest run tests/studio/studio-entry-gate.test.tsx`
Expected: FAIL because previews still live in the inspector card area.

**Step 3: Implement the minimal code**

Pass no `previews` card content into `StudioInspector` for editing states. Render compact light/dark mini previews inside the Output section for CUR and ANI workflows.

**Step 4: Run test to verify it passes**

Run: `npm exec vitest run tests/studio/studio-entry-gate.test.tsx`
Expected: PASS.

### Task 3: Properties Section Order

**Files:**
- Modify: `frontend/src/app/studio/page.tsx`
- Modify: `frontend/src/components/AniEditorShell.tsx`

**Step 1: Reorder controls**

Arrange right panel sections in this order:
1. Output
2. Framing
3. Transform
4. Hotspot
5. Name
6. Health

**Step 2: Preserve existing behavior**

Reuse existing handlers and inputs. Do not change cursor generation, animation frame handling, upload flow, export flow, or validation behavior.

### Task 4: Hotspot Target And Compact Health

**Files:**
- Modify: `frontend/src/components/StudioInspector.tsx`
- Modify: `frontend/src/components/HealthCheck.tsx`
- Modify: `frontend/src/app/studio/page.tsx`
- Modify: `frontend/src/components/AniEditorShell.tsx`
- Test: `frontend/tests/studio/studio-entry-gate.test.tsx`

**Step 1: Add visual hotspot target**

Add a small `StudioInspectorHotspotTarget` helper with `data-testid="studio-hotspot-target"` and use it above X/Y hotspot inputs.

**Step 2: Compact validation**

Make `HealthCheck` render as a compact collapsible validation block when results exist, with status first and details below.

### Task 5: Verification

**Files:**
- Verify: `frontend/`

**Step 1: Run focused tests**

Run:
`npm exec vitest run tests/components/studio-inspector.test.tsx tests/studio/studio-entry-gate.test.tsx`

**Step 2: Run full test suite**

Run: `npm test --`

**Step 3: Run production build**

Run: `npm run build`

**Step 4: Browser verify**

Open `/studio` locally and check:
- no marketing header on `/studio`
- right panel reads as one properties inspector
- mini previews are in Output
- hotspot target and floating canvas toolbar are visible
- mobile/desktop layout has no obvious overlap

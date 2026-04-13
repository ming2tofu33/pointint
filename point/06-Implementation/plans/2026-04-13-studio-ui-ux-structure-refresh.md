# Studio UI/UX Structure Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refresh the Pointint Studio shell so slot navigation, empty-slot entry, edit stage, simulation stage, and inspector all read as one premium cursor-authoring tool.

**Architecture:** Keep the current slot-based Studio model and two-pane center workspace, but refactor the shell into clearer visual regions with shared CUR/ANI primitives. Extract only the shared pieces needed to remove duplicated inline structure, then restyle slot cards, source-entry cards, stage headers, action bars, and inspector cards under the existing studio token scope.

**Tech Stack:** Next.js 15, React 19, TypeScript, next-intl, Vitest, existing Studio components

---

### Task 1: Lock the visual hierarchy contract in tests

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\components\slot-rail.test.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`
- Create: `C:\Users\amy\Desktop\pointint\frontend\tests\components\studio-inspector.test.tsx`

**Step 1: Write the failing tests**

- Add slot-rail assertions for:
  - selected slot badge visibility
  - empty slot showing `slotKindUnset`
  - selected slot card stronger emphasis than non-selected slot
- Add studio shell assertions for:
  - empty-slot state renders source cards, not a generic upload-only block
  - editing mode shows a dedicated stage header/action region
  - right panel reads as an inspector with grouped sections
- Add inspector component tests for:
  - summary card presence
  - actual-size preview card
  - grouped quick actions

**Step 2: Run the tests to verify they fail**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/slot-rail.test.tsx tests/components/studio-inspector.test.tsx tests/studio/studio-entry-gate.test.tsx
```

Expected:

- failures because the refreshed shell primitives and inspector grouping do not exist yet

### Task 2: Extract shared Studio shell primitives

**Files:**
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioStageHeader.tsx`
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioStageActionBar.tsx`
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioInspector.tsx`
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioSurfaceCard.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\studio-inspector.test.tsx`

**Step 1: Write the minimal shared components**

- `StudioSurfaceCard`:
  - one reusable dark surface card with consistent radius, border, and padding
- `StudioStageHeader`:
  - slot label
  - type label
  - optional cursor name
  - optional status badge
- `StudioStageActionBar`:
  - compact action row with consistent secondary buttons
- `StudioInspector`:
  - accepts summary, previews, and section children

**Step 2: Run the component tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/studio-inspector.test.tsx
```

Expected:

- shared shell primitive tests pass

### Task 3: Refresh the slot rail and source-entry cards

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\SlotRail.tsx`
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\SlotSourceChoiceCard.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniEditorShell.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\en.json`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\ko.json`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\slot-rail.test.tsx`

**Step 1: Refresh the slot rail**

- Improve slot-card emphasis without changing the slot model
- Keep:
  - slot name
  - state line
  - type line
  - thumbnail
- Add:
  - clearer selected state
  - slightly larger card spacing
  - more deliberate contrast between empty and filled slots

**Step 2: Refresh empty-slot source entry**

- Extract a reusable source-choice card
- Use it in both CUR and ANI empty-slot states
- Keep two primary options only:
  - `Static Image`
  - `Animated GIF`
- Ensure right panel does not duplicate those upload cards

**Step 3: Run the focused UI tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/slot-rail.test.tsx tests/studio/studio-entry-gate.test.tsx
```

Expected:

- refreshed slot rail and empty-slot tests pass

### Task 4: Rebuild the CUR edit stage around a premium stage header

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Add the stage header**

- Show:
  - selected slot name
  - selected slot type
  - cursor name when available
  - hotspot recommendation state when relevant

**Step 2: Replace the loose helper line with the shared action bar**

- Keep current actions:
  - show original / processed
  - retry background removal
  - existing guidance text
- Restyle them inside the shared action region

**Step 3: Keep simulation placement stable**

- preserve the current two-pane center layout
- ensure expanded/collapsed simulation does not shift header or canvas structure

**Step 4: Run the CUR-focused tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx tests/components/simulation.test.tsx
```

Expected:

- CUR shell tests still pass and stage hierarchy assertions are green

### Task 5: Rebuild the ANI shell with the same stage language

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniEditorShell.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\ani-simulation.test.tsx`

**Step 1: Add the shared stage header to ANI**

- show the same contextual fields as CUR where applicable
- keep ANI-specific state details without introducing a separate visual system

**Step 2: Replace the loose control row with the shared action bar**

- keep:
  - drag / hotspot guidance
  - recommend hotspot
  - reset hotspot
- restyle to match CUR

**Step 3: Preserve existing empty-slot and simulation behavior**

- do not regress slot selection
- keep the single central source-entry hub
- keep simulation mounted only when ANI slot content exists

**Step 4: Run ANI-focused tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx tests/components/ani-simulation.test.tsx
```

Expected:

- ANI shell tests pass with the refreshed stage structure

### Task 6: Convert the right column into a real inspector

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniEditorShell.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioInspector.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\studio-inspector.test.tsx`

**Step 1: Build the inspector order**

- summary card
- actual-size preview card
- output size
- framing
- name
- hotspot
- scale
- position

**Step 2: Normalize control appearance**

- segmented size controls read as one family
- quick actions use one consistent secondary-button style
- card titles, values, and actions have clear spacing and alignment

**Step 3: Give empty slots a non-duplicated inspector notice**

- slot summary
- expected editable controls after upload
- format guidance

**Step 4: Run inspector tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/studio-inspector.test.tsx tests/studio/studio-entry-gate.test.tsx
```

Expected:

- inspector contract tests pass for both CUR and ANI

### Task 7: Add motion, focus, and async stability polish

**Files:**
- Modify only touched components above
- Test: existing related component and studio tests

**Step 1: Apply restrained interaction rules**

- hover and selection transitions only
- `150-220ms`
- no decorative infinite motion
- focus states remain clearly visible

**Step 2: Respect reduced-motion and async stability**

- use reduced-motion guard where motion is introduced
- reserve vertical space for async or conditional content to avoid layout jumping

**Step 3: Run focused regressions**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/slot-rail.test.tsx tests/components/studio-inspector.test.tsx tests/components/simulation.test.tsx tests/components/ani-simulation.test.tsx tests/studio/studio-entry-gate.test.tsx tests/studio/use-studio-slots.test.tsx
```

Expected:

- all refreshed shell regressions pass

### Task 8: Final build verification

**Files:**
- Verify all touched Studio files above

**Step 1: Run the full relevant regression**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/slot-rail.test.tsx tests/components/studio-inspector.test.tsx tests/components/simulation.test.tsx tests/components/ani-simulation.test.tsx tests/studio/studio-entry-gate.test.tsx tests/studio/use-studio-slots.test.tsx tests/i18n-ko-slot-copy.test.ts
```

Expected:

- all relevant tests pass

**Step 2: Run the production build**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm run build
```

Expected:

- successful build with no type errors

### Task 9: Documentation sync and commit checkpoint

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\point\06-Implementation\ACTIVE_SPRINT.md`
- Modify: `C:\Users\amy\Desktop\pointint\point\10-Journal\QUICK-DECISIONS.md`

**Step 1: Sync the docs**

- note that Studio shell polish now follows the premium product tool direction
- link the design doc and implementation plan from sprint-facing docs

**Step 2: Commit the implementation slice**

```bash
git add frontend/src frontend/tests point/06-Implementation/ACTIVE_SPRINT.md point/10-Journal/QUICK-DECISIONS.md point/06-Implementation/plans/2026-04-13-studio-ui-ux-structure-refresh-design.md point/06-Implementation/plans/2026-04-13-studio-ui-ux-structure-refresh.md
git commit -m "feat(frontend): refresh studio shell information hierarchy"
```

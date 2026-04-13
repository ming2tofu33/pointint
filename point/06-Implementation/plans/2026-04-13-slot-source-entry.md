# Slot Source Entry Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the top-level Studio workflow picker with a slot-level empty-state source chooser that opens directly into the `normal` slot.

**Architecture:** Studio should always load the slot-based editor shell. Empty slots render a dedicated source chooser with two primary actions and an inline secondary expander for future inputs. Existing editing, processing, and background-removal flows remain intact.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, next-intl

---

### Task 1: Lock the new Studio entry contract

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Write the failing test**

- Replace the workflow-picker expectations with slot-empty-state expectations
- Add assertions for:
  - no workflow picker
  - default `normal` slot empty state
  - primary source actions present
  - secondary expander present

**Step 2: Run test to verify it fails**

Run:

```bash
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
```

**Step 3: Implement minimal view changes**

- Update the Studio page to render the empty state instead of `WorkflowPicker`

**Step 4: Run test to verify it passes**

Run the same command and confirm the new entry expectations pass.

### Task 2: Build the slot empty-state source chooser

**Files:**
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\SlotSourceChooser.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Write the failing component tests**

- Assert the chooser renders:
  - slot-specific title
  - static image action
  - animated GIF action
  - inline `다른 방법 보기`
  - `여러 PNG` and `AI` `Soon` rows after expand

**Step 2: Run test to verify it fails**

```bash
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
```

**Step 3: Write minimal implementation**

- Add the chooser component
- Use hidden file inputs for static and animated selection
- Use inline expand for future source options

**Step 4: Run test to verify it passes**

Run the same test again.

### Task 3: Rewire Studio state and slot transitions

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\studioWorkflow.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`

**Step 1: Write the failing transition test**

- Lock these behaviors:
  - default entry uses slot-empty flow
  - selecting an empty slot returns to slot-empty flow
  - normal slot static upload still reaches `uploaded`
  - animated selection still reaches `ani-editing`

**Step 2: Run test to verify it fails**

```bash
npm exec vitest run tests/studio/studio-entry-gate.test.tsx tests/studio/use-studio-workflow.test.tsx
```

**Step 3: Implement minimal state changes**

- Remove visible reliance on `workflow-pick`, `cur-upload`, and `ani-upload`
- Add a slot-empty state or equivalent empty-slot path
- Ensure `selectSlot` switches empty slots back to that path

**Step 4: Run tests to verify they pass**

Run the same commands again.

### Task 4: Verify regression coverage

**Files:**
- Modify as needed: related Studio tests

**Step 1: Run focused regression**

```bash
npm exec vitest run tests/studio/studio-entry-gate.test.tsx tests/studio/use-studio-workflow.test.tsx tests/studio/use-studio-slots.test.tsx
```

**Step 2: Run build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add C:/Users/amy/Desktop/pointint/frontend/src/components/SlotSourceChooser.tsx C:/Users/amy/Desktop/pointint/frontend/src/app/studio/page.tsx C:/Users/amy/Desktop/pointint/frontend/src/lib/useStudio.ts C:/Users/amy/Desktop/pointint/frontend/src/lib/studioWorkflow.ts C:/Users/amy/Desktop/pointint/frontend/tests/studio/studio-entry-gate.test.tsx C:/Users/amy/Desktop/pointint/point/06-Implementation/plans/2026-04-13-slot-source-entry-design.md C:/Users/amy/Desktop/pointint/point/06-Implementation/plans/2026-04-13-slot-source-entry.md
git commit -m "feat(studio): replace workflow picker with slot source entry"
```

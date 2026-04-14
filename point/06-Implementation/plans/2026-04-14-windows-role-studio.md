# Windows-Role Cursor Studio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert Pointtint Studio from a four-slot interaction editor into an 11-role Windows-aligned cursor set editor with primary roles shown by default and full-set download as the main export path.

**Architecture:** Replace the current slot ids and translations with a Windows-role core set, keep the existing static/animated slot contract, then layer progressive disclosure into the slot rail so only four primary roles are visible by default. Finally, redesign Studio download UX around a default full-set package plus a secondary current-slot export.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, current Studio slot model, current static/animated export pipeline

---

### Task 1: Lock the Windows-role slot model in tests

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-slots.test.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\components\slot-rail.test.tsx`

**Step 1: Write the failing tests**

- expect the project to own 11 Windows-aligned roles
- expect the rail to show only the four primary roles by default
- expect the "more" expander to exist

**Step 2: Run test to verify it fails**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-slots.test.tsx tests/studio/studio-entry-gate.test.tsx tests/components/slot-rail.test.tsx
```

Expected:

- failures because the project and rail still assume the old four-slot structure

### Task 2: Replace the slot ids with the Windows core set

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\cursorThemeProject.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Modify any helper types that assume `normal/text/link/button`

**Step 1: Introduce the 11 role ids**

- `normalSelect`
- `textSelect`
- `linkSelect`
- `busy`
- `workingInBackground`
- `unavailable`
- `move`
- `horizontalResize`
- `verticalResize`
- `diagonalResize1`
- `diagonalResize2`

**Step 2: Preserve the existing static/animated editing contract**

- do not redesign per-slot editing behavior in the same step
- only change ids and default project shape

**Step 3: Run the model tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-slots.test.tsx
```

Expected:

- the slot-model tests pass with the new ids

### Task 3: Rebuild the slot rail around primary roles plus an inline expander

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\SlotRail.tsx`
- Modify translations:
  - `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\ko.json`
  - `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\en.json`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\slot-rail.test.tsx`

**Step 1: Define primary and hidden role groups**

- always-visible group: normal, text, link, busy
- hidden group: the remaining seven roles

**Step 2: Add the inline expander**

- show `추가 커서 7개`
- show configured hidden-count summary when hidden roles contain content
- expand/collapse inline instead of using a modal

**Step 3: Run slot rail tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/slot-rail.test.tsx
```

Expected:

- rail tests pass with four default roles and the expandable hidden group

### Task 4: Update role naming, hints, and glyph copy

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\ko.json`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\en.json`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\SlotRail.tsx`

**Step 1: Add Windows-role translations**

Primary:
- `기본 포인터`
- `텍스트 입력`
- `링크`
- `대기 중`

Hidden:
- `백그라운드 작업`
- `사용 불가`
- `이동`
- `가로 크기 조절`
- `세로 크기 조절`
- `대각선 크기 조절 1`
- `대각선 크기 조절 2`

**Step 2: Add plain-language hints for each role**

- short hint under the title
- preserve thumbnail and glyph structure

**Step 3: Run focused regression**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/slot-rail.test.tsx tests/studio/studio-entry-gate.test.tsx
```

Expected:

- the rail and entry screen render the new names without regressions

### Task 5: Rebind selection, empty state, and edit flow to the new default role

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniEditorShell.tsx`

**Step 1: Replace old default slot assumptions**

- default selected role becomes `normalSelect`
- empty entry surface binds to `normalSelect`
- upload helpers that special-case `normal` now special-case `normalSelect`

**Step 2: Keep editing mode semantics unchanged**

- selected role still owns the editor
- hidden roles are editable when expanded and selected

**Step 3: Run the workflow tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-workflow.test.tsx tests/studio/studio-entry-gate.test.tsx
```

Expected:

- first-entry flow still works with the renamed default role

### Task 6: Realign simulation to Windows-role mappings

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\slotSimulationSources.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\Simulation.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniSimulation.tsx`

**Step 1: Replace old slot mappings**

- neutral -> `normalSelect`
- text -> `textSelect`
- link -> `linkSelect`
- busy/loading -> `busy`

**Step 2: Remove old `button` assumptions**

- no simulation slot should still look for `button`
- fallback remains `normalSelect`

**Step 3: Run simulation tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/simulation.test.tsx tests/components/ani-simulation.test.tsx tests/components/cursor-simulation-surface.test.tsx
```

Expected:

- simulation role switching still works under the renamed Windows-role model

### Task 7: Redesign the download UX to default to full-set export

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Modify any action-bar component that renders the download control
- Add tests in:
  - `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-slots.test.tsx`
  - `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Add the export modes**

- default action: `전체 다운로드`
- secondary action: `현재 슬롯만 다운로드`

**Step 2: Keep v1 packaging simple but role-aware**

- full-set export includes all configured roles
- current-slot export includes only the selected role
- package naming should be based on the Windows-role model, not the old slot labels

**Step 3: Run export-related tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-slots.test.tsx tests/studio/studio-entry-gate.test.tsx
```

Expected:

- default and secondary download actions behave correctly

### Task 8: Full regression and build verification

**Files:**
- Verify all touched files above

**Step 1: Run targeted suite**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/use-studio-slots.test.tsx tests/studio/use-studio-workflow.test.tsx tests/studio/studio-entry-gate.test.tsx tests/components/slot-rail.test.tsx tests/components/simulation.test.tsx tests/components/ani-simulation.test.tsx tests/components/cursor-simulation-surface.test.tsx
```

Expected:

- all targeted tests pass

**Step 2: Run production build**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm run build
```

Expected:

- successful Next.js production build

**Step 3: Commit**

```bash
git add frontend/src/lib/cursorThemeProject.ts frontend/src/lib/useStudio.ts frontend/src/app/studio/page.tsx frontend/src/components/SlotRail.tsx frontend/src/components/Simulation.tsx frontend/src/components/AniSimulation.tsx frontend/src/lib/slotSimulationSources.ts frontend/src/i18n/messages/ko.json frontend/src/i18n/messages/en.json frontend/tests/studio/use-studio-slots.test.tsx frontend/tests/studio/use-studio-workflow.test.tsx frontend/tests/studio/studio-entry-gate.test.tsx frontend/tests/components/slot-rail.test.tsx frontend/tests/components/simulation.test.tsx frontend/tests/components/ani-simulation.test.tsx frontend/tests/components/cursor-simulation-surface.test.tsx point/06-Implementation/plans/2026-04-14-windows-role-studio-design.md point/06-Implementation/plans/2026-04-14-windows-role-studio.md
git commit -m "feat(studio): align slots with Windows cursor roles"
```

# Studio Black-Glass Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the navy-heavy dark presentation with a black-glass global header and a warm-charcoal studio workspace that improves editing focus.

**Architecture:** Split shared header tokens away from landing-only tokens, then scope a studio-specific token override to the studio page subtree. Reuse existing components by feeding them different variables instead of rewriting each component by hand.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, existing design-token CSS variables

---

### Task 1: Lock the new theme contracts in tests

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\header.test.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Write the failing tests**

- Add a header test that expects the header root style to reference:
  - `var(--app-header-border)`
  - `var(--app-header-highlight)`
  - `var(--app-header-backdrop)`
  - `var(--app-header-shadow)`
- Add a studio test that expects a `data-testid="studio-theme-scope"` wrapper with inline variable overrides pointing at:
  - `var(--studio-bg-primary)`
  - `var(--studio-bg-secondary)`
  - `var(--studio-border)`

**Step 2: Run the tests to verify they fail**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/header.test.tsx tests/studio/studio-entry-gate.test.tsx
```

Expected:

- failures because the header still uses landing tokens and the studio wrapper does not exist yet

### Task 2: Add the new header and studio token sets

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\globals.css`

**Step 1: Add token definitions**

- Add shared dark header tokens under `:root, [data-theme="dark"]`
- Add studio-specific near-black tokens under the same scope
- Keep current landing tokens for landing/explore content

**Step 2: Run no tests yet**

- token additions alone should not be committed without component usage

### Task 3: Move the shared header to the black-glass token set

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\Header.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\header.test.tsx`

**Step 1: Refactor header styles**

- Replace `--landing-*` header token usage with `--app-header-*`
- Keep structure and nav behavior unchanged
- Preserve sticky behavior and blur, but with the new black-glass values

**Step 2: Run header tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/header.test.tsx
```

Expected:

- header tests pass

### Task 4: Scope the near-black theme to the studio workspace

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`
- Modify if needed: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioBar.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Add the studio theme wrapper**

- Wrap the studio page workspace in `data-testid="studio-theme-scope"`
- Apply inline CSS variable overrides for:
  - `--color-bg-primary`
  - `--color-bg-secondary`
  - `--color-bg-tertiary`
  - `--color-border`
  - `--color-text-primary`
  - `--color-text-secondary`
  - `--color-text-muted`
  - optionally `--studio-panel-fill` values where needed

**Step 2: Adjust StudioBar only if inheritance is insufficient**

- Prefer token inheritance over local hardcoded colors

**Step 3: Run studio tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
```

Expected:

- studio entry tests pass with the new wrapper contract

### Task 5: Update browser theme color

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\layout.tsx`

**Step 1: Replace the old navy theme-color**

- change the meta theme color from the old navy to the new near-black base

### Task 6: Full regression and build verification

**Files:**
- Verify the touched files above

**Step 1: Run focused tests**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/header.test.tsx tests/studio/studio-entry-gate.test.tsx tests/components/slot-rail.test.tsx tests/components/simulation.test.tsx tests/components/ani-simulation.test.tsx
```

Expected:

- all focused tests pass

**Step 2: Run production build**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm run build
```

Expected:

- successful build with no type or lint-level failures from the theme refactor

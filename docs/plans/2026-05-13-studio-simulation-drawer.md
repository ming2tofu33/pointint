# Studio Simulation Drawer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Studio simulation preview behave like a compact validation drawer instead of a dominant always-open panel.

**Architecture:** Keep the existing `SimulationFooter`, `Simulation`, and Studio state wiring. Change the static Studio advanced shell so simulation starts collapsed, expands only on demand, and exposes a lean collapsed summary. Keep quick mode free of the full simulation panel and leave ANI editor behavior unchanged unless tests show shared component assumptions need adjustment.

**Tech Stack:** Next.js 15, React 19, TypeScript, next-intl, Vitest, React Testing Library, Playwright MCP for local visual checks.

---

### Task 1: Lock Collapsed-by-Default Behavior

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\app\studio\page.tsx`

**Step 1: Write the failing test**

Add a Studio integration assertion that static advanced editing renders `studio-simulation-footer`, but does not render `studio-simulation-body` until the simulation toggle is clicked.

**Step 2: Run test to verify it fails**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
```

Expected: FAIL because static Studio currently initializes `simulationCollapsed` as `false`.

**Step 3: Implement minimal behavior**

Change static Studio state:

```ts
const [simulationCollapsed, setSimulationCollapsed] = useState(true);
```

**Step 4: Run test to verify it passes**

Run the same command. Expected: PASS.

### Task 2: Make the Collapsed Bar Read Like a Drawer Handle

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\SimulationFooter.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\components\simulation-footer.test.tsx`

**Step 1: Write the failing test**

Assert that when collapsed:

- `studio-simulation-body` is absent.
- header controls are not rendered.
- the toggle label is visible.
- the footer height remains `3rem`.

Assert that when expanded:

- header controls render.
- body renders.
- the compact expanded height is preserved.

**Step 2: Run test to verify it fails**

Run:

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/simulation-footer.test.tsx
```

Expected: FAIL because collapsed mode currently still renders all header controls.

**Step 3: Implement minimal behavior**

Render `headerControls` only when `collapsed === false`. Keep the toggle available in both states.

**Step 4: Run test to verify it passes**

Run the same command. Expected: PASS.

### Task 3: Verify Studio UI and Regression Surface

**Files:**
- Modify only if verification reveals layout issues.

**Step 1: Run focused tests**

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm exec vitest run tests/components/simulation-footer.test.tsx tests/studio/studio-entry-gate.test.tsx
```

Expected: PASS.

**Step 2: Run full tests**

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm test --
```

Expected: PASS.

**Step 3: Run build**

```bash
cd C:\Users\amy\Desktop\pointint\frontend
npm run build
```

Expected: PASS.

**Step 4: Browser check**

Open `/studio`, upload a static image, skip background removal, enter fine-tune, and confirm:

- central canvas remains dominant.
- simulation is a slim collapsed bar by default.
- expanding simulation shows scene tabs and theme switch.
- collapsing returns to the slim drawer bar.

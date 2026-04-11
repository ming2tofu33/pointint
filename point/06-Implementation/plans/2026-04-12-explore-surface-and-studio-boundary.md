# Explore Surface and Studio Boundary Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove showcase content from `/studio`, introduce a new `/explore` route for browsing samples, and establish a cleaner top-level separation between making and browsing.

**Architecture:** Reuse the existing showcase content and assets, but move the primary showcase destination onto a dedicated `Explore` page. Keep `Studio` focused on workflow selection and editing. Add a reachable navigation path into `Explore` without redesigning the entire landing or global shell in the same slice.

**Tech Stack:** Next.js 15, React 19, TypeScript, next-intl, Vitest, Testing Library

---

### Task 1: Remove Showcase From Studio Entry With Tests First

**Files:**
- Modify: `frontend/tests/studio/studio-entry-gate.test.tsx`
- Modify: `frontend/tests/studio/studio-showcase-rail.test.tsx` or remove it
- Modify: `frontend/src/app/studio/page.tsx`

**Step 1: Write the failing test**

Update the studio entry test so it expects:

- workflow picker renders
- studio showcase rail does not render

Example:

```tsx
expect(screen.getByTestId("workflow-picker")).toBeInTheDocument();
expect(screen.queryByTestId("studio-showcase-rail")).toBeNull();
```

**Step 2: Run the test to verify it fails**

Run:

```bash
cd frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
```

Expected:

- FAIL because the studio showcase rail is still mounted

**Step 3: Implement the minimal code**

Remove the rail from the `workflow-pick` state in `frontend/src/app/studio/page.tsx`.

Delete the now-unused `StudioShowcaseRail` component and test if nothing else references it.

**Step 4: Run the test to verify it passes**

Run:

```bash
cd frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
```

Expected:

- PASS

---

### Task 2: Add The Explore Route

**Files:**
- Create: `frontend/src/app/explore/page.tsx`
- Modify: `frontend/src/app/page.tsx` if shared copy helpers are needed
- Modify: `frontend/src/components/landing/ShowcaseSurface.tsx` only if small reuse adjustments are required
- Create: `frontend/tests/explore/explore-page.test.tsx`

**Step 1: Write the failing route test**

Create a test that expects `/explore` to render:

- an `Explore` heading
- the existing showcase content
- sample download actions

**Step 2: Run the test to verify it fails**

Run:

```bash
cd frontend
npm exec vitest run tests/explore/explore-page.test.tsx
```

Expected:

- FAIL because `/explore` does not exist yet

**Step 3: Implement the minimal page**

Create `frontend/src/app/explore/page.tsx` that reuses the existing showcase copy/model and renders the current showcase surface as the first Explore page.

Keep the page narrow in scope. Do not build a larger cross-product shell yet.

**Step 4: Run the test to verify it passes**

Run:

```bash
cd frontend
npm exec vitest run tests/explore/explore-page.test.tsx
```

Expected:

- PASS

---

### Task 3: Add A Reachable Explore Navigation Path

**Files:**
- Modify: `frontend/src/components/StudioBar.tsx`
- Modify: one landing entry component if needed for a second path into `/explore`
- Create or modify: `frontend/tests/navigation/explore-link.test.tsx`

**Step 1: Write the failing navigation test**

Add a test that expects an `Explore` link to be visible from the current UI shell.

Prefer the smallest stable navigation surface already present, such as `StudioBar`.

**Step 2: Run the test to verify it fails**

Run:

```bash
cd frontend
npm exec vitest run tests/navigation/explore-link.test.tsx
```

Expected:

- FAIL because no Explore link exists yet

**Step 3: Implement the minimal navigation**

Add an `Explore` link to `StudioBar`.

If needed, also add a secondary landing link later, but do not redesign the whole landing navigation in this slice.

**Step 4: Run the test to verify it passes**

Run:

```bash
cd frontend
npm exec vitest run tests/navigation/explore-link.test.tsx
```

Expected:

- PASS

---

### Task 4: Keep Download And Install Flows Stable

**Files:**
- Modify: `frontend/tests/landing/showcase-surface.test.tsx`
- Modify: `frontend/tests/studio/guide-modal.test.tsx`
- Modify: `frontend/src/components/GuideModal.tsx` only if CTA wording should point to `/explore` instead of `/#showcase`

**Step 1: Write the failing behavior test if destination changes**

If the post-download modal CTA should now point to `/explore`, update the test first.

**Step 2: Run the tests to verify failure**

Run:

```bash
cd frontend
npm exec vitest run tests/studio/guide-modal.test.tsx tests/landing/showcase-surface.test.tsx
```

Expected:

- FAIL only if the destination or labels change

**Step 3: Implement the minimal copy/link update**

If approved in scope, change the modal CTA and any landing teaser CTA from `/#showcase` to `/explore`.

Do not refactor the whole showcase content model unless needed for reuse.

**Step 4: Re-run the tests**

Run:

```bash
cd frontend
npm exec vitest run tests/studio/guide-modal.test.tsx tests/landing/showcase-surface.test.tsx
```

Expected:

- PASS

---

### Task 5: Full Frontend Verification

**Files:**
- No additional file requirement

**Step 1: Run focused route and studio tests**

Run:

```bash
cd frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx tests/explore/explore-page.test.tsx tests/navigation/explore-link.test.tsx tests/studio/guide-modal.test.tsx tests/landing/showcase-surface.test.tsx
```

Expected:

- PASS

**Step 2: Run production build**

Run:

```bash
cd frontend
npm run build
```

Expected:

- PASS

---

### Task 6: Sync Docs

**Files:**
- Modify: `point/06-Implementation/ACTIVE_SPRINT.md`
- Modify: `point/10-Journal/QUICK-DECISIONS.md`
- Modify: `point/06-Implementation/Phase-Flow.md` only if the wording should reflect Explore as a top-level browse surface

**Step 1: Update docs**

Record:

- `Studio = make`
- `Explore = browse`
- showcase is no longer embedded in studio entry

**Step 2: Run a quick sanity diff**

Run:

```bash
git diff -- point/06-Implementation/ACTIVE_SPRINT.md point/10-Journal/QUICK-DECISIONS.md point/06-Implementation/Phase-Flow.md
```

Expected:

- only the intended IA updates appear

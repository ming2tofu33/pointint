# Landing Showcase Install Confidence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a landing-page showcase section with downloadable first-party sample cursors, a compact install-confidence strip, and a landing-safe install guide modal.

**Architecture:** Keep the work entirely in the frontend landing surface. Add one new landing section component plus a landing-specific install guide modal, drive sample cards from static metadata, and serve sample preview/download assets from `frontend/public/showcase`. Reuse the existing install-step content model, but do not reuse the studio post-download modal framing directly.

**Tech Stack:** Next.js 15, React 19, TypeScript, next-intl, Vitest, Testing Library

---

### Task 1: Add The Showcase Data Contract And Copy

**Files:**
- Create: `frontend/src/lib/showcaseSamples.ts`
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/i18n/messages/en.json`
- Modify: `frontend/src/i18n/messages/ko.json`
- Test: `frontend/tests/landing/showcase-surface.test.tsx`

**Step 1: Write the failing metadata/render test**

Create a focused test that expects landing showcase copy and sample cards to exist:

```tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import ShowcaseSurface from "@/components/landing/ShowcaseSurface";
import { showcaseSamples } from "@/lib/showcaseSamples";

describe("ShowcaseSurface", () => {
  it("renders curated sample cards and install confidence copy", () => {
    render(
      <NextIntlClientProvider locale="en" messages={{ landing: {/* test copy */} }}>
        <ShowcaseSurface
          copy={{
            eyebrow: "Showcase",
            title: "Download a finished cursor and try it on Windows",
            sub: "Pointint-made samples you can inspect and install right now.",
            installSummary: "Each sample includes .cur, install.inf, and restore-default.inf.",
            installAction: "How to install",
            studioAction: "Open studio",
          }}
          samples={showcaseSamples}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("Showcase")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Download sample/i }).length).toBe(
      showcaseSamples.length
    );
    expect(screen.getByText(/install\\.inf/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `cd frontend && npm run test -- tests/landing/showcase-surface.test.tsx`

Expected:
- FAIL because `ShowcaseSurface` and `showcaseSamples` do not exist yet

**Step 3: Add the metadata module and landing copy wiring**

Create `frontend/src/lib/showcaseSamples.ts` with a static contract:

```ts
export interface ShowcaseSample {
  id: string;
  name: string;
  mood: string;
  description: string;
  previewSrc: string;
  previewAlt: string;
  downloadHref: string;
}

export const showcaseSamples: ShowcaseSample[] = [
  // 3-4 curated first-party samples
];
```

Add new landing keys in both locale files for:

- showcase eyebrow/title/sub
- install summary line
- install action
- open studio action
- download sample label

Update `frontend/src/app/page.tsx` so `LandingPage` receives a `showcase` copy block.

**Step 4: Run the test to verify it passes**

Run: `cd frontend && npm run test -- tests/landing/showcase-surface.test.tsx`

Expected:
- PASS once the data contract and copy surface exist

**Step 5: Commit**

```bash
git add frontend/src/lib/showcaseSamples.ts frontend/src/app/page.tsx frontend/src/i18n/messages/en.json frontend/src/i18n/messages/ko.json frontend/tests/landing/showcase-surface.test.tsx
git commit -m "feat: add landing showcase copy and sample metadata"
```

---

### Task 2: Build The Showcase Section UI

**Files:**
- Create: `frontend/src/components/landing/ShowcaseSurface.tsx`
- Modify: `frontend/src/components/landing/LandingPage.tsx`
- Modify: `frontend/tests/landing/landing-page.test.tsx`
- Test: `frontend/tests/landing/showcase-surface.test.tsx`

**Step 1: Extend the failing tests for section placement**

Add a landing shell assertion that the showcase section renders between workflow and mood:

```tsx
expect(screen.getByTestId("workflow-surface")).toBeInTheDocument();
expect(screen.getByTestId("landing-showcase")).toBeInTheDocument();
expect(screen.getByTestId("mood-glimpse")).toBeInTheDocument();
```

In the showcase test, assert:

- section heading renders
- each sample card renders name and mood
- each sample card exposes a download link
- install summary strip renders

**Step 2: Run the tests to verify they fail**

Run:
- `cd frontend && npm run test -- tests/landing/showcase-surface.test.tsx`
- `cd frontend && npm run test -- tests/landing/landing-page.test.tsx`

Expected:
- FAIL because the section is not mounted yet

**Step 3: Implement the section**

Create `ShowcaseSurface.tsx` with:

- `data-testid="landing-showcase"`
- eyebrow/title/sub header
- responsive card grid or rail
- sample cards with preview image, name, mood, description, and `Download sample` link
- install summary strip under the cards
- `How to install` and `Open studio` actions

In `LandingPage.tsx`:

- add `showcase` to `LandingCopy`
- import `ShowcaseSurface`
- place it after `WorkflowSurface` and before `MoodGlimpse`

Keep the visual language aligned with current landing surfaces.

**Step 4: Run the tests to verify they pass**

Run:
- `cd frontend && npm run test -- tests/landing/showcase-surface.test.tsx`
- `cd frontend && npm run test -- tests/landing/landing-page.test.tsx`

Expected:
- PASS

**Step 5: Commit**

```bash
git add frontend/src/components/landing/ShowcaseSurface.tsx frontend/src/components/landing/LandingPage.tsx frontend/tests/landing/showcase-surface.test.tsx frontend/tests/landing/landing-page.test.tsx
git commit -m "feat: add landing showcase section"
```

---

### Task 3: Add The Landing Install Guide Modal

**Files:**
- Create: `frontend/src/components/landing/LandingInstallGuideModal.tsx`
- Modify: `frontend/src/components/landing/ShowcaseSurface.tsx`
- Test: `frontend/tests/landing/showcase-surface.test.tsx`

**Step 1: Write the failing interaction test**

Add an interaction test for the install action:

```tsx
import userEvent from "@testing-library/user-event";

it("opens and closes the landing install guide modal", async () => {
  const user = userEvent.setup();

  render(/* ShowcaseSurface with copy */);

  await user.click(screen.getByRole("button", { name: /How to install/i }));

  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByText(/Right-click install\\.inf/i)).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /Close/i }));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
```

**Step 2: Run the test to verify it fails**

Run: `cd frontend && npm run test -- tests/landing/showcase-surface.test.tsx`

Expected:
- FAIL because the modal and interaction do not exist yet

**Step 3: Implement a landing-safe guide modal**

Create `LandingInstallGuideModal.tsx` with:

- `role="dialog"`
- open/close props
- guide steps reused from the existing `guide` translation namespace
- no `Download complete` badge
- restore instructions preserved

Update `ShowcaseSurface.tsx`:

- keep local `open` state
- open modal from `How to install`
- close on close button and backdrop

Do not import the studio `GuideModal` directly.

**Step 4: Run the test to verify it passes**

Run: `cd frontend && npm run test -- tests/landing/showcase-surface.test.tsx`

Expected:
- PASS

**Step 5: Commit**

```bash
git add frontend/src/components/landing/LandingInstallGuideModal.tsx frontend/src/components/landing/ShowcaseSurface.tsx frontend/tests/landing/showcase-surface.test.tsx
git commit -m "feat: add landing install guide modal"
```

---

### Task 4: Add Static Showcase Assets

**Files:**
- Create: `frontend/public/showcase/`
- Create: `frontend/public/showcase/*.svg`
- Create: `frontend/public/showcase/*.zip`
- Modify: `frontend/src/lib/showcaseSamples.ts`
- Test: `frontend/tests/landing/showcase-surface.test.tsx`

**Step 1: Add the sample preview and bundle assets**

Create `3-4` first-party sample sets with stable names, for example:

- `frontend/public/showcase/glass-signal-preview.svg`
- `frontend/public/showcase/glass-signal-sample.zip`
- `frontend/public/showcase/ink-orbit-preview.svg`
- `frontend/public/showcase/ink-orbit-sample.zip`
- `frontend/public/showcase/soft-pixel-preview.svg`
- `frontend/public/showcase/soft-pixel-sample.zip`

Each zip should contain:

- `cursor.cur`
- `install.inf`
- `restore-default.inf`

Update `showcaseSamples.ts` to point each sample at the final public paths.

**Step 2: Add a minimal asset integrity assertion**

In the showcase test, verify at least one preview and one download link path:

```tsx
expect(screen.getByAltText(/Glass Signal/i)).toHaveAttribute(
  "src",
  "/showcase/glass-signal-preview.svg"
);
expect(screen.getByRole("link", { name: /Download sample/i })).toHaveAttribute(
  "href",
  expect.stringMatching(/^\\/showcase\\//)
);
```

**Step 3: Run the test to verify it passes**

Run: `cd frontend && npm run test -- tests/landing/showcase-surface.test.tsx`

Expected:
- PASS

**Step 4: Commit**

```bash
git add frontend/public/showcase frontend/src/lib/showcaseSamples.ts frontend/tests/landing/showcase-surface.test.tsx
git commit -m "feat: add downloadable landing showcase samples"
```

---

### Task 5: Sync The Planning Docs

**Files:**
- Modify: `point/06-Implementation/ACTIVE_SPRINT.md`
- Modify: `point/10-Journal/QUICK-DECISIONS.md`
- Modify: `point/06-Implementation/plans/Plans-Index.md`

**Step 1: Update the sprint and decision docs**

Add or update:

- `P1-SHOWCASE-01` as the active or completed follow-up depending on execution state
- showcase defined as curated first-party downloadable samples, not user gallery
- install confidence pattern recorded as summary strip + detailed guide modal

**Step 2: Verify the docs reference the new plan files**

Run:
- `git grep -n "landing-showcase-install-confidence" point`
- `git grep -n "P1-SHOWCASE-01" point/06-Implementation/ACTIVE_SPRINT.md`

Expected:
- new plan/design documents are referenced
- sprint and decisions reflect the accepted scope

**Step 3: Commit**

```bash
git add point/06-Implementation/ACTIVE_SPRINT.md point/10-Journal/QUICK-DECISIONS.md point/06-Implementation/plans/Plans-Index.md
git commit -m "docs: record landing showcase follow-up"
```

---

### Task 6: Run Final Verification

**Files:**
- No file edits

**Step 1: Run focused landing tests**

Run:
- `cd frontend && npm run test -- tests/landing/showcase-surface.test.tsx`
- `cd frontend && npm run test -- tests/landing/landing-page.test.tsx`

Expected:
- PASS

**Step 2: Run the full frontend test suite**

Run:
- `cd frontend && npm run test -- tests`

Expected:
- PASS for the managed frontend tests in `frontend/tests`

**Step 3: Run a production build**

Run:
- `cd frontend && npm run build`

Expected:
- PASS

**Step 4: Manual QA**

Check:

1. Landing shows the new showcase section between workflow and mood.
2. Every sample card has a visible preview and a working download link.
3. The install summary strip mentions `.cur`, `install.inf`, and `restore-default.inf`.
4. `How to install` opens a landing-safe modal and closes correctly.
5. `Open studio` still routes to `/studio`.
6. Mobile layout stacks the cards cleanly without crushing the install strip.

---

### Notes For Execution

- Keep this task frontend-only. Do not add backend showcase APIs.
- Keep the samples first-party and static. Do not introduce user gallery concerns.
- Reuse the install-step content model, but do not reuse the studio success framing.
- Do not start `.ani` showcase work here. This is still `P1-SHOWCASE-01`, not `Phase 1.5`.

---
title: P1-LANDING-03 Implementation Plan
tags:
  - pointint
  - implementation
  - landing
  - plan
aliases:
  - Landing Redesign Plan
  - P1-LANDING-03 Plan
---

# P1-LANDING-03 Landing Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the Pointint landing page into a proof-first, atmospheric 4-section experience that explains the cursor workflow immediately while preserving the wider Pointint brand mood.

**Architecture:** Keep `frontend/src/app/page.tsx` as the thin server entry and move the actual landing composition into a reusable `LandingPage` component so the new shell can be tested without booting the full app router. Replace the current hero-led water demo with a quieter hero proof stage, then reintroduce the water surface as a low-contrast page-wide background for the mid-page sections only.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, next-intl, Tailwind CSS v4, existing WebGL water shader, Vitest + React Testing Library (new), SVG static assets

**Spec:** `point/06-Implementation/plans/2026-04-11-pointint-landing-redesign-design.md`

---

## File Map

| File | Role |
|---|---|
| `frontend/src/app/page.tsx` | Server entry, translation loading, schema injection |
| `frontend/src/components/landing/LandingPage.tsx` | Top-level landing composition for testable shell |
| `frontend/src/components/Header.tsx` | Minimal landing header refresh |
| `frontend/src/components/landing/Hero.tsx` | Proof-first hero with quiet surface mode |
| `frontend/src/components/landing/WorkflowSurface.tsx` | 3-step explanation on reactive surface |
| `frontend/src/components/landing/MoodGlimpse.tsx` | Minimal atmosphere section |
| `frontend/src/components/landing/TrustCTA.tsx` | Trust facts + final CTA |
| `frontend/src/components/landing/Footer.tsx` | Closing footer polish |
| `frontend/src/components/landing/WaterCanvas.tsx` | Support hero/surface intensity variants |
| `frontend/src/i18n/messages/en.json` | New landing redesign copy |
| `frontend/src/i18n/messages/ko.json` | New landing redesign copy |
| `frontend/public/landing/proof-source.svg` | Static source-image proof asset |
| `frontend/public/landing/proof-cursor.svg` | Static cursor-result proof asset |
| `frontend/vitest.config.ts` | Frontend test configuration |
| `frontend/tests/setup.ts` | RTL + jest-dom setup |
| `frontend/tests/landing/*.test.tsx` | Landing shell/component smoke tests |

---

## Task 1: Recompose the landing shell around a testable page component

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/src/app/page.tsx`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/tests/setup.ts`
- Create: `frontend/tests/landing/landing-page.test.tsx`
- Create: `frontend/src/components/landing/LandingPage.tsx`

**Step 1: Add landing test tooling**

Add a `test` script and the minimum dev dependencies needed to run component smoke tests:

```json
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^16.0.0",
    "jsdom": "^25.0.0",
    "vitest": "^2.1.0"
  }
}
```

Create `frontend/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.tsx"],
  },
});
```

Create `frontend/tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

**Step 2: Write the failing shell test**

Create `frontend/tests/landing/landing-page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import LandingPage from "@/components/landing/LandingPage";

const copy = {
  hero: {
    logo: "poin+tint",
    tagline: "Your Point, Your Tint.",
    sub: "좋아하는 이미지를 Windows에서 바로 쓸 수 있는 커서로 바꿔보세요.",
    cta: "이미지로 시작하기",
  },
  workflow: { title: "업로드" },
  mood: { eyebrow: "Pointint for 모니테리어" },
  trust: { cta: "이미지로 시작하기" },
};

test("renders the redesigned four-section landing shell", () => {
  render(<LandingPage copy={copy as never} />);

  expect(screen.getByTestId("hero-proof")).toBeInTheDocument();
  expect(screen.getByTestId("workflow-surface")).toBeInTheDocument();
  expect(screen.getByTestId("mood-glimpse")).toBeInTheDocument();
  expect(screen.getByTestId("landing-trust")).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: "이미지로 시작하기" })).toHaveLength(2);
});
```

**Step 3: Run the test to verify it fails**

Run:

```bash
cd frontend
npm run test -- landing-page
```

Expected: FAIL because `LandingPage` does not exist yet.

**Step 4: Implement the minimal landing shell**

Create `frontend/src/components/landing/LandingPage.tsx` as a thin composition layer with the final section order:

```tsx
export default function LandingPage({ copy }: LandingPageProps) {
  return (
    <>
      <Header />
      <main>
        <Hero copy={copy.hero} />
        <WorkflowSurface copy={copy.workflow} />
        <MoodGlimpse copy={copy.mood} />
        <TrustCTA copy={copy.trust} />
      </main>
      <Footer tagline={copy.footer.tagline} />
    </>
  );
}
```

Update `frontend/src/app/page.tsx` so it only fetches translations, prepares section copy, injects `SoftwareApplication` JSON-LD, and renders `<LandingPage />`.

**Step 5: Run the test to verify it passes**

Run:

```bash
cd frontend
npm run test -- landing-page
```

Expected: PASS.

**Step 6: Commit**

```bash
git add frontend/package.json frontend/vitest.config.ts frontend/tests/setup.ts frontend/tests/landing/landing-page.test.tsx frontend/src/app/page.tsx frontend/src/components/landing/LandingPage.tsx
git commit -m "feat: recompose landing shell for redesign"
```

## Task 2: Rebuild the hero into a proof-first stage

**Files:**
- Modify: `frontend/src/components/Header.tsx`
- Modify: `frontend/src/components/landing/Hero.tsx`
- Modify: `frontend/src/components/landing/LandingPage.tsx`
- Create: `frontend/tests/landing/hero-proof.test.tsx`
- Create: `frontend/public/landing/proof-source.svg`
- Create: `frontend/public/landing/proof-cursor.svg`

**Step 1: Write the failing hero test**

Create `frontend/tests/landing/hero-proof.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import Hero from "@/components/landing/Hero";

test("hero prioritizes proof over decorative copy", () => {
  render(
    <Hero
      copy={{
        logo: "poin+tint",
        tagline: "Your Point, Your Tint.",
        sub: "좋아하는 이미지를 Windows에서 바로 쓸 수 있는 커서로 바꿔보세요.",
        cta: "이미지로 시작하기",
        proofLabel: "From image to cursor",
      }}
    />
  );

  expect(screen.getByText("Your Point, Your Tint.")).toBeInTheDocument();
  expect(screen.getByAltText("Landing proof source")).toBeInTheDocument();
  expect(screen.getByAltText("Landing proof cursor result")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "이미지로 시작하기" })).toBeInTheDocument();
});
```

**Step 2: Run the test to verify it fails**

Run:

```bash
cd frontend
npm run test -- hero-proof
```

Expected: FAIL because the current hero has no proof-stage assets and the header is still tool-oriented.

**Step 3: Implement the minimal proof-first hero**

Update `frontend/src/components/Header.tsx`:

- keep the logo link
- remove the heavy sticky-bar feel
- keep only the `/studio` action on the right

Update `frontend/src/components/landing/Hero.tsx`:

- keep the existing landing-to-studio CTA behavior
- quiet the surface motion
- add a central proof stage with left/right assets
- keep exactly one primary CTA
- avoid secondary CTA and drop-hint dominance

Create minimal SVG assets in `frontend/public/landing/` so the proof stage can ship without waiting for bespoke art direction.

**Step 4: Run the test to verify it passes**

Run:

```bash
cd frontend
npm run test -- hero-proof
```

Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/components/Header.tsx frontend/src/components/landing/Hero.tsx frontend/src/components/landing/LandingPage.tsx frontend/tests/landing/hero-proof.test.tsx frontend/public/landing/proof-source.svg frontend/public/landing/proof-cursor.svg
git commit -m "feat: rebuild landing hero around proof stage"
```

## Task 3: Add the atmospheric mid-page surface and replace the old explanation section

**Files:**
- Modify: `frontend/src/components/landing/WaterCanvas.tsx`
- Create: `frontend/src/components/landing/WorkflowSurface.tsx`
- Create: `frontend/src/components/landing/MoodGlimpse.tsx`
- Modify: `frontend/src/components/landing/LandingPage.tsx`
- Create: `frontend/tests/landing/surface-sections.test.tsx`
- Delete: `frontend/src/components/landing/HowItWorks.tsx`

**Step 1: Write the failing surface-section test**

Create `frontend/tests/landing/surface-sections.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import LandingPage from "@/components/landing/LandingPage";

test("workflow and mood sections sit on atmospheric surfaces", () => {
  render(<LandingPage copy={copyFixture as never} />);

  expect(screen.getByTestId("workflow-surface")).toHaveAttribute("data-surface-mode", "page");
  expect(screen.getByText("업로드")).toBeInTheDocument();
  expect(screen.getByText("다듬기")).toBeInTheDocument();
  expect(screen.getByText("확인하고 적용")).toBeInTheDocument();
  expect(screen.getByTestId("mood-glimpse")).toHaveAttribute("data-surface-mode", "page");
});
```

**Step 2: Run the test to verify it fails**

Run:

```bash
cd frontend
npm run test -- surface-sections
```

Expected: FAIL because the shell still renders the old step section and no atmospheric mid-page surface exists.

**Step 3: Implement the mid-page atmospheric sections**

Extend `frontend/src/components/landing/WaterCanvas.tsx` with a variant/intensity API:

```ts
interface WaterCanvasProps {
  mouseX: number;
  mouseY: number;
  variant?: "hero" | "page";
  motionScale?: number;
}
```

Create `WorkflowSurface.tsx`:

- render the 3-step flow on top of a low-contrast full-width surface
- keep copy to one short line per step
- treat this as explanation, not as a feature grid

Create `MoodGlimpse.tsx`:

- render one wide atmospheric frame
- keep text to a short label or single sentence
- allow `Pointint for 모니테리어` to appear once as a subtle eyebrow

Update `LandingPage.tsx` to use the new sections and remove `HowItWorks.tsx`.

**Step 4: Run the test to verify it passes**

Run:

```bash
cd frontend
npm run test -- surface-sections
```

Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/components/landing/WaterCanvas.tsx frontend/src/components/landing/WorkflowSurface.tsx frontend/src/components/landing/MoodGlimpse.tsx frontend/src/components/landing/LandingPage.tsx frontend/tests/landing/surface-sections.test.tsx
git rm frontend/src/components/landing/HowItWorks.tsx
git commit -m "feat: add atmospheric workflow and mood sections"
```

## Task 4: Replace FAQ-heavy landing copy with compact trust facts and final CTA

**Files:**
- Modify: `frontend/src/i18n/messages/en.json`
- Modify: `frontend/src/i18n/messages/ko.json`
- Modify: `frontend/src/components/landing/Footer.tsx`
- Create: `frontend/src/components/landing/TrustCTA.tsx`
- Modify: `frontend/src/components/landing/LandingPage.tsx`
- Modify: `frontend/src/app/page.tsx`
- Create: `frontend/tests/landing/trust-cta.test.tsx`
- Delete: `frontend/src/components/landing/FAQ.tsx`

**Step 1: Write the failing trust/CTA test**

Create `frontend/tests/landing/trust-cta.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import TrustCTA from "@/components/landing/TrustCTA";

test("trust section uses compact facts instead of faq accordion", () => {
  render(
    <TrustCTA
      copy={{
        facts: ["PNG, JPG, WebP 지원", "Windows용 .cur 다운로드", "무료로 시작 가능", "적용 가이드 제공"],
        cta: "이미지로 시작하기",
      }}
    />
  );

  expect(screen.getByText("PNG, JPG, WebP 지원")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "이미지로 시작하기" })).toBeInTheDocument();
  expect(screen.queryByText("커서를 어떻게 만들 수 있나요?")).not.toBeInTheDocument();
});
```

**Step 2: Run the test to verify it fails**

Run:

```bash
cd frontend
npm run test -- trust-cta
```

Expected: FAIL because there is no `TrustCTA` component and the current page still depends on FAQ content.

**Step 3: Implement compact trust content**

Update `landing` translation keys in `en.json` and `ko.json` so they are grouped by section:

```json
"landing": {
  "hero": { "...": "..." },
  "workflow": { "...": "..." },
  "mood": { "...": "..." },
  "trust": {
    "facts": [
      "PNG, JPG, WebP 지원",
      "Windows용 .cur 다운로드",
      "무료로 시작 가능",
      "적용 가이드 제공"
    ],
    "cta": "이미지로 시작하기"
  },
  "footer": { "tagline": "Your Point, Your Tint." }
}
```

Create `TrustCTA.tsx`, update `LandingPage.tsx`, and remove FAQ wiring from `page.tsx`.

Keep `SoftwareApplication` JSON-LD in `page.tsx`, but remove the visible FAQ-first structure from the landing flow.

**Step 4: Run the test to verify it passes**

Run:

```bash
cd frontend
npm run test -- trust-cta
```

Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/i18n/messages/en.json frontend/src/i18n/messages/ko.json frontend/src/components/landing/TrustCTA.tsx frontend/src/components/landing/Footer.tsx frontend/src/components/landing/LandingPage.tsx frontend/src/app/page.tsx frontend/tests/landing/trust-cta.test.tsx
git rm frontend/src/components/landing/FAQ.tsx
git commit -m "feat: simplify landing trust section and final cta"
```

## Task 5: Polish, verify, and sync project docs

**Files:**
- Modify: `frontend/src/app/globals.css`
- Modify: `point/06-Implementation/ACTIVE_SPRINT.md`
- Modify: `point/10-Journal/QUICK-DECISIONS.md`

**Step 1: Tighten final visual polish**

Use `globals.css` only for tokens or global helpers that all landing sections share:

- section spacing helpers
- subtle overlay utilities
- reduced-motion fallbacks for page-wide surface sections

Avoid dumping section-specific styles into globals.

**Step 2: Run final verification**

Run:

```bash
cd frontend
npm run test
npm run lint
npm run build
```

Expected:

- tests PASS
- lint exits 0
- build exits 0

**Step 3: Perform manual QA**

Check:

- `375px`, `768px`, `1024px`, `1440px`
- hero proof readability
- mid-page surface does not reduce text contrast
- CTA still takes users to `/studio`
- `prefers-reduced-motion` quiets or disables the large background response
- KO/EN copy density still feels short and intentional

**Step 4: Sync docs after the code ships**

Update `ACTIVE_SPRINT.md` with:

- `P1-LANDING-03` status
- shipped evidence (commit hash, files touched, verification)

Append to `QUICK-DECISIONS.md`:

- proof-first + atmospheric follow-through became the new landing direction

**Step 5: Commit**

```bash
git add frontend/src/app/globals.css point/06-Implementation/ACTIVE_SPRINT.md point/10-Journal/QUICK-DECISIONS.md
git commit -m "docs: sync landing redesign rollout evidence"
```

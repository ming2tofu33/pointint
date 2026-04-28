# Content Growth Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build Wave 0-3 of Pointint's search-led growth surface: SEO hygiene, direct tool pages, and trust guides that route users into Studio.

**Architecture:** Keep Studio as the only making surface. Add `/tools/*` and `/guides/*` as lightweight server-rendered intent pages backed by shared content data and reusable page surfaces. Route all creation CTAs into `/studio?workflow=...` so search traffic lands on a focused path without creating separate editors.

**Tech Stack:** Next.js App Router, React 19, next-intl copy, static metadata, Vitest + Testing Library.

---

## Scope

### Wave 0: Hygiene

- Refresh home metadata and landing CTA copy around "image to Windows cursor".
- Add direct Studio workflow links from landing CTAs.
- Expand sitemap to include Explore, tool pages, and guide pages.
- Add analytics event names for landing CTA clicks, upload starts, background decisions, and post-download CTAs.
- Track selectable Studio workflow clicks.

### Wave 1: Image to Cursor Tool Page

- Add `/tools/image-to-cursor`.
- Match intent: upload an image, refine it, download Windows-ready `.cur`.
- Primary CTA: `/studio?workflow=cur-static-image`.
- Include FAQ and internal links to hotspot/install guides.

### Wave 2: GIF to ANI Tool Page

- Add `/tools/gif-to-ani-cursor`.
- Match intent: turn GIF into Windows animated cursor `.ani`.
- Primary CTA: `/studio?workflow=ani-animated-gif`.
- Include FAQ covering `.ani`, GIF input, frame timing, and Windows application.

### Wave 3: Trust Guides

- Add:
  - `/guides/how-to-change-cursor-windows`
  - `/guides/what-is-cursor-hotspot`
  - `/guides/cur-vs-ani`
  - `/guides/fix-blurry-custom-cursor`
- Keep each guide practical and product-led, with CTA back to the relevant tool or Studio workflow.

---

## Task 1: Write Failing Tests

**Files:**

- Create: `frontend/tests/content/content-pages.test.tsx`
- Create: `frontend/tests/sitemap.test.ts`
- Modify: `frontend/tests/landing/hero-proof.test.tsx`
- Modify: `frontend/tests/studio/workflow-picker.test.tsx`
- Modify: `frontend/tests/lib/analytics.test.ts`

**Steps:**

1. Add tests that assert tool/guide content data contains the six target slugs, workflow CTAs, FAQ entries, and cross-links.
2. Add a sitemap test that asserts the homepage, Studio, Explore, both tools, and four guides are present.
3. Update landing hero expectations so the CTA points to `/studio?workflow=cur-static-image`.
4. Add a WorkflowPicker test that clicks an available workflow and expects `workflow_selected`.
5. Add an analytics helper test that forwards the new event names after consent.
6. Run focused tests and confirm they fail for missing content/routes/events.

**Run:**

```bash
cd frontend
npm test -- --run tests/content/content-pages.test.tsx tests/sitemap.test.ts tests/landing/hero-proof.test.tsx tests/studio/workflow-picker.test.tsx tests/lib/analytics.test.ts
```

## Task 2: Shared Content Data and Surfaces

**Files:**

- Create: `frontend/src/lib/contentGrowth.ts`
- Create: `frontend/src/components/content/ToolPageSurface.tsx`
- Create: `frontend/src/components/content/GuidePageSurface.tsx`

**Steps:**

1. Create typed tool and guide content data with title, description, CTA, sections, FAQ, and related links.
2. Build simple server-compatible page surfaces with stable headings, FAQ blocks, and CTA links.
3. Keep styling restrained and consistent with Pointint's current dark product surfaces.

## Task 3: Routes and Metadata

**Files:**

- Create: `frontend/src/app/tools/image-to-cursor/page.tsx`
- Create: `frontend/src/app/tools/gif-to-ani-cursor/page.tsx`
- Create: `frontend/src/app/guides/how-to-change-cursor-windows/page.tsx`
- Create: `frontend/src/app/guides/what-is-cursor-hotspot/page.tsx`
- Create: `frontend/src/app/guides/cur-vs-ani/page.tsx`
- Create: `frontend/src/app/guides/fix-blurry-custom-cursor/page.tsx`
- Modify: `frontend/src/app/sitemap.ts`

**Steps:**

1. Export route-specific static metadata with canonical URLs.
2. Render the shared page surfaces from the content data.
3. Add every route to sitemap with intent-weighted priorities.

## Task 4: Landing and Studio Funnel

**Files:**

- Modify: `frontend/src/i18n/messages/en.json`
- Modify: `frontend/src/i18n/messages/ko.json`
- Modify: `frontend/src/components/landing/Hero.tsx`
- Modify: `frontend/src/components/landing/TrustCTA.tsx`
- Modify: `frontend/src/components/WorkflowPicker.tsx`
- Modify: `frontend/src/lib/analytics.ts`
- Optionally Modify: `frontend/src/app/studio/page.tsx`

**Steps:**

1. Update hero title/sub/CTA and ANI FAQ copy so the landing page no longer says ANI is only "coming soon".
2. Point landing CTAs to `/studio?workflow=cur-static-image`.
3. Track landing CTA clicks and workflow selections.
4. If Studio query handling is needed, consume `workflow` for analytics/source attribution without creating a separate editor.

## Task 5: Verify and Sync Docs

**Files:**

- Modify: `point/06-Implementation/ACTIVE_SPRINT.md`
- Modify: `point/10-Journal/QUICK-DECISIONS.md`

**Steps:**

1. Run focused tests.
2. Run the full frontend test suite if focused tests pass.
3. Update sprint and quick decision docs with the shipped Wave 0-3 content foundation.
4. Note any deferred follow-ups: tool hub page, screenshots, long-form examples, and later localization expansion.


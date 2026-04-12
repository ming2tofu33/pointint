# Analytics Consent And Instrumentation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a global analytics consent banner and consent-gated GA4 + Clarity instrumentation for the current Pointint browse/make/download funnel.

**Architecture:** Store analytics consent in a first-party cookie, load GA4 and Clarity only after explicit acceptance, and route all tracking through a small client-side analytics helper that becomes a no-op when consent or env configuration is missing. Keep the initial event set narrow and frontend-only.

**Tech Stack:** Next.js 15, React 19, TypeScript, next-intl, Vitest, Testing Library

---

### Task 1: Add Consent Utilities With Tests First

**Files:**
- Create: `frontend/src/lib/analytics-consent.ts`
- Create: `frontend/tests/lib/analytics-consent.test.ts`

**Step 1: Write the failing test**

Create tests for:

- reading missing consent as `unknown`
- writing `accepted`
- writing `declined`
- reading each stored value back

**Step 2: Run test to verify it fails**

Run:

```bash
cd frontend
npm exec vitest run tests/lib/analytics-consent.test.ts
```

Expected:

- FAIL because the consent utility does not exist yet

**Step 3: Write minimal implementation**

Implement:

- a cookie name constant
- `getAnalyticsConsent()`
- `setAnalyticsConsent()`

Use a simple string union:

- `accepted`
- `declined`
- `unknown`

**Step 4: Run test to verify it passes**

Run:

```bash
cd frontend
npm exec vitest run tests/lib/analytics-consent.test.ts
```

Expected:

- PASS

---

### Task 2: Add Analytics Loader And Tracking Helper With Tests First

**Files:**
- Create: `frontend/src/lib/analytics.ts`
- Create: `frontend/tests/lib/analytics.test.ts`

**Step 1: Write the failing test**

Create tests for:

- `trackEvent()` no-op when consent is not accepted
- `trackEvent()` no-op when provider env vars are missing
- accepted consent with GA4 present pushes a GA4 event
- accepted consent with Clarity present does not throw during init

Keep tests focused on the helper contract, not on external network calls.

**Step 2: Run test to verify it fails**

Run:

```bash
cd frontend
npm exec vitest run tests/lib/analytics.test.ts
```

Expected:

- FAIL because the analytics helper does not exist yet

**Step 3: Write minimal implementation**

Implement:

- `initAnalytics()`
- `trackPageView()`
- `trackEvent()`
- provider-safe script loading for GA4 and Clarity
- no-op guards for missing consent or missing env vars

Avoid backend dependencies.

**Step 4: Run test to verify it passes**

Run:

```bash
cd frontend
npm exec vitest run tests/lib/analytics.test.ts
```

Expected:

- PASS

---

### Task 3: Add Global Consent Banner With Tests First

**Files:**
- Create: `frontend/src/components/ConsentBanner.tsx`
- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/src/i18n/messages/en.json`
- Modify: `frontend/src/i18n/messages/ko.json`
- Create: `frontend/tests/consent-banner.test.tsx`

**Step 1: Write the failing test**

Add tests that expect:

- banner renders when consent is unknown
- clicking `Only essential` stores declined consent and hides banner
- clicking `Accept all` stores accepted consent and hides banner

**Step 2: Run test to verify it fails**

Run:

```bash
cd frontend
npm exec vitest run tests/consent-banner.test.tsx
```

Expected:

- FAIL because the banner does not exist yet

**Step 3: Write minimal implementation**

Create a client component that:

- reads current consent on mount
- renders only when consent is `unknown`
- writes accepted or declined on button click
- initializes analytics immediately after acceptance

Mount it once in the root layout under the header.

Add i18n keys for title, body, and both buttons.

**Step 4: Run test to verify it passes**

Run:

```bash
cd frontend
npm exec vitest run tests/consent-banner.test.tsx
```

Expected:

- PASS

---

### Task 4: Add Route-Level Page View Tracking

**Files:**
- Create: `frontend/src/components/AnalyticsPageView.tsx`
- Modify: `frontend/src/app/layout.tsx`
- Create: `frontend/tests/analytics-page-view.test.tsx`

**Step 1: Write the failing test**

Create a test that expects:

- a route/path change triggers `trackPageView()`
- no crash occurs when consent is missing or declined

**Step 2: Run test to verify it fails**

Run:

```bash
cd frontend
npm exec vitest run tests/analytics-page-view.test.tsx
```

Expected:

- FAIL because route-level tracking does not exist yet

**Step 3: Write minimal implementation**

Use a small client component that watches the pathname and calls `trackPageView()`.

Mount it in the root layout with the consent banner.

**Step 4: Run test to verify it passes**

Run:

```bash
cd frontend
npm exec vitest run tests/analytics-page-view.test.tsx
```

Expected:

- PASS

---

### Task 5: Instrument Product Events

**Files:**
- Modify: `frontend/src/lib/useStudio.ts`
- Modify: `frontend/src/components/WorkflowPicker.tsx` or the workflow selection path it uses
- Modify: `frontend/src/components/GuideModal.tsx`
- Modify: `frontend/src/components/explore/ExplorePageSurface.tsx`
- Modify: `frontend/src/components/landing/ShowcaseSurface.tsx` only if sample bundle tracking is shared there
- Create: `frontend/tests/studio/analytics-events.test.tsx`
- Create: `frontend/tests/explore/analytics-events.test.tsx`

**Step 1: Write the failing tests**

Cover:

- `studio_entry`
- `workflow_selected`
- `explore_opened`
- `sample_bundle_downloaded`
- `download_completed`
- `install_guide_opened`

Test against the helper calls, not external vendors.

**Step 2: Run the tests to verify they fail**

Run:

```bash
cd frontend
npm exec vitest run tests/studio/analytics-events.test.tsx tests/explore/analytics-events.test.tsx
```

Expected:

- FAIL because the tracking calls are not wired yet

**Step 3: Write the minimal implementation**

Wire the existing user actions to `trackEvent()`:

- studio entry state mount
- workflow selection callback
- explore page mount
- sample bundle download CTA
- successful cursor download completion
- guide modal open state

Do not add extra low-signal events.

**Step 4: Run the tests to verify they pass**

Run:

```bash
cd frontend
npm exec vitest run tests/studio/analytics-events.test.tsx tests/explore/analytics-events.test.tsx
```

Expected:

- PASS

---

### Task 6: Full Frontend Verification

**Files:**
- No new files

**Step 1: Run focused analytics tests**

Run:

```bash
cd frontend
npm exec vitest run tests/lib/analytics-consent.test.ts tests/lib/analytics.test.ts tests/consent-banner.test.tsx tests/analytics-page-view.test.tsx tests/studio/analytics-events.test.tsx tests/explore/analytics-events.test.tsx
```

Expected:

- PASS

**Step 2: Run broader regression coverage**

Run:

```bash
cd frontend
npm exec vitest run tests/header.test.tsx tests/studio/studio-entry-gate.test.tsx tests/studio/guide-modal.test.tsx tests/explore/explore-page.test.tsx tests/landing/showcase-surface.test.tsx
```

Expected:

- PASS

**Step 3: Run production build**

Run:

```bash
cd frontend
npm run build
```

Expected:

- PASS

---

### Task 7: Sync Docs

**Files:**
- Modify: `point/06-Implementation/ACTIVE_SPRINT.md`
- Modify: `point/10-Journal/QUICK-DECISIONS.md`
- Modify: `point/06-Implementation/Phase-Flow.md` only if needed

**Step 1: Update sprint and decision docs**

Record:

- `P1-ANALYTICS-01` scope is now `GA4 + Clarity + consent banner`
- analytics is still auth-independent
- backend admin GA4 reporting remains out of scope for Pointint v1

**Step 2: Run a quick diff sanity check**

Run:

```bash
git diff -- point/06-Implementation/ACTIVE_SPRINT.md point/10-Journal/QUICK-DECISIONS.md point/06-Implementation/Phase-Flow.md
```

Expected:

- only analytics-scope wording changes appear

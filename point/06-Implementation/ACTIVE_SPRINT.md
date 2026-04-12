---
title: ACTIVE SPRINT
tags:
  - pointint
  - sprint
  - active
aliases:
  - Current Sprint
---

# ACTIVE SPRINT

> **Sprint Window:** 2026-03-27 onward
> **Last Updated:** 2026-04-12
> **Status:** Phase 1 gate closed, Phase 1 follow-up sprint still in progress
> **Goal:** Close the remaining trust/polish follow-up and decide when to open Phase 1.5
> **Phase Flow:** [[plans/2026-03-27-implementation-phase-flow]]
> **Implementation Plan:** [[Implementation-Plan]]
> **Ops Refresh:** [[plans/2026-04-11-document-ops-refresh]]
> **North Star:** upload start -> download complete

---

## Current Goal

- `P1-EDITOR-03` preview/export parity is closed.
- `P1-SHOWCASE-01` is now closed with curated first-party sample bundles on landing.
- `P1-IA-01` browse/make split is now landed: `Explore` is the browse surface, while `Studio` returns to make-only workflow entry.
- `P1-HOTSPOT-01` is now closed with rule-based hotspot recommendation, one-time auto-apply on editor entry, manual override lock, and explicit re-recommend action.
- ANI is not started yet. Workflow cards are visible as `Soon`, but no `.ani` pipeline, GIF/video ingestion, or ANI export exists.
- `P1-ANALYTICS-01` is now closed with a global analytics consent banner plus GA4 and Clarity instrumentation for the current browse/make/download funnel.
- The next execution choice is whether to finish `P1-MOCKUP-01` before opening `Phase 1.5`.

## Current Doing

> Only active work lives here. Completed work moves to `Recently Done`.

| Lane | Task | Status | Note |
|---|---|---|---|
| Now | `P1-MOCKUP-01` | queued | Desktop mockup system aligned with landing/showcase visual language |
| Next | `Phase 1.5 planning` | queued | Decide ANI + Media Prep Foundation start slice after remaining Phase 1 polish |
| Watch | `Phase 1.5` | candidate | ANI + Media Prep Foundation after current follow-up scope is resolved |

## Next Session

- Decide whether `P1-MOCKUP-01` should reuse the showcase sample system
- Decide whether the mockup should live only on landing/explore or also appear in studio download success states
- Re-evaluate `Phase 1.5` timing now that analytics instrumentation is closed

## Blockers

- No technical blocker is open right now
- ANI is blocked on `Phase 1.5` foundation work. The current product can advertise ANI paths, but it cannot ingest or export animated cursors yet.

## Recently Done

- `P1-LANDING-01` complete: landing page, hero drop entry, how-it-works, FAQ, JSON-LD, i18n, sitemap, robots, OG metadata. Evidence: `1a60df0`
- `P1-LANDING-02` complete: water-surface landing hero upgrade and tuning. Evidence: `834290f`, `836c7ec`, `832f8be`, `89e2b61`, `452249f`
- `P1-LANDING-03` complete: proof-first landing redesign with 4 sections: `Hero Proof -> Workflow Surface -> Mood Glimpse -> Trust CTA`
- `P1-EDITOR-03` complete: square preview as source of truth, `contain` default framing, `cover` choice, preview/export parity, hotspot remap. Evidence: `0f2a2cb`, `c50d95d`
- `P1-SHOWCASE-01` complete: curated first-party sample cursor bundles, install confidence strip, detailed install guide modal, studio CTA. Evidence: `7a40b63`
- `P1-IA-01` complete: `Studio = make`, `Explore = browse`, `/studio` showcase removed, `/explore` added as a top-level browse surface, guide modal routed to `Explore`, logo retained as home entry.
- `P1-HOTSPOT-01` complete: rule-based hotspot recommendation, auto-apply on editor entry, manual override lock, explicit re-recommend control, and targeted algorithm/hook/UI coverage.
- `P1-ANALYTICS-01` complete: global analytics consent banner, consent-gated GA4 + Clarity loading, route page views, and minimal funnel events for studio, explore, showcase downloads, guide opens, and download completion.

## Decision Follow-up

- 2026-04-11: Pointint doc ops now follow an `Idea Mine` + `0to1log` style model. Sprint, plan, phase, and decision docs must be synced in the same session.
- 2026-04-11: `P1-EDITOR-03` became the active editor-confidence task. Square preview is the source of truth and `contain` is the default framing mode.
- 2026-04-12: `P1-SHOWCASE-01` is defined as a curated first-party result showcase, not a user gallery. The section uses a short install-confidence strip plus a detailed install guide modal.
- 2026-04-12: The hybrid studio-showcase entry was superseded. `Studio` is the make surface, `Explore` is the browse surface, and showcase discovery now routes through `/explore`.
- 2026-04-12: `P1-HOTSPOT-01` ships as a rule-based client-side recommendation. It auto-applies once, respects manual edits, and uses the same square-framed render model as preview/export.
- 2026-04-12: `P1-ANALYTICS-01` ships as a frontend-only instrumentation slice. Consent is stored in a first-party cookie, GA4 and Clarity load only after acceptance, and analytics remains independent from auth.

## Document Follow-up

| Document | Update | Status |
|---|---|---|
| `ACTIVE_SPRINT.md` | Sprint state rewritten around actual shipped work and next follow-up choice | synced |
| `Implementation-Plan.md` | Doc roles, follow-up rules, stale/ghost handling | synced |
| `Phase-Flow.md` | Phase summary aligned to shipped work and Phase 1.5 framing | synced |
| `plans/2026-03-27-implementation-phase-flow.md` | Phase 1 and Phase 1.5 execution alignment | synced |
| `plans/2026-04-11-framing-preview-export-parity.md` | Editor-confidence task record | synced |
| `plans/2026-04-12-landing-showcase-install-confidence.md` | Landing showcase implementation plan | synced |
| `plans/2026-04-12-landing-showcase-install-confidence-design.md` | Landing showcase design decisions | synced |
| `plans/2026-04-12-explore-surface-and-studio-boundary.md` | Explore surface + studio boundary implementation plan | synced |
| `plans/2026-04-12-explore-surface-and-studio-boundary-design.md` | Explore surface + studio boundary design decisions | synced |
| `plans/2026-04-12-analytics-consent-instrumentation.md` | Analytics consent + GA4/Clarity implementation plan | synced |
| `plans/2026-04-12-analytics-consent-instrumentation-design.md` | Analytics consent + instrumentation design decisions | synced |
| `10-Journal/QUICK-DECISIONS.md` | Workflow and showcase decisions recorded | synced |

---

## Phase 1 Task Summary

### Wave 1: Project Setup + Backend Core

| Task ID | Title | Status | Note |
|---|---|---|---|
| P1-SETUP-01 | Next.js + Vercel + domain | done | |
| P1-SETUP-02 | FastAPI + Railway | done | |
| P1-SETUP-03 | Frontend/backend API path | done | health check verified |
| P1-BG-01 | Background removal (HF Space BiRefNet) | done | Railway -> HF Space |
| P1-CONVERT-01 | File conversion (JPG/WebP -> PNG) | done | |
| P1-CUR-01 | `.cur` binary generation | done | BMP/DIB output |

### Wave 2: Editor + Preview + Confidence

| Task ID | Title | Status | Note |
|---|---|---|---|
| P1-UPLOAD-01 | Image upload UI | done | drag-and-drop + remove-bg choice |
| P1-EDITOR-01 | Canvas position/scale editor | done | |
| P1-EDITOR-02 | Hotspot drag UI | done | |
| P1-EDITOR-03 | Framing parity + preview/export lock | done | preview = export |
| P1-HOTSPOT-01 | Hotspot recommendation | done | rule-based, auto once, manual lock |
| P1-SIM-01 | Cursor simulation modes | done | preview + interactive + light/dark |
| P1-MOCKUP-01 | Desktop mockup | todo | may reuse showcase visuals |
| P1-HEALTH-01 | Cursor health check | done | visibility, hotspot, usability |

### Wave 3: Download + Apply + Landing

| Task ID | Title | Status | Note |
|---|---|---|---|
| P1-DL-01 | `.cur` download package | done | zip with install files |
| P1-INF-01 | `.inf` install flow | done | Windows scheme registration |
| P1-RESTORE-01 | Restore `.inf` | done | |
| P1-GUIDE-01 | Apply guide modal | done | 4-step guide |
| P1-DEFENSE-01 | File size / input guardrails | done | 16-4096 px |
| P1-LANDING-01 | Landing page + SEO/GEO | done | |
| P1-LANDING-02 | Water-surface landing hero | done | |
| P1-LANDING-03 | Proof-first landing redesign | done | |
| P1-SHOWCASE-01 | Landing showcase bundles | done | 2026-04-12 |
| P1-IA-01 | Studio/Explore product boundary | done | landed on main |
| P1-ANALYTICS-01 | Funnel event tracking | done | GA4 + Clarity + consent banner |

## Next Priority Order

| Task | Priority | Note |
|---|---|---|
| `P1-MOCKUP-01` | P0 | Extend trust surfaces with desktop context |
| `Phase 1.5 planning` | P1 | Decide ANI + Media Prep Foundation start point |

## Transition Note

- Phase 1 gate is closed.
- Landing redesign, editor-confidence parity, hotspot recommendation, and analytics instrumentation are now shipped.
- The immediate branch point is:
  - close `P1-MOCKUP-01` first
  - or open `Phase 1.5` for ANI + Media Prep Foundation
- Current recommendation: finish the remaining trust/polish slice, then decide whether to switch phases.

## References

- [[plans/2026-03-27-implementation-phase-flow]]
- [[plans/2026-04-11-document-ops-refresh]]
- [[plans/2026-04-11-framing-preview-export-parity]]
- [[plans/2026-04-12-landing-showcase-install-confidence]]
- [[plans/2026-04-12-landing-showcase-install-confidence-design]]
- [[plans/2026-04-12-explore-surface-and-studio-boundary]]
- [[plans/2026-04-12-explore-surface-and-studio-boundary-design]]
- [[Implementation-Plan]]
- [[Phase-Flow]]
- [[plans/2026-04-12-cursor-suite-roadmap-design]]

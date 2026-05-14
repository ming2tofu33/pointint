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
> **Last Updated:** 2026-05-14
> **Status:** Phase 1 gate closed, ANI Source Maker complete, Video to ANI controls complete
> **Goal:** Reduce Studio start friction, then extend the source-maker foundation to Video to ANI
> **Phase Flow:** [[Phase-Flow]]
> **Implementation Plan:** [[Implementation-Plan]]
> **Ops Refresh:** [[plans/2026-04-11-document-ops-refresh]]
> **North Star:** upload start -> download complete

---

## Current Goal

- `P1-EDITOR-03` preview/export parity is closed.
- `P1-SHOWCASE-01` is now closed with curated first-party sample bundles on landing.
- `P1-IA-01` browse/make split is now landed: `Explore` is the browse surface, while `Studio` returns to make-only workflow entry.
- `P1-HOTSPOT-01` is now closed with rule-based hotspot recommendation, one-time auto-apply on editor entry, manual override lock, and explicit re-recommend action.
- `P1-MOCKUP-01` is deferred. It is not a gate for opening `Phase 1.5`.
- `P1-ANALYTICS-01` is now closed with a global analytics consent banner plus GA4 and Clarity instrumentation for the current browse/make/download funnel.
- `Phase 1.5` is open with ANI v1 scoped to `Animated GIF -> shared framing/hotspot -> .ani export`.
- Slot-based studio foundation is now in flight: `normal / text / link / button` slots edit one at a time and the simulation runtime is moving to zone-based source mapping.
- `Phase 1.5 / STUDIO-UX-01` is now closed with a premium-tool shell refresh across CUR and ANI: slot board, stage header, validation footer, and inspector now read as one system.
- `CONTENT-GROWTH-01` Wave 0-3 is implemented: `/tools`, `/guides`, `/tools/image-to-cursor`, `/tools/gif-to-ani-cursor`, four `/guides/*` trust pages, sitemap expansion, direct Studio workflow CTAs, and growth-funnel analytics events.
- `STUDIO-QUICK-FINISH-01` is closed: static CUR users start with upload -> optional background decision -> quick result -> download, while advanced controls stay behind `세부 조정`.
- `Phase 1.5 / Video to ANI` is implemented: MP4/WebM uploads extract browser-side frames and open the existing ANI editor/export path.
- `Phase 1.5 / Video to ANI Controls` is complete: compact pre-upload start/duration/FPS settings now feed the existing browser frame extractor and ANI editor handoff.

## Current Doing

> Only active work lives here. Completed work moves to `Recently Done`.

| Lane | Task | Status | Note |
|---|---|---|---|
| Done | `Phase 1.5 / Video to ANI Controls` | complete | Compact start/duration/FPS controls before video upload; focused tests, full tests, build, and browser QA passed |
| Done | `Phase 1.5 / Video to ANI` | complete | MP4/WebM -> extracted PNG frame sequence -> existing ANI editor/export path; tests, build, and browser QA passed |
| Done | `STUDIO-QUICK-FINISH-01` | complete | Browser QA, tests, build, and commit are closed for the one-way quick-to-advanced flow |
| Done | `CONTENT-GROWTH-01` | complete | Wave 0-3 search entry foundation: Tools/Guides nav hubs, tool pages, trust guides, sitemap, direct Studio CTAs, funnel events |
| Done | `ANI-SOURCE-01` | complete | `GIF Maker`: multiple images -> sorted frame sequence -> ANI editor -> image-sequence export |
| Option | `WIN-INSTALLER-EXE-01` | deferred option | Keep as a later distribution spike; ZIP + INF RC and wording are already validated for now |
| Option | `BG-FT-01` | deferred option | Fine-tuning/background-removal quality work is intentionally postponed until source-maker work needs it |

## Next Session

- Use `Video to ANI Controls` as the stable source-maker baseline for the next acquisition or polish slice.
- Keep the shipped v1 source path frontend-only: video -> extracted PNG frames -> existing image-sequence ANI editor.
- Defer visual trim scrubbers, MOV/HEVC, and backend FFmpeg unless usage shows the need.
- Review the new `/tools`, `/guides`, `/tools/*`, and `/guides/*` pages in browser once visual QA starts; add screenshots/examples after first search-console feedback
- Design the video source-maker as `video file -> extracted frame sequence -> existing ANI editor`
- Keep the GIF Maker v1 compact: multi-image upload/drop, sorted frames, shared hotspot/framing, and Windows `.ani` export
- Keep `P1-MOCKUP-01` deferred unless trust gaps show up in real usage
- Keep `BG-FT-01` and `WIN-INSTALLER-EXE-01` as deferred options

## Blockers

- No technical blocker is open right now
- Scope hygiene remains the main risk for follow-ups: keep Video to ANI improvements compact unless real usage demands a separate editor.
- ANI v1 is no longer blocked on phase entry. GIF Maker and Video to ANI source slices are now implemented on the same editor/export foundation.

## Recently Done

- `P1-LANDING-01` complete: landing page, hero drop entry, how-it-works, FAQ, JSON-LD, i18n, sitemap, robots, OG metadata. Evidence: `1a60df0`
- `P1-LANDING-02` complete: water-surface landing hero upgrade and tuning. Evidence: `834290f`, `836c7ec`, `832f8be`, `89e2b61`, `452249f`
- `P1-LANDING-03` complete: proof-first landing redesign with 4 sections: `Hero Proof -> Workflow Surface -> Mood Glimpse -> Trust CTA`
- `P1-EDITOR-03` complete: square preview as source of truth, `contain` default framing, `cover` choice, preview/export parity, hotspot remap. Evidence: `0f2a2cb`, `c50d95d`
- `P1-SHOWCASE-01` complete: curated first-party sample cursor bundles, install confidence strip, detailed install guide modal, studio CTA. Evidence: `7a40b63`
- `P1-IA-01` complete: `Studio = make`, `Explore = browse`, `/studio` showcase removed, `/explore` added as a top-level browse surface, guide modal routed to `Explore`, logo retained as home entry.
- `P1-HOTSPOT-01` complete: rule-based hotspot recommendation, auto-apply on editor entry, manual override lock, explicit re-recommend control, and targeted algorithm/hook/UI coverage.
- `P1-ANALYTICS-01` complete: global analytics consent banner, consent-gated GA4 + Clarity loading, route page views, and minimal funnel events for studio, explore, showcase downloads, guide opens, and download completion.
- `Phase 1.5 / ANI-V1-01` in progress: `ANI > Animated GIF` is selectable, GIF upload enters a dedicated ANI editor shell, shared framing/hotspot controls are reused, and the backend now exposes a `.ani` export route for GIF-first ANI creation.
- `Phase 1.5 / ANI-V1-01` advanced: Studio is moving from a single-cursor editor to a slot-based cursor theme editor with `normal / text / link / button`, zone-mapped simulation fallback, and download gated on a populated `normal` slot.
- `Phase 1.5 / STUDIO-UX-01` complete: Studio now reads as a premium product tool with shared CUR/ANI stage headers, action regions, source-entry cards, inspector cards, and restrained motion/focus polish.
- `Phase 1.5 / STUDIO-RC-QA-01` complete: multi-slot background-decision gating, Windows package ZIP structure, and mixed CUR/ANI browser download were regression-tested and documented.
- `WIN-INSTALLER-ZIP-01` complete enough for now: current ZIP + INF output, Windows install failure modes, and user-facing install wording were audited and clarified. `.exe` stays a deferred option.
- `ANI-SOURCE-01` complete: GIF Maker is exposed as an empty-slot source, multiple PNG/JPG/WebP frames enter `ani-editing` as an `image-sequence`, backend/frontend sequence export is wired, and Korean/English source copy is synchronized. Evidence: `18d5b6a`, `66c7586`, `8b9d5ca`, `85b4c9c`, `5d860fa`, `3dc411f`.
- `CONTENT-GROWTH-01` complete: Wave 0-3 content foundation adds top-level Tools/Guides hubs, intent pages for image-to-cursor and GIF-to-ANI, trust guides for Windows apply/hotspot/CUR-vs-ANI/blurry cursors, direct Studio workflow CTAs, sitemap coverage, and funnel analytics tests.
- `Phase 1.5 / Video to ANI` complete: selectable Studio workflow, MP4/WebM source upload, client-side frame extraction, image-sequence ANI editor handoff, and QA evidence are recorded in `docs/plans/2026-05-14-video-to-ani.md`.
- `Phase 1.5 / Video to ANI Controls` complete: pre-upload start/duration/FPS options, option plumbing, extractor edge coverage, i18n, tests, build, and browser QA are recorded in `docs/plans/2026-05-14-video-to-ani-controls.md`.

## Decision Follow-up

- 2026-04-11: Pointint doc ops now follow an `Idea Mine` + `0to1log` style model. Sprint, plan, phase, and decision docs must be synced in the same session.
- 2026-04-11: `P1-EDITOR-03` became the active editor-confidence task. Square preview is the source of truth and `contain` is the default framing mode.
- 2026-04-12: `P1-SHOWCASE-01` is defined as a curated first-party result showcase, not a user gallery. The section uses a short install-confidence strip plus a detailed install guide modal.
- 2026-04-12: The hybrid studio-showcase entry was superseded. `Studio` is the make surface, `Explore` is the browse surface, and showcase discovery now routes through `/explore`.
- 2026-04-12: `P1-HOTSPOT-01` ships as a rule-based client-side recommendation. It auto-applies once, respects manual edits, and uses the same square-framed render model as preview/export.
- 2026-04-12: `P1-ANALYTICS-01` ships as a frontend-only instrumentation slice. Consent is stored in a first-party cookie, GA4 and Clarity load only after acceptance, and analytics remains independent from auth.
- 2026-04-12: `P1-MOCKUP-01` is deferred and does not block Phase 1.5.
- 2026-04-12: ANI v1 starts as a GIF-first slice only. `ANI > Animated GIF` is the only selectable ANI entry, and v1 keeps shared framing/hotspot controls instead of frame-level editing.
- 2026-04-13: Slot-based cursor themes now drive the Studio direction for Phase 1.5. `normal / text / link / button` are fixed slots, simulation resolves zone -> slot with fallback to `normal`, and download stays disabled until `normal` exists.
- 2026-04-13: Studio dark presentation now splits from landing browse mood. The shared header uses black-glass tokens, while `/studio` applies a scoped near-black workspace theme for focus-heavy editing.
- 2026-04-13: Studio shell polish should follow a premium product tool direction with a restrained creative accent. The target hierarchy is `tool rail -> slot board -> edit stage -> validation stage -> inspector`.
- 2026-04-13: Studio shell hierarchy is now unified across CUR and ANI. Empty slots keep one central source-entry hub, while populated slots share the same stage header, validation footer, and inspector contract.
- 2026-04-15: Background removal fine-tuning is an option, not an active sprint item. The current HF path is a remote inference wrapper, so any quality upgrade should be evaluated as a separate train-and-redeploy spike.
- 2026-04-24: A Windows `.exe` installer is worth tracking as an option, but should start as a feasibility spike because code signing, SmartScreen reputation, restore/uninstall behavior, and user trust are the main risks.
- 2026-04-27: `ANI-SOURCE-01` is closed as a GIF Maker source slice. The source-maker pattern is now established as `source media -> ordered frames -> existing ANI editor -> Windows role export`; `Video to ANI` should reuse this path instead of creating a separate editor.
- 2026-04-27: `Phase 2.5 / Theme Asset Foundation` is added as a queued future phase after Auth, project storage, 17-role generation, and install trust. It should start with folder icons, wallpaper export, and cursor/icon/wallpaper theme-pack drafts; it is not part of the current Phase 1.5 ANI scope.
- 2026-04-27: Content Growth Wave 0-3 ships as tool and guide pages rather than blog posts. Search intent pages should route into Studio workflows and remain product-led.
- 2026-04-27: Content Growth pages are now first-class UI entry points. Header and mobile menu expose `Tools` and `Guides`; `/tools` and `/guides` act as hubs before users drill into specific intent pages.
- 2026-05-14: Studio static CUR entry should default to a quick-finish flow instead of exposing the full professional editor first. The advanced Studio shell remains available through `세부 조정`; ANI/GIF source work remains on the existing editor shell.

## Document Follow-up

| Document | Update | Status |
|---|---|---|
| `ACTIVE_SPRINT.md` | Sprint state rewritten around actual shipped work and next follow-up choice | synced |
| `Implementation-Plan.md` | Doc roles, follow-up rules, stale/ghost handling | synced |
| `Phase-Flow.md` | Phase summary aligned to shipped work, Phase 1.5 framing, and queued Phase 2.5 theme-asset foundation | synced |
| `Roadmap.md` | Phase 2.5 Theme Asset Foundation added between Phase 2 and Phase 3 | synced |
| `plans/2026-03-27-implementation-phase-flow.md` | Phase 1 and Phase 1.5 execution alignment | synced |
| `plans/2026-04-11-framing-preview-export-parity.md` | Editor-confidence task record | synced |
| `plans/2026-04-12-landing-showcase-install-confidence.md` | Landing showcase implementation plan | synced |
| `plans/2026-04-12-landing-showcase-install-confidence-design.md` | Landing showcase design decisions | synced |
| `plans/2026-04-12-explore-surface-and-studio-boundary.md` | Explore surface + studio boundary implementation plan | synced |
| `plans/2026-04-12-explore-surface-and-studio-boundary-design.md` | Explore surface + studio boundary design decisions | synced |
| `plans/2026-04-12-analytics-consent-instrumentation.md` | Analytics consent + GA4/Clarity implementation plan | synced |
| `plans/2026-04-12-analytics-consent-instrumentation-design.md` | Analytics consent + instrumentation design decisions | synced |
| `plans/2026-04-13-studio-black-glass-theme.md` | Studio black-glass header + near-black workspace implementation plan | synced |
| `plans/2026-04-13-studio-black-glass-theme-design.md` | Studio black-glass header + near-black workspace design decisions | synced |
| `plans/2026-04-13-studio-ui-ux-structure-refresh-design.md` | Studio premium-tool shell refresh design decisions | synced |
| `plans/2026-04-13-studio-ui-ux-structure-refresh.md` | Studio premium-tool shell refresh implementation plan | synced |
| `plans/2026-04-15-background-removal-finetune-option.md` | Background-removal fine-tune feasibility option | synced |
| `plans/2026-04-24-windows-exe-installer-option.md` | Windows installer feasibility option | synced |
| `plans/2026-04-25-studio-rc-qa-hardening.md` | Studio RC QA checklist and regression coverage scope | synced |
| `plans/2026-04-26-windows-installer-feasibility-spike.md` | Windows installer feasibility spike plan | synced |
| `plans/2026-04-27-page-cro-follow-up.md` | Landing/Studio/download conversion follow-up from page-cro review | synced |
| `plans/2026-04-27-content-growth-foundation.md` | Wave 0-3 content growth implementation plan | synced |
| `docs/plans/2026-05-13-studio-quick-finish.md` | Studio quick-finish implementation plan and QA boundary | synced |
| `docs/plans/2026-05-14-video-to-ani.md` | Video to ANI source-maker implementation plan | synced |
| `docs/plans/2026-05-14-video-to-ani-controls.md` | Video to ANI extraction controls implementation plan | synced |
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
| `/tools/video-to-ani-cursor` acquisition page | P0 | Now that the controlled workflow is stable, add the product-led SEO entry point |
| `STUDIO-QUICK-FINISH-01` | Done | Simplified static CUR flow is closed |
| `P1-MOCKUP-01` | P2 | Keep deferred unless trust gaps show up in real usage |

## Transition Note

- Phase 1 gate is closed.
- Landing redesign, editor-confidence parity, hotspot recommendation, and analytics instrumentation are now shipped.
- Phase 1.5 is already open.
- The immediate branch point is no longer whether to enter Phase 1.5; it is implementing compact extraction controls without expanding into a separate video editor.
- Current recommendation: ship start/duration/FPS controls, then prioritize `/tools/video-to-ani-cursor` for acquisition after the controlled workflow is stable.

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

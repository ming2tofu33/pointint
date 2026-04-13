---
title: QUICK DECISIONS
tags:
  - pointint
  - journal
  - decisions
aliases:
  - Quick Decisions
---

# QUICK DECISIONS

> [!note]
> Keep this file append-only. Record short decisions here and link out to plans when deeper rationale exists.

## 2026-03-27

- Use `point/` as the primary project memory base.
- Keep execution plans in `point/06-Implementation/plans/`.
- Start sessions by checking `00-INDEX` and `ACTIVE_SPRINT`.
- Keep fast decision logs under `point/10-Journal/`.

## 2026-04-11

### Workflow Follow-up

- CUR/ANI is a workflow choice before upload, not an editor-side toggle.
- ANI cards stay visible but disabled as Soon until real ANI inputs/export exist.
- AI Generate stays inside each output family instead of becoming its own top-level section.

### Doc Ops

- Pointint doc ops now follow an `Idea Mine` + `0to1log` style pattern.
- `Current Doing` tracks active work only.
- Sprint, plan, phase, and decision docs should be synced in the same session when work meaningfully changes state.

### Landing + Editor

- Phase 1 gate is closed and the next follow-up order became `P1-SHOWCASE-01` -> `P1-HOTSPOT-01` -> `P1-MOCKUP-01`.
- Landing design is fixed to `Hero Proof -> Workflow Surface -> Mood Glimpse -> Trust CTA`.
- `P1-EDITOR-03` became the active editor-confidence task.
- Square preview is the source of truth, `contain` is the default framing mode, and `preview = export` is the contract.

## 2026-04-12

- Cursor-suite thinking now lives in [[06-Implementation/plans/2026-04-12-cursor-suite-roadmap-design]] as a long-term reference.
- Official phase docs only import promoted scope from that roadmap instead of copying the whole capability map into active execution.
- Phase 1.5 is framed as `ANI + Media Prep Foundation`, not a vague ANI expansion bucket.
- `P1-SHOWCASE-01` is a curated first-party result showcase, not a user gallery or community feed.
- The landing showcase uses a short install-confidence strip plus a detailed install guide modal instead of expanding full instructions inline.
- Showcase cards should support both `Download bundle` and `Open studio` paths so the section proves outcome and routes users back into the making flow.
- Studio showcase access should use a hybrid entry: compact sample downloads above the workflow picker in `/studio`, with the landing showcase kept as the larger explanation surface.
- The hybrid studio-showcase entry is superseded. `Studio = make`, `Explore = browse`, and showcase discovery should move to a top-level `/explore` surface instead of living inside `/studio`.
- Download completion should route users toward `Explore`, not back to a landing-section anchor, because browse surfaces now live outside the editor.
- `P1-HOTSPOT-01` stays rule-based and client-side for Phase 1. The recommendation uses the current framed square render, auto-applies once on editor entry, and stops overwriting after a manual hotspot edit.
- `P1-ANALYTICS-01` should follow the `0to1log` pattern at the frontend only: global consent banner, first-party consent cookie, consent-gated GA4 and Clarity loading, and no auth dependency.
- Pointint analytics v1 tracks only the current browse/make/download funnel. It does not include backend GA4 reporting, user identity stitching, or a privacy settings center.
- `P1-MOCKUP-01` is deferred. It is not required to open Phase 1.5.
- ANI v1 opens with a GIF-first slice only: `ANI > Animated GIF` becomes selectable, shared framing/hotspot controls are reused, and frame-level editing stays out of scope for v1.

## 2026-04-13

- Studio direction changes from single-cursor editing to slot-based cursor theme editing. Phase 1.5 uses fixed slots: `normal`, `text`, `link`, and `button`.
- Slot editing stays single-focus, but simulation is now state-driven: neutral -> `normal`, text -> `text`, link -> `link`, button -> `button`, with fallback to `normal`.
- Download stays disabled until `normal` exists, even if another slot is populated, because export semantics are still anchored to the active path while the slot model lands.
- Shared header styling should no longer depend on landing-only navy glass tokens. The app header now owns its own black-glass token set.
- Studio workspace styling should be scoped locally instead of rewriting global dark mode. `/studio` uses near-black workbench tokens so landing and explore can keep their browse-oriented surfaces.
- Studio shell polish should use a premium product tool base with only a restrained creative accent. The intended reading order is `tool rail -> slot board -> edit stage -> validation stage -> inspector`.

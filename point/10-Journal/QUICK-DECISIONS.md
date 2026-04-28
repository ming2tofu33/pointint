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
- Studio shell hierarchy is now shared across CUR and ANI. Empty slots keep a single central source-entry hub, and populated slots share the same stage header, validation footer, and inspector contract.

## 2026-04-15

- Background-removal model fine-tuning is tracked as an option spike, not current sprint scope.
- The current backend path uses a remote HF inference wrapper. If quality work moves here, the likely shape is "train separately, deploy separately, then swap the serving endpoint" rather than tweaking the current app flow in place.

## 2026-04-24

- A Windows `.exe` installer is worth tracking as a later option because the current ZIP + INF flow may be too manual for non-technical users.
- The installer path should start as a feasibility spike, with code signing, SmartScreen reputation, restore/uninstall behavior, and immediate cursor application treated as core questions.

## 2026-04-27

- `.exe` installer work and background-removal fine-tuning stay deferred options for now.
- The next Phase 1.5 slice is `ANI Source Maker / GIF Maker`: multiple images become an ordered frame sequence before entering the existing ANI cursor editor.
- Pointint should borrow the clear source-making flow from tools like Ezgif, but should not become a generic GIF editing toolbox.
- `Video to ANI` should reuse the same source-maker foundation later, after GIF Maker is stable.
- `ANI Source Maker / GIF Maker` is now closed as the first source-maker slice: multiple PNG/JPG/WebP images enter the existing ANI editor as an ordered image sequence and export through the Windows role package flow.
- `Video to ANI` remains the next natural extension, but it should reuse the same `source media -> ordered frames -> ANI editor` architecture rather than adding a separate animation editor.
- Add `Phase 2.5: Theme Asset Foundation` after Auth/project storage/17-role/install trust. It covers folder icons, wallpaper export, and cursor/icon/wallpaper theme-pack drafts. It explicitly stays out of current Phase 1.5 ANI work, while sound schemes, live wallpapers, desktop pets, marketplace sales, and automatic theme installers remain later Moniterior scope.
- Pricing cleanup: 17-role creation and rule-based 17-role auto transform are Member-free core value, not Tint sinks. Basic ZIP/install guide/restore flow stays free as a trust layer. Tint gates AI correction, AI generation, and premium output only.
- User-facing pricing should lead with outcome names (`커서용 자동 보정 1회`, `AI 커서 생성 1회`, `HiDPI 내보내기`) and show Tint as secondary. AI generation includes one cursor-ready correction pass, while repeated generation uses purchased Tint after a limited trial.
- Marketplace is downgraded to a Phase 5 Creator Beta experiment. Early revenue focus is AI generation, uploaded-image correction, HiDPI export, and official theme packs.
- Signup is Google OAuth only. Email/password and GitHub signup are intentionally excluded. Signup prompts should appear only after value is created, especially save, 17-role creation, 17-role auto transform, and resume-edit actions.
- Auth UX Contract added for Phase 2: signup prompts inherit the user's attempted action, Guest drafts must be preserved before Google OAuth, and successful auth must resume the pending save/17-role/resume-edit action.
- Page CRO follow-up lives in [[06-Implementation/plans/2026-04-27-page-cro-follow-up]]. Main risks: brand-first hero copy, no direct Studio workflow path from landing, weak post-download save/17-role CTA, stale ANI FAQ copy, and missing mid-funnel analytics events.
- Content Growth Wave 0-3 lives in [[06-Implementation/plans/2026-04-27-content-growth-foundation]]. The first search-led surfaces are `/tools/image-to-cursor`, `/tools/gif-to-ani-cursor`, and four trust guides under `/guides/*`; each should route users back into Studio instead of becoming separate editors.
- Content discovery is now a top-level UI path: header/mobile nav expose `Tools` and `Guides`, with `/tools` and `/guides` as hub pages for the search-led tool and trust-guide surfaces.

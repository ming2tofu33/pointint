---
title: Page CRO Follow-up
tags:
  - pointint
  - implementation
  - cro
  - landing
  - studio
aliases:
  - Landing Studio CRO
  - Page CRO Follow-up
---

# Page CRO Follow-up

> **Status:** Follow-up reference
> **Last Updated:** 2026-04-27
> **Skill:** page-cro

## Purpose

Capture conversion issues found across `Landing -> Studio -> Download -> Save/17-role signup` so later implementation can improve the product funnel without rediscovering the same problems.

This is not a current Phase 1.5 task. Use it when planning landing polish, Phase 2 Auth UX, or analytics expansion.

## Current CRO Read

**Score:** 6.5 / 10

Pointint has strong technical trust: real cursor output, install/restore guidance, sample bundles, and a focused Studio. The weaker parts are first-screen clarity, direct path to the most common Studio action, post-download next action, and funnel measurement.

## Quick Wins

| ID | Area | Issue | Recommended change | Priority |
|---|---|---|---|---|
| CRO-LANDING-01 | Hero | `Your Point, Your Tint.` is brand-first and does not explain the product fast enough | Test a literal headline: `이미지를 Windows 커서로, 바로 적용까지` / `Turn an image into a Windows cursor you can use right away` | P0 |
| CRO-LANDING-02 | CTA | `이미지로 시작` is decent but not as value-specific as it could be | Test `무료로 커서 만들기` / `이미지 업로드하고 커서 만들기` | P0 |
| CRO-LANDING-03 | Hero upload promise | Landing copy mentions image drop, but the current hero CTA routes to Studio instead of accepting a drop | Either add real hero drag/drop or remove drop-specific copy from landing | P1 |
| CRO-FAQ-01 | Trust | FAQ still says animated cursor support is coming soon, while ANI/GIF Maker now exists | Update FAQ to mention current ANI/GIF support and any remaining limits | P0 |

## High-Impact Follow-ups

| ID | Area | Issue | Recommended change | Phase |
|---|---|---|---|---|
| CRO-STUDIO-01 | Studio entry | Cold visitors from landing likely want `image -> cursor`, but `/studio` first shows multiple workflow choices | Add a direct route such as `/studio?workflow=cur-static-image` and send primary landing CTA there | Landing / Studio polish |
| CRO-STUDIO-02 | Save CTA | `Save` is visible but disabled with `로그인 필요`, which can feel broken before Phase 2 | Before Auth ships, hide it or mark as `곧 제공`; after Phase 2, connect it to [[03-Features/Auth-UX-Contract]] | Phase 2 |
| CRO-DOWNLOAD-01 | Post-download | Guide modal currently offers `Explore` and close, but not the next high-intent action | After Phase 2, add `Google로 계속하고 저장하기` and `Google로 계속하고 17종 만들기` after successful download | Phase 2 |
| CRO-COPY-01 | Download labels | `전체 다운로드` can sound like 17-role export, while Guest currently receives a smaller/basic set | Split labels: Guest `기본 세트 다운로드`, Member `17종 세트 다운로드` | Phase 2 |
| CRO-EXPLORE-01 | Explore | Explore is useful but can distract ready-to-make users if it competes with Studio CTAs | Keep Explore as proof/browse; make Studio the dominant CTA on make-intent surfaces | Ongoing |

## Measurement Gaps

`workflow_selected` exists in `frontend/src/lib/analytics.ts`, but the current audit did not find a matching call site. Add tracking before trying to tune the funnel.

Recommended events:

| Event | When | Key params |
|---|---|---|
| `landing_cta_clicked` | Hero/final CTA clicked | `surface`, `cta`, `target` |
| `workflow_selected` | Studio workflow card clicked | `workflow_id`, `family`, `availability` |
| `upload_started` | User chooses/drops source file | `workflow_id`, `file_type`, `source` |
| `background_decision_made` | Remove/keep background decision | `decision`, `slot`, `workflow_id` |
| `download_completed` | Already exists; keep extending | `export_scope`, `workflow`, `configured_roles` |
| `post_download_cta_clicked` | Guide modal CTA clicked | `cta`, `variant` |
| `auth_prompt_view` | Phase 2 auth prompt appears | `trigger`, `has_draft` |
| `auth_action_resume` | Phase 2 pending action resumes | `trigger`, `result` |

## Copy Alternatives

### Hero H1

- `이미지를 Windows 커서로, 바로 적용까지`
- `내 이미지를 Windows 커서로 바꾸는 가장 쉬운 방법`
- `Upload an image. Get a Windows cursor.`

### Hero Subcopy

- `PNG, JPG, WebP를 업로드하고 핫스팟을 맞춘 뒤 Windows용 커서 파일로 다운로드하세요.`
- `좋아하는 이미지를 업로드하고, 미리보기로 확인한 뒤 Windows에 적용할 수 있는 커서로 내보내세요.`

### Primary CTA

- `무료로 커서 만들기`
- `이미지 업로드하고 커서 만들기`
- `Start making a cursor`

### Post-download CTA

- `Google로 계속하고 저장하기`
- `Google로 계속하고 17종 만들기`
- `나중에`

## Phase Mapping

| Phase | Apply these follow-ups |
|---|---|
| Current / Phase 1.5 | FAQ update, analytics gaps, landing CTA copy test, optional direct Studio workflow param |
| Phase 2 | Save/17-role signup prompts, OAuth return flow, post-download save/17-role CTAs |
| Phase 3 | Tint/AI paid utility copy and post-correction upgrade prompts |

## Guardrails

- Do not add login before upload or first basic download.
- Do not make Explore compete with the primary make path.
- Do not use generic `가입하기` copy when the user tried a specific action.
- Do not gate basic install/restore guidance.
- Do not call the Guest package `17종` until Member 17-role flow exists.

## Related

- [[03-Features/Auth-UX-Contract]]
- [[03-Features/Download-Guide]]
- [[2026-04-12-explore-surface-and-studio-boundary-design]]
- [[2026-04-12-landing-showcase-install-confidence-design]]
- [[2026-04-12-analytics-consent-instrumentation-design]]
- [[08-Business/Tier-Pricing]]

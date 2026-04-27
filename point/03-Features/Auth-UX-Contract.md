---
title: Auth UX Contract
tags:
  - pointint
  - features
  - auth
  - signup
  - cro
aliases:
  - Signup Flow
  - Google OAuth Flow
  - 가입 전환 계약
---

# Auth UX Contract

> **Status:** Phase 2 contract
> **Last Updated:** 2026-04-27

## Purpose

Auth is an expansion reward, not an entry gate. Users should make, preview, and download a useful cursor before Pointint asks them to sign in.

Pointint uses **Google OAuth only**. Email/password, email link, GitHub, and extra profile questions are intentionally excluded.

## Core Rules

- Do not ask for sign-in before upload.
- Do not ask for sign-in before basic editing, simulation, health check, or the first 3-role download.
- Ask for sign-in only when the user requests a Member-only expansion.
- Preserve the current work before leaving for Google OAuth.
- After sign-in, resume the exact action the user attempted.
- If sign-in is cancelled or fails, return to the editor with the work intact.

## Signup Triggers

| Trigger | Prompt title | Body | Primary button | After OAuth |
|---|---|---|---|---|
| Save project | 이 프로젝트를 저장할까요? | Google로 계속하면 현재 작업을 저장하고 나중에 다시 수정할 수 있습니다. | Google로 계속하고 저장하기 | Return to editor, create project, show saved state |
| Make 17-role set | 17종 전체 세트를 만들까요? | Google로 계속하면 현재 커서에서 Windows 역할별 세트를 만들 수 있습니다. | Google로 계속하고 17종 만들기 | Return to editor, open 17-role generation flow |
| Auto-fill 17 roles | 17종을 자동으로 채울까요? | Google로 계속하면 현재 커서를 기준으로 역할별 커서를 자동 변형합니다. | Google로 계속하고 자동 변형하기 | Return to editor, run rule-based auto transform |
| Resume editing | 작업을 다시 열까요? | Google로 계속하면 저장된 프로젝트를 다시 열고 이어서 수정할 수 있습니다. | Google로 계속하고 다시 수정하기 | Return to requested project or project list |
| Claim trial AI generation | AI 생성 체험을 받을까요? | Google로 계속하면 무료 체험 1회를 계정에 연결합니다. | Google로 계속하고 체험 받기 | Return to generation flow with trial credit available |

## Non-Triggers

These actions must stay Guest-accessible:

- Upload image or GIF
- Edit framing, scale, and hotspot
- Run preview or simulation
- View health check
- Download basic 3-role package
- View install and restore guide

## Prompt Structure

Use a modal or bottom sheet over the current workspace. Do not route users to a separate marketing-style sign-up page before OAuth.

Required elements:

- One action-specific title
- One sentence explaining the immediate benefit
- Primary button with Google icon and action-specific text
- Secondary button: `나중에`
- Small trust line: `가입 후 현재 작업으로 바로 돌아옵니다.`
- Legal line near the button: `계속하면 이용약관과 개인정보 처리방침에 동의합니다.`

Avoid generic CTAs such as `가입하기`, `로그인`, or `회원가입하고 계속하기` when the user came from a specific action. The button should inherit the attempted action.

## State Preservation

Before redirecting to Google OAuth, save a Guest draft locally.

Minimum draft fields:

- `source_blob` or temporary source reference
- current output family: `cur` or `ani`
- slot state: normal/text/link/button and later 17-role data
- framing, scale, crop, background-removal state
- hotspot coordinates
- selected simulation state
- pending action
- return path
- created timestamp

Implementation preference:

- Store binary source data in IndexedDB.
- Store lightweight pending auth metadata in `sessionStorage`.
- Set a short draft expiry, initially 24 hours.
- Clear the draft after a successful save or explicit discard.

If draft preservation fails, do not start OAuth silently. Show a blocking message that asks the user to keep the tab open and try again.

## Return Contract

After OAuth callback:

1. Read the pending auth action.
2. Restore the Guest draft.
3. Create or update the Member profile.
4. Resume the attempted action.
5. Show a completion toast tied to that action.

Return behavior by action:

| Pending action | Required result |
|---|---|
| `save_project` | Project is saved automatically; user stays in the editor |
| `make_17_role_set` | 17-role generation flow opens immediately |
| `auto_fill_17_roles` | Rule-based auto transform starts immediately |
| `resume_editing` | Requested project opens, or project list opens if no project ID exists |
| `claim_trial_ai_generation` | Trial credit is attached and the AI generation flow remains open |

## Failure And Cancel

- OAuth cancel: return to the editor with the draft restored and no destructive changes.
- OAuth error: show inline error and keep the original action available.
- Draft restore failure: show recovery options, including returning to Studio start and keeping any downloadable output if available.
- Existing Google account: treat as sign-in and resume the pending action, not as a separate branch.

## Analytics Events

| Event | When | Key params |
|---|---|---|
| `auth_prompt_view` | Prompt appears | `trigger`, `route`, `has_draft` |
| `auth_prompt_continue` | Google CTA clicked | `trigger` |
| `auth_prompt_cancel` | User chooses later | `trigger` |
| `auth_oauth_return` | OAuth callback returns | `trigger`, `result` |
| `auth_draft_restore` | Draft restore attempted | `trigger`, `result` |
| `auth_action_resume` | Pending action resumes | `trigger`, `result` |
| `guest_to_member_conversion` | First successful Member creation | `trigger` |

Phase 2 North Star remains Guest to Member conversion, but it should be interpreted with post-auth action completion. A sign-up that does not resume the intended action is not a successful conversion.

## Related

- [[Download-Guide]]
- [[01-Core/Roadmap]]
- [[02-Architecture/DB-Schema]]
- [[06-Implementation/plans/2026-03-27-implementation-phase-flow]]
- [[08-Business/Tier-Pricing]]

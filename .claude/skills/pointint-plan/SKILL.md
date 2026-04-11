---
name: pointint-plan
description: Create or update Pointint implementation plans. Use when the user asks for a plan, milestone breakdown, phase or wave design, task sequencing, or a new implementation note before coding.
argument-hint: "[topic]"
---

# Pointint Implementation Plans

Use this skill when planning implementation work in the Pointint repository.

## Source of truth

- Planning rules: `CLAUDE.md`
- Execution contract: `point/06-Implementation/Implementation-Plan.md`
- Active sprint: `point/06-Implementation/ACTIVE_SPRINT.md`
- Phase overview: `point/06-Implementation/Phase-Flow.md`
- Detailed task flow: `point/06-Implementation/plans/2026-03-27-implementation-phase-flow.md`
- Plan directory: `point/06-Implementation/plans/`
- Plan index: `point/06-Implementation/plans/Plans-Index.md`
- Decisions: `point/10-Journal/QUICK-DECISIONS.md`

## Workflow

1. Read `CLAUDE.md`.
2. Read `point/06-Implementation/Implementation-Plan.md`.
3. Read `point/06-Implementation/ACTIVE_SPRINT.md`.
4. Read only the directly related plan notes from `point/06-Implementation/plans/`.
5. Decide whether the request needs a new plan note or a minimal update to an existing one.

## When to create a new plan

Create a new note when the request introduces:

- a new feature or milestone
- a new Phase or Wave
- a meaningful cross-file implementation sequence
- work that should be tracked separately in the sprint

Skip creating a new plan for:

- typo fixes
- one-line changes
- simple point sync work

## Plan format

Save new plans to:

`point/06-Implementation/plans/YYYY-MM-DD-<topic>.md`

Use this structure:

```markdown
---
title: [계획 제목]
tags:
  - pointint
  - plan
  - [관련 태그]
---

# [계획 제목]

> **Status:** Draft / Active / Done
> **Created:** YYYY-MM-DD
> **Phase:** [Phase N]
> **Wave:** [Wave N]

## 목표

## 배경

## 범위

## 태스크

| ID | 제목 | 의존성 | 예상 | 상태 |
|---|---|---|---|---|
| [ID] | [제목] | [선행 태스크] | [시간] | todo |

## 기술 결정

## 리스크

## 완료 기준
```

## Required follow-up

After creating or materially changing a plan:

1. Update `point/06-Implementation/plans/Plans-Index.md` if needed.
2. Reflect the new priority or task in `point/06-Implementation/ACTIVE_SPRINT.md`.
3. If the plan changes gate or phase interpretation, sync:
   - `point/06-Implementation/Phase-Flow.md`
   - `point/06-Implementation/plans/2026-03-27-implementation-phase-flow.md`
4. If the plan contains a meaningful strategy or operating choice, append that choice to `point/10-Journal/QUICK-DECISIONS.md`.
5. Keep `docs/plans/` as an external-share copy only when the user explicitly wants it.

## Constraints

- Internal planning source of truth is always `point/`.
- Use Phase, Wave, Task, and Gate terminology consistently.
- Prefer minimal edits to existing notes when the scope has not really changed.
- Keep sprint updates aligned with the plan, especially `Current Doing`, `Next Session`, and `남은 작업`.

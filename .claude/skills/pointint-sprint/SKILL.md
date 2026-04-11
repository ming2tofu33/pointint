---
name: pointint-sprint
description: Sync the active Pointint sprint for Claude Code. Use when the user wants current sprint status, the next unblocked task, a sprint close-out, or a document follow-up sync after shipped work.
argument-hint: "[start|end]"
disable-model-invocation: true
---

# Pointint Sprint Sync

Use this skill to keep the current sprint readable and evidence-based for both humans and Claude Code.

## Source of truth

- Sprint snapshot: `point/06-Implementation/ACTIVE_SPRINT.md`
- Execution contract: `point/06-Implementation/Implementation-Plan.md`
- Phase overview: `point/06-Implementation/Phase-Flow.md`
- Detailed task flow: `point/06-Implementation/plans/2026-03-27-implementation-phase-flow.md`
- Decisions: `point/10-Journal/QUICK-DECISIONS.md`
- Session rules: `CLAUDE.md`

## Arguments

- `start`: read the current sprint state and recommend the next unblocked task
- `end`: sync completed work and document follow-up back into the sprint
- no argument: infer from the conversation; if still ambiguous, ask one short question

## Start mode

1. Read `CLAUDE.md`.
2. Read `point/06-Implementation/ACTIVE_SPRINT.md`.
3. Report these sections first:
   - `Current Goal`
   - `Current Doing`
   - `Next Session`
   - `Blockers`
4. Recommend the next unblocked task with a short reason.
5. Read additional plan or phase notes only if they are directly needed for the recommendation.

## End mode

1. Identify what actually changed in the session.
2. Update only the relevant parts of `point/06-Implementation/ACTIVE_SPRINT.md`:
   - `마지막 업데이트`
   - `Current Goal` if priorities changed
   - `Current Doing`
   - `Next Session`
   - `Blockers`
   - `Recently Done`
   - `Decision Follow-up`
   - `Document Follow-up`
   - task tables or gate status when there is concrete evidence
3. Keep `Current Doing` active-only. Move done work out of it and mark long-unverified active work as `stale` or `ghost` when warranted.
4. If the session changed gate or phase interpretation, sync:
   - `point/06-Implementation/Phase-Flow.md`
   - `point/06-Implementation/plans/2026-03-27-implementation-phase-flow.md`
5. If the session produced a meaningful strategy or operating decision, append it to `point/10-Journal/QUICK-DECISIONS.md`.
6. Do not mark a task as done unless the session produced the change or there is explicit evidence in code/history that justifies the sync.
7. After syncing, summarize the update and ask whether to commit.

## Output format

Use a short sprint summary:

```markdown
## Sprint Status

Current Goal:
- ...

Current Doing:
- ...

Next Session:
- ...

Recommended Next:
- ...
```

## Constraints

- Treat `point/06-Implementation/ACTIVE_SPRINT.md` as the live sprint snapshot.
- Prefer updating the existing sprint note over creating parallel status files.
- Read and edit only the notes directly related to the current task.
- If the sprint note lacks `Current Goal`, `Current Doing`, `Next Session`, `Blockers`, `Recently Done`, `Decision Follow-up`, or `Document Follow-up`, normalize it before continuing.

---
name: pointint-decisions
description: Log major Pointint decisions to QUICK-DECISIONS. Use when the user confirms a direction, picks between options, changes strategy, or finalizes a workflow rule.
argument-hint: "[decision summary]"
disable-model-invocation: true
---

# Pointint Decision Logger

Use this skill to keep major product, strategy, and operations decisions append-only in `point/10-Journal/QUICK-DECISIONS.md`.

## Source of truth

- Decisions: `point/10-Journal/QUICK-DECISIONS.md`
- Sprint: `point/06-Implementation/ACTIVE_SPRINT.md`
- Execution contract: `point/06-Implementation/Implementation-Plan.md`

## Trigger examples

- the user picks one option over another
- the user confirms a new scope, sequence, pricing, or workflow rule
- a previous decision is explicitly replaced
- a sprint/phase handling rule changes

## Format

```markdown
## YYYY-MM-DD

- **[결정 요약]** — [근거 1~2줄]. (context: [짧은 상황 설명])
```

## Procedure

1. Detect whether the decision is important enough to affect scope, sequence, structure, business rules, or operating workflow.
2. Append the decision to `point/10-Journal/QUICK-DECISIONS.md`. Never delete or rewrite old decisions.
3. If the decision changes sprint or plan handling, make sure the affected docs are also synced in the same session.

## Constraints

- Do not log trivial styling or wording tweaks.
- If a decision replaces an older one, record it as a new entry and reference the shift.
- Keep entries short and legible enough to scan later.

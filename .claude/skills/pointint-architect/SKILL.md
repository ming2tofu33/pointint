---
name: pointint-architect
description: Maintain Pointint's point/ note structure. Use when the user wants to audit the vault, add or move notes, validate links, or check documentation health.
argument-hint: "[audit|add-note|move|triage|validate-links]"
disable-model-invocation: true
---

# Pointint Point Architect

Maintain the `point/` Obsidian structure without breaking internal links or source-of-truth rules.

## Source of truth

- Point rules: `point/POINT_RULES.md`
- Index: `point/00-INDEX.md`
- Sprint: `point/06-Implementation/ACTIVE_SPRINT.md`
- Plans index: `point/06-Implementation/plans/Plans-Index.md`

## Safety rules

1. Never delete notes. Move obsolete material to `point/90-Archive/`.
2. Prefer append-only updates or new notes over destructive rewrites.
3. For 3+ file moves, show the migration set before making bulk edits.
4. After moves or renames, validate relevant `[[wikilinks]]`.
5. When a new implementation note is added, make sure `Plans-Index.md` or `ACTIVE_SPRINT.md` is updated if the note changes live workflow.

## Modes

- `audit`: scan point structure, naming drift, orphan notes, and broken links
- `add-note`: place a new note in the correct layer with basic metadata
- `move`: relocate or rename notes with link follow-up
- `triage`: review inbox-like notes and suggest promote/merge/archive actions
- `validate-links`: inspect wikilink integrity without auto-fixing everything

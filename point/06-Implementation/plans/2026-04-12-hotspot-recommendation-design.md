# Hotspot Recommendation Design

> Date: 2026-04-12
> Scope: `P1-HOTSPOT-01`

## Purpose

Reduce hesitation in the editor by recommending a usable hotspot automatically, without removing manual control.

## Decision

- Recommendation is rule-based, not AI-based.
- Recommendation runs on the client against the current square-framed render, so it follows `preview = export`.
- Recommendation is auto-applied once when the editor becomes ready.
- If the user manually changes the hotspot, later automatic recomputations must not overwrite it.
- The panel exposes:
  - current hotspot coordinates
  - hotspot state: `recommended` or `manual`
  - `Recommend hotspot` / `Recommend again`
  - existing `Reset hotspot`

## Approach

### Option A: Keep `(0,0)` as the only default

- Lowest complexity
- Does not solve `P1-HOTSPOT-01`

### Option B: Recommend from current square-framed render

- Matches the actual exported geometry
- Reuses the existing client-side framing pipeline
- Works without backend changes
- Recommended

### Option C: Recommend on the backend

- Centralized logic
- Adds request latency and complicates the editor loop
- Too heavy for Phase 1 follow-up

## Recommendation Rule

The algorithm scans the rendered alpha mask and searches for a top-left-leading boundary pixel that has visible mass behind it.

Heuristics:

- ignore fully transparent pixels
- prefer boundary pixels
- prefer smaller `x + y`
- ignore isolated anti-aliased noise by requiring local opaque support
- prefer candidates whose local centroid sits to the right and below the candidate, indicating a forward tip

If no confident candidate exists:

- fall back to the current hotspot
- do not invent a different coordinate

## State Rules

- editor entry:
  - compute recommendation once
  - apply it automatically
  - mark hotspot mode as `auto`
- manual drag/click:
  - update hotspot
  - mark hotspot mode as `manual`
- framing changes before manual edit:
  - recommendation may refresh
- framing changes after manual edit:
  - recommendation may recompute internally, but must not overwrite the user choice
- panel action:
  - `Recommend hotspot` or `Recommend again` explicitly reapplies the latest recommendation and marks mode as `auto`

## Files

- `frontend/src/lib/cursorFrame.ts`
- `frontend/src/lib/useStudio.ts`
- `frontend/src/app/studio/page.tsx`
- `frontend/src/i18n/messages/en.json`
- `frontend/src/i18n/messages/ko.json`
- `frontend/tests/lib/cursorFrame.test.ts`
- `frontend/tests/studio/use-studio-workflow.test.tsx`

## Testing

- pure algorithm test:
  - pointed shape returns the leading top-left tip
  - isolated noise is ignored
  - empty mask returns `null`
- hook behavior test:
  - recommendation auto-applies once in editing
  - manual hotspot blocks later automatic overwrite
  - explicit re-recommend applies the suggested hotspot again

## Out of Scope

- AI hotspot inference
- per-cursor-type hotspot templates
- ANI hotspot recommendation
- backend recommendation API

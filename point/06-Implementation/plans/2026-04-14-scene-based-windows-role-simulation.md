# Scene-Based Windows Role Simulation Plan

> **Status:** implementation plan
> **Date:** 2026-04-14
> **Depends on:** `2026-04-14-scene-based-windows-role-simulation-design.md`

## Goal

Replace the current 4-zone simulation with a realistic scene-based simulation that covers the Windows core role set through believable interaction contexts.

## Phase 1: Simulation model refactor

1. Replace the current 4-zone mapping model with explicit scene and station ids.
2. Introduce a station-to-role mapping table for all supported scene stations.
3. Keep role source building on top of the existing slot project model.
4. Preserve fallback to `normalSelect` for missing role slots.

### Deliverables

- scene ids and station ids
- station-to-role resolution helper
- tests for role resolution and fallback

## Phase 2: Scene shell and tabs

1. Add scene tabs to the simulation footer header.
2. Store active scene in Studio simulation state.
3. Render only one active scene at a time.
4. Keep existing background mode switch and collapse control.

### Deliverables

- header tab UI
- active scene state wiring
- tests for tab switching

## Phase 3: Browser scene

1. Migrate the current browser-like simulation into a dedicated `browser` scene.
2. Keep realistic text, input, and link stations.
3. Remove the old generic `button -> busy` shortcut behavior.
4. Ensure `Normal Select`, `Text Select`, and `Link Select` behave correctly.

### Deliverables

- browser scene component
- station mapping for browser scene
- tests for normal/text/link routing

## Phase 4: System work scene

1. Add a scene for task progress and blocked actions.
2. Create believable surfaces for:
   - `Busy`
   - `Working in Background`
   - `Unavailable`
3. Keep fallback behavior if those roles are not configured.

### Deliverables

- system work scene component
- tests for busy/background/unavailable routing

## Phase 5: Window controls scene

1. Add a floating window or utility panel surface.
2. Map title bar, edges, and corners to:
   - `Move`
   - `Horizontal Resize`
   - `Vertical Resize`
   - `Diagonal Resize 1`
   - `Diagonal Resize 2`
3. Verify directional mapping is stable.

### Deliverables

- window controls scene component
- tests for move/resize role mapping

## Phase 6: Optional demo mode

1. Add `데모 재생` control.
2. Build a fixed path through stations within the active scene.
3. Stop demo on pointer interaction.

### Deliverables

- demo playback state
- deterministic demo path tests

## Acceptance Criteria

- users can manually exercise all 11 Windows core roles through scene stations
- simulation no longer relies on generic `button` semantics
- scene layout feels believable rather than abstract
- missing roles degrade gracefully via normal cursor fallback
- the lower simulation pane remains stable in layout and scroll behavior

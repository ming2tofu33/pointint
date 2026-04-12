# Unified Cursor Simulation Design

> **Status:** approved design
> **Date:** 2026-04-13
> **Scope:** replace the current CSS-cursor simulation with a shared simulation engine for both `.cur` and `.ani`

## Purpose

Pointint's current simulation is good enough for hotspot and rough readability checks, but it is not close enough to a real desktop or browser surface. It relies on CSS `cursor: url(...)`, which prevents us from giving `.cur` and `.ani` the same preview contract and does not let us control interaction states precisely.

The goal of this design is to replace that approach with a shared simulation engine that:

- keeps the product language as `시뮬레이션`
- feels closer to a real system/browser surface
- uses the same preview contract for `CUR` and `ANI`
- preserves `preview = export` as a product rule

## Current Problem

### What exists today

- `CUR` uses a rendered PNG preview plus hotspot remap, then feeds that image into a CSS-cursor-based simulation surface.
- `ANI` has a dedicated editor shell, but no equivalent simulation engine and no parity with the static cursor simulation surface.

### Why that is insufficient

- CSS cursor preview is only a browser approximation.
- The simulation contract differs between `CUR` and `ANI`.
- We cannot represent animated playback accurately with the current structure.
- We cannot control interaction states, cursor layering, or timing tightly enough for a trustworthy preview.

## Design Principles

1. `시뮬레이션` remains the user-facing name.
2. The implementation changes from CSS cursor preview to a fake-cursor rendering model.
3. `CUR` and `ANI` use the same simulation surface.
4. `preview = export` remains a hard rule.
5. The engine should simulate a desktop/browser-like surface, not claim to be the OS itself.

## Options Considered

### Option 1: Keep CUR simulation, add a separate ANI preview

- Fastest short-term path
- Keeps current `.cur` behavior untouched
- Creates two preview systems with different contracts
- Guarantees rework later

Rejected because it would split the preview model immediately.

### Option 2: Shared fake-cursor simulation engine for CUR and ANI

- One simulation model for both cursor types
- Lets us control hotspot, timing, and interaction zones directly
- Supports a closer "real system/browser" feel
- Requires a real preview engine redesign rather than a small patch

Selected because it matches the product goal and avoids maintaining two simulation systems.

### Option 3: Full OS-like desktop/browser mockup system from the start

- Most realistic long-term direction
- Also the largest immediate scope
- Risks turning a preview engine task into a visual systems task

Deferred. We should build the common engine first, then enrich scenes later.

## Selected Approach

Build a shared `시뮬레이션` engine based on three layers:

1. a common interactive surface
2. a mock scene that exposes interaction zones
3. a fake cursor layer rendered directly on top of the scene

This replaces browser-native cursor rendering with direct visual rendering. The browser cursor is hidden inside the simulation area. Mouse position is tracked. The preview cursor is placed with hotspot compensation. Scene zones provide context such as text, link, button, and neutral regions.

## Architecture

### 1. CursorSimulationSurface

Responsibilities:

- own pointer position state
- own background mode state
- hide the native cursor in the simulation region
- receive interaction state from scene zones
- render the preview cursor layer at the correct offset

This becomes the shared container used by both `CUR` and `ANI`.

### 2. CursorScene

Responsibilities:

- render a browser/desktop-like content area
- expose zones for:
  - neutral
  - text
  - link
  - button
- report the currently hovered zone back to the simulation surface

This is not meant to reproduce Windows itself. It provides a believable interaction context for the cursor.

### 3. CursorPreviewLayer

Responsibilities:

- render the currently active cursor frame at the tracked pointer position
- subtract hotspot coordinates so the visual cursor aligns like a real pointer
- ignore pointer events

The preview layer is shared by `CUR` and `ANI`.

### 4. Cursor Source Contract

The simulation engine should not care whether the source is static or animated. It should consume a single interface:

- `getFrameAtTime(now)` -> returns the frame to display now

This leads to two source types:

- `StaticCursorSource`
  - single rendered frame
  - hotspot
  - output size

- `AnimatedCursorSource`
  - rendered frame sequence
  - per-frame duration
  - hotspot
  - output size

`CUR` returns the same frame every time. `ANI` returns the frame based on elapsed time.

## Preview Contract

### CUR

- Use the already rendered square preview result
- Feed that frame into the shared simulation engine
- Keep hotspot mapping identical to export behavior

### ANI

- Do not use the original GIF directly for simulation
- Build simulation frames by applying current editor settings to each GIF frame
- Feed the rendered frame sequence into the shared simulation engine

This is required to preserve `preview = export`.

If ANI playback simply uses the uploaded GIF, fit mode, scale, and offset would diverge from export behavior. That is explicitly out of contract.

## UI Contract

### User-facing naming

Keep the user-facing label as `시뮬레이션`.

### Visible states

The simulation surface should show:

- neutral surface
- text area
- link area
- button area

This gives the user context without requiring multiple cursor files. The cursor image stays the same. The scene context changes around it.

### Actual-size preview

Keep actual-size preview as a separate supporting panel, but drive it through the same source contract:

- `CUR`: static rendered frame
- `ANI`: current animation frame sequence playback or actual-size animated box

## Rollout Strategy

### Phase A: Shared simulation shell

- Build the shared simulation engine first
- Keep the scene minimal
- Prove the fake-cursor model works

### Phase B: Migrate CUR

- Replace the CSS-cursor simulation with the new engine
- Validate hotspot parity and visual trust

### Phase C: Add ANI source rendering

- Render each GIF frame through the current editor transforms
- Feed those frames into the same simulation engine

### Phase D: Scene polish

- Improve the mock browser/system scene details only after the common engine is stable

## Error Handling

- If ANI frame rendering fails, show a static fallback frame rather than removing simulation entirely.
- If the source has no valid frame, show a simulation placeholder with an explicit warning.
- Simulation failure must never block export.

## Testing Strategy

### Unit

- source contract selection for `CUR` and `ANI`
- frame selection by time for animated sources
- hotspot offset mapping in the preview layer

### Component

- scene hover updates active zone
- fake cursor layer tracks pointer position correctly
- `CUR` and `ANI` both mount the shared simulation surface

### Regression

- `CUR` still respects preview/export parity after migration
- `ANI` simulation reflects fit mode, scale, offset, and hotspot changes

## Non-Goals

- perfect OS-level cursor rendering
- per-role Windows cursor packs in simulation
- frame-by-frame ANI editing in this work item
- desktop mockup marketing visuals

## Outcome

After this work, Pointint should have one shared simulation system for both `CUR` and `ANI`, using direct cursor rendering instead of CSS cursor approximation. That gives us a more trustworthy "real-feeling" preview without fragmenting the editor experience.

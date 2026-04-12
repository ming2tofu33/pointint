# ANI v1 GIF-to-ANI Design

> Date: 2026-04-12
> Scope: `Phase 1.5` opening slice

## Purpose

Open the smallest coherent animated-cursor workflow in Pointint without fragmenting the product surface.

The first public ANI slice should let a user:

- upload an animated GIF
- preview the animation in Pointint
- apply one shared framing and hotspot choice across all frames
- export a Windows `.ani`

## Decision

- `ANI v1` starts with `GIF` input only.
- The internal model is not GIF-specific. It is a reusable `FrameSequenceSource`.
- Editing stays intentionally narrow:
  - one shared framing choice across all frames
  - one shared hotspot across all frames
  - simple timing control (`fps` or frame-duration normalization)
- `video`, `multiple PNGs`, frame reorder, frame-level edits, and animation utilities stay out of scope for this slice.

## Approaches

### Option A: Build GIF-only logic end-to-end

- Fastest to ship
- High risk of rework once `video` and `PNG sequence` are added
- Rejected

### Option B: Build ANI core first, then expose GIF as the first adapter

- Slightly more work up front
- Gives `video` and `PNG sequence` a clean place to plug in later
- Recommended

### Option C: Start from `PNG sequence -> ANI`

- Simplest technically
- Weakest user value because it requires manual frame preparation
- Rejected

## Product Contract

ANI should preserve the same product rules already established in the static cursor flow:

- `preview = export`
- editor coordinates map to the real output
- one visible workflow surface instead of a tool explosion
- editor complexity grows only when a clear need appears

For `ANI v1`, that means:

- the animation preview must reflect the same framing and hotspot rules used during export
- there is no per-frame manual editing yet
- user control is shared and global, not frame-local

## Scope

### Included

- `Animated GIF` workflow becomes selectable
- GIF decode into frame sequence
- shared-frame ANI editor shell
- animated preview playback
- one global hotspot
- one global framing mode (`contain` / `cover`)
- one global transform (`scale`, `offset`)
- frame-count cap and basic timing normalization
- `.ani` export

### Excluded

- `Video` workflow
- `Multiple PNGs` workflow
- frame reorder / delete / duplicate
- reverse / ping-pong / loop authoring tools
- frame-level hotspot
- frame-level pan/zoom
- ANI install/apply packaging changes beyond the current download pattern unless required by the writer

## Architecture

### Core model

Introduce a shared ANI source model:

- `FrameSequenceSource`
  - ordered frames
  - width / height
  - per-frame duration
  - source metadata

This model sits between input adapters and export writers:

- `GIF -> FrameSequenceSource`
- later: `Video -> FrameSequenceSource`
- later: `PNG sequence -> FrameSequenceSource`
- `FrameSequenceSource -> ANI writer`

### Backend direction

The backend should own:

- GIF frame extraction / normalization
- ANI binary writing
- frame-count and size guardrails

This keeps binary correctness and media handling centralized.

### Frontend direction

The frontend should own:

- workflow selection
- upload handling
- shared framing controls
- shared hotspot controls
- playback preview

`ANI v1` should reuse as much of the existing static editor surface as possible, then add only the minimum animation-specific panel state.

## Editing Model

ANI v1 should behave like:

- `CUR editor core`
- plus:
  - autoplay preview
  - timing control
  - frame-count summary

All geometric edits apply to the full sequence:

- framing mode
- scale
- offset
- hotspot

This keeps the first version understandable and reduces the chance of mismatched frame geometry.

## Validation

ANI v1 should fail early on:

- unsupported GIF decode
- too many frames
- oversized input
- empty frame sequence

Warnings should be lightweight at first:

- frame-count capped
- duration normalized
- output may feel fast/slow after normalization

## Testing

Minimum test coverage should include:

- ANI writer produces a valid `.ani` for a small synthetic frame sequence
- GIF adapter decodes frame count and durations correctly
- frame-count cap behaves deterministically
- ANI route returns a downloadable payload
- frontend ANI workflow becomes selectable only for GIF
- preview/edit state applies global hotspot and framing consistently

## Out of Scope Follow-up

These are explicitly deferred to later `Phase 1.5` or later slices:

- `video -> frame sequence`
- `multiple PNGs -> sequence`
- frame-level editing
- timeline utilities
- advanced loop smoothing
- `ANI > AI Generate`

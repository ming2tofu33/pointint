# Slot-Based Cursor Theme Studio Design

> **Status:** approved design
> **Date:** 2026-04-13
> **Scope:** evolve Pointint Studio from a single-cursor editor into a slot-based cursor theme editor for both `CUR` and `ANI`

## Purpose

The current Studio edits one cursor asset at a time. That is enough for a static preview, but it is not enough for a meaningful state-driven simulation. A simulation only becomes credible if different interaction zones can switch to different cursor assets inside the same project.

The goal of this design is to turn Studio into a cursor-theme editor that:

- manages multiple cursor slots in one project
- keeps `CUR` and `ANI` under the same project structure
- lets the simulation switch sources by interaction zone
- preserves the current single-surface editing model by editing one selected slot at a time

## Current Problem

### What exists today

- Studio stores one active cursor asset.
- The simulation scene has zones such as neutral, text, link, and button.
- Those zones currently provide context only; they do not swap to different cursor assets.

### Why that is insufficient

- The simulation does not represent a real cursor set.
- `text`, `link`, and `button` states cannot be authored or verified independently.
- `CUR` and `ANI` are still treated as one-off outputs instead of parts of a cursor theme.

## Design Principles

1. Studio becomes a theme editor, not a single-file editor.
2. `CUR` and `ANI` share one slot model.
3. Editing stays focused: one selected slot at a time.
4. Simulation uses the whole slot set, not just the selected slot.
5. First scope is limited to four core slots:
   - `normal`
   - `text`
   - `link`
   - `button`

## Options Considered

### Option 1: Keep the current single-cursor editor and add more simulation labels

- Smallest code change
- Does not solve the real problem
- Leaves simulation as a cosmetic approximation

Rejected because the simulation would still not validate state-specific cursor behavior.

### Option 2: Slot rail plus one shared editing surface

- Recommended
- Adds a slot-aware project model
- Keeps one editing canvas and one property panel
- Lets simulation map zones to slots directly

Selected because it creates a real theme editor without exploding the UI.

### Option 3: Multi-panel dashboard where all slots are edited at once

- Makes the slot set visible immediately
- Significantly increases visual density
- More expensive to implement and harder to scale once `ANI` is mixed in

Deferred. It adds complexity before the slot model is proven.

## Selected Approach

Build a slot-based Studio with:

- existing tool rail on the far left
- a new slot rail next to it
- one central editing canvas
- one bottom simulation area
- one right-side property panel

Only the selected slot is edited at a time. The simulation always consumes the entire slot set.

## UX Structure

### Layout

- left rail 1: tools (`move`, `hotspot`, `new`)
- left rail 2: slot rail
- center: editing surface for the selected slot
- bottom: shared simulation
- right: properties for the selected slot

### Slot Rail

The slot rail contains:

- `Normal`
- `Text`
- `Link`
- `Button`

Each slot item shows:

- slot name
- thumbnail
- `Static` or `Animated`
- empty or filled state

### Slot Behavior

- clicking a filled slot restores that slot into the editor
- clicking an empty slot opens an empty state in the editor
- v1 does not support slot reordering, custom slots, deletion, or duplication

## Data Model

### Top-Level Project

Introduce a `CursorThemeProject` that owns the core slots:

- `normal`
- `text`
- `link`
- `button`

### Slot Contract

Each slot shares one editing contract:

- `kind: "static" | "animated"`
- `name`
- `fitMode`
- `scale`
- `offsetX`
- `offsetY`
- `hotspotX`
- `hotspotY`
- `hotspotMode`

The asset differs by kind:

- `static`: one image-based source
- `animated`: frame-sequence-based source

This keeps the editor contract common even though the source type differs.

## Simulation Contract

The simulation maps zones to slots:

- neutral -> `normal`
- text -> `text`
- link -> `link`
- button -> `button`

Each slot produces a `CursorSource`:

- `static` slots return a static source
- `animated` slots return an animated source

The simulation engine does not need to know whether a slot is `CUR` or `ANI`; it only needs a `CursorSource`.

## Editing Flow

### First Entry

- default selected slot: `normal`
- if `normal` is empty, the center pane shows an empty-state picker

### Empty Slot

For an empty slot, the editor offers:

- `Static Image`
- `Animated GIF`

After upload, the selected slot becomes editable immediately and the slot rail updates.

### Filled Slot

For a filled slot, the existing editing surface is reused:

- canvas
- framing
- hotspot
- scale
- size
- naming

## Incremental Scope

### Included in v1

- slot-based project model
- four fixed slots
- selected-slot editing
- slot-aware simulation
- slot empty states for `Static Image` and `Animated GIF`

### Deferred

- custom slots
- slot reordering
- full theme export / install package
- additional roles such as `precision`, `help`, `wait`
- multi-slot batch editing

## Rollout Strategy

### Phase A: Slot structure

- replace single-asset state with slot-based project state
- add the slot rail
- keep the editor bound to the selected slot only

### Phase B: Slot-aware simulation

- map scene zones to slot sources
- let `CUR` and `ANI` participate through the same `CursorSource` contract

### Phase C: Slot input UX

- add empty-state pickers for empty slots
- support `Static Image` and `Animated GIF` per slot
- gate download on the minimum valid project shape

## Risks

- `useStudio` currently assumes one active asset, so the state transition is structural rather than cosmetic
- export should not be redesigned in the same slice; otherwise scope will jump too far
- the simulation must tolerate partially filled slot sets during the transition

## Success Criteria

- a user can fill `normal`, `text`, `link`, and `button` independently
- the selected slot is edited in one shared editing surface
- the simulation swaps cursor sources by zone
- both static and animated slots can exist in one project structure

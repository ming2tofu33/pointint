# Studio Two-Pane Simulation Layout Design

> **Status:** approved design
> **Date:** 2026-04-13
> **Scope:** restructure the studio editing workspace so simulation is a first-class pane instead of a shallow footer strip

## Purpose

The current studio layout still treats simulation as a secondary area. Even after increasing footer height, it feels clipped because the workspace is optimized around the square editing canvas, while the simulation surface is where users judge the real result.

The goal of this design is to change the editing workspace into a two-pane layout:

- top pane: precise square cursor editing
- bottom pane: large browser-like cursor simulation

This keeps authoring accuracy while giving simulation enough space to feel like a real environment rather than a small demo strip.

## Problem

### Current issues

- The simulation area is visually subordinate because it sits in a short footer strip.
- The editing canvas has more space than it needs relative to the value it provides.
- The simulation scene still reads like a demo because it contains explanatory filler copy such as:
  - `Neutral space`
  - `Sample body text to exercise a text cursor state.`

### Why this matters

Pointint is not just an image editor. The core product promise is: "this is what your cursor will feel like in use." If the simulation surface does not feel close to a browser or desktop environment, trust drops even if export parity is technically correct.

## Options Considered

### Option 1: Keep the current layout and only increase footer height

- smallest change
- keeps the same authoring hierarchy
- does not change the perception that simulation is a secondary strip

Rejected because it improves capacity but not the workspace model.

### Option 2: Move simulation to the top and editing below

- emphasizes the final experience first
- weakens precision editing because the main manipulation surface is visually demoted

Rejected because hotspot/framing/scale work best when the editing canvas stays in the primary focus band.

### Option 3: Two-pane vertical workspace with editing on top and simulation below

- keeps precise editing in the primary working zone
- gives simulation enough room to feel like a real environment
- preserves the mental model of "edit above, verify below"

Selected because it balances authoring accuracy and preview trust.

## Selected Layout

The main workspace becomes a vertical split:

- **Top pane:** cursor canvas and editing hints
- **Bottom pane:** large simulation pane with collapse/expand support

The side rails remain the same:

- left: tool rail
- right: property panel

This means the center workspace, not the whole page shell, becomes the two-pane region.

## UX Rationale

### Why editing stays on top

- Cursor editing is still the precision task.
- Hotspot and framing adjustments require a stable square reference surface.
- The right property panel already pairs naturally with a top editing pane.

### Why simulation goes below

- Users read results after making an adjustment.
- A lower pane creates a natural "edit -> verify" flow.
- The simulation can grow substantially without destroying the editing interaction model.

## Pane Behavior

### Top editing pane

- retains the square canvas
- should consume roughly 55-60% of the center workspace height
- should no longer be forced into a footer-based relationship with simulation

### Bottom simulation pane

- consumes roughly 40-45% of the center workspace height when expanded
- keeps a compact header row
- supports `collapse` / `expand`
- collapsed state should preserve only the header row

## Simulation Scene Direction

The simulation area should no longer use explanatory filler copy. It should look like a believable browser-like environment:

- window chrome / top bar
- content card or article body
- text block
- link
- button
- input field

The scene still exists to expose different interaction zones, but it should feel like a UI surface, not a labeled demo.

## Interaction Rules

- The browser/native cursor stays hidden inside the simulation stage.
- The fake cursor layer remains the rendering mechanism for both `CUR` and `ANI`.
- `CUR` and `ANI` both use the same simulation pane component.
- Collapse state is local UI state only for now; no persistence is required.

## Component Direction

### Workspace shell

The studio center region should own the vertical split rather than placing simulation in a page footer.

### Simulation shell

A shared shell should provide:

- pane header
- collapse/expand button
- content container

The same shell should be used by both `CUR` and `ANI`.

### Scene content

`CursorScene` should be redesigned from labeled demo blocks into a browser-like composition with hoverable zones.

## Non-Goals

- draggable pane resizing
- persisted pane height
- separate desktop and browser simulation modes in this pass
- changing export logic

## Outcome

After this change, the studio should feel like a proper authoring workspace:

- edit precisely in the top pane
- verify behavior in a large simulation pane below
- use the same simulation model for both `CUR` and `ANI`
- remove demo-style explanatory copy in favor of a believable UI scene

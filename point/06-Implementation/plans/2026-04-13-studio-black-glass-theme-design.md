# Studio Black-Glass Theme Design

> **Status:** approved design
> **Date:** 2026-04-13
> **Scope:** replace the navy-heavy dark presentation with a black-glass header and a near-black studio workspace

## Purpose

The current dark presentation is too blue and atmospheric for a tool-first workspace. The user feedback is clear: the studio should feel less like a branded landing surface and more like a focused editor.

This design separates concerns:

- the global header becomes a black-glass shell
- the studio workspace gets a near-black, low-glass token set
- landing and explore content keep their existing browse-oriented surfaces

## Problem

### Current issues

- The global dark tokens are navy-heavy and make the studio feel dense and muddy.
- The header still uses landing-specific glass tokens, so the studio inherits a browse/brand mood instead of a workbench tone.
- Studio panels, rails, and simulation surfaces all share the same blue-cast dark background, which reduces hierarchy and focus.

### Why this matters

Pointint Studio is now a multi-slot editor with a simulation workspace. That type of surface benefits from:

- neutral contrast
- clearer panel separation
- less decorative color in large background areas

The accent can stay expressive, but the workspace itself should recede.

## Options Considered

### Option 1: Replace all dark tokens globally

- simplest implementation
- changes landing, explore, and studio together
- removes the current browse/product distinction

Rejected because the problem is strongest in the studio, not in every dark surface.

### Option 2: Studio-only near-black theme plus header token split

- recommended
- keeps landing/explore content mood intact
- makes the header less blue everywhere
- gives studio its own workbench tone without a full theme rewrite

Selected because it fixes the focus problem with the smallest coherent scope.

### Option 3: Full black-glass redesign across the entire app

- visually consistent
- much larger design pass
- high risk of reworking browse surfaces that are not currently broken

Rejected because it is too broad for the current task.

## Selected Direction

### Header

The header becomes `black-glass`:

- near-black translucent surface
- lighter blur than the current landing glass
- clear bottom border
- no navy gradient dependency

The header should feel shared across the app, but no longer look like a landing hero extension.

### Studio

The studio becomes `graphite charcoal + low-glass`, with a restrained navy cast that stays mostly neutral at the largest background surfaces:

- near-black background surfaces
- subtle panel fill instead of glossy glass
- stronger border definition
- accent color used only for active, selected, and focus states

The goal is a functional workbench, not a moody showcase.

## Token Direction

### Header tokens

- `--app-header-border`
- `--app-header-backdrop`
- `--app-header-highlight`
- `--app-header-shadow`

These replace direct use of landing header tokens in the shared header component.

### Studio tokens

- `--studio-bg-primary`
- `--studio-bg-secondary`
- `--studio-bg-tertiary`
- `--studio-panel-fill`
- `--studio-panel-fill-strong`
- `--studio-border`
- `--studio-text-primary`
- `--studio-text-secondary`
- `--studio-text-muted`

Recommended values:

- `--studio-bg-primary: #13161A`
- `--studio-bg-secondary: #171B23`
- `--studio-bg-tertiary: #1D2330`
- `--studio-panel-fill: rgba(255, 255, 255, 0.035)`
- `--studio-panel-fill-strong: rgba(255, 255, 255, 0.055)`
- `--studio-border: #2F3644`
- `--studio-text-primary: #E6E8EC`
- `--studio-text-secondary: #9CA7B4`
- `--studio-text-muted: #6D7885`

## Scope of Application

### In scope

- `Header`
- `theme-color` meta
- `StudioPage` workspace subtree
- `StudioBar`
- slot rail, panels, canvas surroundings, simulation pane through inherited tokens

### Out of scope

- landing section redesign
- explore surface redesign
- accent color replacement
- light theme changes

## Implementation Strategy

The studio should not get a completely separate stylesheet. Instead, the root token system remains intact and the studio page creates a scoped token override for its subtree.

This keeps:

- the app token model simple
- landing/explore stable
- the studio override local and reversible

## Testing Strategy

Add tests that lock two contracts:

1. the header uses `--app-header-*` tokens instead of `--landing-*` tokens
2. the studio root exposes a scoped token override container for the near-black workspace

This is enough to prove the architecture without snapshot-heavy style tests.

# Studio UI/UX Structure Refresh Design

> **Status:** approved design
> **Date:** 2026-04-13
> **Scope:** refresh the Pointint Studio shell so it reads as a premium cursor-authoring tool with clearer hierarchy, stronger slot workflows, and more consistent CUR/ANI editing surfaces

## Purpose

The current Studio already has the right capabilities: slot-based editing, a shared simulation model, and dedicated CUR/ANI paths. The weak point is presentation and information architecture. The screen works, but it does not yet feel like a high-confidence production tool.

This design refresh aims to make Studio feel like a premium product tool first, with a restrained creative layer that still matches the Pointint brand.

## Product Tone

The selected direction is:

- **Base:** premium product tool
- **Accent:** light creative-studio atmosphere
- **Avoid:** enterprise heaviness, exaggerated glass effects, decorative animation

This keeps Pointint from becoming sterile while preserving the trust required for precision editing and export.

## Problem

### Current issues

- The left slot rail reads like a narrow list rather than a state-aware cursor set navigator.
- Empty-slot entry is functional, but it does not yet feel like a primary “start here” source-selection hub.
- The center workspace has editing and simulation, but the hierarchy between authoring and validation is still weaker than it should be.
- The right panel contains good controls, but it reads more like a stack of options than a clear inspector.
- CUR and ANI share most of the same editing ideas, but their visual structure still feels too ad hoc.

### Why this matters

Pointint Studio is not just an upload-and-export flow anymore. Once slots exist, the interface is behaving like a theme authoring environment. The UI therefore needs to communicate trust, hierarchy, and focus the same way a real design or motion tool would.

## Selected Direction

The selected approach is a **premium tool shell refresh**:

- keep the current high-level layout model
- strengthen each region’s role
- unify CUR and ANI under the same visual language
- improve clarity before adding more scope

This avoids a costly full redesign while still making the Studio feel intentionally designed.

## Information Architecture

The Studio shell should read as four distinct working layers:

1. **Tool rail**
2. **Slot board**
3. **Edit + validation stage**
4. **Inspector**

Each layer should feel visually separate and functionally legible at a glance.

## Section 1: Studio Shell

### Tool rail

- stays narrow and utilitarian
- emphasizes active tool only
- reduces ornamental detail
- feels like a compact command strip, not a decorative sidebar

### Slot rail

- becomes a cursor-state board rather than a plain list
- cards should show:
  - slot name
  - empty or filled state
  - type (`Static`, `Animated`, or `Unset`)
  - thumbnail or neutral placeholder
- selected slot should be differentiated through:
  - surface elevation
  - stronger contrast
  - a small selected badge
  - a clearer thumbnail boundary

### Center workspace

- becomes the primary edit stage
- contains:
  - contextual stage header
  - editing canvas
  - contextual action bar
  - attached simulation stage below

### Right panel

- becomes a true inspector rather than a miscellaneous options column
- groups state reading and state editing into deliberate cards

## Section 2: Slot Rail And Empty-Slot UX

### Slot card behavior

- empty slot:
  - state line is primary
  - type line shows `Unset`
- filled slot:
  - state line shows `Filled`
  - type line shows `Static` or `Animated`
- hover and focus states should be clear but restrained
- card spacing should allow each slot to read as its own object

### Empty-slot entry

The empty-slot experience becomes a source-selection hub:

- top copy explains which slot is selected
- two equal source cards are shown:
  - `Static Image`
  - `Animated GIF`
- upload starts directly from those cards
- secondary source ideas remain collapsed or low emphasis

### Right-panel behavior when empty

The inspector should not duplicate the central upload UI. It should instead show:

- slot summary
- short guidance
- expected editable fields after upload

## Section 3: Edit Stage And Simulation Flow

### Edit stage

- add a small stage header for context:
  - current slot
  - current source type
  - current cursor name
  - recommendation status when relevant
- turn the helper line below the canvas into a compact control bar
- normalize action styling so toggles and utilities feel related

### Simulation stage

- reads as a validation stage, not a footer strip
- stable height prevents layout jumping
- shared shell remains consistent between CUR and ANI
- collapsed and expanded behavior remains lightweight and local

### Core user flow

The intended reading order is:

`choose slot -> edit in stage -> validate below -> refine in inspector`

## Section 4: Right Inspector Panel

The inspector should be reordered and carded like this:

1. slot summary
2. actual-size preview
3. output size
4. framing
5. naming
6. hotspot
7. scale
8. position

### Card rules

- summary first, controls after
- values and actions should not visually collapse into a single line
- quick actions (`Recommend`, `Reset`, `Center`) should use one consistent secondary-button system
- segmented groups such as `32 / 48 / 64` should read as a single control family

## Section 5: Visual System

### Surface language

- keep the near-black studio workbench base
- separate surfaces with subtle tone changes and thin borders
- use highlight color only for:
  - selected
  - active
  - recommended
  - primary action

### Material treatment

- no heavy glassmorphism
- no wide blur fields
- only slight polish through:
  - subtle glow
  - modest surface contrast
  - soft, controlled accent bleed

### Typography

- maintain compact tool-oriented sizing
- make labels and status text more legible through stronger hierarchy
- keep expressive treatment limited to key headers or slot emphasis

## Motion Rules

- hover, slot selection, and panel toggles only
- target duration: `150-220ms`
- no decorative infinite motion
- respect `prefers-reduced-motion`
- reserve layout space for async states to avoid content jumping

## Accessibility Rules

- visible keyboard focus on all interactive controls
- no color-only meaning for selected vs empty vs filled
- maintain contrast in dark surfaces
- avoid motion-heavy feedback for core navigation

## Success Criteria

- empty and filled slots are immediately distinguishable
- users always know which slot they are editing
- the center area clearly reads as edit stage + validation stage
- the right side reads as an inspector
- CUR and ANI feel like two modes of the same studio, not separate products
- desktop widths from `1024px+` preserve hierarchy and clarity

## Non-Goals

- changing export semantics
- adding new slot types
- redesigning the app header again
- introducing frame-level ANI editing
- building a fully immersive creative-canvas interface

## Outcome

After this refresh, Studio should feel like a deliberate authoring product:

- premium rather than generic
- focused rather than cluttered
- creative without becoming visually noisy
- consistent across CUR and ANI workflows

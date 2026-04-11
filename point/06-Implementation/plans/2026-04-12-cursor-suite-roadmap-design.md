---
title: Cursor Suite Roadmap Design
tags:
  - pointint
  - roadmap
  - cursor-suite
  - design
aliases:
  - Cursor Suite Roadmap
  - Long-Term Cursor Roadmap
---

# Cursor Suite Roadmap Design

## Purpose

This document is a long-term reference for the Pointint cursor-making suite.
It is not the current sprint plan and it is not the canonical task tracker.
Execution status stays in [[ACTIVE_SPRINT]] and [[2026-03-27-implementation-phase-flow]].

## Product Principles

- Pointint stays `output-first`: users start from `CUR` or `ANI`.
- Media tools stay embedded in the cursor workflow instead of becoming a standalone-first toolbox.
- `preview = export` remains a product contract across all cursor flows.
- `ANI` builds on the `CUR` editing core instead of becoming a separate editor stack.
- AI stays inside each output family (`CUR > AI Generate`, `ANI > AI Generate`) rather than becoming its own top-level mode.

## Capability Map

### 1. Core Cursor Editing

- Square framing and stable viewport coordinates
- `contain / cover / crop`
- pan / zoom / center
- hotspot placement, reset, and later recommendation
- light/dark preview
- actual-size preview
- pointer simulation
- export parity

### 2. CUR Authoring

- single-image upload
- static cursor editing
- static image AI generation
- `.cur` export
- install/restore packaging

### 3. ANI Authoring

- GIF to ANI
- video to ANI
- PNG sequence to ANI
- animated AI generation
- timeline and playback controls
- frame ordering and timing controls
- `.ani` export

### 4. Media Prep and Convert

- image format normalization
- GIF/video frame extraction
- frame-sequence ordering
- trim, sample, reduce, resize, crop, pad
- alpha cleanup and transparent edge cleanup

### 5. AI Assist

- CUR image generation
- ANI frame/loop generation
- auto-hotspot and auto-centering assistance
- frame auto-align
- `Animate this` bridge from CUR results into ANI work

### 6. Validation and Inspection

- visibility and clipping checks
- hotspot sanity checks
- readability checks
- frame count, duration, and file-size warnings
- loop smoothness and jitter checks

### 7. Export and Apply

- `.cur` export
- `.ani` export
- preview PNG/GIF/video outputs
- zip packaging
- install/restore assets
- Windows apply guide

## Architecture Direction

Pointint should normalize all inputs into one of two internal source models:

- `SingleFrameSource` for CUR work
- `FrameSequenceSource` for ANI work

This keeps input diversity from fragmenting the product surface.
`GIF`, `video`, `multiple PNGs`, and `ANI AI Generate` all become `FrameSequenceSource`.
`static image` and `CUR AI Generate` become `SingleFrameSource`.

The editor direction is:

- `CUR editor = core cursor editor`
- `ANI editor = core cursor editor + frame layer`

## Phase Mapping

### Current Official Direction

- `Phase 1`: ship and harden the static cursor core
- `Phase 1.5`: add ANI plus the media-prep foundation needed to support it

### Phase 1.5 Scope From This Roadmap

`Phase 1.5` should cover the smallest coherent ANI foundation:

- `.ani` export
- GIF input
- video input
- PNG sequence input
- frame normalization and prep
- ANI preview and editing basics

This phase should not absorb the whole roadmap.

### Later Phase Candidates

These remain roadmap references until explicitly promoted:

- CUR AI Generate
- ANI AI Generate
- `Animate this`
- advanced validation
- standalone utility surfaces
- marketplace/product-layer work

## Out of Scope

Pointint should not become a generic meme editor or a generic video editor.
These remain out of scope unless directly required for cursor making:

- caption/sticker tooling
- broad social-media GIF utilities
- full video-editing timelines
- general-purpose format conversion unrelated to cursor creation

## Document Contract

- [[ACTIVE_SPRINT]] tracks what is active now.
- [[06-Implementation/Phase-Flow]] summarizes official phase progression.
- [[2026-03-27-implementation-phase-flow]] holds phase task/gate detail.
- This roadmap stays a reference document that informs future phase definitions.


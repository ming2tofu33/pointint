# Slot Source Entry Design

> **Status:** approved design
> **Date:** 2026-04-13
> **Scope:** replace the top-level workflow picker with a slot-level source chooser in Studio

## Purpose

Studio is no longer a single-cursor editor. It is a slot-based cursor theme editor with `normal`, `text`, `link`, and `button` slots. The current `무엇을 만들지 선택하세요` entry still reflects the older project-level `CUR / ANI` split and now duplicates the slot model.

The entry flow should move down one level:

- Studio opens directly into the `normal` slot
- source choice belongs to the currently selected slot
- future inputs such as `Multiple PNGs` and `AI` stay visible without turning the first screen back into a product-level workflow picker

## Problem

### Current issues

- `/studio` still opens with a top-level workflow picker
- the slot rail appears only after the workflow branch is chosen
- the user first chooses a project workflow, then immediately enters a slot-based editor
- future source types (`Multiple PNGs`, `AI`) have no coherent slot-level home yet

### Why this matters

The current flow makes the studio feel like two different products:

1. a workflow picker
2. a slot-based editor

That split is artificial. The editor now revolves around slots, not project-wide workflow families.

## Selected Direction

### Entry model

- Remove the workflow picker from the default Studio entry
- Open directly into the `normal` slot
- If the selected slot is empty, render a slot-level empty state instead of a top-level workflow choice

### Empty state

The empty state should show:

- slot title context, e.g. `일반 슬롯`
- one sentence describing the slot role
- two primary actions:
  - `정적 이미지로 시작`
  - `애니메이션 GIF로 시작`

Below those primary actions, add a small inline expander:

- trigger: `다른 방법 보기`
- expanded options:
  - `여러 PNG로 시작` with `Soon`
  - `AI로 만들기` with `Soon`

This keeps the first interaction simple while preserving the future source chooser shape.

## Architecture

### State model

The old project-level entry states should be removed from the visible flow:

- `workflow-pick`
- `cur-upload`
- `ani-upload`

Instead, the selected slot determines the entry experience:

- selected slot has no bound asset -> render slot empty state
- selected slot has a pending static upload -> render background-removal choice
- selected slot has a populated static asset -> `editing`
- selected slot has a populated animated asset -> `ani-editing`

### Component direction

Introduce a dedicated slot empty-state component instead of reusing the top-level workflow picker:

- primary source cards
- inline secondary expander
- hidden file inputs for static and animated selection

Keep the current `UploadZone` for background-removal choice and existing processing states.

## Scope

### In scope

- remove workflow picker from Studio entry
- open Studio directly into `normal` slot
- add slot-level empty state for unbound slots
- add inline `다른 방법 보기` expander with `Soon` options
- update tests to lock the new entry behavior

### Out of scope

- implementing `Multiple PNGs`
- implementing `AI`
- changing slot export behavior
- redesigning the slot rail itself

## Testing

Add or update tests for:

1. Studio default entry renders the slot empty state, not the workflow picker
2. empty slots render slot-level source actions
3. inline secondary options expand and show `Soon`
4. landing handoff still auto-loads into the `normal` slot

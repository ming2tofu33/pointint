# Windows-Role Cursor Studio Design

> **Status:** approved design
> **Date:** 2026-04-14
> **Scope:** align Pointtint Studio and export packaging with the real Windows cursor role model

## Purpose

The current slot-based Studio uses interaction-oriented slots such as `normal`, `text`, `link`, and `button`. That works for an in-app simulation, but it does not match how Windows cursor themes are actually installed and mapped. If the product goal is to export a Windows-native cursor set, the Studio model must match Windows cursor roles directly.

This design changes Studio from a web-simulation slot editor into a Windows-role cursor set editor with progressive disclosure:

- the internal project model owns a Windows-aligned role set
- the UI shows only a small primary subset by default
- advanced roles are hidden behind an inline "more" control
- export supports both full-set package download and single-slot download

## Current Problem

### What exists today

- Studio owns four slots:
  - `normal`
  - `text`
  - `link`
  - `button`
- simulation zones are mapped to those four slots
- export still behaves like a single-slot editor

### Why that is insufficient

- Windows install packages do not have a `button` cursor role
- the current slot model and Windows install model diverge
- a full download cannot be a true Windows-native package unless roles match Windows
- users will expect one package that matches how cursor themes are installed on Windows

## Design Principles

1. Studio data model must match Windows cursor roles, not web-only interaction labels.
2. UI complexity should stay low through progressive disclosure.
3. The primary use path should still feel approachable to users who only care about common cursor states.
4. Full download should be the default action because Studio is now a set editor.
5. Single-slot download remains available as a secondary workflow.

## Options Considered

### Option 1: Keep the current four web-oriented slots and only translate during export

- smallest data-model change
- keeps the simple simulation model
- still leaves gaps because `button` does not map cleanly to Windows

Rejected because it would preserve a structural mismatch and keep export logic full of special cases.

### Option 2: Replace the slot model with a Windows core set and hide advanced slots by default

- recommended
- internal model matches Windows export
- UI remains lightweight because only the most common roles are shown first
- full package export becomes straightforward

Selected because it aligns product structure and export structure without exposing all roles at once.

### Option 3: Expose the full Windows cursor role matrix immediately

- most explicit
- fully transparent
- high cognitive load for new users

Rejected for v1 because it would make Studio feel much heavier than needed.

## Selected Approach

Studio will own an internal **11-slot Windows core set**.

### Primary roles shown by default

1. `Normal Select`
2. `Text Select`
3. `Link Select`
4. `Busy`

### Additional roles behind "more"

5. `Working in Background`
6. `Unavailable`
7. `Move`
8. `Horizontal Resize`
9. `Vertical Resize`
10. `Diagonal Resize 1`
11. `Diagonal Resize 2`

The UI shows only the first four roles until the user expands the hidden group.

## UX Structure

### Slot Rail

The slot rail is split into two sections:

- **Primary roles**: always visible
- **Additional roles**: collapsed by default behind an inline expander

The inline expander reads like:

- `추가 커서 7개`

When hidden roles contain configured cursors, the expander also shows a small status summary such as:

- `2개 설정됨`

### Slot Card Content

Each slot card continues to show:

- role name
- thumbnail
- small system-style glyph
- plain-language context label
- `설정됨 / 비어 있음`
- `정적 / 애니메이션`

The card style remains tool-like rather than gallery-like.

## Data Model

### Top-Level Project

Replace the current four-slot structure with a Windows-role project:

- `normalSelect`
- `textSelect`
- `linkSelect`
- `busy`
- `workingInBackground`
- `unavailable`
- `move`
- `horizontalResize`
- `verticalResize`
- `diagonalResize1`
- `diagonalResize2`

Each role keeps the same slot contract already introduced for static and animated sources.

### Slot Contract

Each role stores:

- `kind: "static" | "animated"`
- `name`
- `fitMode`
- `scale`
- `offsetX`
- `offsetY`
- `hotspotX`
- `hotspotY`
- `hotspotMode`

Asset differences remain:

- `static`: one rendered cursor source
- `animated`: one frame-sequence cursor source

## Simulation Contract

Simulation continues to show a limited number of common contexts, but those contexts now map into Windows roles:

- neutral -> `Normal Select`
- text -> `Text Select`
- link -> `Link Select`
- busy/loading -> `Busy`

Advanced roles such as resize and move are not required to appear in the main browser simulation immediately. They can be previewed in role-specific thumbnail or secondary scenes later.

This keeps the simulation useful without forcing the entire Windows cursor matrix into one scene.

## Download UX

### Primary action

- `전체 다운로드`

This exports a Windows-role package:

- includes all configured roles
- excludes empty roles
- packages files using Windows-aligned role naming
- prepares the project for a Windows-native install structure

### Secondary action

- `현재 슬롯만 다운로드`

This exports only the currently selected role for quick inspection and iteration.

### Why this split works

- the main value of Studio is now the cursor set, not one file
- users still need a fast way to verify one role while editing

## Progressive Disclosure Rules

### Default visible roles

The default visible group should contain only roles that most users immediately understand:

- `기본 포인터`
- `텍스트 입력`
- `링크`
- `대기 중`

### Collapsed advanced roles

The hidden group contains roles that are either rarer or more technical:

- `백그라운드 작업`
- `사용 불가`
- `이동`
- `가로 크기 조절`
- `세로 크기 조절`
- `대각선 크기 조절 1`
- `대각선 크기 조절 2`

This keeps the UI approachable while preserving a correct Windows-aligned model.

## Rollout Strategy

### Phase A: rename and expand the slot model

- replace the four current slots with the 11-role Windows core set
- keep current static/animated editing behavior

### Phase B: progressive slot rail

- show four roles by default
- hide seven roles behind inline expand/collapse
- show configured-count summary for hidden roles

### Phase C: export redesign

- make `전체 다운로드` the default
- keep `현재 슬롯만 다운로드` as the secondary action
- package by Windows role name rather than old slot label

## Risks

- current tests and translations are built around four slots and will need broad updates
- existing simulation assumptions are centered on `button`, which will be removed
- export packaging must be redesigned carefully so the full-set download and single-slot download do not fight each other

## Success Criteria

- Studio internal slots match the Windows role model
- only four primary roles are shown by default
- hidden roles can be expanded inline without leaving the rail
- full download is the default action and represents the configured Windows role set
- single-slot download remains available for rapid iteration

# Scene-Based Windows Role Simulation Design

> **Status:** approved design
> **Date:** 2026-04-14
> **Scope:** replace the current 4-zone browser mock with a realistic multi-scene simulation that can exercise the Windows core role set

## Purpose

The current simulation only supports four generic zones:

- neutral
- text
- link
- button

That was acceptable for early cursor previewing, but it does not match the current Windows-role Studio model. After the Studio slot model was moved toward Windows cursor roles, the simulation still remained a web-only approximation. As a result:

- `Normal Select`, `Text Select`, and `Link Select` are only partially represented
- `Busy` is incorrectly surfaced through a generic button zone
- `Working in Background`, `Unavailable`, `Move`, and the resize roles have no realistic simulation surface at all

The goal of this design is to make simulation feel like a believable environment rather than a set of artificial hover hotspots.

## Product Problem

Users do not think in terms of Windows internal role names first. They understand cursor behavior through context:

- browsing a page
- waiting for a task
- trying to click a disabled control
- moving a floating window
- resizing a panel

If the simulation only presents abstract zones, the user cannot evaluate whether a cursor set feels right in real usage. The missing piece is a set of realistic scenes that naturally expose the relevant cursor roles.

## Design Principles

1. Simulation should be scenario-based, not role-name-based.
2. Every role shown in Studio should have a believable interaction surface.
3. The simulation should remain compact enough to live in the lower Studio pane.
4. The interface should prefer progressive disclosure over showing 11 roles at once.
5. Manual exploration is primary; automatic demo is optional and secondary.

## Options Considered

### Option 1: Keep one browser mock and add more hotspots

- minimal surface change
- lowest implementation effort
- poor mental model for system and window roles

Rejected because it would continue to feel artificial. Resize and move roles do not make sense inside a plain browser content mock.

### Option 2: Add a separate simulation scene for each role

- very explicit role coverage
- easy role-to-view mapping
- too fragmented
- too many tabs or cards

Rejected because it turns simulation into a role browser rather than a believable environment.

### Option 3: Group roles into a few realistic scenes

- recommended
- maps user understanding to actual cursor behavior
- keeps the simulation pane compact
- supports both manual exploration and guided demo

Selected because it balances realism, learnability, and implementation cost.

## Selected Approach

The simulation is split into **three scenes**:

1. `브라우저`
2. `시스템 작업`
3. `창 조작`

Each scene contains a set of **stations**. A station is a hoverable area that naturally maps to one Windows role.

The simulation header becomes:

- scene tabs
- optional `데모 재생`
- background mode switch
- collapse button

The lower pane continues to show one large scene at a time.

## Role Mapping

### Scene 1: 브라우저

Roles covered:

- `Normal Select`
- `Text Select`
- `Link Select`

Surface:

- documentation-style browser page
- real text block
- input field
- link
- primary action button

Stations:

- neutral page chrome -> `Normal Select`
- text body or input -> `Text Select`
- link -> `Link Select`

Notes:

- browser scene is the default scene on first load
- this remains the most familiar and most used scene

### Scene 2: 시스템 작업

Roles covered:

- `Busy`
- `Working in Background`
- `Unavailable`
- `Normal Select` fallback where needed

Surface:

- lightweight system task panel
- file copy / sync card
- progress indicator
- disabled action
- locked or unavailable item

Stations:

- blocking progress area -> `Busy`
- background sync card -> `Working in Background`
- disabled button / locked item -> `Unavailable`

Notes:

- this scene should look closer to a Windows settings or transfer dialog than a web page
- `Working in Background` must read as “the pointer is still usable, but work continues”

### Scene 3: 창 조작

Roles covered:

- `Move`
- `Horizontal Resize`
- `Vertical Resize`
- `Diagonal Resize 1`
- `Diagonal Resize 2`

Surface:

- floating utility window
- title bar
- left/right edges
- top/bottom edges
- corner resize handles
- optional split pane divider

Stations:

- title bar -> `Move`
- left/right edges -> `Horizontal Resize`
- top/bottom edges -> `Vertical Resize`
- top-left / bottom-right corner -> `Diagonal Resize 1`
- top-right / bottom-left corner -> `Diagonal Resize 2`

Notes:

- this scene should feel mechanical and spatial, not content-oriented
- the user should immediately understand why a resize cursor appears

## Manual and Automatic Modes

### Manual exploration

Default interaction model:

- user moves the cursor freely inside the scene
- stations switch the active cursor source based on hover

This remains the default because it is the least intrusive and best supports editing iteration.

### Automatic demo

Optional secondary control:

- `데모 재생`

When started:

- the simulation moves through a curated path of stations
- each station is previewed for a short duration
- users can stop or interrupt it by moving the pointer

Notes:

- automatic demo is off by default
- it exists to help users understand where a given role is used
- it should not compete with manual inspection

## Empty and Missing Role Behavior

If the role required by a station is missing:

- fall back to `Normal Select` if available
- otherwise show the existing “normal required” placeholder behavior

Optional future enhancement:

- a subtle label or hint could indicate that the current station is using fallback behavior

This design does not require such hints for v1.

## UI Structure

### Header controls

Recommended order:

- scene tabs
- `데모 재생`
- background mode switch
- collapse

### Scene tab labels

- `브라우저`
- `시스템 작업`
- `창 조작`

### Footer body

- one active scene only
- no side-by-side multi-scene layout
- large enough to preserve immersion and readability

## Technical Contract

Current simulation infrastructure can remain partially intact:

- keep `CursorPreviewLayer`
- keep `CursorSource` abstraction
- keep per-role source building from the slot model

What changes:

- `CursorSceneZone` is no longer a 4-value enum
- role resolution must be station-based rather than generic zone-based
- simulation needs a scene identifier and station identifier
- station metadata maps to exact Windows role ids

## Suggested Data Shape

Recommended additions:

- `SimulationSceneId = "browser" | "system" | "windowControls"`
- `SimulationStationId` per scene
- station-to-role mapping table

Example:

- `browser.linkDocs -> linkSelect`
- `system.disabledButton -> unavailable`
- `windowControls.cornerTopLeft -> diagonalResize1`

This is more explicit than trying to overload a small generic zone enum.

## Testing Strategy

Minimum coverage:

- scene tabs switch scenes correctly
- each station resolves to the expected Windows role
- missing roles fall back to `normalSelect`
- `Working in Background` and `Busy` remain distinct
- window control stations map to the correct resize direction
- demo mode visits a known station sequence

## Recommendation

Implement the new simulation in phases:

1. scene tabs and station-based role mapping
2. browser scene migration
3. system work scene
4. window controls scene
5. optional demo playback

This gets the simulation structurally correct before adding polish.

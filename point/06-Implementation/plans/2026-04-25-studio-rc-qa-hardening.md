# Studio RC QA Hardening

> **Status:** in progress
> **Date:** 2026-04-25
> **Type:** release-candidate QA

## Goal

Make the Studio safer to change by pairing a real-browser release-candidate pass with automated regression coverage for the highest-risk flow: multi-slot upload, background decision gating, and Windows full-set download.

## Current Baseline

- Studio can edit Windows role slots one at a time.
- Static uploads pause for a background-removal decision.
- Full-set download is blocked while any static slot still needs that decision.
- Full-set download produces `pointint-windows-roles.zip` with `cursors/`, `install.inf`, and `restore-default.inf`.

## Automated Coverage Added

- Multi-slot static upload flow:
  - upload `normalSelect`
  - upload `textSelect`
  - keep full-set export blocked while both need background decisions
  - resolve one slot and keep export blocked
  - switch back to the unresolved slot
  - resolve the final slot
  - allow full-set export and package only resolved cursor entries
- Windows ZIP structure:
  - verify generated ZIP includes cursor paths and installer files in one flat package

## Manual RC Checklist

### Static Cursor Flow

- Upload a PNG/JPG/WebP into `normalSelect`.
- Confirm background-removal choice appears inline in the workspace.
- Confirm the left slot status says `Choose background` / `선택 필요`.
- Confirm full-set download is disabled.
- Choose `Use as-is` / `그대로 사용`.
- Confirm the slot becomes `Ready` / `편집 가능`.
- Confirm current-slot download works.

### Multi-Slot Flow

- Upload static images into at least two roles.
- Leave one role unresolved.
- Resolve the other role.
- Confirm full-set download remains disabled until all pending decisions are handled.
- Switch back to the unresolved role.
- Confirm the background decision UI returns.
- Resolve it and confirm full-set download becomes enabled.

### ANI Flow

- Upload a GIF into an animated role such as `busy` or `workingInBackground`.
- Confirm the editor stays in the ANI shell.
- Confirm current-slot `.ani` download works.
- Mix one static role and one animated role.
- Confirm full-set ZIP includes both `.cur` and `.ani` files.

### Windows Package Flow

- Download the full set.
- Confirm ZIP contains:
  - `install.inf`
  - `restore-default.inf`
  - `cursors/pointint_*.cur`
  - `cursors/pointint_*.ani` when animated slots are configured
- Extract once.
- Right-click `install.inf` and install.
- Confirm Windows pointer settings show the `Pointint` pointer set.
- Confirm unconfigured roles fall back to Windows defaults.
- Right-click `restore-default.inf` and install.
- Confirm the `Pointint` pointer set entry is removed.

## Non-Goals

- Building the `.exe` installer.
- Changing the background-removal model.
- Adding Playwright as a project dependency before deciding the long-term E2E stack.

## Next Decision

If this QA pass stays stable, close Studio RC hardening and move to one of:

- `WIN-INSTALLER-EXE-01`: installer feasibility spike
- `BG-FT-01`: background-removal quality spike
- `Phase 1.5 / Video input`: video-to-frame sequence input

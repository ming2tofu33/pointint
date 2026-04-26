# Windows EXE Installer Option

> **Status:** promoted to active spike
> **Date:** 2026-04-24
> **Type:** sprint option

> **Active Plan:** [[2026-04-26-windows-installer-feasibility-spike]]

## Goal

Evaluate whether Pointtint should ship a Windows `.exe` installer that installs, applies, restores, and uninstalls a cursor set with less user friction than the current ZIP + INF flow.

## Current State

- Studio full-set download produces a ZIP with:
  - `install.inf`
  - `restore-default.inf`
  - `cursors/*.cur`
  - `cursors/*.ani`
- The INF flow can register a Windows cursor scheme and copy cursor files.
- The user still needs to install the INF and then select the `Pointint` scheme in Windows mouse settings.

## Why This Exists

The current flow is technically acceptable but not consumer-friendly:

1. Download ZIP
2. Extract ZIP
3. Right-click `install.inf`
4. Choose Install
5. Open Windows mouse settings
6. Select the `Pointint` scheme

An installer could reduce this to one guided flow and make restore/uninstall easier.

## Scope For The Option

This is not implementation work yet. It is a feasibility and trust spike.

### Questions to answer

1. Is a PowerShell apply script enough for v1, or is a `.exe` installer necessary?
2. What installer technology should be used?
   - NSIS
   - Inno Setup
   - WiX
   - custom small executable
3. Can the installer immediately apply cursors by updating `HKCU\Control Panel\Cursors` and calling the Windows cursor refresh API?
4. What restore/uninstall behavior is required?
5. What code-signing path is needed to avoid unacceptable SmartScreen friction?
6. Should Pointtint offer both:
   - portable ZIP
   - guided installer

## Proposed Spike Deliverables

1. Document the current INF install path and its failure modes.
2. Prototype one local apply path:
   - PowerShell script or minimal executable
3. Verify immediate cursor apply and restore on a Windows machine.
4. Estimate code-signing cost and release complexity.
5. Recommend one of:
   - keep ZIP + INF only
   - add `apply-pointint.ps1`
   - ship a signed `.exe` installer

## Suggested Acceptance Criteria

- Installer can copy cursor files to a stable location.
- Installer can register the `Pointint` scheme.
- Installer can apply the scheme immediately without requiring manual Windows settings navigation.
- Restore/uninstall returns the user to a Windows default cursor scheme.
- The trust and signing story is acceptable for a consumer-facing download.

## Suggested Non-Goals

- Building a full installer in the spike.
- Replacing the existing ZIP download immediately.
- Supporting macOS/Linux cursor installation.
- Auto-running downloaded executables from the browser.

## Initial Recommendation

Short term:

- Keep improving the ZIP + INF package.
- Consider adding a clearly named PowerShell apply script only if the INF flow remains too manual.

Medium term:

- `WIN-INSTALLER-EXE-01` opened on 2026-04-26 because ZIP + INF now works, but install friction remains the next conversion risk.
- Treat code signing and SmartScreen as first-class requirements, not late polish.

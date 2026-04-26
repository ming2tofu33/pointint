# Windows Installer Feasibility Spike Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Decide whether Pointint should keep ZIP + INF, add a PowerShell apply helper, or build a signed Windows installer.

**Architecture:** Treat this as a feasibility spike, not a product installer build. The existing Studio ZIP generator remains the source of truth; the spike validates install/apply/restore paths around that package and records the lowest-friction path that is safe enough for users.

**Tech Stack:** Next.js Studio package output, Windows `.inf`, Windows registry under `HKCU\Control Panel\Cursors`, PowerShell prototype path, optional Inno Setup / NSIS / WiX comparison.

---

## Decision Frame

The current ZIP + INF flow works, but it still asks users to extract files, install `install.inf`, open Windows pointer settings, and select the `Pointint` pointer set. This spike should answer whether that friction is acceptable for v1 or whether we need a helper installer.

## Acceptance Criteria

- Current ZIP + INF flow is documented with exact user steps and known failure modes.
- A local prototype path is selected for testing:
  - keep INF only
  - add `apply-pointint.ps1`
  - build a small installer prototype
- Immediate apply feasibility is verified or rejected with evidence.
- Restore/uninstall behavior is defined before any public installer work starts.
- Code-signing and SmartScreen risk is explicitly scored.
- Final recommendation picks one path for the next sprint.

## Non-Goals

- Do not ship a public `.exe` in this spike.
- Do not auto-run anything downloaded from the browser.
- Do not replace the existing ZIP + INF package yet.
- Do not support macOS/Linux cursor installation.

## Task 1: Audit Current Package Output

**Files:**
- Read: `C:/Users/amy/Desktop/pointint/frontend/src/lib/studioDownload.ts`
- Read: `C:/Users/amy/Desktop/pointint/frontend/tests/lib/studio-download.test.ts`
- Read: `C:/Users/amy/Desktop/pointint/point/06-Implementation/plans/2026-04-25-studio-rc-qa-hardening.md`
- Modify: `C:/Users/amy/Desktop/pointint/point/06-Implementation/plans/2026-04-26-windows-installer-feasibility-spike.md`

**Steps:**
1. Generate or inspect a full-set ZIP with mixed `.cur` and `.ani`.
2. Confirm the ZIP includes `install.inf`, `restore-default.inf`, and `cursors/*`.
3. Record any package structure risks.
4. Confirm whether the current INF only registers the scheme or also applies it.

**Expected Output:** A short `Current Package Findings` section in this document.

## Task 2: Compare Installer Paths

**Files:**
- Modify: `C:/Users/amy/Desktop/pointint/point/06-Implementation/plans/2026-04-26-windows-installer-feasibility-spike.md`

**Options to compare:**
- ZIP + INF only:
  - lowest engineering risk
  - highest user friction
- ZIP + INF + PowerShell helper:
  - medium trust risk
  - can potentially apply the scheme immediately
  - still has script-execution friction
- Signed `.exe` installer:
  - best UX
  - highest release, signing, and SmartScreen complexity

**Expected Output:** A comparison table with UX, trust, engineering cost, and release risk.

## Task 3: Prototype Local Apply Path

**Files:**
- Candidate create: `C:/Users/amy/Desktop/pointint/tools/windows/apply-pointint.ps1`
- Candidate create: `C:/Users/amy/Desktop/pointint/tools/windows/README.md`
- Test manually on Windows only after reviewing the script.

**Prototype Scope:**
1. Read cursor files from an extracted package.
2. Copy them to `%SystemRoot%\Cursors\Pointint` or a safer user-writable equivalent if possible.
3. Register the `Pointint` pointer set.
4. Apply the scheme immediately if Windows APIs make this practical.
5. Provide a restore path.

**Safety Rule:** Do not run the prototype automatically. The user must review and explicitly run it because it changes local Windows cursor settings.

**Expected Output:** Either a local prototype script or a clear reason to skip PowerShell and go directly to installer research.

## Task 4: Define Restore And Uninstall

**Files:**
- Modify: `C:/Users/amy/Desktop/pointint/point/06-Implementation/plans/2026-04-26-windows-installer-feasibility-spike.md`

**Questions:**
1. Should restore remove only the `Pointint` scheme?
2. Should restore also switch the active cursor scheme back to Windows default?
3. Should uninstall delete copied cursor files?
4. How do we avoid breaking a user's active custom cursor scheme?

**Expected Output:** Restore/uninstall contract.

## Task 5: Recommendation

**Files:**
- Modify: `C:/Users/amy/Desktop/pointint/point/06-Implementation/ACTIVE_SPRINT.md`
- Modify: `C:/Users/amy/Desktop/pointint/point/06-Implementation/plans/2026-04-26-windows-installer-feasibility-spike.md`

**Recommendation Format:**
- Recommended path
- Why
- Risks
- Next implementation task

**Expected Output:** One clear next task, not multiple open-ended options.

## Initial Recommendation

Start with the PowerShell helper feasibility path before committing to `.exe`. It is the fastest way to learn whether immediate apply and restore behavior are reliable. If script-execution trust is too poor, use those findings to justify a signed installer rather than guessing.

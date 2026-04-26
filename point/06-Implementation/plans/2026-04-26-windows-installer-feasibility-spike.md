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

## Current Package Findings

> **Status:** audited on 2026-04-26

### ZIP structure

- The full-set download is intentionally flat at the package root plus one cursor folder:
  - `install.inf`
  - `restore-default.inf`
  - `cursors/pointint_*.cur`
  - `cursors/pointint_*.ani`
- This is the right structure for the current INF because `[SourceDisksFiles]` points each cursor file to `1,\cursors`.
- The current structure avoids the earlier nested-extraction problem where Windows asked for `pointint_arrow.cur` even though the file was inside a subfolder.

### INF install behavior

- `install.inf` uses:
  - `[DefaultInstall]`
  - `CopyFiles = Scheme.Cursors`
  - `AddReg = Scheme.Reg`
  - `[DestinationDirs] Scheme.Cursors = 10,"Cursors\Pointint"`
  - `[SourceDisksFiles] pointint_*.cur = 1,\cursors`
- This should copy bundled cursor files into `%SystemRoot%\Cursors\Pointint` and register a `Pointint` pointer scheme under `HKCU\Control Panel\Cursors\Schemes`.
- The INF does not apply the cursor scheme immediately. It only registers the scheme. The user still has to open Windows pointer settings and select `Pointint`.
- Unconfigured roles are filled with Windows default cursor paths in the scheme string. This is correct for partial sets, but the user may not understand why some roles stay visually default.

### Restore behavior

- `restore-default.inf` currently deletes the `Pointint` scheme registration with `DelReg`.
- It does not switch the active cursor scheme back to Windows Default.
- It does not delete copied files from `%SystemRoot%\Cursors\Pointint`.
- Current copy that says "restore the default cursor" is potentially misleading. Safer wording: "Remove the Pointint pointer set from the list. If it is currently active, switch to Windows Default in pointer settings first or after running this file."

### Failure risks

- If the user runs `install.inf` before extracting the ZIP, Windows may not find files under `cursors/`.
- If Windows blocks or hides the `Install` context menu, the user may not know what to do next.
- If the user expects install to apply immediately, the workflow feels broken because the scheme only appears in settings.
- If the user runs `restore-default.inf` while `Pointint` is active, the active cursor values may not reset automatically.
- If the user lacks permission to copy into `%SystemRoot%\Cursors\Pointint`, the copy step may fail or prompt unexpectedly.
- The Korean and English product copy still contains "one-click installer" style language in some places. That overpromises the current ZIP + INF flow.

### Copy audit

- Keep the term `Scheme` in English copy because it matches the Windows UI.
- In Korean copy, use `구성표(커서 세트)` on first mention instead of only `구성표`.
- Replace "one-click installer" claims with "Windows install guide" or "Windows-ready install files" until an actual helper installer exists.
- Restore copy should say "Pointint 항목 제거" rather than "기본 커서 복원" unless we implement immediate active-scheme reset.

### References checked

- Microsoft Learn: INF `DefaultInstall` supports `CopyFiles` and `AddReg` for install sections.
- Microsoft Learn: INF `DestinationDirs` controls the target directory for copied files.
- Microsoft Learn: INF `SourceDisksFiles` names the source files and their package subdirectories.
- Microsoft Learn: INF `CopyFiles` requires source path information through `SourceDisksNames` and `SourceDisksFiles`.

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

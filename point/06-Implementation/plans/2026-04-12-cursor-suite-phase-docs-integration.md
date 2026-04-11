# Cursor Suite Phase Docs Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a long-term cursor-suite roadmap reference and connect it to Pointint's existing phase and planning documents without turning reference ideas into active execution scope.

**Architecture:** Keep roadmap thinking in one reference document and update the phase documents to consume that roadmap selectively. `Phase-Flow` remains the high-level official view, `implementation-phase-flow` remains the task/gate detail, and the roadmap only informs future phase definitions.

**Tech Stack:** Markdown, Obsidian-style wiki links, existing `point/06-Implementation` planning structure

---

### Task 1: Add the roadmap reference document

**Files:**
- Create: `point/06-Implementation/plans/2026-04-12-cursor-suite-roadmap-design.md`

**Step 1: Write the document**

- Capture the long-term `cursor-making suite` direction.
- Keep the structure output-first: `CUR`, `ANI`, shared tools beneath them.
- Record capability groups, architecture direction, phase mapping, and out-of-scope boundaries.

**Step 2: Verify document role**

- Confirm the document says it is a reference, not the current sprint tracker.
- Confirm it links back to `ACTIVE_SPRINT`, `Phase-Flow`, and `implementation-phase-flow`.

### Task 2: Add a concrete follow-up plan for doc integration

**Files:**
- Create: `point/06-Implementation/plans/2026-04-12-cursor-suite-phase-docs-integration.md`

**Step 1: Document the integration plan**

- Explain how roadmap docs and phase docs differ.
- List the exact docs to sync.
- Keep the plan limited to document integration, not feature implementation.

**Step 2: Verify scope control**

- Confirm the plan explicitly avoids promoting roadmap-only ideas into active implementation scope.

### Task 3: Link the new docs into the plan hub

**Files:**
- Modify: `point/06-Implementation/plans/Plans-Index.md`

**Step 1: Add roadmap and integration-plan links**

- Insert links in `Quick Links`.
- Add short descriptions in `Notes In This Layer`.

**Step 2: Verify discoverability**

- Confirm both new docs are reachable from the index.

### Task 4: Update the high-level phase summary

**Files:**
- Modify: `point/06-Implementation/Phase-Flow.md`

**Step 1: Refine Phase 1.5 naming**

- Update `Phase 1.5` from a vague `.ani + expansion` label to `ANI + Media Prep Foundation`.

**Step 2: Add the roadmap reference**

- Link the roadmap doc from the phase summary.
- Clarify that the roadmap informs future phase definitions but does not replace sprint execution docs.

### Task 5: Update the detailed phase plan

**Files:**
- Modify: `point/06-Implementation/plans/2026-03-27-implementation-phase-flow.md`

**Step 1: Reframe Phase 1.5**

- Rename the phase to `ANI + Media Prep Foundation`.
- Update the description so Phase 1.5 includes GIF/video/PNG-sequence ingestion plus ANI basics.

**Step 2: Keep roadmap-only ideas deferred**

- Mention that AI generation and broader suite capabilities stay in the roadmap until promoted.

### Task 6: Record the decision trail

**Files:**
- Modify: `point/10-Journal/QUICK-DECISIONS.md`
- Modify: `point/06-Implementation/ACTIVE_SPRINT.md`

**Step 1: Append the decision**

- Record that the long-term cursor-suite roadmap is now a reference document.
- Record that official phase docs only import the part that has been promoted to real phase scope.

**Step 2: Verify follow-up**

- Confirm `ACTIVE_SPRINT` references the new roadmap only as background, not as an active sprint commitment.

### Task 7: Validate the document graph

**Files:**
- Read only: all modified docs

**Step 1: Check links**

- Confirm the index links to both new docs.
- Confirm `Phase-Flow` and `implementation-phase-flow` both mention the roadmap.

**Step 2: Check role clarity**

- Confirm no document blurs `reference roadmap` and `current execution plan`.


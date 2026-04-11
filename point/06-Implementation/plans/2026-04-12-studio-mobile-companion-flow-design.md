---
title: Studio Mobile Companion Flow Design
tags:
  - pointint
  - implementation
  - studio
  - mobile
  - design
aliases:
  - Studio Mobile Companion
  - Studio Mobile Companion Flow
---

# Studio Mobile Companion Flow Design

> **Date:** 2026-04-12
> **Status:** Approved
> **Scope:** Studio mobile entry behavior and mobile-to-desktop continuation
> **Related docs:**
> - [[2026-04-11-studio-workflow-picker-cur-ani]]
> - [[2026-04-11-pointint-landing-redesign-design]]
> - [[06-Implementation/ACTIVE_SPRINT]]

## 1. Goal

Pointint Studio mobile experience should stop being a dead-end blocker.

The mobile version should not try to replicate full cursor editing. Instead, it should work as a companion entry flow:

1. start a cursor draft on mobile
2. hand the draft off to desktop
3. complete precision editing on desktop

This keeps the product accessible on mobile without forcing a low-quality mobile editor.

## 2. Product Framing

Pointint Studio is not a casual image uploader. It is a precision cursor editor.

That means the full desktop editor remains the source of truth for:

- hotspot placement
- pixel-level position and scale tuning
- real output-size confidence
- final `.cur` download

Mobile should support the beginning of the workflow, not the whole workflow.

## 3. Approved Direction

The approved strategy is:

- `V1`: mobile companion flow with anonymous draft handoff
- `V2`: account-based save and resume

This keeps the first implementation small enough to ship while still moving toward a stronger login-based product later.

## 4. Why Full Mobile Studio Is Not The Right V1

Mobile Studio is technically possible, but not product-correct right now.

The main problems are:

- hotspot editing requires precision that mobile touch does not provide well
- output confidence depends on tiny cursor sizes and exact click points
- the current Studio layout is built around multi-panel editing
- the final artifact is a Windows cursor, which is primarily a desktop outcome

So the correct split is:

- mobile = start
- desktop = finish

## 5. V1 Scope

### 5.1 Mobile Studio can do

- open `/studio`
- upload an original image
- create an anonymous draft
- show the uploaded original thumbnail
- show a `continue on desktop` action

### 5.2 Mobile Studio cannot do

- background removal
- cursor mock preview
- hotspot editing
- position/scale editing
- final `.cur` download

### 5.3 Desktop Studio continues to do

- load the draft
- begin actual processing
- run remove-background flow
- allow framing and hotspot editing
- export and download

## 6. Mobile Screen Structure

Mobile `/studio` should be a companion entry screen, not a blocked page.

Recommended structure:

1. `Entry Header`
   - short title
   - one-sentence explanation that precise cursor editing continues on desktop

2. `Upload`
   - image upload input
   - supported format note

3. `Draft Preview`
   - original image thumbnail only
   - draft-ready status message

4. `Continue On Desktop`
   - primary CTA with resume link
   - secondary code fallback

5. `Desktop-only Notes`
   - hotspot adjustment
   - pixel-level editing
   - final download

The screen should feel like a valid starting surface, not an error state.

## 7. Handoff Strategy

### 7.1 V1 handoff model

Use `anonymous draft handoff`.

Flow:

1. mobile upload creates a temporary draft
2. system returns a `resumeUrl`
3. user opens that link on desktop
4. desktop Studio loads the draft and starts the real edit flow

### 7.2 Why not login-first

Account-based draft resume is the long-term direction, but not the right first implementation.

Reasons:

- login would add friction before users see product value
- the current codebase does not yet have auth flow in place
- it would turn a mobile UX fix into a larger auth project

### 7.3 V2 direction

Later, account-based save/resume can extend the same draft system.

That version should add:

- save to account
- recent drafts
- cross-device continuation
- reusable work history

So the roadmap is:

- `V1`: anonymous draft handoff
- `V2`: account-linked draft ownership

## 8. Primary Continuation UX

The primary continuation method should be:

- `resume link` first
- `short code` second

Reasoning:

- links are the most natural continuation path
- short code is useful as a fallback if the link cannot be shared easily

The product should present the link as the main action and the code as a backup mechanism.

## 9. Upload Processing Rules

For `V1`, mobile should only do:

- original upload
- draft creation

It should not run background removal or preview transformation on mobile.

This keeps the rule clean:

- mobile starts the draft
- desktop performs real processing

That also reduces mobile complexity and avoids building a half-editor too early.

## 10. Capability Gating Rules

This should be treated as an editing-capability decision, not simple device detection.

### 10.1 Primary gate

- viewport width below desktop threshold

### 10.2 Secondary signals

- `pointer: coarse`
- `hover: none`

### 10.3 Design principle

The product is not trying to detect “phone vs desktop.”
It is trying to detect whether the environment is suitable for precision cursor editing.

## 11. Resize Safety Rule

This is critical.

The app must not switch a live desktop editing session into mobile companion mode just because the user resized the window.

Approved rule:

- decide entry mode on initial session entry
- if the user entered in desktop edit mode, preserve that mode
- if the viewport later becomes too small, show a blocker or warning overlay instead of unmounting the editor

This prevents in-progress work from being lost or visually replaced by a different flow.

In short:

`entry mode is sticky, resize only changes warning state`

## 12. Required Data Structure

Current `landingStore` memory storage is not enough for cross-device continuation.

`V1` needs a temporary draft model with at least:

- draft id
- original image reference
- createdAt
- expiresAt
- status
- resumeUrl
- optional short code

The system must support:

- mobile create
- desktop read
- expiration handling

## 13. Expiration Behavior

Anonymous drafts should expire.

If a draft is expired or missing:

- show clear failure state
- explain that the temporary draft is no longer available
- offer re-upload as the recovery path

This keeps the anonymous system lightweight and understandable.

## 14. Testing Criteria

### 14.1 Mobile companion tests

- mobile `/studio` renders upload UI
- upload creates draft-ready state
- original thumbnail is shown
- `continue on desktop` CTA is shown
- desktop-only notes are visible
- edit controls and download action are not shown

### 14.2 Desktop continuation tests

- desktop entry via `resumeUrl` loads the original asset
- desktop Studio begins normal processing/edit flow
- expired draft shows recovery state

### 14.3 Resize behavior tests

- desktop editing session does not lose state when width shrinks
- resize under threshold shows blocker/overlay, not companion flow replacement
- expanding the viewport restores normal editor visibility without losing work

## 15. Non-Goals

Not part of this design:

- full mobile cursor editor
- mobile hotspot editing
- mobile export/download
- login-required V1
- mobile cursor mock rendering

## 16. Summary

The approved design is:

- mobile Studio becomes a companion entry flow
- `V1` uses anonymous drafts
- mobile only uploads original and starts the draft
- desktop remains the precision editing environment
- entry mode is sticky and resize only adds warnings
- account-based resume is a later extension, not the first dependency

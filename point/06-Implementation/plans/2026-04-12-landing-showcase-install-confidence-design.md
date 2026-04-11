---
title: Landing Showcase Install Confidence Design
tags:
  - pointint
  - landing
  - showcase
  - design
aliases:
  - Landing Showcase Design
  - P1-SHOWCASE-01 Design
---

# Landing Showcase Install Confidence Design

## Purpose

Define `P1-SHOWCASE-01` as a landing-page section that shows curated Pointint sample cursors and closes the trust gap between "this looks good" and "I can actually install this on Windows."

This is not a user gallery.
This is a first-party showcase made from downloadable sample cursor bundles that Pointint publishes directly.

## Problem

The current landing structure already covers:

- proof that an image becomes a cursor
- workflow explanation
- studio entry and direct product CTA

What it does not yet show is the output range and install confidence in one place.

If another explanatory section is added, it will overlap with `WorkflowSurface`.
If showcase is deferred to a future gallery system, the landing keeps missing a concrete "what kind of result will I get?" layer.

## Recommended Direction

Add a `Showcase` section between `WorkflowSurface` and `MoodGlimpse`.

The section should combine:

- curated result examples
- sample downloads
- install confidence summary
- a short path into the full install guide

This keeps the information architecture clean:

- `Hero` = proof
- `WorkflowSurface` = how it works
- `Showcase` = what the result looks like and how easy it is to apply
- `MoodGlimpse` = broader emotional direction
- `TrustCTA` = final action prompt

## Section Structure

### 1. Header

The section opens with:

- a short title
- a one-line explanation that these are downloadable Pointint-made samples

The tone should stay product-facing and concrete, not community-facing.

### 2. Sample Cards

Ship with `3-4` static curated sample cards.

Each card includes:

- preview image
- cursor name
- short mood/use-case label
- short one-line description
- `Download sample` action

Each sample should map to a real static bundle under `frontend/public/showcase/...`.
Each bundle should include:

- `cursor.cur`
- `install.inf`
- `restore-default.inf`

This makes the showcase a real proof surface instead of a decorative mock.

### 3. Install Summary Strip

Below the cards, add a compact confidence strip that states the bundle contents in plain language, for example:

- sample download includes `.cur`
- install bundle includes `install.inf`
- restore bundle includes `restore-default.inf`

This should stay short and scan-friendly.
It is not a replacement for the full guide.

### 4. Detail Actions

The strip exposes two actions:

- `How to install`
- `Open studio`

`How to install` opens a landing-safe modal with the Windows apply steps.
`Open studio` routes to `/studio`.

## Modal Strategy

Do not reuse the current studio `GuideModal` directly.

The current modal is tied to the post-download studio state and includes copy like `Download complete`, which does not fit the landing context.

Instead, add a landing wrapper modal that reuses the same install steps and restore guidance, but removes the download-success framing.

The new modal should:

- reuse the same ordered Windows install steps
- reuse the restore instruction
- use landing-safe heading/callout text
- support open/close from the showcase section only

## Content Source

Use static metadata for the first version.

Recommended data shape:

- `id`
- `name`
- `mood`
- `description`
- `previewSrc`
- `previewAlt`
- `downloadHref`

This metadata should live in one shared module so the UI does not hardcode card contents inline.

## Visual Direction

The showcase should feel consistent with the current landing redesign:

- atmospheric but not noisy
- premium glass-like surfaces already used in the site
- result-focused, not dashboard-like

The cards should read as product artifacts, not social posts.
Keep them compact, tactile, and clean.

Recommended layout:

- desktop: horizontal rail or responsive multi-card row
- mobile: stacked cards with strong spacing

## Testing Strategy

Add focused landing tests for:

- showcase section rendering
- expected sample cards rendering
- install summary strip rendering
- install modal open/close interaction
- landing shell now including showcase between workflow and mood

The section should be testable by semantic text and `data-testid` markers where needed.

## Out of Scope

Do not include these in `P1-SHOWCASE-01`:

- user-submitted gallery
- auth/project storage
- dynamic backend showcase feeds
- analytics expansion beyond existing landing plans
- sample generation pipeline
- `.ani` samples

This task is a landing trust and output-range layer, not a marketplace or gallery feature.

## Document Follow-up

When implemented, sync:

- `ACTIVE_SPRINT.md`
- `QUICK-DECISIONS.md`
- `Plans-Index.md`

This keeps `P1-SHOWCASE-01` visible as an explicit follow-up after the editor-confidence work.

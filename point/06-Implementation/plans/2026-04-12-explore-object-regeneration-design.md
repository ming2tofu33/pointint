# Explore Object Regeneration Design

> Date: 2026-04-12
> Scope: Explore showcase asset refresh

## Purpose

Regenerate the first Explore object batch so the objects feel less toy-like, more refined, and more distinct from one another while staying in the same visual family.

## Decision

- Use a shared `Dreamy Premium` baseline for all second-batch objects.
- Keep transparent background, front-facing composition, and square-frame dominant silhouette.
- Reduce direct `cute`, `toy`, and exaggerated jelly cues.
- Differentiate the objects through material language and emotional role, not through unrelated style systems.

## Approach

### Option A: Keep the first batch and only cherry-pick the strongest image

- Fastest
- Does not address the user's main feedback about playfulness and sameness

### Option B: Shared base plus distinct personality

- Keeps Explore coherent as a set
- Lets each object carry a different emotional note
- Recommended

### Option C: Strongly separate all three objects

- Maximizes contrast
- Risks losing set cohesion inside the Explore row

## Shared Base

- transparent background
- front-facing object
- large centered silhouette that fills most of the 1:1 frame
- refined pastel palette
- soft luminous material read
- restrained internal detail
- minimal linework
- no black outline
- no app-icon or cursor-language bias

## Object Roles

### Cat Paw

- emotional role: cutest of the set, but still refined
- material: milky jelly with porcelain softness
- read: soft body, gentle pink pads, rounded but not candy-like

### Mini Fishbowl

- emotional role: quiet and minimal
- material: clean glass vessel with calm water
- read: bowl should stay understated so the fish becomes the focal accent

### Planet Orb

- emotional role: dreamy and atmospheric
- material: misty luminous sphere
- read: detached tiny star and inner glow should carry the fantasy cue

## Prompt Rules

- remove over-explicit toy/cute wording from the main prompt
- add `dreamy premium`, `quiet object`, `soft luminous material`, `restrained detail`
- describe each object with a unique material pairing
- preserve transparent-background constraints and avoid scene-building

## Output Plan

- regenerate:
  - `cat-paw-default-v02.png`
  - `mini-fishbowl-default-v02.png`
  - `planet-orb-default-v03.png`
- save generator outputs to `assets/pixellab/raw/`
- promote only the strongest results to `assets/pixellab/selected/`

## Testing

- visual check at raw size
- compare against first batch for:
  - lower toy-like feel
  - stronger personality separation
  - preserved family resemblance

## Out of Scope

- final export to `frontend/public/showcase/explore/`
- third-batch exploration for crescent shard or paper airplane
- post-processing or manual paintovers

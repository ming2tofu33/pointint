---
title: Explore Surface and Studio Boundary Design
tags:
  - pointint
  - explore
  - studio
  - design
aliases:
  - Explore Surface Design
  - Studio Boundary Design
---

# Explore Surface and Studio Boundary Design

## Purpose

Define a cleaner product boundary between `Studio` and a new top-level `Explore` surface.

`Studio` should remain a focused making tool.
`Explore` should become the place for browsing sample results, curated packs, and later other Pointint products.

## Problem

The current direction started pushing showcase content into `/studio`.

That creates a structural mismatch:

- `Studio` is a tool surface
- `Showcase` is a browsing and discovery surface

This made the studio entry feel heavier and less focused.
It also does not scale well once Pointint grows beyond a single cursor product.

## Product Context

Pointint documents already imply a wider product system:

- `point/00-INDEX.md` fixes the principle: brand broad, first product narrow
- `Phase-Flow.md` includes later expansion beyond the current cursor-making tool
- `cursor-suite-roadmap-design.md` keeps the current studio scoped to cursor creation

That means `Studio` should not turn into a mixed browse-plus-make home.

## Options Considered

### 1. Keep Showcase Inside Studio

Pros:

- one less top-level page
- samples are visible at tool entry

Cons:

- studio loses focus
- mixes browse and make
- does not scale to multiple future products

### 2. Remove Studio Showcase And Keep Everything On Landing

Pros:

- studio becomes clean again
- smallest change

Cons:

- showcase remains coupled to the landing page only
- future cross-product browsing surface still does not exist

### 3. Remove Studio Showcase And Create A Separate Explore Surface

Pros:

- restores a clean tool boundary
- creates a reusable browse/discovery surface for future products
- keeps landing free to remain brand/proof focused

Cons:

- requires a new route and navigation entry
- introduces one more top-level concept

## Recommended Direction

Use option 3.

Make the product surfaces explicit:

- `Landing` = brand, proof, high-level trust
- `Studio` = make a cursor
- `Explore` = browse samples, curated packs, and later other products

This creates the right long-term shape without overbuilding the current phase.

## Studio Rules

`/studio` should return to a pure creation entry.

That means:

- remove the compact showcase rail from studio entry
- keep the CUR/ANI workflow picker as the first decision surface
- keep showcase access as navigation, not as embedded browse content

Studio can still contain minimal contextual help, but not a content browsing section.

## Explore Rules

`/explore` should start narrow, but be structurally future-proof.

Initial contents:

- the current first-party sample cursor showcase
- sample bundle download actions
- install-confidence guidance
- a route into `/studio`

Future expansion:

- more cursor packs
- official collections
- later non-cursor Pointint products

This means the page should be designed as an `Explore` shell, not as a page literally named only for cursor showcase.

## Information Architecture

Top-level navigation should move toward:

- `Home`
- `Explore`
- `Studio`

If navigation is still minimal right now, the first step can be lightweight:

- add `Explore` as a visible route entry
- use the current showcase content there
- keep landing links pointing into `Explore` where appropriate

## Content Migration Strategy

The current landing showcase should not be thrown away.

Instead:

- extract the showcase content model so it can render inside `/explore`
- keep landing either with:
  - a smaller teaser that links to `/explore`, or
  - no large showcase section at all if the landing becomes cleaner without it

The safer first move is:

- make `/explore` the full showcase destination
- reduce landing showcase into a teaser or secondary link in a later pass

## Scope For The Next Implementation Slice

The next coded slice should do only the minimum coherent change:

1. remove the studio showcase rail
2. add an `/explore` route
3. render the existing showcase content on `/explore`
4. add an `Explore` navigation path users can actually reach

Do not redesign the entire landing or global IA in the same slice.

## Testing

Cover:

- `/studio` no longer rendering showcase content
- `/explore` rendering the showcase surface
- navigation path to `/explore` existing
- current sample download/install flows remaining intact

## Decision

Pointint should treat `Explore` as a separate top-level browsing surface.
`Studio` should stay a focused making tool and should not host showcase content directly.

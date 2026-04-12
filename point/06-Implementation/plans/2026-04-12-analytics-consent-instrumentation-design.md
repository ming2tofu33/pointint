---
title: Analytics Consent And Instrumentation Design
tags:
  - pointint
  - analytics
  - ga4
  - clarity
  - consent
  - design
aliases:
  - Analytics Consent Design
  - Analytics Instrumentation Design
---

# Analytics Consent And Instrumentation Design

## Purpose

Define a minimal but scalable analytics foundation for Pointint.

This slice should add:

- a site-wide analytics consent banner
- consent-gated GA4 loading
- consent-gated Microsoft Clarity loading
- a small first-party event map for the current browse/make/download funnel

It should not add login, backend reporting, or a full privacy settings center.

## Problem

Pointint has enough shipped product flow to benefit from instrumentation:

- landing
- explore
- studio
- sample bundle downloads
- cursor download completion
- install guide modal

But there is no real analytics pipeline yet.

That means current product decisions are based on manual testing rather than measured usage.

## Product Context

Pointint is still in a pre-account phase.

The current product goal is:

- understand whether users browse first or make first
- understand whether sample bundle download is used more than direct creation
- measure completion through download and guide open

This means analytics should not depend on authentication.

## Reference Pattern

`0to1log` already uses the same staged pattern:

- frontend env vars for GA4 and Clarity
- consent-gated client-side loading
- optional backend GA4 reporting later

Pointint should copy the frontend consent and instrumentation pattern first, but skip the admin reporting layer for now.

## Options Considered

### 1. GA4 Only, No Consent

Pros:

- fastest implementation
- simplest runtime behavior

Cons:

- no session replay or heatmap support
- weak privacy posture for future expansion
- likely rework when broader product surfaces appear

### 2. GA4 + Clarity With A Global Consent Banner

Pros:

- matches the future product direction better
- keeps analytics independent from auth
- sets a reusable pattern for other Pointint products
- still small enough for Phase 1 follow-up

Cons:

- more moving parts than GA4-only
- requires consent state handling and client-side loaders

### 3. Full Privacy Preference Center

Pros:

- strongest long-term compliance posture
- complete user controls from the start

Cons:

- too large for current scope
- adds UI and policy complexity that Pointint does not need yet

## Recommended Direction

Use option 2.

Add a simple global analytics consent banner for all visitors.

Store consent in a first-party cookie and only load GA4 or Clarity after explicit acceptance.

Keep the implementation narrow:

- no category matrix
- no backend analytics dashboard
- no authenticated user identity stitching

## Consent Model

Use one cookie:

- `analytics-consent=accepted`
- `analytics-consent=declined`

Banner behavior:

- show when the cookie is missing
- hide after either choice
- if accepted, immediately load analytics providers
- if declined, keep analytics disabled

This model is intentionally simple and sufficient for v1.

## User Experience

Banner placement:

- fixed bottom banner
- visible across landing, explore, and studio

Buttons:

- `필수만 사용` / `Only essential`
- `모두 허용` / `Accept all`

Behavior:

- essential-only keeps the site fully usable
- accept-all loads GA4 and Clarity immediately
- no settings reopen link in v1

## Instrumentation Scope

The initial event map should stay small and product-oriented.

Tracked events:

- `page_view`
- `studio_entry`
- `workflow_selected`
- `explore_opened`
- `sample_bundle_downloaded`
- `download_completed`
- `install_guide_opened`

Do not add low-signal UI noise such as theme, locale, or hotspot events in this slice.

## Architecture

### Consent State

Create a small client utility for reading and writing the analytics consent cookie.

The consent banner and analytics loader should use the same source of truth.

### Analytics Loader

Create a client-only analytics module that:

- checks env vars
- checks consent
- loads GA4 lazily
- loads Clarity lazily
- exposes `trackPageView` and `trackEvent`

If consent is missing or declined, all tracking calls are no-op.

If env vars are missing, provider loading is skipped safely.

### Provider Boundaries

GA4:

- page views
- named custom events

Clarity:

- passive recording only
- no custom event dependency for v1

### Integration Points

Expected wiring points:

- root layout for banner and page-view loader
- header or route-aware client effect for route page views
- workflow picker for `workflow_selected`
- explore sample download action for `sample_bundle_downloaded`
- studio download success for `download_completed`
- guide modal open for `install_guide_opened`

## Constraints

- Analytics must not break the site when env vars are absent
- Analytics must not require login
- Consent state must work across all current top-level surfaces
- v1 should not introduce CSP middleware yet

## Testing

Cover:

- banner renders when consent cookie is missing
- banner disappears after accept or decline
- accepted consent writes the cookie and triggers loader behavior
- declined consent writes the cookie and does not load analytics
- `trackEvent` is no-op without consent
- routed instrumentation points call the analytics helper with the expected event names

## Out Of Scope

- backend GA4 reporting endpoints
- analytics dashboards
- per-user identity binding
- preference center or consent reset UI
- region-specific consent behavior
- Clarity custom tagging strategy

## Decision

Pointint should implement `P1-ANALYTICS-01` as a global consent-gated analytics foundation:

- site-wide banner
- GA4 + Clarity client-side loading
- minimal funnel events
- no auth dependency
- no backend reporting yet

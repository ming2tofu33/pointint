# Studio Clean Editor Redesign Design

**Approved direction:** Rebuild `/studio` around the clean editor UI shown in `frontend/example/cursor studio.html`, while preserving the existing Pointint Studio functions.

## Goals

- Make the whole Studio feel like a focused desktop editor instead of a layered marketing surface.
- Use Pointint's existing pink accent, not the purple accent from the example.
- Keep current capabilities: quick upload, background decision, quick download, advanced editing, slot role selection, hotspot/framing/scale controls, simulation, CUR download, ANI editing.
- Reduce visual noise with lighter surfaces, thin dividers, tighter controls, and mostly square corners.

## UX Shape

The Studio shell uses the example's structure:

- Top app bar for project context, save state, and export actions.
- Left rail for cursor role selection in advanced mode.
- Central workspace for upload/result/canvas/simulation.
- Right inspector for properties and status.

Quick mode remains first for static image users, but it should look like the same editor product: a clean upload workspace and a clean result workspace, not a separate landing page. Advanced mode exposes the full three-column editor.

## Visual System

- Background: light editor gray in light mode, restrained dark editor surface in dark mode.
- Accent: `var(--color-accent)` / current Pointint pink.
- Corners: 0 to 8px for editor controls and cards.
- Borders: thin, visible dividers; fewer glow effects.
- Typography: compact editor hierarchy, smaller panel headings, no oversized hero treatment inside Studio.
- Motion: only hover/focus and drag states.

## Implementation Boundaries

- Do not change `useStudio` export, rendering, hotspot, or background-removal logic unless necessary for layout wiring.
- Do not remove the quick finish flow.
- Do not regress ANI editor entry.
- Keep i18n keys synchronized.
- Prefer styling and layout edits in Studio-specific components before touching shared app-wide components.

## Acceptance

- `/studio` empty, background decision, quick result, and advanced states share one clean editor visual language.
- Advanced mode resembles the example's three-column editor while keeping existing slot and inspector controls.
- Pink accent is used consistently.
- Existing focused tests pass, and a local browser check confirms layout is usable.

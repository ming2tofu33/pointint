# ANI Source Maker / GIF Maker Design

> **Status:** approved direction
> **Date:** 2026-04-27
> **Scope:** Phase 1.5 follow-up after GIF-to-ANI and Studio RC hardening

## Purpose

Pointint now has a stable cursor editor and a working GIF-to-ANI path, but the ANI source creation step is still thin. Users who do not already have a polished GIF need a way to make an animation source before they enter cursor editing.

The direction is to add an Ezgif-like source-making layer inside Studio, without turning Pointint into a generic GIF editor.

The first slice is:

- multiple image files
- ordered frame sequence
- one shared frame duration
- preview as an animation source
- continue into the existing ANI cursor editor

## Product Direction

Pointint should separate ANI creation into two stages:

1. Source maker
2. Cursor editor

The source maker answers: "What animation do you want to use?"

The cursor editor answers: "How should this animation behave as a Windows cursor?"

This keeps the current editor focused on cursor-specific controls:

- framing
- hotspot
- output size
- simulation
- Windows `.ani` export

## Selected Direction

### v1: GIF Maker

Expose `GIF Maker` as the first ANI source maker.

The user flow:

1. User selects an empty animated-capable slot.
2. User opens `Other methods` and chooses `GIF Maker`.
3. User uploads multiple PNG/JPG/WebP images.
4. Pointint sorts the files by filename.
5. Pointint shows a lightweight frame strip and animation preview.
6. User sets one shared frame duration.
7. User continues into the ANI cursor editor.
8. Existing framing, hotspot, size, name, simulation, current-slot download, and full-set ZIP flows continue to work.

### v2: Video to ANI

Add `Video to ANI` later on the same source-maker foundation.

The user flow will be:

1. Upload video.
2. Pick a short range.
3. Pick frame rate or frame count.
4. Convert to the same internal frame sequence.
5. Continue into the ANI cursor editor.

Video is deferred because it requires trim UI, sampling decisions, duration limits, and heavier file guardrails.

## Alternatives Considered

### Option A: Multiple PNG upload directly into the ANI editor

This is simple, but it hides the source-making concept. It also makes Video and AI animation harder to place later.

Rejected as too narrow.

### Option B: ANI Source Maker with GIF Maker first

This is the selected option. It gives multiple images a clear home, keeps cursor editing separate, and creates a reusable place for Video to ANI and AI animated sources later.

### Option C: Full Ezgif-style toolbox

This would include crop, optimize, effects, text, reverse, split, and many other utilities.

Rejected for v1. Pointint should not become a generic GIF editor.

## IA And UI Model

### Slot Empty State

The slot empty state should keep two primary cards:

- Static Image
- Animated GIF

The secondary source list should change from "Soon only" rows into actionable source methods as they ship:

- GIF Maker
- Video to ANI, later
- AI Generate, later

### GIF Maker Screen

The GIF Maker screen should be a compact preparatory step, not a separate product.

It should show:

- upload/drop area for multiple image frames
- sorted frame strip
- frame count
- shared frame duration
- total duration
- animation preview
- `Continue to cursor editor`

It should not show:

- per-frame hotspot
- per-frame crop
- text/effects
- advanced optimization
- timeline-grade editing

## Data Model

The internal direction should move from `GIF file only` to `FrameSequenceSource`.

Recommended shape:

```ts
type AniSourceKind = "gif" | "image-sequence";

type AniFrameSource = {
  file: File;
  url: string;
  durationMs: number;
};

type AniData = {
  sourceKind: AniSourceKind;
  originalFile?: File;
  originalUrl?: string;
  frames?: AniFrameSource[];
  sourceWidth: number;
  sourceHeight: number;
  hotspotX: number;
  hotspotY: number;
  fitMode: FitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
  cursorSize: CursorSize;
  cursorName: string;
};
```

The exact implementation can be refined, but the product rule should stay clear:

- GIF upload is one adapter.
- GIF Maker image sequence is another adapter.
- Both produce animated cursor editing state.

## Backend Direction

Add a sequence-based ANI route instead of forcing image sequences through GIF.

The backend should accept:

- multiple files named `frames`
- shared `duration_ms`
- shared cursor export settings

The backend should:

- validate at least 2 frames
- validate image content type
- sort frames by received order after the frontend has sorted by filename
- normalize each frame to RGBA
- pass frames into the existing `create_ani()` writer

This avoids lossy GIF conversion and preserves transparency better.

## Frontend Direction

The frontend should own:

- multiple-file selection
- filename sorting
- preview frame URLs
- source-maker UI state
- transition into `ani-editing`

The existing ANI editor should own:

- shared geometry
- hotspot
- output size
- simulation
- download

## Guardrails

v1 guardrails:

- Accept PNG, JPG, JPEG, WebP.
- Require at least 2 frames.
- Cap at a practical frame count, initially 60.
- Use one shared duration, default 100ms.
- Keep all frame geometry shared in the cursor editor.

Deferred:

- per-frame duration
- manual reorder
- frame deletion
- video trim
- FPS selection
- reverse / ping-pong
- optimization

## Testing

Minimum test coverage:

- `ani-multiple-pngs` / `GIF Maker` is selectable when exposed.
- Empty slot source list routes GIF Maker to a multi-image picker.
- Multiple image files are sorted by filename before source creation.
- GIF Maker enters `ani-editing` with `sourceKind = "image-sequence"`.
- Backend creates a valid `.ani` from multiple PNG frames.
- Full-set ZIP includes image-sequence ANI slots as `.ani`.

## Success Criteria

- A user can upload multiple image frames and turn them into an animated cursor without leaving Studio.
- The flow feels like a preparatory source step, not a separate editing app.
- Existing GIF ANI behavior remains unchanged.
- The foundation can support Video to ANI later without redesigning Studio entry again.

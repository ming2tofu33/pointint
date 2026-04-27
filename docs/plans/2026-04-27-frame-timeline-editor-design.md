# Frame Timeline Editor Design

> **Status:** approved direction
> **Date:** 2026-04-27
> **Scope:** Studio GIF Maker / image-sequence ANI editor follow-up

## Decision

Pointint should treat frame-by-frame editing as a core GIF Maker capability, not a later add-on.

The selected direction is:

- Support per-frame image adjustment from the first timeline editor slice.
- Keep hotspot global across the entire animated cursor.
- Use a global edit baseline plus per-frame overrides.
- Keep Video to GIF and per-frame background removal deferred.

This supersedes the earlier GIF Maker v1 assumption that all image-sequence geometry stays shared.

## Why This Direction

Animated cursor sources often have small frame-to-frame alignment differences. If Pointint only supports one shared scale and position, users can create an `.ani`, but they cannot correct jitter, bad framing, or one frame that sits off-center.

Frame-by-frame correction is therefore part of the core value. The guardrail is hotspot stability. If every frame can move the hotspot independently, the cursor click point can visibly jump while the animation plays. That is bad cursor behavior. Hotspot should remain one global cursor property until there is a strong advanced-use case for per-frame hotspot overrides.

## Product Model

The editor should have three layers:

- **Canvas:** shows the selected frame for precise editing.
- **Timeline:** shows all frames, playback, frame order, duration, and modified state.
- **Inspector:** edits either the global baseline or the selected frame override.

The user should always know:

- which frame is selected
- whether they are editing all frames or only the selected frame
- which frames have custom edits
- total frame count and total duration
- whether the output will be animated

## User Flow

1. User drops or selects two or more PNG/JPG/WebP files.
2. Files are sorted by filename and loaded as an image sequence.
3. Studio opens the ANI editor with a timeline visible below the canvas.
4. The first frame is selected.
5. The inspector defaults to `All frames` edit scope.
6. User can switch scope to `Selected frame`.
7. Changing framing, scale, or position in selected-frame scope creates an override on that frame.
8. The timeline marks edited frames.
9. User can play/pause the sequence preview and inspect whether alignment is stable.
10. Export renders every frame with its effective edit and writes one `.ani`.

## Editing Rules

### Global Properties

These stay global for the whole animated cursor:

- cursor name
- output size
- hotspot X
- hotspot Y
- hotspot mode

### Global Baseline

These values define the default frame edit:

- fit mode
- scale
- offset X
- offset Y

Frames without overrides use this baseline.

### Per-Frame Overrides

Each frame can override:

- fit mode
- scale
- offset X
- offset Y
- durationMs

Each frame should also store:

- stable id
- file
- object URL
- source width
- source height
- original filename

Recommended data shape:

```ts
type AniFrameEdit = {
  fitMode: FitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
};

type AniFrameData = {
  id: string;
  file: File;
  url: string;
  fileName: string;
  sourceWidth: number;
  sourceHeight: number;
  durationMs: number;
  editOverride: Partial<AniFrameEdit> | null;
};

type AniData = {
  sourceKind: "gif" | "image-sequence";
  frames: AniFrameData[];
  selectedFrameId: string | null;
  globalEdit: AniFrameEdit;
  hotspotX: number;
  hotspotY: number;
  hotspotMode: "auto" | "manual";
  cursorSize: CursorSize;
  cursorName: string;
};
```

The implementation can keep compatibility fields temporarily, but new timeline logic should move toward this model.

## UI Design

### Timeline

Place the timeline under the canvas, above the simulation footer.

The timeline should include:

- play/pause button
- frame count
- total duration
- compact frame thumbnails
- selected frame border
- modified dot or small badge
- duration label per frame
- delete frame action
- move previous / move next action

Drag reorder can come later. The first implementation should use explicit move buttons because it is easier to test, accessible, and less likely to break the editor layout.

### Inspector

Add an edit-scope segmented control:

- `All frames`
- `Selected frame`

When `All frames` is active:

- framing, scale, and position update the global baseline.
- selected-frame overrides are not automatically removed.

When `Selected frame` is active:

- framing, scale, and position write to that frame's override.
- show `Reset this frame` to remove the override.

Frame duration belongs to the selected frame because it is inherently frame-specific. A small `Apply duration to all` action can copy the selected frame's duration across the sequence.

### Canvas

The canvas edits the selected frame, not the entire sequence.

During playback:

- the canvas can show the playing frame as a preview.
- direct editing should pause playback before applying changes.

### Simulation

Simulation should use the rendered animated source when available.

For image sequences, the preview should not try to decode the first frame as a GIF. It should build a preview source from the frame list and effective edits.

## Export Direction

Use frontend rendering for per-frame geometry.

Before calling the backend sequence endpoint:

1. Resolve each frame's effective edit.
2. Rasterize each frame to a square PNG at the selected cursor size.
3. Send the rendered frame blobs to the sequence ANI endpoint.
4. Send global hotspot and per-frame durations.

This avoids making the backend understand per-frame scale, offset, and fit metadata. The backend remains responsible for packaging already-rendered frames into `.ani`.

The backend sequence API should support per-frame durations. If omitted, it can fall back to one shared duration for backward compatibility.

## Error Handling

The editor should guard:

- fewer than 2 frames
- unsupported file types
- images that fail dimension loading
- deleting down to fewer than 2 frames
- export when any frame render fails
- durations outside the allowed range

Recommended duration range:

- minimum: 20ms
- default: 100ms
- maximum: 2000ms

## Testing

Minimum coverage:

- multiple image drop enters image-sequence ANI state.
- frame IDs stay stable after reorder.
- selecting a frame changes canvas image and inspector values.
- selected-frame edits do not mutate global baseline.
- global edits affect unmodified frames.
- resetting a selected frame removes its override.
- deleting a frame updates selection and blocks deleting below 2 frames.
- export rasterizes every frame with its effective edit.
- image sequence preview uses the frame list, not GIF decoding.
- existing GIF upload still works.

## Deferred

Deferred from this slice:

- Video to GIF / Video to ANI
- drag-to-reorder timeline
- per-frame hotspot
- per-frame background removal
- transition effects
- reverse / ping-pong
- onion-skin alignment overlay

These can be added after the frame model is stable.

## Success Criteria

The feature is successful when a user can upload several images, correct one misaligned frame without disturbing the rest, play the sequence, and export a Windows `.ani` where the correction is reflected.


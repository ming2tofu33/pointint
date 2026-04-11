# Square Framing & Preview-Export Parity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the square editor preview the final cursor output, and let users choose in-editor framing between `전체 보이기` and `가득 채우기` with pan/zoom fine-tuning.

**Architecture:** Keep the uploaded image untouched, but introduce a single client-side framing pipeline that computes square render geometry from `fitMode + scale + offsetX + offsetY + outputSize`. Use that same geometry to draw the editor preview, generate the downloadable square PNG, feed simulation and health-check inputs, and remap hotspot coordinates into final export space. Keep the backend CUR API as a PNG-to-CUR safety net and add regression coverage for non-square input handling.

**Tech Stack:** Next.js 15, React 19, TypeScript, next-intl, FastAPI, Pillow, pytest

---

### Task 1: Add The Shared Framing Contract

**Files:**
- Create: `frontend/src/lib/cursorFrame.ts`
- Modify: `frontend/src/lib/useStudio.ts`
- Modify: `frontend/src/i18n/messages/en.json`
- Modify: `frontend/src/i18n/messages/ko.json`

**Step 1: Create the framing vocabulary and pure geometry helpers**

Add a new helper module with the shared contract:

```ts
export type FitMode = "contain" | "cover";

export interface FrameInput {
  sourceWidth: number;
  sourceHeight: number;
  viewportSize: number;
  fitMode: FitMode;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface FrameRect {
  drawWidth: number;
  drawHeight: number;
  drawX: number;
  drawY: number;
}

export function getFrameRect(input: FrameInput): FrameRect
export function mapViewportHotspotToOutput(...)
export async function rasterizeSquarePng(...)
```

Rules to lock in:
- `contain` = whole image visible inside the square
- `cover` = square fully filled, cropping allowed
- `scale` and offsets apply after the base fit calculation
- the helper is the only place allowed to compute draw rects

**Step 2: Extend studio state with framing mode**

Update `CursorData` and actions in `useStudio.ts`:

```ts
fitMode: FitMode;
sourceWidth: number;
sourceHeight: number;
```

Add:

```ts
const setFitMode = useCallback((fitMode: FitMode) => {
  setCursor((prev) => (prev ? { ...prev, fitMode } : null));
}, []);
```

Default:
- `fitMode: "contain"`
- keep `scale = 1`, `offsetX = 0`, `offsetY = 0`

**Step 3: Add user-facing labels**

Add copy under the existing `panel` namespace:

```json
"framing": "Framing",
"fitContain": "Show full image",
"fitCover": "Fill square",
"fitContainSub": "Keeps the whole image visible",
"fitCoverSub": "Fills the square and may crop edges"
```

Korean:

```json
"framing": "프레이밍",
"fitContain": "전체 보이기",
"fitCover": "가득 채우기",
"fitContainSub": "이미지가 전부 보이게 맞춥니다",
"fitCoverSub": "정사각형을 꽉 채우고 가장자리가 잘릴 수 있습니다"
```

**Step 4: Verify the state shape still compiles**

Run: `cd frontend && npm run build`

Expected:
- TypeScript/Next compile passes
- missing `fitMode` references are surfaced now, before UI wiring

**Step 5: Commit**

```bash
git add frontend/src/lib/useStudio.ts frontend/src/lib/cursorFrame.ts frontend/src/i18n/messages/en.json frontend/src/i18n/messages/ko.json
git commit -m "feat: add square framing state and geometry contract"
```

---

### Task 2: Make The Editor Preview The Real Square Output

**Files:**
- Modify: `frontend/src/app/studio/page.tsx`
- Modify: `frontend/src/components/CursorCanvas.tsx`
- Modify: `frontend/src/components/UploadZone.tsx`
- Modify: `frontend/src/components/Simulation.tsx`

**Step 1: Replace ad-hoc image sizing in the editor with shared geometry**

Update `CursorCanvas.tsx` so it no longer does:

```ts
width: `${CANVAS_SIZE * scale}px`,
height: `${CANVAS_SIZE * scale}px`,
objectFit: "contain",
```

Instead compute:

```ts
const frameRect = getFrameRect({
  sourceWidth,
  sourceHeight,
  viewportSize: CANVAS_SIZE,
  fitMode,
  scale,
  offsetX,
  offsetY,
});
```

And render:

```ts
left: `${frameRect.drawX}px`,
top: `${frameRect.drawY}px`,
width: `${frameRect.drawWidth}px`,
height: `${frameRect.drawHeight}px`,
```

**Step 2: Add framing controls to the right panel**

In `studio/page.tsx`, add a new `PanelSection` above scale/position:

```tsx
<PanelSection title={tp("framing")}>
  <FitModeButton ... mode="contain" />
  <FitModeButton ... mode="cover" />
</PanelSection>
```

Behavior:
- default highlight on `contain`
- switching mode preserves current scale/offset values
- user can still drag and zoom after switching

**Step 3: Make the static preview boxes honest**

`Simulation.tsx` currently forces:

```ts
objectFit: "contain"
```

Remove that hardcoded assumption and feed the already-rendered square preview URL into the preview boxes so the 32px thumbnails match export.

**Step 4: Keep upload UX unchanged**

Do not add an extra upload-time step. `UploadZone.tsx` stays simple; framing controls live only in the editor.

**Step 5: Verify in the browser**

Run: `cd frontend && npm run dev`

Manual check:
1. Upload a wide image, leave `전체 보이기`
2. Switch to `가득 채우기`
3. Drag and zoom in both modes
4. Confirm the large square editor is the source of truth for what the user sees

Expected:
- no extra upload step
- both modes update immediately
- drag/zoom feel identical in both modes

**Step 6: Commit**

```bash
git add frontend/src/app/studio/page.tsx frontend/src/components/CursorCanvas.tsx frontend/src/components/Simulation.tsx frontend/src/components/UploadZone.tsx
git commit -m "feat: add in-editor framing controls and square preview rendering"
```

---

### Task 3: Route Preview, Health Check, And Download Through One Rasterized Asset

**Files:**
- Modify: `frontend/src/lib/useStudio.ts`
- Modify: `frontend/src/components/HealthCheck.tsx`
- Modify: `frontend/src/components/Simulation.tsx`
- Modify: `frontend/src/lib/api.ts`

**Step 1: Generate a real square PNG from the shared helper**

In `useStudio.ts`, replace the current preview effect with a shared rasterization pass:

```ts
const renderResult = await rasterizeSquarePng({
  imageUrl: cursor.processedUrl,
  sourceWidth: cursor.width,
  sourceHeight: cursor.height,
  fitMode: cursor.fitMode,
  scale: cursor.scale,
  offsetX: cursor.offsetX,
  offsetY: cursor.offsetY,
  outputSize: cursor.cursorSize,
  hotspotX: cursor.hotspotX,
  hotspotY: cursor.hotspotY,
  editorViewportSize: 256,
});
```

Store:

```ts
previewUrl
renderedBlob
renderedHotspotX
renderedHotspotY
```

Important:
- `previewUrl` must now mean “final exported square PNG”
- stop using `processedBlob` directly for health/download once a rendered blob exists

**Step 2: Send the rasterized PNG to health check**

Update `HealthCheck` usage in `studio/page.tsx`:

```tsx
<HealthCheck
  imageBlob={cursor.renderedBlob}
  hotspotX={cursor.renderedHotspotX}
  hotspotY={cursor.renderedHotspotY}
/>
```

This ensures health diagnostics reflect the actual exported cursor, not the raw uploaded PNG.

**Step 3: Send the rasterized PNG to download**

Change the download call from:

```ts
generateCursor(cursor.processedBlob, cursor.hotspotX, cursor.hotspotY, ...)
```

to:

```ts
generateCursor(cursor.renderedBlob, cursor.renderedHotspotX, cursor.renderedHotspotY, ...)
```

This is the critical `preview = export` contract.

**Step 4: Keep simulation on the rendered square asset**

The interactive cursor preview should keep using:

```ts
imageUrl={previewUrl}
hotspotX={renderedHotspotX}
hotspotY={renderedHotspotY}
```

Never mix `processedUrl` and rendered preview again once editing starts.

**Step 5: Regression verify with browser QA**

Run: `cd frontend && npm run dev`

Manual checks:
1. Wide image + `전체 보이기`
2. Wide image + `가득 채우기`
3. Tall image + `전체 보이기`
4. Tall image + `가득 채우기`
5. In each case, compare editor square, actual-size preview, simulation, and downloaded cursor

Expected:
- all four views match the same framing
- hotspot click-feel matches the selected point
- changing cursor size to 32/48/64 preserves the same composition intent

**Step 6: Commit**

```bash
git add frontend/src/lib/useStudio.ts frontend/src/components/HealthCheck.tsx frontend/src/components/Simulation.tsx frontend/src/lib/api.ts
git commit -m "fix: make square preview the source of truth for export"
```

---

### Task 4: Add Backend Safety Tests For Non-Square Input And Hotspot Packing

**Files:**
- Modify: `backend/tests/test_api.py`

**Step 1: Add regression coverage for non-square PNG fallback**

Add tests like:

```python
@pytest.mark.anyio
async def test_generate_cursor_accepts_wide_png_and_outputs_square_cursor(client):
    png = _make_png(96, 48)
    res = await client.post(
        "/api/generate-cursor",
        files={"file": ("wide.png", png, "image/png")},
        data={"hotspot_x": "31", "hotspot_y": "12", "cursor_size": "32"},
    )
    assert res.status_code == 200
```

Also inspect the `.cur` payload width/height fields and ensure one cursor entry is still emitted.

**Step 2: Add hotspot clamping coverage**

Add:

```python
@pytest.mark.anyio
async def test_generate_cursor_clamps_out_of_range_hotspot(client):
    png = _make_png(48, 96)
    res = await client.post(
        "/api/generate-cursor",
        files={"file": ("tall.png", png, "image/png")},
        data={"hotspot_x": "999", "hotspot_y": "999", "cursor_size": "32"},
    )
    ...
    assert hx == 31
    assert hy == 31
```

**Step 3: Run the backend suite**

Run: `cd backend && .\.venv\Scripts\python -m pytest tests/test_api.py -v`

Expected:
- all existing API tests still pass
- the new non-square/hotspot tests pass

**Step 4: Optional lint pass**

Run: `cd backend && .\.venv\Scripts\python -m ruff check app tests`

Expected:
- no import/order regressions

**Step 5: Commit**

```bash
git add backend/tests/test_api.py
git commit -m "test: cover non-square cursor export safety"
```

---

### Task 5: Sync Sprint, Decision, And Plan Follow-Up Documents

**Files:**
- Modify: `point/06-Implementation/ACTIVE_SPRINT.md`
- Modify: `point/10-Journal/QUICK-DECISIONS.md`
- Modify: `point/06-Implementation/plans/Plans-Index.md`

**Step 1: Reflect the shipped landing status**

Update `ACTIVE_SPRINT.md` so `P1-LANDING-01` is no longer shown as the current unimplemented blocker if the code and verification now justify `done`.

**Step 2: Add the new framing/parity work as the active editor confidence task**

Suggested task label:

```text
P1-EDITOR-03 — square framing choice + preview/export parity
```

Track:
- default `contain`
- user-selectable `cover`
- shared render pipeline
- hotspot parity

**Step 3: Append the decision**

In `QUICK-DECISIONS.md`, append an entry that locks in:
- editor square preview is the final source of truth
- framing choice lives in the editor, not upload flow
- default is `전체 보이기`
- `preview = export` is a hard requirement

**Step 4: Register this plan in the index**

Add this new plan to `Plans-Index.md` quick links so future sprint sync can find it quickly.

**Step 5: Verify the docs read cleanly**

Run:

```bash
Get-Content -Encoding utf8 point/06-Implementation/ACTIVE_SPRINT.md
Get-Content -Encoding utf8 point/10-Journal/QUICK-DECISIONS.md
Get-Content -Encoding utf8 point/06-Implementation/plans/Plans-Index.md
```

Expected:
- task names and priorities are internally consistent
- no stale references to landing being “미구현” if it has shipped
- the plan index links to this document

**Step 6: Commit**

```bash
git add point/06-Implementation/ACTIVE_SPRINT.md point/10-Journal/QUICK-DECISIONS.md point/06-Implementation/plans/Plans-Index.md
git commit -m "docs: sync framing plan and sprint follow-up"
```

---

## Manual QA Checklist

- Wide image in `전체 보이기`: no cropping, transparent padding visible, download matches editor
- Wide image in `가득 채우기`: horizontal crop allowed, download matches editor
- Tall image in `전체 보이기`: no cropping, transparent side padding visible, download matches editor
- Tall image in `가득 채우기`: vertical crop allowed, download matches editor
- Hotspot selected near a visible tip remains correct after download
- Switching 32 / 48 / 64 keeps the same composition intent
- Health check warnings change based on the rendered square output, not the raw upload

## Notes

- Do **not** add an extra upload-time decision step.
- Do **not** send raw `offsetX/offsetY/scale` to the backend and re-implement framing there in this change.
- Do **not** mark this work `done` unless the editor square, simulation, and downloaded `.cur` visibly match.

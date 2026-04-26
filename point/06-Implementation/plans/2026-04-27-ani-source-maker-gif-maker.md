# ANI Source Maker / GIF Maker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Studio ANI source-making step that lets users upload multiple image frames, preview them as an animation source, and continue into the existing ANI cursor editor.

**Architecture:** Add an `image-sequence` ANI source path alongside the existing GIF upload path. The frontend owns multi-file selection, filename sorting, lightweight source preview, and transition into `ani-editing`; the backend owns sequence-to-ANI export without converting frames through GIF.

**Tech Stack:** Next.js App Router, React, TypeScript, next-intl, Vitest, FastAPI, Python, Pillow, Pytest

---

### Task 1: Lock source-maker workflow metadata

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\studioWorkflow.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\en.json`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\i18n\messages\ko.json`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\slot-simulation-sources.test.ts`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Write the failing test**

Add expectations that:

- `ani-multiple-pngs` is no longer just a disabled `Soon` item.
- the user-facing label is `GIF Maker` in English.
- the Korean label is clear that multiple images make an animation.
- `ani-ai-generate` remains `Soon`.

**Step 2: Run test to verify it fails**

Run:

```bash
cd frontend
npm test -- tests/studio/studio-entry-gate.test.tsx
```

Expected: FAIL because the secondary option still renders as `Soon`.

**Step 3: Write minimal implementation**

Update workflow/source metadata so `ani-multiple-pngs` becomes the first source-maker action while AI remains deferred.

**Step 4: Run test to verify it passes**

Run:

```bash
cd frontend
npm test -- tests/studio/studio-entry-gate.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/lib/studioWorkflow.ts frontend/src/i18n/messages/en.json frontend/src/i18n/messages/ko.json frontend/tests/studio/studio-entry-gate.test.tsx
git commit -m "feat(studio): expose gif maker source option"
```

### Task 2: Add backend image-sequence ANI service

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\backend\app\services\ani.py`
- Test: `C:\Users\amy\Desktop\pointint\backend\tests\test_ani.py`

**Step 1: Write the failing test**

Add tests for:

- creating `.ani` from two PNG image bytes
- rejecting fewer than two frames
- rejecting unsupported image bytes

Example expectation:

```python
ani = image_sequence_to_ani_bytes([png_a, png_b], duration_ms=100)
assert ani[:4] == b"RIFF"
assert ani[8:12] == b"ACON"
assert ani.count(b"icon") == 2
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd backend
.venv\Scripts\python.exe -m pytest tests/test_ani.py -v
```

Expected: FAIL because `image_sequence_to_ani_bytes` does not exist.

**Step 3: Write minimal implementation**

Add a helper that:

- accepts `list[bytes]`
- opens each frame with Pillow
- converts each frame to RGBA
- applies one shared duration
- calls existing `create_ani()`

**Step 4: Run test to verify it passes**

Run:

```bash
cd backend
.venv\Scripts\python.exe -m pytest tests/test_ani.py -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add backend/app/services/ani.py backend/tests/test_ani.py
git commit -m "feat(backend): create ani from image sequence"
```

### Task 3: Add backend image-sequence API route

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\backend\app\api\ani.py`
- Test: `C:\Users\amy\Desktop\pointint\backend\tests\test_ani.py`

**Step 1: Write the failing test**

Add API coverage for:

- `POST /api/generate-ani-sequence` with two PNG files returns ANI bytes
- one frame returns `400`
- non-image frame returns `400`

**Step 2: Run test to verify it fails**

Run:

```bash
cd backend
.venv\Scripts\python.exe -m pytest tests/test_ani.py -k sequence -v
```

Expected: FAIL because the route does not exist.

**Step 3: Write minimal implementation**

Add a route that accepts:

- `frames: list[UploadFile]`
- `duration_ms`
- `hotspot_x`
- `hotspot_y`
- `cursor_size`
- `cursor_name`
- `fit_mode`
- `scale`
- `offset_x`
- `offset_y`

Then call `image_sequence_to_ani_bytes()`.

**Step 4: Run test to verify it passes**

Run:

```bash
cd backend
.venv\Scripts\python.exe -m pytest tests/test_ani.py -k sequence -v
```

Expected: PASS.

**Step 5: Commit**

```bash
git add backend/app/api/ani.py backend/tests/test_ani.py
git commit -m "feat(backend): add image sequence ani api"
```

### Task 4: Add frontend API client for image-sequence ANI

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\api.ts`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\lib\api.test.ts`

**Step 1: Write the failing test**

Add a test that `generateAniSequence()`:

- posts files under the `frames` field
- sends shared duration and cursor settings
- parses the binary response like `generateAni()`

**Step 2: Run test to verify it fails**

Run:

```bash
cd frontend
npm test -- tests/lib/api.test.ts
```

Expected: FAIL because `generateAniSequence()` does not exist.

**Step 3: Write minimal implementation**

Add `generateAniSequence(files, input)` beside `generateAni()`.

**Step 4: Run test to verify it passes**

Run:

```bash
cd frontend
npm test -- tests/lib/api.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/lib/api.ts frontend/tests/lib/api.test.ts
git commit -m "feat(frontend): add image sequence ani client"
```

### Task 5: Add GIF Maker source state to `useStudio`

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-workflow.test.tsx`

**Step 1: Write the failing test**

Add tests that:

- selecting multiple image files sorts by filename
- source enters `ani-editing`
- `ani.sourceKind` is `image-sequence`
- `ani.frames` contains object URLs for all frames
- existing GIF upload still sets `sourceKind = "gif"`

**Step 2: Run test to verify it fails**

Run:

```bash
cd frontend
npm test -- tests/studio/use-studio-workflow.test.tsx
```

Expected: FAIL because image sequence state does not exist.

**Step 3: Write minimal implementation**

Extend `AniData` and add:

- `createAniFromImageSequenceFiles()`
- `selectSelectedSlotImageSequenceFiles(files)`
- URL cleanup for frame URLs
- slot state commit using the first frame as preview

**Step 4: Run test to verify it passes**

Run:

```bash
cd frontend
npm test -- tests/studio/use-studio-workflow.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/lib/useStudio.ts frontend/tests/studio/use-studio-workflow.test.tsx
git commit -m "feat(studio): add image sequence ani state"
```

### Task 6: Build GIF Maker source UI

**Files:**
- Create: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniSourceMaker.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\StudioSlotEmptyState.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\components\AniEditorShell.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\components\slot-rail.test.tsx`
- Test: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\studio-entry-gate.test.tsx`

**Step 1: Write the failing test**

Add tests that:

- secondary option exposes `GIF Maker`
- clicking it opens a multi-image file picker path
- uploaded frames render a source-maker preview summary
- user can continue into the ANI editor

**Step 2: Run test to verify it fails**

Run:

```bash
cd frontend
npm test -- tests/studio/studio-entry-gate.test.tsx
```

Expected: FAIL because no source-maker UI exists.

**Step 3: Write minimal implementation**

Add a compact source maker with:

- multi-file upload/drop
- frame count
- shared duration field
- total duration
- sorted frame strip
- continue action

**Step 4: Run test to verify it passes**

Run:

```bash
cd frontend
npm test -- tests/studio/studio-entry-gate.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/components/AniSourceMaker.tsx frontend/src/components/StudioSlotEmptyState.tsx frontend/src/components/AniEditorShell.tsx frontend/tests/studio/studio-entry-gate.test.tsx
git commit -m "feat(studio): add gif maker source UI"
```

### Task 7: Wire image-sequence export

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\frontend\src\lib\useStudio.ts`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\studio\use-studio-workflow.test.tsx`
- Modify: `C:\Users\amy\Desktop\pointint\frontend\tests\lib\studio-download.test.ts`

**Step 1: Write the failing test**

Add tests that:

- current-slot download uses `generateAniSequence()` for image-sequence sources
- full-set ZIP includes image-sequence slots as `.ani`
- GIF sources still use `generateAni()`

**Step 2: Run test to verify it fails**

Run:

```bash
cd frontend
npm test -- tests/studio/use-studio-workflow.test.tsx tests/lib/studio-download.test.ts
```

Expected: FAIL because image-sequence export is not wired.

**Step 3: Write minimal implementation**

Update `createAniExportDownload()` to branch on `ani.sourceKind`.

**Step 4: Run test to verify it passes**

Run:

```bash
cd frontend
npm test -- tests/studio/use-studio-workflow.test.tsx tests/lib/studio-download.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/lib/useStudio.ts frontend/tests/studio/use-studio-workflow.test.tsx frontend/tests/lib/studio-download.test.ts
git commit -m "feat(studio): export gif maker image sequences"
```

### Task 8: Verification and sprint sync

**Files:**
- Modify: `C:\Users\amy\Desktop\pointint\point\06-Implementation\ACTIVE_SPRINT.md`
- Modify: `C:\Users\amy\Desktop\pointint\point\10-Journal\QUICK-DECISIONS.md` if this feature changes the official phase decision

**Step 1: Run backend tests**

Run:

```bash
cd backend
.venv\Scripts\python.exe -m pytest tests/test_ani.py -v
```

Expected: PASS.

**Step 2: Run frontend tests**

Run:

```bash
cd frontend
npm test
```

Expected: PASS.

**Step 3: Run build if the feature touches app shell**

Run:

```bash
cd frontend
npm run build
```

Expected: PASS.

**Step 4: Sync docs**

Update sprint state:

- `ANI-SOURCE-01` complete if implemented
- `Video to ANI` queued
- `BG-FT-01` remains option
- `WIN-INSTALLER-EXE-01` remains deferred option

**Step 5: Commit**

```bash
git add point/06-Implementation/ACTIVE_SPRINT.md point/10-Journal/QUICK-DECISIONS.md
git commit -m "docs(point): close gif maker source slice"
```

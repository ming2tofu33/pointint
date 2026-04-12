# ANI v1 GIF-to-ANI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship the first animated cursor slice by accepting an animated GIF, applying one shared edit model across all frames, previewing the result, and exporting a Windows `.ani`.

**Architecture:** Add a reusable `FrameSequenceSource` core, then connect a `GIF -> FrameSequenceSource` adapter to a backend ANI writer. Reuse the existing static editor contract in the frontend so ANI starts with shared framing/hotspot controls instead of frame-level editing.

**Tech Stack:** Next.js, React, TypeScript, FastAPI, Python image/binary processing, Vitest, Pytest

---

### Task 1: Lock Phase 1.5 scope and execution contract

**Files:**
- Modify: `point/06-Implementation/ACTIVE_SPRINT.md`
- Modify: `point/06-Implementation/Phase-Flow.md`
- Modify: `point/10-Journal/QUICK-DECISIONS.md`

**Step 1: Write the failing doc expectation**

Add the official next slice wording:

- `ANI v1 = GIF input only`
- internal model is `FrameSequenceSource`
- `video` and `multiple PNGs` are deferred

**Step 2: Verify docs do not say this yet**

Run:

```bash
git diff -- point/06-Implementation/ACTIVE_SPRINT.md point/06-Implementation/Phase-Flow.md point/10-Journal/QUICK-DECISIONS.md
```

Expected: no committed wording for the GIF-first ANI slice

**Step 3: Write minimal doc updates**

Add the decision without expanding scope beyond `ANI v1`.

**Step 4: Re-read docs**

Run:

```bash
Get-Content point/06-Implementation/ACTIVE_SPRINT.md
```

Expected: `P1-MOCKUP-01` is deferred or skipped, and `Phase 1.5` references `GIF -> ANI` as the first slice.

**Step 5: Commit**

```bash
git add point/06-Implementation/ACTIVE_SPRINT.md point/06-Implementation/Phase-Flow.md point/10-Journal/QUICK-DECISIONS.md
git commit -m "docs(point): define ani v1 gif-first scope"
```

### Task 2: Add backend ANI writer tests

**Files:**
- Create: `backend/tests/test_ani_writer.py`
- Modify: `backend/app/services/` (ANI writer module path to be added)

**Step 1: Write the failing test**

Add tests for:

- writing a minimal `.ani` from a tiny synthetic frame sequence succeeds
- invalid empty frame sequence raises a clear error

Use a tiny in-memory frame list with deterministic dimensions.

**Step 2: Run test to verify it fails**

Run:

```bash
cd backend
.venv\\Scripts\\python.exe -m pytest tests/test_ani_writer.py -v
```

Expected: FAIL because ANI writer does not exist yet.

**Step 3: Write minimal implementation**

Add a new backend service module that:

- accepts a normalized frame sequence
- validates dimensions and frame count
- writes a basic animated cursor binary

**Step 4: Run test to verify it passes**

Run:

```bash
cd backend
.venv\\Scripts\\python.exe -m pytest tests/test_ani_writer.py -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/services backend/tests/test_ani_writer.py
git commit -m "feat(backend): add ani writer"
```

### Task 3: Add GIF-to-frame-sequence backend adapter tests

**Files:**
- Create: `backend/tests/test_gif_frames.py`
- Modify: `backend/app/services/` (GIF decode / normalization module path to be added)

**Step 1: Write the failing test**

Add tests for:

- GIF decode returns ordered frames and durations
- empty or invalid GIF fails cleanly
- frame-count cap truncates deterministically

Use a tiny synthetic or fixture GIF with known frame timing.

**Step 2: Run test to verify it fails**

Run:

```bash
cd backend
.venv\\Scripts\\python.exe -m pytest tests/test_gif_frames.py -v
```

Expected: FAIL because GIF adapter does not exist yet.

**Step 3: Write minimal implementation**

Add a decoder that converts GIF input into `FrameSequenceSource`-like data:

- RGBA frames
- per-frame duration
- bounded frame count

**Step 4: Run test to verify it passes**

Run:

```bash
cd backend
.venv\\Scripts\\python.exe -m pytest tests/test_gif_frames.py -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/services backend/tests/test_gif_frames.py
git commit -m "feat(backend): add gif frame adapter"
```

### Task 4: Add ANI API route tests

**Files:**
- Modify: `backend/tests/test_api.py`
- Modify: `backend/app/api/`
- Modify: `backend/app/main.py` if new route registration is required

**Step 1: Write the failing test**

Add API coverage for:

- uploading a GIF returns downloadable ANI payload
- invalid GIF returns a 4xx validation error

**Step 2: Run test to verify it fails**

Run:

```bash
cd backend
.venv\\Scripts\\python.exe -m pytest tests/test_api.py -k ani -v
```

Expected: FAIL because ANI API route does not exist yet.

**Step 3: Write minimal implementation**

Expose a route that:

- accepts GIF upload
- decodes to frame sequence
- applies shared export settings
- returns `.ani`

**Step 4: Run test to verify it passes**

Run:

```bash
cd backend
.venv\\Scripts\\python.exe -m pytest tests/test_api.py -k ani -v
```

Expected: PASS

**Step 5: Commit**

```bash
git add backend/app/api backend/tests/test_api.py
git commit -m "feat(backend): add gif-to-ani api"
```

### Task 5: Make ANI GIF workflow selectable in the frontend

**Files:**
- Modify: `frontend/src/lib/studioWorkflow.ts`
- Modify: `frontend/src/components/WorkflowPicker.tsx`
- Modify: `frontend/src/i18n/messages/en.json`
- Modify: `frontend/src/i18n/messages/ko.json`
- Modify: `frontend/tests/studio/studio-entry-gate.test.tsx`

**Step 1: Write the failing test**

Add a test expecting:

- `ANI > Animated GIF` is selectable
- other ANI options remain `Soon`

**Step 2: Run test to verify it fails**

Run:

```bash
cd frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
```

Expected: FAIL because ANI GIF is still disabled.

**Step 3: Write minimal implementation**

Update workflow metadata so only the GIF ANI path becomes active.

**Step 4: Run test to verify it passes**

Run:

```bash
cd frontend
npm exec vitest run tests/studio/studio-entry-gate.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/lib/studioWorkflow.ts frontend/src/components/WorkflowPicker.tsx frontend/src/i18n/messages/en.json frontend/src/i18n/messages/ko.json frontend/tests/studio/studio-entry-gate.test.tsx
git commit -m "feat(frontend): enable ani gif workflow"
```

### Task 6: Add ANI upload state and failing preview-shell tests

**Files:**
- Modify: `frontend/src/lib/useStudio.ts`
- Modify: `frontend/src/app/studio/page.tsx`
- Create: `frontend/tests/studio/ani-workflow.test.tsx`

**Step 1: Write the failing test**

Add tests for:

- selecting ANI GIF workflow shows GIF upload flow
- successful GIF ingest enters ANI editing state
- shared hotspot and framing controls render in ANI editing

**Step 2: Run test to verify it fails**

Run:

```bash
cd frontend
npm exec vitest run tests/studio/ani-workflow.test.tsx
```

Expected: FAIL because ANI editor state does not exist yet.

**Step 3: Write minimal implementation**

Extend studio state to support:

- ANI GIF upload
- ANI editing mode
- shared transform/hotspot state

Do not add frame-level editing.

**Step 4: Run test to verify it passes**

Run:

```bash
cd frontend
npm exec vitest run tests/studio/ani-workflow.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/lib/useStudio.ts frontend/src/app/studio/page.tsx frontend/tests/studio/ani-workflow.test.tsx
git commit -m "feat(frontend): add ani gif editor shell"
```

### Task 7: Add ANI preview and export wiring

**Files:**
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/lib/useStudio.ts`
- Modify: `frontend/src/app/studio/page.tsx`
- Modify: `frontend/tests/studio/analytics-events.test.tsx`
- Modify: `frontend/tests/studio/ani-workflow.test.tsx`

**Step 1: Write the failing test**

Add tests for:

- ANI preview playback shell renders
- ANI download calls the ANI API path
- analytics/download events still fire on completion

**Step 2: Run test to verify it fails**

Run:

```bash
cd frontend
npm exec vitest run tests/studio/ani-workflow.test.tsx tests/studio/analytics-events.test.tsx
```

Expected: FAIL because ANI API wiring and preview state do not exist yet.

**Step 3: Write minimal implementation**

Connect frontend ANI state to the backend ANI export path and render a basic playback preview.

**Step 4: Run test to verify it passes**

Run:

```bash
cd frontend
npm exec vitest run tests/studio/ani-workflow.test.tsx tests/studio/analytics-events.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/lib/api.ts frontend/src/lib/useStudio.ts frontend/src/app/studio/page.tsx frontend/tests/studio/ani-workflow.test.tsx frontend/tests/studio/analytics-events.test.tsx
git commit -m "feat(frontend): wire gif-to-ani export"
```

### Task 8: Run end-to-end verification and sync docs

**Files:**
- Modify: `point/06-Implementation/ACTIVE_SPRINT.md`
- Modify: `point/10-Journal/QUICK-DECISIONS.md`
- Optionally modify: `point/06-Implementation/Phase-Flow.md`

**Step 1: Run focused backend tests**

Run:

```bash
cd backend
.venv\\Scripts\\python.exe -m pytest tests/test_ani_writer.py tests/test_gif_frames.py tests/test_api.py -k ani -v
```

Expected: PASS

**Step 2: Run focused frontend tests**

Run:

```bash
cd frontend
npm exec vitest run tests/studio/ani-workflow.test.tsx tests/studio/studio-entry-gate.test.tsx tests/studio/analytics-events.test.tsx
```

Expected: PASS

**Step 3: Run frontend build**

Run:

```bash
cd frontend
npm run build
```

Expected: PASS

**Step 4: Sync docs**

Record:

- `Phase 1.5` is active
- ANI v1 is GIF-first
- deferred items remain video, PNG sequence, and frame-level tools

**Step 5: Commit**

```bash
git add point/06-Implementation/ACTIVE_SPRINT.md point/10-Journal/QUICK-DECISIONS.md point/06-Implementation/Phase-Flow.md
git commit -m "docs(point): mark ani v1 gif slice active"
```

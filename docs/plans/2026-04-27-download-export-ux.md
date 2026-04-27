# Download Export UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Studio downloads clearly distinguish single cursor files, full Windows ZIP packages, and editable GIF exports.

**Architecture:** Keep the Studio bar as the primary download surface, but make labels and post-download guidance depend on export type. Add a backend GIF sequence endpoint because browsers do not provide native GIF encoding and the existing backend already owns sequence conversion.

**Tech Stack:** Next.js 15, React 19, next-intl, Vitest, FastAPI, Pillow, pytest.

---

### Task 1: Guide Modal Variants

**Files:**
- Modify: `frontend/src/components/GuideModal.tsx`
- Modify: `frontend/src/lib/useStudio.ts`
- Modify: `frontend/src/app/studio/page.tsx`
- Test: `frontend/tests/studio/studio-entry-gate.test.tsx`
- Test: `frontend/tests/studio/use-studio-workflow.test.tsx`

**Steps:**
- Write failing tests that single `.cur` and `.ani` downloads open single-file guidance, while full-set download opens ZIP/install guidance.
- Add a `downloadGuideVariant` state with `package`, `cur`, and `ani`.
- Pass the variant into `GuideModal`.
- Keep restore/default instructions only on the full package variant.

### Task 2: Download Labels

**Files:**
- Modify: `frontend/src/app/studio/page.tsx`
- Modify: `frontend/src/i18n/messages/en.json`
- Modify: `frontend/src/i18n/messages/ko.json`
- Test: `frontend/tests/studio/studio-entry-gate.test.tsx`

**Steps:**
- Write failing tests for user-facing labels: Windows cursor set, Windows cursor, Windows animated cursor.
- Update both English and Korean messages.
- Keep the labels format-aware and avoid ambiguous “selected cursor” wording.

### Task 3: GIF Sequence Export

**Files:**
- Modify: `backend/app/services/ani.py`
- Modify: `backend/app/api/ani.py`
- Modify: `backend/tests/test_ani.py`
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/lib/useStudio.ts`
- Test: `frontend/tests/lib/api.test.ts`
- Test: `frontend/tests/studio/use-studio-workflow.test.tsx`

**Steps:**
- Write failing backend tests for `image_sequence_to_gif_bytes` and `/api/generate-gif-sequence`.
- Write failing frontend tests that image-sequence GIF export sends frame durations and downloads `.gif`.
- Implement GIF generation with Pillow using uploaded sequence frames and per-frame durations.
- Add a secondary export action from Studio state for image sequences only.

### Task 4: Download Failure Copy

**Files:**
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/lib/useStudio.ts`
- Test: `frontend/tests/lib/api.test.ts`
- Test: `frontend/tests/studio/use-studio-workflow.test.tsx`

**Steps:**
- Write failing tests for network failure and missing endpoint copy.
- Add typed download error normalization.
- Use Korean/English messages where the UI has access to translations; keep hook fallback messages clear.

### Verification

Run:

```bash
npm test -- tests/studio/studio-entry-gate.test.tsx tests/studio/use-studio-workflow.test.tsx tests/lib/api.test.ts
backend\.venv\Scripts\python.exe -m pytest tests\test_ani.py -q
npm run build
```

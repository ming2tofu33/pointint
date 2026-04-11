# Studio Workflow Picker (CUR/ANI) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a workflow picker inside `/studio` so users choose what they want to make first, with `CUR > Static Image` available now and `ANI` paths visible but disabled as `Soon`.

**Architecture:** Keep everything inside the existing `studio` route. Replace the current single `idle` upload state with a small entry flow: `workflow-pick -> cur-upload -> uploaded -> processing -> editing`. Model the available/soon workflow options in one shared module so the picker UI, hook state, and future ANI work all read from the same source of truth. Preserve the existing CUR upload, background-removal choice, editor, simulation, and download pipeline unchanged once the user enters the CUR path.

**Tech Stack:** Next.js 15, React 19, TypeScript, next-intl, Vitest, Testing Library

---

### Task 1: Add The Studio Workflow Contract

**Files:**
- Create: `frontend/src/lib/studioWorkflow.ts`
- Modify: `frontend/src/lib/useStudio.ts`
- Modify: `frontend/src/i18n/messages/en.json`
- Modify: `frontend/src/i18n/messages/ko.json`
- Test: `frontend/tests/studio/use-studio-workflow.test.tsx`

**Step 1: Write the failing state-transition test**

Create a focused hook test that locks the new entry flow:

```tsx
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useStudio } from "@/lib/useStudio";

describe("useStudio workflow entry", () => {
  it("starts in workflow-pick, enters cur-upload, then resets back", () => {
    const { result } = renderHook(() => useStudio());

    expect(result.current.state).toBe("workflow-pick");

    act(() => {
      result.current.selectWorkflow("cur-static-image");
    });

    expect(result.current.state).toBe("cur-upload");

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toBe("workflow-pick");
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `cd frontend && npm run test -- tests/studio/use-studio-workflow.test.tsx`

Expected:
- FAIL because `workflow-pick`, `cur-upload`, and `selectWorkflow` do not exist yet

**Step 3: Add the workflow metadata and hook transitions**

Create a shared workflow module:

```ts
export type WorkflowFamily = "cur" | "ani";
export type WorkflowOptionId =
  | "cur-static-image"
  | "ani-animated-gif"
  | "ani-multiple-pngs"
  | "ani-ai-generate";
export type WorkflowAvailability = "available" | "soon";

export interface WorkflowOption {
  id: WorkflowOptionId;
  family: WorkflowFamily;
  titleKey: string;
  descriptionKey: string;
  availability: WorkflowAvailability;
}

export const WORKFLOW_OPTIONS: WorkflowOption[] = [
  {
    id: "cur-static-image",
    family: "cur",
    titleKey: "curStaticImage",
    descriptionKey: "curStaticImageSub",
    availability: "available",
  },
  {
    id: "ani-animated-gif",
    family: "ani",
    titleKey: "aniAnimatedGif",
    descriptionKey: "aniAnimatedGifSub",
    availability: "soon",
  },
  {
    id: "ani-multiple-pngs",
    family: "ani",
    titleKey: "aniMultiplePngs",
    descriptionKey: "aniMultiplePngsSub",
    availability: "soon",
  },
  {
    id: "ani-ai-generate",
    family: "ani",
    titleKey: "aniAiGenerate",
    descriptionKey: "aniAiGenerateSub",
    availability: "soon",
  },
];
```

In `useStudio.ts`:

```ts
export type StudioState =
  | "workflow-pick"
  | "cur-upload"
  | "uploaded"
  | "processing"
  | "editing";

const [state, setState] = useState<StudioState>("workflow-pick");

const selectWorkflow = useCallback((workflowId: WorkflowOptionId) => {
  if (workflowId === "cur-static-image") {
    setError(null);
    setState("cur-upload");
  }
}, []);
```

Keep these rules:
- `selectFile(file)` still jumps straight to `uploaded`
- landing handoff still works because it already calls `selectFile(file)`
- `reset()` must always return to `workflow-pick`

Add translation keys under `upload`:

```json
"workflowTitle": "Choose what to make",
"workflowSub": "Start with the output you want. More ANI paths will open here later.",
"curGroup": "CUR",
"aniGroup": "ANI",
"curStaticImage": "Static Image",
"curStaticImageSub": "Upload a single image and turn it into a Windows cursor",
"aniAnimatedGif": "Animated GIF",
"aniAnimatedGifSub": "Turn a GIF into an animated Windows cursor",
"aniMultiplePngs": "Multiple PNGs",
"aniMultiplePngsSub": "Assemble frame-by-frame cursor animation from separate images",
"aniAiGenerate": "AI Generate",
"aniAiGenerateSub": "Generate animated cursor frames with AI",
"available": "Available",
"soon": "Soon"
```

**Step 4: Run the test to verify it passes**

Run: `cd frontend && npm run test -- tests/studio/use-studio-workflow.test.tsx`

Expected:
- PASS

**Step 5: Commit**

```bash
git add frontend/src/lib/studioWorkflow.ts frontend/src/lib/useStudio.ts frontend/src/i18n/messages/en.json frontend/src/i18n/messages/ko.json frontend/tests/studio/use-studio-workflow.test.tsx
git commit -m "feat: add studio workflow entry state"
```

---

### Task 2: Build The Workflow Picker UI

**Files:**
- Create: `frontend/src/components/WorkflowPicker.tsx`
- Test: `frontend/tests/studio/workflow-picker.test.tsx`

**Step 1: Write the failing component test**

Render the picker with translations and assert the structure:

```tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import WorkflowPicker from "@/components/WorkflowPicker";

describe("WorkflowPicker", () => {
  it("renders CUR and ANI groups and disables soon cards", () => {
    const onSelect = vi.fn();

    render(
      <NextIntlClientProvider locale="en" messages={{ upload: {/* test copy */} }}>
        <WorkflowPicker onSelect={onSelect} />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("CUR")).toBeInTheDocument();
    expect(screen.getByText("ANI")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Static Image/i })
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /Animated GIF/i })
    ).toBeDisabled();
    expect(screen.getAllByText("Soon").length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `cd frontend && npm run test -- tests/studio/workflow-picker.test.tsx`

Expected:
- FAIL because `WorkflowPicker` does not exist yet

**Step 3: Write the minimal picker component**

Build a presentational component that groups cards by family:

```tsx
export default function WorkflowPicker({
  onSelect,
}: {
  onSelect: (workflowId: WorkflowOptionId) => void;
}) {
  const t = useTranslations("upload");

  return (
    <section>
      <h1>{t("workflowTitle")}</h1>
      <p>{t("workflowSub")}</p>

      <WorkflowGroup
        title={t("curGroup")}
        options={WORKFLOW_OPTIONS.filter((option) => option.family === "cur")}
        onSelect={onSelect}
      />
      <WorkflowGroup
        title={t("aniGroup")}
        options={WORKFLOW_OPTIONS.filter((option) => option.family === "ani")}
        onSelect={onSelect}
      />
    </section>
  );
}
```

Card rules:
- available card = real `<button>` with active hover/click styling
- soon card = disabled `<button disabled aria-disabled="true">`
- show `Available` or `Soon` badge inline on every card
- no hidden navigation or modal for soon cards

**Step 4: Run the test to verify it passes**

Run: `cd frontend && npm run test -- tests/studio/workflow-picker.test.tsx`

Expected:
- PASS

**Step 5: Commit**

```bash
git add frontend/src/components/WorkflowPicker.tsx frontend/tests/studio/workflow-picker.test.tsx
git commit -m "feat: add studio workflow picker"
```

---

### Task 3: Wire `/studio` To The New Entry Flow

**Files:**
- Modify: `frontend/src/app/studio/page.tsx`
- Modify: `frontend/src/components/UploadZone.tsx`
- Test: `frontend/tests/studio/studio-entry-gate.test.tsx`

**Step 1: Write the failing page-gate test**

Mock the router hooks, render `StudioPage`, and assert the idle gate:

```tsx
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("StudioPage entry flow", () => {
  it("shows workflow picker before upload and moves into the upload path", async () => {
    renderWithIntl(<StudioPage />);

    expect(screen.getByText("Choose what to make")).toBeInTheDocument();
    expect(screen.queryByText("Drop image or click to upload")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Static Image/i }));

    expect(screen.getByText("Drop image or click to upload")).toBeInTheDocument();
  });
});
```

**Step 2: Run the test to verify it fails**

Run: `cd frontend && npm run test -- tests/studio/studio-entry-gate.test.tsx`

Expected:
- FAIL because `StudioPage` still renders `UploadZone` immediately in the idle state

**Step 3: Replace the old idle gate with workflow-pick and cur-upload**

In `studio/page.tsx`, change:

```tsx
{state === "idle" && <UploadZone ... />}
```

to:

```tsx
{state === "workflow-pick" && (
  <WorkflowPicker onSelect={selectWorkflow} />
)}

{state === "cur-upload" && (
  <UploadZone onFile={selectFile} processing={false} />
)}
```

Also:
- pass `selectWorkflow` out of `useStudio()`
- keep `uploaded`, `processing`, and `editing` exactly as they are now
- keep `fromLanding=true` behavior unchanged; landing should still bypass the picker because it calls `selectFile(file)` directly
- update any empty-state copy from “Upload an image to start” to wording that still makes sense before upload

In `UploadZone.tsx`, only make changes if needed to keep copy aligned with the new parent flow. Do not re-introduce CUR/ANI branching there.

**Step 4: Run the focused tests and a production build**

Run:
- `cd frontend && npm run test -- tests/studio/use-studio-workflow.test.tsx`
- `cd frontend && npm run test -- tests/studio/workflow-picker.test.tsx`
- `cd frontend && npm run test -- tests/studio/studio-entry-gate.test.tsx`
- `cd frontend && npm run build`

Expected:
- all three studio tests PASS
- production build PASS

**Step 5: Commit**

```bash
git add frontend/src/app/studio/page.tsx frontend/src/components/UploadZone.tsx frontend/tests/studio/studio-entry-gate.test.tsx
git commit -m "feat: route studio through the workflow picker"
```

---

### Task 4: Sync Sprint And Decision Docs

**Files:**
- Modify: `point/06-Implementation/ACTIVE_SPRINT.md`
- Modify: `point/10-Journal/QUICK-DECISIONS.md`
- Modify: `point/06-Implementation/plans/Plans-Index.md`

**Step 1: Add the doc follow-up entries**

Update the sprint snapshot so it reflects the next active UI change:

```md
- Add studio workflow picker before CUR upload
- Keep ANI options visible but disabled as Soon
- Preserve existing CUR editor path after selection
```

Add a quick decision note stating:

```md
- CUR/ANI is a workflow choice before upload, not an editor-side toggle.
- ANI cards stay visible but disabled until real ANI inputs and export exist.
```

**Step 2: Verify the links and references**

Run:
- `git grep -n "studio workflow picker" point`
- `git grep -n "2026-04-11-studio-workflow-picker-cur-ani" point/06-Implementation/plans/Plans-Index.md`

Expected:
- the new plan is linked from the plan index
- sprint/decision docs mention the workflow picker follow-up

**Step 3: Commit**

```bash
git add point/06-Implementation/ACTIVE_SPRINT.md point/10-Journal/QUICK-DECISIONS.md point/06-Implementation/plans/Plans-Index.md
git commit -m "docs: record studio workflow picker follow-up"
```

---

### Manual QA Checklist

Run this after Task 3 and before opening a PR:

1. Open `/studio` directly and confirm `CUR` and `ANI` groups appear before any upload UI.
2. Confirm only `Static Image` is clickable and all ANI cards are visibly disabled with `Soon`.
3. Click `Static Image` and confirm the current upload zone appears unchanged.
4. Upload a PNG/JPG/WebP and confirm the existing CUR flow still goes through background-removal choice, editor, simulation, and download.
5. Use the landing-page shortcut to enter studio and confirm it still bypasses the picker when a file is already staged.
6. Click `New` from the editor and confirm the app returns to the workflow picker, not straight to the upload zone.

---

### Notes For Execution

- Execute this in a dedicated feature worktree, not the current dirty root workspace.
- Do not start ANI upload handling, GIF parsing, or `.ani` export in this plan. The only ANI work here is visible-but-disabled option scaffolding.
- Keep `preview = export` behavior intact. This plan only changes the entry path into the existing CUR editor.

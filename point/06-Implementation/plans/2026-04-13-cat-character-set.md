# Cat Character Set Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generate a second four-cat Explore batch from user references with plush rounded bodies and more readable face contrast.

**Architecture:** Keep the shared reference silhouette, revise the four prompts toward plush body mass and larger-face readability, generate each cat through Pixellab with reference images, then shortlist the strongest v2 output set.

**Tech Stack:** Codex CLI, Pixellab MCP, PowerShell, PNG assets under `assets/pixellab/`

---

### Task 1: Stage references and prompt notes

**Files:**
- Create: `assets/pixellab/prompts/cat-orange-tabby.md`
- Create: `assets/pixellab/prompts/cat-gray-tabby.md`
- Create: `assets/pixellab/prompts/cat-cream.md`
- Create: `assets/pixellab/prompts/cat-tuxedo.md`
- Create: `assets/pixellab/references/gray-south.png`
- Create: `assets/pixellab/references/orange-south.png`

**Step 1: Copy the user references into the Pixellab references folder**

**Step 2: Write the four prompt-note files**

- orange = playful
- gray = calm
- cream = gentle
- tuxedo = alert

**Step 3: Verify the reference files and prompt files exist**

### Task 2: Generate the four cats

**Files:**
- Create: `assets/pixellab/raw/cat-orange-tabby-default-v02.png`
- Create: `assets/pixellab/raw/cat-gray-tabby-default-v02.png`
- Create: `assets/pixellab/raw/cat-cream-default-v02.png`
- Create: `assets/pixellab/raw/cat-tuxedo-default-v02.png`

**Step 1: Queue orange tabby**

**Step 2: Queue gray tabby**

**Step 3: Queue cream cat**

**Step 4: Queue tuxedo cat**

**Step 5: Poll to completion and download all four PNGs**

### Task 3: Review and shortlist

**Files:**
- Create or Replace: `assets/pixellab/selected/cat-orange-tabby-default-v02.png`
- Create or Replace: `assets/pixellab/selected/cat-gray-tabby-default-v02.png`
- Create or Replace: `assets/pixellab/selected/cat-cream-default-v02.png`
- Create or Replace: `assets/pixellab/selected/cat-tuxedo-default-v02.png`

**Step 1: Compare outputs against the role goals**

**Step 2: Promote the strongest variants to `selected`**

**Step 3: Summarize whether any colorway needs a second pass**

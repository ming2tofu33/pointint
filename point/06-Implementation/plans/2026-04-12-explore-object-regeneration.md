# Explore Object Regeneration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Regenerate the Explore object batch with a less playful `Dreamy Premium` tone and clearer personality separation between cat paw, fishbowl, and planet orb.

**Architecture:** Keep the existing Pixellab workflow and folder structure, revise prompts per object, generate through fresh Codex subprocesses with Pixellab MCP auth, then shortlist only the strongest outputs into `selected`.

**Tech Stack:** Codex CLI, Pixellab MCP, PowerShell, PNG assets under `assets/pixellab/`

---

### Task 1: Record second-batch prompt direction

**Files:**
- Modify: `assets/pixellab/prompts/cat-paw.md`
- Modify: `assets/pixellab/prompts/mini-fishbowl.md`
- Modify: `assets/pixellab/prompts/planet-orb.md`

**Step 1: Update the cat paw prompt**

- Replace toy-like wording with:
  - `dreamy premium`
  - `milky jelly`
  - `porcelain softness`
  - `restrained detail`

**Step 2: Update the fishbowl prompt**

- Make the bowl quieter and the fish more dominant.

**Step 3: Update the planet orb prompt**

- Strengthen the detached star and misty inner glow.

**Step 4: Verify prompt files read cleanly**

Run: inspect the prompt files
Expected: three prompts reflect shared-base plus distinct-personality direction

### Task 2: Generate second-batch assets

**Files:**
- Create: `assets/pixellab/raw/cat-paw-default-v02.png`
- Create: `assets/pixellab/raw/mini-fishbowl-default-v02.png`
- Create: `assets/pixellab/raw/planet-orb-default-v03.png`

**Step 1: Queue `cat-paw-default-v02`**

- Run fresh `codex exec` with Pixellab `create_map_object`
- Capture the returned object id

**Step 2: Queue `mini-fishbowl-default-v02`**

- Use the revised fishbowl prompt

**Step 3: Queue `planet-orb-default-v03`**

- Use the revised planet orb prompt

**Step 4: Poll until all are complete**

- Use Pixellab `get_map_object`
- Extract download URLs

**Step 5: Download completed PNGs**

- Save them into `assets/pixellab/raw/`

### Task 3: Review and shortlist

**Files:**
- Create or Replace: `assets/pixellab/selected/cat-paw-default-v02.png`
- Create or Replace: `assets/pixellab/selected/mini-fishbowl-default-v02.png`
- Create or Replace: `assets/pixellab/selected/planet-orb-default-v03.png`

**Step 1: Visually compare v2 batch with v1 batch**

- Check for:
  - less toy-like feel
  - stronger personality separation
  - preserved family resemblance

**Step 2: Promote only successful variants**

- Copy accepted outputs from `raw` to `selected`

**Step 3: Summarize what changed**

- State which object improved most
- State which object may still need another pass

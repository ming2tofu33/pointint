# Background Removal Fine-Tune Option

> **Status:** option spike
> **Date:** 2026-04-15
> **Type:** sprint option

## Goal

Evaluate whether Pointtint should replace the current remote Hugging Face background-removal Space with a custom fine-tuned model for cursor-style images.

## Current State

- The backend currently calls a remote HF Space through `backend/app/services/background.py`.
- The current service is an inference wrapper, not a training pipeline.
- Fine-tuning is therefore not an in-place change to the current app flow.

## Why This Exists

- Cursor assets have different edge characteristics from general product-photo or portrait background removal.
- A custom model may improve:
  - fine outline retention
  - semi-transparent edge handling
  - small-object stability
  - latency if served on a dedicated endpoint

## Scope For The Option

This option is not implementation work yet. It is a feasibility spike.

### Questions to answer

1. Is the current remote model family realistically fine-tunable for our cursor-style data?
2. What training data format is required?
3. How many labeled examples are needed to beat the current baseline?
4. Should we host the result as:
   - a replacement HF Space
   - a dedicated inference endpoint
   - or an internal service
5. Is the expected quality gain worth the added ops cost?

## Proposed Spike Deliverables

1. Document the current remote model path and serving constraints.
2. Define the minimum dataset spec:
   - input image
   - alpha mask / foreground mask
   - validation split
3. Identify one or two viable fine-tuning candidates.
4. Estimate training and serving cost.
5. Recommend one of:
   - keep current remote Space
   - run a limited fine-tune experiment
   - switch provider instead of fine-tuning

## Rough Fine-Tuning Plan

This is the rough path if the spike concludes that fine-tuning is worth doing.

### Phase 0: Benchmark first

1. Freeze a small failure set of cursor-style images.
2. Include hard cases:
   - white or near-white foreground
   - thin outlines
   - small stickers / small objects
   - semi-transparent soft edges
3. Compare the current remote HF result against one or two replacement candidates.
4. Do not start training unless baseline failure is repeatable and measurable.

### Phase 1: Dataset preparation

1. Build a labeled training set with:
   - source image
   - ground-truth alpha mask or high-quality foreground mask
2. Start with a small practical target:
   - `100-300` labeled training images
   - `20-50` validation images
3. Prioritize Pointtint-specific failure modes over broad image diversity.
4. Keep a separate held-out evaluation set for visual and metric comparison.

### Phase 2: Candidate training path

1. Prefer a segmentation/matting model that is already close to our use case.
2. Run one limited fine-tune experiment first instead of a broad model search.
3. Target outcome:
   - better edge preservation
   - less white-foreground erosion
   - stable masks on small objects
4. Track both quality and latency. A better mask that is much slower may still not be acceptable.

### Phase 3: Evaluation gate

Use a simple decision gate before deployment:

1. Visual review on the held-out set
2. Edge quality check on small white objects
3. Foreground retention check
4. Runtime comparison against the current remote service
5. Ops complexity review

If the model is only marginally better, do not deploy it.

### Phase 4: Deployment shape

If the fine-tuned model wins, ship it as a separate serving path:

1. Deploy the trained model to a dedicated Space or inference endpoint
2. Keep the current service as fallback during rollout
3. Switch the backend endpoint by configuration, not by rewriting Studio flow
4. Roll back by changing the serving target if quality or latency regresses

## Suggested Acceptance Criteria For The Spike

- The new model clearly beats the current remote baseline on Pointtint hard cases
- White foreground and outline retention improve in a repeatable way
- End-to-end latency remains within an acceptable range for Studio use
- The new serving path is simple enough to operate without blocking product work

## Suggested Non-Goals

- Do not redesign the Studio background-removal UX as part of this spike
- Do not mix ANI work, export work, or simulation work into this option
- Do not commit to a full training pipeline before the benchmark and dataset steps are complete

## Entry Criteria

- ANI v1 export quality is stable enough that background-removal quality is a meaningful next bottleneck.
- We have at least a small labeled cursor-image dataset or a plan to create one.

## Exit Criteria

- We can clearly say either:
  - "fine-tuning is worth running next"
  - or "stay on the current service and optimize elsewhere first"

## Notes

- If we pursue this, the deployment shape should likely be "train separately, serve separately, then switch `HF_SPACE_URL`".
- This should not block current Studio, simulation, or export work.

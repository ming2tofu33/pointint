# Pointint Homepage Structure Design

- Date: 2026-03-27
- Status: Working draft
- Scope: Homepage information architecture and interaction structure
- Related product: Pointint MVP

## 1. Purpose

This document defines the homepage structure for Pointint before implementation.

The homepage is not just a marketing page. It has to do three jobs at once:

1. communicate the Pointint brand mood immediately
2. prove that the product is a real cursor-making tool, not just a visual concept
3. move the user into the editor with as little hesitation as possible

The homepage should therefore act as a guided entry point into the product, not as a separate brand artifact.

## 2. Strategic Role of the Homepage

Pointint has two layers:

- a brand layer
- a tool layer

The homepage sits between them. It must translate the brand into confidence in the tool.

That means the homepage should not lean too far in either direction:

- If it becomes too emotional or purely aesthetic, users may not understand that Pointint is a real workflow for making Windows cursors.
- If it becomes too functional or dense, it loses the distinctiveness that makes the brand memorable.

The correct balance is:

`sensory brand moment -> immediate product understanding -> small proof -> hands-on curiosity -> editor entry`

## 3. Design Direction Already Agreed

The following decisions are already validated for this draft:

- The homepage should feel `sensory but practical`.
- The first action should be `start with image upload`.
- The Hero should contain the strongest brand interaction moment.
- The custom cursor effect should be limited to the Hero area.
- The custom cursor should use a Pointint-defined visual design.
- Cursor movement in the Hero should trigger a ripple or water-wave style effect.
- The homepage should include a `prebuilt example` that users can quickly experience.
- The main interactive example should appear after the Hero, not inside it.
- The Hero should still contain a small proof element so the page does not feel like a pure brand poster.
- The proof element in the Hero should be an `illustration or character image -> cursor-ready result` transformation example.

## 4. Homepage Success Criteria

The homepage is successful if a first-time visitor can understand the following within a few seconds:

1. this is a cursor-related product
2. this product turns images into usable Windows cursors
3. this experience feels more polished and creative than a generic utility
4. I can try something immediately without a long learning curve

The homepage is also successful if it reduces the most likely first-session doubts:

- "What does this site actually do?"
- "Is this only a branding experiment?"
- "Will this make a real Windows cursor?"
- "Do I have to understand editing tools first?"
- "Can I see the result before I commit?"

## 5. Core Homepage Principle

The homepage should not try to explain everything.

It should create a controlled experience in this order:

1. feel the brand
2. understand the product
3. see proof
4. try a lightweight preview
5. start creating

This sequence matters. If the page explains too much before giving a sensory hook, it becomes generic. If it gives only atmosphere without proof, it becomes vague. If it gives too much tool detail too early, it becomes heavy.

## 6. User Mental Model

The intended user journey on the homepage is:

1. land on the page
2. notice the unusual cursor and ripple behavior
3. understand that the site is about personal cursor creation
4. read a short value statement
5. see a transformation proof from source image to cursor result
6. scroll once and interact with a small preview editor
7. feel that the result is real and controllable
8. start with image upload

This means the homepage is partly theatrical, but always in service of conversion into the editor.

## 7. Homepage Structure Overview

The recommended homepage structure is:

1. Hero
2. Interactive Preview
3. How It Works
4. Why Pointint
5. Trust and Compatibility
6. Final CTA

Each section has a different job. The homepage should avoid redundant messaging between them.

## 8. Section 1: Hero

### 8.1 Primary job

The Hero introduces Pointint as a recognizable brand experience and immediately frames the product.

### 8.2 What the Hero must achieve

- Create a memorable first impression
- Establish Pointint's aesthetic tone
- Clarify the product in one glance
- Offer an immediate path to action
- Contain a small but concrete proof element

### 8.3 Hero content components

The Hero should include:

- brand line
- short product statement
- primary CTA
- optional secondary CTA
- small proof element
- ambient interaction layer

### 8.4 Recommended content order inside the Hero

1. Brand line: `Your Point, Your Tint.`
2. Product explanation: the easiest way to turn your image into a polished Windows cursor
3. Primary CTA: start with your image
4. Small proof block: image to cursor-ready result

The Hero should avoid listing too many features. It should frame the promise, not explain the full product.

### 8.5 Hero interaction behavior

The Hero should replace the system-like default pointer with a custom Pointint cursor treatment while the pointer is inside the Hero area.

When the user moves the pointer:

- a ripple effect should spread outward from the pointer path
- the ripple effect should feel fluid and delicate, not explosive or game-like
- the effect should support the brand atmosphere without reducing text readability

When the user leaves the Hero:

- the custom effect should stop
- the site should return to a more standard interaction mode

This preserves usability and prevents the effect from becoming tiring.

### 8.6 Hero proof element

The Hero proof element should not be a full interactive editor.

It should be a compact transformation card that shows:

- a source illustration or character-like image
- a refined cursor-ready output

This proof card exists for one reason:

to make the product legible in under a second

It should answer:

- "What kind of input goes in?"
- "What kind of result comes out?"

### 8.7 Hero tone

The Hero should feel:

- clean
- atmospheric
- slightly magical
- still product-oriented

It should not feel:

- noisy
- overly game-like
- overly experimental
- like a portfolio site disconnected from utility

## 9. Section 2: Interactive Preview

### 9.1 Primary job

The Interactive Preview section turns belief into confidence.

The Hero creates curiosity. This section should create conviction.

### 9.2 Why this section matters

Users should not have to begin a real upload to understand the product. A controlled preview experience lowers hesitation and makes the editor feel less risky.

### 9.3 Recommended format

This section should contain:

- one representative example cursor set
- one lightweight preview panel
- a few controls that suggest editability without overwhelming

### 9.4 What the user should be able to do here

The user should be able to:

- switch between `Normal`, `Text`, and `Link`
- see how the cursor behaves in a realistic context
- optionally test a simple scale change or hover state
- understand what a hotspot-aware preview feels like

This should feel like a mini demonstration of the real editor, not a duplicate of the full tool.

### 9.5 What this section should not do

It should not:

- ask for actual file upload
- expose too many editing controls
- mimic a full professional editing interface
- require explanation-heavy onboarding

### 9.6 Why only one representative example is recommended

A single strong example helps maintain clarity.

If the homepage shows too many example styles at once, the first experience becomes a gallery rather than a product story. The goal here is not to showcase the full range. The goal is to show one believable proof of quality and interaction.

### 9.7 Ideal emotional outcome

The user should think:

`This is more polished than I expected, and I understand how my own image could become something like this.`

## 10. Section 3: How It Works

### 10.1 Primary job

This section compresses the workflow into an easy mental model.

### 10.2 Recommended structure

Three steps are enough:

1. Upload your image
2. Refine the cursor
3. Preview and download

### 10.3 Why only three steps

The actual editor contains more nuance, such as hotspot placement and state handling. But homepage communication should reduce the workflow to a shape people can remember instantly.

The goal is clarity, not completeness.

### 10.4 What this section should communicate

- Pointint is easy to start
- the process is linear
- the result is real and usable

### 10.5 Interaction guidance

This section can use simple visual diagrams, icons, or small cards, but it should remain quieter than the Hero and Preview sections.

## 11. Section 4: Why Pointint

### 11.1 Primary job

This section explains why Pointint is different from generic image editing or random cursor download websites.

### 11.2 Main comparison points

Pointint should emphasize:

- image to cursor workflow, not just file browsing
- hotspot-aware preparation
- state-based preview before download
- Windows-ready outcome
- low-friction entry for non-expert users

### 11.3 Why this section matters

Without this comparison layer, the user may still think:

- "Could I do this with a normal image editor?"
- "Is this just a fancy wrapper?"
- "Why use this instead of downloading a free cursor?"

This section should resolve those doubts clearly and calmly.

### 11.4 Tone

The tone should be confident, not defensive.

It should explain practical advantages without sounding like a technical spec sheet.

## 12. Section 5: Trust and Compatibility

### 12.1 Primary job

This section reduces hesitation around adoption and outcome reliability.

### 12.2 What this section should answer

- What image types can I start with?
- Is the output really for Windows?
- Will I know how to apply the result?
- What happens to my uploaded files?

### 12.3 Recommended trust elements

- supported file types
- Windows compatibility statement
- output format statement
- simple upload handling or privacy note
- link to apply guide

### 12.4 Why this section should be visible

Pointint is not just a visual toy. It produces files users expect to use outside the browser. That means operational trust matters earlier than it would on a purely inspirational landing page.

## 13. Section 6: Final CTA

### 13.1 Primary job

The final CTA captures users who needed one full pass through the homepage before deciding.

### 13.2 Recommended behavior

The final CTA should feel simpler than the Hero, not larger.

It should restate:

- the promise
- the ease of starting
- the next action

### 13.3 Recommended outcome

The user should feel:

- informed enough
- reassured enough
- curious enough

to begin with their own image.

## 14. Section Priority and Visual Rhythm

The sections should have different intensity levels.

Recommended rhythm:

- Hero: highest atmosphere and strongest motion
- Interactive Preview: high engagement, high proof
- How It Works: lower intensity, high clarity
- Why Pointint: medium intensity, high differentiation
- Trust and Compatibility: calm and reassuring
- Final CTA: focused and quiet

This rhythm prevents visual fatigue. If every section tries to feel special in the same way, the page becomes exhausting and less believable.

## 15. Recommended Conversion Logic

The homepage should support two conversion paths:

### Path A: immediate action

The user arrives, feels the Hero, understands the value, and clicks the primary CTA without needing more detail.

### Path B: reassurance path

The user arrives, becomes curious, scrolls for proof and clarity, interacts with the preview, reads enough supporting context, then clicks the final CTA.

The page should be designed so both paths feel natural.

## 16. Homepage Content Hierarchy

The content hierarchy should be:

1. emotional hook
2. product meaning
3. visible proof
4. lightweight interaction
5. workflow clarity
6. differentiation
7. trust
8. action

This hierarchy is more important than any specific visual style choice.

## 17. Risks to Avoid

### 17.1 Making the Hero too decorative

If the Hero focuses too much on visual effect and not enough on product clarity, Pointint may feel like an art project instead of a useful tool.

### 17.2 Making the preview too complex

If the preview feels like a full editor, the homepage becomes cognitively heavy and competes with the real tool.

### 17.3 Explaining too many features too early

Users do not need the full workflow up front. They need just enough to feel confident.

### 17.4 Letting the visual effect leak into the whole site

The custom cursor and ripple should be a signature moment, not a permanent burden.

### 17.5 Hiding real product proof below too much storytelling

Brand atmosphere is helpful only if product comprehension arrives quickly.

## 18. Open Decisions for the Next Design Pass

This document locks the homepage structure direction, but the following content decisions still need to be defined:

- exact Hero copy
- exact proof-card example content
- exact behavior of the mini preview editor
- whether the Hero needs a secondary CTA
- how strong the long-term `Pointint for ...` concept framing should appear on the homepage
- exact trust message wording

These should be resolved in the content preparation phase.

## 19. Recommended Next Step

The next design document should define the homepage content preparation table.

That table should map each homepage section to:

- user question
- communication goal
- required content assets
- suggested copy types
- CTA behavior
- proof elements

Once that is approved, the UI and UX checklist can be built against it.

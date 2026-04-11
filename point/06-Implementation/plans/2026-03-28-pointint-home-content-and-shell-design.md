# Pointint Home Content and Shell Design

- Date: 2026-03-28
- Status: Working draft
- Scope: Validated homepage content direction, brand language rules, and home/editor shell structure
- Related docs:
  - `point/06-Implementation/plans/2026-03-27-pointint-homepage-structure-design.md`
  - `point/06-Implementation/plans/2026-03-27-pointint-product-direction-design.md`

## 1. Why This Document Exists

This document records the design decisions already validated through discussion so they are not lost before the next planning pass.

The goal is to capture:

- the role of the homepage
- the approved homepage interaction concept
- the current content direction for the Hero
- bilingual content rules for MVP
- the high-level shell relationship between the homepage and the editor

This is not yet a final implementation spec. It is a stabilized planning document for the next stages:

- content preparation table
- UI and UX checklist
- later visual and interaction implementation

## 2. Validated Product Communication Direction

Pointint should not present itself as only a beautiful brand site or only a technical tool.

The homepage should communicate both:

- a distinct mood and atmosphere
- a real, usable cursor-making workflow

The agreed framing is:

`sensory but practical`

This means the first impression should feel memorable and polished, but the site should still read as a trustworthy product that helps people create usable Windows cursors.

## 3. Homepage Role

The homepage should function as:

- a brand entrance
- a product explainer
- a lightweight experience layer
- a conversion path into the editor

It should not behave like:

- a pure marketing-only landing page
- a fully embedded editor
- a feature catalog

The homepage should help a first-time visitor feel:

1. "This is different from a generic utility."
2. "I understand what the product does."
3. "I can see that it works."
4. "I can start right away."

## 4. Most Important Homepage Decisions Already Made

The following decisions are considered approved for the current direction:

### 4.1 Hero interaction concept

- When a user enters the Hero area, the pointer should change to a custom Pointint cursor treatment.
- Pointer movement inside the Hero should create a water-ripple style effect.
- This effect should remain limited to the Hero.
- The effect exists to create a branded first impression, not to become a permanent site-wide interaction model.

### 4.2 Homepage tone

- The homepage should feel `sensory but practical`.
- It should not feel like a toy, a game, or a purely artistic experiment.
- It should not feel like a cold dashboard or a power-user editing suite either.

### 4.3 First primary action

- The first desired user action is `start with image upload`.
- The homepage should be optimized to reduce hesitation before upload.

### 4.4 Example experience strategy

- Users should be able to experience a prebuilt example before using their own file.
- The homepage should include one representative example with a mini preview experience.
- This experience should appear after the Hero, not inside it.

### 4.5 Hero proof strategy

- The Hero still needs a small proof element.
- That proof element should be a compact `from image to cursor` comparison.
- The input example should feel like an illustration or character-style image.
- The goal is immediate legibility, not deep explanation.

## 5. Approved Homepage Section Order

The current approved homepage structure is:

1. Hero
2. Interactive Preview
3. How It Works
4. Why Pointint
5. Trust and Compatibility
6. Final CTA

### 5.1 Hero

Purpose:

- deliver the brand moment
- explain the product quickly
- present the first CTA
- show small proof

### 5.2 Interactive Preview

Purpose:

- let the user experience a prebuilt cursor example
- reinforce that the tool is real
- increase curiosity without requiring upload

### 5.3 How It Works

Purpose:

- compress the product flow into a simple mental model

Approved workflow framing:

1. upload your image
2. refine the cursor
3. preview and download

### 5.4 Why Pointint

Purpose:

- explain what makes Pointint different from generic image tools or cursor download sites

### 5.5 Trust and Compatibility

Purpose:

- reduce uncertainty around supported formats, Windows usability, and output reliability

### 5.6 Final CTA

Purpose:

- convert the user after they have taken one full pass through the page

## 6. Approved Hero Direction

The Hero should do four jobs simultaneously:

1. establish the Pointint mood
2. clarify the product quickly
3. provide a direct action path
4. include a compact proof element

The Hero should not become:

- a feature list
- a full editor
- a gallery
- a long storytelling block

## 7. Hero Messaging Rules

### 7.1 Brand line

The brand line remains:

`Your Point, Your Tint.`

This should continue to function as the emotional and conceptual brand expression.

### 7.2 Product explanation direction

The product explanation should be direct rather than abstract.

The approved meaning-level sentence is:

`Pointint helps you turn a favorite image into a polished Windows cursor.`

This meaning statement is not treated as a literal one-to-one translation string. It is the semantic source for bilingual copy.

### 7.3 Approved Korean Hero description

The currently approved Korean Hero description is:

`좋아하는 이미지를 Windows에서 바로 쓸 수 있는 커서로 바꿔보세요.`

Reason:

- clear
- practical
- outcome-oriented
- strong enough for a first-visit Hero

### 7.4 Hero proof label

The approved short proof label direction is:

`From image to cursor`

This should appear in or around the compact proof element in a way that reinforces immediate comprehension.

## 8. Brand Naming and Language Rules

The MVP should be prepared bilingually from the start.

However, the bilingual approach should not be translation-first. It should be meaning-first.

## 8.1 Meaning-first language model

For key homepage content:

1. define the semantic message
2. write Korean copy naturally
3. write English copy naturally

This avoids translation stiffness and keeps both languages aligned to the same product intent.

## 8.2 Approved brand-name usage rules

The brand should be represented differently depending on context:

- logo / visual identity: `Poin+tint`
- English body copy / product name: `Pointint`
- Korean name: `포인틴트`

Reason:

- `Poin+tint` preserves logo personality and brand distinctiveness
- `Pointint` improves reading flow in body copy
- `포인틴트` gives a stable Korean product name

## 9. Approved CTA Direction

The primary homepage CTA has been approved as:

- KO: `이미지로 시작하기`
- EN: `Start with your image`

This CTA is preferred because:

- it lowers entry pressure
- it matches the upload-first product flow
- it feels more open and less demanding than explicit "make now" language

## 10. Interactive Preview Direction

The section after the Hero should provide a small but meaningful experience.

The approved direction is:

- one representative example
- one mini preview editor
- enough controls to suggest editability
- not a full editing interface

The purpose of this section is not to replace the editor. It is to help the user think:

`This feels real, and I can imagine using my own image here.`

### 10.1 Suggested interactions in the mini preview

The current direction allows for lightweight interaction such as:

- switching between `Normal`, `Text`, and `Link`
- observing behavior in a realistic preview zone
- lightly sensing scale or cursor-state differences

The preview should feel playful and trustworthy, not complex.

## 11. Homepage Versus Editor Relationship

One major architectural point has been discussed and should be recorded:

The homepage and the editor should belong to the same product world, but they should not behave like the same screen.

This leads to the current structural direction:

`split home/editor shell`

## 11.1 Why a split shell is preferred

If the homepage and editor share too much of the same structural logic:

- the homepage becomes too tool-heavy
- the editor becomes too marketing-heavy

Pointint works better if:

- the homepage is optimized for discovery, trust, and entry
- the editor is optimized for creation, feedback, and completion

## 11.2 Homepage shell role

The homepage shell should support:

- brand discovery
- narrative clarity
- light navigation
- section-based exploration

## 11.3 Editor shell role

The editor shell should support:

- step clarity
- focused interaction
- tool confidence
- progress toward download

## 12. Preliminary Homepage Header Direction

The homepage should likely use a light, fixed top header structure.

Current directional recommendation:

- left: `Poin+tint` logo
- center or near-center: section navigation
- right: language switcher and primary CTA

The exact visual arrangement is not finalized, but the header should feel:

- light at page entry
- more anchored after scroll
- supportive, not dominant

Likely navigation items for the homepage:

- How it works
- Preview
- Guide
- FAQ

This is a recorded direction, not yet a final approval.

## 13. Preliminary Editor Shell Direction

The editor should not reuse the homepage navigation model.

Current directional recommendation:

- a focused top bar or work header
- step-based orientation rather than marketing navigation
- task-oriented controls such as guide access, language switch, and download readiness

The editor should read as a workspace, not a landing page continuation.

## 14. Preliminary Editor Layout Direction

The current thinking favors a practical editor layout over an overbuilt panel system.

The most promising direction discussed so far is:

`two-panel editor layout`

High-level concept:

- one side for controls and flow guidance
- one side for canvas, preview, or result-oriented interaction

Reason:

- easier for MVP
- less intimidating than a dense three-panel creative suite
- clearer for users who are not advanced image-editing users

This is still a directional note and not a locked UI specification yet.

## 15. Content Preparation Logic for the Next Phase

The next planning step should use the homepage section order already approved and define content by section.

Each section should be documented through:

- user question
- communication goal
- core meaning statement
- KO copy
- EN copy
- needed asset or proof element
- CTA behavior
- what to avoid

This content-preparation structure should be built next.

## 16. Risks Already Identified

### 16.1 Hero becomes too decorative

If the ripple and cursor effects dominate without enough clarity, the homepage may feel stylish but vague.

### 16.2 Homepage becomes too editor-like

If the preview area becomes too advanced, the first visit may feel heavy and confusing.

### 16.3 Editor becomes too much like the homepage

If the editor keeps too much of the homepage's storytelling structure, it may reduce focus and productivity.

### 16.4 Brand voice becomes inconsistent across languages

If bilingual content is handled as direct translation instead of meaning alignment, the product can feel less coherent.

## 17. Open Questions for the Next Discussion

The following items still need to be defined in the next content pass:

- the exact English Hero product description
- the exact proof-card content and visual composition
- the final choice of secondary CTA, if any
- the final homepage header menu list
- the detailed editor screen composition
- the exact mini preview interaction set
- the final section-by-section KO and EN content table

## 18. Recommended Next Step

The next document should be the homepage content preparation table.

That document should convert the decisions above into section-level content planning with bilingual structure.

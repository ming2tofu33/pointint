# Cat Character Set Design

> Date: 2026-04-13
> Scope: Explore reference-based cat object batch

## Purpose

Generate four reference-inspired pixel cats for Explore that keep the cute south-facing silhouette from the user references while feeling like four distinct characters.

## Decision

- Use a `Character Set` approach, not literal recolors.
- Preserve the core reference grammar:
  - front-facing / south-facing pose
  - short round body
  - large belly area
  - short legs
  - tiny pixel-cat proportions
- Differentiate the four outputs through silhouette, expression density, ear size, tail visibility, and marking contrast.
- Regenerate toward a `Plush + Face Contrast` target:
  - more plush, rounded body mass
  - larger eyes
  - clearer face contrast and expression read

## Approach

### Option A: Literal variants

- safest
- too repetitive for the user's goal

### Option B: Family set

- coherent and balanced
- not distinct enough for the requested variety

### Option C: Character set

- strongest personality separation
- recommended

## Shared Base

- use the two user references as style anchors
- transparent background
- pixel-art cat, south-facing
- more rounded body and larger visible belly
- larger eyes and more readable face center
- no scene
- no floor
- no text
- no black outer stroke that makes the asset feel like a sticker

## Character Roles

### Orange Tabby

- most playful
- warm and friendly default cat
- visible tabby striping
- biggest eyes in the set
- slightly perked ears and cheerful face contrast

### Gray Tabby

- calm and chunky
- denser body read
- softer facial energy with clearer face contrast
- more muted striping

### Cream Cat

- gentlest and softest
- simpler markings
- plush, almost cloud-like belly read
- facial features must stay large enough to read immediately

### Tuxedo Cat

- highest face clarity
- highest contrast
- more alert facial spacing without becoming sharp or mean
- cleaner graphic division between dark coat and pale belly

## Prompt Rules

- reference the downloaded south-facing cat images for silhouette guidance
- keep prompts short and direct about body read
- ask for distinct personality rather than random variation
- avoid adding props, scenery, or large tails that change the icon read

## Output Plan

- create:
  - `cat-orange-tabby-default-v02.png`
  - `cat-gray-tabby-default-v02.png`
  - `cat-cream-default-v02.png`
  - `cat-tuxedo-default-v02.png`
- save to `assets/pixellab/raw/`
- move only the strongest set to `assets/pixellab/selected/`

## Testing

- visual check against the two references
- confirm that all four still read as the same cat family
- confirm each colorway has a distinct personality at small size

## Out of Scope

- animation
- multi-angle character sheets
- final app export

# P1-LANDING-01 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Pointint landing page with interactive hero (CSS light + Canvas particles + drag-to-studio), how-it-works section, and SEO/GEO-optimized FAQ.

**Architecture:** Server Component page.tsx orchestrates server-rendered sections (HowItWorks, FAQ, Footer) and a client-side Hero with particle canvas, cursor glow, and full-screen drop zone. A thin landingStore module passes dropped files from landing to studio via in-memory variable.

**Tech Stack:** Next.js 15, React 19, Tailwind v4, next-intl, Canvas 2D API, CSS custom properties

**Spec:** `point/06-Implementation/plans/2026-04-08-landing-page-design.md`

---

## File Map

| File | Role | Server/Client |
|---|---|---|
| `src/lib/landingStore.ts` | In-memory file passing (landing → studio) | Module |
| `src/components/landing/ParticleCanvas.tsx` | Canvas 2D particle system | Client |
| `src/components/landing/Hero.tsx` | Hero section (glow, particles, drop zone, copy) | Client |
| `src/components/landing/HowItWorks.tsx` | 3-step flow section | Server |
| `src/components/landing/FAQ.tsx` | Accordion FAQ with JSON-LD | Server |
| `src/components/landing/Footer.tsx` | Minimal footer | Server |
| `src/i18n/messages/en.json` | Landing translations (EN) | — |
| `src/i18n/messages/ko.json` | Landing translations (KO) | — |
| `src/app/page.tsx` | Landing page composition + JSON-LD | Server |
| `src/app/layout.tsx` | Enhanced metadata | Server |
| `src/app/studio/page.tsx` | fromLanding file load | Client (existing) |

---

## Chunk 1: Foundation (translations + landing store)

### Task 1: Add landing translations

**Files:**
- Modify: `frontend/src/i18n/messages/en.json`
- Modify: `frontend/src/i18n/messages/ko.json`

- [ ] **Step 1: Add `landing` key to en.json**

Add to en.json at root level:

```json
"landing": {
  "logo": "poin+tint",
  "tagline": "Your Point, Your Tint.",
  "dropHint": "Drop an image to start",
  "dropActive": "Drop to create your cursor",
  "startCreating": "Start Creating",
  "fileTooLarge": "File must be under 10MB",
  "step1Title": "Upload",
  "step1Sub": "PNG, JPG, or WebP — background removed automatically",
  "step2Title": "Edit",
  "step2Sub": "Position, resize, and set your hotspot. Preview at 32, 48, or 64px",
  "step3Title": "Download",
  "step3Sub": "Get your .cur file with one-click Windows installer",
  "faq1Q": "How do I make a custom Windows cursor?",
  "faq1A": "Upload an image to Pointint, edit the position and hotspot, simulate how it looks, and download a .cur file with a one-click installer.",
  "faq2Q": "What file formats are supported?",
  "faq2A": "PNG, JPG, and WebP. Pointint automatically removes the background and converts your image.",
  "faq3Q": "Is it free to use?",
  "faq3A": "Yes. Upload, edit, simulate, and download — all free, no account required.",
  "faq4Q": "How do I apply the cursor to Windows?",
  "faq4A": "Unzip the downloaded file, right-click install.inf, select \"Install\", then choose \"Pointint\" in Mouse Settings > Pointers.",
  "faq5Q": "What is a hotspot?",
  "faq5A": "The exact pixel where your click registers. Pointint lets you set it visually with a drag tool.",
  "faq6Q": "Can I make animated cursors?",
  "faq6A": "Animated cursor (.ani) support is coming soon.",
  "footerTagline": "Your Point, Your Tint."
}
```

- [ ] **Step 2: Add `landing` key to ko.json**

Add matching Korean translations:

```json
"landing": {
  "logo": "poin+tint",
  "tagline": "Your Point, Your Tint.",
  "dropHint": "이미지를 드래그하여 시작하세요",
  "dropActive": "놓으면 커서를 만들 수 있어요",
  "startCreating": "시작하기",
  "fileTooLarge": "파일은 10MB 이하여야 합니다",
  "step1Title": "업로드",
  "step1Sub": "PNG, JPG, WebP — 배경이 자동으로 제거됩니다",
  "step2Title": "편집",
  "step2Sub": "위치, 크기, 핫스팟을 설정하세요. 32, 48, 64px 미리보기",
  "step3Title": "다운로드",
  "step3Sub": ".cur 파일과 Windows 원클릭 설치 파일을 받으세요",
  "faq1Q": "커서를 어떻게 만들 수 있나요?",
  "faq1A": "Pointint에 이미지를 업로드하고, 위치와 핫스팟을 편집하고, 시뮬레이션으로 확인한 뒤 .cur 파일을 다운로드하세요.",
  "faq2Q": "어떤 파일 형식을 지원하나요?",
  "faq2A": "PNG, JPG, WebP를 지원합니다. 배경 제거와 변환은 자동으로 처리됩니다.",
  "faq3Q": "무료인가요?",
  "faq3A": "네. 업로드, 편집, 시뮬레이션, 다운로드 모두 무료이며 계정이 필요 없습니다.",
  "faq4Q": "Windows에 어떻게 적용하나요?",
  "faq4A": "다운로드한 파일의 압축을 풀고, install.inf를 우클릭하여 \"설치\"를 선택한 뒤, 마우스 설정 > 포인터에서 \"Pointint\"를 선택하세요.",
  "faq5Q": "핫스팟이 뭔가요?",
  "faq5A": "클릭이 실제로 인식되는 정확한 픽셀 위치입니다. Pointint에서 드래그로 시각적으로 설정할 수 있습니다.",
  "faq6Q": "애니메이션 커서도 만들 수 있나요?",
  "faq6A": "애니메이션 커서(.ani) 지원이 곧 추가될 예정입니다.",
  "footerTagline": "Your Point, Your Tint."
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/i18n/messages/en.json frontend/src/i18n/messages/ko.json
git commit -m "feat: add landing page translations (en/ko)"
```

### Task 2: Landing store (file passing)

**Files:**
- Create: `frontend/src/lib/landingStore.ts`

- [ ] **Step 1: Create landingStore.ts**

```typescript
let landingFile: File | null = null;

export function setLandingFile(file: File) {
  landingFile = file;
}

export function getLandingFile(): File | null {
  return landingFile;
}

export function clearLandingFile() {
  landingFile = null;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/landingStore.ts
git commit -m "feat: landing store — in-memory file passing to studio"
```

---

## Chunk 2: Particle Canvas + Hero

### Task 3: ParticleCanvas component

**Files:**
- Create: `frontend/src/components/landing/ParticleCanvas.tsx`

- [ ] **Step 1: Create ParticleCanvas.tsx**

Client component. Canvas 2D with 25 particles that respond to cursor position. Respects `prefers-reduced-motion` and `(pointer: fine)`.

Key behaviors:
- Particles drift slowly when idle
- When cursor moves near a particle, it gets pushed away (repulsion)
- Particle color: read computed style of `--color-accent` (dark) or `--color-accent-hover` (light theme detection via `matchMedia('(prefers-color-scheme: light)')` or `data-theme` attribute)
- Particle opacity: 0.3~0.6
- On `prefers-reduced-motion` or touch devices: render nothing (return null)
- Canvas fills parent container, transparent background
- `requestAnimationFrame` loop, cleanup on unmount

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/landing/ParticleCanvas.tsx
git commit -m "feat: ParticleCanvas — 2D particle system for hero background"
```

### Task 4: Hero component

**Files:**
- Create: `frontend/src/components/landing/Hero.tsx`

- [ ] **Step 1: Create Hero.tsx**

Client component. Full viewport height. Contains:
- CSS radial-gradient glow that follows mouse (via CSS variable `--mouse-x`, `--mouse-y`)
- ParticleCanvas as background layer
- Center-aligned copy: logo, tagline, drop hint, CTA button
- Full-area drop zone (desktop only, detected via `pointer: fine`)
- On drag-over: border changes to accent, hint text changes
- On drop: validate file type + size (≤10MB), call `setLandingFile(file)`, navigate to `/studio?fromLanding=true`
- On drop error: show error message briefly (2.5s)
- Signature cursor: `cursor: url(/cursors/signature.cur) 2 2, default` — file may not exist yet, CSS fallback to `default` is graceful
- `prefers-reduced-motion`: disable BOTH particles AND CSS glow animation (glow position stays centered or hidden)
- Light theme: glow opacity lowered to 0.08 (dark: 0.15~0.2). Detect via `data-theme` attribute on `<html>`
- Mobile: no drop zone, no particles, CTA button is simple `/studio` link

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/landing/Hero.tsx
git commit -m "feat: Hero — interactive hero with glow, particles, drop zone"
```

---

## Chunk 3: Static sections (HowItWorks, FAQ, Footer)

### Task 5: HowItWorks component

**Files:**
- Create: `frontend/src/components/landing/HowItWorks.tsx`

- [ ] **Step 1: Create HowItWorks.tsx**

Server component (no `"use client"`). Receives translations via props. 3 steps in a horizontal row (flex, gap). Each step: accent-colored number, title, subtitle. Mobile: vertical stack. Uses CSS variables for colors.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/landing/HowItWorks.tsx
git commit -m "feat: HowItWorks — 3-step flow section"
```

### Task 6: FAQ component

**Files:**
- Create: `frontend/src/components/landing/FAQ.tsx`

- [ ] **Step 1: Create FAQ.tsx**

Server component. Uses native `<details>/<summary>` for accordion (no JS needed). 6 questions passed as props (from translations). Each Q/A pair. Summary styled with accent on open. Includes inline `<script type="application/ld+json">` with FAQPage schema built from the same Q/A data.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/landing/FAQ.tsx
git commit -m "feat: FAQ — accordion with JSON-LD FAQPage schema"
```

### Task 7: Footer component

**Files:**
- Create: `frontend/src/components/landing/Footer.tsx`

- [ ] **Step 1: Create Footer.tsx**

Server component. Minimal: `poin+tint` logo left, tagline right. Border-top. Muted colors.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/landing/Footer.tsx
git commit -m "feat: Footer — minimal landing footer"
```

---

## Chunk 4: Page composition + Studio integration

### Task 8: Rewrite page.tsx

**Files:**
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Rewrite page.tsx**

Server Component. Composes: Header → Hero → HowItWorks → FAQ → Footer → SettingsBar. Passes translated strings as props to server components (HowItWorks, FAQ, Footer). Hero is a client component that uses `useTranslations` internally. Adds `SoftwareApplication` JSON-LD schema.

- [ ] **Step 2: Build test**

```bash
cd frontend && npm run build
```

Expected: no errors, `/` route renders.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat: landing page composition — hero + how-it-works + FAQ + footer"
```

### Task 9: Studio fromLanding integration

**Files:**
- Modify: `frontend/src/app/studio/page.tsx`

- [ ] **Step 1: Add fromLanding detection**

In studio page, add `useSearchParams` to detect `fromLanding=true`. In a `useEffect`, if detected: call `getLandingFile()`, if file exists call `selectFile(file)`, then `clearLandingFile()` and `router.replace('/studio')` to clean URL. If no file, do nothing (normal idle state).

Add imports:
```typescript
import { useSearchParams } from "next/navigation";
import { getLandingFile, clearLandingFile } from "@/lib/landingStore";
```

- [ ] **Step 2: Build test**

```bash
cd frontend && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/studio/page.tsx
git commit -m "feat: studio fromLanding — auto-load dropped file from landing"
```

### Task 10: Enhanced metadata in layout.tsx

**Files:**
- Modify: `frontend/src/app/layout.tsx`

- [ ] **Step 1: Add SoftwareApplication JSON-LD and enhanced meta**

Update `generateMetadata` to include:
- Enhanced title: "Pointint — Your Point, Your Tint. | Custom Cursor Maker"
- Enhanced description from spec
- `alternates` with `canonical: "https://pointtint.com"`
- `robots: { index: true, follow: true }`
- `openGraph.images`: `[{ url: "/og-image.png", width: 1200, height: 630 }]`

Note: SoftwareApplication JSON-LD is in `page.tsx` (Task 8), NOT here. Layout only handles meta tags.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/layout.tsx
git commit -m "feat: enhanced metadata — SoftwareApplication JSON-LD, canonical, robots"
```

### Task 10b: SEO assets (sitemap, robots, OG image)

**Files:**
- Create: `frontend/public/robots.txt`
- Create: `frontend/src/app/sitemap.ts`
- Create: `frontend/public/og-image.png` (placeholder — 1200×630, brand colors + "poin+tint" text)

- [ ] **Step 1: Create robots.txt**

```
User-agent: *
Allow: /
Sitemap: https://pointtint.com/sitemap.xml
```

- [ ] **Step 2: Create sitemap.ts**

Next.js App Router sitemap generation:

```typescript
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://pointtint.com", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://pointtint.com/studio", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
```

- [ ] **Step 3: Create placeholder OG image**

Generate a simple 1200×630 PNG with dark background (`#080C18`), "poin+tint" in center, accent line below. This is a placeholder — final design can be updated later.

- [ ] **Step 4: Commit**

```bash
git add frontend/public/robots.txt frontend/src/app/sitemap.ts frontend/public/og-image.png
git commit -m "feat: SEO assets — sitemap.xml, robots.txt, OG image placeholder"
```

---

## Chunk 5: Final verification

### Task 11: Full build + push

- [ ] **Step 1: Full build**

```bash
cd frontend && npm run build
```

Expected: all routes compile, no errors.

- [ ] **Step 2: Verify all translations render**

Check en.json and ko.json both have `landing` key with all required sub-keys matching.

- [ ] **Step 3: Final commit + push**

```bash
git add frontend/src/app/page.tsx frontend/src/app/layout.tsx frontend/src/app/sitemap.ts frontend/src/app/studio/page.tsx frontend/src/components/landing/ frontend/src/lib/landingStore.ts frontend/src/i18n/messages/ frontend/public/robots.txt frontend/public/og-image.png
git commit -m "feat: P1-LANDING-01 complete — landing page with hero, how-it-works, FAQ

- Interactive hero: CSS glow + Canvas 2D particles + full-screen drop zone
- Signature cursor on hover
- 3-step how-it-works section
- 6-question FAQ with JSON-LD FAQPage schema
- SoftwareApplication JSON-LD
- Landing → Studio file passing via in-memory store
- Full i18n (en/ko)
- Mobile responsive (particles disabled, CTA only)
- prefers-reduced-motion respected"

git push origin main
```

- [ ] **Step 4: Verify live deployment**

Check `pointtint.com`:
- Hero renders with glow effect
- Particles animate on desktop
- Drop an image → navigates to studio
- FAQ accordion works
- Switch EN/KO → all text translates
- Mobile view → no particles, CTA button only

---

## Summary

| Chunk | Tasks | Focus |
|---|---|---|
| 1 | 1-2 | Translations + landing store |
| 2 | 3-4 | ParticleCanvas + Hero (client) |
| 3 | 5-7 | HowItWorks + FAQ + Footer (server) |
| 4 | 8-10b | Page composition + studio integration + SEO assets |
| 5 | 11 | Build + verify + deploy |

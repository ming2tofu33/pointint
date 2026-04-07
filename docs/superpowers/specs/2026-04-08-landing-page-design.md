# P1-LANDING-01 — Landing Page Design

> **Date:** 2026-04-08
> **Status:** Approved
> **Task:** P1-LANDING-01 (Phase 1 Gate 마지막 항목)

## Goal

Pointint 랜딩 페이지를 브랜드 감성 중심으로 만들되, 자연스러운 전환(→ /studio)과 SEO/GEO를 충족한다.

## Design Decisions

| 결정 | 선택 | 근거 |
|---|---|---|
| 핵심 목표 | 브랜드 감성(C) + 자연스러운 전환(A) | 무드가 먼저, CTA는 흐름 속에서 |
| 스튜디오 미리보기 | 라이브 인터랙션(C) | 드롭하면 바로 /studio로 |
| 페이지 길이 | 원페이지 3~4섹션(B) | 감성 유지 + SEO/GEO 충족 균형 |
| 히어로 비중 | 전체 화면 드롭존(D) | 어디에 드롭해도 반응 |
| 배경 효과 | CSS 빛 + Canvas 파티클(C) | 가볍고 안정적, 브랜드 톤에 맞음 |
| 커서 효과 | 시그니처 커서(A) | 브랜드 대표 커서 1개 |
| 후속 업그레이드 | WebGL 셰이더(B) | P1-LANDING-02로 별도 관리 |

## Structure

```
┌──────────────────────────────────────────┐
│ Header: poin+tint | Studio               │
├──────────────────────────────────────────┤
│                                          │
│  Section 1: 히어로 (100vh)                │
│  - CSS radial-gradient 빛 (커서 따라다님)  │
│  - Canvas 2D 파티클 20~30개               │
│  - 시그니처 커서로 CSS cursor 교체          │
│  - 전체 화면 드롭존                        │
│  - 카피: poin+tint / Your Point, Your Tint│
│  - 힌트: Drop an image to start           │
│  - CTA: [Start Creating] → /studio       │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  Section 2: 흐름 소개 (3단계)              │
│  1. Upload your image                    │
│  2. Edit and set hotspot                 │
│  3. Download your cursor                 │
│  - 각 단계 한 줄, 아이콘 없이 숫자          │
│  - GEO: 구체적 수치 포함                   │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  Section 3: FAQ (4~6개)                   │
│  - <details>/<summary> 아코디언            │
│  - JSON-LD FAQPage 스키마                 │
│  - 한/영 각각 SEO 키워드 타겟              │
│                                          │
├──────────────────────────────────────────┤
│ Footer: poin+tint | Your Point, Your Tint│
└──────────────────────────────────────────┘
```

## Section 1: Hero

### Visual
- 배경: `var(--color-bg-primary)` 위에 CSS `radial-gradient` (로즈 핑크, opacity 0.15~0.2)
- 빛 위치: `mousemove` 이벤트로 실시간 업데이트
- 파티클: `<canvas>` 2D context, 20~30개 작은 원, 커서 주변에서 밀려나거나 끌려옴
- 시그니처 커서: `cursor: url(/cursors/signature.cur) x y, auto`

### Copy (중앙 정렬)
```
poin+tint                    ← 로고 크기, font-weight 700
Your Point, Your Tint.       ← 태그라인, text-secondary
                             ← 여백
Drop an image to start       ← 힌트, text-muted, 작은 글씨
[Start Creating]             ← accent 버튼, /studio 링크
```

### Interaction
- 전체 히어로가 드롭존
- 이미지 드래그 시: 테두리가 accent 색으로 변하고, 힌트 텍스트가 "Drop to create your cursor"로 변경
- 드롭 시: 파일을 `sessionStorage`에 base64로 저장, `router.push('/studio?fromLanding=true')`
- 스튜디오에서 `fromLanding` 감지 시 `sessionStorage`에서 파일 로드 → 자동 업로드 흐름 시작

### Mobile
- 파티클 비활성 (`window.matchMedia('(pointer: fine)')`)
- CSS 빛 효과만 유지 (터치 위치 반응)
- 드롭존 비활성, CTA 버튼만

## Section 2: How It Works

### Layout
- 3개 스텝 가로 나열 (모바일: 세로)
- 각 스텝: 숫자(accent 색) + 제목 한 줄 + 부제 한 줄

### Content (EN)
```
1  Upload
   PNG, JPG, or WebP — background removed automatically

2  Edit
   Position, resize, and set your hotspot. Preview at 32, 48, or 64px

3  Download
   Get your .cur file with one-click Windows installer
```

### Content (KO)
```
1  업로드
   PNG, JPG, WebP — 배경이 자동으로 제거됩니다

2  편집
   위치, 크기, 핫스팟을 설정하세요. 32, 48, 64px 미리보기

3  다운로드
   .cur 파일과 Windows 원클릭 설치 파일을 받으세요
```

## Section 3: FAQ

### Questions (EN)
1. **How do I make a custom Windows cursor?** — Upload an image to Pointint, edit the position and hotspot, simulate how it looks, and download a .cur file with a one-click installer.
2. **What file formats are supported?** — PNG, JPG, and WebP. Pointint automatically removes the background and converts your image.
3. **Is it free to use?** — Yes. Upload, edit, simulate, and download — all free, no account required.
4. **How do I apply the cursor to Windows?** — Unzip the downloaded file, right-click install.inf, select "Install", then choose "Pointint" in Mouse Settings > Pointers.
5. **What is a hotspot?** — The exact pixel where your click registers. Pointint lets you set it visually with a drag tool.
6. **Can I make animated cursors?** — Animated cursor (.ani) support is coming soon.

### Questions (KO)
1. **커서를 어떻게 만들 수 있나요?** — Pointint에 이미지를 업로드하고, 위치와 핫스팟을 편집하고, 시뮬레이션으로 확인한 뒤 .cur 파일을 다운로드하세요.
2. **어떤 파일 형식을 지원하나요?** — PNG, JPG, WebP를 지원합니다. 배경 제거와 변환은 자동으로 처리됩니다.
3. **무료인가요?** — 네. 업로드, 편집, 시뮬레이션, 다운로드 모두 무료이며 계정이 필요 없습니다.
4. **Windows에 어떻게 적용하나요?** — 다운로드한 파일의 압축을 풀고, install.inf를 우클릭하여 "설치"를 선택한 뒤, 마우스 설정 > 포인터에서 "Pointint"를 선택하세요.
5. **핫스팟이 뭔가요?** — 클릭이 실제로 인식되는 정확한 픽셀 위치입니다. Pointint에서 드래그로 시각적으로 설정할 수 있습니다.
6. **애니메이션 커서도 만들 수 있나요?** — 애니메이션 커서(.ani) 지원이 곧 추가될 예정입니다.

## SEO/GEO

### Meta
- `<title>`: "Pointint — Your Point, Your Tint. | Custom Cursor Maker"
- `<meta name="description">`: "Turn your image into a custom Windows cursor. Upload, edit hotspot, simulate, and download .cur — free, no account needed."
- OG image: 정적 브랜드 이미지 (1200×630)

### First 200 Words (GEO)
히어로 + 흐름 소개 섹션의 텍스트가 자연스럽게 핵심 질문에 답함:
"Pointint turns your image into a custom Windows cursor. Upload PNG, JPG, or WebP, automatically remove the background, edit position and hotspot, simulate with Normal, Text, and Link states, and download a .cur file with a one-click installer."

### Structured Data
- `SoftwareApplication` schema (name, url, applicationCategory, offers)
- `FAQPage` schema (6 questions)

### Technical
- `sitemap.xml` 자동 생성 (Next.js)
- `robots.txt`
- `hreflang` 태그 (en, ko)

## Files to Create/Modify

| File | Action |
|---|---|
| `frontend/src/app/page.tsx` | 전체 리뉴얼 |
| `frontend/src/components/landing/Hero.tsx` | 새로 생성 |
| `frontend/src/components/landing/HowItWorks.tsx` | 새로 생성 |
| `frontend/src/components/landing/FAQ.tsx` | 새로 생성 |
| `frontend/src/components/landing/Footer.tsx` | 새로 생성 |
| `frontend/src/components/landing/ParticleCanvas.tsx` | 새로 생성 |
| `frontend/src/i18n/messages/en.json` | landing 키 추가 |
| `frontend/src/i18n/messages/ko.json` | landing 키 추가 |
| `frontend/src/app/layout.tsx` | JSON-LD 스키마 추가 |
| `frontend/public/cursors/signature.cur` | 시그니처 커서 파일 |
| `frontend/src/app/studio/page.tsx` | fromLanding 파일 로드 로직 |

## Constraints

- 보라색 금지
- 글래스모피즘, 뻔한 그라디언트 금지
- "AI가 만든 것 같은" 디자인 금지
- 카피는 짧고 감성적. 기능 나열 금지
- 모바일: 반응형 (파티클 비활성, CTA 중심)
- prefers-reduced-motion 존중 (파티클 + 빛 효과 비활성)

## Testing

- `npm run build` 에러 없음
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95
- 모바일 반응형: 375px, 768px, 1024px, 1440px
- JSON-LD 유효성 검증 (Google Rich Results Test)
- 다국어 전환 시 모든 텍스트 번역 확인
- 이미지 드롭 → /studio 전환 → 자동 업로드 흐름 확인

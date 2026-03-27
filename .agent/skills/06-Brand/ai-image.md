---
name: pointint-ai-image
description: Pointint AI 마케팅 비주얼 생성. Use when the user mentions AI 이미지, 마케팅 비주얼, 목업, 프로모 이미지 생성, FLUX, AI 아트, 소셜 비주얼, 또는 AI로 이미지를 생성해야 하는 상황.
---

# Pointint AI Image Generation

## Context

### 용도

Pointint 마케팅/프로모용 비주얼 생성. 제품 내 AI 기능과는 별개로, 마케팅 에셋 제작에 활용.

### 브랜드 비주얼 방향

- 미니멀, 여백 충분
- 커서가 화면 위에서 사용되는 장면
- 감성적이되 과하지 않은
- 기술적으로 보이면 안 됨
- 색은 분위기를 만든다

---

## Workflow

### 1. 시스템 스킬 체이닝

`ai-image-generation` 시스템 스킬 호출 → Pointint 브랜드 프롬프트 적용

### 2. 프롬프트 가이드

**기본 톤 키워드:**
- minimal, clean, soft light, warm tones, plenty of whitespace
- digital workspace, desktop customization, cursor on screen
- aesthetic, mood, personal touch

**금지 키워드:**
- neon, glitch, cyberpunk, tech-heavy, complex UI
- crowded, busy, cluttered
- corporate, stock photo feel

### 3. 용도별 프롬프트 템플릿

**소셜 포스트:**
```
A minimal desktop workspace with a custom cursor hovering over [subject],
soft warm lighting, clean background with plenty of whitespace,
aesthetic mood, digital personalization concept
```

**OG Image / 배너:**
```
Wide composition, minimal desktop screen showing custom cursor design,
soft gradient background, "Your Point, Your Tint" aesthetic,
clean and warm, no text overlay
```

**프로세스 시각화:**
```
Step-by-step visual of image transforming into a cursor icon,
clean minimal style, soft colors, gentle transitions,
before-and-after concept
```

### 4. 생성 후 처리

- 사이즈/크롭 → 에셋 용도에 맞게 조정
- 텍스트 오버레이 → 별도 도구로 (AI 생성 텍스트는 부정확)
- 저작권 → 생성 모델 라이선스 확인

### 5. 저장 위치

- `docs/assets/` (외부 공유용)
- 프로젝트 `public/images/` (사이트용)

## Constraints

- AI 생성 이미지를 제품 내부 기능과 혼동하지 않는다 (마케팅용)
- 텍스트가 포함된 이미지는 AI 생성보다 수동 합성 권장
- 라이선스 확인 필수

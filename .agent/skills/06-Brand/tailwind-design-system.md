---
name: pointint-design-system
description: Pointint 디자인 시스템 (Tailwind CSS 토큰, 컴포넌트 규칙). Use when the user mentions 디자인 시스템, 디자인 토큰, Tailwind, CSS 변수, 테마, 다크 모드, 컬러 토큰, 스페이싱, 컴포넌트 스타일, 또는 일관된 UI 규칙이 필요한 상황.
---

# Pointint Design System (Tailwind)

## Context

### 기술 스택

- Tailwind CSS v4 (또는 최신)
- shadcn/ui 기반 컴포넌트
- Next.js App Router
- CSS 변수 기반 테마

### 브랜드 → 토큰 매핑

| 브랜드 원칙 | 디자인 토큰 방향 |
|---|---|
| 여백이 넉넉하다 | spacing 스케일 넉넉하게, 컨테이너 max-width 여유 |
| 색은 분위기를 만든다 | semantic color보다 mood color 우선 |
| 깔끔하되 차갑지 않다 | neutral에 약간의 warmth |
| 결과물이 비주얼 중심 | 배경은 결과물을 돋보이게 (저채도) |

---

## Workflow

### 1. 시스템 스킬 체이닝

`tailwind-design-system` 시스템 스킬 호출 → Pointint 브랜드 맥락 적용

### 2. 토큰 구조 가이드

**Color Tokens:**
```
--color-bg-primary      // 메인 배경
--color-bg-secondary    // 섹션 배경
--color-bg-canvas       // 에디터 캔버스 배경
--color-text-primary    // 본문
--color-text-secondary  // 보조 텍스트
--color-text-muted      // 비활성
--color-accent          // CTA, 강조
--color-accent-hover    // CTA hover
--color-border          // 경계선
--color-cursor-preview  // 커서 프리뷰 배경
```

**Spacing:**
- 넉넉한 여백: section gap ≥ 64px, 컴포넌트 내부 padding ≥ 16px
- 컨테이너: max-width 1200px, 좌우 패딩 충분히

**Typography:**
- 헤드라인: 브랜드 느낌 (세미볼드, 적당한 크기)
- 본문: 읽기 쉬움 (16px 이상, line-height 넉넉)
- 카피: 짧고 여백 안에서 돋보이게

**Border Radius:**
- 전반적으로 부드럽게 (rounded-lg ~ rounded-xl)
- 너무 둥글지도, 각지지도 않게

### 3. 컴포넌트 규칙

- shadcn/ui 기본 → Pointint 토큰으로 커스텀
- 버튼: accent color, hover 피드백 확실
- 입력: 넉넉한 높이, 포커스 링 부드럽게
- 카드: 미묘한 그림자, 배경 대비 약간
- 모달: 오버레이 투명도, 중심 배치

### 4. 변경 반영

1. 토큰 정의: `tailwind.config.ts` 또는 CSS 변수
2. 디자인 가이드: `point/11-Design/` 문서화
3. 컴포넌트: shadcn 커스터마이징

## Constraints

- 색상 팔레트 미확정 시 → 구조만 잡고 값은 CSS 변수로 교체 용이하게
- shadcn/ui 기본 구조 유지 — 과도한 커스텀은 유지보수 비용

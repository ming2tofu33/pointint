---
name: pointint-nextjs
description: Pointint Next.js 프론트엔드 구현 패턴. Use when the user mentions Next.js, App Router, RSC, 서버 컴포넌트, 클라이언트 컴포넌트, 라우팅, 미들웨어, 메타데이터, 이미지 최적화, 번들, SSR, ISR, 또는 Next.js 구현이 필요한 상황.
---

# Pointint Next.js Best Practices

## Context

### 기술 스택

- **Next.js** (App Router) — 프론트엔드 프레임워크
- **Vercel** — 호스팅 & 배포
- **FastAPI** — 백엔드 API (별도 서버)
- **Supabase** — DB + Auth
- **Tailwind CSS + shadcn/ui** — 스타일링

### 프로젝트 구조 방향

```
app/
├── (marketing)/       # 랜딩, 소개 페이지
├── (app)/             # 로그인 후 앱 영역
│   ├── editor/        # 커서 에디터
│   ├── projects/      # 프로젝트 목록
│   └── marketplace/   # 마켓플레이스
├── api/               # Route Handlers (필요 시)
└── layout.tsx
```

---

## Workflow

### 1. 시스템 스킬 체이닝

`next-best-practices` 시스템 스킬 호출 → Pointint 구조 맥락 적용

### 2. Pointint Next.js 규칙

**RSC / Client 경계:**
- 마케팅 페이지 → 서버 컴포넌트 (SEO, 초기 로딩)
- 에디터/캔버스 → 클라이언트 컴포넌트 (인터랙션 집약)
- 리스트/카드 → 서버 컴포넌트 + 클라이언트 인터랙션 분리

**데이터 패턴:**
- Supabase 호출 → 서버 컴포넌트에서 직접 또는 Route Handler
- FastAPI 호출 → fetch (서버/클라이언트 상황에 맞게)
- 인증 → Supabase Auth + 미들웨어

**메타데이터:**
- 모든 페이지에 metadata export
- OG Image → `opengraph-image.tsx` 또는 정적 이미지
- SEO 키워드: 커스텀 커서, Windows 커서, 커서 만들기

**이미지 최적화:**
- `next/image` 사용
- 커서 프리뷰: WebP/AVIF, 적절한 sizes
- 마켓플레이스 썸네일: blur placeholder

**성능:**
- 에디터 페이지: dynamic import (캔버스 라이브러리)
- 번들 분석: 주기적 확인
- Route Segment Config: 필요 시 설정

### 3. 변경 반영

1. 소스 코드: 프로젝트 디렉토리
2. 기능 문서: `point/03-Features/` 참조
3. 기술 스택: `point/01-Core/Tech-Stack.md` 참조

## Constraints

- Phase 1 Wave 1은 프로젝트 초기화부터 시작 (P1-SETUP-01)
- 백엔드는 FastAPI 별도 서버 — Next.js API Routes는 보조적으로만
- Supabase 직접 호출과 FastAPI 호출의 경계를 명확히

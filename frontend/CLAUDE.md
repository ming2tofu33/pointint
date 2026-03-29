# Frontend Rules

Next.js 15 + React 19 + Tailwind CSS v4 + Vercel.

## Next.js

- App Router 사용. Pages Router 사용 금지.
- 에디터(Canvas) 페이지는 `"use client"` 선언. Server Components 사용하지 않는다.
- 랜딩, 가이드 등 정적 페이지만 SSR/SSG 활용.
- API Route는 `src/app/api/` 에 둔다. 백엔드 프록시 용도로만 사용.

## Tailwind v4

- `@tailwindcss/postcss` 사용.
- 테마 토큰은 `src/app/globals.css`에 CSS 변수로 관리.
- 컴포넌트 라이브러리 결정 전까지 Tailwind 유틸리티 직접 사용.

## i18n

- `next-intl` 사용. 설정: `src/i18n/request.ts`.
- 메시지 파일: `src/i18n/messages/` (en.json, ko.json).
- 모든 UI 텍스트는 번역 키 사용. 하드코딩 금지.

## Supabase

- 프론트엔드는 **Anon Key만** 사용 (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Service Role Key를 프론트엔드에서 절대 사용하지 않는다.
- Supabase 클라이언트: `src/lib/supabase.ts`.

## Security

- 환경변수 중 `NEXT_PUBLIC_` 접두사가 없는 값은 클라이언트에 노출되지 않도록 한다.
- API Route에서 백엔드 호출 시 인증 토큰을 서버 사이드에서만 처리.

## Project Structure

```
frontend/
├── src/
│   ├── app/          Pages & layouts (App Router)
│   ├── components/   Reusable UI components
│   ├── lib/          Utilities & clients (supabase, api)
│   └── i18n/         Internationalization config & messages
├── public/           Static assets
└── package.json
```

## Build

```bash
cd frontend && npm run build   # must pass with 0 errors
```

## Dev

```bash
cd frontend && npm run dev     # http://localhost:3000
```

## Forbidden Patterns

- `pages/` 디렉토리 사용 금지 (App Router만 사용).
- `getServerSideProps`, `getStaticProps` 사용 금지 (App Router 패턴 사용).
- Service Role Key를 클라이언트 코드에 노출하지 않는다.
- `node_modules/` 직접 수정 금지.

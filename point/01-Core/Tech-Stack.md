---
title: Tech Stack
tags:
  - pointint
  - core
  - tech
aliases:
  - Pointint Stack
---

# Tech Stack

> **Status:** 확정
> **Last Updated:** 2026-03-27

## 1. 확정 스택

| 레이어 | 기술 | 역할 |
|---|---|---|
| 프론트엔드 | **Next.js (React)** | UI, 캔버스 편집기, 시뮬레이션 |
| 백엔드 | **FastAPI (Python)** | 배경 제거, .cur/.ani 생성, 이미지 처리 |
| DB | **Supabase (Postgres)** | 유저, 프로젝트, 마켓플레이스 데이터 |
| 인증 | **Supabase Auth** | 로그인/가입 |
| 스토리지 | **Supabase Storage** | 업로드 이미지, 결과물 |
| 프론트 배포 | **Vercel** | Next.js 배포 |
| 백엔드 배포 | **Railway** | FastAPI 서버 배포 |

## 2. 구조

```
[사용자 브라우저]
    ↕
[Next.js — Vercel]
    ↕
[FastAPI — Railway]
    ↕
[Supabase (DB + Auth + Storage)]
```

### 역할 분리

- **Next.js:** UI 렌더링, 캔버스 편집기, 시뮬레이션, Supabase Auth 연동
- **FastAPI:** 배경 제거(AI), 이미지 전처리, .cur/.ani 바이너리 생성, 파일 변환
- **Supabase:** 데이터 저장, 인증, 파일 저장

## 3. 선택 근거

### Next.js + React

- 캔버스 기반 편집기 구현에 React 생태계 활용 (Canvas API, Fabric.js 등)
- Vercel 무료 티어로 초기 배포 충분
- SSR/SSG로 랜딩 SEO 대응

### FastAPI (별도 백엔드)

- 배경 제거(rembg 등)는 Python 생태계가 압도적
- .cur/.ani 바이너리 처리도 Python 라이브러리가 풍부
- 서버리스 제약(cold start, 실행 시간) 없이 상시 운영 가능
- Guest 무제한 정책에 대응 가능

### Supabase

- Postgres 기반이라 마켓플레이스, 판매, 내부 재화 같은 관계형 데이터에 강함
- Auth, Storage, Realtime을 한번에 제공
- 오픈소스, 무료 티어 넉넉

### Railway

- Git push 배포로 빠른 셋업
- MVP 속도 우선
- 이후 트래픽 증가 시 Cloud Run 등으로 전환 가능

## 4. 이후 결정이 필요한 것

- [ ] 캔버스 라이브러리 선택 (Canvas API 직접 vs Fabric.js vs Konva 등)
- [ ] 배경 제거 모델 선택 (rembg vs 외부 API vs 기타)
- [ ] .cur/.ani 생성 라이브러리 또는 직접 구현 범위
- [ ] GIF 파싱 라이브러리 선택
- [ ] Supabase 스키마 설계
- [ ] CI/CD 파이프라인

## Related

- [[Project-Vision]]
- [[Roadmap]]

## See Also

- [[06-Implementation/ACTIVE_SPRINT]]

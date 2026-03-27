---
title: ACTIVE SPRINT
tags:
  - pointint
  - sprint
  - active
aliases:
  - Current Sprint
---

# ACTIVE SPRINT — Phase 1 MVP Core

> **스프린트 기간:** 2026-03-27~진행 중
> **마지막 업데이트:** 2026-03-27
> **목표:** 정적 커서(.cur) 제작 흐름 완결 + 배포
> **Phase Flow:** [[plans/2026-03-27-implementation-phase-flow]]
> **Implementation Plan:** [[Implementation-Plan]]
> **North Star:** 제작 완료율 (업로드 시작 → 다운로드 완료)

---

## 기반 완료

- [x] 01-Core 갱신 (Vision, Target, Stack, Roadmap)
- [x] 브랜드 철학 정의
- [x] 기능 상세 확정
- [x] Windows 커서 스펙 정리
- [x] AI 전략 상세
- [x] 운영 정책 + 콘텐츠 정책
- [x] 비즈니스 상세 (Tint Economy, 티어, 마켓플레이스)
- [x] 기술 스택 확정 (Next.js + FastAPI + Supabase)
- [x] Phase Flow + Implementation Plan 작성
- [x] 프로젝트 구조 세팅 (frontend/ + backend/)
- [x] Git 초기화 + remote 연결

---

## Phase 1 Wave 1: 프로젝트 셋업 + 백엔드 코어

| Task ID | 제목 | 상태 | 우선도 | 비고 |
|---|---|---|---|---|
| P1-SETUP-01 | Next.js 프로젝트 초기화 + Vercel 연결 | todo | P0 | 구조 생성 완료, 의존성 설치 + Vercel 배포 필요 |
| P1-SETUP-02 | FastAPI 프로젝트 초기화 + Railway 배포 | todo | P0 | 구조 생성 완료, venv + Railway 배포 필요 |
| P1-SETUP-03 | 프론트↔백엔드 API 통신 구조 확정 | todo | P0 | |
| P1-BG-01 | 자동 배경 제거 엔드포인트 (rembg 자체호스팅) | todo | P0 | |
| P1-CONVERT-01 | 파일 변환 (JPG/WebP → 투명 PNG) | todo | P0 | |
| P1-CUR-01 | .cur 바이너리 생성 로직 | todo | P0 | |

## Phase 1 Wave 2: 편집기 + 시뮬레이션 + 품질 검증

| Task ID | 제목 | 상태 | 우선도 |
|---|---|---|---|
| P1-UPLOAD-01 | 이미지 업로드 UI (PNG/JPG/WebP) | todo | P0 |
| P1-EDITOR-01 | 정적 커서 편집기 — 캔버스, 위치/크기 조정 | todo | P0 |
| P1-EDITOR-02 | Hotspot 드래그 지정 UI | todo | P0 |
| P1-HOTSPOT-01 | Hotspot 자동 추천 (규칙 기반: 뾰족한 끝점 탐지) | todo | P1 |
| P1-SIM-01 | 시뮬레이션 — 3종 미리보기 (Normal/Text/Link) | todo | P0 |
| P1-MOCKUP-01 | 실제 크기 데스크톱 목업 (밝은/어두운 배경 위 32px) | todo | P1 |
| P1-HEALTH-01 | 커서 건강 체크 (배경별 가시성, Hotspot 위치, 32px 가독성) | todo | P0 |

## Phase 1 Wave 3: 다운로드 + 적용 + 랜딩

| Task ID | 제목 | 상태 | 우선도 |
|---|---|---|---|
| P1-DL-01 | .cur 다운로드 | todo | P0 |
| P1-INF-01 | .inf 자동 설치 파일 생성 (원클릭 적용) | todo | P0 |
| P1-RESTORE-01 | 기본 커서 원복 .inf 포함 (다운로드 zip에 동봉) | todo | P0 |
| P1-GUIDE-01 | 적용 가이드 화면 (다운로드 직후 표시) | todo | P0 |
| P1-LANDING-01 | 랜딩 페이지 ("Your Point, Your Tint.") + SEO + GEO | todo | P0 |
| P1-SHOWCASE-01 | 커서 쇼케이스 카드 이미지 자동 생성 (소셜 공유용) | todo | P1 |
| P1-DEFENSE-01 | 파일 크기/해상도 제한 (기본 validation) | todo | P1 |

---

## Current Doing

| Task ID | 제목 | 상태 | 비고 |
|---|---|---|---|
| P1-SETUP-01 | Next.js 초기화 + Vercel | todo | 다음 착수 대상 |
| P1-SETUP-02 | FastAPI 초기화 + Railway | todo | SETUP-01과 병렬 가능 |

---

## Phase 1 Gate → Phase 1.5

| # | 게이트 | 상태 | 기준 |
|---|---|---|---|
| 1 | .cur 제작 흐름 완결 | ⏳ | 업로드→편집→Hotspot→다운로드 끊김 없음 |
| 2 | 시뮬레이션 동작 | ⏳ | 3종 미리보기 동작 |
| 3 | 건강 체크 동작 | ⏳ | 다운로드 전 가시성/Hotspot 진단 표시 |
| 4 | .inf 적용 동작 | ⏳ | 더블클릭으로 커서 적용 + 원복 동작 |
| 5 | 배포 안정성 | ⏳ | Vercel + Railway 안정 운영 |

---

## 다음 세션 권장 작업

1. P1-SETUP-01 + P1-SETUP-02 (병렬) — 의존성 설치, 배포 연결, health check 확인
2. P1-SETUP-03 — API 통신 구조 확정
3. P1-BG-01 + P1-CONVERT-01 + P1-CUR-01 — 백엔드 코어 로직

---

## References

- [[plans/2026-03-27-implementation-phase-flow]] ← Phase 전체 태스크 상세
- [[Implementation-Plan]] ← 실행 규칙 (Hard Gates, DoD, Task Template)
- [[Phase-Flow]] ← Phase 조감도 + 머메이드 차트
- [[plans/2026-03-27-pointint-economy-design]] ← Tint Economy
- [[07-Brand/Brand-Index]]
- [[08-Business/Business-Index]]
- [[09-Research/Research-Index]]

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
> **마지막 업데이트:** 2026-03-29
> **목표:** 정적 커서(.cur) 제작 흐름 완결 + 배포
> **Phase Flow:** [[plans/2026-03-27-implementation-phase-flow]]
> **Implementation Plan:** [[Implementation-Plan]]
> **North Star:** 제작 완료율 (업로드 시작 → 다운로드 완료)

---

## Current Goal

- Phase 1 MVP의 마지막 미구현 항목인 `P1-LANDING-01`을 완료해서 랜딩 페이지 게이트를 닫는다.
- 랜딩 방향이 정리되면 `P1-SHOWCASE-01`과 후속 시각 자산 작업으로 연결한다.

## Current Doing

| Lane | Task | 상태 | 비고 |
|---|---|---|---|
| Now | `P1-LANDING-01` | ready | Phase 1 gate를 닫기 위한 최우선 작업 |
| Next | `P1-SHOWCASE-01` | queued | 랜딩 카피/비주얼 방향 확정 후 착수 |
| Later | `P1-HOTSPOT-01` | queued | 규칙 기반 추천 로직 설계 필요 |

## Next Session

- `P1-LANDING-01` 범위를 확정한다: hero, 핵심 가치 제안, 사용 흐름, FAQ, SEO/GEO 카피
- 랜딩 페이지 구현과 메타데이터/공유 카드 요구사항을 함께 정리한다
- 랜딩 방향 확정 후 `P1-SHOWCASE-01`의 이미지 스타일과 제작 범위를 결정한다

## Blockers

- 기술적 blocker는 없음
- 제품 결정 필요: 랜딩 톤앤매너, FAQ 범위, 쇼케이스 비주얼 스타일

## Recently Done

- `.cur` 다운로드 패키지와 `.inf` 설치/원복 흐름을 완결했다
- 적용 가이드 모달, 모바일 가드, 접근성 개선, 다국어 한/영 지원을 마쳤다
- 배경 제거, 편집기, 시뮬레이션, 건강 체크를 포함한 핵심 제작 플로우를 배포했다

---

## Wave 1: 프로젝트 셋업 + 백엔드 코어 ✅

| Task ID | 제목 | 상태 | 비고 |
|---|---|---|---|
| P1-SETUP-01 | Next.js + Vercel + pointtint.com | ✅ done | |
| P1-SETUP-02 | FastAPI + Railway | ✅ done | |
| P1-SETUP-03 | 프론트↔백엔드 API 통신 | ✅ done | health check 확인 |
| P1-BG-01 | 배경 제거 (HF Space BiRefNet) | ✅ done | Railway → HF Space 연동 |
| P1-CONVERT-01 | 파일 변환 (JPG/WebP → PNG) | ✅ done | |
| P1-CUR-01 | .cur 바이너리 생성 | ✅ done | BMP/DIB 형식 |

## Wave 2: 편집기 + 시뮬레이션 + 품질 검증 ✅

| Task ID | 제목 | 상태 | 비고 |
|---|---|---|---|
| P1-UPLOAD-01 | 이미지 업로드 UI | ✅ done | 드래그앤드롭 + 배경 제거 선택 |
| P1-EDITOR-01 | 캔버스 위치/크기 조정 | ✅ done | |
| P1-EDITOR-02 | Hotspot 드래그 지정 | ✅ done | |
| P1-SIM-01 | 시뮬레이션 3종 | ✅ done | 미리보기 + 인터랙티브 + Light/Dark |
| P1-HEALTH-01 | 커서 건강 체크 | ✅ done | 가시성/Hotspot/가독성 |

## Wave 3: 다운로드 + 적용 + 랜딩

| Task ID | 제목 | 상태 | 비고 |
|---|---|---|---|
| P1-DL-01 | .cur 다운로드 (zip 패키징) | ✅ done | cur + install.inf + restore.inf |
| P1-INF-01 | .inf 자동 설치 | ✅ done | Schemes 레지스트리 등록 |
| P1-RESTORE-01 | 원복 .inf | ✅ done | |
| P1-GUIDE-01 | 적용 가이드 모달 | ✅ done | 4단계 안내 + 다운로드 성공 배지 |
| P1-DEFENSE-01 | 파일 크기/해상도 제한 | ✅ done | 16~4096px |
| P1-LANDING-01 | 랜딩 페이지 + SEO/GEO | ❌ todo | **미구현** |
| P1-SHOWCASE-01 | 쇼케이스 카드 이미지 | ❌ todo | |

## UX 개선 ✅

| Task | 상태 | 비고 |
|---|---|---|
| 배경 제거 건너뛰기 | ✅ done | Remove BG / Use as-is 선택 |
| 시뮬레이션 정확도 | ✅ done | 32px + Hotspot offset 반영 |
| 실제 크기 미리보기 | ✅ done | 밝은/어두운 배경 |
| 원본 보기 + 재시도 | ✅ done | Show original / Retry BG |
| 커서 크기 선택 | ✅ done | 32/48/64 |
| 파일명 지정 + 경고 | ✅ done | 위험 문자 자동 제거 + 팝업 |
| 접근성 (focus, aria, role) | ✅ done | |
| 모바일 가드 | ✅ done | 1024px 미만 안내 |
| prefers-reduced-motion | ✅ done | |
| 다국어 한/영 | ✅ done | next-intl |

---

## 남은 작업

| Task | 우선도 | 비고 |
|---|---|---|
| **P1-LANDING-01** | P0 | 랜딩 페이지 + SEO/GEO + FAQ (CSS 빛 + Canvas 파티클) |
| P1-LANDING-02 | P1 | 히어로 WebGL 셰이더 업그레이드 (현재 CSS+Canvas → WebGL) |
| P1-HOTSPOT-01 | P1 | Hotspot 자동 추천 (규칙 기반) |
| P1-MOCKUP-01 | P1 | 데스크톱 목업 |
| P1-SHOWCASE-01 | P1 | 소셜 공유 카드 이미지 |

---

## Phase 1 Gate → Phase 1.5

| # | 게이트 | 상태 | 기준 |
|---|---|---|---|
| 1 | .cur 제작 흐름 완결 | ✅ | 업로드→편집→Hotspot→다운로드 |
| 2 | 시뮬레이션 동작 | ✅ | 미리보기 + 인터랙티브 |
| 3 | 건강 체크 동작 | ✅ | 다운로드 전 진단 표시 |
| 4 | .inf 적용 동작 | ✅ | 스킴 레지스트리 등록 |
| 5 | 배포 안정성 | ✅ | Vercel + Railway + HF Space |
| 6 | 랜딩 페이지 | ⏳ | P1-LANDING-01 미구현 |

---

## References

- [[plans/2026-03-27-implementation-phase-flow]]
- [[Implementation-Plan]]
- [[Phase-Flow]]
- [[plans/2026-03-27-pointint-economy-design]]

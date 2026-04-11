---
title: ACTIVE SPRINT
tags:
  - pointint
  - sprint
  - active
aliases:
  - Current Sprint
---

# ACTIVE SPRINT — Phase 1 MVP Core / Post-Gate Follow-up

> **스프린트 기간:** 2026-03-27~진행 중
> **마지막 업데이트:** 2026-04-11
> **상태:** Phase 1 게이트 클로즈 완료, 후속 작업 스프린트 유지 중
> **목표:** 랜딩 이후 유입 표면 강화 + 스튜디오 신뢰도 보강
> **Phase Flow:** [[plans/2026-03-27-implementation-phase-flow]]
> **Implementation Plan:** [[Implementation-Plan]]
> **운영 보강 계획:** [[plans/2026-04-11-document-ops-refresh]]
> **North Star:** 제작 완료율 (업로드 시작 → 다운로드 완료)

---

## Current Goal

- 이미 배포된 Phase 1 코어와 랜딩 결과를 문서 기준선에 맞게 고정한다.
- 편집기 신뢰도 보강 작업(`P1-EDITOR-03`)을 `preview = export` 계약 기준으로 리뷰/마무리한다.
- 다음 제품 작업은 `P1-SHOWCASE-01`을 우선으로 두고, 이어서 `P1-HOTSPOT-01`과 `P1-MOCKUP-01`을 연결한다.
- Phase 1 게이트는 닫혔지만, Phase 1.5로 바로 넘어가기 전 acquisition/quality follow-up을 정리한다.

## Current Doing

> **운영 규칙:** 이 섹션은 active work만 추적한다. 완료된 작업은 `Recently Done`으로 이동하고, 7일 이상 근거가 없으면 `stale`, 14일 이상이면 `ghost` 후보로 본다.

| Lane | Task | 상태 | 비고 |
|---|---|---|---|
| Now | `P1-EDITOR-03` | in_review | 편집기 프레이밍 선택 + `preview = export` 일치화. 근거: `680584c`, `0d25d98`, `9dd1637`, `ac4a98f`, `86097bc`, `16c2402` |
| Next | `P1-SHOWCASE-01` | ready | 랜딩 이후 가장 직접적인 유입/공유 보강 작업 |
| Next | `P1-HOTSPOT-01` | scoped | 다운로드 직전 망설임을 줄일 수 있는 편집기 보조 기능 |
| Next | `P1-MOCKUP-01` | queued | 쇼케이스 비주얼 방향 확정 후 연결 |
| Watch | `P1-ANALYTICS-01` | queued | 후속 유입/완료율 측정은 showcase 범위 확정 뒤 착수 |

## Next Session

- `P1-EDITOR-03` 리뷰 코멘트를 반영하고 브라우저 상호작용 검증(비정사각형 입력 + contain/cover + hotspot 매핑)을 최종 확인한다
- `P1-SHOWCASE-01` 범위를 확정한다: 카드 비율, 장면 스타일, 카피 페어링, 생성 방식
- 쇼케이스를 정적 curated 카드로 먼저 갈지, 커서별 공유 자산 생성으로 먼저 갈지 결정한다
- `P1-HOTSPOT-01` 규칙 기반 추천의 입력값, 실패 케이스, UI 노출 수준을 스코프한다
- 필요 시 `P1-MOCKUP-01`을 쇼케이스와 같은 비주얼 시스템으로 묶는다

## Blockers

- 기술적 blocker는 없음
- 제품 결정 필요: 쇼케이스 비주얼 스타일, 데스크톱 목업 현실감 수준, hotspot 추천 휴리스틱 범위

## Recently Done

- `P1-LANDING-01` 완료: 랜딩 페이지, hero drop entry, how-it-works, FAQ, JSON-LD, i18n, sitemap, robots, OG 메타를 반영했다. 근거: `1a60df0`, `frontend/src/app/page.tsx`, `frontend/src/app/layout.tsx`, `frontend/src/app/sitemap.ts`
- `P1-LANDING-02` 완료: 랜딩 hero를 particle 기반에서 water surface 기반으로 업그레이드하고 파동 튜닝을 반복했다. 근거: `834290f`, `836c7ec`, `832f8be`, `89e2b61`, `452249f`
- `.cur` 다운로드 패키지와 `.inf` 설치/원복 흐름을 완결했다
- 적용 가이드, 모바일 가드, 접근성 개선, prefers-reduced-motion, 다국어 한/영 지원을 마쳤다

## Decision Follow-up

- 2026-04-11: Pointint 문서 운영 체계를 `Idea Mine` + `0to1log` 패턴으로 재정비한다. `Current Doing`은 active only로 유지하고, sprint/plan/phase/decision 문서를 같은 세션에서 함께 sync한다. 상세 기록: [[10-Journal/QUICK-DECISIONS]]
- 2026-04-11: 프레이밍 선택은 업로드 단계가 아니라 편집기에서 수행하고, `preview = export`를 제품 계약으로 고정한다. 원본 비교는 레퍼런스 뷰로만 유지한다. 상세 기록: [[10-Journal/QUICK-DECISIONS]]

## Document Follow-up

| Document | 이번 세션 반영 내용 | 상태 |
|---|---|---|
| `ACTIVE_SPRINT.md` | `P1-EDITOR-03` 활성 스냅샷(in review)과 next queue를 재동기화 | synced |
| `10-Journal/QUICK-DECISIONS.md` | 편집기 프레이밍 선택 + `preview = export` 계약을 append 기록 | synced |
| `plans/2026-04-11-framing-preview-export-parity.md` | 구현/검증 근거 커밋과 맞는 기준 문서로 유지 | up-to-date |

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

## Wave 2: 편집기 + 시뮬레이션 + 품질 검증

| Task ID | 제목 | 상태 | 비고 |
|---|---|---|---|
| P1-UPLOAD-01 | 이미지 업로드 UI | ✅ done | 드래그앤드롭 + 배경 제거 선택 |
| P1-EDITOR-01 | 캔버스 위치/크기 조정 | ✅ done | |
| P1-EDITOR-02 | Hotspot 드래그 지정 | ✅ done | |
| P1-EDITOR-03 | 프레이밍 선택 + preview/export 일치화 | 🟡 in_review | 편집기 내 `전체 보이기`(contain)/`가득 채우기`(cover), pan/zoom 유지, 정사각형 WYSIWYG 계약 |
| P1-HOTSPOT-01 | Hotspot 자동 추천 | ❌ todo | 규칙 기반 추천 로직 설계 필요 |
| P1-SIM-01 | 시뮬레이션 3종 | ✅ done | 미리보기 + 인터랙티브 + Light/Dark |
| P1-MOCKUP-01 | 실제 크기 데스크톱 목업 | ❌ todo | 쇼케이스 방향 확정 후 연결 |
| P1-HEALTH-01 | 커서 건강 체크 | ✅ done | 가시성/Hotspot/가독성 |

## Wave 3: 다운로드 + 적용 + 랜딩

| Task ID | 제목 | 상태 | 비고 |
|---|---|---|---|
| P1-DL-01 | .cur 다운로드 (zip 패키징) | ✅ done | cur + install.inf + restore.inf |
| P1-INF-01 | .inf 자동 설치 | ✅ done | Schemes 레지스트리 등록 |
| P1-RESTORE-01 | 원복 .inf | ✅ done | |
| P1-GUIDE-01 | 적용 가이드 모달 | ✅ done | 4단계 안내 + 다운로드 성공 배지 |
| P1-DEFENSE-01 | 파일 크기/해상도 제한 | ✅ done | 16~4096px |
| P1-LANDING-01 | 랜딩 페이지 + SEO/GEO | ✅ done | `1a60df0` |
| P1-LANDING-02 | 랜딩 hero water surface 업그레이드 | ✅ done | `834290f` → `452249f` |
| P1-SHOWCASE-01 | 쇼케이스 카드 이미지 | ❌ todo | |
| P1-ANALYTICS-01 | 단계별 이벤트 추적 | ❌ todo | landing 이후 완료율 추적 보강 |

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
| **P1-EDITOR-03** | P0 (in review) | 편집기 정사각형 프리뷰와 최종 export 일치 계약 마무리/리뷰 반영 |
| **P1-SHOWCASE-01** | P0 | 랜딩 이후 공유/신뢰 보강용 쇼케이스 카드 시스템 |
| P1-HOTSPOT-01 | P1 | Hotspot 자동 추천 (규칙 기반) |
| P1-MOCKUP-01 | P1 | 데스크톱 목업 |
| P1-ANALYTICS-01 | P1 | landing/showcase 이후 완료율 측정 |

---

## Phase 1 Gate → Phase 1.5

| # | 게이트 | 상태 | 기준 |
|---|---|---|---|
| 1 | .cur 제작 흐름 완결 | ✅ | 업로드→편집→Hotspot→다운로드 |
| 2 | 시뮬레이션 동작 | ✅ | 미리보기 + 인터랙티브 |
| 3 | 건강 체크 동작 | ✅ | 다운로드 전 진단 표시 |
| 4 | .inf 적용 동작 | ✅ | 스킴 레지스트리 등록 |
| 5 | 배포 안정성 | ✅ | Vercel + Railway + HF Space |
| 6 | 랜딩 페이지 | ✅ | 랜딩 + SEO/GEO + FAQ + OG 동작 |

## Transition Note

- Phase 1 게이트는 닫혔다.
- 현재 editor confidence follow-up(`P1-EDITOR-03`)은 feature branch에서 구현/검증 완료 후 리뷰 단계다. main 반영 전까지는 active snapshot으로 관리한다.
- 다음 선택지는 두 가지다: `P1-EDITOR-03` 리뷰를 닫고 `P1-SHOWCASE-01`까지 연결한 뒤 새 스프린트를 열거나, 지금 상태를 기준으로 `Phase 1.5` 계획을 시작한다.
- 현재 기준 추천은 `P1-EDITOR-03` 리뷰를 먼저 닫고 showcase/hotspot follow-up을 짧게 정리한 뒤 다음 스프린트 선언이다.

## References

- [[plans/2026-03-27-implementation-phase-flow]]
- [[plans/2026-04-11-document-ops-refresh]]
- [[plans/2026-04-11-framing-preview-export-parity]]
- [[Implementation-Plan]]
- [[Phase-Flow]]
- [[plans/2026-03-27-pointint-economy-design]]

## Studio Workflow Picker Follow-up

- Studio now enters through a CUR/ANI workflow picker before the CUR upload path.
- ANI options are visible but disabled as Soon until real ANI inputs/export exist.

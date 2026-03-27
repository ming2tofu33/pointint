---
title: Implementation Plan
tags:
  - pointint
  - implementation
  - execution-contract
aliases:
  - Execution Contract
  - 실행 계약서
---

# Implementation Plan

> **Status:** Active
> **Last Updated:** 2026-03-27
> **Purpose:** 실행 규칙 계약서. 빠른 구현 속도를 유지하면서 핵심 리스크를 방어하는 규칙.

---

## Hard Gates (모든 Phase 공통)

1. **API 스키마 변경 시 프론트/백 동시 반영.** 한쪽만 바꾸는 커밋 금지.
2. **Task 완료 시 검증 커맨드 + 통과 조건 기록.** `status=done`에는 반드시 근거가 있어야 한다.
3. **ACTIVE_SPRINT Task ID는 Phase 접두사를 사용하고 기존 ID와 충돌하지 않아야 한다.** (e.g., P1-SETUP-01, P2a-AUTH-01)
4. **BLOCKING 태스크는 Gate 통과 전 반드시 해결.** 법률 검토, 약관 준비 등.
5. **`.env` 커밋 금지.** `.env.example`만 커밋한다.

---

## DoD (Definition of Done) 최소 규칙

- `status=done` → ✅ + 근거(변경 내역, 검증 결과, 스크린샷 중 하나 이상)
- 코드 변경 후 관련 문서(ACTIVE_SPRINT, Phase-Flow 등)를 동기화한다
- 실패 시 `blocked` 또는 `review`로 전환하고 원인 1줄을 남긴다
- 커밋 메시지는 `feat:` `fix:` `chore:` `docs:` 접두사를 사용한다

---

## Phase Flow

```
Phase 1: MVP Core ◄── 현재 (준비 중)
  .cur + .ani 제작, 다국어 한/영, SEO+GEO
  Guest 무제한
      │
      ▼  Gate: 제작→다운로드 완료율, 시뮬 사용률
Phase 2a: Auth + Storage
  로그인, 저장, 17종, Free 티어
      │
      ▼
Phase 2b: Install
  .inf 자동 설치
      │
      ▼  Gate: Guest→Free 전환율, 저장 사용률
Phase 3a: AI-Assisted
  AI 보조 편집, Lite 티어 (₩3,900)
      │
      ├──▶ Phase 3b: Community (병렬)
      │      쇼케이스, 공유, 프로필
      │
      ▼  Gate: Free→Lite 전환율
Phase 4: AI Generation (3b와 병렬)
  AI 커서 생성, Pro 티어 (₩9,900)
      │
      ▼  Gate: Lite→Pro 전환율, 법률 검토
Phase 5a: Marketplace
  판매/구매, 내부 재화, 수수료
      │
      ▼  Gate: 마켓 활성
Phase 5b: Moniterior
  배경화면, 펫, 테마팩
```

상세: [[Phase-Flow]]

---

## Current Status

| Phase | 상태 | 비고 |
|---|---|---|
| Phase 1: MVP Core | 🔄 준비 중 | 프로젝트 구조 세팅 완료, 구현 착수 전 |
| Phase 2a~5b | ⏳ 대기 | — |

---

## Phase 1 실행 계획

### Wave 구조

| Wave | 범위 | 핵심 산출물 |
|---|---|---|
| Wave 1 | 프로젝트 셋업 + 백엔드 코어 | Next.js 동작, FastAPI 동작, 배경 제거, .cur/.ani 생성 |
| Wave 2 | 편집기 + 시뮬레이션 | 캔버스 편집기, Hotspot UI, 시뮬레이션, .ani 프레임 편집 |
| Wave 3 | 다운로드 + 랜딩 + 방어 | 다운로드 흐름, 적용 가이드, 랜딩(SEO+GEO), 봇 방어 |

### Wave 1 태스크

| Task ID | 제목 | 상태 | 우선도 |
|---|---|---|---|
| P1-SETUP-01 | Next.js 프로젝트 초기화 + Vercel 연결 | todo | P0 |
| P1-SETUP-02 | FastAPI 프로젝트 초기화 + Railway 배포 | todo | P0 |
| P1-SETUP-03 | 프론트↔백엔드 API 통신 구조 확정 | todo | P0 |
| P1-BG-01 | 자동 배경 제거 엔드포인트 (rembg) | todo | P0 |
| P1-CONVERT-01 | 파일 변환 (JPG/WebP → 투명 PNG) | todo | P0 |
| P1-CUR-01 | .cur 바이너리 생성 로직 | todo | P0 |
| P1-ANI-01 | .ani 바이너리 생성 로직 | todo | P0 |
| P1-GIF-01 | GIF → 프레임 분리 로직 | todo | P0 |

### Wave 2 태스크

| Task ID | 제목 | 상태 | 우선도 |
|---|---|---|---|
| P1-UPLOAD-01 | 이미지 업로드 UI (PNG/JPG/WebP/GIF) | todo | P0 |
| P1-EDITOR-01 | 정적 커서 편집기 — 캔버스, 위치/크기 조정 | todo | P0 |
| P1-EDITOR-02 | Hotspot 드래그 지정 UI | todo | P0 |
| P1-EDITOR-03 | 회전/뒤집기 | todo | P1 |
| P1-ANI-EDIT-01 | 애니메이션 편집기 — 프레임 순서/속도/추가/삭제 | todo | P0 |
| P1-ANI-EDIT-02 | 애니메이션 미리보기 (실시간 재생) | todo | P0 |
| P1-SIM-01 | 시뮬레이션 — 미리보기 영역 (3종 한눈에) | todo | P0 |
| P1-SIM-02 | 시뮬레이션 — 인터랙티브 존 (실제 상황 재현) | todo | P0 |
| P1-SIM-03 | Light / Dark 배경 전환 | todo | P1 |
| P1-SIM-04 | .ani 애니메이션 시뮬레이션 재생 | todo | P0 |

### Wave 3 태스크

| Task ID | 제목 | 상태 | 우선도 |
|---|---|---|---|
| P1-DL-01 | 개별 다운로드 (.cur / .ani) | todo | P0 |
| P1-DL-02 | 세트 다운로드 (zip 패키징) | todo | P0 |
| P1-GUIDE-01 | 적용 가이드 화면 (다운로드 직후 표시) | todo | P0 |
| P1-GUIDE-02 | 원복 가이드 | todo | P1 |
| P1-LANDING-01 | 랜딩 페이지 ("Your Point, Your Tint.") + SEO + GEO | todo | P0 |
| P1-I18N-01 | 다국어 한/영 적용 | todo | P0 |
| P1-MOBILE-01 | 랜딩 + 가이드 모바일 반응형 | todo | P0 |
| P1-OG-01 | 소셜 공유 메타 (정적 OG image) | todo | P1 |
| P1-DEFENSE-01 | Rate limiting + 봇 탐지 | todo | P1 |
| P1-DEFENSE-02 | 파일 크기/해상도 제한 | todo | P1 |
| P1-DEFENSE-03 | 동일 이미지 캐싱 | todo | P2 |

### Phase 1 Gate — Phase 2a 진입 조건

| # | 게이트 | 상태 | 기준 |
|---|---|---|---|
| 1 | .cur 제작 흐름 완결 | ⏳ | 업로드→다운로드 끊김 없음 |
| 2 | .ani 제작 흐름 완결 | ⏳ | GIF/멀티이미지→다운로드 끊김 없음 |
| 3 | 시뮬레이션 동작 | ⏳ | 미리보기 + 인터랙티브 둘 다 동작 |
| 4 | 적용 가이드 표시 | ⏳ | 다운로드 직후 가이드 노출 |
| 5 | 다국어 동작 | ⏳ | 한/영 전환 정상 |
| 6 | 봇 방어 동작 | ⏳ | 비정상 요청 차단 확인 |
| 7 | 배포 안정 | ⏳ | Vercel + Railway 안정 운영 |

---

## Phase별 법률 체크포인트

| Phase | 법률 체크 | 시급도 |
|---|---|---|
| Phase 2a | 기본 약관 + 면책 조항 | 필수 |
| Phase 3b | 공유 콘텐츠 정책 | 필수 |
| Phase 4 | AI 생성물 소유권 법률 검토 | BLOCKING |
| Phase 5a | DMCA, 마켓플레이스 약관, NSFW, 콘텐츠 정책 | BLOCKING |

상세: [[05-Operations/legal/Content-Policy]]

---

## Task Template

ACTIVE_SPRINT에 태스크를 추가할 때 아래 형식을 따른다.

```markdown
### P1-XXXX-NN: 태스크 제목

- **Status:** todo / doing / done / blocked
- **Purpose:** 이 태스크가 존재하는 이유
- **Deliverables:** 구체적 산출물
- **Completion Criteria:** 완료 조건
- **Verification:** 검증 커맨드 또는 확인 방법
- **Pass Condition:** 통과 기준
- **Evidence:** (완료 시) 근거 링크
- **Dependencies:** 선행 태스크
```

간단한 태스크는 테이블 형식으로 축약 가능하되, `status=done` 시 근거는 반드시 남긴다.

---

## ACTIVE_SPRINT 연동 규칙

- 같은 Phase 작업 → ACTIVE_SPRINT를 먼저 참조
- Phase 전환/Gate 판단 → 이 문서와 Phase-Flow를 함께 확인
- Task 상태 변경 시 ACTIVE_SPRINT의 Current Doing 테이블을 동기화
- Wave 단위로 작업하되, Wave 간 의존성이 없는 태스크는 병렬 가능

---

## 참고 문서

- [[Phase-Flow]] — Phase별 범위, 게이트, 머메이드 차트
- [[ACTIVE_SPRINT]] — 현재 스프린트 상태
- [[01-Core/Tech-Stack]] — 기술 스택
- [[01-Core/Roadmap]] — 제품 로드맵
- [[05-Operations/legal/Content-Policy]] — 법률/콘텐츠 정책

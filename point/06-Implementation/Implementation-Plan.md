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
> **Last Updated:** 2026-04-11
> **Purpose:** 구현 속도를 유지하면서 문서 드리프트와 재작업을 막는 실행 계약 문서.

---

## 문서 역할 분리

| 문서 | 역할 | 갱신 시점 |
|---|---|---|
| `CLAUDE.md` | 세션 운영 규칙, 문서 follow-up 원칙 | 작업 방식이 바뀔 때 |
| `point/06-Implementation/ACTIVE_SPRINT.md` | 지금 실제로 굴러가는 스프린트 snapshot | 상태 변경, 우선순위 변경, 세션 종료 시 |
| `point/06-Implementation/Phase-Flow.md` | 상위 Phase 조감도, 현재 단계, 다음 Phase 후보 | Gate/Phase 상태가 바뀔 때 |
| `point/06-Implementation/plans/2026-03-27-implementation-phase-flow.md` | Task/Wave/Gate의 상세 기준본 | 태스크 상태나 게이트 근거가 바뀔 때 |
| `point/06-Implementation/plans/*.md` | 개별 기능/작업 계획 | 새 다단계 작업을 만들 때 |
| `point/10-Journal/QUICK-DECISIONS.md` | append-only 주요 판단 기록 | 방향/전략/운영 결정이 생길 때 |

---

## Hard Gates

1. **API/DB/타입 계약은 함께 바꾼다.** 한쪽만 바꾸는 커밋 금지.
2. **`done`에는 검증과 근거가 있어야 한다.** 변경 파일, 커밋, 테스트, 스크린샷, 동작 확인 중 최소 하나를 남긴다.
3. **Gate가 바뀌면 관련 문서를 같은 세션에서 함께 sync한다.** 최소 범위는 `ACTIVE_SPRINT`, 관련 plan, `Phase-Flow`, 필요 시 `QUICK-DECISIONS`다.
4. **`Current Doing`은 active work만 추적한다.** 완료된 항목은 `Recently Done`으로 이동하고, 오래 방치된 항목은 `stale` 또는 `ghost`로 표기한다.
5. **새로운 다단계 작업은 plan부터 만든다.** 단순 오타 수정, 1줄 수정, 순수 동기화 작업만 예외다.
6. **BLOCKING 태스크는 Gate 통과 전 반드시 해결한다.** 법률, 권리, 정책, 결제 경계는 예외가 없다.
7. **내부 진실 소스는 항상 `point/`다.** `docs/`는 외부 공유용 사본을 명시적으로 요청받았을 때만 만든다.
8. **`.env`는 절대 커밋하지 않는다.** `.env.example`만 허용한다.

---

## 상태와 추적 규칙

### ACTIVE_SPRINT 상태 운영

- `Current Doing` 권장 상태값: `ready`, `in_progress`, `blocked`, `stale`, `ghost`, `queued`, `scoped`
- Wave/Task 테이블 권장 상태값: `todo`, `done`, `blocked`
- `done`은 evidence가 있을 때만 사용한다

### stale / ghost 규칙

- **stale:** 7일 이상 의미 있는 근거 갱신이나 커밋이 없는 active task
- **ghost:** 14일 이상 방치되었거나, 시작되었다고 적혀 있지만 근거/소유/범위가 불명확한 task
- `stale`나 `ghost`는 숨기지 않는다. 현재 스프린트에서 드러내고, drop/restart/re-scope 결정을 남긴다

---

## 문서 Follow-up 계약

### 1. 코드나 산출물이 바뀌면

- `ACTIVE_SPRINT.md`의 `Recently Done`, task table, gate 상태를 먼저 본다
- 상태가 변했으면 `Current Doing`과 `Next Session`을 같이 맞춘다

### 2. 새로운 계획이 생기면

- `point/06-Implementation/plans/YYYY-MM-DD-<topic>.md`에 plan을 만든다
- 필요 시 `Plans-Index.md`와 `ACTIVE_SPRINT.md`에 반영한다

### 3. Gate나 Phase 해석이 바뀌면

- `Phase-Flow.md`와 `plans/2026-03-27-implementation-phase-flow.md`를 함께 확인하고 갱신한다

### 4. 중요한 판단이 생기면

- `point/10-Journal/QUICK-DECISIONS.md`에 append-only로 기록한다
- 기존 판단을 뒤집는 경우에도 삭제하지 않고 새 항목으로 덧붙인다

---

## Current Status

| Phase | 상태 | 비고 |
|---|---|---|
| Phase 1: MVP Core | ✅ gate closed / follow-up running | 랜딩 포함 Gate 완료, showcase/hotspot 후속 작업 남음 |
| Phase 1.5: .ani + 확장 | 🟡 next candidate | 새 스프린트 선언 전 범위 정리 필요 |
| Phase 2~5 | ⏳ queued | 현재 Gate와 후속 정리 이후 |

---

## 최소 DoD

- `status=done`이면 근거가 남아 있다
- 관련 문서가 현재 현실과 어긋나지 않는다
- 실패 시 `blocked` 또는 `review`로 전환하고 원인 1줄을 남긴다
- 커밋 메시지는 `feat:`, `fix:`, `chore:`, `docs:` 접두사를 사용한다

---

## Task Template

ACTIVE_SPRINT나 개별 plan에서 다단계 작업을 적을 때 아래 필드를 기준으로 삼는다.

```markdown
### P1-XXXX-NN: 태스크 제목

- **Status:** todo / blocked / done
- **Purpose:** 왜 이 태스크가 필요한가
- **Deliverables:** 구체적 산출물
- **Completion Criteria:** 완료 조건
- **Verification:** 검증 커맨드 또는 확인 방법
- **Pass Condition:** 무엇을 통과로 볼지
- **Evidence:** 커밋 / 파일 / 스크린샷 / 로그
- **Dependencies:** 선행 태스크
```

간단한 task는 테이블로 축약해도 되지만, `done`에는 여전히 evidence가 필요하다.

---

## Related

- [[ACTIVE_SPRINT]] — 현재 실행 snapshot
- [[Phase-Flow]] — 상위 Phase 조감도
- [[plans/2026-03-27-implementation-phase-flow]] — Task/Wave/Gate 상세 기준본
- [[plans/Plans-Index]] — 활성 계획 허브
- [[10-Journal/QUICK-DECISIONS]] — 빠른 결정 로그

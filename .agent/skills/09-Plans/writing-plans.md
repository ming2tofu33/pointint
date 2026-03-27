---
name: pointint-plans
description: Pointint 구현 계획서 작성. Use when the user mentions 계획, plan, 구현 계획, 작업 계획, 설계 문서, Phase, Wave, 마일스톤, 스펙, 또는 구현 전 계획이 필요한 상황.
---

# Pointint Implementation Plans

## Context

### Planning Rules (from CLAUDE.md)

- 큰 작업은 먼저 `point/06-Implementation/plans/YYYY-MM-DD-<topic>.md` 형식의 계획 문서를 만든다
- 사소한 오타 수정, 1줄 수준 변경은 예외
- 내부 작업 기준은 `point/`를 우선한다

### 계획 체계

- **Phase:** 큰 단위 (Phase 1 MVP, Phase 2 AI 등)
- **Wave:** Phase 내 실행 단위 (Wave 1 Setup, Wave 2 Core 등)
- **Task:** Wave 내 개별 작업 (P1-SETUP-01 등)

### 현재 상태

메인 구현 계획: `point/06-Implementation/plans/2026-03-27-implementation-phase-flow.md`
활성 스프린트: `point/06-Implementation/ACTIVE_SPRINT.md`

---

## Workflow

### 1. 시스템 스킬 체이닝

`writing-plans` 시스템 스킬 호출 → Pointint 계획 체계 적용

### 2. 계획서 작성 흐름

**Step 1: 범위 확인**
```
Read: point/06-Implementation/ACTIVE_SPRINT.md
Read: point/06-Implementation/plans/ (관련 계획 문서)
```

**Step 2: 계획서 구조**

```markdown
---
title: [계획 제목]
tags:
  - pointint
  - plan
  - [관련 태그]
---

# [계획 제목]

> **Status:** Draft / Active / Done
> **Created:** YYYY-MM-DD
> **Phase:** [Phase N]
> **Wave:** [Wave N]

## 목표
[이 계획이 달성하려는 것]

## 배경
[왜 이 계획이 필요한가]

## 범위
[포함/제외 항목]

## 태스크

| ID | 제목 | 의존성 | 예상 | 상태 |
|---|---|---|---|---|
| [ID] | [제목] | [선행 태스크] | [시간] | todo |

## 기술 결정
[주요 기술 선택과 근거]

## 리스크
[잠재 문제와 대응]

## 완료 기준
[이 계획이 "done"인 상태]
```

**Step 3: ACTIVE_SPRINT 연동**
- 새 계획서를 ACTIVE_SPRINT에 반영
- Current Doing 테이블 업데이트
- 다음 세션 권장 작업 갱신

### 3. 저장 위치

- 내부 계획: `point/06-Implementation/plans/YYYY-MM-DD-<topic>.md`
- 외부 공유용: `docs/plans/` (사본/요약)
- Plans Index: `point/06-Implementation/plans/Plans-Index.md` 업데이트

### 4. 변경 반영

1. 새 계획서 → `point/06-Implementation/plans/` 에 저장
2. Plans-Index 업데이트
3. ACTIVE_SPRINT 연동
4. 관련 vault 노트 최소 범위로 업데이트

## Constraints

- 계획서가 코드보다 먼저 — plan-first
- CLAUDE.md의 Planning Rules 준수
- docs/plans/는 외부 공유용 사본

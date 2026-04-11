---
name: pointint-sprint
description: Pointint 스프린트 동기화 호환본. 현재 상태 확인, 다음 작업 추천, 세션 종료 후 sprint/phase/decision 문서 follow-up sync에 사용한다.
---

# Pointint Sprint Sync

이 문서는 `.claude/skills/pointint-sprint/SKILL.md`와 동기화되는 호환본이다.

## Source of Truth

- Sprint snapshot: `point/06-Implementation/ACTIVE_SPRINT.md`
- Execution contract: `point/06-Implementation/Implementation-Plan.md`
- Phase overview: `point/06-Implementation/Phase-Flow.md`
- Detailed task flow: `point/06-Implementation/plans/2026-03-27-implementation-phase-flow.md`
- Decisions: `point/10-Journal/QUICK-DECISIONS.md`
- Session rules: `CLAUDE.md`

## Arguments

- `start`: 현재 스프린트 상태를 읽고 다음 unblocked 작업을 추천한다
- `end`: 이번 세션의 실제 변경을 sprint/phase/decision 문서에 반영한다
- 인자가 없으면 대화 맥락으로 추론한다

## Start Mode

1. `CLAUDE.md`를 읽는다
2. `ACTIVE_SPRINT.md`를 읽는다
3. 아래 섹션을 먼저 본다
   - `Current Goal`
   - `Current Doing`
   - `Next Session`
   - `Blockers`
4. 다음 unblocked 작업을 짧은 이유와 함께 추천한다
5. 추가 phase/plan 문서는 추천에 직접 필요할 때만 읽는다

## End Mode

1. 이번 세션에서 실제로 바뀐 것만 추린다
2. `ACTIVE_SPRINT.md`의 관련 부분만 갱신한다
   - `마지막 업데이트`
   - `Current Goal`
   - `Current Doing`
   - `Next Session`
   - `Blockers`
   - `Recently Done`
   - `Decision Follow-up`
   - `Document Follow-up`
   - task table / gate status
3. `Current Doing`은 active-only로 유지한다. 완료된 작업은 `Recently Done`으로 이동한다
4. gate 또는 phase 해석이 바뀌면 아래도 함께 sync한다
   - `point/06-Implementation/Phase-Flow.md`
   - `point/06-Implementation/plans/2026-03-27-implementation-phase-flow.md`
5. 중요한 전략/운영 결정이 생기면 `QUICK-DECISIONS.md`에 append한다
6. 근거 없는 done 처리는 하지 않는다

## Constraints

- parallel status 파일을 만들지 말고 기존 sprint note를 갱신한다
- sprint note가 부족한 섹션(`Decision Follow-up`, `Document Follow-up` 등)이 있으면 먼저 normalize한다
- 오래 방치된 active task는 `stale` 또는 `ghost`로 드러낸다

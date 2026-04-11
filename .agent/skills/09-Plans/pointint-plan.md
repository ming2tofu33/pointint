---
name: pointint-plan
description: Pointint 구현 계획서 호환본. 새 구현 계획, milestone breakdown, phase/wave 설계, task sequencing이 필요할 때 사용한다.
---

# Pointint Implementation Plans

이 문서는 `.claude/skills/pointint-plan/SKILL.md`와 동기화되는 호환본이다.

## Source of Truth

- Planning rules: `CLAUDE.md`
- Execution contract: `point/06-Implementation/Implementation-Plan.md`
- Active sprint: `point/06-Implementation/ACTIVE_SPRINT.md`
- Phase overview: `point/06-Implementation/Phase-Flow.md`
- Detailed task flow: `point/06-Implementation/plans/2026-03-27-implementation-phase-flow.md`
- Plan directory: `point/06-Implementation/plans/`
- Plan index: `point/06-Implementation/plans/Plans-Index.md`
- Decisions: `point/10-Journal/QUICK-DECISIONS.md`

## Workflow

1. `CLAUDE.md`를 읽는다
2. `Implementation-Plan.md`를 읽는다
3. `ACTIVE_SPRINT.md`를 읽는다
4. 직접 관련된 plan 문서만 추가로 읽는다
5. 새 plan이 필요한지, 기존 plan 최소 수정이면 충분한지 판단한다

## 새 계획이 필요한 경우

- 새로운 feature 또는 milestone
- 새로운 Phase 또는 Wave
- 여러 파일에 걸친 의미 있는 구현 시퀀스
- sprint에서 별도 추적해야 하는 작업

다음은 plan 없이 처리한다.

- 오타 수정
- 1줄 수준 변경
- 단순 point sync

## Required Follow-up

plan을 새로 만들었거나 실질적으로 바꿨다면:

1. `Plans-Index.md`를 갱신한다
2. `ACTIVE_SPRINT.md`에 priority/task를 반영한다
3. gate/phase 해석이 바뀌면
   - `Phase-Flow.md`
   - `plans/2026-03-27-implementation-phase-flow.md`
   를 함께 sync한다
4. 중요한 기술/운영 결정이면 `QUICK-DECISIONS.md`에 append한다
5. 외부 공유용 사본은 사용자가 명시적으로 원할 때만 `docs/plans/`에 만든다

## Constraints

- 내부 계획의 진실 소스는 항상 `point/`다
- Phase, Wave, Task, Gate 용어를 일관되게 사용한다
- scope가 실질적으로 안 바뀌면 기존 문서를 최소 수정하는 쪽을 우선한다

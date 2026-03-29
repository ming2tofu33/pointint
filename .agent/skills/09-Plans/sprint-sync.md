---
name: pointint-sprint
description: Pointint 스프린트 동기화 (세션 시작/종료). Use when the user mentions 스프린트, sprint, 세션 시작, 세션 마무리, 진행 상황, 상태 확인, sync, 다음 작업, 또는 스프린트 업데이트가 필요한 상황.
---

# Pointint Sprint Sync

## Key Files

- Sprint: `point/06-Implementation/ACTIVE_SPRINT.md`
- Plans: `point/06-Implementation/plans/`
- Index: `point/00-INDEX.md`

## Mode Detection

**Start mode** — 세션 시작 시 또는 현재 상태 확인
**End mode** — 작업 완료 후 마무리

확실하지 않으면 묻는다: "세션 시작이에요, 아니면 마무리인가요?"

---

## Start Mode

1. Read `point/06-Implementation/ACTIVE_SPRINT.md`
2. Report:
   - **구현 준비** 섹션의 미완료 항목
   - **Current Doing** 테이블 상태
   - **다음 세션 권장 작업** 목록
3. 다음 unblocked 작업 추천

출력 예시:
```
## Sprint Status

구현 준비 (미완):
- [ ] docs → point 승격
- [ ] 비주얼 톤앤매너 확정
- [ ] Phase 1 Wave 1 착수

Current Doing: 2개 (docs 승격, P1-SETUP-01)

추천 Next: docs → point 승격 (의존성 없음, 바로 착수 가능)
```

---

## End Mode

1. 완료된 작업 확인 (세션 맥락에서 또는 직접 질문)
2. `ACTIVE_SPRINT.md` 업데이트:
   - `[ ]` → `[x]` 완료 항목
   - Current Doing 테이블 상태 갱신
   - 다음 세션 권장 작업 갱신
3. 관련 point 노트 목록 제시 (자동 수정 안 함)
4. 묻는다: "커밋하시겠어요?"

---

## Commit (if yes)

Stage only:
- `point/06-Implementation/ACTIVE_SPRINT.md`
- 사용자가 확인한 point 노트만

Commit message:
```
chore: sprint sync — [완료 항목 요약]
```

## Constraints

- CLAUDE.md의 Session Workflow를 따른다
- 작업과 직접 관련된 노트만 읽고 진행한다
- 구현이나 문서 작업이 끝나면 관련 노트만 최소 범위로 업데이트한다

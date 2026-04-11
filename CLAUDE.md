# Pointint

## Knowledge Sources

- `point/` = 내부 지식 베이스
- `docs/` = 외부 공유용 문서
- 내부에서 작업 기준이 되는 계획 문서는 `point/06-Implementation/plans/`에 둔다
- `docs/plans/`는 외부 공유용 사본 또는 요약본으로 유지한다

## Session Workflow

1. 세션 시작 시 `point/00-INDEX.md`를 먼저 확인한다
2. 이어서 `point/06-Implementation/ACTIVE_SPRINT.md`를 확인한다
   - `Current Goal`, `Current Doing`, `Next Session`, `Blockers`를 먼저 본다
3. 작업과 직접 관련된 plan, brand, business, research 노트만 읽고 진행한다
4. 구현이나 문서 작업이 끝나면 관련 노트만 최소 범위로 업데이트한다
5. 상태나 해석이 바뀌면 문서 follow-up을 같은 세션에서 끝낸다

## Planning Rules

- **Plan first.** 모든 작업은 구현 전 계획이 필요하다. 예외: 오타 수정, 1줄 변경, 단순 point 동기화.
- 새 계획 문서는 반드시 `point/06-Implementation/plans/YYYY-MM-DD-<topic>.md` 형식으로 만든다.
- `point/06-Implementation/plans/`가 plan의 유일한 진실 소스(Single Source of Truth)이다.
- `docs/plans/`는 외부 공유용 사본만 둔다. 내부 작업 기준은 항상 `point/`를 우선한다.
- 활성 계획만 `point/06-Implementation/plans/`에 유지한다. 완료된 plan은 `point/90-Archive/plans-completed/`로 이동한다.
- task를 done으로 표시할 때 근거(변경 내역, 결과 확인)를 간략히 남긴다.

## Documentation Follow-up

- `ACTIVE_SPRINT.md`는 지금 실제로 굴러가는 상태만 적는다. `Current Doing`은 active work만 추적한다.
- Gate나 Phase 상태가 바뀌면 `ACTIVE_SPRINT.md`뿐 아니라 `point/06-Implementation/Phase-Flow.md`와 관련 phase flow 노트도 함께 본다.
- 새 다단계 작업을 만들면 plan 노트, `Plans-Index.md`, `ACTIVE_SPRINT.md`를 연결한다.
- 중요한 전략/구조/운영 결정은 `point/10-Journal/QUICK-DECISIONS.md`에 append-only로 기록한다.
- 7일 이상 근거 갱신이 없는 active task는 `stale`, 14일 이상이면 `ghost` 후보로 본다.

## Point Rules

- Obsidian 노트 운영 규칙은 `point/POINT_RULES.md`를 따른다
- 노트는 삭제하지 않고 `point/90-Archive/`로 이동한다
- Inbox의 날것 메모는 정리 후 Brand, Business, Research, Features 등으로 승격한다

## Stack

- Frontend: Next.js (React + TypeScript) + Tailwind CSS v4 + Vercel (`frontend/`)
- Backend: FastAPI (Python) + Railway (`backend/`)
- DB/Auth/Storage: Supabase (PostgreSQL + Auth + Storage)

## Commit

- Commit by feature unit. Messages: `feat:`, `fix:`, `chore:`, `docs:`.
- Group related changes into a single commit. E.g., 3 related file changes for the same feature = 1 commit.
- Before committing, ask: "Do these changes share a single intent?" If not, split them.
- Do NOT include `Co-Authored-By` in commit messages.

## Git Branch Policy

- Use a main-only workflow.
- Day-to-day implementation happens directly on `main`.
- Commit small, coherent groups of changes so the history stays readable.
- Push to `main` after local verification and when the checkpoint is stable.
- Feature branches are optional, not the default operating mode.

## Prohibitions

- Never commit `.env` files (commit `.env.example` only).
- Always commit `package-lock.json` (CI reproducibility).
- Do not advance to next Phase if sprint gate criteria are not met.

## Python venv policy

- Use `backend/.venv` only for backend Python commands.
- Do not create or use `backend/venv`.

## Documentation Discipline

- 이 파일에는 실행 규칙만 적는다
- 제품 스펙, 비전, 전략 상세는 `point/` 또는 `docs/`의 문서를 갱신한다

## Claude Code Skills

- Claude Code 프로젝트 스킬의 기준 위치는 `.claude/skills/`이다
- `/pointint-sprint start` = 현재 스프린트 상태 확인, 다음 unblocked 작업 추천
- `/pointint-sprint end` = 세션 종료 시 `ACTIVE_SPRINT.md` 동기화
- `/pointint-plan <topic>` = 새 구현 계획 문서 작성 또는 기존 계획 정리
- `/pointint-decisions` = 주요 결정 사항을 `QUICK-DECISIONS.md`에 기록
- `/pointint-architect` = point 구조/링크/배치 점검
- `.agent/skills/`는 레거시/호환용 자산으로 두고, Claude Code 기준 문구는 `.claude/skills/`를 우선한다

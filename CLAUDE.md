# Pointint

## Knowledge Sources

- `point/` = 내부 지식 베이스
- `docs/` = 외부 공유용 문서
- 내부에서 작업 기준이 되는 계획 문서는 `point/06-Implementation/plans/`에 둔다
- `docs/plans/`는 외부 공유용 사본 또는 요약본으로 유지한다

## Session Workflow

1. 세션 시작 시 `point/00-INDEX.md`를 먼저 확인한다
2. 이어서 `point/06-Implementation/ACTIVE_SPRINT.md`를 확인한다
3. 작업과 직접 관련된 plan, brand, business, research 노트만 읽고 진행한다
4. 구현이나 문서 작업이 끝나면 관련 노트만 최소 범위로 업데이트한다

## Planning Rules

- **Plan first.** 모든 작업은 구현 전 계획이 필요하다. 예외: 오타 수정, 1줄 변경, 단순 vault 동기화.
- 새 계획 문서는 반드시 `point/06-Implementation/plans/YYYY-MM-DD-<topic>.md` 형식으로 만든다.
- `point/06-Implementation/plans/`가 plan의 유일한 진실 소스(Single Source of Truth)이다.
- `docs/plans/`는 외부 공유용 사본만 둔다. 내부 작업 기준은 항상 `point/`를 우선한다.
- 활성 계획만 `point/06-Implementation/plans/`에 유지한다. 완료된 plan은 `point/90-Archive/plans-completed/`로 이동한다.
- task를 done으로 표시할 때 근거(변경 내역, 결과 확인)를 간략히 남긴다.

## Vault Rules

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

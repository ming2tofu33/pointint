---
name: pointint-architect
description: "Pointint point 구조 관리 (Obsidian). Use when the user asks to: scan/audit the point, add a new note, move/rename notes, triage inbox items, validate links, or check point health. Also triggers on: point 정리, 노트 추가, 링크 검증, inbox 정리, 구조 확인."
---

# Pointint Point Architect

Maintain the `point/` Obsidian folder using Pointint's numbered-layer structure. All operations must comply with `point/POINT_RULES.md`.

## Key Files

- Point rules: `point/POINT_RULES.md` (항상 최신본 확인)
- Index: `point/00-INDEX.md`
- Sprint: `point/06-Implementation/ACTIVE_SPRINT.md`

## Safety Rules

> [!CRITICAL] 모든 point 작업에 적용.

1. **파일 삭제 금지.** 불필요한 파일은 `point/90-Archive/`로 이동.
2. **기존 노트 내용 덮어쓰기 금지.** 추가(append)만 하거나 새 파일 생성.
3. **벌크 작업 (3+ 파일):** 마이그레이션 테이블 제시 후 사용자 승인 대기.
4. **`.obsidian/` 디렉토리 절대 터치 금지.**
5. **이동 후:** 깨진 `[[wikilinks]]` 스캔 및 수정.
6. **새 plan/운영 노트 추가 후:** `Plans-Index.md` 또는 `ACTIVE_SPRINT.md` follow-up 필요 여부를 확인한다.

---

## Mode 1: Audit

현재 point 상태를 스캔하고 보고한다.

**Procedure:**
1. 모든 레이어 폴더의 파일 수 집계
2. 네이밍 이슈 탐지 (이중 확장자, 구분자 불일치, 대소문자 불일치)
3. 고아 노트 탐지 (인바운드/아웃바운드 wikilink 없음)
4. 깨진 wikilink 탐지
5. frontmatter 누락 탐지 (title, tags 없음)

**Output:**
```markdown
## Point Audit: Pointint

### Structure
| Layer | Files | Status |

### Issues Found
- ...

### Recommendations
1. ...
```

---

## Mode 2: Add Note

새 노트를 추가할 때 체크리스트 기반으로 가이드한다.

**Pointint 레이어 구조:**

| # | 레이어 | 용도 |
|---|---|---|
| 00 | Inbox | 정리 안 된 생각 |
| 01 | Core | 비전, 로드맵, 타깃 |
| 02 | Architecture | 시스템/데이터/API 구조 |
| 03 | Features | 기능 정의, 사용자 흐름 |
| 04 | AI-System | AI 프롬프트, 모델 역할 |
| 05 | Operations | 운영 정책, 비용, 지표 |
| 06 | Implementation | 구현 계획, 스프린트 |
| 07 | Brand | 철학, 카피, 내러티브 |
| 08 | Business | 티어, 가격, 마켓플레이스 |
| 09 | Research | 경쟁사, 유저 인터뷰, 검증 |
| 10 | Journal | 세션 로그, 빠른 결정 |
| 11 | Design | 비주얼, 색상, UI 방향 |
| 90 | Archive | 비활성 문서 보관 |
| 98 | Templates | 재사용 템플릿 |
| 99 | Reference | 외부 참고 자료 |

**검증 체크리스트:**
- [ ] 올바른 레이어 폴더에 배치?
- [ ] frontmatter에 title, tags 있음?
- [ ] Related / See Also 링크 적절?
- [ ] Plan이면 `point/06-Implementation/plans/YYYY-MM-DD-<topic>.md` 형식?

---

## Mode 3: Move / Rename

**Single file:** 이동 → 깨진 wikilink 스캔 → 관련 노트 업데이트
**Bulk (3+ files):** 마이그레이션 테이블 제시 → 사용자 승인 → 순차 실행

---

## Mode 4: Inbox Triage

`point/00-Inbox/`의 메모를 정리한다.

1. Inbox 메모 목록 조회
2. 각 메모에 대해 추천: **승격** / **병합** / **대기** / **아카이브**
3. 사용자 확인 후 실행
4. 승격된 메모는 Archive로 이동 (삭제 금지)

---

## Mode 5: Link Validation

point 전체의 wikilink 무결성을 검증한다.

| 항목 | 체크 |
|---|---|
| 깨진 링크 | 존재하지 않는 노트 참조 |
| 고아 노트 | 아무 곳에서도 참조되지 않는 노트 |
| frontmatter 누락 | title, tags 없음 |

자동 수정은 하지 않는다. 수정 제안만 제시.

---

## Sibling Skill Integration

- **`pointint-sprint`** — 스프린트 동기화 시 point 노트 변경 연동
- **`pointint-plan`** — 계획 문서 작성 시 레이어 배치 가이드
- **`pointint-decisions`** — 결정 사항 기록 연동

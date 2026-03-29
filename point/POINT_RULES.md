---
title: Point Rules
tags:
  - pointint
  - meta
  - rules
aliases:
  - Point Rules
  - Pointint Rules
---

# Point Rules

> [!info]
> 이 문서는 Pointint의 Obsidian 볼트 `point/`를 운영할 때 따르는 기본 규칙을 정의한다.

## 1. 역할 구분

- `point/`는 내부 지식 베이스다
- `docs/`는 외부 공유용 문서다
- 내부 설계, 판단 기준, 실행 문서는 먼저 `point/`에 정리한다
- 외부에 보여줄 요약본이나 공유용 정리는 `docs/`에 둔다

## 2. 레이어 구조

| 레이어 | 용도 |
|---|---|
| `00-Inbox` | 날것 메모, 빠른 아이디어, 질문 |
| `01-Core` | 비전, 로드맵, 핵심 정의 |
| `02-Architecture` | 시스템 구조, API, 데이터 설계 |
| `03-Features` | 기능별 규칙과 사용자 흐름 |
| `04-AI-System` | 프롬프트, 응답 구조, AI 설계 |
| `05-Operations` | 운영 정책, 비용, 지표, 배포 |
| `06-Implementation` | 구현 관련 노트 |
| `06-Implementation/plans` | 활성 계획 문서, 스프린트 문서, 전략 기준본 |
| `07-Brand` | 브랜드 철학, 카피, 세계관 |
| `08-Business` | 티어, 가격, 내부 재화, 판매 구조 |
| `09-Research` | 경쟁사, 인터뷰, 검증 가설 |
| `10-Journal` | 세션 로그, 빠른 의사결정 기록 |
| `11-Design` | 비주얼 톤앤매너, 색상, UI 방향, 브랜드 비주얼 |
| `90-Archive` | 더 이상 활성 상태가 아닌 문서 |
| `98-Templates` | 재사용 가능한 노트 템플릿 |
| `99-Reference` | 참고 자료 |

## 3. 기본 흐름

Pointint에서 새로운 생각은 아래 흐름으로 다루는 것을 기본으로 한다.

`Inbox -> Brand/Business/Research -> Core/Features -> Implementation -> Journal -> Archive`

- 날것의 아이디어는 먼저 `00-Inbox`
- 정리되면 `07-Brand`, `08-Business`, `09-Research`, `03-Features` 등으로 승격
- 실제 실행 전에는 `06-Implementation/plans/`에 계획 문서를 만든다
- 세션 단위 기록과 빠른 결정은 `10-Journal`에 남긴다

## 4. 계획 문서 규칙

- 큰 작업은 먼저 `06-Implementation/plans/YYYY-MM-DD-<topic>.md`에 작성한다
- 세션 시작 시 `[[06-Implementation/ACTIVE_SPRINT]]`를 먼저 확인한다
- 현재 작업과 직접 관련된 전략 문서만 링크한다
- `docs/plans/`는 외부 공유용으로 유지하고, 내부 기준본은 `point/06-Implementation/plans/`를 우선한다

## 5. 링크 규칙

> [!note]
> 그래프가 난잡해지지 않도록 같은 레이어 중심으로 연결한다.

### `Related`

- 같은 레이어 노트 2~3개를 우선 링크한다
- 같은 레이어에 노트가 부족하면 1개 또는 0개도 허용한다

### `See Also`

- 다른 레이어 링크는 최대 2개만 둔다
- 정말 의미 있는 의존성만 연결한다

## 6. 네이밍 규칙

| 유형 | 형식 | 예시 |
|---|---|---|
| 일반 노트 | `Title-Case-Hyphens.md` | `Brand-Narrative.md` |
| 계획 문서 | `YYYY-MM-DD-slug.md` | `2026-03-27-pointint-mvp-scope.md` |
| 저널 세션 | `YYYY-MM-DD-session.md` | `2026-03-27-session.md` |
| 빠른 결정 로그 | `QUICK-DECISIONS.md` | `QUICK-DECISIONS.md` |

## 7. 노트 운영 원칙

- 노트는 삭제하지 않는다
- 더 이상 쓰지 않는 문서는 `90-Archive/`로 이동한다
- 기존 노트 전체를 매번 업데이트하지 않고, 관련된 노트만 최소 범위로 갱신한다
- 새 규칙은 우선 `POINT_RULES.md`에 반영한다

## 8. 세션 운영

- 세션 시작:
  - `[[00-INDEX]]`
  - `[[06-Implementation/ACTIVE_SPRINT]]`
- 세션 종료:
  - 관련 노트 업데이트
  - 필요한 경우 `[[10-Journal/QUICK-DECISIONS]]`와 세션 노트 갱신

## 9. 현재 기준 핵심 원칙

- 브랜드는 넓게, 첫 제품은 좁게
- 프론트보다 기능과 비즈니스 판단 기준을 먼저 쌓는다
- 계획 없는 큰 구현은 시작하지 않는다
- `point/`는 내부 기준본, `docs/`는 외부 공유본이다

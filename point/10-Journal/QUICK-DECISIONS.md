---
title: QUICK DECISIONS
tags:
  - pointint
  - journal
  - decisions
aliases:
  - Quick Decisions
---

# QUICK DECISIONS

> [!note]
> 짧게 확정된 운영 판단을 append-only로 쌓는다.

## 2026-03-27

- `point/`를 내부 지식 베이스로 사용한다.
- `docs/`는 외부 공유용 문서로 유지한다.
- 큰 작업은 `point/06-Implementation/plans/`에 먼저 계획 문서를 만든다.
- 세션 시작 시 `00-INDEX`와 `ACTIVE_SPRINT`를 먼저 확인한다.
- 세션 로그는 `10-Journal/`에 남긴다.

## 2026-04-11

- **문서 운영 체계는 `Idea Mine` + `0to1log` 패턴을 섞어 재정비한다.** `Current Doing`은 active work만 추적하고, sprint/plan/phase/decision 문서는 같은 세션에서 함께 sync한다. (context: landing은 이미 완료됐는데 sprint 문서가 뒤처져 있던 문제 정리)
- **현재 스프린트에서는 `P1-EDITOR-03`(in review)를 먼저 닫고, 이후 우선순위를 `P1-SHOWCASE-01` → `P1-HOTSPOT-01` → `P1-MOCKUP-01` 순서로 둔다.** editor confidence 리뷰를 마무리한 뒤 showcase로 유입 표면을 강화한다. (context: active snapshot과 decision log 간 우선순위 정합성 유지)
- **프레이밍 선택은 업로드 단계가 아니라 편집기에서 수행한다.** 기본값은 contain(전체 보이기), 선택 옵션으로 cover(가득 채우기)를 제공하고 두 모드 모두 pan/zoom 미세조정을 유지한다. (context: 절차를 늘리지 않고 미리보기 기반으로 즉시 판단/조정)
- **정사각형 편집기 프리뷰를 최종 결과의 단일 기준(`preview = export`)으로 고정한다.** simulation/health/download는 동일 렌더 결과를 사용하며, `Show original`은 비교용 레퍼런스로만 제공하고 export 소스를 바꾸지 않는다. (context: 보이는 결과와 다운로드 결과의 불일치 제거)
## 2026-04-11 Follow-up

- CUR/ANI is a workflow choice before upload, not an editor-side toggle.
- ANI cards stay visible but disabled as Soon until real ANI inputs/export exist.

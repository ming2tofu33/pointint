---
title: Documentation Ops Refresh
tags:
  - pointint
  - plan
  - docs
  - operations
---

# Documentation Ops Refresh

> **Status:** Done
> **Created:** 2026-04-11
> **Phase:** Phase 1
> **Wave:** Sprint Operations

## 목표

Pointint의 실제 shipped 상태와 스프린트/페이즈/결정 문서를 다시 맞추고, 이후에도 문서 follow-up이 자동으로 누락되지 않도록 운영 규칙을 정리한다.

## 배경

- `P1-LANDING-01`은 이미 코드와 커밋에서 완료되었는데 `ACTIVE_SPRINT.md`에는 여전히 미구현으로 남아 있었다.
- `Implementation-Plan.md`, `Phase-Flow.md`, 상세 phase flow 문서가 서로 다른 phase 모델과 상태를 들고 있어 문서 드리프트가 생겼다.
- `Idea Mine`, `0to1log`에서는 문서 역할 분리, active-only sprint 추적, stale/ghost 표기, `QUICK-DECISIONS` follow-up이 더 잘 정리되어 있었다.

## 범위

- `ACTIVE_SPRINT.md`를 실제 배포 기준으로 재동기화
- `Implementation-Plan.md`를 운영 계약 문서로 재정리
- `Phase-Flow.md`와 상세 phase flow의 상태를 맞춤
- `QUICK-DECISIONS.md`에 운영 체계 변경 기록
- Claude 스킬 문서와 레거시 호환 문구를 새 운영 방식에 맞게 보강

## 태스크

| ID | 제목 | 의존성 | 예상 | 상태 |
|---|---|---|---|---|
| DOC-OPS-01 | shipped landing 상태 확인 및 evidence 수집 | - | 20m | done |
| DOC-OPS-02 | `ACTIVE_SPRINT.md` 재구성 | DOC-OPS-01 | 25m | done |
| DOC-OPS-03 | `Implementation-Plan.md` 운영 계약 재작성 | DOC-OPS-02 | 25m | done |
| DOC-OPS-04 | `Phase-Flow.md` + 상세 phase flow sync | DOC-OPS-02 | 25m | done |
| DOC-OPS-05 | `QUICK-DECISIONS.md`와 스킬 문서 follow-up 반영 | DOC-OPS-03 | 25m | done |

## 기술 결정

- `Current Doing`은 active work만 추적한다.
- 오래 방치된 active task는 `stale`, 더 불명확한 항목은 `ghost`로 드러낸다.
- 스프린트/게이트/전략 판단은 한 세션에서 `ACTIVE_SPRINT` + 관련 phase 문서 + `QUICK-DECISIONS`까지 같이 sync한다.
- `.claude/skills/`를 기준 스킬 위치로 두되, `.agent/skills/` 호환본도 함께 맞춘다.

## 리스크

- 운영 규칙이 과도하게 무거워지면 실제 작업보다 문서 유지 비용이 커질 수 있다.
- historical task 전부를 한 번에 정리하려고 하면 scope가 불어난다. 이번에는 현재 sprint와 phase 해석에 직접 영향을 주는 부분만 맞춘다.

## 완료 기준

- `ACTIVE_SPRINT.md`가 실제 shipped 상태와 다음 작업을 반영한다
- `Implementation-Plan.md`가 문서 역할 분리와 follow-up 규칙을 명시한다
- `Phase-Flow.md`와 상세 phase flow의 Phase 1 상태가 일치한다
- `QUICK-DECISIONS.md`에 이번 운영 결정이 append-only로 기록된다

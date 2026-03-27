---
title: Simulator
tags:
  - pointint
  - features
  - simulator
aliases:
  - 시뮬레이션
  - 시뮬레이터
---

# Simulator

> **Status:** Active
> **Last Updated:** 2026-03-27
> **Source:** `docs/기능 상세.md` §3

## 3종 상태

- `Normal` — 기본 커서
- `Text` — 텍스트 위 커서
- `Link` — 링크 위 커서

## 시뮬레이션 방식

두 가지를 모두 제공한다.

### 미리보기 영역

- 화면 일부에 시뮬레이션 존
- 3종 상태를 한눈에 비교
- 빠른 확인용

### 인터랙티브 존

- 실제 상황을 재현한 영역
- 텍스트 위에 올리면 Text 커서, 링크 위에 올리면 Link 커서
- 실제 사용감 체감용

## 배경

- Light / Dark 전환 지원

## 애니메이션 시뮬레이션

- .ani 커서의 경우 애니메이션 재생 상태를 확인할 수 있다
- 속도감과 자연스러움을 다운로드 전에 검증

## 이후 확장

- Windows 17종 전체 역할 시뮬레이션

## 핵심 원칙

- 다운로드 전에 "이걸 쓰면 이런 느낌이다"를 확신할 수 있어야 한다
- 시뮬레이션은 Pointint의 차별점이다

## Related

- [[Cursor-Editor]]
- [[Download-Guide]]

## See Also

- [[99-Reference/Windows-Cursor-Spec]]

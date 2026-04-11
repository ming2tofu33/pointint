---
title: P1-LANDING-03 — Landing Redesign Design
tags:
  - pointint
  - implementation
  - landing
  - design
aliases:
  - Landing Redesign Design
  - P1-LANDING-03 Design
---

# P1-LANDING-03 — Landing Redesign Design

> **Date:** 2026-04-11
> **Status:** Approved
> **Task:** `P1-LANDING-03`
> **Related docs:**
> - [[2026-03-27-pointint-homepage-structure-design]]
> - [[2026-03-28-pointint-home-content-and-shell-design]]
> - [[2026-04-08-landing-page-design]]
> - [[01-Core/Project-Vision]]

## 1. Goal

Pointint 랜딩을 처음부터 다시 정리하되, 정보는 덜어내고 이해력은 더 높인다.

이번 리디자인의 목표는 아래 두 가지를 동시에 만족하는 것이다.

1. 첫 화면에서 Pointint가 무엇을 하는지 즉시 이해된다.
2. 스크롤을 내릴수록 Pointint가 단순 커서 툴보다 더 넓은 브랜드라는 감각이 남는다.

한 줄 요약:

`proof-first + atmospheric follow-through`

## 2. Product Framing

랜딩은 여전히 현재 제품을 분명하게 설명해야 한다.

- 현재 제품 설명: 이미지를 Windows 커서로 바꾸는 가장 쉬운 제작 워크플로우
- 장기 브랜드 감각: Pointint는 모니테리어를 향해 가는 브랜드/플랫폼

즉 랜딩은 `Pointint for 모니테리어`를 길게 설명하지 않는다.
대신 장면, 표면, 반응, 오브젝트 감각으로 그 확장성을 암시한다.

## 3. Approved Direction

이번 랜딩의 승인된 방향은 아래와 같다.

- 히어로의 주연은 `이미지 → 커서` 변환 장면이다.
- 물결 반응은 삭제하지 않는다.
- 다만 물결은 히어로의 주인공이 아니라 페이지 전체 분위기를 이어주는 레이어가 된다.
- 히어로에서는 물결을 조용하게 유지하고, 중간 섹션들에서 전체 배경이 은은하게 반응한다.
- 카피는 짧고 정확하게 유지한다.
- 텍스트는 해설자이고, 비주얼은 주인공이다.

## 4. Page Structure

랜딩은 아래 4개 섹션으로 압축한다.

1. `Hero Proof`
2. `Workflow Surface`
3. `Mood Glimpse`
4. `Trust + Final CTA`

전체 리듬은 아래 순서를 따른다.

`즉시 이해 → 흐름 이해 → 브랜드 여운 → 안심하고 시작`

## 5. Section Design

### 5.1 Hero Proof

첫 화면은 설명보다 proof가 먼저 보여야 한다.

- 매우 가벼운 헤더
- 짧은 브랜드 카피
- `이미지 → 커서` 변환 장면
- CTA 1개

히어로에서 사용자가 가장 먼저 봐야 하는 것은 문장이 아니라 변환 장면이다.

권장 카피 위계:

- main: `Your Point, Your Tint.`
- sub: `좋아하는 이미지를 Windows에서 바로 쓸 수 있는 커서로 바꿔보세요.`
- cta: `이미지로 시작하기`

히어로에서는 보조 CTA를 두지 않는다.

### 5.2 Workflow Surface

이 섹션은 랜딩의 설명 중심이다.

- 페이지 전체 배경이 아주 은은하게 반응하는 물결 표면
- 3단계 흐름을 하나의 넓은 표면 위에 배치
- 기능 나열이 아니라 흐름 이해에 집중

단계 구조:

1. 업로드
2. 다듬기
3. 확인하고 적용

이 섹션의 목표는 아래 한 문장이다.

`복잡하지 않고, 실제로 되는 흐름이다.`

### 5.3 Mood Glimpse

이 섹션은 Pointint가 커서 하나에서 끝나는 느낌이 아니게 만드는 구간이다.

- 넓은 장면 또는 오브젝트 프레임 1개
- 텍스트는 최소화
- 디지털 공간에 분위기를 입히는 감각을 보여줌

여기서 `Pointint for 모니테리어`는 강한 헤드라인이 아니라 짧은 라벨 또는 여운으로만 등장한다.

이 섹션의 목표는 아래 한 문장이다.

`이 브랜드는 더 넓은 세계를 가진다.`

### 5.4 Trust + Final CTA

마지막 섹션은 감성보다 확신을 주는 구간이다.

- PNG, JPG, WebP 지원
- Windows용 `.cur` 다운로드
- 무료 시작 가능
- 적용 가이드 접근 가능
- 마지막 CTA

이 섹션에서는 물결 반응을 거의 느껴지지 않을 정도로 낮춘다.

## 6. Motion Rules

### 6.1 Hero motion

- 히어로는 거의 정적이어야 한다.
- 표면은 살아 있으되, 중앙 proof stage를 가리지 않는다.
- 물결은 배경의 긴장감 수준으로만 존재한다.

### 6.2 Mid-page motion

- `Workflow Surface`와 `Mood Glimpse`에서는 전체 배경이 은은하게 반응한다.
- 반응은 히어로보다 훨씬 낮은 대비로 유지한다.
- 텍스트 영역 뒤에는 반투명 표면 또는 안개층을 두어 가독성을 확보한다.

### 6.3 CTA motion

- 마지막 CTA 구간에서는 모션이 다시 잦아든다.
- 결정 직전에는 감성보다 안정감이 앞서야 한다.

## 7. Visual Rules

- 기본 팔레트는 딥 네이비 + 로즈 핑크 유지
- 보라색 금지
- 글래스모피즘 금지
- “AI가 만든 것 같은” 무드 금지
- proof 오브젝트와 CTA에만 악센트 색을 집중
- 배경 표면은 절제되고 어두운 질감 위주
- 페이지는 “예쁜 포스터”보다 “살아 있는 디지털 표면”처럼 느껴져야 한다

## 8. Copy Density Rules

### 8.1 Hero

- 슬로건 1줄
- 제품 설명 1줄
- CTA 1개

추가 설명 금지.

### 8.2 Workflow Surface

- 각 단계는 제목 1줄 + 보조 설명 1줄
- 긴 문단 금지

### 8.3 Mood Glimpse

- 텍스트 최소화
- 작은 라벨 또는 짧은 한 문장만 허용

### 8.4 Trust + Final CTA

- 신뢰 정보는 짧은 사실 단위로 배치
- 문단보다 리스트/배지/짧은 행을 우선

한 줄 요약:

`텍스트는 해설자, 비주얼은 주인공`

## 9. SEO and Trust

이번 리디자인에서는 FAQ 중심 구조를 핵심 흐름에서 제거한다.

대신 아래를 유지한다.

- `SoftwareApplication` 구조화 데이터
- 명확한 메타 타이틀/디스크립션
- 첫 화면과 두 번째 섹션 안의 짧고 선명한 제품 설명
- 포맷/Windows/무료/가이드에 대한 compact trust facts

즉 설명량은 줄이되, 검색성과 신뢰 신호는 다른 방식으로 유지한다.

## 10. Non-Goals

이번 리디자인에서 하지 않는 것:

- FAQ를 다시 대형 섹션으로 늘리기
- 히어로에서 인터랙티브 미니 에디터를 보여주기
- `Pointint for 모니테리어`를 메인 헤드라인으로 밀기
- 페이지 전체를 강한 물결 반응으로 채우기
- 카피로 모든 확장 로드맵을 설명하기

## 11. Implementation Notes

- 기존 `/studio` 진입 흐름은 유지한다.
- CTA의 첫 목적은 업로드/제작 시작이다.
- 현재 제품 설명은 좁게 유지하되, 비주얼과 표면 반응으로 브랜드 확장성을 남긴다.
- 히어로 proof asset은 초기 구현에서 로컬 SVG 또는 정적 그래픽으로 시작해도 된다.


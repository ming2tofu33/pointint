---
title: AI Strategy
tags:
  - pointint
  - ai
  - strategy
aliases:
  - AI 전략
---

# AI Strategy

> **Status:** Active
> **Last Updated:** 2026-04-27
> **Source:** `docs/AI 전략 상세.md` (legacy source, current business model is [[08-Business/Tier-Pricing]])

## 핵심 원칙

- AI는 Pointint의 제작 워크플로우를 더 강하게 만드는 기능이다
- AI가 Pointint의 정체성을 대체하지 않는다
- AI 처리(배경 제거)는 MVP에 포함한다
- AI 생성(커서 이미지 생성)은 MVP 이후 단계적으로 도입한다

## 도입 순서

```
MVP          배경 제거 (자동, 최선 품질) + 파일 변환
                  ↓
Phase A      가장자리 보정, 자동 크롭, 가독성 개선, 실루엣 정리
                  ↓
Phase B      텍스트/이미지 기반 커서 생성 + 3종 변형안 자동 추천
```

## MVP: AI 처리

- 업로드 즉시 배경 제거 (최선 품질)
- JPG/WebP → 투명 PNG 자동 변환
- 사용자는 "AI 기능"이 아니라 "알아서 잘 되는 것"으로 인식

## Phase A: AI 보조 편집

| 기능 | 효과 |
|---|---|
| 배경 제거 고도화 | 더 정밀한 엣지, 반투명 영역 보존 |
| 가장자리 보정 | 잔여 픽셀 자동 정리 |
| 자동 크롭 | 편집 시간 단축 |
| 가독성 개선 | 32px에서 잘 보이도록 보정 |
| 실루엣 정리 | 윤곽 강조 |

## Phase B: AI 생성

- 입력: 텍스트만 / 이미지만 / 참고 이미지 + 텍스트
- 결과: 대표 커서 1개 → 3종 변형안 자동 추천
- 핵심: 생성 AI는 편집기 앞단에 붙는 진입점
- `Generate → Edit → Expand → Simulate → Download`

## AI와 유료화

| 상태 | AI 접근 |
|---|---|
| Guest | 배경 제거만 (MVP 기본) |
| Member | 배경 제거 + 무료 Tint 맛보기 |
| Tint 구매자 | AI 보조 기능을 Tint로 사용 |
| Creator | 제작/판매 활동에서 얻은 Tint를 AI와 콘텐츠에 재사용 |

내부: Tint 기반. AI 보조는 기능별 Tint를 소모하고, AI 생성 가격은 Phase 4에서 모델 비용과 반복 사용 데이터를 보고 확정한다.

## 모델 선택 기준

배경 제거 품질, 처리 속도, 비용, 커서 특화, 확장성

## Related

- [[04-AI-System/Prompts-Overview]]

## See Also

- [[03-Features/Upload-Preprocess]]
- [[08-Business/Tier-Pricing]]

---
title: Tier & Pricing
tags:
  - pointint
  - business
  - pricing
  - tiers
  - tint
aliases:
  - 티어
  - 가격
  - Tint Economy
---

# Tier & Pricing

> **Status:** Active (Tint Economy 기반으로 재설계)
> **Last Updated:** 2026-03-27
> **Economy Design:** [[2026-03-27-pointint-economy-design]]

## 통화: Tint

Pointint의 단일 내부 통화. 월 구독 없음. Tint 팩을 구매하거나 활동으로 적립한다.

## 티어 구조

| 상태 | 비용 | 권한 |
|---|---|---|
| **Guest** | 무료, 비회원 | 업로드 제작 (.cur/.ani), 배경 제거 (기본), 편집, Hotspot, 시뮬레이션, 3종 다운로드 |
| **Member** | 무료, 가입 | Guest 전부 + 프로젝트 저장, 17종 전체 제작, 일일 Tint +50 (출석) + +50 (제작 시), 갤러리 참여, 마켓 구매 |
| **Creator** | 조건 충족 시 자동 (Phase 5~) | Member 전부 + 마켓 판매, 크리에이터 프로필 |

### AI 기능은 티어가 아니라 Tint로 접근

| 기능 | Guest | Member | Tint 필요량 |
|---|---|---|---|
| 업로드 제작 + 다운로드 | O | O | 무료 |
| 17종 전체 수동 제작 | X | O | 무료 |
| 프로젝트 저장 / 재수정 | X | O | 무료 |
| AI 배경 제거 고도화 | X | O | 200 Tint |
| AI 가장자리 보정 | X | O | 200 Tint |
| AI 커서 생성 (텍스트) | X | O | 800 Tint |
| AI 커서 생성 (이미지) | X | O | 500 Tint |
| AI 3종 변형 확장 | X | O | 800 Tint |
| 마켓 구매 | X | O | Tint로 결제 |
| 마켓 판매 | X | Creator만 | — |

## 전환 퍼널

```
Guest ──→ Member ──→ Tint 구매자 ──→ Creator
 (제작)    (저장)      (AI 사용)      (판매)
```

| 전환 | 트리거 | 마찰도 |
|---|---|---|
| Guest → Member | 만든 커서를 저장하고 싶다 / 17종 전체 만들고 싶다 | 낮음 (무료 가입) |
| Member → Tint 구매 | 무료 Tint로 AI 맛본 후 더 쓰고 싶다 | 중간 (₩2,900 첫 결제) |
| Member → Creator | 커서 5개+ 제작 완료 + 계정 7일 이상 | 없음 (자동 승급) |

## Tint 팩 가격

| 팩 | 가격 | Tint | 단가 | 감각 |
|---|---|---|---|---|
| Starter | ₩2,900 | 3,000 | ~₩1/Tint | 커피 한 잔 |
| Standard | ₩6,900 | 9,000 | ~₩0.77/Tint | 점심 한 끼 |
| Creator | ₩14,900 | 23,000 | ~₩0.65/Tint | — |
| Studio | ₩29,900 | 60,000 | ~₩0.50/Tint | — |

## 재방문 보상 (무료 Tint)

| 장치 | Tint | 주당 최대 |
|---|---|---|
| 일일 출석 | +50/일 | 350 |
| 커서 제작 완료 (일 1회) | +50/일 | 350 |
| 갤러리 공유 | +200 (주 2회 한정) | 400 |
| 주간 챌린지 | +500 | 500 |
| **합계** | | **~2,300/주** |

주 2,300 Tint = AI 생성 약 2~3회. 맛보기는 무료, 본격 사용은 팩 구매.

## 마켓플레이스 수수료

| 항목 | 비율 |
|---|---|
| 판매 수수료 | 20% (소각) |
| 등록비 | 소량 Tint (스팸 방지) |

초기: Tint 기반 거래, 현금 정산 없음.

## 경계의 원칙

- **제작 자체는 제한하지 않는다.** Guest도 무제한 제작 가능.
- **AI만 Tint로 게이팅한다.** 이것이 유일한 유료 전환 포인트.
- **구독 없음.** 사용 빈도가 낮은 제품에 월 구독은 맞지 않는다.
- **올리기는 쉽지만 내리기는 어렵다.** 보수적으로 시작.

## Related

- [[Monetization-Strategy]]
- [[Business-Index]]

## See Also

- [[2026-03-27-pointint-economy-design]]
- [[04-AI-System/AI-Strategy]]

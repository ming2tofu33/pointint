---
name: pointint-stripe
description: Pointint 결제 연동 (Stripe). Use when the user mentions 결제, Stripe, 구독, 결제 연동, 유료 전환, 구매, 인앱 결제, webhook, checkout, 또는 결제 시스템이 필요한 상황.
---

# Pointint Stripe Integration

## Context

### 결제 구조

| 티어 | 월가 | 연간 | 결제 |
|---|---|---|---|
| Guest | 무료 | — | 결제 없음 |
| Free | 무료 | — | 결제 없음 |
| Lite | ₩3,900 (~$2.99) | ₩2,900/월 | Stripe Subscription |
| Pro | ₩9,900 (~$7.99) | ₩7,900/월 | Stripe Subscription |

### 결제 트리거

- Free → Lite: AI 기능 사용 시도 시 자연스럽게 제안
- Lite → Pro: 더 많은 AI + 판매 우대 필요 시

### 기술 스택

- **Frontend:** Next.js (Stripe.js + Elements)
- **Backend:** FastAPI (Stripe Python SDK)
- **DB:** Supabase (구독 상태 저장)

---

## Workflow

### 1. 시스템 스킬 체이닝

`stripe-integration` 시스템 스킬 호출 → Pointint 티어/가격 맥락 적용

### 2. 구현 체크리스트

**Products & Prices:**
- [ ] Stripe Dashboard에 Lite / Pro 제품 생성
- [ ] 월간/연간 Price 각각 생성
- [ ] 원화(KRW) + 달러(USD) 가격 설정

**Checkout Flow:**
- [ ] Stripe Checkout Session (hosted page) 또는 Embedded
- [ ] 성공/취소 리다이렉트 설정
- [ ] 프로모 코드/할인 지원 여부

**Webhook:**
- [ ] `checkout.session.completed` → 구독 활성화
- [ ] `customer.subscription.updated` → 티어 변경
- [ ] `customer.subscription.deleted` → 다운그레이드
- [ ] `invoice.payment_failed` → 결제 실패 처리

**DB 동기화:**
- [ ] Supabase users 테이블에 subscription_tier, subscription_id 필드
- [ ] Webhook → FastAPI → Supabase 업데이트

**UX:**
- [ ] 업그레이드 제안은 자연스러운 맥락에서 (AI 기능 시도 시)
- [ ] 강요하지 않는다
- [ ] 현재 플랜과 혜택을 명확히 보여준다
- [ ] 다운그레이드도 쉽게

### 3. 내부 재화 (Phase 2+)

- 초기: credit 기반 AI 사용량
- 화면: "하루 3회" / 내부: credit 차감
- Stripe와 credit 충전 연동은 Phase 2 이후

### 4. 변경 반영

1. 구현 코드: 프로젝트 소스
2. 비즈니스 문서: `point/08-Business/Tier-Pricing.md`
3. 운영 정책: `point/05-Operations/`

## Constraints

- Phase 1 MVP에서는 결제 구현 안 함 — 전환 구조 확인이 우선
- 결제는 Phase 2 Lite 이후 구현
- 가격은 "감각 기준" — 런칭 전 확정
- 초기 마켓플레이스는 내부 재화 기반, 현금 정산 아님

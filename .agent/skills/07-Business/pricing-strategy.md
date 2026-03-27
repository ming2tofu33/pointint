---
name: pointint-pricing
description: Pointint 가격/티어 전략 수립 및 검토. Use when the user mentions 가격, 티어, pricing, Guest/Free/Lite/Pro, 수수료, 마켓플레이스 수익, 내부 재화, credit, 구독, 연간 할인, 전환 트리거, 유료화, monetization, 또는 가격 결정이 필요한 상황.
---

# Pointint Pricing Strategy

## Context

Pointint는 Windows 커서 테마 제작 워크플로우 서비스다. 브랜드 라인: `Your Point, Your Tint.`

### 현재 티어 구조

| 티어 | 월가 | 핵심 가치 |
|---|---|---|
| Guest | 무료 | 3종 커서 제작+다운로드 (가입 불필요) |
| Free | 무료 | 17종 전체 제작 + 프로젝트 저장 |
| Lite | ₩3,900 (~$2.99) | AI 보조/생성 + 마켓플레이스 판매 |
| Pro | ₩9,900 (~$7.99) | 높은 AI 한도 + 수수료 10% + 노출 우대 |

### 핵심 원칙

- **제작 자체는 제한하지 않는다. AI만 제한한다**
- Guest → Free: 저장과 17종이 가입 트리거
- Free → Lite: AI가 유료 전환 트리거
- Lite → Pro: 더 많은 AI + 판매 우대가 업그레이드 트리거
- Guest 경험이 약하면 안 된다 (무료 체험이 강해야 전환이 일어난다)

### 내부 재화

- 초기: AI 사용과 연결 (바닥 수요)
- 중기: 공식 콘텐츠 구매와 연결 (감정적 가치)
- 화면 표현: "하루 3회" / 내부 구조: credit 기반

### 마켓플레이스 수수료

| 티어 | 수수료 |
|---|---|
| Lite | 20% |
| Pro | 10% |

---

## Workflow

가격/티어 관련 요청이 들어오면:

### 1. 현재 상태 확인

```
Read: point/08-Business/Tier-Pricing.md
Read: point/08-Business/Monetization-Strategy.md
```

### 2. 시스템 스킬 체이닝

반드시 `pricing-strategy` 시스템 스킬을 먼저 호출하여 일반적 가격 전략 프레임워크를 로드한 뒤, 아래 Pointint 컨텍스트를 적용한다.

### 3. Pointint 특화 분석 프레임

가격 의사결정 시 반드시 고려할 항목:

- **전환 트리거 일관성:** 각 티어 경계의 전환 트리거가 사용자 심리와 맞는가?
- **"커피 한 잔" 감각:** Lite는 부담 없는 가격, Pro는 점심 한 끼 수준
- **AI 한도 밸런스:** 너무 낮으면 불만, 너무 높으면 전환 동기 소멸
- **마켓플레이스 수수료 경쟁력:** 기존 디지털 마켓 대비 합리적인가?
- **내부 재화 연결:** credit 소진 속도가 자연스러운 재결제 루프를 만드는가?

### 4. 출력 형식

가격 관련 제안은 반드시 아래 구조로:

```markdown
## 제안: [제목]

### 현재
[현재 상태 요약]

### 변경안
[구체적 변경 내용]

### 근거
- 전환 트리거: [영향 분석]
- 감각 가격: [사용자 심리]
- 경쟁 비교: [해당 시]

### 리스크
[잠재 문제]

### 다음 단계
[검증 방법]
```

### 5. 변경 반영

합의된 변경은:
1. `point/08-Business/Tier-Pricing.md` 업데이트
2. `point/08-Business/Monetization-Strategy.md` 필요 시 업데이트
3. 관련 `point/06-Implementation/plans/` 문서 연동

## Constraints

- 가격은 "감각 기준"이며 런칭 전 확정 — 현재는 방향성 논의 단계
- 초기 마켓플레이스는 내부 재화 기반, 현금 정산 아님
- Phase 1 MVP에서는 매출보다 제품/전환 구조 확인이 우선

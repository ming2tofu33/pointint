---
name: pointint-decisions
description: "Pointint 의사결정 기록. Use when the user makes a decision, changes direction, picks between options, or confirms a strategy. Also triggers on: 결정, 방향 전환, 확정, 이걸로 가자, 이렇게 하자, approved, decided."
---

# Pointint Decision Logger

세션 중 발생하는 의사결정을 `point/10-Journal/QUICK-DECISIONS.md`에 기록한다.

## Key Files

- Decisions: `point/10-Journal/QUICK-DECISIONS.md`
- Sprint: `point/06-Implementation/ACTIVE_SPRINT.md`

## When to Trigger

아래 패턴이 감지되면 자동으로 기록을 제안한다:

- 여러 옵션 중 하나를 선택 ("A로 가자", "B는 별로")
- 전략/가격/구조 변경 ("구독 없이 Tint 팩으로", "17종은 Phase 2에서 무료")
- 방향 확정 ("이 방향으로", "확정", "이렇게 해줘")
- 기존 결정 번복 ("아까 그거 말고", "다시 생각해보니")

## Format

```markdown
### YYYY-MM-DD

- **[결정 요약]** — [근거 1~2줄]. (context: [대화에서 어떤 논의 끝에 나왔는지])
```

## Procedure

1. 결정 감지 시, 대화 끝이나 다음 작업 전에 한 줄로 정리
2. `point/10-Journal/QUICK-DECISIONS.md`에 오늘 날짜 섹션이 있으면 거기에 추가, 없으면 새 날짜 섹션 생성
3. 결정이 sprint/phase/plan 해석을 바꾸면 관련 문서도 같은 세션에서 함께 sync
4. 기록 후 사용자에게 한 줄로 알림: "결정 기록: [요약]"

## Constraints

- 기록은 항상 **추가(append)** — 기존 결정을 수정/삭제하지 않는다
- 사소한 결정(UI 버튼 색 등)은 기록하지 않는다. 비즈니스/구조/전략 수준만.
- 번복된 결정은 새 항목으로 기록하고, 이전 결정을 참조: "변경: [이전 결정] → [새 결정]"

## Integration

- **`pointint-sprint` end mode** — 세션 종료 시 이번 세션의 결정 목록을 요약에 포함
- **`pointint-plan`** — 계획 문서의 "기술 결정" 섹션과 교차 참조

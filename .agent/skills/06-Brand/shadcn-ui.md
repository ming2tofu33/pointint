---
name: pointint-shadcn
description: Pointint UI 컴포넌트 (shadcn/ui 기반). Use when the user mentions shadcn, 컴포넌트, Button, Dialog, Select, Input, Form, Table, Card, Sheet, Toast, 또는 특정 UI 컴포넌트 추가/수정이 필요한 상황.
---

# Pointint shadcn/ui Components

## Context

### 스택

- shadcn/ui + Tailwind CSS
- Next.js App Router
- Pointint 디자인 토큰 적용

### Pointint 컴포넌트 톤

- 미니멀하고 여백 충분
- 인터랙션 피드백 명확 (hover, focus, active)
- 에러/성공 메시지도 Pointint 톤 (친절하되 간결)
- 커서 제작 흐름에 최적화

---

## Workflow

### 1. 시스템 스킬 체이닝

`shadcn` 시스템 스킬 호출 → 컴포넌트 문서/설치 가이드 확보 → Pointint 커스텀 적용

### 2. 컴포넌트 추가 시

```bash
npx shadcn@latest add [component]
```

추가 후 Pointint 토큰 적용:
- 색상 → CSS 변수 참조
- spacing → Pointint spacing 스케일
- border-radius → Pointint radius 토큰

### 3. 핵심 컴포넌트 가이드

| 컴포넌트 | Pointint 용도 | 커스텀 포인트 |
|---|---|---|
| Button | 업로드 CTA, 다운로드, 단계 전환 | accent color, 넉넉한 사이즈 |
| Dialog | 확인/경고, 세션 저장 안내 | 여백, 간결한 메시지 |
| Input/Form | 프로젝트 이름, 설정 | 넉넉한 높이, 명확한 레이블 |
| Card | 프로젝트 목록, 마켓 아이템 | 커서 프리뷰 중심, 미묘한 그림자 |
| Slider | Hotspot 조정, 크기 조정 | 정밀 조작 가능, 시각 피드백 |
| Tabs | 에디터 패널, 설정 | 부드러운 전환 |
| Toast | 저장 완료, 다운로드 시작 | 짧은 메시지, 자동 사라짐 |

### 4. 변경 반영

1. 컴포넌트 코드: `components/ui/`
2. 커스텀 레시피: 필요 시 `point/11-Design/` 문서화

## Constraints

- shadcn 기본 API 유지 — prop 추가는 최소한
- 접근성(a11y) 기본 지원 유지
- 과도한 애니메이션 금지 — 부드럽고 빠르게

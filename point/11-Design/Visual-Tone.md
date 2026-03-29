---
title: Visual Tone
tags:
  - pointint
  - design
  - visual
  - theme
aliases:
  - 비주얼 톤앤매너
---

# Visual Tone

> **Status:** Active
> **Last Updated:** 2026-03-28
> **Implementation:** `frontend/src/app/globals.css`

## 테마 구조

3개 글로벌 테마를 지원한다. `data-theme` 속성으로 전환.

| 테마 | 기본 모드 | 설명 |
|---|---|---|
| `dark` | 기본값 | 딥 네이비 + 로즈 핑크 |
| `light` | — | 클린 화이트 + 딥 로즈 |
| `custom` | — | 사용자 커스텀 슬롯 (이후 구현) |

## 컬러 팔레트

### Dark (기본)

| 역할 | 값 | 설명 |
|---|---|---|
| bg-primary | `#080C18` | 딥 네이비 블루 |
| bg-secondary | `#0F1322` | 표면 |
| bg-tertiary | `#181E2E` | 올린 표면 |
| bg-card | `#0F1322` | 카드 |
| text-primary | `#CDD2DE` | 쿨 오프화이트 |
| text-secondary | `#8B91A6` | 서브 |
| text-muted | `#5A6078` | 힌트 |
| accent | `#E8496A` | 로즈 핑크 |
| accent-hover | `#D43860` | 딥 로즈 |
| border | `#252B3C` | |

### Light

| 역할 | 값 | 설명 |
|---|---|---|
| bg-primary | `#FAFAFA` | 클린 화이트 |
| bg-secondary | `#F2F3F5` | 표면 |
| bg-tertiary | `#E8E9ED` | |
| bg-card | `#FFFFFF` | 순백 카드 |
| text-primary | `#181B2A` | 네이비 블랙 |
| text-secondary | `#555868` | 서브 |
| text-muted | `#888B98` | 힌트 |
| accent | `#C93558` | 딥 로즈 (라이트용) |
| accent-hover | `#B02A4A` | |
| border | `#DDDEE3` | |

## 디자인 원칙

- "AI가 만든 것 같은" 느낌 금지 — 글래스모피즘, 보라색, 뻔한 그라디언트 안 씀
- 보라색 금지
- 노이즈 텍스처 사용 — 질감 있는 느낌
- 대비는 충분하되 공격적이지 않게
- 다크/라이트 모드에서 악센트 색 무게감을 맞춤

## 접근성 검증

| 조합 | 대비율 | WCAG |
|---|---|---|
| 다크 text on bg | ~13:1 | AAA |
| 다크 accent on bg | ~5.5:1 | AA |
| 라이트 text on bg | ~14:1 | AAA |
| 라이트 accent on bg | ~5.0:1 | AA |

## To Do

- [ ] 폰트 선정
- [ ] 아이콘 스타일
- [ ] 컴포넌트 스타일 (버튼, 입력, 카드)
- [ ] 랜딩 비주얼 방향
- [ ] Custom 테마 구현 방식

## Related

- [[Design-Index]]

## See Also

- [[07-Brand/Brand-Philosophy]]
- [[07-Brand/Copy-Guide]]

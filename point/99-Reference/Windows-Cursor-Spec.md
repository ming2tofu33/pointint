---
title: Windows Cursor Spec
tags:
  - pointint
  - reference
  - cursor
  - windows
aliases:
  - 커서 스펙
  - .cur 스펙
---

# Windows Cursor Spec

> **Status:** Active
> **Last Updated:** 2026-03-27
> **Source:** `docs/Windows 커서 스펙.md`

## .cur 파일 포맷

- `.ico`와 거의 동일, Hotspot 좌표가 헤더에 추가
- 크기: 16×16 ~ 256×256px (기본 32×32)
- 색상: 32-bit RGBA (알파 투명도)
- Hotspot: 좌상단(0,0) 기준 x, y 픽셀 좌표
- 하나의 .cur에 여러 크기 포함 가능 (멀티사이즈)

## .ani 파일 포맷

- 여러 프레임의 .cur을 묶은 애니메이션 포맷
- 프레임 속도: jiffies (1/60초 단위)
- MVP에서 포함

## 17종 역할

| # | 역할 | 레지스트리 키 |
|---|---|---|
| 1 | Normal Select | Arrow |
| 2 | Help Select | Help |
| 3 | Working in Background | AppStarting |
| 4 | Busy | Wait |
| 5 | Precision Select | Crosshair |
| 6 | Text Select | IBeam |
| 7 | Handwriting | NWPen |
| 8 | Unavailable | No |
| 9 | Vertical Resize | SizeNS |
| 10 | Horizontal Resize | SizeWE |
| 11 | Diagonal Resize 1 | SizeNWSE |
| 12 | Diagonal Resize 2 | SizeNESW |
| 13 | Move | SizeAll |
| 14 | Alternate Select | UpArrow |
| 15 | Link Select | Hand |
| 16 | Location Select | Pin |
| 17 | Person Select | Person |

MVP: 3종 (Normal, Text, Link) → 이후: 17종 전체

## 설계 제약

| 제약 | 설계 영향 |
|---|---|
| 32×32가 기본 | 편집기 기준 크기 |
| Hotspot은 픽셀 단위 | 드래그 UI 정밀도 필요 |
| 알파 투명도 필수 | 배경 제거 품질 = 결과물 품질 |
| 작은 크기 가독성 | 시뮬레이션 실제 크기 미리보기 중요 |
| 수동 적용 기본 | 적용 가이드 상세함이 UX의 일부 |

## Related

- [[API-Endpoints]] (이후 작성)

## See Also

- [[03-Features/Cursor-Editor]]
- [[03-Features/Simulator]]

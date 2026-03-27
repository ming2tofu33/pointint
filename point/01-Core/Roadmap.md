---
title: Roadmap
tags:
  - pointint
  - core
  - roadmap
aliases:
  - Pointint Roadmap
---

# Roadmap

> **Status:** Active
> **Last Updated:** 2026-03-27

Phase 상세는 [[06-Implementation/Phase-Flow]] 참조.

## Phase 1 — MVP Core

**핵심 질문:** 사람들은 이미지를 커서로 만들고, 실제로 다운로드해서 적용할 만큼 이 흐름을 가치 있게 느끼는가?

- .cur 정적 커서 + .ani 애니메이션 커서 제작
- 이미지 업로드 (PNG, JPG, WebP, GIF)
- 자동 배경 제거 (MVP부터 최선 품질)
- 편집기, Hotspot, 시뮬레이션
- 다운로드 (개별 + 세트)
- 적용 가이드 + 원복 가이드
- 다국어 한/영
- SEO + GEO 기본
- 랜딩 + 가이드 모바일 반응형
- Guest 무제한

---

## Phase 2a — Auth + Storage

**핵심 질문:** 저장과 17종 전체가 가입 동기로 충분한가?

- Supabase Auth (이메일 + 소셜)
- 프로젝트 저장 / 재수정
- 17종 전체 커서 제작 (Free)
- 기본 약관 + 면책 조항

## Phase 2b — Install

- .inf 자동 설치 스크립트
- 17종 세트 원클릭 적용

---

## Phase 3a — AI-Assisted

**핵심 질문:** AI 보조가 유료 전환을 만드는가?

- 가장자리 보정, 자동 크롭, 가독성 개선, 실루엣 정리
- Lite 티어 (₩3,900/월)
- AI credit 내부 구조

## Phase 3b — Community (4와 병렬)

**핵심 질문:** 사용자들이 만든 커서를 공유하고 싶어하는가?

- 쇼케이스/갤러리, 공유, 프로필, 반응
- 동적 OG 이미지 (커서별 SNS 미리보기)
- 쇼케이스 모바일 반응형

---

## Phase 4 — AI Generation (3b와 병렬)

**핵심 질문:** AI 생성이 더 깊은 창작을 만드는가?

- 텍스트/이미지 기반 커서 생성
- 3종 변형안 자동 추천
- Pro 티어 (₩9,900/월)
- Credit 체계 (보정 1cr, 생성 2cr)
- `Generate -> Edit -> Expand -> Simulate -> Download`
- ⚠️ AI 생성물 소유권 법률 검토 필요

---

## Phase 5a — Marketplace

**핵심 질문:** 제작과 소비가 하나의 루프로 도는가?

- 판매/구매, 내부 재화
- 수수료 (Lite 20%, Pro 10%)
- ⚠️ DMCA, 마켓플레이스 약관, NSFW, 콘텐츠 정책

## Phase 5b — Moniterior

**핵심 질문:** 모니테리어가 하나의 세계관으로 묶이는가?

- 바탕화면 이미지 생성/편집
- 데스크톱 펫 앱
- 테마팩 (커서 + 배경 + 펫)

---

## 단계 전환 원칙

- 각 Phase는 이전 Phase의 Gate가 충족된 뒤 착수한다
- **예외: 3b와 4는 병렬** — 3a 완료 후 독립적으로 진행 가능
- "검증"은 사용자 행동 데이터와 운영 안정성으로 판단한다
- 다음 Phase를 미리 설계하되, 현재 Phase의 품질을 희생하지 않는다

## Related

- [[Project-Vision]]
- [[Target-Audience]]
- [[Tech-Stack]]

## See Also

- [[06-Implementation/Phase-Flow]]
- [[06-Implementation/ACTIVE_SPRINT]]
- [[08-Business/Business-Index]]

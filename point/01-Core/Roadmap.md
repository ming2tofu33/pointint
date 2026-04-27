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
> **Last Updated:** 2026-04-27

Phase 상세와 현재 실행 상태는 [[06-Implementation/Phase-Flow]]와 [[06-Implementation/ACTIVE_SPRINT]]를 기준으로 본다.

## Phase 1 — MVP Core

**핵심 질문:** 사람들은 이미지를 커서로 만들고, 실제로 다운로드해서 적용할 만큼 이 흐름을 가치 있게 느끼는가?

- .cur 정적 커서 제작
- 이미지 업로드 (PNG, JPG, WebP)
- 자동 배경 제거 (MVP부터 최선 품질)
- 편집기, Hotspot, 시뮬레이션
- 다운로드 (개별 + 세트)
- 적용 가이드 + 원복 가이드
- 다국어 한/영
- SEO + GEO 기본
- 랜딩 + 가이드 모바일 반응형
- Guest 무제한

---

## Phase 1.5 — ANI + Media Prep Foundation

**핵심 질문:** 애니메이션 커서 제작이 Pointint만의 기술적 차별점이 되는가?

- `.ani` 애니메이션 커서 제작
- GIF 기반 ANI 제작
- 여러 이미지 프레임을 정렬해 ANI 소스로 변환
- 공유 framing / hotspot / 시뮬레이션 흐름 재사용
- `Video to ANI`는 GIF Maker 기반이 안정된 뒤 같은 source-maker 구조로 확장

---

## Phase 2a — Auth + Storage

**핵심 질문:** 저장과 17종 전체가 가입 동기로 충분한가?

- Supabase Auth (Google OAuth only, 이메일/비밀번호 가입 없음)
- Auth UX Contract ([[03-Features/Auth-UX-Contract]]) 기반 가입 프롬프트 + OAuth 복귀 동선
- 프로젝트 저장 / 재수정
- 17종 전체 커서 제작 (Member)
- 기본 약관 + 면책 조항

## Phase 2b — Install

- .inf 자동 설치 스크립트
- 17종 세트 원클릭 적용

---

## Phase 2.5 — Theme Asset Foundation

**핵심 질문:** 커서를 만든 사용자가 같은 소스로 폴더 아이콘과 배경화면까지 만들고 싶어하는가?

- Folder Icon Maker: 이미지 → `.ico`
- 바로가기/폴더 아이콘 미리보기
- 배경화면 크롭/비율별 export
- Theme Pack draft: cursor set + folder icons + wallpaper를 하나의 project로 묶기
- ZIP export 중심
- Windows 적용 가이드는 제공하되, 자동 적용은 최소화

### Phase 2.5에서 제외

- 시스템 사운드 스킴
- 데스크톱 펫
- 라이브 배경화면
- 마켓 판매
- 완전 자동 테마 installer

---

## Phase 3a — AI-Assisted

**핵심 질문:** AI 보조가 Tint 구매 전환을 만드는가?

- 커서/아이콘/배경화면의 가장자리 보정, 자동 크롭, 가독성 개선, 실루엣 정리
- Tint 팩 구매
- 기능별 Tint 소모량 확정

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
- 생성형 AI의 Tint 가격 확정
- 반복 구매를 만들 수 있는 생성/편집 루프 검증
- `Generate -> Edit -> Expand -> Simulate -> Download`
- ⚠️ AI 생성물 소유권 법률 검토 필요

---

## Phase 5a — Marketplace

**핵심 질문:** 제작과 소비가 하나의 루프로 도는가?

- Creator 승급, 판매/구매, 내부 재화 순환
- Tint 기반 거래와 20% 마켓 수수료
- 초기 현금 정산 없음
- ⚠️ DMCA, 마켓플레이스 약관, NSFW, 콘텐츠 정책

## Phase 5b — Moniterior

**핵심 질문:** 모니테리어가 하나의 세계관으로 묶이는가?

- 공식/크리에이터 테마팩
- 고급 바탕화면 이미지 생성/편집
- 시스템 사운드 스킴
- 데스크톱 펫 앱
- 테마팩 (커서 + 아이콘 + 배경 + 사운드 + 펫)

---

## 단계 전환 원칙

- 각 Phase는 이전 Phase의 Gate가 충족된 뒤 착수한다
- **예외: 3b와 4는 병렬** — 3a 완료 후 독립적으로 진행 가능
- **Phase 2.5는 Phase 2의 저장/17-role/설치 신뢰가 안정된 뒤 착수한다**
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

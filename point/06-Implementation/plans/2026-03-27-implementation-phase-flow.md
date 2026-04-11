---
title: Implementation Phase Flow
tags:
  - pointint
  - implementation
  - phase-flow
  - master-plan
aliases:
  - Phase Flow
  - Master Implementation Plan
---

# Implementation Phase Flow

> **Status:** Active — 전체 구현 흐름의 메인 문서
> **Last Updated:** 2026-04-11
> **Current Phase:** Phase 1 — MVP Core (게이트 클로즈, follow-up running)
> **Economy:** [[2026-03-27-pointint-economy-design]]

## Phase Flow Overview

```
Phase 1: MVP Core ◄── 현재
  이미지 → .cur 제작 + 시뮬레이션 + 건강 체크 + 원클릭 적용
  Guest 무제한 사용
      │
      ▼  Gate: 제작 완료율, 시뮬레이션 사용률
Phase 1.5: .ani + 확장 ★ 전략적 우선순위
  애니메이션 커서 (.ani) — 웹에서 유일한 제작 도구
  인터랙티브 시뮬레이션, 편의 기능
      │
      ▼  Gate: .ani 흐름 완결, 제작 완료율 유지
Phase 2: Auth + 17종 자동 생성
  로그인(Member), 프로젝트 저장
  1개 → 17종 자동 변형 (핵심 lock-in)
      │
      ▼  Gate: Guest→Member 전환율, 17종 사용률
Phase 3: AI-Assisted + Tint 도입
  AI 보조 편집 (배경 제거 고도화, 보정)
  Tint 경제 시작 — 첫 수익
      │
      ▼  Gate: Member→Tint 구매 전환율, AI 사용률
Phase 4: AI Generation
  AI 커서 생성 (텍스트/이미지)
  Tint 소모처 확대
      │
      ▼  Gate: AI 생성 사용률, 반복 구매율
Phase 5: Marketplace + Moniterior
  마켓플레이스(Creator 등급), Tint 순환 경제
  공식 콘텐츠, 테마팩 확장
```

---

## Phase 1: MVP Core — 정적 커서 제작 검증

> **핵심 질문:** 사람들은 이미지를 커서로 만들고, 실제로 다운로드해서 적용할 만큼 이 흐름을 가치 있게 느끼는가?

### 스택

| 레이어 | 기술 | 배포 |
|---|---|---|
| 프론트엔드 | Next.js (React + TypeScript) + Tailwind CSS v4 | Vercel |
| 백엔드 | FastAPI (Python) | Railway |
| DB/Auth/Storage | Supabase | Phase 2에서 본격 사용 |

### Wave 1: 프로젝트 셋업 + 백엔드 코어

| Task ID | 제목 | 상태 | 우선도 |
|---|---|---|---|
| P1-SETUP-01 | Next.js 프로젝트 초기화 + Vercel 연결 | done | P0 |
| P1-SETUP-02 | FastAPI 프로젝트 초기화 + Railway 배포 | done | P0 |
| P1-SETUP-03 | 프론트↔백엔드 API 통신 구조 확정 | done | P0 |
| P1-BG-01 | 자동 배경 제거 엔드포인트 (rembg 자체호스팅) | done | P0 |
| P1-CONVERT-01 | 파일 변환 (JPG/WebP → 투명 PNG) | done | P0 |
| P1-CUR-01 | .cur 바이너리 생성 로직 | done | P0 |

### Wave 2: 편집기 + 시뮬레이션 + 품질 검증

| Task ID | 제목 | 상태 | 우선도 |
|---|---|---|---|
| P1-UPLOAD-01 | 이미지 업로드 UI (PNG/JPG/WebP) | done | P0 |
| P1-EDITOR-01 | 정적 커서 편집기 — 캔버스, 위치/크기 조정 | done | P0 |
| P1-EDITOR-02 | Hotspot 드래그 지정 UI | done | P0 |
| P1-HOTSPOT-01 | Hotspot 자동 추천 (규칙 기반: 뾰족한 끝점 탐지) | todo | P1 |
| P1-SIM-01 | 시뮬레이션 — 3종 미리보기 (Normal/Text/Link) | done | P0 |
| P1-MOCKUP-01 | 실제 크기 데스크톱 목업 (밝은/어두운 배경 위 32px) | todo | P1 |
| P1-HEALTH-01 | 커서 건강 체크 (배경별 가시성, Hotspot 위치, 32px 가독성) | done | P0 |

### Wave 3: 다운로드 + 적용 + 랜딩

| Task ID | 제목 | 상태 | 우선도 |
|---|---|---|---|
| P1-DL-01 | .cur 다운로드 | done | P0 |
| P1-INF-01 | .inf 자동 설치 파일 생성 (원클릭 적용) | done | P0 |
| P1-RESTORE-01 | 기본 커서 원복 .inf 포함 (다운로드 zip에 동봉) | done | P0 |
| P1-GUIDE-01 | 적용 가이드 화면 (다운로드 직후 표시) | done | P0 |
| P1-LANDING-01 | 랜딩 페이지 ("Your Point, Your Tint.") | done | P0 |
| P1-SHOWCASE-01 | 커서 쇼케이스 카드 이미지 자동 생성 (소셜 공유용) | todo | P1 |
| P1-ANALYTICS-01 | GA4 + Microsoft Clarity 연동 (단계별 이벤트 추적) | todo | P0 |
| P1-DEFENSE-01 | 파일 크기/해상도 제한 (기본 validation) | done | P1 |

### Phase 1 Gate — Phase 1.5 진입 조건

| # | 게이트 | 상태 | 기준 |
|---|---|---|---|
| 1 | .cur 제작 흐름 완결 | ✅ | 업로드→편집→Hotspot→다운로드 끊김 없음 |
| 2 | 시뮬레이션 동작 | ✅ | 3종 미리보기 동작 |
| 3 | 건강 체크 동작 | ✅ | 다운로드 전 가시성/Hotspot 진단 표시 |
| 4 | .inf 적용 동작 | ✅ | 더블클릭으로 커서 적용 + 원복 동작 |
| 5 | 배포 안정성 | ✅ | Vercel + Railway 안정 운영 |
| 6 | 랜딩 페이지 | ✅ | hero + FAQ + SEO/GEO + OG metadata 동작 |

### North Star Metric: **제작 완료율** (업로드 시작 → 다운로드 완료)

---

## Phase 1.5: .ani + 확장 — 웹 유일의 애니메이션 커서 제작

> **핵심 질문:** 애니메이션 커서 제작이 Pointint만의 기술적 해자가 되는가?
>
> **전략적 중요도:** 웹에서 .ani를 제대로 만들어주는 서비스가 사실상 없음. 기존 도구는 전부 설치형(AniTuner, AniCursor, Axialis)이거나 기능 빈약(Cursor.cc). Phase 1.5를 빠르게 완성하면 **"웹에서 유일하게 애니메이션 커서를 만드는 곳"** 포지셔닝 확보.

### 태스크

| Task ID | 제목 | 상태 | 우선도 |
|---|---|---|---|
| P1.5-ANI-01 | .ani 바이너리 생성 로직 | todo | P0 |
| P1.5-GIF-01 | GIF → 프레임 분리 로직 | todo | P0 |
| P1.5-ANI-EDIT-01 | 애니메이션 편집기 (프레임 순서/속도/추가/삭제) | todo | P0 |
| P1.5-ANI-EDIT-02 | 애니메이션 미리보기 (실시간 재생) | todo | P0 |
| P1.5-SIM-02 | 시뮬레이션 — 인터랙티브 존 (실제 상황 재현) | todo | P0 |
| P1.5-SIM-03 | Light / Dark 배경 전환 | todo | P1 |
| P1.5-SIM-04 | .ani 애니메이션 시뮬레이션 재생 | todo | P0 |
| P1.5-EDITOR-03 | 회전/뒤집기 | todo | P1 |
| P1.5-DL-02 | 세트 다운로드 (.cur + .ani zip 패키징) | todo | P0 |
| P1.5-DEFENSE-02 | Rate limiting + 봇 탐지 | todo | P1 |

### Phase 1.5 Gate — Phase 2 진입 조건

| # | 게이트 | 상태 | 기준 |
|---|---|---|---|
| 1 | .ani 제작 흐름 완결 | ⏳ | GIF/멀티이미지→편집→다운로드 끊김 없음 |
| 2 | 애니메이션 시뮬레이션 | ⏳ | .ani 실시간 재생 + 인터랙티브 동작 |
| 3 | 제작 완료율 유지 | ⏳ | Phase 1 대비 완료율 하락 없음 |

---

## Phase 2: Auth + 17종 자동 생성

> **핵심 질문:** 저장과 17종 자동 변형이 가입 동기로 충분한가?
>
> **핵심 기능:** Normal 커서 1개 → 나머지 16종(Text, Link, Working 등) 규칙 기반 자동 생성. 유저는 확인 후 마음에 안 드는 것만 수정. 이 기능은 **Pointint 없이는 17종 세트를 완성할 수 없게** 만드는 lock-in.

### 태스크

> **17종 자동 변형은 Phase 2에서 Member 무료.** Tint 경제는 Phase 3에서 시작하므로, Phase 2에서는 과금 없이 기능 가치만 검증한다. Phase 3 이후 17종 고급 옵션(AI 기반 변형 등)을 Tint로 게이팅할 수 있다.

| Task ID | 제목 | 상태 | 우선도 |
|---|---|---|---|
| P2-AUTH-01 | Supabase Auth 연동 (Google + GitHub OAuth, 이메일 없음) | todo | P0 |
| P2-DB-01 | Supabase 스키마 설계 (유저, 프로젝트, Tint 지갑 컬럼 예비) | todo | P0 |
| P2-STORAGE-01 | 원본 이미지 + 결과물 저장 | todo | P0 |
| P2-PROJECT-01 | 프로젝트 저장 / 목록 / 재수정 UI | todo | P0 |
| P2-17ROLE-DESIGN | 17종 변형 규칙 스펙 작성 (Normal→Text/Link/Working 등 변환 로직) | todo | P0 |
| P2-17ROLE-01 | 17종 자동 변형 엔진 (규칙 기반, Member 무료) | todo | P0 |
| P2-17ROLE-02 | 17종 개별 확인/수정 UI | todo | P0 |
| P2-17ROLE-03 | 17종 세트 다운로드 + .inf 포함 zip | todo | P0 |
| P2-CONVERT-01 | Guest→Member 전환 프롬프트 UI (저장/17종 시도 시 가입 유도) | todo | P0 |
| P2-GALLERY-01 | 커서 갤러리 (공개 쇼케이스) | todo | P0 |
| P2-MODERATION-01 | 갤러리 기본 신고 + 관리자 검토 시스템 | todo | P0 |
| P2-TERMS-01 | 기본 약관 + 면책 조항 작성 | todo | P0 |
| P2-METRICS-01 | Guest→Member 전환율 추적 (GA4 퍼널) | todo | P0 |

### Phase 2 Gate — Phase 3 진입 조건

| # | 게이트 | 상태 | 기준 |
|---|---|---|---|
| 1 | 로그인 + 프로젝트 저장 동작 | ⏳ | 저장→재수정 흐름 정상 |
| 2 | 17종 자동 생성 + 다운로드 동작 | ⏳ | 1개→17종 변형→세트 다운로드 |
| 3 | Guest→Member 전환 발생 | ⏳ | 의미 있는 전환율 확인 |
| 4 | 약관 준비 완료 | ⏳ | 기본 면책 + 사용자 권리 보증 |

### North Star Metric: **Guest→Member 전환율**

---

## Phase 3: AI-Assisted + Tint Economy

> **핵심 질문:** AI 보조가 Tint 구매를 만드는가?

### 태스크

| Task ID | 제목 | 상태 | 우선도 |
|---|---|---|---|
| P3-AI-EDGE-01 | AI 가장자리 보정 (500 Tint) | todo | P0 |
| P3-AI-CROP-01 | AI 자동 크롭 (500 Tint) | todo | P0 |
| P3-AI-BG-01 | AI 배경 제거 고도화 (500 Tint) | todo | P0 |
| P3-AI-READ-01 | AI 가독성 개선 / 실루엣 정리 (500 Tint) | todo | P1 |
| P3-HOTSPOT-02 | Hotspot AI 추천 고도화 | todo | P1 |
| P3-TINT-01 | Tint 팩 결제 연동 (₩4,900~₩39,900) | todo | P0 |
| P3-TINT-02 | Tint 지갑 + 소모 시스템 구현 | todo | P0 |
| P3-TINT-03 | 출석 +50 / 제작 +50 / 갤러리 +200 / 챌린지 +500 보상 시스템 | todo | P0 |
| P3-HEALTH-02 | 건강 체크에 AI 기반 권장 사항 연결 ("윤곽선 추가 권장 → AI 보정 500 Tint") | todo | P1 |
| P3-PAY-KR-01 | 한국 결제 연동 (토스페이먼츠) | todo | P0 |
| P3-METRICS-01 | Member→Tint 구매 전환율 추적 | todo | P0 |

### Phase 3 Gate — Phase 4 진입 조건

| # | 게이트 | 상태 | 기준 |
|---|---|---|---|
| 1 | AI 보조 기능 동작 | ⏳ | 편집기 내 Tint 소모 후 사용 가능 |
| 2 | Tint 결제 흐름 동작 | ⏳ | 팩 구매→지갑 충전→AI 사용 정상 |
| 3 | Tint 구매 발생 | ⏳ | 의미 있는 전환율 확인 |

### North Star Metric: **Member→Tint 구매 전환율**

---

## Phase 4: AI Generation

> **핵심 질문:** AI 생성이 더 깊은 창작과 반복 구매를 만드는가?

### 태스크

| Task ID | 제목 | 상태 | 우선도 |
|---|---|---|---|
| P4-MODEL-01 | AI 생성 모델 선택 + 비용 측정 | todo | P0 |
| P4-PRICING-01 | AI 생성 Tint 가격 확정 (모델 비용 기반) | todo | P0 |
| P4-GEN-TEXT-01 | 텍스트 → 커서 생성 (가격 TBD) | todo | P0 |
| P4-GEN-IMG-01 | 이미지 → 커서 생성 (가격 TBD) | todo | P0 |
| P4-GEN-MIX-01 | 참고 이미지 + 텍스트 → 커서 생성 | todo | P1 |
| P4-GEN-VAR-01 | 3종/17종 변형안 자동 추천 (가격 TBD) | todo | P0 |
| P4-GEN-EDIT-01 | 생성 결과 → 편집기 연결 | todo | P0 |
| P4-LEGAL-01 | AI 생성물 소유권 법률 검토 | todo | BLOCKING |
| P4-METRICS-01 | AI 생성 사용률 + Tint 반복 구매율 추적 | todo | P1 |

### Phase 4 Gate — Phase 5 진입 조건

| # | 게이트 | 상태 | 기준 |
|---|---|---|---|
| 1 | AI 생성 동작 | ⏳ | 텍스트/이미지 기반 커서 생성 정상 |
| 2 | 생성→편집 연결 | ⏳ | Generate→Edit→Simulate→Download 흐름 |
| 3 | Tint 반복 구매 발생 | ⏳ | 재구매율 확인 |
| 4 | 법률 검토 완료 | ⏳ | AI 생성물 소유권 약관 정비 |

### North Star Metric: **월간 AI 생성 횟수**

---

## Phase 5: Marketplace + Moniterior

> **핵심 질문:** 제작과 소비가 하나의 Tint 순환 루프로 도는가?

### Wave 1: 마켓플레이스

| Task ID | 제목 | 상태 | 우선도 |
|---|---|---|---|
| P5-CREATOR-01 | Creator 자동 승급 (커서 5개+ 제작 + 계정 7일+) | todo | P0 |
| P5-MKT-01 | 판매 등록 UI (Creator 전용) | todo | P0 |
| P5-MKT-02 | Tint로 구매 / 수집 UI | todo | P0 |
| P5-MKT-03 | 수수료 20% 소각 처리 | todo | P0 |
| P5-MKT-04 | 마켓 등록비 (소량 Tint, 스팸 방지) | todo | P0 |
| P5-MKT-05 | 크리에이터 프로필 | todo | P1 |
| P5-BOOTSTRAP-01 | 공식 커서 팩 10~20개 직접 제작 (마켓 시딩) | todo | P0 |
| P5-INVITE-01 | 친구 초대 보상 (초대자/피초대자 각 2,000 Tint) | todo | P1 |
| P5-LEGAL-01 | DMCA 테이크다운 프로세스 구축 | todo | BLOCKING |
| P5-LEGAL-02 | 마켓플레이스 약관 + 콘텐츠 정책 | todo | BLOCKING |
| P5-NSFW-01 | NSFW 자동 스캔 (판매 등록 시) | todo | P0 |
| P5-RIGHTS-01 | 권리 확인 동의 절차 | todo | P0 |

### Wave 2: 공식 콘텐츠 + 모니테리어

| Task ID | 제목 | 상태 | 우선도 |
|---|---|---|---|
| P5-OFFICIAL-01 | 공식 테마팩 1종 출시 (Tint로 구매) | todo | P0 |
| P5-SEASON-01 | 시즌 이벤트 / 한정 드롭 | todo | P1 |
| P5-WALLPAPER-01 | 바탕화면 이미지 생성/편집 | todo | P2 |
| P5-PET-01 | 데스크톱 펫 앱 | todo | P2 |
| P5-THEME-01 | 테마팩 (커서 + 배경 + 펫) | todo | P2 |

### Tint 순환 루프

```
만든다 → 공유한다 → 판매한다(Tint) → Tint가 쌓인다 → AI/콘텐츠에 소비 → 더 좋은 걸 만든다
                                          │
                                     수수료 20% 소각 (경제 균형)
```

### North Star Metric: **마켓 월간 거래 수**

---

## Phase 간 전환 원칙

- 각 Phase는 이전 Phase의 **Gate가 충족된 뒤** 착수한다
- "검증"은 사용자 행동 데이터와 운영 안정성으로 판단한다
- 다음 Phase를 미리 설계하되, 현재 Phase의 품질을 희생하지 않는다
- BLOCKING 태스크는 Gate 통과 전 반드시 해결한다

### Phase별 법률 체크포인트

| Phase | 법률 체크 |
|---|---|
| Phase 2 | 기본 약관 + 면책 조항 |
| Phase 4 | AI 생성물 소유권 법률 검토 |
| Phase 5 | DMCA, 마켓플레이스 약관, 콘텐츠 정책 |

### Phase별 수익 기대

| Phase | 수익 모델 | 기대 |
|---|---|---|
| 1~2 | 없음 | 유저 확보, 제작 흐름 검증 |
| 3 | Tint 팩 판매 (₩4,900~) | 첫 수익 (보수적 소폭 흑자) |
| 4 | Tint 소모처 확대 | 흑자 확대 |
| 5 | 마켓 수수료 + 콘텐츠 판매 | 본격 수익 |

## Related

- [[ACTIVE_SPRINT]]
- [[2026-03-27-pointint-product-direction-design]]
- [[2026-03-27-pointint-strategy-detail]]
- [[2026-03-27-pointint-economy-design]]

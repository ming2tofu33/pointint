---
name: pointint-business-docs
description: Pointint 사업 문서 생성 (제안서, 피치덱, 사업계획서, 보고서, 스프레드시트). Use when the user mentions 제안서, 사업 계획서, 피치덱, 발표 자료, 투자, IR, 보고서, 엑셀, 스프레드시트, Word, PowerPoint, PDF, 문서 작성, 또는 비즈니스 문서가 필요한 상황.
---

# Pointint Business Documents

## Context

### 기본 정보

- **제품:** Pointint — 이미지를 Windows 커서로 만드는 제작 워크플로우
- **브랜드:** `Your Point, Your Tint.`
- **스택:** Next.js + FastAPI + Supabase + Vercel + Railway
- **티어:** Guest / Free / Lite (₩3,900) / Pro (₩9,900)
- **타깃:** 일반 사무직 > 커서 커뮤니티 > Z세대

### 문서 소스

비즈니스 문서에 필요한 원본 데이터는 모두 vault에 있다:

| 영역 | 소스 |
|---|---|
| 비전/포지셔닝 | `point/01-Core/Project-Vision.md` |
| 타깃 | `point/01-Core/Target-Audience.md` |
| 브랜드 | `point/07-Brand/Brand-Philosophy.md` |
| 차별화 | `point/07-Brand/Differentiation.md` |
| 가격/티어 | `point/08-Business/Tier-Pricing.md` |
| 수익화 | `point/08-Business/Monetization-Strategy.md` |
| 구현 계획 | `point/06-Implementation/plans/` |
| 로드맵 | `point/01-Core/Roadmap.md` |

---

## Workflow

### 1. 시스템 스킬 체이닝

문서 유형에 따라 적절한 시스템 스킬 호출:

| 결과물 | 시스템 스킬 |
|---|---|
| 피치덱 (.pptx) | `pptx` |
| 사업 계획서 (.docx) | `docx` |
| 재무 시뮬레이션 (.xlsx) | `xlsx` |
| 배포용 문서 (.pdf) | `pdf` |

### 2. 문서 생성 흐름

1. vault 소스에서 최신 데이터 읽기
2. 문서 유형에 맞는 구조 설계
3. Pointint 톤 적용 (간결, 여백, 감성)
4. 시스템 스킬로 파일 생성
5. `docs/` 디렉토리에 저장 (외부 공유용)

### 3. 문서 유형별 구조

**피치덱 (투자/파트너):**
1. 한 줄 정의
2. 문제 (Why)
3. 솔루션 (What)
4. 데모/결과물
5. 시장 / 타깃
6. 비즈니스 모델
7. 차별화
8. 로드맵
9. 팀
10. Ask

**사업 계획서:**
1. Executive Summary
2. 시장 분석
3. 제품 설명
4. 비즈니스 모델
5. 마케팅 전략
6. 재무 계획
7. 로드맵

**가격 시뮬레이션 (스프레드시트):**
- 티어별 예상 사용자 수
- 전환율 시나리오 (보수적/중립/낙관)
- 월별 매출 예측
- AI 비용 시뮬레이션

### 4. 저장 규칙

- 외부 공유 문서: `docs/` 디렉토리
- 내부 작업 문서: `point/` 유지
- 파일명: `YYYY-MM-DD-<topic>.<ext>`

## Constraints

- vault 데이터를 그대로 복붙하지 않는다 — 문서 목적에 맞게 재구성
- Pointint 톤 유지 — 피치덱도 깔끔하고 여백 있게
- 수치는 "감각 기준" 상태 — 확정된 것처럼 표현하지 않는다

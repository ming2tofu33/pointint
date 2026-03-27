---
name: pointint-deploy
description: Pointint 배포 (Vercel + Railway). Use when the user mentions 배포, deploy, Vercel, Railway, 프로덕션, 프리뷰, CI/CD, 환경 변수, 도메인, 또는 배포가 필요한 상황.
---

# Pointint Deploy Workflow

## Context

### 배포 구조

| 서비스 | 플랫폼 | 용도 |
|---|---|---|
| Next.js 프론트엔드 | Vercel | 웹앱 호스팅 |
| FastAPI 백엔드 | Railway | API 서버 |
| Supabase | Supabase Cloud | DB + Auth |

### 환경

| 환경 | 용도 |
|---|---|
| Preview | PR/브랜치별 자동 배포 |
| Production | 메인 브랜치 배포 |

---

## Workflow

### 1. 시스템 스킬 체이닝

**Vercel 배포:** `deploy-to-vercel` 또는 `vercel:deploy` 시스템 스킬
**Vercel 설정:** `vercel:setup` 시스템 스킬

### 2. 초기 설정 (Phase 1 Wave 1)

**Vercel (Next.js):**
```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add FASTAPI_URL
```

**Railway (FastAPI):**
- GitHub 연동
- 환경 변수 설정 (SUPABASE_URL, SUPABASE_SERVICE_KEY 등)
- 커스텀 도메인 (api.pointint.com 등)

### 3. 배포 체크리스트

배포 전 확인:
- [ ] 환경 변수 설정 완료
- [ ] 빌드 에러 없음
- [ ] Preview 배포에서 테스트 완료
- [ ] API 연결 확인
- [ ] 메타데이터/OG Image 확인

### 4. 변경 반영

1. 배포 설정: 프로젝트 설정 파일 (vercel.json 등)
2. 운영 문서: `point/05-Operations/` 업데이트
3. 구현 계획: `point/06-Implementation/plans/`

## Constraints

- Phase 1 Wave 1 (P1-SETUP-01~03)에서 초기 설정
- 커스텀 도메인은 후순위
- Railway 무료 티어 한계 인지

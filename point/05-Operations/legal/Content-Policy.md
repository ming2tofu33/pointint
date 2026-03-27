---
title: Content Policy
tags:
  - pointint
  - operations
  - legal
  - content-policy
aliases:
  - 콘텐츠 정책
---

# Content Policy

> **Status:** Draft — 추후 법률 검토 필요
> **Last Updated:** 2026-03-27

## 1. NSFW / 부적절한 콘텐츠

### 현재 방향

| 상황 | 리스크 | 대응 |
|---|---|---|
| 비회원 업로드 (서버 미저장) | 낮음 | MVP에서는 가벼운 수준 필터링 |
| 회원 프로젝트 저장 | 중간 | 기본 NSFW 스캔 |
| 마켓플레이스 등록 | 높음 | 업로드 시 자동 스캔 필수 + 신고 체계 |

### 추후 조사 필요

- [ ] NSFW 탐지 API 비교 (비용, 정확도, 통합 난이도)
- [ ] 한국법 기준 음란물/유해 콘텐츠 호스팅 책임 범위
- [ ] 비회원 임시 처리도 법적으로 "호스팅"에 해당하는가

---

## 2. 저작권 / IP

### 현재 방향

- 약관에 "업로드하는 이미지에 대한 권리를 보유하고 있음을 보증한다" 조항 포함
- Pointint는 업로드 이미지의 저작권을 확인할 의무가 아닌, 사용자에게 책임을 두는 구조
- 마켓플레이스에서는 판매 등록 시 권리 확인 동의 절차 추가

### 경쟁사 사례

- **Canva:** 사용자가 권리를 확보했음을 보증하는 약관
- **Custom Cursor:** 개인 사용만 허용, 상업적 사용/재배포 금지
- **Custom Cursors Planet:** "모든 콘텐츠는 팬아트" 면책 문구

### 팬아트 문제

커서 제작 특성상 캐릭터/로고 기반 팬아트가 많이 올라올 수 있다.

- MVP (개인 사용): 사용자 책임, 별도 제한 없음
- 마켓플레이스 (판매): 팬아트 판매 가이드라인 필요

### 추후 조사 필요

- [ ] 한국 저작권법 기준 UGC 플랫폼 면책 요건
- [ ] DMCA 테이크다운 프로세스 구축 시점과 요건
- [ ] 팬아트/2차 창작물의 상업적 판매에 대한 법적 리스크
- [ ] 해외 사용자 대응 시 미국/EU 저작권법 차이점

---

## 3. 결과물 소유권

### 현재 방향

| 제작 방식 | 소유권 | 비고 |
|---|---|---|
| 사용자 이미지 → 커서 | 사용자 소유 | 명확, 상업적 사용 가능 |
| AI 생성 커서 (Phase B) | 사용자 소유 (약관 기준) | 법적 저작권 보호는 불확실 |
| Pointint 공식 콘텐츠 | Pointint 소유 | 사용자는 라이선스로 사용 |

### 약관상 소유권 vs 법적 저작권

- 약관으로 "사용자 것"이라 해도 AI 생성물은 현행 저작권법상 보호가 어려울 수 있음
- 단, Pointint는 "AI 출발점 + 사용자 편집" 구조이므로 창작적 기여가 인정될 가능성 있음
- Phase B 도입 시점에 법률 전문가 검토 권장

### 플랫폼 라이선스

Canva 모델 참고:
- 사용자가 결과물 소유
- Pointint는 서비스 제공에 필요한 범위의 라이선스만 확보
- 공유된 결과물에 대해서는 표시/호스팅을 위한 라이선스 부여

### 추후 조사 필요

- [ ] AI 생성물의 저작권 보호 최신 동향 (미국 저작권청, 한국 저작권위원회)
- [ ] "AI 출발점 + 사용자 편집"의 법적 보호 가능 범위
- [ ] 마켓플레이스에서 AI 생성 커서 판매 시 법적 리스크
- [ ] 약관 초안 작성 시점 결정

---

## 4. 단계별 대응 로드맵

### MVP

- 약관: 기본 면책 조항 + 사용자 권리 보증 + 결과물 소유권 명시
- NSFW: 서버 미저장이므로 최소 대응
- 저작권: 사용자 책임, 별도 필터링 없음

### 로그인 + 저장 기능 추가 시

- NSFW 기본 스캔 도입
- 저장된 콘텐츠에 대한 약관 보강

### 마켓플레이스 오픈 시

- NSFW 자동 스캔 필수
- 판매 등록 시 권리 확인 동의 절차
- DMCA 테이크다운 프로세스 구축
- 팬아트 가이드라인 공개
- 신고/분쟁 처리 체계

### Phase B (AI 생성) 도입 시

- AI 생성물 소유권 약관 정비
- 법률 전문가 검토
- AI 생성 커서의 마켓플레이스 판매 정책

---

## 참고 자료

- [Canva Terms of Use](https://www.canva.com/policies/terms-of-use/)
- [Canva Intellectual Property Policy](https://www.canva.com/policies/intellectual-property-policy/)
- [US Copyright Office AI Policy Guidance](https://www.copyright.gov/ai/ai_policy_guidance.pdf)
- [customcursor.net Terms of Use](https://www.customcursor.net/terms-of-service/)
- [Custom Cursors Planet Terms](https://custom-cursors.com/terms)
- [UGC Moderation Guide - Utopia Analytics](https://www.utopiaanalytics.com/article/user-generated-content-moderation)
- [Ownership of UGC in Platform Terms - Aaron Hall](https://aaronhall.com/ownership-of-user-generated-content-in-platform-terms/)

## Related

- [[05-Operations/legal/Terms-of-Service]]

## See Also

- [[08-Business/Business-Index]]
- [[06-Implementation/ACTIVE_SPRINT]]

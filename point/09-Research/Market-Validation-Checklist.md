---
title: Market Validation Checklist
tags:
  - pointint
  - research
  - validation
  - market
aliases:
  - 시장 검증 체크리스트
---

# Market Validation Checklist

> **Status:** Active
> **Created:** 2026-03-27
> **Purpose:** MVP 구현 전, "이 시장이 존재하는가?"를 확인하기 위한 조사 항목

> [!note]
> 최신 조사 정리본: [[Market-Validation-Analysis]]

---

## 1. 검색 수요 확인

실제로 사람들이 커서 관련 키워드를 검색하는지 확인한다.

- [ ] **Google Trends** — 아래 키워드의 12개월 트렌드 확인
  - `custom cursor`, `custom mouse cursor`, `커서 꾸미기`
  - `cursor maker`, `make your own cursor`
  - `windows cursor download`, `커서 다운로드`
  - `anime cursor`, `cute cursor`, `aesthetic cursor`
- [ ] **Google Keyword Planner** (무료 계정으로 가능) — 위 키워드들의 월간 검색량
- [ ] **Ubersuggest / Ahrefs 무료** — 경쟁 강도와 관련 키워드 확인
- [ ] 검색량이 유의미한 키워드를 표로 정리 (월 1,000 이상이면 신호 있음)

---

## 2. 경쟁사 트래픽/규모 확인

기존 커서 사이트들이 실제로 얼마나 쓰이는지 확인한다.

- [ ] **SimilarWeb** (무료 버전) — 아래 사이트의 월간 방문자 수 확인
  - `custom-cursor.com`
  - `cursors-4u.com`
  - `cursor.cc`
  - `sweezy-cursors.com`
  - `vsthemes.org/cursors/`
- [ ] **Chrome Web Store** — Custom Cursor 확장 프로그램 유저 수, 리뷰 수 기록
- [ ] **DeviantArt** — "cursor" 태그 작품 수, 최근 업로드 빈도 확인
- [ ] 결과를 표로 정리: 사이트명 | 월간 방문자 | 주요 국가 | 트렌드(성장/정체/하락)

---

## 3. 커뮤니티/수요 신호 확인

사람들이 커서 커스터마이징에 대해 실제로 이야기하는지 확인한다.

- [ ] **Reddit** — 아래 서브레딧 구독자 수 + 최근 30일 활성도
  - r/cursors
  - r/desktops
  - r/Rainmeter (데스크톱 커스터마이징)
  - r/unixporn (리눅스지만 커스터마이징 문화 참고)
- [ ] **Reddit 검색** — "custom cursor", "cursor maker" 글의 upvote 분포, 댓글 톤
- [ ] **Twitter/X 검색** — "my cursor", "custom cursor", "커서 바꿈" 등의 게시물 빈도
- [ ] **YouTube** — "how to change cursor windows" 조회수 상위 5개 영상의 조회수 기록
- [ ] **디시인사이드/에펨코리아** — "커서 꾸미기", "마우스 커서" 검색 결과 확인 (한국 수요)

---

## 4. 유저 Pain Point 확인

기존 사용자들이 실제로 불편해하는 것이 Pointint가 풀려는 문제와 일치하는지 확인한다.

- [ ] **Custom Cursor 크롬 확장 리뷰** — ★1~3 리뷰에서 반복되는 불만 5개 뽑기
- [ ] **Cursors-4U 관련 커뮤니티 글** — "불편하다", "안 된다" 류의 피드백 수집
- [ ] **Reddit "cursor" 검색** — 질문/불만 유형 분류
  - 예: "브라우저에서만 됨", "OS 전체 적용 안 됨", "만들기 어려움", "품질 낮음"
- [ ] 수집한 불만을 Pointint가 해결하는 것 / 해결 못 하는 것으로 분류

---

## 5. 지불 의사 확인

무료 커서 생태계에서 유료 전환이 가능한지 간접적으로 확인한다.

- [ ] **Gumroad/Etsy** — "cursor pack", "mouse cursor" 검색 → 판매 중인 상품 수, 가격대, 리뷰 수
- [ ] **Creative Market** — 커서 팩 판매 여부, 가격 범위
- [ ] **Custom Cursor Pro** — 유료 버전이 있다면 기능 차이와 가격 기록
- [ ] **Steam** — 커서/데스크톱 커스터마이징 관련 앱 유무, 리뷰 수
- [ ] 유료 상품이 실제로 팔리고 있는지, 평균 가격대는 얼마인지 표로 정리

---

## 6. 인접 시장 크기 확인

커서만이 아니라 "데스크톱 커스터마이징" 전체의 크기를 파악한다.

- [ ] **Rainmeter** — 다운로드 수, 커뮤니티 규모
- [ ] **Wallpaper Engine (Steam)** — 유저 수, 리뷰 수, 매출 추정 (SteamSpy)
- [ ] **Lively Wallpaper** — GitHub 스타 수, 다운로드 수
- [ ] **Desktop Goose / Shimeji** — 데스크톱 펫 앱 다운로드 수, 관심도
- [ ] 인접 시장이 충분히 크다면, Pointint의 모니테리어 확장 가능성에 대한 근거가 된다

---

## 7. 빠른 수요 테스트 (선택)

위 조사 후, 시장이 존재한다고 판단되면 실행할 수 있는 저비용 테스트.

- [ ] **랜딩 페이지 테스트** — "Your Point, Your Tint." 랜딩 1장 + 이메일 수집
  - 도구: Carrd (무료) 또는 Next.js 한 페이지
  - 2주간 이메일 수집 수 = 관심도 지표
- [ ] **수동 서비스 테스트** — "이미지 보내주면 커서로 만들어드립니다" 게시
  - 채널: Reddit, 디시인사이드, X
  - 실제 요청 수 = 수요 검증
- [ ] **경쟁사 커뮤니티 관찰** — Custom Cursor Discord (있다면) 가입, 유저 대화 패턴 파악

---

## 판단 기준

| 신호 | 긍정 | 부정 |
|---|---|---|
| 검색량 | 주요 키워드 월 5,000+ | 대부분 월 500 미만 |
| 경쟁사 트래픽 | 상위 사이트 월 100만+ | 모든 사이트 월 10만 미만 |
| 커뮤니티 활성도 | 주 10개+ 관련 글 | 월 1~2개 |
| 유료 판매 | Gumroad/Etsy에 실제 리뷰 있는 상품 존재 | 유료 상품 거의 없음 |
| 인접 시장 | Wallpaper Engine 수천만 유저 | 데스크톱 커스터마이징 자체 정체 |

> **결과가 부정이면:** MVP 범위를 더 좁히거나, 커서 "제작"이 아닌 커서 "적용 편의성"으로 피벗 검토
> **결과가 긍정이면:** 현재 전략 유지하되, 가장 검색량 높은 키워드 중심으로 SEO 랜딩 설계

---

## Related

- [[Competitor-Analysis]]
- [[Research-Index]]

## See Also

- [[01-Core/Project-Vision]]
- [[08-Business/Monetization-Strategy]]

# SEO + GEO 체크리스트

> Phase 1 랜딩 페이지 제작 시 따르는 가이드

## SEO 기본

- [ ] **메타 태그** — title, description 설정. 핵심 키워드 포함
- [ ] **OG 이미지** — SNS 공유 시 표시될 대표 이미지
- [ ] **시맨틱 HTML** — h1~h3 구조, section/article/nav 등 의미 있는 마크업
- [ ] **Next.js SSR/SSG** — 랜딩은 서버 렌더링. 검색엔진 크롤러가 읽을 수 있어야 함
- [ ] **sitemap.xml** — 자동 생성 설정
- [ ] **robots.txt** — 크롤링 허용 범위 설정
- [ ] **핵심 키워드 자연 배치** — "custom cursor maker", "커서 만들기", "make your own cursor" 등
- [ ] **structured data (JSON-LD)** — SoftwareApplication 스키마 마크업

## GEO (Generative Engine Optimization)

- [ ] **첫 200단어에 핵심 답변** — "Pointint는 이미지를 Windows 커서로 만드는 제작 도구다"를 랜딩 상단에 명확히
- [ ] **구체적 수치 포함** — "17종 커서 지원", "3종 시뮬레이션", "Normal/Text/Link" 등 AI가 인용할 수 있는 구체적 숫자
- [ ] **FAQ 섹션** — "커서 만드는 법", "How to make custom cursor" 같은 질문에 직접 답변하는 구조
- [ ] **Last Updated 표시** — 페이지에 최신 업데이트 날짜 노출. AI가 최신성을 판단하는 시그널
- [ ] **structured data (FAQ 스키마)** — FAQ 섹션에 FAQPage 스키마 추가. AI와 검색엔진 둘 다 활용

## 다국어 대응

- [ ] **한/영 양쪽 메타 태그** — 각 언어별 title, description
- [ ] **hreflang 태그** — 검색엔진에 언어 버전 알림
- [ ] **한/영 양쪽 FAQ** — 각 언어 사용자의 검색 의도에 맞춰 질문/답변 구성
- [ ] **URL 구조** — `/en/`, `/ko/` 또는 서브도메인 방식 결정

## 측정

- [ ] **Google Search Console** 연결
- [ ] **GA4** 설정 + AI referral 트래픽 추적 (ChatGPT, Perplexity 등에서 유입)
- [ ] **핵심 키워드 순위 추적** — "custom cursor maker" 등

## 참고

- SEO = 검색 결과에서 클릭되는 것
- GEO = AI 답변에서 인용/추천되는 것
- 2026년 기준 Google 검색의 ~50%에 AI Overview 표시, 제로클릭 60%
- 니치 도구일수록 GEO가 중요 — AI가 직접 추천하면 최고의 유입

## 타이밍

- Phase 1 랜딩 제작 시 위 항목을 함께 적용
- 별도 개발이 아니라 랜딩 작성 시 따르는 가이드
- 콘텐츠 마케팅(블로그 등)은 MVP 검증 후 본격적으로

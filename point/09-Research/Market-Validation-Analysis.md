---
title: Market Validation Analysis
tags:
  - pointint
  - research
  - validation
  - market
  - data
aliases:
  - 시장 검증 분석
---

# Market Validation Analysis

> **Status:** Active
> **Date:** 2026-03-27
> **Purpose:** 공개 웹 리서치 기반으로 시장 존재 여부와 Pointint 기회를 분석한다
> **Checklist:** [[Market-Validation-Checklist]]

---

## 1. 경쟁사 트래픽 — 시장은 존재하는가?

### 조사 결과

| 사이트 | 유형 | 월간 방문/유저 | 출처 |
|---|---|---|---|
| **Custom Cursor** (크롬 확장) | 브라우저 확장 | **500만~700만 유저**, 리뷰 61,008개, 평점 4.67 | Chrome Web Store, chrome-stats |
| **cursors-4u.com** | 다운로드 사이트 | **월 73,310 방문** (Feb 2026, 전월 대비 -18%) | SimilarWeb |
| **rw-designer.com** | 라이브러리 + 편집기 | **월 ~595,000 방문**, 커서 218,000+개 보유 | SimilarWeb |
| **Wallpaper Engine** (인접 시장) | 데스크톱 배경 | **2,000만~5,000만 소유자**, 리뷰 949,522개 | SteamSpy |

### 판단

**시장은 확실히 존재한다.**

- Custom Cursor 크롬 확장 500만+ 유저 = 커서 커스터마이징에 대한 대중적 관심 검증됨
- rw-designer.com 월 60만 방문 = 커서 관련 검색 트래픽이 유의미함
- cursors-4u.com 월 7만 = 오래된 사이트도 여전히 유입 (다만 하락 추세)
- Wallpaper Engine 2,000만~5,000만 = **데스크톱 커스터마이징 전체 시장은 거대함**

---

## 2. 유료 판매 — 돈을 내는가?

### Etsy 커서 팩 조사

| 상품 | 가격 | 리뷰 수 | 평점 | 특징 |
|---|---|---|---|---|
| Kawaii Mouse Cursors Pack (12종) | ~$10~14 | **2,200+** | 5.0 | 픽셀 아트, 애니메이션 |
| Rainstorm Theme Cursor Pack (17종) | ~$10 | 다수 | 4.8+ | 전체 17종 + 왼손잡이 옵션 |
| Blue Pastel Mouse Cursors (17종) | ~$8 | 다수 | 4.8+ | 에스테틱 테마 |
| Pokemon Eevee Cursor Pack (20종) | ~$10 | 다수 | 높음 | IP/캐릭터 테마 |

### Etsy 유저 리뷰에서 발견한 것

> "I love this cursor set so much! **I never find cute cursor sets** so this is such a plus!"

> "I'm so obsessed with this cursor pack!! **The seller was very nice, and the cursor came with easy instructions to install!!**"

### 판단

**사람들은 커서에 돈을 낸다. $10~14씩.**

- Etsy에서 커서 팩이 **활발히 판매** 중
- 리뷰 2,200+개 = 실제 구매자가 수천 명 이상
- "cute cursor sets을 찾기 어렵다" = **공급 부족**
- "easy instructions to install" = **적용 편의성이 구매 만족도에 직결**
- 17종 full set이 프리미엄 상품으로 자리 잡음 = **17종 자동 변형 기능의 가치 검증**

---

## 3. 커뮤니티 활성도 — 이야기하는 사람이 있는가?

| 커뮤니티 | 규모 | 상태 |
|---|---|---|
| r/Rainmeter | 169,871 구독자 | 활성 (Help Only로 전환, 쇼케이스는 Discord 이동) |
| r/desktops | ~10만+ | 활성 |
| r/unixporn | 100만+ | 매우 활성 (리눅스, 커스터마이징 문화 참고) |
| DeviantArt (커서 태그) | 수천 작품 | 활성 |
| Shimeji/Desktop Pet | Steam + itch.io + DeviantArt | 분산, 존재함 |

**데스크톱 커스터마이징 전체:** r/Rainmeter + r/desktops + r/unixporn = **130만+ 구독자**

---

## 4. Pain Point 교차 검증

vault의 [[Competitor-Analysis]]에서 예상한 pain point vs 실제 데이터:

| 예상 Pain Point | 실제 확인? | 근거 |
|---|---|---|
| 브라우저 전용, OS 전체 미적용 | ✅ | Custom Cursor 리뷰: "does not work outside the app" |
| 다운로드 후 확인 어려움 | ✅ | Etsy 리뷰: "easy instructions"이 만족 핵심 |
| 적용법 복잡 | ✅ | Competitor-Analysis.md에 기록, Etsy 리뷰로 재확인 |
| 디자인 노후화 | ✅ | cursors-4u.com 트래픽 -18% 하락 |
| cute cursor를 찾기 어렵다 | ✅ | Etsy 유저 직접 언급 |
| 17종 전체를 수동으로 바꿔야 | ✅ | Etsy에서 17종 full set이 프리미엄 가격 |

**6/6 확인됨.**

---

## 5. 인접 시장 크기

| 서비스 | 규모 | Pointint과의 관계 |
|---|---|---|
| Wallpaper Engine | 2,000만~5,000만 소유자 | "배경화면 다음 = 커서" 확장 경로 |
| Rainmeter | 17만+ Reddit | 데스크톱 셋업에 커서 포함 |
| Shimeji/Desktop Pet | Steam + itch.io 분산 | 모니테리어 확장 방향 일치 |

Wallpaper Engine 유저의 1%만 커서에 관심 가져도 **20만~50만.**

---

## 6. 종합 판단

### 시장 판정: ✅ 존재한다

| 신호 | 기준 | 결과 | 판정 |
|---|---|---|---|
| 경쟁사 트래픽 | 상위 사이트 월 100만+ | rw-designer 60만, Custom Cursor 500만+ | ✅ |
| 유료 판매 | 리뷰 있는 유료 상품 존재 | Etsy 2,200+ 리뷰, $10~14 | ✅ **강하게 긍정** |
| 커뮤니티 | 주 10개+ 관련 글 | 데스크톱 커스터마이징 130만+ | ✅ |
| 인접 시장 | Wallpaper Engine 수천만 | 2,000만~5,000만 | ✅ **매우 긍정** |

### 핵심 리스크

| 리스크 | 설명 |
|---|---|
| **"만들기" vs "사기"** | Etsy 유저는 완성품을 구매함. "직접 만들겠다"는 다른 수요. Pointint이 풀어야 할 건 "만드는 경험의 가치" |
| **"충분히 좋은" 대안** | Custom Cursor 500만 유저가 브라우저 확장으로 만족 → OS 커서까지 바꿀 동기가 있는가? |
| **다운로드 사이트 하락** | cursors-4u.com -18% → 기존 시장은 줄고 있을 수 있음 (제작/개인화로 이동?) |

### Pointint이 이겨야 할 질문

> **"왜 사는 대신 직접 만들어야 하는가?"**
>
> 답: "내 이미지, 내 캐릭터, 내 취향 — 남이 만든 건 아무리 예뻐도 '나의 것'이 아니다."
>
> 이 답이 충분한 동기인지는 **Phase 1 제작 완료율로 검증된다.**

---

## 7. 전략 시사점

| 발견 | Pointint 시사점 | 관련 문서 |
|---|---|---|
| Etsy 17종 full set = 프리미엄 | 17종 자동 변형은 핵심 가치, Phase 2 우선 | [[Tier-Pricing]] |
| 적용 편의성 = 구매 만족 핵심 | .inf 원클릭 적용 차별점 확인됨 | [[Differentiation]] |
| cute cursor 공급 부족 | Pointint이 채울 빈틈 존재 | [[Acquisition-Strategy]] |
| Custom Cursor 500만+ | 수요 검증, "OS 전체 적용"으로 차별화 필수 | [[Differentiation]] |
| Wallpaper Engine 2,000만~5,000만 | 모니테리어 확장의 TAM 근거 | [[Monetization-Strategy]] |
| cursors-4u.com 하락 | 다운로드→제작/개인화 시장 이동 가능성 | [[Competitor-Analysis]] |
| Etsy 판매자 = 잠재적 Pointint 크리에이터 | 마켓 부트스트랩 시 Etsy 셀러 초대 | [[Acquisition-Strategy]] |

---

## 8. 미확인 항목

- [ ] Google Trends 직접 확인 — "custom cursor", "cursor maker" 트렌드
- [ ] Google Keyword Planner — 월간 검색량 수치
- [ ] Custom Cursor 크롬 리뷰 ★1~3 상세 분석 — 반복 불만 패턴 추출
- [ ] Etsy 커서 판매자 월 매출 추정 (리뷰 수 × 전환율)

---

## Sources

- [Custom Cursor Chrome Web Store](https://chromewebstore.google.com/detail/custom-cursor-for-chrome/ogdlpmhglpejoiomcodnpjnfgcpmgale)
- [cursors-4u.com SimilarWeb](https://www.similarweb.com/website/cursors-4u.com/)
- [rw-designer.com Cursor Library](https://www.rw-designer.com/cursor-library)
- [Wallpaper Engine SteamSpy](https://steamspy.com/app/431960)
- [Etsy Cursor Packs](https://www.etsy.com/market/cursor_pack)
- [r/Rainmeter](https://subbed.org/r/Rainmeter)

## Related

- [[Market-Validation-Checklist]]
- [[Competitor-Analysis]]

## See Also

- [[07-Brand/Differentiation]]
- [[08-Business/Acquisition-Strategy]]
- [[01-Core/Target-Audience]]

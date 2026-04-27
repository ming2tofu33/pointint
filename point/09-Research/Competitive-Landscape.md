---
title: Competitive Landscape
tags:
  - pointint
  - research
  - competitor
  - landscape
  - strategy
aliases:
  - 경쟁 시장 조사
  - 경쟁 구도 분석
  - Competitive Landscape
status: active
updated: 2026-04-27
---

# Competitive Landscape

> [!info]
> **Status:** Active<br>
> **Last Updated:** 2026-04-27<br>
> **Purpose:** Pointint가 실제로 맞서게 될 경쟁 구도를 직접 경쟁, 콘텐츠/마켓 경쟁, 인접 취향 플랫폼까지 포함해 재정리한다.

## Research Scope

이번 재조사는 2026-04-27 기준 공개 웹 자료를 기준으로 했다. 숫자는 사이트/스토어에 노출된 값이므로 계속 바뀔 수 있다.

- Chrome Web Store, Steam, GitHub, Etsy, 공식 제품 페이지를 우선했다.
- VSThemes는 현재 환경에서 직접 페이지 fetch가 403으로 막혀, 핵심 근거가 아니라 보조 watchlist로만 둔다.
- 기존 `docs/경쟁 사이트.md`는 원자료로 남기되, 현재 기준 문서는 이 문서와 [[Competitor-Analysis]]다.

## Executive Summary

Pointint는 "커서 사이트 하나"와 경쟁하는 제품이 아니다. 실제 경쟁은 네 레이어에서 동시에 발생한다.

| 레이어 | 설명 | 대표 플레이어 |
|---|---|---|
| 직접 제작/적용 경쟁 | 커서를 만들거나 적용하거나 브라우저/Windows에서 쓰게 해준다 | Custom Cursor, Sweezy, ImageToCursor, Cursor.cc, RealWorld Cursor Editor, CursorFX |
| 콘텐츠 라이브러리 경쟁 | 완성된 커서팩을 검색하고 다운로드한다 | Cursors-4U, DeviantArt, VSThemes |
| 유료 대체재/마켓 | 사용자가 직접 만들지 않고 완성품을 산다 | Etsy cursor packs, Etsy desktop theme sellers |
| 인접 취향 플랫폼 | 커서가 아니지만 데스크톱 꾸미기 시간을 장악한다 | Wallpaper Engine, Rainmeter, Lively, Desktop Mate |

핵심 판단은 세 가지다.

1. **Custom Cursor와 Sweezy는 이미 커서 취향 시장의 대중적 front door다.** 특히 Custom Cursor는 브라우저 확장, Windows 앱, Creator, 커뮤니티를 모두 갖고 있어 Pointint의 가장 직접적인 비교 대상이다.
2. **ImageToCursor 같은 단순 변환기는 작지만 위험하다.** 제품 깊이는 얕지만 "image to cursor", "png to cur" 검색 의도를 바로 먹는다.
3. **Pointint의 기회는 콘텐츠 수량이 아니라 end-to-end 제작 신뢰다.** 이미지에서 시작해 Windows role set, preview, hotspot, package, restore까지 닫는 제품은 아직 약하다.

## 1. Direct Competitors

### 1.1 Custom Cursor

Custom Cursor는 현재 가장 가까운 직접 경쟁자다.

Current signals:

- [Custom Cursor for Chrome](https://chromewebstore.google.com/detail/custom-cursor-for-chrome/ogdlpmhglpejoiomcodnpjnfgcpmgale): 600만 사용자, 61.6K ratings, 4.7점, 2026-02-19 업데이트.
- [Custom Cursor for Windows](https://custom-cursor.com/en/products/custom-cursor-for-windows): 800만+ 사용자 신뢰 문구, Windows desktop 적용 앱, pack 선택 후 Apply 흐름.
- [Custom Cursor Community](https://community.custom-cursor.com/): General Discussion 25,002, Cursor Ideas 6,458, Cursor Collections 202 등 커뮤니티 토픽 규모.
- [Creator guide](https://custom-cursor.com/es/how-to-use/windows/how-to-use-custom-cursor-win-creator-tool): own images, background removal, active point, My Custom Cursor collection 흐름 제공.
- [Windows app upload guide](https://custom-cursor.com/en/how-to-use/windows/how-to-add-your-own-cursors-to-custom-cursor-for-windows-app): third-party `.cur` 파일 업로드, pack 저장, Apply 가능.

Strength:

- 확장 프로그램 유입, Windows 앱, 웹사이트 pack library, creator, community가 연결돼 있다.
- 사용자 숫자와 콘텐츠 수량에서 가장 앞선다.
- "커서를 바꾸는 재미"와 팬덤형 cursor pack을 잘 포장한다.

Gap:

- 제작 흐름이 웹 하나에서 완결되기보다는 Chrome extension, Windows app, 웹 creator로 분산돼 있다.
- Windows cursor set 품질 검증, role별 simulation, install/restore package까지 이어지는 제작 신뢰가 약하다.
- Creator는 강력하지만 Pointint식 source-to-package workflow보다 collection/extension 보조 도구에 가깝다.

Pointint implication:

- Custom Cursor보다 콘텐츠 수량으로 이기려 하면 안 된다.
- Pointint는 "커서 pack을 고르는 곳"이 아니라 "내 이미지를 실제 Windows cursor set으로 완성하는 곳"이어야 한다.

### 1.2 Sweezy Cursors

Sweezy는 감성 커서 브라우저 확장으로 강한 비교군이다.

Current signals:

- [Chrome Web Store](https://chromewebstore.google.com/detail/sweezy-cursors-%E2%98%85-custom-c/gdcfjidbchfpojnfifkgghbamkdmbdaf): 50만 사용자, 2.6K ratings, 4.8점, 2026-02-22 업데이트.
- [How-to guide](https://sweezy-cursors.com/how-to-use/): Chrome Web Store / Edge Add-ons 설치, 브라우저 내부 페이지 제약, Windows용 CUR/ANI 다운로드와 적용 가이드를 설명.
- 같은 guide는 기본 pack이 Normal Select와 Link Select 중심이며, 다른 Windows roles는 사용자가 수동으로 지정해야 한다고 안내한다.

Strength:

- 귀엽고 animated cursor 톤이 명확하다.
- 브라우저 설치 장벽이 낮다.
- Windows-ready CUR/ANI 다운로드를 제공해 브라우저 밖으로 일부 확장했다.

Gap:

- 출발점과 UX 중심이 여전히 브라우저 확장이다.
- Windows 전체 role set은 기본 제품 경험이 아니라 수동 가이드에 가깝다.
- 제작보다 선택/다운로드/적용의 성격이 강하다.

Pointint implication:

- Sweezy는 Pointint의 감성 tone benchmark다.
- Pointint는 Sweezy보다 무겁게 느껴지면 안 되지만, 더 "진짜 Windows에서 쓰는" 제작 신뢰를 줘야 한다.

### 1.3 ImageToCursor

ImageToCursor는 이번 재조사에서 새로 직접 경쟁 레이어에 넣어야 하는 웹 변환기다.

Current signals:

- [ImageToCursor](https://imagetocursor.com/)는 이미지 업로드, hotspot 선택, `.cur` 다운로드, CSS-ready image를 제공한다고 설명한다.
- [Desktop creator](https://imagetocursor.com/desktop)는 16/32/48/64 size 선택, hotspot preview, live preview, Windows 적용 가이드를 제공한다.
- 설치 없이 브라우저에서 동작하고, 다운로드 기능까지 무료라고 설명한다.

Strength:

- "이미지를 커서로 바꾸고 싶다"는 검색 의도에 매우 직접적이다.
- 단일 목적이 선명하고 즉시 결과물을 준다.
- Pointint의 초기 진입 문구와 겹칠 수 있다.

Gap:

- 단일 `.cur` 변환에 가깝다.
- AI 배경 제거, role set, animated cursor, hotspot recommendation, Windows role simulation, ZIP/INF packaging이 없다.
- 브랜드/커뮤니티/마켓 구조가 약하다.

Pointint implication:

- Pointint는 "image to cursor" SEO를 방치하면 안 된다.
- 단, 제품 메시지는 단순 변환기가 아니라 "Windows cursor set maker"여야 한다.

### 1.4 Cursor.cc

Cursor.cc는 오래된 웹 기반 cursor maker 기준점이다.

Current signals:

- [Cursor.cc](https://www.cursor.cc/)는 색을 고르고, grid에 직접 그리고, hotspot을 선택하고, cursor를 다운로드하는 흐름을 제공한다.
- 공개 라이선스로 publish하는 옵션도 있다.

Strength:

- 웹에서 직접 만든다는 개념을 오래전부터 보여줬다.
- 도구가 가볍고 이해하기 쉽다.

Gap:

- 픽셀 제작 중심이라 일반 사용자에게 진입 장벽이 높다.
- 현대적 이미지 업로드, AI cleanup, multi-size, ANI, role set, install package가 없다.

Pointint implication:

- Cursor.cc는 직접 위협보다 대비 사례다.
- Pointint는 "웹에서 만들 수 있다"를 넘어 "웹에서 제대로 완성할 수 있다"를 보여줘야 한다.

### 1.5 RealWorld Cursor Editor

RealWorld Cursor Editor는 파워 유저와 제작자를 위한 품질 기준점이다.

Current signals:

- [RealWorld Cursor Editor](https://www.rw-designer.com/cursor-maker)는 PNG/JPG/BMP/GIF에서 cursor를 만들고, animation editor와 multi-resolution cursor 편집을 제공한다.
- Windows 7 multi-resolution animated cursor 편집, frame duration 조정 등 깊은 기능을 제공한다.

Strength:

- CUR/ANI 제작 기능이 깊다.
- 다중 해상도와 animated cursor 편집에서 참고할 점이 많다.

Gap:

- 설치형 파워툴이다.
- 일반 사용자의 빠른 이미지 기반 창작 흐름과 거리가 있다.

Pointint implication:

- Pointint가 당장 기능 깊이로 이겨야 하는 상대는 아니다.
- export 품질, multi-resolution, animated cursor 안정성의 장기 기준으로 봐야 한다.

### 1.6 CursorFX and Axialis CursorWorkshop

이 둘은 consumer/professional 설치형 커서 도구 레이어다.

Current signals:

- [Stardock CursorFX](https://www.stardock.com/products/cursorfx/)는 Windows cursor customization, animated effects, click sounds, WinCustomize cursor downloads, PNG import를 제공한다.
- [Axialis CursorWorkshop](https://www.axialis.com/cursorworkshop/)는 professional CUR/ANI authoring, alpha channel, Photoshop/Illustrator plug-ins, GIF-to-ANI, batch operations를 제공한다.

Strength:

- Windows 전체 커서 customization과 전문 제작 기능이 강하다.
- 표준 CUR/ANI와 animated cursor에 대한 깊은 히스토리를 가진다.

Gap:

- 둘 다 설치형 툴이다.
- Pointint가 노리는 "웹에서 바로 만들고 검증하고 받는" 흐름과 다르다.

Pointint implication:

- 제작 깊이의 upper bound로 참고하되, 포지셔닝은 "쉽고 웹 기반"이어야 한다.

## 2. Content Libraries

### 2.1 Cursors-4U

Current signals:

- [Cursors-4U](https://www.cursors-4u.com/)는 2004년부터 운영됐고 "millions of downloads"를 강조한다.
- Top creators 페이지와 home에는 수천만 view 규모의 creator/archive 신호가 보인다.
- Cursor Sets & Packs, Anime, Cute, Games 등 category browsing이 강하다.

Strength:

- 긴 역사와 SEO 자산.
- 방대한 cursor archive.
- nostalgia와 fandom cursor 수요를 오래 흡수했다.

Gap:

- 제작 흐름이 아니라 다운로드 archive다.
- Pointint식 preview, role validation, install/restore confidence가 없다.

Pointint implication:

- Pointint가 content library를 만들더라도 처음부터 Cursors-4U식 archive로 경쟁하면 불리하다.
- 핵심은 "많이 찾기"보다 "내 것을 제대로 만들기"다.

### 2.2 DeviantArt and VSThemes

Current signals:

- [DeviantArt cursor tag](https://www.deviantart.com/tag/cursor)는 Windows, anime, game IP 감성의 cursor 작품과 shop surface를 보여준다.
- DeviantArt의 cursor 사용 가이드는 파일을 다운로드하고 Windows cursor folder에 넣고 Pointers tab에서 role별로 지정하는 오래된 수동 흐름을 보여준다.
- VSThemes는 이번 환경에서 직접 crawl이 막혔지만, search result와 커뮤니티 링크에서는 Windows theme/cursor download archive로 계속 언급된다.

Strength:

- 개별 창작자와 팬덤형 콘텐츠가 강하다.
- 고퀄리티 cursor pack이 존재한다.

Gap:

- 검색, 설치법, 안전성, 파일 품질이 분산돼 있다.
- 사용자가 직접 역할별 파일을 이해하고 적용해야 한다.

Pointint implication:

- Pointint는 아티스트/크리에이터가 만든 소스를 Windows-ready set으로 쉽게 포장해주는 방향으로 확장 가능하다.

## 3. Marketplace Substitutes

### 3.1 Etsy Cursor Packs

Current signals:

- [Etsy cursor packs](https://www.etsy.com/market/cursor_packs)와 [mouse cursor packs](https://www.etsy.com/market/mouse_cursor_packs)는 Gengar, Stardew Valley, goth bunny 등 팬덤/감성 cursor pack을 디지털 다운로드로 판매한다.
- 검색 결과 기준 17x Stardew Valley Cursors는 약 594 reviews, Animated Bunny Cursors는 104 reviews 등 유료 구매 신호가 있다.

Strength:

- 사용자가 cursor pack에 돈을 쓴다는 증거다.
- 팬덤형/감성형 pack이 잘 팔린다.
- 완성품 구매는 제작보다 쉽다.

Gap:

- 개인 맞춤 제작이 아니다.
- 설치와 적용은 여전히 수동이거나 안내서 의존이다.
- 파일 구조와 품질이 seller마다 다르다.

Pointint implication:

- Pointint의 유료화 가능성을 뒷받침한다.
- 나중에 creator marketplace를 열 경우 Etsy seller ecosystem과 경쟁하거나 흡수할 수 있다.

### 3.2 Etsy Desktop Theme Sellers

Current signals:

- [Botanical Desktop Organizer Theme](https://www.etsy.com/listing/1517811101/botanical-desktop-organizer-theme-ui)는 icons, wallpapers, 3 custom cursors, PDF guide를 묶은 디지털 다운로드 상품이다.
- 같은 listing은 28 reviews, 5.0 item quality, 8.6K shop sales 등 작은 유료 수요 신호를 보여준다.

Strength:

- 사용자는 cursor 하나보다 "desktop mood set"을 산다.
- wallpaper, icons, cursors, guide를 묶는 패키징이 이미 받아들여지고 있다.

Gap:

- 적용은 사용자가 직접 해야 한다.
- 상품은 정적 파일 bundle이고 동적 제작/개인화 도구가 아니다.

Pointint implication:

- "cursor only"에서 "theme pack"으로 넓히는 장기 방향은 시장에 이미 존재한다.
- Pointint가 강해질 수 있는 지점은 theme pack을 직접 만들고, preview하고, 적용까지 돕는 workflow다.

## 4. Adjacent Taste Platforms

### 4.1 Wallpaper Engine

Current signals:

- [Wallpaper Engine on Steam](https://store.steampowered.com/app/431960/Wallpaper_Engine/)은 Windows live wallpaper 제작/공유 플랫폼이다.
- Steam page 기준 all language reviews 976,782, Steam purchasers 906,643, over a million free wallpapers from Steam Workshop을 보여준다.
- animated wallpaper editor, Workshop sharing, Android companion app, performance pause rules를 제공한다.

Why it matters:

- "데스크톱을 꾸미는 데 돈과 시간을 쓴다"는 행동이 대규모로 검증됐다.
- UGC, editor, community distribution이 desktop customization에서 작동한다.

Pointint implication:

- 장기적으로 Pointint가 가야 할 benchmark는 단순 cursor archive가 아니라 Wallpaper Engine식 creator/distribution loop다.

### 4.2 Rainmeter and Lively

Current signals:

- [Rainmeter](https://www.rainmeter.net/)는 Windows desktop에 customizable skins를 표시하는 toolkit/community로 소개된다.
- [Rainmeter customizing guide](https://docs.rainmeter.net/manual/getting-started/customizing/)는 중앙 공식 repository가 없고 skin이 인터넷 곳곳에 흩어져 있다고 설명한다.
- [Lively](https://github.com/rocksdanister/lively)는 GitHub 기준 18.7K stars, 1.3K forks이며 WinUI 3 기반 무료 오픈소스 live wallpaper/screensaver 앱이다.

Why they matter:

- 깊은 개인화 수요는 오래 유지된다.
- 동시에 초보자에게는 설치, 설정, 코드, 외부 skin 탐색이 부담이다.

Pointint implication:

- Pointint는 Rainmeter처럼 깊게 시작하면 안 된다.
- Lively처럼 polished Windows desktop tool의 느낌은 참고하되, 첫 경험은 web-first로 더 쉬워야 한다.

### 4.3 Desktop Mate

Current signals:

- [Desktop Mate on Steam](https://store.steampowered.com/app/3301060/Desktop_Mate/)는 공식 라이선스 캐릭터가 desktop 위에서 움직이고 mouse와 상호작용하는 mascot platform이다.
- Steam page 기준 English reviews 4,990, total reviews 8,699, Browse all 32 DLC가 노출된다.
- 제품 설명은 free core software와 paid character DLC 구조를 명확히 설명한다.

Why it matters:

- 데스크톱 위의 작은 디지털 오브젝트가 유료 DLC 구조를 만들 수 있음을 보여준다.
- 캐릭터/IP와 desktop personalization은 강하게 연결된다.

Pointint implication:

- Pointint의 장기 "desktop object" 또는 "monitor interior" 방향에서 공식 pack, creator pack, paid character/theme pack 가능성을 검토할 수 있다.

## 5. Strategic Positioning

Pointint가 가져야 할 가장 현실적인 포지션은 아래다.

`내 이미지를 실제로 쓰는 Windows cursor set으로 바꾸는 가장 쉬운 웹 제작기`

이 문장은 세 경쟁 레이어를 동시에 피한다.

- Custom Cursor/Sweezy처럼 **고르는 재미**만 말하지 않는다.
- ImageToCursor/Cursor.cc처럼 **단일 파일 변환**에 머물지 않는다.
- RealWorld/Axialis처럼 **전문 제작툴**이 되지 않는다.

Pointint의 제품 약속은 더 구체적이어야 한다.

1. 이미지를 올리면 커서에 맞게 정리된다.
2. hotspot과 Windows role이 이해하기 쉬워진다.
3. 적용 전 preview로 실패 가능성을 줄인다.
4. ZIP + INF + restore INF로 Windows 적용이 덜 무섭다.
5. 완성된 set은 나중에 theme pack으로 확장할 수 있다.

## 6. Product and Content Implications

### Landing/SEO

- "image to cursor", "png to cur", "gif to ani cursor", "Windows cursor set maker" 검색 의도를 직접 겨냥해야 한다.
- 단, headline은 변환기처럼 좁히기보다 "Make a Windows cursor set from your image" 쪽이 낫다.
- 경쟁 비교 페이지는 Custom Cursor, Sweezy, ImageToCursor, Cursor.cc를 각각 다른 축으로 다뤄야 한다.

### Product

- 단일 normal cursor만 만들면 ImageToCursor와 비교된다.
- 15-role 또는 최소 주요 role set, hotspot preview, role simulation이 Pointint의 방어선이다.
- `.ani`는 "GIF to animated cursor" 검색 의도와 Sweezy의 animated cursor 감성을 동시에 받을 수 있다.
- restore INF와 safe install guide는 Etsy/DeviantArt의 수동 설치 불안을 줄이는 차별점이다.

### Monetization

- Etsy와 Desktop Mate가 보여주는 것은 "디지털 데스크톱 오브젝트에 돈을 쓴다"는 신호다.
- 초기 유료화는 AI credit/Tint보다 "premium pack export", "creator pack", "theme bundle"의 언어로 설명하면 더 자연스럽다.
- 장기적으로 marketplace를 열 경우 creator quality control과 install safety가 핵심 운영 차별점이 된다.

## 7. Final Verdict

Pointint는 경쟁이 없는 시장에 들어가는 것이 아니다. 오히려 경쟁과 대체재는 많다.

하지만 시장은 아직 분절돼 있다.

- Custom Cursor와 Sweezy는 감성과 유입이 강하지만 extension/app 중심이다.
- ImageToCursor와 Cursor.cc는 웹 제작이 쉽지만 깊이가 얕다.
- RealWorld, CursorFX, Axialis는 강하지만 설치형/전문가형이다.
- Cursors-4U, DeviantArt, Etsy는 콘텐츠와 수요를 보여주지만 제작/적용 경험이 흩어져 있다.
- Wallpaper Engine, Rainmeter, Lively, Desktop Mate는 커서 너머의 데스크톱 취향 시장을 증명한다.

따라서 Pointint의 기회는 이것이다.

**커서 콘텐츠가 부족해서가 아니라, 사용자의 이미지를 Windows에서 실제로 쓸 수 있는 cursor set으로 안전하게 완성해주는 쉬운 제작 흐름이 부족해서 Pointint가 필요하다.**

## Sources

- [[Competitor-Analysis]]
- [Custom Cursor for Chrome](https://chromewebstore.google.com/detail/custom-cursor-for-chrome/ogdlpmhglpejoiomcodnpjnfgcpmgale)
- [Custom Cursor for Windows](https://custom-cursor.com/en/products/custom-cursor-for-windows)
- [Custom Cursor Community](https://community.custom-cursor.com/)
- [Custom Cursor add own cursors guide](https://custom-cursor.com/en/how-to-use/windows/how-to-add-your-own-cursors-to-custom-cursor-for-windows-app)
- [Custom Cursor Creator guide](https://custom-cursor.com/es/how-to-use/windows/how-to-use-custom-cursor-win-creator-tool)
- [Sweezy Cursors on Chrome Web Store](https://chromewebstore.google.com/detail/sweezy-cursors-%E2%98%85-custom-c/gdcfjidbchfpojnfifkgghbamkdmbdaf)
- [Sweezy how-to guide](https://sweezy-cursors.com/how-to-use/)
- [ImageToCursor](https://imagetocursor.com/)
- [ImageToCursor desktop creator](https://imagetocursor.com/desktop)
- [Cursor.cc](https://www.cursor.cc/)
- [RealWorld Cursor Editor](https://www.rw-designer.com/cursor-maker)
- [Stardock CursorFX](https://www.stardock.com/products/cursorfx/)
- [Axialis CursorWorkshop](https://www.axialis.com/cursorworkshop/)
- [Cursors-4U](https://www.cursors-4u.com/)
- [DeviantArt cursor tag](https://www.deviantart.com/tag/cursor)
- [DeviantArt custom cursor use guide](https://www.deviantart.com/theduckofpower/journal/How-To-Use-Custom-Cursors-313942331)
- [Etsy cursor packs](https://www.etsy.com/market/cursor_packs)
- [Etsy mouse cursor packs](https://www.etsy.com/market/mouse_cursor_packs)
- [Etsy Botanical Desktop Organizer Theme](https://www.etsy.com/listing/1517811101/botanical-desktop-organizer-theme-ui)
- [Wallpaper Engine on Steam](https://store.steampowered.com/app/431960/Wallpaper_Engine/)
- [Rainmeter](https://www.rainmeter.net/)
- [Rainmeter customizing guide](https://docs.rainmeter.net/manual/getting-started/customizing/)
- [Lively GitHub](https://github.com/rocksdanister/lively)
- [Desktop Mate on Steam](https://store.steampowered.com/app/3301060/Desktop_Mate/)
- [Microsoft Learn: About Cursors](https://learn.microsoft.com/en-us/windows/win32/menurc/about-cursors)

## Related

- [[Research-Index]]
- [[Competitor-Analysis]]
- [[Market-Analysis]]

## See Also

- [[08-Business/Monetization-Strategy]]
- [[07-Brand/Differentiation]]

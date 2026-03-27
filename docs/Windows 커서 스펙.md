# Windows 커서 스펙

## 1. .cur 파일 포맷

### 구조

`.cur` 파일은 `.ico`(아이콘)와 거의 동일한 구조다. 차이점은 Hotspot 좌표가 헤더에 포함된다는 것.

| 영역 | 크기 | 설명 |
|---|---|---|
| 파일 헤더 | 6 bytes | 파일 타입(2), 이미지 수 |
| 디렉토리 엔트리 | 16 bytes × N | 각 이미지의 크기, 색상, Hotspot 좌표 |
| 이미지 데이터 | 가변 | BMP 또는 PNG 형식 |

### 크기

- 전통적 표준: 32×32px
- 지원 범위: 16×16 ~ 256×256px
- Windows 기본 커서는 32×32 기준으로 동작
- 고해상도(HiDPI) 대응 시 48×48, 64×64, 128×128도 사용 가능
- 하나의 .cur 파일에 여러 크기를 포함할 수 있음 (멀티사이즈)

### 색상

- 32-bit RGBA (알파 투명도 지원)
- 레거시: 1-bit, 4-bit, 8-bit 팔레트도 가능하나 현대 사용에서는 32-bit 권장

### Hotspot

- 이미지 좌상단(0,0) 기준의 x, y 픽셀 좌표
- 클릭이 실제로 인식되는 지점
- 커서 사용성의 핵심 — 잘못 지정하면 클릭 위치가 어긋남

### .ani (애니메이션 커서)

- 여러 프레임의 .cur을 묶은 애니메이션 포맷
- 프레임 속도(jiffies, 1/60초 단위) 지정 가능
- MVP에서는 제외, 이후 확장 대상

---

## 2. Windows 커서 역할 (17종)

Windows는 시스템 커서를 상황별로 17종으로 구분한다.

| # | 역할 | 레지스트리 키 | 설명 |
|---|---|---|---|
| 1 | Normal Select | Arrow | 기본 화살표 |
| 2 | Help Select | Help | 도움말 선택 |
| 3 | Working in Background | AppStarting | 백그라운드 작업 중 |
| 4 | Busy | Wait | 대기/로딩 |
| 5 | Precision Select | Crosshair | 정밀 선택 (십자) |
| 6 | Text Select | IBeam | 텍스트 위 커서 |
| 7 | Handwriting | NWPen | 필기 |
| 8 | Unavailable | No | 사용 불가 |
| 9 | Vertical Resize | SizeNS | 세로 크기 조절 |
| 10 | Horizontal Resize | SizeWE | 가로 크기 조절 |
| 11 | Diagonal Resize 1 | SizeNWSE | 대각선 ↘↖ |
| 12 | Diagonal Resize 2 | SizeNESW | 대각선 ↗↙ |
| 13 | Move | SizeAll | 이동 |
| 14 | Alternate Select | UpArrow | 대체 선택 |
| 15 | Link Select | Hand | 링크 선택 |
| 16 | Location Select | Pin | 위치 선택 (Win10+) |
| 17 | Person Select | Person | 사람 선택 (Win10+) |

### MVP 범위

- **3종:** Normal Select, Text Select, Link Select
- 이 3종은 일상 사용에서 가장 자주 보이는 커서 상태다

### 이후 확장

- 17종 전체 세트 지원
- 멀티사이즈 팩 (32, 48, 64, 128)

---

## 3. 적용 방식

### 수동 적용 (MVP 기본)

1. Windows 설정 > 블루투스 및 장치 > 마우스 > 추가 마우스 설정
2. 포인터 탭에서 역할별로 .cur 파일 지정
3. 저장

### .inf 자동 설치 (이후 확장)

- 커서 스킴을 레지스트리에 등록하는 설치 스크립트
- 우클릭 > 설치로 17종 일괄 적용
- 레지스트리 경로: `HKEY_CURRENT_USER\Control Panel\Cursors`

### 원복

- Windows 설정에서 "기본값 사용" 선택으로 원복
- 적용 가이드에 원복 방법을 함께 안내하여 심리적 부담을 낮춤

---

## 4. Pointint 설계에 영향을 주는 제약

| 제약 | 설계 영향 |
|---|---|
| 32×32가 기본 | 편집기에서 이 크기를 기준으로 보여줘야 함 |
| Hotspot은 픽셀 단위 | 드래그 UI가 정밀해야 함 |
| 알파 투명도 필수 | 배경 제거 품질이 곧 결과물 품질 |
| 작은 크기에서 가독성 | 시뮬레이션에서 실제 크기 미리보기가 중요 |
| 수동 적용이 기본 | 적용 가이드의 상세함이 UX의 일부 |

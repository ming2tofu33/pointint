---
title: DB Schema
tags:
  - pointint
  - architecture
  - database
  - supabase
aliases:
  - 데이터베이스 스키마
  - DB 설계
---

# DB Schema

> **Status:** Active
> **Last Updated:** 2026-03-28
> **DB:** Supabase (PostgreSQL)
> **원칙:** DB는 비즈니스 상태만 저장. 분석/추적은 GA4 + Clarity.

---

## 설계 원칙

### DB에 넣는 것

- 유저, 프로젝트, 결과물 — 비즈니스 상태
- Tint 거래 원장 — 경제 시스템 핵심
- 결제 기록 — 수익 데이터

### DB에 넣지 않는 것

- 방문자 세션, 유입 채널, 기기 정보 → **GA4**
- 퍼널 이벤트, 단계별 이탈 → **GA4 커스텀 이벤트**
- 유저 행동 리플레이, 히트맵 → **Microsoft Clarity**
- 일별 집계 대시보드 → **GA4 대시보드 / Looker Studio**

### 이유

솔로 프로젝트에서 GA4가 이미 하는 일을 DB에 직접 구현하는 건 시간 낭비. DB는 GA4로 대체할 수 없는 비즈니스 로직에만 집중한다.

---

## Phase별 테이블 도입 순서

| Phase | 테이블 | 이유 |
|---|---|---|
| **1** | 없음 | Guest 전용, 스테이트리스. GA4+Clarity만 |
| **2** | users, projects, creations | 로그인, 저장, 제작 이력 |
| **3** | tint_transactions, payments | Tint 경제, 결제 |
| **5** | marketplace_listings, marketplace_transactions | 마켓 (그때 설계) |

---

## Phase 1: DB 없음

Phase 1은 Guest 전용. 로그인/저장 없음. 서버는 스테이트리스 API.

```
[유저 브라우저] → [FastAPI] → 이미지 처리 → .cur 반환
                     ↑
              DB 접근 없음
```

### 분석은 GA4 커스텀 이벤트로

프론트엔드에서 `gtag()` 호출:

| 이벤트 | 퍼널 위치 | 파라미터 |
|---|---|---|
| `upload_start` | 진입 | format, size_kb |
| `upload_complete` | | format, width, height |
| `bg_remove_use` | | |
| `editor_open` | | |
| `hotspot_set` | | auto_suggested: true/false |
| `simulate_view` | | types: normal/text/link |
| `health_check_view` | | visibility, hotspot, readability |
| `download_complete` | 완료 | format, includes_inf |
| `guide_view` | | guide_type |
| `showcase_share` | | platform |

GA4 퍼널 보고서에서 `upload_start → download_complete` 전환율 = **North Star Metric (제작 완료율)**.

---

## Phase 2: 비즈니스 데이터 테이블

### `users`

Supabase Auth의 `auth.users`를 확장하는 public 프로필 테이블.

```sql
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  auth_provider text not null,           -- google / github
  role          text not null default 'member',  -- member / creator (Phase 5)
  tint_balance  int not null default 0,  -- Phase 3에서 활성화
  total_creations int not null default 0,
  registered_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

-- RLS
alter table public.users enable row level security;

create policy "Users can read own profile"
  on public.users for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);
```

### `projects`

유저가 저장한 커서 프로젝트.

```sql
create table public.projects (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  name            text not null default 'Untitled',
  source_image_url text,                 -- Supabase Storage URL
  cursor_settings jsonb not null default '{}',
  -- cursor_settings 예시:
  -- {
  --   "size": 32,
  --   "hotspot": {"x": 5, "y": 3},
  --   "bg_removed": true,
  --   "rotation": 0
  -- }
  output_urls     jsonb not null default '{}',
  -- output_urls 예시:
  -- {
  --   "cur": "https://...",
  --   "ani": "https://...",
  --   "inf": "https://...",
  --   "zip": "https://..."
  -- }
  cursor_set_17   jsonb,                 -- 17종 설정 (nullable, 생성 전 null)
  -- cursor_set_17 예시:
  -- {
  --   "normal": {"hotspot": {"x":5,"y":3}, "output_url": "..."},
  --   "text": {"hotspot": {"x":16,"y":16}, "output_url": "..."},
  --   "link": {"hotspot": {"x":10,"y":2}, "output_url": "..."},
  --   ...
  -- }
  is_public       boolean not null default false,  -- 갤러리 공개 여부
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- RLS
alter table public.projects enable row level security;

create policy "Users can CRUD own projects"
  on public.projects for all using (auth.uid() = user_id);

create policy "Public projects are readable by all"
  on public.projects for select using (is_public = true);

-- Index
create index idx_projects_user on public.projects(user_id);
create index idx_projects_public on public.projects(is_public) where is_public = true;
```

### `creations`

제작 이력. 통계 및 Creator 승급 조건 추적용.

```sql
create table public.creations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users(id) on delete set null,  -- nullable (Phase 1 Guest)
  project_id      uuid references public.projects(id) on delete set null,
  output_format   text not null,         -- cur / ani
  output_size     int not null default 32,  -- 32 / 64 / 128
  bg_removed      boolean not null default false,
  hotspot_auto    boolean not null default false,  -- 자동 추천 사용 여부
  health_score    jsonb,
  -- health_score 예시:
  -- {
  --   "visibility_light": "pass",
  --   "visibility_dark": "warn",
  --   "hotspot_position": "pass",
  --   "readability_32px": "fail"
  -- }
  downloaded      boolean not null default false,
  created_at      timestamptz not null default now()
);

-- RLS
alter table public.creations enable row level security;

create policy "Users can read own creations"
  on public.creations for select using (auth.uid() = user_id);

-- Index
create index idx_creations_user on public.creations(user_id);
```

---

## Phase 3: Tint 경제 테이블

### `tint_transactions`

Tint 유입/소멸의 모든 기록. 경제 시스템의 원장(ledger).

```sql
create table public.tint_transactions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  type            text not null,         -- earn / spend / purchase / commission_burn
  source          text not null,         -- 아래 source 목록 참조
  amount          int not null,          -- 양수(유입) / 음수(소멸)
  balance_after   int not null,          -- 거래 후 잔액 (감사 추적)
  reference_id    uuid,                  -- 관련 creation/payment/listing ID
  created_at      timestamptz not null default now()
);

-- RLS
alter table public.tint_transactions enable row level security;

create policy "Users can read own transactions"
  on public.tint_transactions for select using (auth.uid() = user_id);

-- Index
create index idx_tint_tx_user on public.tint_transactions(user_id);
create index idx_tint_tx_created on public.tint_transactions(created_at);
create index idx_tint_tx_type on public.tint_transactions(type);
```

#### source 목록

| type | source | amount | 설명 |
|---|---|---|---|
| earn | daily_login | +50 | 출석 |
| earn | creation_bonus | +50 | 제작 완료 (일 1회) |
| earn | gallery_share | +200 | 갤러리 공유 (주 2회) |
| earn | weekly_challenge | +500 | 주간 챌린지 |
| earn | referral | +2,000 | 친구 초대 |
| purchase | starter_pack | +5,000 | ₩4,900 |
| purchase | standard_pack | +12,000 | ₩9,900 |
| purchase | creator_pack | +25,000 | ₩19,900 |
| purchase | studio_pack | +55,000 | ₩39,900 |
| spend | ai_bg_remove | -500 | AI 배경 제거 |
| spend | ai_edge_fix | -500 | AI 가장자리 보정 |
| spend | ai_auto_crop | -500 | AI 자동 크롭 |
| spend | auto_17set | -3,000 | 17종 자동 변형 (Phase 3+) |
| spend | hires_export | -1,000 | HiDPI 멀티사이즈 |
| spend | ai_generate | -TBD | AI 커서 생성 (Phase 4) |
| spend | market_purchase | -N | 마켓 구매 (Phase 5) |
| earn | market_sale | +N | 마켓 판매 수익 80% (Phase 5) |
| commission_burn | market_commission | -N | 수수료 20% 소각 (Phase 5) |

#### Tint 잔액 정합성

`users.tint_balance`는 캐시. 정합성 검증:

```sql
-- 불일치 감지 쿼리
select u.id, u.tint_balance,
       coalesce(sum(t.amount), 0) as computed_balance
from users u
left join tint_transactions t on t.user_id = u.id
group by u.id
having u.tint_balance != coalesce(sum(t.amount), 0);
```

#### 경제 모니터링 쿼리

```sql
-- 전체 Tint 유통량 (인플레이션 모니터링)
select sum(amount) as total_circulation
from tint_transactions;

-- 무료 vs 유료 Tint 소비 비율
select
  sum(case when source in ('daily_login','creation_bonus','gallery_share','weekly_challenge','referral')
      then abs(amount) else 0 end) as free_tint_earned,
  sum(case when type = 'purchase'
      then amount else 0 end) as paid_tint_purchased
from tint_transactions;
```

### `payments`

실제 결제 기록. Stripe/토스 연동.

```sql
create table public.payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  provider            text not null,       -- stripe / toss
  provider_payment_id text not null,       -- 외부 결제 ID
  pack_type           text not null,       -- starter / standard / creator / studio
  amount_krw          int not null,        -- 결제 금액
  tint_granted        int not null,        -- 지급된 Tint
  status              text not null default 'pending',  -- pending / completed / refunded / failed
  created_at          timestamptz not null default now()
);

-- RLS
alter table public.payments enable row level security;

create policy "Users can read own payments"
  on public.payments for select using (auth.uid() = user_id);

-- Index
create index idx_payments_user on public.payments(user_id);
create index idx_payments_status on public.payments(status);
```

---

## Phase 5: 마켓 테이블 (스켈레톤)

Phase 5 착수 시 상세 설계. 예비 구조만 메모.

```
marketplace_listings
├── id, creator_id, title, description
├── cursor_type (single / set_17 / theme_pack)
├── price_tint, preview_urls
├── status (active / removed / sold_out)
├── total_sales, created_at

marketplace_transactions
├── id, listing_id, buyer_id, seller_id
├── price_tint, commission_tint (20%)
├── created_at
```

---

## 어드민 관점: Phase별 확인 지표와 데이터 소스

### Phase 1

| 지표 | 소스 | 비고 |
|---|---|---|
| 제작 완료율 (NSM) | **GA4** 퍼널 | upload_start → download_complete |
| 단계별 이탈률 | **GA4** 퍼널 | |
| 시뮬레이션 사용률 | **GA4** 이벤트 | simulate_view 비율 |
| 건강 체크 확인률 | **GA4** 이벤트 | health_check_view 비율 |
| 유저 행동 리플레이 | **Clarity** 세션 녹화 | 어디서 헤매는지 시각적 확인 |
| 유입 채널 | **GA4** 기본 | |

### Phase 2

| 지표 | 소스 | 비고 |
|---|---|---|
| Guest→Member 전환율 (NSM) | **GA4** 전환 | |
| DAU / WAU / MAU | **DB** users.last_active_at | |
| 17종 사용률 | **DB** projects.cursor_set_17 is not null 비율 | |
| 갤러리 공유율 | **DB** projects.is_public = true 비율 | |
| Hotspot 자동 추천 사용률 | **DB** creations.hotspot_auto 비율 | |

### Phase 3

| 지표 | 소스 | 비고 |
|---|---|---|
| Tint 구매 전환율 (NSM) | **DB** payments / users 비율 | |
| ARPU | **DB** sum(payments.amount_krw) / active users | |
| 기능별 Tint 소모 분포 | **DB** tint_transactions group by source | |
| 무료 vs 유료 Tint 비율 | **DB** tint_transactions | |
| Tint 유통량 | **DB** sum(tint_transactions.amount) | 인플레 모니터링 |
| 재구매율 | **DB** payments에서 user_id 중복 비율 | |
| 출석 연속일수 | **DB** 별도 계산 또는 users 필드 | |

---

## Related

- [[01-Core/Tech-Stack]]

## See Also

- [[2026-03-27-pointint-economy-design]]
- [[08-Business/Tier-Pricing]]
- [[06-Implementation/plans/2026-03-27-implementation-phase-flow]]

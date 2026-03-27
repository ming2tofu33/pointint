---
name: pointint-supabase
description: Pointint Supabase/Postgres 스키마, 쿼리, RLS 설계. Use when the user mentions Supabase, Postgres, 테이블, 스키마, RLS, 쿼리, 인덱스, DB, 데이터베이스, migration, 또는 데이터 구조 설계가 필요한 상황.
---

# Pointint Supabase / Postgres

## Pointint DB Context

- DB: Supabase (PostgreSQL + Auth + RLS)
- 인증: Supabase Auth
- 호스팅: Supabase Cloud
- ORM 없음 — Supabase JS client + FastAPI에서 직접 쿼리

## 핵심 원칙

1. RLS는 모든 public 테이블에 기본 적용
2. 스키마 변경은 Supabase Migration (`supabase db diff`) 사용
3. 인덱스는 쿼리 패턴 기반으로 설계 (불필요한 인덱스 지양)
4. sensitive 데이터는 `service_role` key로만 접근

## 상세 패턴

Postgres 쿼리 최적화, 커넥션 관리, 스키마 설계 상세는 글로벌 스킬 `supabase-postgres-best-practices`를 함께 참조한다.

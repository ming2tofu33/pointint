---
name: pointint-migration
description: Pointint DB 마이그레이션 전략. Use when the user mentions 마이그레이션, migration, 스키마 변경, 테이블 변경, 컬럼 추가, 데이터 이전, rollback, 또는 DB 구조를 변경해야 하는 상황.
---

# Pointint Database Migration

## Pointint Migration Context

- DB: Supabase (PostgreSQL)
- 마이그레이션 도구: Supabase CLI (`supabase migration new`, `supabase db push`)
- ORM 마이그레이션 아님 — SQL 직접 작성

## 핵심 원칙

1. 모든 스키마 변경은 migration 파일로 관리 (수동 SQL 변경 금지)
2. `supabase/migrations/` 디렉터리에 타임스탬프 기반 파일 생성
3. RLS 정책 변경도 migration에 포함
4. destructive 변경(DROP, 타입 변경)은 2단계로 분리 (추가 → 이전 → 제거)

## 상세 패턴

zero-downtime 전략, rollback 절차, 데이터 변환 상세는 글로벌 스킬 `database-migration`을 함께 참조한다.

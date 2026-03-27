---
name: pointint-pydantic
description: Pointint FastAPI 모델/검증 (Pydantic v2). Use when the user mentions Pydantic, 모델, 스키마, 검증, validation, FastAPI 모델, request body, response model, BaseModel, Field, 또는 API 데이터 구조 정의가 필요한 상황.
---

# Pointint Pydantic / FastAPI Models

## Pointint Backend Context

- Backend: FastAPI (Python)
- Validation: Pydantic v2
- 호스팅: Railway
- DB 연동: Supabase client (ORM 없음)

## 핵심 원칙

1. 모든 API endpoint에 request/response 모델 정의 필수
2. Pydantic v2 문법 사용 (`model_validator`, `field_validator`, `ConfigDict`)
3. `BaseSettings`로 환경 변수 관리
4. strict mode 기본 — 암묵적 타입 변환 지양

## 상세 패턴

Pydantic v2 검증 패턴, FastAPI 통합, 커스텀 타입 상세는 글로벌 스킬 `pydantic`을 함께 참조한다.

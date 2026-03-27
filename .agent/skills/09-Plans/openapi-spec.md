---
name: pointint-openapi
description: Pointint API 스펙 설계 (OpenAPI + FastAPI). Use when the user mentions API 스펙, API 문서, OpenAPI, Swagger, endpoint 설계, API 설계, REST API, 또는 API 구조를 정의해야 하는 상황.
---

# Pointint OpenAPI / API Spec

## Pointint API Context

- Backend: FastAPI (자동 OpenAPI 생성)
- Frontend: Next.js (API 소비)
- 인증: Supabase Auth JWT → FastAPI dependency로 검증

## 핵심 원칙

1. FastAPI의 자동 OpenAPI 생성을 기본으로 활용
2. Pydantic 모델에 `Field(description=..., examples=[...])` 반드시 포함
3. 에러 응답도 스키마로 정의 (`HTTPException` + response model)
4. 버전은 URL prefix (`/api/v1/`)로 관리

## 상세 패턴

OpenAPI 3.1 스펙 구조, design-first 접근, SDK 생성 상세는 글로벌 스킬 `openapi-spec-generation`을 함께 참조한다.

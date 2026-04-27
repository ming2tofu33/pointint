---
title: Download & Guide
tags:
  - pointint
  - features
  - download
aliases:
  - 다운로드
  - 적용 가이드
---

# Download & Guide

> **Status:** Active
> **Last Updated:** 2026-04-27
> **Source:** `docs/기능 상세.md` §4, §5

## 다운로드 단위

- **개별:** Normal, Text, Link 각각 `.cur` 또는 `.ani` 파일
- **세트:** 3종 묶은 zip 패키징
- 사용자가 선택할 수 있다

## 적용 가이드

- 다운로드 완료 후 화면에 상세 가이드가 바로 표시된다
- Windows 설정에서 커서를 바꾸는 방법을 단계별로 안내
- 원복 방법도 함께 안내 (심리적 부담을 낮춤)

## Guest vs Member 경계

### Guest (비회원)

- 전체 파이프라인 사용 가능 (업로드 → 다운로드)
- 3종 (Normal / Text / Link)
- 저장 없음, 재수정 없음, AI 없음

### Member (무료 가입)

- 프로젝트 저장, 재수정
- 17종 전체 수동 제작
- 17종 자동 변형
- 일일/활동 기반 Tint 적립
- 이후 확장 기능 접근 기반

## 가입 전환 원칙

- 가입 방식은 Google OAuth only다
- 첫 업로드 전에는 가입을 요구하지 않는다
- 첫 다운로드 전에도 가입을 강제하지 않는다
- 가입 요청은 `저장하기`, `17종 전체 만들기`, `17종 자동 변형`, `다시 수정하기`처럼 사용자가 확장 가치를 요청한 순간에만 띄운다
- 가입 후에는 사용자가 누른 원래 행동으로 즉시 복귀한다. 예: `저장하기`에서 가입했다면 가입 직후 자동 저장, `17종 전체 만들기`에서 가입했다면 가입 직후 17종 제작 화면으로 복귀
- 상세 문구와 복귀 규칙은 [[Auth-UX-Contract]]를 기준으로 한다

## 핵심 원칙

- 다운로드가 끝이 아니라 적용까지가 Pointint의 흐름이다
- 가이드가 자연스럽게 보여야 한다 (별도 페이지 이동 아님)
- 가입은 막이 아니라 확장 보상이다

## Related

- [[Simulator]]
- [[Upload-Preprocess]]
- [[Auth-UX-Contract]]

## See Also

- [[08-Business/Tier-Pricing]]

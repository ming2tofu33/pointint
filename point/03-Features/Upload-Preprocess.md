---
title: Upload & Preprocess
tags:
  - pointint
  - features
  - upload
aliases:
  - 업로드
  - 전처리
---

# Upload & Preprocess

> **Status:** Active
> **Last Updated:** 2026-03-27
> **Source:** `docs/기능 상세.md` §1

## 업로드

- 지원 포맷: PNG, JPG, WebP, GIF
- 정적 이미지는 내부적으로 투명 PNG로 통일
- GIF는 애니메이션 커서(.ani) 제작 흐름으로 진입
- 사용자는 포맷을 신경 쓰지 않는다

## 자동 배경 제거

- 업로드 즉시 자동 배경 제거 처리
- 결과를 확인한 뒤 다음 단계로 진행
- MVP에서는 수동 보정 없이 자동 결과만 제공

## 핵심 원칙

- 사용자가 "이미지 한 장만 올리면 된다"고 느껴야 한다
- 파일 변환, 배경 처리는 Pointint가 알아서 한다

## Related

- [[Cursor-Editor]]
- [[Simulator]]

## See Also

- [[04-AI-System/AI-Strategy]]

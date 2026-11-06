---
title: "[샘플] 다른 카테고리 필터 확인용 글"
description: "카테고리·태그 필터와 이전/다음 글 이동을 확인하는 테스트용 샘플입니다."
date: "2026-11-05"
category: "Backend"
tags:
  - Java
  - SQL
draft: true
---

> 이 글은 화면 확인용 샘플이며 공개되지 않습니다.

## 예시 코드

```java
public record SampleResponse(String name, int count) {
    public static SampleResponse empty() {
        return new SampleResponse("", 0);
    }
}
```

## 예시 설정

```yaml
server:
  port: 8080
```

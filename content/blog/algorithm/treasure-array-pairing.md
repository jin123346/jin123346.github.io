---
title: "[백준] 보물 - 반대 순서로 짝짓는 그리디"
description: "B의 원래 순서를 유지하면서 큰 B에 작은 A를 연결하는 인덱스 정렬을 사용한다."
date: "2026-10-21"
category: "Algorithm"
tags:
  - Python
  - Greedy
  - Sorting
  - Index
draft: false
---

## 문제 요약

- **문제:** [보물](https://www.acmicpc.net/problem/1026)
- **플랫폼 / 난이도:** 백준 1026 · 실버 4
- **입력 크기:** 두 배열 길이 N≤50, 원소 0~100.

A만 재배열해 같은 인덱스끼리의 곱의 합을 최소화한다. B는 변경하지 않는다.

## 접근 방법

처음에 모든 순열을 확인해야 한다고 생각했지만 큰 B와 작은 A를 짝지으면 된다. B값 내림차순에 해당하는 **원래 인덱스**만 정렬했다.

## 풀이 코드

```python
def solution(A, B):
    A.sort()
    indices = sorted(range(len(B)), key=lambda i: B[i], reverse=True)
    S = 0
    for i, ind in enumerate(indices):
        S += A[i] * B[ind]
    return S
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(N log N) | A와 인덱스 배열을 각각 정렬한다. |
| 공간 | O(N) | B 인덱스 목록을 별도로 저장한다. |

## 막혔던 부분

처음에는 누적 변수 `S`를 초기화하지 않았다. `sorted(range(len(B)), key=lambda i: B[i])`의 의미가 헷갈려 문법을 따로 학습했다.

## 다른 풀이와 비교

최솟값만 구할 때는 `sum(a*b for a,b in zip(sorted(A),sorted(B,reverse=True)))`도 가능하지만 이 방법은 B의 복사본을 정렬한다.

## 정리

- **이 유형을 알아보는 단서:** 인덱스 정렬로 원본 배열 유지하기
- **다음에 기억할 점:** 큰 값과 작은 값을 짝짓는 교환 논리 익히기

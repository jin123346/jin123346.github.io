---
title: "[백준] ATM - 정렬과 누적합 그리디"
description: "짧은 인출 시간부터 처리하여 모든 사람의 완료 시간 합을 최소화한다."
date: "2026-10-21"
category: "Algorithm"
tags:
  - Python
  - Greedy
  - Sorting
  - PrefixSum
draft: false
---

## 문제 요약

- **문제:** [ATM](https://www.acmicpc.net/problem/11399)
- **플랫폼 / 난이도:** 백준 11399 · 실버 4
- **입력 크기:** 사람 N명, 각 인출 시간.

각 사람의 대기 및 인출 완료 시간의 합을 최소화한다.

## 접근 방법

인출 시간이 긴 사람을 앞에 두면 뒤 모든 사람의 완료 시간이 늘어난다. 따라서 인출 시간을 오름차순으로 정렬하고 누적합을 다시 합한다.

## 풀이 코드

```python
def solution(times):
    times.sort()
    current = 0
    total = 0
    for t in times:
        current += t
        total += current
    return total
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(N log N) | 정렬이 지배적이고 이후 합산은 O(N)이다. |
| 공간 | O(N) 최악의 정렬 보조 공간 | 정렬 보조 공간 외에 누적 변수만 사용한다. |

## 막혔던 부분

원래 값의 합이 아니라 **각 단계 누적 시간의 합**을 구해야 한다.

## 다른 풀이와 비교

각 작업 완료 시간을 합하는 문제는 짧은 작업 우선(SPT) 정렬이 유리하다.

## 정리

- **이 유형을 알아보는 단서:** 정렬 후 prefix sum을 다시 더하는 구조 익히기
- **다음에 기억할 점:** 서로 다른 두 사람의 순서를 바꾸어 최적성 설명하기

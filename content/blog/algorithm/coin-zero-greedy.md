---
title: "[백준] 동전 0 - 그리디와 divmod"
description: "배수 관계의 동전 단위에서 큰 동전부터 사용해 최소 개수를 계산한다."
date: "2026-10-20"
category: "Algorithm"
tags:
  - Python
  - Greedy
  - Math
  - Divmod
draft: false
---

## 문제 요약

- **문제:** [동전 0](https://www.acmicpc.net/problem/11047)
- **플랫폼 / 난이도:** 백준 11047 · 실버 4
- **입력 크기:** 동전 종류 N개, 목표 금액 K, 인접 동전 단위 배수 조건.

주어진 동전으로 K원을 만들 때 필요한 동전의 최소 개수를 계산한다.

## 접근 방법

큰 단위부터 현재 남은 금액으로 몇 개 사용할 수 있는지 구한다. 몫은 동전 수, 나머지는 다음 동전으로 처리할 금액이다.

## 풀이 코드

```python
def solution(coins, K):
    count = 0
    change = K
    for coin in reversed(coins):
        used, change = divmod(change, coin)
        count += used
        if change == 0:
            break
    return count
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(N) | 동전 종류를 최대 N개 순회한다. |
| 공간 | O(1) | 카운터와 남은 금액만 저장한다. |

## 막혔던 부분

처음에는 `r = K // coin`으로 원래 금액을 매번 재사용했고, 불필요한 `while`문으로 무한 반복했다. `divmod()`는 인자가 두 개 필요하다.

## 다른 풀이와 비교

`r=change//coin; change-=r*coin` 방식과 `divmod(change, coin)`은 같다. 임의의 동전 체계에서는 큰 동전 우선이 최적이 아닐 수 있다.

## 정리

- **이 유형을 알아보는 단서:** 큰 선택이 최적인 이유가 동전 배수 조건에 있음을 확인하기
- **다음에 기억할 점:** 다음 단계는 남은 상태에서 계산하기

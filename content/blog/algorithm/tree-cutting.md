---
title: "[백준] 나무 자르기 - 절단 높이 매개변수 탐색"
description: "나무 길이 합이 M 이상이 되는 최대 절단 높이를 찾는다."
date: "2026-10-20"
category: "Algorithm"
tags:
  - Python
  - BinarySearch
  - ParametricSearch
draft: false
---

## 문제 요약

- **문제:** [나무 자르기](https://www.acmicpc.net/problem/2805)
- **플랫폼 / 난이도:** 백준 2805 · 실버 2
- **입력 크기:** 나무 N개, 높이 최대 10억, 필요한 나무 길이 M.

절단기 높이 H를 정해 잘려 나온 나무 길이 합을 M 이상 확보하면서 H를 최대화한다.

## 접근 방법

높이 mid보다 큰 나무만 `h - mid`만큼 잘린다. 가능한 높이를 찾으면 더 높여 보고, 부족하면 낮춘다.

## 풀이 코드

```python
def solution(heights, M):
    bottom, top = 0, max(heights)
    answer = 0
    while bottom <= top:
        mid = (bottom + top) // 2
        total = 0
        for h in heights:
            if h > mid:
                total += h - mid
        if total >= M:
            answer = mid
            bottom = mid + 1
        else:
            top = mid - 1
    return answer
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(N log H) | 높이 범위 H를 이분탐색하며 매 단계 나무 N개를 합산한다. |
| 공간 | O(1) | 누적합과 경계 인덱스만 사용한다. |

## 막혔던 부분

처음에는 모든 나무에서 `(h-mid)`를 더해 작은 나무가 음수로 계산되었다.

## 다른 풀이와 비교

랜선 자르기와 탐색 틀은 같지만 판정 함수가 몫의 합이 아닌 양수 부분의 합이다.

## 정리

- **이 유형을 알아보는 단서:** 실제 잘리는 길이는 `max(h-mid, 0)`
- **다음에 기억할 점:** 판정식을 문제 조건에 맞게 설계하기

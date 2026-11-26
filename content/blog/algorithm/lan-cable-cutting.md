---
title: "[백준] 랜선 자르기 - 매개변수 탐색"
description: "랜선 개수가 조건을 만족하는 최대 절단 길이를 이분탐색으로 찾는다."
date: "2026-10-20"
category: "Algorithm"
tags:
  - Python
  - BinarySearch
  - ParametricSearch
draft: false
---

## 문제 요약

- **문제:** [랜선 자르기](https://www.acmicpc.net/problem/1654)
- **플랫폼 / 난이도:** 백준 1654 · 실버 2
- **입력 크기:** 랜선 N개, 각 길이 최대 2³¹-1, 필요한 개수 K.

주어진 랜선을 같은 길이로 잘라 K개 이상 만들 수 있는 최대 길이를 찾는다.

## 접근 방법

길이 mid에서 `sum(length // mid)`로 만들 수 있는 개수를 검사한다. 충분하면 mid를 후보로 저장하고 더 큰 길이를 검사한다.

## 풀이 코드

```python
def solution(lengths, K):
    left, right = 1, max(lengths)
    answer = 0
    while left <= right:
        mid = (left + right) // 2
        count = sum(length // mid for length in lengths)
        if count >= K:
            answer = mid
            left = mid + 1
        else:
            right = mid - 1
    return answer
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(N log L) | 최대 길이 L의 로그 횟수만큼 N개 랜선을 계산한다. |
| 공간 | O(1) | 정수 변수 외 별도 자료구조가 없다. |

## 막혔던 부분

`K >= count`로 비교를 반대로 했고, `count == K`에서 바로 반환하여 최대 길이를 놓쳤다. `mid+1`을 모든 값을 하나씩 검사하는 것으로 오해했다.

## 다른 풀이와 비교

숫자 존재 여부의 이분탐색과 달리 조건을 만족하는 최댓값을 구한다.

## 정리

- **이 유형을 알아보는 단서:** mid는 잘라 볼 길이
- **다음에 기억할 점:** 개수가 충분해도 더 큰 길이를 검사하기

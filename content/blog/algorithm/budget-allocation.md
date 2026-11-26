---
title: "[백준] 예산 - 최대 상한액 매개변수 탐색"
description: "예산 총합 제한을 지키는 공통 상한액의 최댓값을 구한다."
date: "2026-10-21"
category: "Algorithm"
tags:
  - Python
  - BinarySearch
  - ParametricSearch
draft: false
---

## 문제 요약

- **문제:** [예산](https://www.acmicpc.net/problem/2512)
- **플랫폼 / 난이도:** 백준 2512 · 실버 2
- **입력 크기:** 지역 N개, 예산 요청액과 총예산 M.

각 지역에는 요청액과 공통 상한액 중 작은 금액을 지급한다. 전체 예산을 넘지 않는 최대 상한액을 찾는다.

## 접근 방법

처음에는 순서를 선택하는 그리디로 판단했다. 하지만 지역 처리 순서가 아니라 상한액 숫자 하나의 가능 여부를 판정하는 문제임을 파악했다.

## 풀이 코드

```python
def solution(requests, total_budget):
    low, high = 0, max(requests)
    answer = 0
    while low <= high:
        mid = (low + high) // 2
        total = sum(min(request, mid) for request in requests)
        if total <= total_budget:
            answer = mid
            low = mid + 1
        else:
            high = mid - 1
    return answer
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(N log R) | 상한액 최대 R의 로그 횟수만큼 N개 지급액을 계산한다. |
| 공간 | O(1) | 추가 리스트 없이 합계를 생성식으로 계산한다. |

## 막혔던 부분

최적값을 구한다는 이유만으로 그리디라고 분류했다. 실제로는 정렬도 불필요한 단조 조건의 매개변수 탐색이다.

## 다른 풀이와 비교

나무 자르기에서는 높이를 높이면 확보량이 감소하고, 예산 문제에서는 상한액을 높이면 지급액이 증가한다. 가능 조건과 탐색 방향을 연결해야 한다.

## 정리

- **이 유형을 알아보는 단서:** 가능→불가능이 한 방향으로 전환되는 수치가 있는지 찾기
- **다음에 기억할 점:** `sum(min(request, mid) ...)` 패턴 익히기

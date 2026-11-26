---
title: "[백준] 회의실 배정 - 종료 시간 그리디"
description: "종료 시간이 빠른 회의를 우선 배정하여 겹치지 않는 회의 수를 최대화한다."
date: "2026-10-21"
category: "Algorithm"
tags:
  - Python
  - Greedy
  - Sorting
  - Intervals
draft: false
---

## 문제 요약

- **문제:** [회의실 배정](https://www.acmicpc.net/problem/1931)
- **플랫폼 / 난이도:** 백준 1931 · 실버 1
- **입력 크기:** 회의 N개, 시작·종료 시각, 시작과 종료가 같은 회의 허용.

한 회의실에서 서로 겹치지 않게 진행할 수 있는 회의의 최대 개수를 구한다.

## 접근 방법

처음에는 모든 시작 인덱스에서 이중 반복문을 돌리려 했지만 O(N²)이 된다. 종료 시간, 시작 시간 순으로 정렬해 한 번만 확인하면 된다.

## 풀이 코드

```python
def solution(meetings):
    meetings.sort(key=lambda x: (x[1], x[0]))
    count = 0
    end_time = 0
    for start, end in meetings:
        if start >= end_time:
            count += 1
            end_time = end
    return count
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(N log N) | 정렬 O(N log N) 후 한 번 순회한다. |
| 공간 | O(N) 최악의 정렬 보조 공간 | Python 정렬 구현이 보조 공간을 사용할 수 있다. |

## 막혔던 부분

`meetings.sort()`는 시작 시간 우선이라 틀렸고, 이중 반복문에서 end_time과 count를 재초기화하지 않았다. `end_time` 선언을 빠뜨린 적도 있다.

## 다른 풀이와 비교

시작 시간이 빠른 회의보다 종료 시간이 빠른 회의가 뒤 회의에 더 많은 시간을 남긴다.

## 정리

- **이 유형을 알아보는 단서:** 튜플 정렬 key 순서에 주의하기
- **다음에 기억할 점:** 종료 시각과 다음 시작 시각이 같으면 허용 `>=`

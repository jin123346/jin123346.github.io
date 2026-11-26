---
title: "[백준] 숨바꼭질 - 1차원 BFS 최단시간"
description: "그리디식 가까운 위치 선택의 한계를 확인하고 1차원 BFS로 변경한 기록."
date: "2026-10-12"
category: "Algorithm"
tags:
  - Python
  - BFS
  - ShortestPath
  - Deque
draft: false
---

## 문제 요약

- **문제:** [숨바꼭질](https://www.acmicpc.net/problem/1697)
- **플랫폼 / 난이도:** 백준 1697 · 실버 1
- **입력 크기:** N,K는 0~100,000, 이동 x-1·x+1·2x.

현재 위치 N에서 목표 K까지 최소 초를 계산한다. 각 이동은 1초가 든다.

## 접근 방법

처음에는 K와 숫자 차이가 가장 작은 방향만 골랐지만 최단시간을 보장하지 못했다. 이후 위치별 이동 횟수를 큐에 넣어 BFS로 탐색했다.

## 풀이 코드

```python
from collections import deque

def solution(N, K):
    q = deque([(N, 0)])
    visited = {N}
    while q:
        x, depth = q.popleft()
        if x == K:
            return depth
        for nxt in (x * 2, x - 1, x + 1):
            if not (0 <= nxt <= 100000) or nxt in visited:
                continue
            visited.add(nxt)
            q.append((nxt, depth + 1))
    return -1
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(L) | 가능한 위치 L=100,001개를 각각 최대 한 번 방문한다. |
| 공간 | O(L) | 방문 집합과 큐 크기는 O(L)이다. |

## 막혔던 부분

`while new_n == K` 조건이 반대였고 `new_n=N`을 루프 안에서 재설정해 무한 반복했다. 목표와의 숫자 차이를 depth로 사용한 것도 오류였다.

## 다른 풀이와 비교

목표까지 거리만 줄이는 그리디는 정답 보장이 없다. 단위 비용인 이동 그래프에서는 BFS가 최단시간을 보장한다.

## 정리

- **이 유형을 알아보는 단서:** depth는 목표까지 남은 거리가 아니라 이동 횟수
- **다음에 기억할 점:** 모든 후보를 큐에 넣고 방문 처리

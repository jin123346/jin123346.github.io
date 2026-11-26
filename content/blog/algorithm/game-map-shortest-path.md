---
title: "[프로그래머스] 게임 맵 최단거리 - 2차원 BFS"
description: "격자 내 장애물을 피하면서 목적지까지 최소 칸 수를 구하는 BFS."
date: "2026-10-12"
category: "Algorithm"
tags:
  - Python
  - BFS
  - Grid
  - ShortestPath
draft: false
---

## 문제 요약

- **문제:** [게임 맵 최단거리](https://school.programmers.co.kr/learn/courses/30/lessons/1844)
- **플랫폼 / 난이도:** 프로그래머스 Lv.2
- **입력 크기:** N×M 격자, 0은 벽, 1은 통행 가능.

좌측 상단에서 우측 하단까지 이동할 때 지나는 칸 수의 최솟값을 구한다. 도달할 수 없다면 -1을 반환한다.

## 접근 방법

상하좌우 이동을 각각 비용 1인 간선으로 보고 BFS를 실행한다. `(행, 열, 거리)`를 큐에 보관한다.

## 풀이 코드

```python
from collections import deque

def solution(maps):
    n, m = len(maps), len(maps[0])
    q = deque([(0, 0, 1)])
    visited = [[False] * m for _ in range(n)]
    visited[0][0] = True
    for_dxdy = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    while q:
        x, y, depth = q.popleft()
        if (x, y) == (n - 1, m - 1):
            return depth
        for dx, dy in for_dxdy:
            nx, ny = x + dx, y + dy
            if not (0 <= nx < n and 0 <= ny < m):
                continue
            if maps[nx][ny] == 0 or visited[nx][ny]:
                continue
            visited[nx][ny] = True
            q.append((nx, ny, depth + 1))
    return -1
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(NM) | 각 통행 가능 칸을 최대 한 번 방문한다. |
| 공간 | O(NM) | 방문 배열과 큐에 최대 NM개 상태가 존재한다. |

## 막혔던 부분

BFS에서 거리 7의 다른 정점들을 먼저 처리한 뒤 거리 8을 처리하는 큐 순서를 직접 추적했다. 행·열 경계와 방문 검사를 빠뜨리면 오류가 난다.

## 다른 풀이와 비교

DFS로도 경로는 찾을 수 있지만 단위 비용 최단거리는 BFS가 더 직접적이다.

## 정리

- **이 유형을 알아보는 단서:** 격자는 2차원 그래프처럼 생각하기
- **다음에 기억할 점:** 거리 초기값이 칸 수인지 이동 수인지 구분하기

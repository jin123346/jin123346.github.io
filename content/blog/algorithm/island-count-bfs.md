---
title: "[백준] 섬의 개수 - 연결 요소 BFS"
description: "전체 격자를 훑으며 새로운 육지를 발견할 때마다 BFS로 한 섬을 방문한다."
date: "2026-10-12"
category: "Algorithm"
tags:
  - Python
  - BFS
  - ConnectedComponents
  - Grid
draft: false
---

## 문제 요약

- **문제:** [섬의 개수](https://www.acmicpc.net/problem/4963)
- **플랫폼 / 난이도:** 백준 4963 · 실버 2
- **입력 크기:** W×H 격자, 가로·세로·대각선으로 연결된 육지는 같은 섬.

육지(1)로 이루어진 연결 요소의 개수를 센다. 대각선도 연결로 인정한다.

## 접근 방법

격자 전체를 스캔해 방문하지 않은 육지에서 BFS를 시작한다. BFS가 한 번 완료되면 해당 섬 전체가 방문 처리되므로 섬 개수를 하나 늘린다.

## 풀이 코드

```python
from collections import deque

def count_islands(grid):
    h, w = len(grid), len(grid[0])
    visited = [[False] * w for _ in range(h)]
    directions = [(dx, dy) for dx in (-1, 0, 1)
                  for dy in (-1, 0, 1) if (dx, dy) != (0, 0)]
    count = 0
    for x in range(h):
        for y in range(w):
            if grid[x][y] != 1 or visited[x][y]:
                continue
            count += 1
            visited[x][y] = True
            q = deque([(x, y)])
            while q:
                cx, cy = q.popleft()
                for dx, dy in directions:
                    nx, ny = cx + dx, cy + dy
                    if not (0 <= nx < h and 0 <= ny < w):
                        continue
                    if grid[nx][ny] == 0 or visited[nx][ny]:
                        continue
                    visited[nx][ny] = True
                    q.append((nx, ny))
    return count
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(WH) | 격자 스캔과 BFS 방문이 셀 수에 비례한다. |
| 공간 | O(WH) | 방문 배열과 큐를 사용한다. |

## 막혔던 부분

처음에 (0,0)을 무조건 방문 처리하거나 물(0)까지 BFS를 시작하면 개수가 틀린다. 반환문을 바깥 반복문 안에 넣으면 중간 종료된다.

## 다른 풀이와 비교

DFS로도 연결 요소 수를 계산할 수 있지만 큰 입력에서는 재귀 깊이를 고려해야 한다.

## 정리

- **이 유형을 알아보는 단서:** 연결 요소는 바깥 전체 순회 + 안쪽 탐색으로 구성하기
- **다음에 기억할 점:** 대각선 연결 여부 확인하기

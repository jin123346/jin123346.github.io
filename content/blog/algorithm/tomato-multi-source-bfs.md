---
title: "[백준] 토마토 - 다중 시작점 BFS"
description: "이미 익은 모든 토마토를 동시에 큐에 넣어 날짜별 확산을 계산한다."
date: "2026-10-12"
category: "Algorithm"
tags:
  - Python
  - BFS
  - MultiSourceBFS
  - Grid
draft: false
---

## 문제 요약

- **문제:** [토마토](https://www.acmicpc.net/problem/7576)
- **플랫폼 / 난이도:** 백준 7576 · 골드 5
- **입력 크기:** M×N 격자, 1 익음·0 안 익음·-1 빈 칸.

익은 토마토는 하루 뒤 인접한 토마토를 익게 한다. 모든 토마토가 익기까지 최소 일수를 구하고 불가능하면 -1을 반환한다.

## 접근 방법

모든 익은 칸을 깊이 0으로 큐에 넣고 BFS를 시작한다. 새로운 토마토가 익을 때 0의 개수를 줄이며 최종 전파 일수를 기록한다.

## 풀이 코드

```python
from collections import deque

def solution(box):
    n, m = len(box), len(box[0])
    q = deque()
    unripe = 0
    for x in range(n):
        for y in range(m):
            if box[x][y] == 1:
                q.append((x, y, 0))
            elif box[x][y] == 0:
                unripe += 1
    last_day = 0
    for_dirs = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    while q:
        x, y, day = q.popleft()
        last_day = max(last_day, day)
        for dx, dy in for_dirs:
            nx, ny = x + dx, y + dy
            if not (0 <= nx < n and 0 <= ny < m):
                continue
            if box[nx][ny] != 0:
                continue
            box[nx][ny] = 1
            unripe -= 1
            q.append((nx, ny, day + 1))
    return last_day if unripe == 0 else -1
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(NM) | 각 칸을 최대 한 번 익힘 처리한다. |
| 공간 | O(NM) | 큐가 최대 NM개 위치를 보관할 수 있다. |

## 막혔던 부분

시작점이 여러 개면 모두 날짜 0으로 동시에 넣어야 한다. `-1` 빈 칸을 제외하고 안 익은 개수를 세야 한다.

## 다른 풀이와 비교

각 익은 토마토별 BFS를 별도로 돌리는 것보다 다중 시작점 BFS 한 번이 효율적이다.

## 정리

- **이 유형을 알아보는 단서:** 동시에 퍼진다는 표현을 보면 다중 시작점 BFS 고려하기
- **다음에 기억할 점:** 입력 격자를 수정한다는 점 기록하기

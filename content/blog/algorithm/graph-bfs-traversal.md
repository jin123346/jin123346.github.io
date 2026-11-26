---
title: "[연습] 그래프 BFS 순회 - deque와 방문 집합"
description: "그래프에서 시작 정점부터 너비 우선으로 방문하는 기본 패턴을 정리한다."
date: "2026-10-11"
category: "Algorithm"
tags:
  - Python
  - BFS
  - Graph
  - Deque
draft: false
---

## 문제 요약

- **문제:** 개인 연습 문제 (별도 공식 원문 링크 없음)
- **플랫폼 / 난이도:** 개인 연습 · 그래프 순회
- **입력 크기:** 정점 V개, 간선 E개.

시작 정점에서 간선을 따라 도달할 수 있는 정점들을 BFS 순서로 반환한다.

## 접근 방법

시작 정점을 큐에 넣고 방문 처리한다. 큐에서 꺼낸 정점의 인접 정점을 확인해 미방문 정점만 추가한다.

## 풀이 코드

```python
from collections import deque

def bfs(graph, start):
    q = deque([start])
    visited = {start}
    order = []
    while q:
        current = q.popleft()
        order.append(current)
        for nxt in graph.get(current, []):
            if nxt not in visited:
                visited.add(nxt)
                q.append(nxt)
    return order
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(V + E) 평균 | 정점은 최대 한 번 큐에 들어가고 인접 간선들을 한 번씩 확인한다. |
| 공간 | O(V) | 방문 집합과 큐가 최대 V개 정점을 저장한다. |

## 막혔던 부분

집합은 `add`, 리스트와 deque는 `append`를 사용한다. 방문 처리를 큐에 넣을 때 해야 중복 등록을 막는다.

## 다른 풀이와 비교

DFS는 깊게 내려가며 탐색하고 BFS는 가까운 정점부터 탐색한다. 단순 도달 여부는 어느 쪽도 가능하다.

## 정리

- **이 유형을 알아보는 단서:** BFS 기본 틀 `q/visited/while/popleft` 기억하기
- **다음에 기억할 점:** 인접 리스트를 사용해 효율적으로 순회하기

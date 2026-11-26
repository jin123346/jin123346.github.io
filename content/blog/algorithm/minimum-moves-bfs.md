---
title: "[연습] 최소 이동 횟수 - BFS 유형 스스로 판별하기"
description: "새로운 연산 규칙에서도 단위 비용 이동 문제임을 판단해 BFS를 독립적으로 구현했다."
date: "2026-10-13"
category: "Algorithm"
tags:
  - Python
  - BFS
  - AlgorithmSelection
draft: false
---

## 문제 요약

- **문제:** 개인 연습 문제 (별도 공식 원문 링크 없음)
- **플랫폼 / 난이도:** 개인 연습 · 변형 이동 문제
- **입력 크기:** 0~100,000 범위, 이동 x+2·3x·x-1, 모두 1초.

N에서 K까지 세 가지 연산으로 이동하는 최소 시간을 구한다.

## 접근 방법

문제에서 알고리즘 이름을 숨긴 상태로 최소시간·여러 이동 경로·동일한 이동 비용이라는 근거를 찾아 BFS를 선택했다.

## 풀이 코드

```python
from collections import deque

def solution(N, K):
    queue = deque([(N, 0)])
    visited = {N}
    while queue:
        current, depth = queue.popleft()
        if current == K:
            return depth
        for nxt in (current + 2, current * 3, current - 1):
            if 0 <= nxt <= 100000 and nxt not in visited:
                visited.add(nxt)
                queue.append((nxt, depth + 1))
    return -1
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(L) | 상태 공간 L=100,001의 각 위치를 최대 한 번 탐색한다. |
| 공간 | O(L) | 방문 집합과 큐에 상태를 저장한다. |

## 막혔던 부분

처음에는 더 빨리 목표에 가까워지는 방향만 선택해야 한다고 생각했다. BFS는 후보를 모두 넣되 이동 횟수 순으로 꺼낸다.

## 다른 풀이와 비교

기존 숨바꼭질과 유사하지만 연산만 바뀌어도 BFS 틀을 재사용할 수 있다.

## 정리

- **이 유형을 알아보는 단서:** 알고리즘 이름보다 간선 비용이 모두 같은지 먼저 확인하기
- **다음에 기억할 점:** BFS로 처음 도달한 시간이 최소

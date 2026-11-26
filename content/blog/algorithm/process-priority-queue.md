---
title: "[프로그래머스] 프로세스 - deque 시뮬레이션"
description: "우선순위가 높은 프로세스가 남아 있으면 큐 뒤로 보내는 규칙을 구현한다."
date: "2026-10-11"
category: "Algorithm"
tags:
  - Python
  - Deque
  - Queue
  - Simulation
draft: false
---

## 문제 요약

- **문제:** [프로세스](https://school.programmers.co.kr/learn/courses/30/lessons/42587)
- **플랫폼 / 난이도:** 프로그래머스 Lv.2
- **입력 크기:** 프로세스 수 N, 우선순위와 목표 위치.

큐에 있는 작업을 처리하되 더 높은 우선순위의 작업이 대기 중이면 현재 작업을 맨 뒤로 보낸다. 목표 작업이 몇 번째 실행되는지 찾는다.

## 접근 방법

원래 인덱스를 유지하려고 `enumerate()`를 사용한다. `deque`에서 맨 앞을 꺼낸 뒤 나머지 큐에 더 높은 우선순위가 있는지 확인한다.

## 풀이 코드

```python
from collections import deque

def solution(priorities, location):
    q = deque(enumerate(priorities))
    order = 0
    while q:
        idx, p = q.popleft()
        if any(other_p > p for _, other_p in q):
            q.append((idx, p))
            continue
        order += 1
        if idx == location:
            return order
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(N²) 최악 | 큐 길이만큼 우선순위를 반복 검사할 수 있다. |
| 공간 | O(N) | 프로세스와 원래 인덱스를 모두 큐에 저장한다. |

## 막혔던 부분

정렬만으로 처리하면 순환하는 큐 규칙과 원래 위치가 사라진다. `popleft()`와 `append()` 동작을 정확히 구분했다.

## 다른 풀이와 비교

우선순위별 개수 관리 등 최적화 여지가 있지만 제한 크기에서는 큐 시뮬레이션이 읽기 쉽다.

## 정리

- **이 유형을 알아보는 단서:** 원래 위치 추적이 필요할 때 enumerate 사용하기
- **다음에 기억할 점:** 큐 뒤로 재삽입되는 규칙에 주의하기

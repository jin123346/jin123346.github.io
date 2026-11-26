---
title: "[프로그래머스] 완주하지 못한 선수 - 딕셔너리 빈도 계산"
description: "중복 이름이 있는 두 명단을 딕셔너리의 빈도 차이로 비교한다."
date: "2026-10-11"
category: "Algorithm"
tags:
  - Python
  - Hash
  - Dictionary
  - Counting
draft: false
---

## 문제 요약

- **문제:** [완주하지 못한 선수](https://school.programmers.co.kr/learn/courses/30/lessons/42576)
- **플랫폼 / 난이도:** 프로그래머스 Lv.1
- **입력 크기:** 참가자와 완주자 배열, 중복 이름 허용.

참가자 중 완주하지 못한 단 한 사람의 이름을 찾아 반환한다. 참가자 이름에는 중복이 존재할 수 있다.

## 접근 방법

집합만 사용하면 중복 횟수 정보가 사라지므로 이름별 출전 횟수를 저장한다. 참가자는 +1, 완주자는 -1 처리하고 남은 이름을 찾는다.

## 풀이 코드

```python
def solution(participant, completion):
    counts = {}
    for name in participant:
        counts[name] = counts.get(name, 0) + 1
    for name in completion:
        counts[name] -= 1
    for name, remain in counts.items():
        if remain:
            return name
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(N) 평균 | 참가자와 완주자 명단을 각각 한 번 순회한다. |
| 공간 | O(N) | 서로 다른 이름의 개수만큼 딕셔너리를 만든다. |

## 막혔던 부분

중복 이름이 존재하므로 집합 차집합으로는 정확한 결과를 얻지 못한다.

## 다른 풀이와 비교

정렬 후 비교하면 O(N log N)에도 풀 수 있다. 빈도 딕셔너리는 평균 O(N)이다.

## 정리

- **이 유형을 알아보는 단서:** 중복을 보존해야 하면 set보다 counter/dict 고려하기
- **다음에 기억할 점:** `dict.get(key, 0)` 패턴 익히기

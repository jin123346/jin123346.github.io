---
title: "[프로그래머스] 기능개발 - 완료일 기준 그룹화"
description: "작업별 완료 소요일을 계산하고 같은 배포에 묶일 작업을 한 번에 센다."
date: "2026-10-11"
category: "Algorithm"
tags:
  - Python
  - Queue
  - Simulation
  - Greedy
draft: false
---

## 문제 요약

- **문제:** [기능개발](https://school.programmers.co.kr/learn/courses/30/lessons/42586)
- **플랫폼 / 난이도:** 프로그래머스 Lv.2
- **입력 크기:** 작업 개수 N, 진도 0~99, 개발 속도 양의 정수.

앞선 기능이 완료되어야 뒤 기능도 배포할 수 있다. 각 배포에 포함되는 기능 수를 순서대로 구한다.

## 접근 방법

작업별 완료일을 올림 나눗셈으로 구한 뒤, 현재 배포 기준일 이하에서 끝나는 뒤 작업들을 묶는다.

## 풀이 코드

```python
def solution(progresses, speeds):
    days = [(100 - p + s - 1) // s for p, s in zip(progresses, speeds)]
    answer = []
    deploy_day = days[0]
    group_size = 0
    for day in days:
        if day <= deploy_day:
            group_size += 1
        else:
            answer.append(group_size)
            group_size = 1
            deploy_day = day
    answer.append(group_size)
    return answer
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(N) | 완료일 계산과 그룹화가 각각 한 번의 순회다. |
| 공간 | O(N) | 완료일 목록과 결과 목록을 만든다. |

## 막혔던 부분

배포일을 계산하면서 변수명 오타가 있었고, 뒤 기능이 먼저 완료되어도 앞 기능보다 먼저 배포되지 않는다는 제약을 확인해야 했다.

## 다른 풀이와 비교

완료일을 미리 계산하지 않고 직접 시뮬레이션할 수도 있지만 완료일 그룹화가 단순하다.

## 정리

- **이 유형을 알아보는 단서:** 앞선 요소가 뒤 요소의 처리 시점을 제한하는지 확인하기
- **다음에 기억할 점:** 올림 나눗셈 `(a+b-1)//b` 익히기

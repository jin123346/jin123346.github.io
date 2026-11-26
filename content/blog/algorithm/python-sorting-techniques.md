---
title: "[학습 노트] Python 정렬 문법 - sort, sorted, key, lambda"
description: "정렬 함수와 원본 변경 여부, 튜플 정렬, 인덱스 정렬 문법을 코딩테스트 예시로 정리했다."
date: "2026-10-21"
category: "Algorithm"
tags:
  - Python
  - Sorting
  - Lambda
  - Enumerate
draft: false
---

## 문제 요약

- **문제:** 개인 연습 문제 (별도 공식 원문 링크 없음)
- **플랫폼 / 난이도:** Python 문법 학습 노트
- **입력 크기:** 정렬 대상 N개. 일반 비교 정렬은 O(N log N).

코딩테스트에서 자주 사용하는 Python 정렬 문법을 익힌다. `sort()`, `sorted()`, `reverse()`, `reversed()`, `key`, `lambda`, `enumerate()`, `zip()`의 역할을 구분한다.

## 접근 방법

`sort()`는 리스트 원본을 바꾸고 None을 반환하며, `sorted()`는 정렬된 새 리스트를 만든다. 튜플 정렬에서는 `key=lambda x: (x[1],x[0])`처럼 복합 키를 사용한다. 인덱스 정렬은 값이 아닌 `range(len(B))`를 정렬 대상으로 삼는다.

## 풀이 코드

```python
nums = [5, 2, 8, 1]
nums.sort()                       # nums 변경: [1, 2, 5, 8]
desc = sorted(nums, reverse=True) # 새 리스트: [8, 5, 2, 1]

meetings = [(3, 5), (1, 4), (2, 3)]
meetings.sort(key=lambda x: (x[1], x[0]))

B = [2, 7, 8, 3, 1]
indices = sorted(range(len(B)), key=lambda i: B[i], reverse=True)
# [2, 1, 3, 0, 4]

for i, value in enumerate(B):
    pass
for a, b in zip([1, 2], [3, 4]):
    pass
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(N log N) | 일반 비교 정렬의 최악 시간은 O(N log N)이다. |
| 공간 | O(N) 새 리스트 기준 | sorted()와 인덱스 정렬은 길이 N의 새 리스트를 만든다. |

## 막혔던 부분

`meetings.sort(key=lambda x: meetings[1])`와 `lambda x: x[1]`을 혼동했다. `sort()`의 반환값은 None임을 구분해야 한다.

## 다른 풀이와 비교

리스트 원본이 변경되어도 되면 `sort()`, 변경되면 안 되면 `sorted()`를 선택한다. `reversed()`는 역순 반복자다.

## 정리

- **이 유형을 알아보는 단서:** lambda의 x는 각 요소
- **다음에 기억할 점:** `reverse=True`는 전체 정렬 방향을 뒤집는다

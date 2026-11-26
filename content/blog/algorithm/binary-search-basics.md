---
title: "[연습] 숫자 찾기 - 이분탐색 기본"
description: "정렬된 배열에서 왼쪽·오른쪽 경계를 중간값 기준으로 줄인다."
date: "2026-10-13"
category: "Algorithm"
tags:
  - Python
  - BinarySearch
  - Array
draft: false
---

## 문제 요약

- **문제:** 개인 연습 문제 (별도 공식 원문 링크 없음)
- **플랫폼 / 난이도:** 개인 연습 · 기본 이분탐색
- **입력 크기:** 오름차순 배열 N개, 목표 정수.

정렬된 배열에서 target이 있는지 O(log N)에 판별한다.

## 접근 방법

현재 구간의 중간 요소를 검사하고 target이 더 크면 왼쪽 경계를, 작으면 오른쪽 경계를 갱신한다. 검사한 mid는 범위에서 제외한다.

## 풀이 코드

```python
def solution(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return True
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return False
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(log N) | 탐색 구간이 매번 대략 절반으로 준다. |
| 공간 | O(1) | 인덱스 변수만 사용한다. |

## 막혔던 부분

초기에는 이동 방향이 반대였고 `left = mid`로 갱신해 무한 반복 가능성이 있었다. `left += 1`도 정답은 되지만 O(N)이다.

## 다른 풀이와 비교

선형탐색 O(N)과 달리 정렬된 입력의 순서 정보를 활용한다.

## 정리

- **이 유형을 알아보는 단서:** 정렬 전제 확인하기
- **다음에 기억할 점:** 검사한 mid를 제외하도록 ±1 적용하기

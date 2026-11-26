---
title: "[백준] 잃어버린 괄호 - 첫 마이너스 이후의 합 최소화"
description: "첫 번째 빼기 연산 이후 숫자들을 모두 빼는 그리디와 문자열 분리를 연습했다."
date: "2026-10-21"
category: "Algorithm"
tags:
  - Python
  - Greedy
  - String
  - Regex
draft: false
---

## 문제 요약

- **문제:** [잃어버린 괄호](https://www.acmicpc.net/problem/1541)
- **플랫폼 / 난이도:** 백준 1541 · 실버 2
- **입력 크기:** 0~99999 정수와 +,-로 이루어진 수식.

주어진 수식에 괄호를 추가하여 계산값을 최소화한다.

## 접근 방법

첫 번째 `-` 앞의 값은 더하고, 뒤의 숫자는 연산자와 관계없이 모두 뺀다. 정규식 캡처 그룹으로 연산자를 보존한다.

## 풀이 코드

```python
import re

def solution(expression):
    ex = re.split(r'([+-])', expression)
    total = 0
    is_minus_in = False
    for i in range(0, len(ex), 2):
        current = int(ex[i])
        if i == 0:
            total += current
            continue
        if ex[i - 1] == '-':
            is_minus_in = True
        total += -current if is_minus_in else current
    return total
```

## 복잡도

| 구분 | 복잡도 | 근거 |
| --- | --- | --- |
| 시간 | O(L) | 길이 L인 수식을 한 번 분리하고 순회한다. |
| 공간 | O(L) | 토큰 리스트에 문자열 길이 비례 공간을 사용한다. |

## 막혔던 부분

`re.split` 결과가 문자열이어서 `int` 변환이 필요했다. `is_minus_in=False`를 반복문 안에 두어 상태가 매번 초기화되었다.

## 다른 풀이와 비교

`expression.split("-")` 후 각 그룹을 더하는 방식도 가능하다. 현재 구현은 연산자 상태를 명시해 흐름을 이해하기 쉽다.

## 정리

- **이 유형을 알아보는 단서:** 상태 변수의 생명주기 구별하기
- **다음에 기억할 점:** 캡처 그룹 `([+-])`은 구분자도 남긴다

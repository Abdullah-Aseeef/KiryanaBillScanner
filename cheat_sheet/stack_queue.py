# stack_queue.py
from collections import deque


def is_valid_parentheses(s: str) -> bool:
    """Validate (), {}, [] brackets.
    Idea: stack of opening brackets.
    Time: O(n), Space: O(n).
    """
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        else:
            if not stack or stack[-1] != pairs.get(ch):
                return False
            stack.pop()
    return not stack


def next_greater_element(nums: list[int]) -> list[int]:
    """Next greater to right for each index.
    Idea: monotonic decreasing stack of indices.
    Time: O(n), Space: O(n).
    """
    out = [-1] * len(nums)
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            out[stack.pop()] = x
        stack.append(i)
    return out


def largest_rectangle_area(heights: list[int]) -> int:
    """Largest rectangle in histogram.
    Idea: monotonic increasing stack + flush with sentinel.
    Time: O(n), Space: O(n).
    """
    best = 0
    stack = []  # (start_index, height)
    for i, h in enumerate(heights + [0]):
        start = i
        while stack and stack[-1][1] > h:
            idx, height = stack.pop()
            best = max(best, height * (i - idx))
            start = idx
        stack.append((start, h))
    return best


def sliding_window_max(nums: list[int], k: int) -> list[int]:
    """Maximum in each window of size k.
    Idea: deque keeps indices in decreasing values.
    Time: O(n), Space: O(k).
    """
    if not nums or k <= 0:
        return []
    dq = deque()
    ans = []
    for i, x in enumerate(nums):
        while dq and dq[0] <= i - k:
            dq.popleft()
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            ans.append(nums[dq[0]])
    return ans


def queue_with_two_stacks_ops() -> None:
    """Queue ops pattern using two stacks.
    Idea: in_stack for push, out_stack for pop/peek.
    Time: amortized O(1) per operation, Space: O(n).
    """
    pass

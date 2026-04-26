# templates.py
from collections import deque
from functools import lru_cache


def dfs_recursive(graph: dict[int, list[int]], start: int) -> list[int]:
    """DFS traversal order (recursive).
    Idea: visit node, recurse neighbors.
    Time: O(V + E), Space: O(V) recursion+visited.
    """
    order = []
    visited = set()

    def dfs(node: int) -> None:
        visited.add(node)
        order.append(node)
        for nei in graph.get(node, []):
            if nei not in visited:
                dfs(nei)

    if start in graph:
        dfs(start)
    return order


def dfs_iterative(graph: dict[int, list[int]], start: int) -> list[int]:
    """DFS traversal order (iterative stack).
    Idea: simulate recursion with stack.
    Time: O(V + E), Space: O(V).
    """
    if start not in graph:
        return []
    order, visited = [], {start}
    stack = [start]
    while stack:
        node = stack.pop()
        order.append(node)
        for nei in reversed(graph.get(node, [])):
            if nei not in visited:
                visited.add(nei)
                stack.append(nei)
    return order


def bfs_template(graph: dict[int, list[int]], start: int) -> list[int]:
    """BFS traversal order.
    Idea: queue + layer expansion.
    Time: O(V + E), Space: O(V).
    """
    if start not in graph:
        return []
    order, visited = [], {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        order.append(node)
        for nei in graph.get(node, []):
            if nei not in visited:
                visited.add(nei)
                queue.append(nei)
    return order


def sliding_window_template(nums: list[int], k: int) -> int:
    """Fixed-size sliding window max sum.
    Idea: add right, remove left when window > k.
    Time: O(n), Space: O(1).
    """
    if k <= 0 or k > len(nums):
        return 0
    window_sum = 0
    best = float("-inf")
    left = 0
    for right, value in enumerate(nums):
        window_sum += value
        if right - left + 1 > k:
            window_sum -= nums[left]
            left += 1
        if right - left + 1 == k:
            best = max(best, window_sum)
    return int(best)


def binary_search_first_true(lo: int, hi: int, check) -> int:
    """First index in [lo, hi] where check(mid) is True.
    Idea: monotonic predicate binary search.
    Time: O(log n * check), Space: O(1).
    """
    ans = hi + 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if check(mid):
            ans = mid
            hi = mid - 1
        else:
            lo = mid + 1
    return ans


def backtracking_template(nums: list[int]) -> list[list[int]]:
    """Generate all subsets.
    Idea: choose / skip each element.
    Time: O(2^n * n), Space: O(n) recursion.
    """
    result = []
    path = []

    def backtrack(index: int) -> None:
        if index == len(nums):
            result.append(path[:])
            return
        path.append(nums[index])
        backtrack(index + 1)
        path.pop()
        backtrack(index + 1)

    backtrack(0)
    return result


def dp_memo_template(nums: tuple[int, ...]) -> int:
    """Memoized DP template (example: max non-adjacent sum).
    Idea: recursion + cache to avoid recomputation.
    Time: O(n), Space: O(n).
    """

    @lru_cache(maxsize=None)
    def solve(i: int) -> int:
        if i >= len(nums):
            return 0
        take = nums[i] + solve(i + 2)
        skip = solve(i + 1)
        return max(take, skip)

    return solve(0)

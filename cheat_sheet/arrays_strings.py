# arrays_strings.py
from collections import Counter


def two_sum_sorted(nums: list[int], target: int) -> tuple[int, int] | None:
    """Return indices of pair in sorted array with sum=target.
    Idea: two pointers from both ends.
    Time: O(n), Space: O(1).
    """
    left, right = 0, len(nums) - 1
    while left < right:
        total = nums[left] + nums[right]
        if total == target:
            return left, right
        if total < target:
            left += 1
        else:
            right -= 1
    return None


def longest_substring_no_repeat(s: str) -> int:
    """Length of longest substring without duplicate chars.
    Idea: variable window + last seen index.
    Time: O(n), Space: O(min(n, alphabet)).
    """
    last_pos = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        if ch in last_pos and last_pos[ch] >= left:
            left = last_pos[ch] + 1
        last_pos[ch] = right
        best = max(best, right - left + 1)
    return best


def min_window_substring(s: str, t: str) -> str:
    """Minimum window in s containing all chars of t.
    Idea: expand right until valid, shrink left greedily.
    Time: O(|s| + |t|), Space: O(|alphabet|).
    """
    if not s or not t:
        return ""
    need = Counter(t)
    have = Counter()
    required = len(need)
    formed = 0
    left = 0
    best_len = float("inf")
    best_range = (-1, -1)

    def add_char(ch: str) -> int:
        have[ch] += 1
        if ch in need and have[ch] == need[ch]:
            return 1
        return 0

    def remove_char(ch: str) -> int:
        have[ch] -= 1
        if ch in need and have[ch] < need[ch]:
            return -1
        return 0

    for right, ch in enumerate(s):
        formed += add_char(ch)

        while formed == required:
            if right - left + 1 < best_len:
                best_len = right - left + 1
                best_range = (left, right)
            formed += remove_char(s[left])
            left += 1

    l, r = best_range
    return "" if l == -1 else s[l:r + 1]


def product_except_self(nums: list[int]) -> list[int]:
    """Product of array except self without division.
    Idea: prefix product * suffix product.
    Time: O(n), Space: O(1) extra (excluding output).
    """
    n = len(nums)
    out = [1] * n
    prefix = 1
    for i in range(n):
        out[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        out[i] *= suffix
        suffix *= nums[i]
    return out


def game_of_life_step(grid: list[list[int]]) -> list[list[int]]:
    """One Game of Life step (returns new grid).
    Idea: count 8 neighbors using original grid only.
    Time: O(rows*cols), Space: O(rows*cols).
    """
    rows, cols = len(grid), len(grid[0])

    def live_neighbors(r: int, c: int) -> int:
        return sum(
            grid[nr][nc]
            for nr in range(max(0, r - 1), min(rows, r + 2))
            for nc in range(max(0, c - 1), min(cols, c + 2))
            if (nr, nc) != (r, c)
        )

    def next_cell(r: int, c: int) -> int:
        neighbors = live_neighbors(r, c)
        alive = grid[r][c] == 1
        return 1 if (alive and neighbors in (2, 3)) or (not alive and neighbors == 3) else 0

    return [[next_cell(r, c) for c in range(cols)] for r in range(rows)]


def matrix_multiply(a: list[list[int]], b: list[list[int]]) -> list[list[int]]:
    """Multiply matrix a (m x n) with b (n x p).
    Idea: triple loop / dot-product per cell.
    Time: O(m*n*p), Space: O(m*p).
    """
    m, n, p = len(a), len(a[0]), len(b[0])
    out = [[0] * p for _ in range(m)]
    for i in range(m):
        for k in range(n):
            if a[i][k] == 0:
                continue
            for j in range(p):
                out[i][j] += a[i][k] * b[k][j]
    return out

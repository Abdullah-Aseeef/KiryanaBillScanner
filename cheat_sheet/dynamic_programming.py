# dynamic_programming.py
from bisect import bisect_left
from functools import lru_cache


def fib_memo(n: int) -> int:
    """Fibonacci with memoization.
    Time: O(n), Space: O(n).
    """

    @lru_cache(maxsize=None)
    def dfs(x: int) -> int:
        if x <= 1:
            return x
        return dfs(x - 1) + dfs(x - 2)

    return dfs(n)


def fib_tab(n: int) -> int:
    """Fibonacci tabulation (iterative).
    Time: O(n), Space: O(1).
    """
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b


def coin_change_min_coins(coins: list[int], amount: int) -> int:
    """Minimum coins to make amount; -1 if impossible.
    Idea: 1D DP over amounts.
    Time: O(amount * len(coins)), Space: O(amount).
    """
    INF = amount + 1
    dp = [INF] * (amount + 1)
    dp[0] = 0
    for total in range(1, amount + 1):
        for coin in coins:
            if total - coin >= 0:
                dp[total] = min(dp[total], dp[total - coin] + 1)
    return dp[amount] if dp[amount] != INF else -1


def knapsack_01(weights: list[int], values: list[int], capacity: int) -> int:
    """0/1 Knapsack max value.
    Idea: reverse iterate capacity for each item.
    Time: O(n*capacity), Space: O(capacity).
    """
    dp = [0] * (capacity + 1)
    for w, v in zip(weights, values):
        for c in range(capacity, w - 1, -1):
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[capacity]


def lis_length(nums: list[int]) -> int:
    """Length of LIS.
    Idea: patience sorting tails array + binary search.
    Time: O(n log n), Space: O(n).
    """
    tails = []
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)


def house_robber(nums: list[int]) -> int:
    """Max sum with no adjacent picks.
    Time: O(n), Space: O(1).
    """
    rob_prev, skip_prev = 0, 0
    for x in nums:
        rob_prev, skip_prev = skip_prev + x, max(skip_prev, rob_prev)
    return max(rob_prev, skip_prev)


def edit_distance(a: str, b: str) -> int:
    """Levenshtein distance (insert/delete/replace).
    Time: O(len(a)*len(b)), Space: O(len(b)).
    """
    if len(a) < len(b):
        a, b = b, a
    prev = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])
        prev = cur
    return prev[-1]

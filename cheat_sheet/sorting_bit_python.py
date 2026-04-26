# sorting_bit_python.py
from functools import cmp_to_key
from itertools import accumulate, permutations, combinations


def sort_intervals(intervals: list[list[int]]) -> list[list[int]]:
    """Sort by start, then end.
    Time: O(n log n), Space: O(n) (Python sort internals).
    """
    return sorted(intervals, key=lambda x: (x[0], x[1]))


def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    """Merge overlapping intervals.
    Idea: sort then merge with last interval.
    Time: O(n log n), Space: O(n).
    """
    if not intervals:
        return []
    intervals = sort_intervals(intervals)
    merged = [intervals[0][:]]
    for start, end in intervals[1:]:
        last = merged[-1]
        if start <= last[1]:
            last[1] = max(last[1], end)
        else:
            merged.append([start, end])
    return merged


def intervals_overlap_strict(a_start: int, a_end: int, b_start: int, b_end: int) -> bool:
    """True only for real overlap (adjacent is NOT overlap).
    Useful for calendar-style conflict detection from past tests.
    Time: O(1), Space: O(1).
    """
    return a_start < b_end and b_start < a_end


def custom_sort_strings(nums_as_str: list[str]) -> list[str]:
    """Example custom comparator (largest-number style).
    Time: O(n log n * k), Space: O(n).
    """

    def cmp(x: str, y: str) -> int:
        if x + y > y + x:
            return -1
        if x + y < y + x:
            return 1
        return 0

    return sorted(nums_as_str, key=cmp_to_key(cmp))


def bit_is_set(x: int, i: int) -> bool:
    """Check if i-th bit is 1.
    Time: O(1), Space: O(1).
    """
    return (x >> i) & 1 == 1


def bit_set(x: int, i: int) -> int:
    """Set i-th bit to 1.
    Time: O(1), Space: O(1).
    """
    return x | (1 << i)


def bit_clear(x: int, i: int) -> int:
    """Set i-th bit to 0.
    Time: O(1), Space: O(1).
    """
    return x & ~(1 << i)


def bit_count_ones(x: int) -> int:
    """Count set bits.
    Time: O(1) built-in / O(log x) conceptually, Space: O(1).
    """
    return x.bit_count()


def python_fast_tricks_demo(nums: list[int]) -> dict[str, object]:
    """Quick Python helpers for interviews.
    Time: mostly O(n), Space: varies.
    """
    return {
        "prefix_sums": list(accumulate(nums)),
        "all_pairs": list(combinations(nums, 2)),
        "all_orders_len3": list(permutations(nums[:3])),
        "sorted_desc": sorted(nums, reverse=True),
        "dedup_keep_order": list(dict.fromkeys(nums)),
    }

# hashmaps_sets.py
from collections import Counter, defaultdict


def frequency_map(nums: list[int]) -> dict[int, int]:
    """Count frequencies.
    Idea: Counter shortcut.
    Time: O(n), Space: O(k unique).
    """
    return dict(Counter(nums))


def group_anagrams(words: list[str]) -> list[list[str]]:
    """Group anagrams together.
    Idea: 26-char count tuple as hashmap key.
    Time: O(n * m), Space: O(n*m).
    """
    groups = defaultdict(list)
    for word in words:
        key = [0] * 26
        for ch in word:
            key[ord(ch) - ord("a")] += 1
        groups[tuple(key)].append(word)
    return list(groups.values())


def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    """Return indices of pair summing to target.
    Idea: store value->index while iterating.
    Time: O(n), Space: O(n).
    """
    seen = {}
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return seen[need], i
        seen[x] = i
    return None


def contains_duplicate(nums: list[int]) -> bool:
    """Check if any duplicate exists.
    Idea: compare set size with list size.
    Time: O(n), Space: O(n).
    """
    return len(set(nums)) != len(nums)


def subarray_sum_equals_k(nums: list[int], k: int) -> int:
    """Count subarrays with sum exactly k.
    Idea: prefix sum + hashmap counts.
    Time: O(n), Space: O(n).
    """
    count = 0
    prefix = 0
    seen = {0: 1}
    for x in nums:
        prefix += x
        count += seen.get(prefix - k, 0)
        seen[prefix] = seen.get(prefix, 0) + 1
    return count


def longest_consecutive(nums: list[int]) -> int:
    """Length of longest consecutive sequence.
    Idea: start only from sequence heads (x-1 not present).
    Time: O(n), Space: O(n).
    """
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:
            length = 1
            while x + length in s:
                length += 1
            best = max(best, length)
    return best

# binary_search.py


def binary_search_exact(nums: list[int], target: int) -> int:
    """Return index of target in sorted nums, else -1.
    Idea: standard binary search.
    Time: O(log n), Space: O(1).
    """
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


def lower_bound(nums: list[int], target: int) -> int:
    """First index i where nums[i] >= target.
    Time: O(log n), Space: O(1).
    """
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo


def upper_bound(nums: list[int], target: int) -> int:
    """First index i where nums[i] > target.
    Time: O(log n), Space: O(1).
    """
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] <= target:
            lo = mid + 1
        else:
            hi = mid
    return lo


def first_last_position(nums: list[int], target: int) -> tuple[int, int]:
    """Find first and last occurrence of target.
    Idea: lower_bound(target), lower_bound(target+1)-1.
    Time: O(log n), Space: O(1).
    """
    left = lower_bound(nums, target)
    if left == len(nums) or nums[left] != target:
        return -1, -1
    right = upper_bound(nums, target) - 1
    return left, right


def search_rotated_sorted(nums: list[int], target: int) -> int:
    """Search target in rotated sorted array (distinct nums).
    Idea: one half always sorted; choose side by range check.
    Time: O(log n), Space: O(1).
    """
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1


def binary_search_answer_space(lo: int, hi: int, feasible) -> int:
    """Minimum feasible answer in [lo, hi].
    Idea: binary search on answer domain with monotonic feasible().
    Time: O(log(hi-lo+1) * feasible), Space: O(1).
    """
    ans = hi
    while lo <= hi:
        mid = (lo + hi) // 2
        if feasible(mid):
            ans = mid
            hi = mid - 1
        else:
            lo = mid + 1
    return ans

# heaps_priority_queue.py
import heapq
from collections import Counter


def kth_largest(nums: list[int], k: int) -> int:
    """Return kth largest element.
    Idea: maintain min-heap of size k.
    Time: O(n log k), Space: O(k).
    """
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]


def top_k_frequent(nums: list[int], k: int) -> list[int]:
    """Return k most frequent values.
    Idea: frequency map + nlargest on (freq, value).
    Time: O(n log k), Space: O(n).
    """
    freq = Counter(nums)
    return [x for x, _ in heapq.nlargest(k, freq.items(), key=lambda item: item[1])]


def merge_k_sorted_lists(lists: list[list[int]]) -> list[int]:
    """Merge k sorted arrays.
    Idea: push first item from each list, pop/push heap.
    Time: O(N log k), Space: O(k).
    """
    heap = []
    out = []
    for i, arr in enumerate(lists):
        if arr:
            heapq.heappush(heap, (arr[0], i, 0))
    while heap:
        val, list_i, idx = heapq.heappop(heap)
        out.append(val)
        nxt = idx + 1
        if nxt < len(lists[list_i]):
            heapq.heappush(heap, (lists[list_i][nxt], list_i, nxt))
    return out


class MedianFinder:
    """Online median data structure.
    Idea: max-heap (lower half) + min-heap (upper half).
    add_num: O(log n), find_median: O(1), Space: O(n).
    """

    def __init__(self):
        self.low = []   # max-heap via negative values
        self.high = []  # min-heap

    def add_num(self, num: int) -> None:
        if not self.low or num <= -self.low[0]:
            heapq.heappush(self.low, -num)
        else:
            heapq.heappush(self.high, num)

        if len(self.low) > len(self.high) + 1:
            heapq.heappush(self.high, -heapq.heappop(self.low))
        elif len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def find_median(self) -> float:
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2.0

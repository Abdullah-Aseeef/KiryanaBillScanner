# python_quick_ref.py
"""
PYTHON SYNTAX + QUICK OPS (coding-test lookup)
(Concise examples only; no algorithm templates)
"""

# =========================
# 1) BASIC SYNTAX
# =========================

# if / elif / else
x = 7
if x > 10:
    status = "big"
elif x == 10:
    status = "ten"
else:
    status = "small"

# loops
loop_vals = []
for i in range(5):
    loop_vals.append(i)

chars = []
for ch in "abc":
    chars.append(ch)

i = 0
while_vals = []
while i < 3:
    while_vals.append(i)
    i += 1

# list comprehensions
squares = [n * n for n in range(6)]                 # [0,1,4,9,16,25]
evens = [n for n in range(10) if n % 2 == 0]        # [0,2,4,6,8]
grid = [[0 for _ in range(3)] for _ in range(2)]    # 2x3 matrix

# functions: defaults, *args, **kwargs
def add(a, b=0):
    return a + b

def total(*args):
    return sum(args)

def show(**kwargs):
    return kwargs

def mix(a, b=1, *args, mode="x", **kwargs):
    return a, b, args, mode, kwargs

# lambda
inc = lambda n: n + 1
pairs = [("a", 3), ("b", 1)]
pairs_sorted = sorted(pairs, key=lambda p: p[1])


# =========================
# 2) LISTS
# =========================

arr = [10, 20, 30, 40, 50]

# creation / slicing / reversing
empty = []
copy1 = arr[:]                       # shallow copy
mid = arr[1:4]                       # [20,30,40]
step = arr[::2]                      # [10,30,50]
rev1 = arr[::-1]                     # reversed copy
arr.reverse()                        # in-place reverse

# append vs extend vs insert
a = [1, 2]
a.append(3)                          # [1,2,3]
a.extend([4, 5])                     # [1,2,3,4,5]
a.insert(1, 99)                      # [1,99,2,3,4,5]

# removing
b = [1, 2, 3, 2]
b.pop()                              # removes last
b.pop(1)                             # removes by index
b.remove(2)                          # removes first matching value
del b[0]                             # delete by index
b.clear()                            # remove all

# sorting
nums = [5, 2, 9, 1]
nums.sort()                          # in-place ascending
nums.sort(reverse=True)              # in-place descending
words = ["aaa", "b", "cc"]
words_sorted = sorted(words, key=len)  # new list by length
items = [{"n": "a", "s": 3}, {"n": "b", "s": 1}]
items.sort(key=lambda d: (d["s"], d["n"]))

# common one-liners
flatten = [x for row in [[1, 2], [3, 4]] for x in row]   # [1,2,3,4]
unique_keep_order = list(dict.fromkeys([3, 1, 3, 2]))    # [3,1,2]
freq = {x: [1, 1, 2, 2, 2].count(x) for x in {1, 2}}


# =========================
# 3) TUPLES
# =========================

t = (1, 2, 3)
single = (5,)                        # trailing comma required

# unpacking
a1, b1, c1 = t
head, *mid, tail = (10, 20, 30, 40)

# swapping
x, y = 1, 2
x, y = y, x


# =========================
# 4) DICTIONARIES
# =========================

d = {"a": 1, "b": 2}

# get / setdefault / update
v1 = d.get("a", 0)                  # 1
v2 = d.get("z", 0)                  # 0 (no KeyError)
d.setdefault("c", 10)               # adds c if absent
d.setdefault("a", 99)               # keeps existing a=1

d.update({"a": 100, "d": 4})      # merge/update

# iterate
dict_keys = []
for k in d:
    dict_keys.append(k)
dict_values = []
for v in d.values():
    dict_values.append(v)
dict_items = []
for k, v in d.items():
    dict_items.append((k, v))

# defaultdict
from collections import defaultdict

groups = defaultdict(list)
groups["x"].append(1)
counts = defaultdict(int)
counts["apple"] += 1


# =========================
# 5) SETS
# =========================

s = {1, 2, 3}
s.add(4)
s.remove(2)                          # KeyError if missing
s.discard(99)                        # safe if missing

u = {1, 2, 3}
v = {3, 4, 5}
union1 = u | v                       # {1,2,3,4,5}
inter1 = u & v                       # {3}
diff1 = u - v                        # {1,2}
sym1 = u ^ v                         # {1,2,4,5}


# =========================
# 6) STRINGS
# =========================

st = "Hello World"

# slicing / split / join
a = st[:5]                           # "Hello"
b = st[::-1]                         # reverse
parts = "a,b,c".split(",")            # ["a","b","c"]
line = "  x y  ".split()              # ["x","y"]
joined = "-".join(["a", "b", "c"])   # "a-b-c"

# common methods
is_digit = "123".isdigit()            # True
is_alpha = "abc".isalpha()            # True
is_alnum = "abc123".isalnum()         # True
lowered = "ABC".lower()               # "abc"
uppered = "abc".upper()               # "ABC"
stripped = "  hi  ".strip()           # "hi"
starts = "hello".startswith("he")     # True
ends = "hello".endswith("lo")         # True
replaced = "banana".replace("a", "A")  # "bAnAnA"
idx = "abc".find("b")                # 1 (-1 if not found)


# =========================
# 7) ASSERTIONS & DEBUGGING
# =========================

assert 2 + 2 == 4
assert x > 0, f"x must be positive, got {x}"

def dbg(name, value):
    print(f"[DEBUG] {name}={value!r}")

# usage: dbg("arr", arr)


# =========================
# 8) USEFUL BUILT-INS
# =========================

nums = [10, 20, 30]

enum_pairs = []
for i, v in enumerate(nums):
    enum_pairs.append((i, v))
enum_pairs_1 = []
for i, v in enumerate(nums, start=1):
    enum_pairs_1.append((i, v))

z = list(zip([1, 2], ["a", "b"]))   # [(1,'a'), (2,'b')]

mapped = [x * 2 for x in [1, 2, 3]]                    # [2,4,6]
filtered = list(filter(lambda x: x % 2 == 0, [1, 2, 3, 4]))  # [2,4]

sorted_nums = sorted([3, 1, 2])
any_true = any([0, "", 5])            # True
all_true = all([1, True, 3 > 1])       # True


# =========================
# 9) COMMON LIBRARIES
# =========================

# collections
from collections import Counter, defaultdict, deque

c = Counter("aabccc")                  # {'c':3,'a':2,'b':1}
most_common_2 = c.most_common(2)

dd = defaultdict(int)
dd["k"] += 1

q = deque([1, 2, 3])
q.append(4)
q.appendleft(0)
q.pop()
q.popleft()

# heapq (min-heap)
import heapq

h = []
heapq.heappush(h, 3)
heapq.heappush(h, 1)
heapq.heappush(h, 2)
smallest = heapq.heappop(h)            # 1
peek = h[0]                            # current min
largest3 = heapq.nlargest(3, [5, 1, 9, 2])
smallest3 = heapq.nsmallest(3, [5, 1, 9, 2])

# itertools
from itertools import accumulate, combinations, permutations, product

pref = list(accumulate([1, 2, 3]))     # [1,3,6]
comb = list(combinations([1, 2, 3], 2))
perm = list(permutations([1, 2, 3], 2))
cart = list(product([1, 2], ["a", "b"]))


# =========================
# 10) INPUT / OUTPUT
# =========================

# fast input setup
import sys
input = sys.stdin.readline

io_examples = {
    "one_int": "n = int(input().strip())",
    "many_ints": "arr = list(map(int, input().split()))",
    "two_ints": "a, b = map(int, input().split())",
    "t_cases": "t = int(input()); for _ in range(t): x, y = map(int, input().split())",
    "token_stream": "data = sys.stdin.buffer.read().split(); it = iter(data)",
    "print_list": "print(*arr)",
    "write_lines": "sys.stdout.write('\\n'.join(map(str, arr)))",
}

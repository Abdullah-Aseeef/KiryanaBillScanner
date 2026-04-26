"""Solution for version_4/q1.py"""


def matrix_multiply(a: list[list[int]], b: list[list[int]]) -> list[list[int]]:
    """Multiply two matrices and return the resulting matrix."""
    m, n, p = len(a), len(a[0]), len(b[0])
    result = [[0] * p for _ in range(m)]

    for i in range(m):
        for k in range(n):
            if a[i][k] == 0:
                continue
            for j in range(p):
                result[i][j] += a[i][k] * b[k][j]

    return result

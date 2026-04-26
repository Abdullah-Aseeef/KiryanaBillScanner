"""
Question #1: Warm up

Suggested time: 15 min

HOW MATRIX MULTIPLICATION WORKS:
Given matrix a of dimensions m x n and matrix b of dimensions n x p,
the result is an m x p matrix. Each element is the dot product of a
row from a and a column from b:

    result[i][j] = sum of a[i][k] * b[k][j] for k in 0..n-1

Visual example (2x2 times 2x2):

    a = [[1, 2],      b = [[5, 6],
         [3, 4]]           [7, 8]]

To compute result[0][0]:  take row 0 of a and column 0 of b:
    (1*5) + (2*7) = 5 + 14 = 19

To compute result[0][1]:  take row 0 of a and column 1 of b:
    (1*6) + (2*8) = 6 + 16 = 22

To compute result[1][0]:  take row 1 of a and column 0 of b:
    (3*5) + (4*7) = 15 + 28 = 43

To compute result[1][1]:  take row 1 of a and column 1 of b:
    (3*6) + (4*8) = 18 + 32 = 50

Result: [[19, 22],
         [43, 50]]

Implementation hint: three nested loops -- over i (rows of a),
j (columns of b), and k (shared dimension).

Constraints / guarantees:
    - The dimensions are always compatible (a's column count equals
      b's row count).
    - Input is always valid.

Examples:
    >>> matrix_multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]])
    [[19, 22], [43, 50]]

    >>> matrix_multiply([[1, 2, 3]], [[4], [5], [6]])
    [[32]]

    >>> matrix_multiply([[2]], [[3]])
    [[6]]
"""


def matrix_multiply(a: list[list[int]], b: list[list[int]]) -> list[list[int]]:
    """Multiply two matrices and return the resulting matrix."""
    # TODO: Implement the function!
    return []


# You can test your function below if you like, but your final answer should be in the function above.

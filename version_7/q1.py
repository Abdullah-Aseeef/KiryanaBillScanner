"""
Question #1: Warm up

Suggested time: 15 min

WHAT IS A CLOCKWISE BORDER WALK?
Starting at the top-left corner, walk around the outer edge of the
matrix in clockwise order and collect each border element exactly
once.

For a 3x3 matrix, the visit order is:

    1 -> 2 -> 3
              |
              v
    8    .    4       ("." = interior, not visited)
    ^         |
    |         v
    7 <- 6 <- 5

    Result: [1, 2, 3, 4, 5, 6, 7, 8]

For a 3x2 matrix:        For a 1x3 matrix:    For a 3x1 matrix:
    1 -> 2                  1 -> 2 -> 3          1
         |                                       |
         v                  (single row:         v
    6    3                   just left to right) 2
    ^    |                                       |
    |    v                                       v
    5 <- 4                                       3

The four legs of the walk:
    1. Top row, left to right
    2. Right column, top+1 to bottom
    3. Bottom row, right-1 to left  (skip if only one row)
    4. Left column, bottom-1 to top+1  (skip if only one column)

Be careful not to double-count corners.

Constraints / guarantees:
    - The matrix is always at least 1x1.
    - Input is always valid.

Examples:
    >>> border_clockwise([[1, 2, 3],
    ...                   [4, 5, 6],
    ...                   [7, 8, 9]])
    [1, 2, 3, 6, 9, 8, 7, 4]

    >>> border_clockwise([[1, 2],
    ...                   [3, 4],
    ...                   [5, 6]])
    [1, 2, 4, 6, 5, 3]

    >>> border_clockwise([[1, 2, 3]])
    [1, 2, 3]

    >>> border_clockwise([[1], [2], [3]])
    [1, 2, 3]
"""


def border_clockwise(matrix: list[list[int]]) -> list[int]:
    """Return the border elements of a matrix in clockwise order."""
    rows = len(matrix)
    cols = len(matrix[0])

    if rows == 1:
        return list(matrix[0])
    if cols == 1:
        return [matrix[row][0] for row in range(rows)]

    result: list[int] = []

    for col in range(cols):
        result.append(matrix[0][col])

    for row in range(1, rows):
        result.append(matrix[row][cols - 1])

    for col in range(cols - 2, -1, -1):
        result.append(matrix[rows - 1][col])

    for row in range(rows - 2, 0, -1):
        result.append(matrix[row][0])

    return result


# You can test your function below if you like, but your final answer should be in the function above.

"""
Question #1: Warm up

Suggested time: 15 min

WHAT IS THE GAME OF LIFE?
It is a cellular automaton on a 2D grid where each cell is either
alive (1) or dead (0). Every cell has up to 8 neighbors:

    NW  N  NE          For cell X at (r, c), the neighbors are the
    W   X  E           cells at all combinations of (r-1, r, r+1)
    SW  S  SE          and (c-1, c, c+1), excluding (r, c) itself.

Cells outside the grid boundary are treated as dead (0).

RULES (applied to every cell to produce the next generation):
    - ALIVE cell (1):
        * Has 2 or 3 live neighbors -> stays alive (survives)
        * Otherwise                 -> dies (under/over-population)
    - DEAD cell (0):
        * Has exactly 3 live neighbors -> becomes alive (birth)
        * Otherwise                    -> stays dead

IMPORTANT -- "SIMULTANEOUS" UPDATE:
All cells are updated at the same time based on the ORIGINAL grid.
You must NOT use partially-updated values when computing neighbors.
Build a completely new grid for the result instead of modifying the
input in place.

Return a NEW grid of the same dimensions. Do not modify the input.

Constraints / guarantees:
    - The grid is always at least 1x1.
    - Every cell is 0 or 1.
    - Input is always valid.

Examples:
    >>> game_of_life_step([[0, 1, 0],
    ...                    [0, 0, 1],
    ...                    [1, 1, 1],
    ...                    [0, 0, 0]])
    [[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]]

    >>> game_of_life_step([[1]])
    [[0]]

    >>> game_of_life_step([[1, 1], [1, 1]])
    [[1, 1], [1, 1]]
"""


def game_of_life_step(grid: list[list[int]]) -> list[list[int]]:
    """Compute one step of Conway's Game of Life and return the new grid."""
    # TODO: Implement the function!
    return []


# You can test your function below if you like, but your final answer should be in the function above.

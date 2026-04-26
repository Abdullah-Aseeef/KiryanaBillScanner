"""Solution for version_5/q1.py"""


def game_of_life_step(grid: list[list[int]]) -> list[list[int]]:
    """Compute one step of Conway's Game of Life and return the new grid."""
    rows, cols = len(grid), len(grid[0])

    def count_live_neighbors(r: int, c: int) -> int:
        return sum(
            grid[nr][nc]
            for nr in range(max(0, r - 1), min(rows, r + 2))
            for nc in range(max(0, c - 1), min(cols, c + 2))
            if (nr, nc) != (r, c)
        )

    def next_cell(r: int, c: int) -> int:
        neighbors = count_live_neighbors(r, c)
        alive = grid[r][c] == 1
        return 1 if (alive and neighbors in (2, 3)) or (not alive and neighbors == 3) else 0

    return [[next_cell(r, c) for c in range(cols)] for r in range(rows)]

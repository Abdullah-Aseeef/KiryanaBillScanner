"""
Question #2: Debugging and testing

Suggested time: 30 min

Below is a game leaderboard system.  It takes a list of (player, score) entries,
sorts them by score in descending order, and assigns competition-style ranks.

Under standard competition ranking, players with the same score share a rank,
and the next distinct score receives a rank equal to its position in the list.
For example, two players tied at rank 1 means the next player is rank 3 (not 2).

EXPECTED OUTPUT:

    Leaderboard:
       1. Alice      100 pts
       1. Charlie    100 pts
       3. Bob         85 pts
       3. Eve         85 pts
       5. Diana       70 pts
       6. Frank       60 pts
       7. Grace       50 pts
       7. Hank        50 pts

    Top 3 (by rank):
      Alice (100), Charlie (100), Bob (85), Eve (85)

    Player summary – Eve: rank 3, score 85, top 37.5%

HOWEVER, the current output does not match the expected output!

Tasks
-----
1. Fix the bug so the code works as expected.
2. Write at least one assert in `test_ranking()` that fails before the
   fix, but passes after.
"""

from typing import NamedTuple


# ─── helper module ────────────────────────────────────────────────────


class Player(NamedTuple):
    """A player entry with a name and score."""
    name: str
    score: int


def assign_ranks(
    players: list[tuple[str, int]],
) -> list[tuple[str, int, int]]:
    """Sort players by score (descending) and assign competition ranks.

    Standard competition ranking: players with equal scores share the same
    rank, and the next rank reflects the total number of higher-ranked
    players.  For example, scores [100, 100, 90] produce ranks [1, 1, 3].

    Args:
        players: List of (name, score) tuples.

    Returns:
        List of (name, score, rank) tuples sorted by score descending.
    """
    sorted_players = sorted(players, key=lambda p: p[1], reverse=True)
    ranked: list[tuple[str, int, int]] = []
    for i, (name, score) in enumerate(sorted_players):
        rank = i + 1                        # BUG: ignores ties
        ranked.append((name, score, rank))
    return ranked


def format_leaderboard(ranked: list[tuple[str, int, int]]) -> str:
    """Return a neatly formatted leaderboard string.

    Args:
        ranked: List of (name, score, rank) tuples already sorted.

    Returns:
        A multi-line string with rank, name, and score aligned.
    """
    lines: list[str] = ["Leaderboard:"]
    for name, score, rank in ranked:
        lines.append(f"  {rank:>2}. {name:<10} {score:>3} pts")
    return "\n".join(lines)


def top_n(ranked: list[tuple[str, int, int]], n: int) -> list[tuple[str, int, int]]:
    """Return all players whose rank is <= n.

    Because of ties, this may return more than *n* entries.

    Args:
        ranked: The full ranked list.
        n:      The maximum rank to include.

    Returns:
        A list of (name, score, rank) tuples with rank <= n.
    """
    return [(name, score, rank) for name, score, rank in ranked if rank <= n]


def player_summary(ranked: list[tuple[str, int, int]], target: str) -> str:
    """Return a summary string for a specific player.

    Args:
        ranked: Full ranked list.
        target: Name of the player to summarise.

    Returns:
        A string like "rank 3, score 85, top 37.5%" or "not found".
    """
    total = len(ranked)
    for name, score, rank in ranked:
        if name == target:
            percentile = round(rank / total * 100, 1)
            return f"rank {rank}, score {score}, top {percentile}%"
    return "not found"


def leaderboard_stats(ranked: list[tuple[str, int, int]]) -> dict[str, float]:
    """Compute basic statistics for the leaderboard scores.

    Returns:
        Dict with keys 'mean', 'max', 'min'.
    """
    scores = [s for _, s, _ in ranked]
    return {
        "mean": round(sum(scores) / len(scores), 1),
        "max": max(scores),
        "min": min(scores),
    }


# ─── main code ────────────────────────────────────────────────────────


class Leaderboard:
    """A game leaderboard backed by assign_ranks."""

    def __init__(self, entries: list[tuple[str, int]]):
        self.entries = entries

    def ranked(self) -> list[tuple[str, int, int]]:
        """Return the full ranked list."""
        return assign_ranks(self.entries)

    def display(self) -> str:
        """Return a formatted leaderboard string."""
        return format_leaderboard(self.ranked())


PLAYERS = [
    ("Alice", 100),
    ("Bob", 85),
    ("Charlie", 100),
    ("Diana", 70),
    ("Eve", 85),
    ("Frank", 60),
    ("Grace", 50),
    ("Hank", 50),
]

if __name__ == "__main__":
    board = Leaderboard(PLAYERS)
    ranked = board.ranked()

    print(board.display())
    print()

    top3 = top_n(ranked, 3)
    top3_str = ", ".join(f"{n} ({s})" for n, s, _ in top3)
    print(f"Top 3 (by rank):\n  {top3_str}")
    print()

    summary = player_summary(ranked, "Eve")
    print(f"Player summary \u2013 Eve: {summary}")


# ─── stub test ────────────────────────────────────────────────────────
def test_ranking():
    """Add assert(s) that fail on the buggy code and pass after your fix."""
    raise NotImplementedError("Write at least one assert.")

"""Solution for version_4/q2.py"""

from typing import NamedTuple


class Player(NamedTuple):
    """A player entry with a name and score."""
    name: str
    score: int


def assign_ranks(
    players: list[tuple[str, int]],
) -> list[tuple[str, int, int]]:
    """Sort players by score (descending) and assign competition ranks."""
    sorted_players = sorted(players, key=lambda p: p[1], reverse=True)
    ranked: list[tuple[str, int, int]] = []

    prev_score = None
    prev_rank = 0
    for i, (name, score) in enumerate(sorted_players):
        if score == prev_score:
            rank = prev_rank
        else:
            rank = i + 1
            prev_score = score
            prev_rank = rank
        ranked.append((name, score, rank))

    return ranked


def format_leaderboard(ranked: list[tuple[str, int, int]]) -> str:
    lines: list[str] = ["Leaderboard:"]
    for name, score, rank in ranked:
        lines.append(f"  {rank:>2}. {name:<10} {score:>3} pts")
    return "\n".join(lines)


def top_n(ranked: list[tuple[str, int, int]], n: int) -> list[tuple[str, int, int]]:
    return [(name, score, rank) for name, score, rank in ranked if rank <= n]


def player_summary(ranked: list[tuple[str, int, int]], target: str) -> str:
    total = len(ranked)
    for name, score, rank in ranked:
        if name == target:
            percentile = round(rank / total * 100, 1)
            return f"rank {rank}, score {score}, top {percentile}%"
    return "not found"


def leaderboard_stats(ranked: list[tuple[str, int, int]]) -> dict[str, float]:
    scores = [s for _, s, _ in ranked]
    return {
        "mean": round(sum(scores) / len(scores), 1),
        "max": max(scores),
        "min": min(scores),
    }


class Leaderboard:
    def __init__(self, entries: list[tuple[str, int]]):
        self.entries = entries

    def ranked(self) -> list[tuple[str, int, int]]:
        return assign_ranks(self.entries)

    def display(self) -> str:
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


def test_ranking():
    ranked = assign_ranks(PLAYERS)

    by_name = {name: (score, rank) for name, score, rank in ranked}

    # This fails before fix (buggy code gives Bob/Eve rank 3 and 5 mismatch etc.)
    assert by_name["Alice"][1] == 1
    assert by_name["Charlie"][1] == 1
    assert by_name["Bob"][1] == 3
    assert by_name["Eve"][1] == 3
    assert by_name["Diana"][1] == 5

    top3 = top_n(ranked, 3)
    assert {name for name, _, _ in top3} == {"Alice", "Charlie", "Bob", "Eve"}


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
    print(f"Player summary – Eve: {summary}")

"""Solution for version_5/q2.py"""

from typing import NamedTuple


class Event(NamedTuple):
    """A calendar event with a name and time range in minutes since midnight."""
    name: str
    start: int
    end: int


def format_time(minutes: int) -> str:
    h, m = divmod(minutes, 60)
    return f"{h:02d}:{m:02d}"


def events_overlap(start1: int, end1: int, start2: int, end2: int) -> bool:
    """Return True if two half-open ranges [start, end) overlap."""
    return start1 < end2 and start2 < end1


def daily_schedule(events: list[Event]) -> str:
    sorted_events = sorted(events, key=lambda e: (e.start, e.end))
    lines: list[str] = []
    for ev in sorted_events:
        lines.append(f"  {format_time(ev.start)}-{format_time(ev.end)}  {ev.name}")
    return "\n".join(lines)


def find_free_slots(events: list[Event], day_start: int, day_end: int) -> list[tuple[int, int]]:
    sorted_events = sorted(events, key=lambda e: e.start)
    free: list[tuple[int, int]] = []
    current = day_start
    for ev in sorted_events:
        if ev.start > current:
            free.append((current, ev.start))
        current = max(current, ev.end)
    if current < day_end:
        free.append((current, day_end))
    return free


class Calendar:
    """A daily calendar that detects scheduling conflicts."""

    def __init__(self, events: list[Event]):
        self.events = events

    def find_conflicts(self) -> list[tuple[Event, Event]]:
        conflicts: list[tuple[Event, Event]] = []
        for i in range(len(self.events)):
            for j in range(i + 1, len(self.events)):
                a, b = self.events[i], self.events[j]
                if events_overlap(a.start, a.end, b.start, b.end):
                    conflicts.append((a, b))
        return conflicts

    def event_count(self) -> int:
        return len(self.events)


EVENTS = [
    Event("Morning Review", 480, 510),
    Event("Team Standup", 540, 570),
    Event("Code Review", 555, 585),
    Event("Sprint Planning", 600, 630),
    Event("Lunch Break", 720, 780),
    Event("Design Review", 780, 840),
    Event("1:1 with Manager", 900, 930),
    Event("Tea Break", 930, 960),
]


def test_calendar():
    # Fails before fix because buggy <= treated adjacency as overlap.
    assert events_overlap(540, 570, 555, 585) is True
    assert events_overlap(780, 840, 840, 900) is False

    cal = Calendar(EVENTS)
    conflicts = cal.find_conflicts()
    assert len(conflicts) == 1
    a, b = conflicts[0]
    assert {a.name, b.name} == {"Team Standup", "Code Review"}


if __name__ == "__main__":
    cal = Calendar(EVENTS)
    test_calendar()
    print("Assertions passed.")

    print("Daily schedule:")
    print(daily_schedule(EVENTS))
    print()

    conflicts = cal.find_conflicts()
    assert len(conflicts) == 1
    print("Conflicts:")
    if not conflicts:
        print("  (none)")
    for a, b in conflicts:
        print(
            f"  {a.name} ({format_time(a.start)}-{format_time(a.end)}) vs "
            f"{b.name} ({format_time(b.start)}-{format_time(b.end)})"
        )
    print()

    free = find_free_slots(EVENTS, day_start=480, day_end=1020)
    assert free == [(510, 540), (585, 600), (630, 720), (840, 900), (960, 1020)]
    free_str = ", ".join(f"{format_time(s)}-{format_time(e)}" for s, e in free)
    print(f"Free slots (08:00-17:00):\n  {free_str}")

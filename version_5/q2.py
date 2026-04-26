"""
Question #2: Debugging and testing

Suggested time: 30 min

Below is a calendar conflict-detection system.  Each event has a name, a start
time, and an end time (integers representing minutes since midnight).

The system finds all pairs of events whose time ranges overlap.  Events that
are exactly adjacent (one ends at the same minute the other starts) do NOT
conflict -- they simply share a boundary.

EXPECTED OUTPUT:

    Daily schedule:
      08:00-08:30  Morning Review
      09:00-09:30  Team Standup
      09:15-09:45  Code Review
      10:00-10:30  Sprint Planning
      12:00-13:00  Lunch Break
      13:00-14:00  Design Review
      15:00-15:30  1:1 with Manager
      15:30-16:00  Tea Break

    Conflicts:
      Team Standup (09:00-09:30) vs Code Review (09:15-09:45)

    Free slots (08:00-17:00):
      08:30-09:00, 09:45-10:00, 10:30-12:00, 14:00-15:00, 16:00-17:00

HOWEVER, the current output does not match the expected output!

Tasks
-----
1. Fix the bug so the code works as expected.
2. Write at least one assert in `test_calendar()` that fails before the
   fix, but passes after.
"""

from typing import NamedTuple


# ─── helper module ────────────────────────────────────────────────────


class Event(NamedTuple):
    """A calendar event with a name and time range in minutes since midnight."""
    name: str
    start: int  # minutes since midnight
    end: int


def format_time(minutes: int) -> str:
    """Convert minutes since midnight to HH:MM format.

    Args:
        minutes: Number of minutes since midnight (0-1439).

    Returns:
        A string in HH:MM format, e.g. 540 -> '09:00'.
    """
    h, m = divmod(minutes, 60)
    return f"{h:02d}:{m:02d}"


def events_overlap(start1: int, end1: int, start2: int, end2: int) -> bool:
    """Return True if two time ranges overlap.

    Two events overlap when they share at least one moment in common.
    Events that are exactly adjacent (one ends precisely when the other
    starts) do **not** overlap.

    Args:
        start1, end1: Start and end of the first event.
        start2, end2: Start and end of the second event.

    Returns:
        True if the events overlap, False otherwise.
    """
    return start1 <= end2 and start2 <= end1   # BUG: should be < not <=


def daily_schedule(events: list[Event]) -> str:
    """Return a formatted string showing all events sorted by start time.

    Args:
        events: Unsorted list of events.

    Returns:
        Multi-line string with one event per line, time-range and name.
    """
    sorted_events = sorted(events, key=lambda e: (e.start, e.end))
    lines: list[str] = []
    for ev in sorted_events:
        lines.append(f"  {format_time(ev.start)}-{format_time(ev.end)}  {ev.name}")
    return "\n".join(lines)


def find_free_slots(events: list[Event], day_start: int, day_end: int) -> list[tuple[int, int]]:
    """Find free time slots in a day not covered by any event.

    Args:
        events:    List of events (may be unsorted).
        day_start: Start of the working day (minutes since midnight).
        day_end:   End of the working day (minutes since midnight).

    Returns:
        Sorted list of (start, end) tuples for each free slot.
    """
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


# ─── main code ────────────────────────────────────────────────────────


class Calendar:
    """A daily calendar that detects scheduling conflicts."""

    def __init__(self, events: list[Event]):
        self.events = events

    def find_conflicts(self) -> list[tuple[Event, Event]]:
        """Return pairs of events that overlap in time."""
        conflicts: list[tuple[Event, Event]] = []
        for i in range(len(self.events)):
            for j in range(i + 1, len(self.events)):
                a, b = self.events[i], self.events[j]
                if events_overlap(a.start, a.end, b.start, b.end):
                    conflicts.append((a, b))
        return conflicts

    def event_count(self) -> int:
        """Return the total number of events."""
        return len(self.events)


EVENTS = [
    Event("Morning Review", 480, 510),     # 08:00 - 08:30
    Event("Team Standup", 540, 570),       # 09:00 - 09:30
    Event("Code Review", 555, 585),        # 09:15 - 09:45  (overlaps standup)
    Event("Sprint Planning", 600, 630),    # 10:00 - 10:30
    Event("Lunch Break", 720, 780),        # 12:00 - 13:00
    Event("Design Review", 780, 840),      # 13:00 - 14:00  (adjacent, NOT conflict)
    Event("1:1 with Manager", 900, 930),   # 15:00 - 15:30
    Event("Tea Break", 930, 960),          # 15:30 - 16:00  (adjacent, NOT conflict)
]

if __name__ == "__main__":
    cal = Calendar(EVENTS)

    print("Daily schedule:")
    print(daily_schedule(EVENTS))
    print()

    conflicts = cal.find_conflicts()
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
    free_str = ", ".join(f"{format_time(s)}-{format_time(e)}" for s, e in free)
    print(f"Free slots (08:00-17:00):\n  {free_str}")


# ─── stub test ────────────────────────────────────────────────────────
def test_calendar():
    """Add assert(s) that fail on the buggy code and pass after your fix."""
    raise NotImplementedError("Write at least one assert.")

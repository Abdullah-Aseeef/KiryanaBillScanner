# oop_state_patterns.py
"""
Patterns prioritized from past Tajir tests:
1) Versioned key-value store with rollback
2) Dependency-aware task manager
"""

TASK_NOT_FOUND = "task not found"


class VersionedStoreLite:
    """Key-value store with immutable snapshots per version.
    Idea: keep dict snapshots in history list; simple and reliable in timed tests.
    put/delete/rollback: O(k) due to dict copy, get/get_at: O(1), Space: O(total snapshot size).
    """

    def __init__(self):
        self._history = [{}]  # version 0

    def current_version(self) -> int:
        return len(self._history) - 1

    def _cur(self) -> dict:
        return self._history[-1]

    def put(self, key: str, value):
        if not key:
            raise ValueError("key must be non-empty")
        state = self._cur().copy()
        state[key] = value
        self._history.append(state)
        return self.current_version()

    def get(self, key: str):
        return self._cur().get(key)

    def delete(self, key: str) -> bool:
        if key not in self._cur():
            return False
        state = self._cur().copy()
        state.pop(key)
        self._history.append(state)
        return True

    def get_at_version(self, key: str, version: int):
        if not (0 <= version <= self.current_version()):
            raise ValueError("invalid version")
        return self._history[version].get(key)

    def rollback(self, version: int) -> None:
        if not (0 <= version <= self.current_version()):
            raise ValueError("invalid version")
        self._history.append(self._history[version].copy())

    def __len__(self):
        return len(self._cur())


class TaskManagerLite:
    """Task manager with dependencies.
    Idea: status dict + dependency sets + reverse deps for safe deletion checks.
    Most ops: O(1) average updates, ready_tasks O(n log n) due to sort.
    """

    def __init__(self):
        self.status = {}  # task -> 'pending' | 'completed'
        self.deps = {}    # task -> set(prerequisites)
        self.rev = {}     # prerequisite -> set(tasks depending on it)

    def add_task(self, name: str) -> None:
        if not name or name in self.status:
            raise ValueError("invalid or duplicate task")
        self.status[name] = "pending"
        self.deps[name] = set()
        self.rev[name] = set()

    def add_dependency(self, task: str, depends_on: str) -> None:
        if task not in self.status or depends_on not in self.status:
            raise KeyError(TASK_NOT_FOUND)
        if task == depends_on:
            raise ValueError("self dependency not allowed")
        if depends_on not in self.deps[task]:
            self.deps[task].add(depends_on)
            self.rev[depends_on].add(task)

    def complete(self, task: str) -> None:
        if task not in self.status:
            raise KeyError(TASK_NOT_FOUND)
        if self.status[task] == "completed":
            raise ValueError("already completed")
        for pre in self.deps[task]:
            if self.status[pre] != "completed":
                raise ValueError("dependencies not completed")
        self.status[task] = "completed"

    def ready_tasks(self) -> list[str]:
        ready = []
        for task, st in self.status.items():
            if st == "pending" and all(self.status[p] == "completed" for p in self.deps[task]):
                ready.append(task)
        return sorted(ready)

    def remove_task(self, task: str) -> None:
        if task not in self.status:
            raise KeyError(TASK_NOT_FOUND)

        if self.status[task] == "pending":
            blocked = [t for t in self.rev[task] if self.status[t] == "pending"]
            if blocked:
                raise ValueError("pending tasks depend on this task")

        for pre in self.deps[task]:
            self.rev[pre].discard(task)
        for dep in self.rev[task]:
            self.deps[dep].discard(task)

        self.deps.pop(task)
        self.rev.pop(task)
        self.status.pop(task)

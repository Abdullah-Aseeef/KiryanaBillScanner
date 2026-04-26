"""Solution for version_5/q3.py"""

from typing import List

TASK_NOT_FOUND = "task does not exist"


class TaskManager:
    """A task tracker with dependency management."""

    def __init__(self):
        """Create an empty task manager."""
        self._status: dict[str, str] = {}
        self._deps: dict[str, set[str]] = {}
        self._reverse: dict[str, set[str]] = {}

    def __len__(self) -> int:
        """Return the total number of tasks (pending + completed)."""
        return len(self._status)

    def add_task(self, name: str) -> None:
        """Add a new pending task."""
        if not name:
            raise ValueError("task name must be non-empty")
        if name in self._status:
            raise ValueError("task already exists")

        self._status[name] = "pending"
        self._deps[name] = set()
        self._reverse[name] = set()

    def add_dependency(self, task: str, depends_on: str) -> None:
        """Declare that *task* depends on *depends_on*."""
        if task not in self._status or depends_on not in self._status:
            raise KeyError(TASK_NOT_FOUND)
        if task == depends_on:
            raise ValueError("self-dependency is not allowed")

        if depends_on in self._deps[task]:
            return
        self._deps[task].add(depends_on)
        self._reverse[depends_on].add(task)

    def complete(self, task: str) -> None:
        """Mark a task as completed."""
        if task not in self._status:
            raise KeyError(TASK_NOT_FOUND)
        if self._status[task] == "completed":
            raise ValueError("task is already completed")

        for dep in self._deps[task]:
            if self._status[dep] != "completed":
                raise ValueError("task has uncompleted dependencies")

        self._status[task] = "completed"

    def ready_tasks(self) -> List[str]:
        """Return all pending tasks whose dependencies are all completed."""
        ready: list[str] = []
        for task, state in self._status.items():
            if state != "pending":
                continue
            if all(self._status[dep] == "completed" for dep in self._deps[task]):
                ready.append(task)
        return sorted(ready)

    def status(self, task: str) -> str:
        """Return the status of a task."""
        if task not in self._status:
            raise KeyError(TASK_NOT_FOUND)
        return self._status[task]

    def remove_task(self, task: str) -> None:
        """Remove a task from the manager."""
        if task not in self._status:
            raise KeyError(TASK_NOT_FOUND)

        if self._status[task] == "pending":
            for dependent in self._reverse[task]:
                if self._status[dependent] == "pending":
                    raise ValueError("pending tasks still depend on this task")

        for dep in self._deps[task]:
            self._reverse[dep].discard(task)

        for dependent in self._reverse[task]:
            self._deps[dependent].discard(task)

        del self._deps[task]
        del self._reverse[task]
        del self._status[task]

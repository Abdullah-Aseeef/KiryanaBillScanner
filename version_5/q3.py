"""
Question #3: OOP & data structures

Suggested time: 45 minutes

In this question, you will implement a **TaskManager** — a task tracker that
supports dependencies between tasks.

Each task has a unique name and is either "pending" or "completed". A task may
depend on other tasks, meaning it cannot be completed until all of its
dependencies have been completed first.

Dependencies are declared with add_dependency(task, depends_on), which means
*task* cannot be completed until *depends_on* is completed. A task may have
multiple dependencies, and multiple tasks may depend on the same task.
Self-dependencies (a task depending on itself) are not allowed.

A task is considered "ready" if it is still pending and ALL of its dependencies
are completed. The ready_tasks() method returns all such tasks sorted
alphabetically.

Removing a task also removes it as a dependency from other tasks. However, a
pending task cannot be removed if other pending tasks still depend on it (since
those tasks would lose a dependency they still need). A completed task can
always be removed since its dependents have already had that dependency
satisfied.

It is up to you to decide what data structure(s) to use!

Please implement all methods in the class.

Example usage:
    >>> tm = TaskManager()
    >>> tm.add_task("Write tests")
    >>> tm.add_task("Write code")
    >>> tm.add_task("Code review")
    >>> tm.add_dependency("Code review", "Write code")
    >>> tm.add_dependency("Code review", "Write tests")
    >>> tm.ready_tasks()
    ['Write code', 'Write tests']
    >>> tm.complete("Write code")
    >>> tm.ready_tasks()
    ['Write tests']
    >>> tm.complete("Write tests")
    >>> tm.ready_tasks()
    ['Code review']
    >>> tm.status("Write code")
    'completed'

Circular dependencies will not be tested — you do not need to detect cycles.
"""

from typing import List


class TaskManager:
    """A task tracker with dependency management.

    Tasks are identified by unique names and are either pending or
    completed. Dependencies enforce ordering: a task cannot be completed
    until all tasks it depends on are completed. Ready tasks are those
    that are pending with all dependencies satisfied.
    """

    # ------------------------------------------------------------------
    # Construction & basic properties
    # ------------------------------------------------------------------
    def __init__(self):
        """Create an empty task manager."""
        # TODO: Implement!

    def __len__(self) -> int:
        """Return the total number of tasks (pending + completed)."""
        return 0  # TODO: Implement!

    # ------------------------------------------------------------------
    # Core API
    # ------------------------------------------------------------------
    def add_task(self, name: str) -> None:
        """Add a new pending task.

        Args:
            name: The task name. Must be non-empty.

        Raises:
            ValueError: If name is empty or a task with that name
                        already exists.
        """
        # TODO: Implement!

    def add_dependency(self, task: str, depends_on: str) -> None:
        """Declare that *task* depends on *depends_on*.

        After this call, *task* cannot be completed until *depends_on*
        is completed. If this dependency already exists, the call is
        silently ignored.

        A dependency may be added even if *task* or *depends_on* is
        already completed. (The dependency is recorded but has no
        practical effect if both are already completed.)

        Args:
            task: The name of the dependent task.
            depends_on: The name of the prerequisite task.

        Raises:
            KeyError: If either task does not exist.
            ValueError: If task == depends_on (self-dependency).
        """
        # TODO: Implement!

    def complete(self, task: str) -> None:
        """Mark a task as completed.

        A task can only be completed if all of its dependencies have
        already been completed.

        Args:
            task: The name of the task to complete.

        Raises:
            KeyError: If the task does not exist.
            ValueError: If the task has uncompleted dependencies, or
                        if the task is already completed.
        """
        # TODO: Implement!

    def ready_tasks(self) -> List[str]:
        """Return all pending tasks whose dependencies are all completed.

        Returns:
            A sorted list (alphabetically) of task names that are pending
            and have all dependencies satisfied.
        """
        return []  # TODO: Implement!

    # ------------------------------------------------------------------
    # Introspection & maintenance
    # ------------------------------------------------------------------
    def status(self, task: str) -> str:
        """Return the status of a task.

        Args:
            task: The name of the task.

        Returns:
            "pending" or "completed".

        Raises:
            KeyError: If the task does not exist.
        """
        return ""  # TODO: Implement!

    def remove_task(self, task: str) -> None:
        """Remove a task from the manager.

        The task is also removed as a dependency from all other tasks.
        However, a pending task cannot be removed if other pending tasks
        still depend on it, since those tasks would lose a required
        dependency. Completed tasks can always be removed.

        Args:
            task: The name of the task to remove.

        Raises:
            KeyError: If the task does not exist.
            ValueError: If the task is pending and other pending tasks
                        depend on it.
        """
        # TODO: Implement!

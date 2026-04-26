"""
Question #3: OOP & data structures

Suggested time: 45 minutes

In this question, you will implement a **VersionedStore** — a key-value store
that maintains a complete version history and supports rollback to any previous
state.

Every mutation (put or delete) increments the store's version number. The store
starts at version 0 with no keys. After the first put() call the version
becomes 1, after the second mutation it becomes 2, and so on.

Version history is preserved so that you can query the value of any key at any
past version. For example, if you put("x", 10) at version 1 and later
put("x", 20) at version 3, then get_at_version("x", 2) still returns 10.

Rollback restores the store to the exact state it had at a given version, but
this itself creates a **new** version (it does not erase history). For example,
if the current version is 5 and you rollback(2), the store's contents match
what they were at version 2, and the new current version becomes 6.

A delete() only increments the version if the key actually exists. If the key
does not exist, the store is unchanged and False is returned (no version bump).

It is up to you to decide what data structure(s) to use!

Please implement all methods in the class.

Example usage:
    >>> store = VersionedStore()
    >>> store.current_version()
    0
    >>> store.put("x", 10)            # version -> 1
    1
    >>> store.put("y", 20)            # version -> 2
    2
    >>> store.get("x")
    10
    >>> store.put("x", 30)            # version -> 3
    3
    >>> store.get_at_version("x", 1)
    10
    >>> store.get_at_version("x", 3)
    30
    >>> store.delete("y")             # version -> 4
    True
    >>> len(store)                    # only "x" remains
    1
    >>> store.rollback(2)             # restore to version 2 state, version -> 5
    >>> store.get("x")
    10
    >>> store.get("y")
    20
"""

from typing import Optional, Any


class VersionedStore:
    """A key-value store with full version history and rollback support.

    Every mutation increments the version counter. Historical state is
    preserved so that any key can be queried at any past version. Rollback
    restores a previous state as a new version without erasing history.
    """

    # ------------------------------------------------------------------
    # Construction & basic properties
    # ------------------------------------------------------------------
    def __init__(self):
        """Create an empty store at version 0."""
        # TODO: Implement!

    def __len__(self) -> int:
        """Return the number of keys in the store at the current version."""
        return 0  # TODO: Implement!

    # ------------------------------------------------------------------
    # Core API
    # ------------------------------------------------------------------
    def put(self, key: str, value: Any) -> int:
        """Set a key to a value, creating a new version.

        If the key already exists, its value is overwritten. A new
        version is always created, even if the new value is the same
        as the current value.

        Args:
            key: The key to set. Must be non-empty.
            value: The value to associate with the key. May be any
                   type, including None.

        Returns:
            The new version number after this operation.

        Raises:
            ValueError: If key is empty.
        """
        return 0  # TODO: Implement!

    def get(self, key: str) -> Optional[Any]:
        """Return the current value for a key, or None if not present.

        Args:
            key: The key to look up.

        Returns:
            The value associated with the key, or None if the key does
            not exist in the current version.

        Note: if a key was stored with value None, get() will return
        None — the same as for a missing key.
        """
        return None  # TODO: Implement!

    def delete(self, key: str) -> bool:
        """Delete a key from the store.

        If the key exists, it is removed and a new version is created.
        If the key does not exist, the store is unchanged.

        Args:
            key: The key to delete.

        Returns:
            True if the key existed and was deleted, False otherwise.
        """
        return False  # TODO: Implement!

    def get_at_version(self, key: str, version: int) -> Optional[Any]:
        """Return the value of a key at a specific historical version.

        Args:
            key: The key to look up.
            version: The version number to query. Must be in the range
                     [0, current_version].

        Returns:
            The value of the key at that version, or None if the key
            did not exist at that version.

        Raises:
            ValueError: If version is outside [0, current_version].
        """
        return None  # TODO: Implement!

    # ------------------------------------------------------------------
    # Introspection & maintenance
    # ------------------------------------------------------------------
    def current_version(self) -> int:
        """Return the current version number.

        Returns:
            The current version (0 if no mutations have occurred).
        """
        return 0  # TODO: Implement!

    def rollback(self, version: int) -> None:
        """Restore the store to the state it had at the given version.

        This always creates a new version whose contents match the target
        version. History is not erased -- the rollback itself is recorded
        as a new version. Rolling back to the current version still
        creates a new version (with identical contents). Rolling back to
        version 0 restores the empty state.

        Args:
            version: The version to roll back to. Must be in the range
                     [0, current_version].

        Raises:
            ValueError: If version is outside [0, current_version].
        """
        # TODO: Implement!

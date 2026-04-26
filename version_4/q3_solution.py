"""Solution for version_4/q3.py"""

from typing import Optional, Any


class VersionedStore:
    """A key-value store with full version history and rollback support."""

    def __init__(self):
        """Create an empty store at version 0."""
        self._history: list[dict[str, Any]] = [{}]  # index == version

    def __len__(self) -> int:
        """Return the number of keys in the store at the current version."""
        return len(self._history[-1])

    def put(self, key: str, value: Any) -> int:
        """Set a key to a value, creating a new version."""
        if not key:
            raise ValueError("key must be non-empty")

        state = self._history[-1].copy()
        state[key] = value
        self._history.append(state)
        return self.current_version()

    def get(self, key: str) -> Optional[Any]:
        """Return the current value for a key, or None if not present."""
        return self._history[-1].get(key)

    def delete(self, key: str) -> bool:
        """Delete a key from the store."""
        if key not in self._history[-1]:
            return False

        state = self._history[-1].copy()
        state.pop(key)
        self._history.append(state)
        return True

    def get_at_version(self, key: str, version: int) -> Optional[Any]:
        """Return the value of a key at a specific historical version."""
        if not (0 <= version <= self.current_version()):
            raise ValueError("version out of range")
        return self._history[version].get(key)

    def current_version(self) -> int:
        """Return the current version number."""
        return len(self._history) - 1

    def rollback(self, version: int) -> None:
        """Restore the store to the state it had at the given version."""
        if not (0 <= version <= self.current_version()):
            raise ValueError("version out of range")

        restored = self._history[version].copy()
        self._history.append(restored)

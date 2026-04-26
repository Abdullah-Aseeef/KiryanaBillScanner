"""
Question #2: Debugging and testing

Suggested time: 30 min

Below is a text-editor history system that supports undo and redo.

Key invariant: when the user performs a new action after undoing, the redo
history must be cleared.  Old undone actions should no longer be redoable
once a new action is taken (the timeline has diverged).

Sequence: do(Bold), do(Italic), do(Underline), undo(), undo(), do(Font Size),
          do(Indent), undo(), redo()

    After undo+undo: redo stack has [Italic, Underline]
    do(Font Size) should CLEAR the redo stack (timeline diverged)
    do(Indent) adds to undo stack
    undo() moves Indent to redo stack
    redo() gets Indent back

EXPECTED OUTPUT:

    History: [Bold, Font Size]
    Redo attempt after diverge: None
    Final actions: [Bold, Font Size, Indent]
    Final redo: None

    State snapshot:
      Undo stack: [Bold, Font Size, Indent]
      Redo stack: []

HOWEVER, the current output does not match the expected output!

Tasks
-----
1. Fix the bug so the code works as expected.
2. Write at least one assert in `test_history()` that fails before the
   fix, but passes after.
"""


# ─── helper module ────────────────────────────────────────────────────


class HistoryManager:
    """Manages an undo/redo stack of string actions."""

    def __init__(self):
        self._undo_stack: list[str] = []
        self._redo_stack: list[str] = []

    def do(self, action: str) -> None:
        """Record a new action on the undo stack.

        IMPORTANT: performing a new action after an undo should clear
        the redo stack, because the timeline has diverged.
        """
        self._redo_stack.clear()
        self._undo_stack.append(action)

    def undo(self) -> str | None:
        """Pop from undo, push to redo.  Returns the action or None."""
        if not self._undo_stack:
            return None
        action = self._undo_stack.pop()
        self._redo_stack.append(action)
        return action

    def redo(self) -> str | None:
        """Pop from redo, push to undo.  Returns the action or None."""
        if not self._redo_stack:
            return None
        action = self._redo_stack.pop()
        self._undo_stack.append(action)
        return action

    def current_actions(self) -> list[str]:
        """Return a copy of the undo stack."""
        return list(self._undo_stack)

    def state_snapshot(self) -> dict[str, list[str]]:
        """Return a snapshot of both stacks for debugging.

        Returns:
            Dict with 'undo' and 'redo' keys, each mapping to a list copy.
        """
        return {
            "undo": list(self._undo_stack),
            "redo": list(self._redo_stack),
        }


def format_history(actions: list[str]) -> str:
    """Return a bracketed, comma-separated representation of actions.

    Args:
        actions: List of action name strings.

    Returns:
        A string like '[Bold, Italic, Underline]'.
    """
    return "[" + ", ".join(actions) + "]"


# ─── main code ────────────────────────────────────────────────────────


class Document:
    """A document that tracks editing actions via HistoryManager."""

    def __init__(self, title: str):
        self.title = title
        self.history = HistoryManager()
        self._content_versions: list[str] = [""]

    def apply_action(self, action: str) -> None:
        """Apply an editing action and record it in history."""
        self.history.do(action)
        new_version = self._content_versions[-1] + f" [{action}]"
        self._content_versions.append(new_version)

    def undo(self) -> str | None:
        """Undo the last action."""
        result = self.history.undo()
        if result is not None and len(self._content_versions) > 1:
            self._content_versions.pop()
        return result

    def redo(self) -> str | None:
        """Redo the last undone action."""
        result = self.history.redo()
        if result is not None:
            new_version = self._content_versions[-1] + f" [{result}]"
            self._content_versions.append(new_version)
        return result

    def current_content(self) -> str:
        """Return the current document content string."""
        return self._content_versions[-1].strip()

    def action_list(self) -> list[str]:
        """Return the list of currently-applied actions."""
        return self.history.current_actions()


if __name__ == "__main__":
    doc = Document("Report")

    # Build up some actions
    doc.apply_action("Bold")
    doc.apply_action("Italic")
    doc.apply_action("Underline")

    # Undo twice
    doc.undo()   # undo Underline
    doc.undo()   # undo Italic  -> redo stack should have [Italic, Underline]

    # New action diverges the timeline -> redo should be cleared
    doc.apply_action("Font Size")
    print(f"History: {format_history(doc.action_list())}")

    # This redo should return None because we diverged
    diverge_redo = doc.redo()
    print(f"Redo attempt after diverge: {diverge_redo}")

    # More actions
    doc.apply_action("Indent")
    doc.undo()    # undo Indent
    final_redo = doc.redo()  # redo Indent

    print(f"Final actions: {format_history(doc.action_list())}")

    # One more redo should be None (nothing left)
    extra = doc.redo()
    print(f"Final redo: {extra}")

    print()
    snap = doc.history.state_snapshot()
    print("State snapshot:")
    print(f"  Undo stack: {format_history(snap['undo'])}")
    print(f"  Redo stack: {format_history(snap['redo'])}")


# ─── stub test ────────────────────────────────────────────────────────
def test_history():
    """Add assert(s) that fail on the buggy code and pass after your fix."""
    doc = Document("Regression")

    doc.apply_action("Bold")
    doc.apply_action("Italic")
    doc.apply_action("Underline")

    doc.undo()
    doc.undo()

    doc.apply_action("Font Size")

    diverged_redo = doc.redo()
    assert diverged_redo is None
    assert doc.action_list() == ["Bold", "Font Size"]

# trees.py
from collections import deque


class TreeNode:
    """Binary tree node."""

    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def inorder_recursive(root: TreeNode | None) -> list[int]:
    """Inorder traversal (left, node, right).
    Time: O(n), Space: O(h).
    """
    out = []

    def dfs(node):
        if not node:
            return
        dfs(node.left)
        out.append(node.val)
        dfs(node.right)

    dfs(root)
    return out


def preorder_iterative(root: TreeNode | None) -> list[int]:
    """Preorder traversal (node, left, right).
    Time: O(n), Space: O(h).
    """
    if not root:
        return []
    out, stack = [], [root]
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right:
            stack.append(node.right)
        if node.left:
            stack.append(node.left)
    return out


def level_order(root: TreeNode | None) -> list[list[int]]:
    """BFS by levels.
    Time: O(n), Space: O(width).
    """
    if not root:
        return []
    ans = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        ans.append(level)
    return ans


def max_depth(root: TreeNode | None) -> int:
    """Maximum depth of tree.
    Time: O(n), Space: O(h).
    """
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))


def lca_bst(root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
    """LCA in BST.
    Idea: move left/right based on p and q values.
    Time: O(h), Space: O(1).
    """
    cur = root
    while cur:
        if p.val < cur.val and q.val < cur.val:
            cur = cur.left
        elif p.val > cur.val and q.val > cur.val:
            cur = cur.right
        else:
            return cur


def lca_binary_tree(root: TreeNode | None, p: TreeNode, q: TreeNode) -> TreeNode | None:
    """LCA in generic binary tree.
    Idea: postorder; if split across sides, current node is LCA.
    Time: O(n), Space: O(h).
    """
    if not root or root == p or root == q:
        return root
    left = lca_binary_tree(root.left, p, q)
    right = lca_binary_tree(root.right, p, q)
    if left and right:
        return root
    return left if left else right

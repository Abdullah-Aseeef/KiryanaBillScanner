# graphs.py
from collections import defaultdict, deque
import heapq


def build_undirected_graph(edges: list[tuple[int, int]]) -> dict[int, list[int]]:
    """Build adjacency list for undirected graph.
    Time: O(E), Space: O(V+E).
    """
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    return dict(graph)


def bfs_shortest_path_unweighted(graph: dict[int, list[int]], src: int, dst: int) -> int:
    """Shortest path length in unweighted graph; -1 if unreachable.
    Idea: BFS layers = distance.
    Time: O(V+E), Space: O(V).
    """
    if src == dst:
        return 0
    queue = deque([(src, 0)])
    visited = {src}
    while queue:
        node, dist = queue.popleft()
        for nei in graph.get(node, []):
            if nei == dst:
                return dist + 1
            if nei not in visited:
                visited.add(nei)
                queue.append((nei, dist + 1))
    return -1


def dfs_connected_components(n: int, edges: list[tuple[int, int]]) -> int:
    """Count connected components in undirected graph with nodes [0..n-1].
    Time: O(V+E), Space: O(V).
    """
    graph = build_undirected_graph(edges)
    visited = set()

    def dfs(node: int) -> None:
        visited.add(node)
        for nei in graph.get(node, []):
            if nei not in visited:
                dfs(nei)

    components = 0
    for node in range(n):
        if node not in visited:
            components += 1
            dfs(node)
    return components


def has_cycle_undirected(n: int, edges: list[tuple[int, int]]) -> bool:
    """Detect cycle in undirected graph.
    Idea: DFS with parent tracking.
    Time: O(V+E), Space: O(V).
    """
    graph = build_undirected_graph(edges)
    visited = set()

    def dfs(node: int, parent: int) -> bool:
        visited.add(node)
        for nei in graph.get(node, []):
            if nei == parent:
                continue
            if nei in visited or dfs(nei, node):
                return True
        return False

    for node in range(n):
        if node not in visited and dfs(node, -1):
            return True
    return False


def has_cycle_directed(graph: dict[int, list[int]]) -> bool:
    """Detect cycle in directed graph.
    Idea: DFS colors (0=unseen,1=visiting,2=done).
    Time: O(V+E), Space: O(V).
    """
    color = defaultdict(int)

    def dfs(node: int) -> bool:
        color[node] = 1
        for nei in graph.get(node, []):
            if color[nei] == 1:
                return True
            if color[nei] == 0 and dfs(nei):
                return True
        color[node] = 2
        return False

    for node in graph:
        if color[node] == 0 and dfs(node):
            return True
    return False


def dijkstra(graph: dict[int, list[tuple[int, int]]], src: int) -> dict[int, int]:
    """Shortest distances from src in weighted graph (non-negative weights).
    graph[u] = [(v, w), ...]
    Time: O((V+E) log V), Space: O(V).
    """
    dist = {src: 0}
    heap = [(0, src)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue
        for nei, w in graph.get(node, []):
            nd = d + w
            if nd < dist.get(nei, float("inf")):
                dist[nei] = nd
                heapq.heappush(heap, (nd, nei))
    return dist


def grid_bfs_shortest_path(grid: list[list[int]], start: tuple[int, int], target: tuple[int, int]) -> int:
    """Shortest steps in binary grid (0=free, 1=blocked), 4-directional.
    Time: O(rows*cols), Space: O(rows*cols).
    """
    rows, cols = len(grid), len(grid[0])
    sr, sc = start
    tr, tc = target
    if grid[sr][sc] == 1 or grid[tr][tc] == 1:
        return -1
    queue = deque([(sr, sc, 0)])
    visited = {(sr, sc)}
    dirs = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    while queue:
        r, c, d = queue.popleft()
        if (r, c) == (tr, tc):
            return d
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in visited:
                visited.add((nr, nc))
                queue.append((nr, nc, d + 1))
    return -1

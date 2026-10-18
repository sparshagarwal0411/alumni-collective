/**
 * Web Worker for Dijkstra Shortest-Path Traversal in the 3D Relational Knowledge Graph.
 * Offloads graph traversal from the main thread to sustain 60 FPS in WebGL.
 *
 * Anti-farming resistance formula:
 * Weight = 1.0 / (min(5, relationalPoints) * 5.0 + sharedTagsCount * 2.0 + 0.1)
 */

export interface DijkstraWorkerRequest {
  id: string; // correlation id
  sourceId: string;
  targetId: string;
  edges: Array<{
    source: string | { id: string };
    target: string | { id: string };
    weight?: number;
    relationalPoints?: number;
    sharedTagsCount?: number;
  }>;
}

export interface DijkstraWorkerResponse {
  id: string;
  path: string[];
  totalWeight: number;
  visitedCount: number;
  error?: string;
}

interface AdjacencyEdge {
  to: string;
  weight: number;
}

self.onmessage = (event: MessageEvent<DijkstraWorkerRequest>) => {
  const { id, sourceId, targetId, edges } = event.data;

  try {
    if (!sourceId || !targetId) {
      self.postMessage({
        id,
        path: [],
        totalWeight: 0,
        visitedCount: 0,
        error: 'Source or Target ID is missing',
      } as DijkstraWorkerResponse);
      return;
    }

    if (sourceId === targetId) {
      self.postMessage({
        id,
        path: [sourceId],
        totalWeight: 0,
        visitedCount: 1,
      } as DijkstraWorkerResponse);
      return;
    }

    // 1. Build Adjacency List (bidirectional campus social graph)
    const adj = new Map<string, AdjacencyEdge[]>();

    const addEdge = (u: string, v: string, weight: number) => {
      if (!adj.has(u)) adj.set(u, []);
      adj.get(u)!.push({ to: v, weight });
    };

    for (const edge of edges) {
      const u = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const v = typeof edge.target === 'object' ? edge.target.id : edge.target;

      if (!u || !v) continue;

      let w = edge.weight;
      if (typeof w !== 'number' || w <= 0) {
        const pts = Math.min(5, edge.relationalPoints || 0);
        const tags = edge.sharedTagsCount || 0;
        w = 1.0 / (pts * 5.0 + tags * 2.0 + 0.1);
      }

      addEdge(u, v, w);
      addEdge(v, u, w);
    }

    // 2. Dijkstra Algorithm
    const dist = new Map<string, number>();
    const prev = new Map<string, string>();
    const visited = new Set<string>();

    // Priority Queue using a simple min-bucket structure
    const queue: Array<{ id: string; cost: number }> = [];

    dist.set(sourceId, 0);
    queue.push({ id: sourceId, cost: 0 });

    let found = false;

    while (queue.length > 0) {
      // Extract min cost node
      queue.sort((a, b) => a.cost - b.cost);
      const current = queue.shift()!;
      const u = current.id;

      if (visited.has(u)) continue;
      visited.add(u);

      if (u === targetId) {
        found = true;
        break;
      }

      const neighbors = adj.get(u) || [];
      const currentDist = dist.get(u) ?? Infinity;

      for (const edge of neighbors) {
        const v = edge.to;
        if (visited.has(v)) continue;

        const newDist = currentDist + edge.weight;
        const oldDist = dist.get(v) ?? Infinity;

        if (newDist < oldDist) {
          dist.set(v, newDist);
          prev.set(v, u);
          queue.push({ id: v, cost: newDist });
        }
      }
    }

    // 3. Reconstruct Path
    if (!found) {
      self.postMessage({
        id,
        path: [],
        totalWeight: Infinity,
        visitedCount: visited.size,
      } as DijkstraWorkerResponse);
      return;
    }

    const path: string[] = [];
    let curr: string | undefined = targetId;

    while (curr) {
      path.unshift(curr);
      if (curr === sourceId) break;
      curr = prev.get(curr);
    }

    self.postMessage({
      id,
      path,
      totalWeight: dist.get(targetId) || 0,
      visitedCount: visited.size,
    } as DijkstraWorkerResponse);
  } catch (err: any) {
    self.postMessage({
      id,
      path: [],
      totalWeight: Infinity,
      visitedCount: 0,
      error: err?.message || 'Worker execution failed',
    } as DijkstraWorkerResponse);
  }
};

/**
 * Dijkstra Pathfinding Service
 * Manages the Web Worker instance and provides robust main-thread fallback.
 */

import { DijkstraWorkerResponse, DijkstraWorkerRequest } from '../workers/dijkstra.worker';
import { getInitialSpatialGraphData } from '@/data/seedData';

class DijkstraService {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    {
      resolve: (res: { path: string[]; totalWeight: number }) => void;
      reject: (err: any) => void;
    }
  >();

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === 'undefined') return;

    try {
      this.worker = new Worker(
        new URL('../workers/dijkstra.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (event: MessageEvent<DijkstraWorkerResponse>) => {
        const { id, path, totalWeight, error } = event.data;
        const pending = this.pendingRequests.get(id);

        if (pending) {
          this.pendingRequests.delete(id);
          if (error) {
            console.warn('[DijkstraWorker] Error returned:', error);
            pending.resolve(this.mainThreadFallback(event.data.path?.[0] || '', ''));
          } else {
            pending.resolve({ path, totalWeight });
          }
        }
      };

      this.worker.onerror = (err) => {
        console.error('[DijkstraWorker] Worker error:', err);
      };
    } catch (e) {
      console.warn('[DijkstraWorker] Web Worker could not be initialized, using main-thread fallback:', e);
      this.worker = null;
    }
  }

  private mainThreadFallback(sourceId: string, targetId: string, edges?: any[]): { path: string[]; totalWeight: number } {
    if (!sourceId || !targetId) return { path: [], totalWeight: 0 };
    if (sourceId === targetId) return { path: [sourceId], totalWeight: 0 };

    const initial = getInitialSpatialGraphData();
    const nodes = initial.nodes;
    const links = edges && edges.length > 0 ? edges : initial.links;
    const adj = new Map<string, { neighbor: string; weight: number }[]>();
    nodes.forEach((n) => adj.set(n.id, []));

    links.forEach((l: any) => {
      const u = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const v = typeof l.target === 'object' ? (l.target as any).id : l.target;
      if (adj.has(u) && adj.has(v)) {
        adj.get(u)!.push({ neighbor: v, weight: l.weight });
        adj.get(v)!.push({ neighbor: u, weight: l.weight });
      }
    });

    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    nodes.forEach((n) => {
      distances.set(n.id, Infinity);
      previous.set(n.id, null);
      unvisited.add(n.id);
    });

    distances.set(sourceId, 0);

    while (unvisited.size > 0) {
      let current: string | null = null;
      let minDistance = Infinity;

      for (const nodeId of unvisited) {
        const dist = distances.get(nodeId)!;
        if (dist < minDistance) {
          minDistance = dist;
          current = nodeId;
        }
      }

      if (!current || minDistance === Infinity) break;
      if (current === targetId) break;

      unvisited.delete(current);

      const neighbors = adj.get(current) || [];
      for (const edge of neighbors) {
        if (!unvisited.has(edge.neighbor)) continue;
        const alt = distances.get(current)! + edge.weight;
        if (alt < distances.get(edge.neighbor)!) {
          distances.set(edge.neighbor, alt);
          previous.set(edge.neighbor, current);
        }
      }
    }

    const path: string[] = [];
    let curr: string | null = targetId;
    if (distances.get(targetId) === Infinity) {
      return { path: [], totalWeight: Infinity };
    }

    while (curr) {
      path.unshift(curr);
      curr = previous.get(curr) || null;
    }

    return {
      path,
      totalWeight: Number((distances.get(targetId) || 0).toFixed(4)),
    };
  }

  public async findShortestPath(
    sourceId: string,
    targetId: string,
    edges?: any[]
  ): Promise<{ path: string[]; totalWeight: number }> {
    if (!sourceId || !targetId) {
      return { path: [], totalWeight: 0 };
    }

    if (sourceId === targetId) {
      return { path: [sourceId], totalWeight: 0 };
    }

    if (this.worker && edges && edges.length > 0) {
      const id = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      return new Promise((resolve, reject) => {
        this.pendingRequests.set(id, { resolve, reject });
        const request: DijkstraWorkerRequest = {
          id,
          sourceId,
          targetId,
          edges: edges.map((e) => ({
            source: typeof e.source === 'object' ? e.source.id : e.source,
            target: typeof e.target === 'object' ? e.target.id : e.target,
            weight: e.weight,
            relationalPoints: e.relationalPoints,
            sharedTagsCount: e.sharedTagsCount,
          })),
        };
        this.worker!.postMessage(request);
      });
    }

    return this.mainThreadFallback(sourceId, targetId, edges);
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.clear();
  }
}

export const dijkstraService = new DijkstraService();

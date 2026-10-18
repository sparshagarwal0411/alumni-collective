import { create } from 'zustand';

export interface ActiveFilters {
  company: string | null;
  sector: string | null;
  branch: string | null;
  skills: string[];
  gradYearRange: [number, number] | null;
  searchQuery: string;
}

const initialFilters: ActiveFilters = {
  company: null,
  sector: null,
  branch: null,
  skills: [],
  gradYearRange: null,
  searchQuery: '',
};

export interface NetworkState {
  activeFilters: ActiveFilters;
  focusedNodeId: string | null;
  hoveredNodeId: string | null;
  paneState: 'LIST_VIEW' | 'PROFILE_VIEW';
  shortestPathNodeIds: string[];
  pathWeight: number;
  isCalculatingPath: boolean;

  // Actions
  setFilter: <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) => void;
  resetFilters: () => void;
  setFocusedNode: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;
  setPaneState: (state: 'LIST_VIEW' | 'PROFILE_VIEW') => void;
  setShortestPath: (nodeIds: string[], weight?: number) => void;
  clearPath: () => void;
  setIsCalculatingPath: (loading: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  activeFilters: initialFilters,
  focusedNodeId: null,
  hoveredNodeId: null,
  paneState: 'LIST_VIEW',
  shortestPathNodeIds: [],
  pathWeight: 0,
  isCalculatingPath: false,

  setFilter: (key, value) =>
    set((state) => ({
      activeFilters: {
        ...state.activeFilters,
        [key]: value,
      },
    })),

  resetFilters: () => set({ activeFilters: initialFilters }),

  setFocusedNode: (id) =>
    set((state) => ({
      focusedNodeId: id,
      paneState: id ? 'PROFILE_VIEW' : state.paneState,
    })),

  setHoveredNode: (id) => set({ hoveredNodeId: id }),

  setPaneState: (state) => set({ paneState: state }),

  setShortestPath: (nodeIds, weight = 0) =>
    set({
      shortestPathNodeIds: nodeIds,
      pathWeight: weight,
      isCalculatingPath: false,
    }),

  clearPath: () =>
    set({
      shortestPathNodeIds: [],
      pathWeight: 0,
      isCalculatingPath: false,
    }),

  setIsCalculatingPath: (loading) => set({ isCalculatingPath: loading }),
}));

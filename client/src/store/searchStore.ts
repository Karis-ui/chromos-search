import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface SearchResult {
  id?: string;
  post_id?: string;
  url: string;
  platform: string;
  posted_at: string;
  confidence: number;
  similarity: number;
  thumbnail: string;
  caption?: string;
  author_username?: string;
  author_full_name?: string;
  author_profile_url?: string;
  media_type?: 'image' | 'video' | 'voice' | 'text';
  match_type?: 'face' | 'voice' | 'hybrid' | 'text';
  face_score?: number;
  voice_score?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  location?: {
    place_name?: string;
    city?: string;
    country?: string;
  };
  hashtags?: string[];
  mentions?: string[];
  rank?: number;
  receivedAt?: number;
}

export interface FilterState {
  platforms: string[];
  minConfidence: number;
  maxConfidence: number;
  timeRange: number;
  sortBy: 'similarity' | 'date' | 'platform' | 'confidence';
  sortOrder: 'asc' | 'desc';
  onlyHighConfidence: boolean;
  excludedPlatforms: string[];
  searchQuery: string;
}

export interface SearchState {
  results: SearchResult[];
  totalResults: number;
  selectedResult: SearchResult | null;
  lastUpdated: number | null;

  progress: number;
  status: string;
  message: string;
  isSearching: boolean;
  searchTime: number;
  startedAt: number | null;
  completedAt: number | null;
  taskId: string | null;

  filters: FilterState;

  history: Array<{
    taskId: string;
    query: string;
    timestamp: number;
    resultCount: number;
    thumbnail?: string;
  }>;

  stats: {
    avgConfidence: number;
    maxConfidence: number;
    minConfidence: number;
    platformCounts: Record<string, number>;
    confidenceBuckets: {
      high: number;
      medium: number;
      low: number;
      negative: number;
    };
  } | null;

  addResult: (result: SearchResult) => void;
  addResults: (results: SearchResult[]) => void;
  updateResult: (id: string, updates: Partial<SearchResult>) => void;
  removeResult: (id: string) => void;
  setResults: (results: SearchResult[]) => void;
  clearResults: () => void;
  setSelectedResult: (result: SearchResult | null) => void;
  setProgress: (progress: number, status: string, message: string) => void;
  setSearchTime: (time: number) => void;
  setTaskId: (taskId: string | null) => void;
  startSearch: (taskId: string) => void;
  completeSearch: () => void;
  failSearch: (error: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  togglePlatform: (platform: string) => void;
  setSortBy: (sortBy: FilterState['sortBy']) => void;
  addToHistory: (entry: Omit<SearchState['history'][0], 'timestamp'>) => void;
  clearHistory: () => void;
  removeFromHistory: (taskId: string) => void;
  computeStats: () => void;
  reset: () => void;
}

const makeDefaultFilters = (): FilterState => ({
  platforms: [],
  minConfidence: 0.5,
  maxConfidence: 1.0,
  timeRange: 180,
  sortBy: 'similarity',
  sortOrder: 'desc',
  onlyHighConfidence: false,
  excludedPlatforms: [],
  searchQuery: '',
});

const initialState = {
  results: [] as SearchResult[],
  totalResults: 0,
  selectedResult: null as SearchResult | null,
  lastUpdated: null as number | null,
  progress: 0,
  status: 'idle',
  message: '',
  isSearching: false,
  searchTime: 0,
  startedAt: null as number | null,
  completedAt: null as number | null,
  taskId: null as string | null,
  filters: makeDefaultFilters(),
  history: [] as SearchState['history'],
  stats: null as SearchState['stats'],
};

export const useSearchStore = create<SearchState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...initialState,

        addResult: (result) => {
          set((state) => {
            const exists = state.results.some(
              (r: SearchResult) => (r.id && r.id === result.id) || r.url === result.url
            );
            if (!exists) {
              state.results.push({
                ...result,
                receivedAt: Date.now(),
              });
              state.totalResults = state.results.length;
              state.lastUpdated = Date.now();
            }
          });
          get().computeStats();
        },

        addResults: (results) => {
          set((state) => {
            const existingKeys = new Set(state.results.map((r: SearchResult) => r.id || r.url));
            const newResults = results.filter((r: SearchResult) => !existingKeys.has(r.id || r.url));
            if (newResults.length > 0) {
              state.results.push(
                ...newResults.map((r) => ({ ...r, receivedAt: Date.now() }))
              );
              state.totalResults = state.results.length;
              state.lastUpdated = Date.now();
            }
          });
          get().computeStats();
        },

        updateResult: (id, updates) => {
          set((state) => {
            const index = state.results.findIndex(
              (r: SearchResult) => r.id === id || r.url === id
            );
            if (index !== -1) {
              state.results[index] = { ...state.results[index], ...updates };
              state.lastUpdated = Date.now();
            }
          });
          get().computeStats();
        },

        removeResult: (id) => {
          set((state) => {
            state.results = state.results.filter(
              (r: SearchResult) => r.id !== id && r.url !== id
            );
            state.totalResults = state.results.length;
            state.lastUpdated = Date.now();
          });
          get().computeStats();
        },

        setResults: (results) => {
          set((state) => {
            state.results = results.map((r) => ({
              ...r,
              receivedAt: Date.now(),
            }));
            state.totalResults = results.length;
            state.lastUpdated = Date.now();
          });
          get().computeStats();
        },

        clearResults: () => {
          set((state) => {
            state.results = [];
            state.totalResults = 0;
            state.selectedResult = null;
            state.progress = 0;
            state.status = 'idle';
            state.message = '';
            state.isSearching = false;
            state.taskId = null;
            state.stats = null;
            state.startedAt = null;
            state.completedAt = null;
            state.lastUpdated = null;
          });
        },

        setSelectedResult: (result) => {
          set((state) => {
            state.selectedResult = result;
          });
        },

        setProgress: (progress, status, message) => {
          set((state) => {
            state.progress = Math.min(100, Math.max(0, progress));
            state.status = status;
            state.message = message;
            state.isSearching = progress > 0 && progress < 100;
          });
        },

        setSearchTime: (time) => {
          set((state) => {
            state.searchTime = time;
          });
        },

        setTaskId: (taskId) => {
          set((state) => {
            state.taskId = taskId;
          });
        },

        startSearch: (taskId) => {
          set((state) => {
            state.taskId = taskId;
            state.progress = 0;
            state.status = 'starting';
            state.message = 'Initializing search...';
            state.isSearching = true;
            state.startedAt = Date.now();
            state.completedAt = null;
            state.searchTime = 0;
            state.results = [];
            state.totalResults = 0;
            state.stats = null;
            state.lastUpdated = null;
          });
        },

        completeSearch: () => {
          set((state) => {
            state.progress = 100;
            state.status = 'completed';
            state.message = 'Search complete!';
            state.isSearching = false;
            state.completedAt = Date.now();

            if (state.taskId && !state.history.some((h: SearchState['history'][number]) => h.taskId === state.taskId)) {
              state.history.unshift({
                taskId: state.taskId,
                query: state.filters.searchQuery || 'Media Search',
                timestamp: Date.now(),
                resultCount: state.totalResults,
                thumbnail: state.results[0]?.thumbnail,
              });

              if (state.history.length > 50) {
                state.history = state.history.slice(0, 50);
              }
            }
          });

          get().computeStats();
        },

        failSearch: (error) => {
          set((state) => {
            state.progress = 0;
            state.status = 'failed';
            state.message = error;
            state.isSearching = false;
            state.completedAt = Date.now();
          });
        },

        setFilters: (filters) => {
          set((state) => {
            state.filters = { ...state.filters, ...filters };
          });
        },

        resetFilters: () => {
          set((state) => {
            state.filters = makeDefaultFilters();
          });
        },

        togglePlatform: (platform) => {
          set((state) => {
            const index = state.filters.platforms.indexOf(platform);
            if (index === -1) {
              state.filters.platforms.push(platform);
            } else {
              state.filters.platforms.splice(index, 1);
            }
          });
        },

        setSortBy: (sortBy) => {
          set((state) => {
            state.filters.sortBy = sortBy;
          });
        },

        addToHistory: (entry) => {
          set((state) => {
            state.history.unshift({
              ...entry,
              timestamp: Date.now(),
            });

            if (state.history.length > 50) {
              state.history = state.history.slice(0, 50);
            }
          });
        },

        clearHistory: () => {
          set((state) => {
            state.history = [];
          });
        },

        removeFromHistory: (taskId) => {
          set((state) => {
            state.history = state.history.filter((h: SearchState['history'][number]) => h.taskId !== taskId);
          });
        },

        computeStats: () => {
          const results = get().results;

          if (results.length === 0) {
            set((state) => {
              state.stats = null;
            });
            return;
          }

          const similarities = results.map((r: SearchResult) => r.similarity);
          const avgConfidence =
            similarities.reduce((a, b) => a + b, 0) / similarities.length;
          const maxConfidence = Math.max(...similarities);
          const minConfidence = Math.min(...similarities);

          const platformCounts: Record<string, number> = {};
          results.forEach((r: SearchResult) => {
            platformCounts[r.platform] = (platformCounts[r.platform] || 0) + 1;
          });

          const confidenceBuckets = {
            high: results.filter((r) => r.similarity >= 0.85).length,
            medium: results.filter((r) => r.similarity >= 0.7 && r.similarity < 0.85).length,
            low: results.filter((r) => r.similarity >= 0.55 && r.similarity < 0.7).length,
            negative: results.filter((r) => r.similarity < 0.55).length,
          };

          set((state) => {
            state.stats = {
              avgConfidence,
              maxConfidence,
              minConfidence,
              platformCounts,
              confidenceBuckets,
            };
          });
        },

        reset: () => {
          set((state) => {
            const preservedHistory = state.history;
            Object.assign(state, {
              ...initialState,
              filters: makeDefaultFilters(),
              history: preservedHistory,
            });
          });
        },
      })),

      {
        name: 'chronos-search-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          history: state.history,
          filters: state.filters,
        }),
        version: 2,
        migrate: (persistedState: any, version: number) => {
          if (version < 2) {
            return {
              history: persistedState.history || [],
              filters: {
                ...makeDefaultFilters(),
                ...(persistedState.filters || {}),
              },
            };
          }
          return persistedState;
        },
      }
    )
  )
);

export const selectFilteredResults = (state: SearchState) => {
  let filtered = [...state.results];

  if (state.filters.platforms.length > 0) {
    filtered = filtered.filter((r) => state.filters.platforms.includes(r.platform));
  }

  if (state.filters.excludedPlatforms.length > 0) {
    filtered = filtered.filter(
      (r) => !state.filters.excludedPlatforms.includes(r.platform)
    );
  }

  filtered = filtered.filter(
    (r) =>
      r.similarity >= state.filters.minConfidence &&
      r.similarity <= state.filters.maxConfidence
  );

  if (state.filters.onlyHighConfidence) {
    filtered = filtered.filter((r) => r.similarity >= 0.85);
  }

  if (state.filters.searchQuery) {
    const query = state.filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.caption?.toLowerCase().includes(query) ||
        r.author_username?.toLowerCase().includes(query) ||
        r.platform.toLowerCase().includes(query)
    );
  }

  const { sortBy, sortOrder } = state.filters;
  filtered.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'similarity':
      case 'confidence':
        comparison = b.similarity - a.similarity;
        break;
      case 'date':
        comparison =
          new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
        break;
      case 'platform':
        comparison = a.platform.localeCompare(b.platform);
        break;
    }
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  return filtered;
};

export const selectRecentResults =
  (count: number = 10) =>
    (state: SearchState) =>
      state.results.slice(0, count);

export const selectResultsByPlatform =
  (platform: string) =>
    (state: SearchState) =>
      state.results.filter((r) => r.platform === platform);

export const selectHighConfidenceResults = (state: SearchState) =>
  state.results.filter((r) => r.similarity >= 0.85);

export default useSearchStore;
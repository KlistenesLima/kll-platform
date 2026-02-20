import { create } from "zustand";
import { favoriteApi } from "../services/api";

interface FavoritesState {
  favoriteIds: Set<string>;
  count: number;
  loading: boolean;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set<string>(),
  count: 0,
  loading: false,
  loadFavorites: async () => {
    set({ loading: true });
    try {
      const ids: string[] = await favoriteApi.getIds();
      set({ favoriteIds: new Set(ids), count: ids.length });
    } catch {
      set({ favoriteIds: new Set(), count: 0 });
    } finally {
      set({ loading: false });
    }
  },
  toggleFavorite: async (productId: string) => {
    const { favoriteIds } = get();
    const wasFavorite = favoriteIds.has(productId);
    // Optimistic update
    const newSet = new Set(favoriteIds);
    if (wasFavorite) {
      newSet.delete(productId);
    } else {
      newSet.add(productId);
    }
    set({ favoriteIds: newSet, count: newSet.size });
    try {
      if (wasFavorite) {
        await favoriteApi.remove(productId);
      } else {
        await favoriteApi.add(productId);
      }
    } catch {
      // Revert on error
      set({ favoriteIds, count: favoriteIds.size });
    }
  },
  isFavorite: (productId: string) => get().favoriteIds.has(productId),
}));

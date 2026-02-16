import { create } from "zustand";
import { cartApi } from "../services/api";
import type { CartItem } from "../types";

interface CartState {
  items: CartItem[]; total: number; itemCount: number; loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  items: [], total: 0, itemCount: 0, loading: false,
  fetchCart: async () => {
    try {
      const data = await cartApi.get();
      set({ items: data.items || [], total: data.total, itemCount: data.itemCount });
    } catch { set({ items: [], total: 0, itemCount: 0 }); }
  },
  addItem: async (productId, quantity = 1) => {
    const data = await cartApi.addItem(productId, quantity);
    set({ total: data.total, itemCount: data.itemCount });
  },
  updateItem: async (productId, quantity) => {
    const data = await cartApi.updateItem(productId, quantity);
    set({ total: data.total, itemCount: data.itemCount });
  },
  removeItem: async (productId) => {
    await cartApi.removeItem(productId);
  },
  clearCart: async () => {
    await cartApi.clear();
    set({ items: [], total: 0, itemCount: 0 });
  },
}));

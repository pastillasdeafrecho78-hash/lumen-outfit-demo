"use client";

import { create } from "zustand";
import { PRODUCTS } from "./catalog";
import type { CartItem, ChatMessage, Product, StoreView } from "./types";

type StoreState = {
  view: StoreView;
  selectedProductId: string | null;
  highlightedIds: string[];
  cart: CartItem[];
  filterQuery: string;
  filteredProducts: Product[];
  messages: ChatMessage[];
  isAgentReady: boolean;
  sessionId: string;
  cartOpen: boolean;
  chatOpen: boolean;

  setView: (view: StoreView, productId?: string | null) => void;
  setHighlighted: (ids: string[]) => void;
  setCart: (cart: CartItem[]) => void;
  addCartItem: (item: CartItem) => void;
  setFilterQuery: (q: string) => void;
  setFilteredProducts: (products: Product[]) => void;
  addMessage: (msg: Omit<ChatMessage, "id">) => void;
  setAgentReady: (v: boolean) => void;
  setCartOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  resetFilters: () => void;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useStore = create<StoreState>((set, get) => ({
  view: "catalog",
  selectedProductId: null,
  highlightedIds: [],
  cart: [],
  filterQuery: "",
  filteredProducts: PRODUCTS,
  messages: [],
  isAgentReady: true,
  sessionId: "demo-session",
  cartOpen: false,
  chatOpen: false,

  setView: (view, productId = null) =>
    set({ view, selectedProductId: productId ?? null }),

  setHighlighted: (ids) => set({ highlightedIds: ids }),

  setCart: (cart) => set({ cart }),

  addCartItem: (item) => {
    const cart = [...get().cart];
    const existing = cart.find(
      (i) => i.productId === item.productId && i.size === item.size,
    );
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push(item);
    }
    set({ cart });
  },

  setFilterQuery: (q) => set({ filterQuery: q }),

  setFilteredProducts: (products) => set({ filteredProducts: products }),

  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, { ...msg, id: uid() }],
    })),

  setAgentReady: (v) => set({ isAgentReady: v }),

  setCartOpen: (open) => set({ cartOpen: open }),

  setChatOpen: (open) => set({ chatOpen: open }),

  resetFilters: () => set({ filterQuery: "", filteredProducts: PRODUCTS }),
}));

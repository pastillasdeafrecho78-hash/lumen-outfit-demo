"use client";

import { useCallback, useEffect } from "react";
import type { AgentUIEvent } from "@/lib/store/types";
import { PRODUCTS } from "@/lib/store/catalog";
import { useStore } from "@/lib/store/useStore";

export function useAgentEvents() {
  const setView = useStore((s) => s.setView);
  const setHighlighted = useStore((s) => s.setHighlighted);
  const setCart = useStore((s) => s.setCart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const setFilteredProducts = useStore((s) => s.setFilteredProducts);
  const setFilterQuery = useStore((s) => s.setFilterQuery);
  const addMessage = useStore((s) => s.addMessage);

  return useCallback(
    (event: AgentUIEvent) => {
      switch (event.type) {
        case "navigate":
          if (event.view === "cart") {
            setCartOpen(true);
            break;
          }
          setView(event.view, event.productId ?? null);
          if (event.view === "product" && event.productId) {
            document
              .querySelector(`[data-product-id="${event.productId}"]`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          break;
        case "filter": {
          const filtered = PRODUCTS.filter((p) => event.productIds.includes(p.id));
          setFilteredProducts(filtered.length ? filtered : PRODUCTS);
          setFilterQuery(event.query);
          break;
        }
        case "highlight":
          setHighlighted(event.productIds);
          if (event.productIds.length) {
            const filtered = PRODUCTS.filter((p) => event.productIds.includes(p.id));
            if (filtered.length) {
              setFilteredProducts(filtered.length < PRODUCTS.length ? filtered : PRODUCTS);
            }
          }
          break;
        case "cart_update":
          setCart(event.cart);
          setCartOpen(true);
          break;
        case "action":
          addMessage({ role: "action", content: event.message });
          break;
        case "text":
          addMessage({ role: "assistant", content: event.content });
          break;
        default:
          break;
      }
    },
    [setView, setHighlighted, setCart, setCartOpen, setFilteredProducts, setFilterQuery, addMessage],
  );
}

export function useAgentHealth() {
  const setAgentReady = useStore((s) => s.setAgentReady);

  useEffect(() => {
    fetch("/api/agent")
      .then((r) => r.json())
      .then((d) => setAgentReady(d.ready !== false))
      .catch(() => setAgentReady(true));
  }, [setAgentReady]);
}

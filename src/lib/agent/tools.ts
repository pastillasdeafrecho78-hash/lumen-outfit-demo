import type { AgentUIEvent } from "@/lib/store/types";
import {
  addToCart,
  getProductById,
  getRecommendations,
  getSessionCart,
  searchProducts,
} from "@/lib/store/catalog";

export type ToolResult = {
  result: unknown;
  events: AgentUIEvent[];
};

export function executeTool(
  sessionId: string,
  name: string,
  args: Record<string, unknown>,
): ToolResult {
  const events: AgentUIEvent[] = [];

  switch (name) {
    case "search_products": {
      const products = searchProducts({
        query: args.query as string | undefined,
        category: args.category as string | undefined,
        maxPrice: args.max_price as number | undefined,
        color: args.color as string | undefined,
      });
      const ids = products.slice(0, 6).map((p) => p.id);
      if (ids.length) {
        events.push({
          type: "filter",
          query: (args.query as string) ?? "",
          productIds: products.map((p) => p.id),
        });
        events.push({ type: "highlight", productIds: ids });
        events.push({ type: "navigate", view: "catalog" });
        events.push({
          type: "action",
          message: `Encontré ${products.length} producto(s)${args.query ? `: "${args.query}"` : ""}`,
        });
      }
      return {
        result: { count: products.length, products: products.slice(0, 8) },
        events,
      };
    }

    case "get_product": {
      const product = getProductById(args.product_id as string);
      if (!product) return { result: { error: "No encontrado" }, events };
      events.push({ type: "navigate", view: "product", productId: product.id });
      events.push({ type: "highlight", productIds: [product.id] });
      events.push({ type: "action", message: `Mostrando ${product.name}` });
      return { result: { product }, events };
    }

    case "get_recommendations": {
      const products = getRecommendations(
        args.context as string | undefined,
        args.product_id as string | undefined,
      );
      const ids = products.map((p) => p.id);
      if (ids.length) {
        events.push({ type: "highlight", productIds: ids });
        events.push({ type: "navigate", view: "catalog" });
        events.push({ type: "action", message: "Te muestro recomendaciones" });
      }
      return { result: { products }, events };
    }

    case "navigate_to": {
      const view = args.view as "catalog" | "product" | "cart";
      const productId = args.product_id as string | undefined;
      events.push({ type: "navigate", view, productId });
      events.push({
        type: "action",
        message:
          view === "cart"
            ? "Abriendo carrito"
            : view === "product"
              ? `Viendo producto`
              : "Volviendo al catálogo",
      });
      return { result: { ok: true, view, productId }, events };
    }

    case "highlight_products": {
      const ids = args.product_ids as string[];
      events.push({ type: "highlight", productIds: ids });
      events.push({ type: "action", message: `Resaltando ${ids.length} producto(s)` });
      return { result: { highlighted: ids }, events };
    }

    case "add_to_cart": {
      const outcome = addToCart(
        sessionId,
        args.product_id as string,
        args.size as string,
        (args.quantity as number) ?? 1,
      );
      if ("error" in outcome) return { result: { error: outcome.error }, events };
      events.push({ type: "cart_update", cart: outcome.cart });
      events.push({
        type: "action",
        message: `Agregué ${outcome.item.name} (talla ${outcome.item.size}) al carrito`,
      });
      return { result: { cart: outcome.cart, added: outcome.item }, events };
    }

    case "get_cart": {
      const cart = getSessionCart(sessionId);
      return { result: { cart, total: cart.reduce((s, i) => s + i.price * i.quantity, 0) }, events };
    }

    default:
      return { result: { error: `Tool desconocida: ${name}` }, events };
  }
}

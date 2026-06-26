import productsData from "./products.json";
import type { CartItem, Product } from "./types";

export const PRODUCTS: Product[] = productsData as Product[];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatPrice(mxn: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(mxn);
}

const sessionCarts = new Map<string, CartItem[]>();

export function getSessionCart(sessionId: string): CartItem[] {
  return sessionCarts.get(sessionId) ?? [];
}

export function setSessionCart(sessionId: string, cart: CartItem[]): CartItem[] {
  sessionCarts.set(sessionId, cart);
  return cart;
}

export type SearchParams = {
  query?: string;
  category?: string;
  maxPrice?: number;
  color?: string;
};

export function searchProducts(params: SearchParams): Product[] {
  const q = params.query?.toLowerCase().trim() ?? "";
  const color = params.color?.toLowerCase().trim();
  const category = params.category?.toLowerCase().trim();

  return PRODUCTS.filter((p) => {
    if (params.maxPrice != null && p.price > params.maxPrice) return false;
    if (category && p.category !== category && !p.tags.includes(category)) return false;
    if (color && !p.colors.some((c) => c.toLowerCase().includes(color))) return false;
    if (!q) return true;

    const haystack = [
      p.name,
      p.category,
      p.description,
      ...p.tags,
      ...p.colors,
    ]
      .join(" ")
      .toLowerCase();

    return q.split(/\s+/).every((term) => haystack.includes(term));
  });
}

export function getRecommendations(context?: string, productId?: string): Product[] {
  const base = productId ? getProductById(productId) : undefined;
  const contextLower = context?.toLowerCase() ?? "";

  let pool = PRODUCTS.filter((p) => p.id !== productId);

  if (base) {
    pool = pool.filter(
      (p) =>
        p.category !== base.category ||
        p.tags.some((t) => base.tags.includes(t)) ||
        p.tags.includes("casual"),
    );
  }

  if (contextLower.includes("formal") || contextLower.includes("oficina")) {
    pool = pool.filter((p) => p.tags.includes("formal") || p.tags.includes("oficina"));
  } else if (contextLower.includes("casual") || contextLower.includes("fin")) {
    pool = pool.filter((p) => p.tags.includes("casual"));
  }

  return pool.slice(0, 4);
}

export function addToCart(
  sessionId: string,
  productId: string,
  size: string,
  quantity = 1,
): { cart: CartItem[]; item: CartItem } | { error: string } {
  const product = getProductById(productId);
  if (!product) return { error: `Producto no encontrado: ${productId}` };
  if (!product.sizes.includes(size)) {
    return { error: `Talla ${size} no disponible. Opciones: ${product.sizes.join(", ")}` };
  }

  const cart = [...getSessionCart(sessionId)];
  const existing = cart.find((i) => i.productId === productId && i.size === size);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId,
      name: product.name,
      price: product.price,
      size,
      quantity,
      image: product.image,
    });
  }

  setSessionCart(sessionId, cart);
  const item = cart.find((i) => i.productId === productId && i.size === size)!;
  return { cart, item };
}

export function getCatalogSummary(): string {
  return PRODUCTS.map(
    (p) =>
      `- ${p.id}: ${p.name} (${formatPrice(p.price)}, ${p.category}, colores: ${p.colors.join("/")}, tallas: ${p.sizes.join("/")})`,
  ).join("\n");
}

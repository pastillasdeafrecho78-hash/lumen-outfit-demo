export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  colors: string[];
  sizes: string[];
  image: string;
  tags: string[];
  description: string;
  badge?: string;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
};

export type StoreView = "catalog" | "product";

export type AgentUIEvent =
  | { type: "navigate"; view: StoreView | "cart"; productId?: string }
  | { type: "highlight"; productIds: string[] }
  | { type: "cart_update"; cart: CartItem[] }
  | { type: "action"; message: string }
  | { type: "text"; role: "assistant"; content: string }
  | { type: "filter"; query: string; productIds: string[] }
  | { type: "done" };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "action";
  content: string;
};

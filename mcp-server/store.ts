#!/usr/bin/env tsx
/**
 * MCP server para Lúmen Outfit.
 * Expone las mismas herramientas que usa el agente en /api/agent.
 *
 * Uso: npm run mcp
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  addToCart,
  getProductById,
  getRecommendations,
  getSessionCart,
  searchProducts,
} from "../src/lib/store/catalog.js";

const server = new McpServer({
  name: "lumen-outfit-store",
  version: "0.1.0",
});

const sessionId = "mcp-default";

server.tool(
  "search_products",
  "Busca productos por texto, categoría, color o precio máximo",
  {
    query: z.string().optional(),
    category: z.string().optional(),
    max_price: z.number().optional(),
    color: z.string().optional(),
  },
  async (args) => {
    const products = searchProducts({
      query: args.query,
      category: args.category,
      maxPrice: args.max_price,
      color: args.color,
    });
    return {
      content: [{ type: "text", text: JSON.stringify({ count: products.length, products }, null, 2) }],
    };
  },
);

server.tool(
  "get_product",
  "Obtiene detalle de un producto por ID",
  { product_id: z.string() },
  async ({ product_id }) => {
    const product = getProductById(product_id);
    return {
      content: [{ type: "text", text: JSON.stringify(product ?? { error: "No encontrado" }, null, 2) }],
    };
  },
);

server.tool(
  "get_recommendations",
  "Sugiere productos complementarios",
  {
    context: z.string().optional(),
    product_id: z.string().optional(),
  },
  async (args) => {
    const products = getRecommendations(args.context, args.product_id);
    return {
      content: [{ type: "text", text: JSON.stringify({ products }, null, 2) }],
    };
  },
);

server.tool(
  "navigate_to",
  "Indica navegación UI: catalog, product o cart",
  {
    view: z.enum(["catalog", "product", "cart"]),
    product_id: z.string().optional(),
  },
  async (args) => {
    return {
      content: [{ type: "text", text: JSON.stringify({ ok: true, ...args }, null, 2) }],
    };
  },
);

server.tool(
  "highlight_products",
  "IDs de productos a resaltar en la UI",
  { product_ids: z.array(z.string()) },
  async ({ product_ids }) => {
    return {
      content: [{ type: "text", text: JSON.stringify({ highlighted: product_ids }, null, 2) }],
    };
  },
);

server.tool(
  "add_to_cart",
  "Agrega producto al carrito",
  {
    product_id: z.string(),
    size: z.string(),
    quantity: z.number().optional(),
  },
  async (args) => {
    const result = addToCart(sessionId, args.product_id, args.size, args.quantity ?? 1);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
);

server.tool("get_cart", "Estado del carrito", {}, async () => {
  const cart = getSessionCart(sessionId);
  return {
    content: [{ type: "text", text: JSON.stringify({ cart }, null, 2) }],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);

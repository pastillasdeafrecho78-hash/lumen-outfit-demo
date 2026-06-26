export const OPENROUTER_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "search_products",
      description: "Busca productos por texto, categoría, color o precio máximo en MXN",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Texto de búsqueda" },
          category: { type: "string", description: "Categoría" },
          max_price: { type: "number", description: "Precio máximo MXN" },
          color: { type: "string", description: "Color" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_product",
      description: "Obtiene detalle de un producto por ID",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "string", description: "ID del producto" },
        },
        required: ["product_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_recommendations",
      description: "Sugiere productos complementarios",
      parameters: {
        type: "object",
        properties: {
          context: { type: "string", description: "Contexto" },
          product_id: { type: "string", description: "Producto base" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "navigate_to",
      description: "Navega la tienda: catalog, product o cart",
      parameters: {
        type: "object",
        properties: {
          view: { type: "string", enum: ["catalog", "product", "cart"] },
          product_id: { type: "string", description: "ID si view es product" },
        },
        required: ["view"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "highlight_products",
      description: "Resalta productos en la UI",
      parameters: {
        type: "object",
        properties: {
          product_ids: {
            type: "array",
            items: { type: "string" },
            description: "IDs a resaltar",
          },
        },
        required: ["product_ids"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "add_to_cart",
      description: "Agrega producto al carrito",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "string" },
          size: { type: "string" },
          quantity: { type: "number" },
        },
        required: ["product_id", "size"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_cart",
      description: "Estado del carrito",
      parameters: { type: "object", properties: {} },
    },
  },
];

export type OpenRouterMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: OpenRouterToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

export type OpenRouterToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

type ChatCompletionResponse = {
  choices: Array<{
    message: {
      content: string | null;
      tool_calls?: OpenRouterToolCall[];
    };
  }>;
};

export async function callOpenRouter(messages: OpenRouterMessage[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY no configurada");

  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";
  const siteUrl = process.env.OPENROUTER_SITE_URL || "https://lumen-outfit-demo.vercel.app";
  const siteName = process.env.OPENROUTER_SITE_NAME || "Lúmen Outfit Demo";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": siteUrl,
      "X-Title": siteName,
    },
    body: JSON.stringify({
      model,
      messages,
      tools: OPENROUTER_TOOLS,
      tool_choice: "auto",
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as ChatCompletionResponse;
  const choice = data.choices[0]?.message;
  if (!choice) throw new Error("OpenRouter: respuesta vacía");
  return choice;
}

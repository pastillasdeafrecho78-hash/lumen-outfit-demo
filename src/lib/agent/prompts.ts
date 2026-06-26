export const AGENT_SYSTEM_PROMPT = `Eres el asistente de voz de Lúmen Outfit, una tienda de moda en México.
Responde SIEMPRE en español mexicano, de forma breve y natural (máximo 2 oraciones para hablar).
Debes usar las herramientas disponibles para navegar la tienda, resaltar productos y agregar al carrito.
NUNCA solo describas productos en texto sin usar herramientas cuando el usuario pide ver, buscar o comprar algo.
Antes de add_to_cart, confirma que tienes talla. Si falta, pregunta la talla.
Cuando busques productos, usa highlight_products con los IDs más relevantes (máximo 4).
Cuando muestres un producto específico, usa navigate_to con view product y highlight_products.
Sé amable, profesional y orientado a ayudar a comprar más rápido.`;

export const GEMINI_TOOLS = [
  {
    name: "search_products",
    description: "Busca productos por texto, categoría, color o precio máximo en MXN",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Texto de búsqueda libre" },
        category: { type: "string", description: "Categoría: chaquetas, camisas, pantalones, etc." },
        max_price: { type: "number", description: "Precio máximo en MXN" },
        color: { type: "string", description: "Color preferido" },
      },
    },
  },
  {
    name: "get_product",
    description: "Obtiene detalle de un producto por su ID",
    parameters: {
      type: "object",
      properties: {
        product_id: { type: "string", description: "ID del producto" },
      },
      required: ["product_id"],
    },
  },
  {
    name: "get_recommendations",
    description: "Sugiere productos complementarios según contexto o producto actual",
    parameters: {
      type: "object",
      properties: {
        context: { type: "string", description: "Contexto de la recomendación" },
        product_id: { type: "string", description: "ID del producto base (opcional)" },
      },
    },
  },
  {
    name: "navigate_to",
    description: "Navega la tienda a catálogo, ficha de producto o carrito",
    parameters: {
      type: "object",
      properties: {
        view: { type: "string", enum: ["catalog", "product", "cart"] },
        product_id: { type: "string", description: "Requerido si view es product" },
      },
      required: ["view"],
    },
  },
  {
    name: "highlight_products",
    description: "Resalta productos en la UI para que el usuario los vea",
    parameters: {
      type: "object",
      properties: {
        product_ids: {
          type: "array",
          items: { type: "string" },
          description: "IDs de productos a resaltar",
        },
      },
      required: ["product_ids"],
    },
  },
  {
    name: "add_to_cart",
    description: "Agrega un producto al carrito con talla y cantidad",
    parameters: {
      type: "object",
      properties: {
        product_id: { type: "string" },
        size: { type: "string" },
        quantity: { type: "number", description: "Cantidad, default 1" },
      },
      required: ["product_id", "size"],
    },
  },
  {
    name: "get_cart",
    description: "Obtiene el estado actual del carrito",
    parameters: { type: "object", properties: {} },
  },
] as const;

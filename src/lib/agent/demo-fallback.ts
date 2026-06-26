import { executeTool } from "@/lib/agent/tools";
import type { AgentUIEvent } from "@/lib/store/types";

type DemoScript = {
  match: (msg: string) => boolean;
  reply: string;
  tools: Array<{
    name: string;
    args: Record<string, unknown> | ((msg: string) => Record<string, unknown>);
  }>;
};

const SCRIPTS: DemoScript[] = [
  {
    match: (m) => /casual|fin de semana|fin/i.test(m),
    reply: "Te muestro opciones casuales para el fin de semana.",
    tools: [{ name: "search_products", args: { query: "casual fin de semana" } }],
  },
  {
    match: (m) => /chaqueta.*negr|negr.*chaqueta|chaquetas negras/i.test(m),
    reply: "Aquí van las chaquetas negras. Te resalto las mejores.",
    tools: [
      { name: "search_products", args: { query: "chaqueta", color: "negro" } },
      { name: "navigate_to", args: { view: "catalog" } },
    ],
  },
  {
    match: (m) => /oferta|descuento|promoci/i.test(m),
    reply: "Estas son las piezas en oferta ahora mismo.",
    tools: [{ name: "search_products", args: { query: "oferta" } }],
  },
  {
    match: (m) => /carrito|pagar|checkout/i.test(m),
    reply: "Te llevo al carrito.",
    tools: [{ name: "navigate_to", args: { view: "cart" } }],
  },
  {
    match: (m) => /recomi|suger/i.test(m),
    reply: "Te sugiero algunas piezas que combinan bien.",
    tools: [{ name: "get_recommendations", args: { context: "casual" } }],
  },
  {
    match: (m) => /agr[eé]g|carrito|quiero la|la quiero/i.test(m),
    reply: "Listo, la agregué al carrito en talla M.",
    tools: [
      {
        name: "add_to_cart",
        args: (m: string) => ({
          product_id: "chaqueta-oslo",
          size: /talla\s*(s|m|l|xl|\d+)/i.exec(m)?.[1]?.toUpperCase() ?? "M",
          quantity: 1,
        }),
      },
    ],
  },
  {
    match: (m) => /oslo|chaqueta oslo|mu[eé]str.*chaqueta/i.test(m),
    reply: "Te abro la ficha de la Chaqueta Oslo.",
    tools: [
      { name: "get_product", args: { product_id: "chaqueta-oslo" } },
      { name: "highlight_products", args: { product_ids: ["chaqueta-oslo"] } },
    ],
  },
];

export function runDemoFallback(
  message: string,
  sessionId: string,
): { events: AgentUIEvent[]; reply: string } {
  const normalized = message.toLowerCase().trim();
  const script = SCRIPTS.find((s) => s.match(normalized));

  const events: AgentUIEvent[] = [];
  if (script) {
    for (const tool of script.tools) {
      const args = typeof tool.args === "function" ? tool.args(normalized) : tool.args;
      const { events: toolEvents } = executeTool(sessionId, tool.name, args);
      events.push(...toolEvents);
    }
    return { events, reply: script.reply };
  }

  const { events: searchEvents } = executeTool(sessionId, "search_products", {
    query: message,
  });
  events.push(...searchEvents);

  return {
    events,
    reply: "Busqué en el catálogo y te resalté lo más relevante.",
  };
}

export function demoStreamResponse(
  message: string,
  sessionId: string,
  push: (event: AgentUIEvent | Record<string, unknown>) => void,
) {
  const { events, reply } = runDemoFallback(message, sessionId);
  for (const ev of events) push(ev);
  push({ type: "text", role: "assistant", content: reply });
  push({ type: "done" });
}

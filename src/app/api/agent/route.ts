import { demoStreamResponse } from "@/lib/agent/demo-fallback";
import { callOpenRouter, type OpenRouterMessage } from "@/lib/agent/openrouter-tools";
import { AGENT_SYSTEM_PROMPT } from "@/lib/agent/prompts";
import { executeTool } from "@/lib/agent/tools";
import { getCatalogSummary } from "@/lib/store/catalog";
import type { AgentUIEvent } from "@/lib/store/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HistoryItem = { role: "user" | "model"; content: string };

function sse(data: AgentUIEvent | Record<string, unknown>) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function hasLiveAgent() {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

function buildMessages(history: HistoryItem[], userMessage: string): OpenRouterMessage[] {
  const system: OpenRouterMessage = {
    role: "system",
    content: `${AGENT_SYSTEM_PROMPT}\n\nCatálogo actual:\n${getCatalogSummary()}`,
  };

  const mapped: OpenRouterMessage[] = history.map((h) => ({
    role: h.role === "model" ? "assistant" : "user",
    content: h.content,
  }));

  return [...([system] as OpenRouterMessage[]), ...mapped, { role: "user", content: userMessage }];
}

export async function POST(req: Request) {
  const body = await req.json();
  const message = (body.message as string)?.trim();
  const sessionId = (body.sessionId as string) || "default";
  const history = (body.history as HistoryItem[]) ?? [];

  if (!message) {
    return Response.json({ error: "Mensaje vacío" }, { status: 400 });
  }

  if (!hasLiveAgent()) {
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const push = (event: AgentUIEvent | Record<string, unknown>) => {
          controller.enqueue(encoder.encode(sse(event)));
        };
        demoStreamResponse(message, sessionId, push);
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const push = (event: AgentUIEvent | Record<string, unknown>) => {
        controller.enqueue(encoder.encode(sse(event)));
      };

      try {
        const messages = buildMessages(history, message);
        let loops = 0;

        while (loops < 6) {
          const choice = await callOpenRouter(messages);

          if (!choice.tool_calls?.length) {
            const text = choice.content?.trim() || "Listo, ¿en qué más te ayudo?";
            push({ type: "text", role: "assistant", content: text });
            push({ type: "done" });
            controller.close();
            return;
          }

          messages.push({
            role: "assistant",
            content: choice.content,
            tool_calls: choice.tool_calls,
          });

          for (const call of choice.tool_calls) {
            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
            } catch {
              args = {};
            }

            const { result: toolResult, events } = executeTool(
              sessionId,
              call.function.name,
              args,
            );
            for (const ev of events) push(ev);

            messages.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify(toolResult),
            });
          }

          loops++;
        }

        push({ type: "text", role: "assistant", content: "Listo, revisa la tienda." });
        push({ type: "done" });
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error del agente";
        push({ type: "text", role: "assistant", content: `Hubo un problema: ${msg}` });
        push({ type: "done" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function GET() {
  return Response.json({
    ready: true,
    mode: hasLiveAgent() ? "live" : "demo",
    provider: hasLiveAgent() ? "openrouter" : "demo-fallback",
    model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
    service: "agent",
  });
}

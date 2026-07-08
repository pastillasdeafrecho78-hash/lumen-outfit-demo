"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_PROMPTS } from "@/lib/constants";
import type { AgentUIEvent } from "@/lib/store/types";
import { useStore } from "@/lib/store/useStore";
import { useAgentEvents, useAgentHealth } from "@/lib/agent/useAgent";

export function VoicePanel({ embedded = false }: { embedded?: boolean }) {
  const messages = useStore((s) => s.messages);
  const isAgentReady = useStore((s) => s.isAgentReady);
  const sessionId = useStore((s) => s.sessionId);
  const addMessage = useStore((s) => s.addMessage);

  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{ role: "user" | "model"; content: string }[]>([]);

  const handleEvent = useAgentEvents();
  useAgentHealth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendToAgent = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing) return;
      setIsProcessing(true);
      addMessage({ role: "user", content: text });
      historyRef.current.push({ role: "user", content: text });

      let assistantText = "";

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            sessionId,
            history: historyRef.current.slice(0, -1),
          }),
        });

        if (!res.ok || !res.body) {
          addMessage({
            role: "assistant",
            content: "No pude conectar con el agente. ¿Estás en http://localhost:3000/demo ?",
          });
          setIsProcessing(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const event = JSON.parse(line.slice(6)) as AgentUIEvent;
            if (event.type === "text" && event.role === "assistant") {
              assistantText = event.content;
            }
            handleEvent(event);
          }
        }

        if (assistantText) {
          historyRef.current.push({ role: "model", content: assistantText });
        }
      } catch {
        addMessage({ role: "assistant", content: "Error de conexión." });
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, addMessage, sessionId, handleEvent],
  );

  return (
    <div className={embedded ? "agent-panel-embedded" : "agent-panel"} aria-label="Asistente de compra">
      {!embedded && (
        <div className="agent-panel-header">
          <p className="eyebrow">Asistente</p>
          <h2 className="text-base font-bold text-white">Tu guía de compra</h2>
        </div>
      )}

      <div className="agent-messages">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">
            Escríbeme y navego la tienda por ti: busco, resalto y agrego al carrito.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`agent-message ${
              msg.role === "user"
                ? "agent-message--user"
                : msg.role === "action"
                  ? "agent-message--action"
                  : "agent-message--assistant"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="agent-input-area">
        <div className="chip-row">
          {DEMO_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="chip"
              onClick={() => void sendToAgent(prompt)}
              disabled={isProcessing || !isAgentReady}
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendToAgent(input);
            setInput("");
          }}
          className="flex gap-2"
        >
          <input
            className="text-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje…"
            disabled={isProcessing || !isAgentReady}
          />
          <button
            type="submit"
            className="button button-primary button-small shrink-0"
            disabled={isProcessing || !isAgentReady || !input.trim()}
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}

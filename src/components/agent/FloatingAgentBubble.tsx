"use client";

import { VoicePanel } from "@/components/agent/VoicePanel";
import { useStore } from "@/lib/store/useStore";

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function FloatingAgentBubble() {
  const chatOpen = useStore((s) => s.chatOpen);
  const setChatOpen = useStore((s) => s.setChatOpen);
  const isAgentSpeaking = useStore((s) => s.isAgentSpeaking);
  const messages = useStore((s) => s.messages);

  const hasActivity = messages.length > 0 || isAgentSpeaking;

  return (
    <div className="floating-agent" aria-label="Asistente de compra">
      {chatOpen && (
        <div className="floating-agent__panel">
          <div className="floating-agent__panel-header">
            <div>
              <p className="eyebrow">Asistente Lúmen</p>
              <p className="text-sm font-semibold text-white">Tu guía de compra</p>
            </div>
            <button
              type="button"
              className="floating-agent__close"
              onClick={() => setChatOpen(false)}
              aria-label="Cerrar chat"
            >
              <CloseIcon />
            </button>
          </div>
          <VoicePanel embedded />
        </div>
      )}

      <button
        type="button"
        className={`floating-agent__bubble ${chatOpen ? "floating-agent__bubble--open" : ""} ${isAgentSpeaking ? "floating-agent__bubble--speaking" : ""}`}
        onClick={() => setChatOpen(!chatOpen)}
        aria-label={chatOpen ? "Cerrar asistente" : "Abrir asistente de voz"}
        aria-expanded={chatOpen}
      >
        <ChatIcon />
        {hasActivity && !chatOpen && <span className="floating-agent__badge" aria-hidden="true" />}
      </button>
    </div>
  );
}

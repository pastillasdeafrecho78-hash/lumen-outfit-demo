# Lúmen Outfit — Demo tienda agéntica

Demo de tienda en línea con asistente de voz que navega el catálogo, resalta productos y agrega al carrito. El agente usa **OpenRouter** (cualquier modelo compatible) y TTS opcional con **ElevenLabs**.

## Requisitos

- Node.js 18+

## Configuración local

```bash
cp .env.example .env.local
# Llena OPENROUTER_API_KEY en .env.local (ver abajo)
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para la landing y [http://localhost:3000/demo](http://localhost:3000/demo) para la tienda en vivo.

## Qué llenar tú manualmente

### Obligatorio (para IA real, no modo demo)

| Variable | Dónde obtenerla |
|----------|-----------------|
| `OPENROUTER_API_KEY` | [openrouter.ai/keys](https://openrouter.ai/keys) |

Sin esta key el proyecto funciona en **modo demo** (respuestas predefinidas, sin LLM).

### Opcional pero recomendado

| Variable | Para qué | Default |
|----------|----------|---------|
| `OPENROUTER_MODEL` | Modelo de IA | `google/gemini-2.0-flash-001` |
| `OPENROUTER_SITE_URL` | Metadata OpenRouter (ranking) | URL de Vercel |
| `OPENROUTER_SITE_NAME` | Nombre del sitio en OpenRouter | `Lúmen Outfit Demo` |

### Opcional (voz del agente)

| Variable | Para qué | Sin ella |
|----------|----------|----------|
| `ELEVENLABS_API_KEY` | TTS de calidad | Usa voz del navegador |
| `ELEVENLABS_VOICE_ID` | Voz específica | Sarah (default ElevenLabs) |
| `ELEVENLABS_MODEL_ID` | Modelo TTS | `eleven_multilingual_v2` |

### No requiere API key

- **STT (micrófono):** Web Speech API del navegador (Chrome recomendado)
- **MCP server local:** `npm run mcp` — no necesita keys extra

## Deploy en Vercel

1. Importa el repo de GitHub en [vercel.com](https://vercel.com)
2. En **Settings → Environment Variables** agrega:
   - `OPENROUTER_API_KEY` (obligatorio para IA en vivo)
   - `ELEVENLABS_API_KEY` (opcional)
3. Deploy

## MCP server (opcional)

```bash
npm run mcp
```

Configura en tu cliente MCP:

```json
{
  "mcpServers": {
    "lumen-outfit": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/ruta/al/repo"
    }
  }
}
```

## Uso de la demo

1. En `/demo`, abre la burbuja del agente y mantén presionado el micrófono.
2. O usa los chips de ejemplo / campo de texto.
3. El asistente resalta productos, navega y actualiza el carrito.

### Ejemplos de frases

- "Busco algo casual para el fin de semana"
- "Muéstrame chaquetas negras"
- "Agrégala en talla M"
- "Llévame al carrito"

## Estructura

- `src/app/demo` — Tienda + burbuja flotante del agente
- `src/app/api/agent` — Agente vía OpenRouter + SSE
- `src/app/api/tts` — ElevenLabs TTS
- `src/lib/store` — Catálogo y estado Zustand
- `src/lib/agent` — Tools, prompts, OpenRouter
- `mcp-server/store.ts` — Servidor MCP
- `video/` — Composiciones HyperFrames (intro opcional)

Demo por Salvador Barba.

# Lúmen Outfit — Demo tienda agéntica

Demo de tienda en línea con un asistente de chat que navega el catálogo, resalta productos y agrega al carrito. El agente usa **OpenRouter** con `google/gemini-2.5-flash`.

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

## Variables de entorno

Solo necesitas **una**:

| Variable | Obligatoria | Dónde obtenerla |
|----------|-------------|-----------------|
| `OPENROUTER_API_KEY` | Sí (para IA real) | [openrouter.ai/keys](https://openrouter.ai/keys) |

Sin esta key, la demo funciona en **modo demo** (respuestas predefinidas, sin LLM).

Opcional: `OPENROUTER_MODEL` para cambiar de modelo sin tocar código (default `google/gemini-2.5-flash`).

## Deploy en Vercel

1. Importa el repo de GitHub en [vercel.com/new](https://vercel.com/new)
2. En **Settings → Environment Variables** agrega únicamente:
   - `OPENROUTER_API_KEY`
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

1. En `/demo`, abre la burbuja del asistente.
2. Escribe o usa los chips de ejemplo.
3. El asistente resalta productos, navega y actualiza el carrito.

### Ejemplos de frases

- "Busco algo casual para el fin de semana"
- "Muéstrame chaquetas negras"
- "Agrégala en talla M"
- "Llévame al carrito"

## Estructura

- `src/app/demo` — Tienda + burbuja flotante del agente
- `src/app/api/agent` — Agente vía OpenRouter + SSE
- `src/lib/store` — Catálogo y estado Zustand
- `src/lib/agent` — Tools, prompts, OpenRouter
- `mcp-server/store.ts` — Servidor MCP
- `video/` — Composiciones HyperFrames (intro opcional)

Demo por Salvador Barba.

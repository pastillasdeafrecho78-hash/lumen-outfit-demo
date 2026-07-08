#!/usr/bin/env node
/**
 * Genera los MP3 del intro con ElevenLabs.
 * Lee ELEVENLABS_API_KEY de .env.local o ~/.config/servimos/elevenlabs.env
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public/video/narration");

function loadKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;

  const local = path.join(ROOT, ".env.local");
  if (fs.existsSync(local)) {
    const match = fs.readFileSync(local, "utf8").match(/^ELEVENLABS_API_KEY=(.+)$/m);
    if (match?.[1]?.trim()) return match[1].trim();
  }

  const servimos = path.join(process.env.HOME ?? "", ".config/servimos/elevenlabs.env");
  if (fs.existsSync(servimos)) {
    const match = fs.readFileSync(servimos, "utf8").match(/^ELEVENLABS_API_KEY=(.+)$/m);
    if (match?.[1]?.trim()) return match[1].trim();
  }

  throw new Error("No se encontró ELEVENLABS_API_KEY");
}

const SCENES = [
  {
    id: "hook",
    text: "¿Y si tu tienda entendiera lo que quieres? Un asistente de voz que navega, recomienda y compra contigo.",
  },
  {
    id: "contrast",
    text: "En una tienda tradicional buscas menús y filtros. Con una tienda agéntica, solo hablas.",
  },
  {
    id: "live",
    text: "El asistente navega, resalta productos y agrega al carrito contigo, sin perder el contexto.",
  },
  {
    id: "cta",
    text: "Pruébalo en tiempo real. Habla con el asistente y mira la tienda moverse sola.",
  },
];

async function generateScene(apiKey, scene) {
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
  const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: scene.text,
      model_id: modelId,
      voice_settings: { stability: 0.45, similarity_boost: 0.8 },
    }),
  });

  if (!res.ok) {
    throw new Error(`${scene.id}: ${res.status} ${await res.text()}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(path.join(OUT_DIR, `${scene.id}.mp3`), buf);
  console.log(`✓ ${scene.id}.mp3 (${Math.round(buf.length / 1024)} KB)`);
}

const apiKey = loadKey();
fs.mkdirSync(OUT_DIR, { recursive: true });

for (const scene of SCENES) {
  await generateScene(apiKey, scene);
}

console.log("Listo — audios en public/video/narration/");

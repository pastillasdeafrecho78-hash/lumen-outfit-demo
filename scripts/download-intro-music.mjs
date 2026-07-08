#!/usr/bin/env node
/**
 * Descarga música libre de Mixkit para el intro.
 * Licencia: https://mixkit.co/license/#musicFree (uso comercial, sin atribución).
 *
 * IDs de ejemplo (ambient): https://mixkit.co/free-stock-music/ambient/
 *   292 = Relax Beat (Arulo) — default
 *   140 = Cyberpunk City
 *   127 = Valley Sunset
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const TRACK_ID = process.env.MIXKIT_TRACK_ID || "292";
const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public/video/narration/bg-music.mp3");
const TMP = path.join(os.tmpdir(), `mixkit-${TRACK_ID}.mp3`);
const COOKIES = path.join(os.tmpdir(), "mixkit.cookies");

const REFERER = "https://mixkit.co/free-stock-music/ambient/";
const URL = `https://assets.mixkit.co/music/${TRACK_ID}/${TRACK_ID}.mp3`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });

console.log(`Descargando Mixkit track ${TRACK_ID}…`);

const page = spawnSync(
  "curl",
  ["-sL", "-c", COOKIES, "-A", "Mozilla/5.0", REFERER, "-o", "/dev/null"],
  { stdio: "inherit" },
);
if (page.status !== 0) process.exit(page.status ?? 1);

const dl = spawnSync(
  "curl",
  [
    "-sL",
    "-b",
    COOKIES,
    "-A",
    "Mozilla/5.0",
    "-H",
    `Referer: ${REFERER}`,
    "-o",
    TMP,
    "-w",
    "HTTP %{http_code} · %{size_download} bytes\n",
    URL,
  ],
  { stdio: "inherit" },
);
if (dl.status !== 0) process.exit(dl.status ?? 1);

if (!fs.existsSync(TMP) || fs.statSync(TMP).size < 10000) {
  console.error("Error: descarga inválida. Revisa MIXKIT_TRACK_ID o tu conexión.");
  process.exit(1);
}

const ff = spawnSync(
  "ffmpeg",
  [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    TMP,
    "-t",
    "38",
    "-af",
    "loudnorm=I=-16:TP=-1.5:LRA=9,afade=t=in:st=0:d=2,afade=t=out:st=35:d=3",
    OUT,
  ],
  { stdio: "inherit" },
);
if (ff.status !== 0) process.exit(ff.status ?? 1);

console.log(`✓ bg-music.mp3 listo → ${OUT}`);
console.log("  Licencia: https://mixkit.co/license/#musicFree");

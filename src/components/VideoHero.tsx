"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const SCENES = [
  {
    id: "hook",
    eyebrow: "Lúmen Outfit",
    title: "¿Y si tu tienda entendiera lo que quieres?",
    sub: "Un asistente de voz que navega, recomienda y compra contigo.",
    audioSrc: "/video/narration/hook.mp3",
    visual: "mic" as const,
  },
  {
    id: "contrast",
    eyebrow: "Antes vs ahora",
    title: "Menús y filtros vs. solo hablar",
    sub: '"Busco algo casual para el fin" — y listo.',
    audioSrc: "/video/narration/contrast.mp3",
    visual: "contrast" as const,
  },
  {
    id: "live",
    eyebrow: "En vivo",
    title: "El agente resalta y navega por ti",
    sub: "Productos, tallas y carrito sin perder el contexto.",
    audioSrc: "/video/narration/live.mp3",
    visual: "products" as const,
  },
  {
    id: "cta",
    eyebrow: "Demo",
    title: "Pruébalo en tiempo real",
    sub: "Habla con el asistente y mira la tienda moverse sola.",
    audioSrc: "/video/narration/cta.mp3",
    visual: "bubble" as const,
  },
] as const;

const SCENE_GAP_MS = 120;
const BG_MUSIC_SRC = "/video/narration/bg-music.mp3";
const BG_MUSIC_VOLUME = 0.8;
const BG_MUSIC_DUCK = 0.38;

type PlayerState = "idle" | "playing" | "ended";

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72L19 12 8 5.14z" />
    </svg>
  );
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const id = window.setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      window.clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

function SceneVisual({ type }: { type: (typeof SCENES)[number]["visual"] }) {
  if (type === "mic") {
    return (
      <div className="intro-visual intro-visual--mic" aria-hidden="true">
        <span className="intro-mic-ring intro-mic-ring--1" />
        <span className="intro-mic-ring intro-mic-ring--2" />
        <span className="intro-mic-ring intro-mic-ring--3" />
        <span className="intro-mic-icon">🎙</span>
      </div>
    );
  }

  if (type === "contrast") {
    return (
      <div className="intro-visual intro-visual--contrast" aria-hidden="true">
        <div className="intro-contrast-col intro-contrast-col--old">
          <span className="intro-contrast-label">Tradicional</span>
          <div className="intro-fake-menu" />
          <div className="intro-fake-menu intro-fake-menu--short" />
          <div className="intro-fake-filter" />
        </div>
        <div className="intro-contrast-vs">vs</div>
        <div className="intro-contrast-col intro-contrast-col--new">
          <span className="intro-contrast-label">Agéntica</span>
          <div className="intro-voice-chip">&ldquo;Busco algo casual…&rdquo;</div>
          <div className="intro-voice-wave">
            <span /><span /><span /><span /><span />
          </div>
        </div>
      </div>
    );
  }

  if (type === "products") {
    return (
      <div className="intro-visual intro-visual--products" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`intro-product-card ${i === 1 ? "intro-product-card--highlight" : ""}`}
          >
            <div className="intro-product-card__img" />
            <div className="intro-product-card__line" />
            <div className="intro-product-card__line intro-product-card__line--short" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="intro-visual intro-visual--bubble" aria-hidden="true">
      <div className="intro-mini-store">
        <div className="intro-mini-store__bar" />
        <div className="intro-mini-store__grid">
          <span /><span /><span /><span />
        </div>
      </div>
      <div className="intro-mini-bubble">
        <span className="intro-mini-bubble__dot" />
        <span>¿Te muestro chaquetas negras?</span>
      </div>
    </div>
  );
}

/** Un solo reproductor de voz + uno de música — evita solapamientos. */
class IntroAudioEngine {
  private narration = new Audio();
  private music = new Audio(BG_MUSIC_SRC);
  private musicFadeId: number | null = null;
  private narrationCleanup: (() => void) | null = null;

  constructor() {
    this.narration.preload = "auto";
    this.music.preload = "auto";
    this.music.loop = true;
  }

  preload() {
    SCENES.forEach((s) => {
      const a = new Audio(s.audioSrc);
      a.preload = "auto";
    });
    this.music.load();
  }

  private clearMusicFade() {
    if (this.musicFadeId !== null) {
      window.clearInterval(this.musicFadeId);
      this.musicFadeId = null;
    }
  }

  private fadeMusic(to: number, ms: number, onDone?: () => void) {
    this.clearMusicFade();
    const from = this.music.volume;
    const steps = Math.max(1, Math.round(ms / 40));
    let step = 0;
    this.musicFadeId = window.setInterval(() => {
      step += 1;
      this.music.volume = from + (to - from) * (step / steps);
      if (step >= steps) {
        this.clearMusicFade();
        this.music.volume = to;
        onDone?.();
      }
    }, 40);
  }

  stopNarration() {
    this.narrationCleanup?.();
    this.narrationCleanup = null;
    this.narration.pause();
    this.narration.currentTime = 0;
    this.narration.removeAttribute("src");
    this.narration.load();
  }

  async startMusic() {
    this.clearMusicFade();
    this.music.pause();
    this.music.currentTime = 0;
    this.music.volume = BG_MUSIC_VOLUME;
    this.music.loop = true;
    await this.music.play();
  }

  duckMusic() {
    this.clearMusicFade();
    this.music.volume = BG_MUSIC_DUCK;
  }

  liftMusic() {
    this.fadeMusic(BG_MUSIC_VOLUME, 500);
  }

  stopMusic(immediate = false) {
    this.clearMusicFade();
    if (immediate) {
      this.music.pause();
      this.music.currentTime = 0;
      return;
    }
    this.fadeMusic(0, 700, () => {
      this.music.pause();
      this.music.currentTime = 0;
    });
  }

  stopAll() {
    this.stopNarration();
    this.stopMusic(true);
  }

  playNarration(src: string, signal: AbortSignal): Promise<void> {
    this.stopNarration();
    this.duckMusic();

    return new Promise((resolve, reject) => {
      const audio = this.narration;
      audio.src = src;
      audio.currentTime = 0;

      const cleanup = () => {
        audio.removeEventListener("ended", onEnd);
        audio.removeEventListener("error", onErr);
        signal.removeEventListener("abort", onAbort);
        this.narrationCleanup = null;
      };

      const onEnd = () => {
        cleanup();
        this.liftMusic();
        resolve();
      };

      const onErr = () => {
        cleanup();
        this.liftMusic();
        reject(new Error(`narration-failed:${src}`));
      };

      const onAbort = () => {
        audio.pause();
        cleanup();
        this.liftMusic();
        reject(new DOMException("Aborted", "AbortError"));
      };

      this.narrationCleanup = cleanup;
      signal.addEventListener("abort", onAbort);
      audio.addEventListener("ended", onEnd, { once: true });
      audio.addEventListener("error", onErr, { once: true });

      void audio.play().catch((err) => {
        cleanup();
        this.liftMusic();
        reject(err);
      });
    });
  }
}

export function VideoHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<IntroAudioEngine | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const playingRef = useRef(false);

  const [scene, setScene] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [statusHint, setStatusHint] = useState<string | null>(null);

  const getEngine = () => {
    if (!engineRef.current) engineRef.current = new IntroAudioEngine();
    return engineRef.current;
  };

  const stopPlayback = useCallback(() => {
    playingRef.current = false;
    abortRef.current?.abort();
    abortRef.current = null;
    getEngine().stopAll();
  }, []);

  const runPlayback = useCallback(async () => {
    if (playingRef.current) return;
    playingRef.current = true;

    abortRef.current?.abort();
    const engine = getEngine();
    engine.stopAll();

    setPlayerState("playing");
    setScene(0);
    setProgress(0);
    setStatusHint(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await engine.startMusic();
    } catch {
      setStatusHint("No se pudo iniciar la música. Haz clic de nuevo en Ver el video.");
    }

    const sceneDurations: number[] = [];
    for (const s of SCENES) {
      const probe = new Audio(s.audioSrc);
      await new Promise<void>((resolve, reject) => {
        probe.addEventListener("loadedmetadata", () => resolve(), { once: true });
        probe.addEventListener("error", () => reject(new Error("missing")), { once: true });
      });
      sceneDurations.push(Math.ceil(probe.duration * 1000) + SCENE_GAP_MS);
    }

    const totalDuration = sceneDurations.reduce((a, b) => a + b, 0);
    let completedMs = 0;

    try {
      for (let i = 0; i < SCENES.length; i++) {
        if (controller.signal.aborted) return;

        const current = SCENES[i];
        setScene(i);
        const sceneStarted = Date.now();

        await engine.playNarration(current.audioSrc, controller.signal);

        const elapsed = Date.now() - sceneStarted;
        const remaining = Math.max(0, sceneDurations[i] - elapsed);
        if (remaining > 0) await wait(remaining, controller.signal);

        completedMs += sceneDurations[i];
        setProgress(Math.min(100, (completedMs / totalDuration) * 100));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        playingRef.current = false;
        return;
      }
      setStatusHint("No se pudo reproducir el audio del video.");
    }

    if (controller.signal.aborted) {
      playingRef.current = false;
      return;
    }

    engine.stopMusic();
    playingRef.current = false;
    setProgress(100);
    setPlayerState("ended");
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const startVideo = useCallback(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    void runPlayback();
  }, [runPlayback]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);

    const onStart = () => startVideo();
    window.addEventListener("lumen:start-intro-video", onStart);
    getEngine().preload();

    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("lumen:start-intro-video", onStart);
      stopPlayback();
    };
  }, [startVideo, stopPlayback]);

  useEffect(() => {
    if (playerState !== "idle" || reduceMotion) return;
    const id = window.setInterval(() => {
      setScene((s) => (s + 1) % SCENES.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [playerState, reduceMotion]);

  const isPlaying = playerState === "playing";
  const isEnded = playerState === "ended";

  return (
    <div
      id="intro-video"
      ref={containerRef}
      className={`video-showcase intro-slideshow ${isPlaying ? "intro-slideshow--playing" : ""} ${isEnded ? "intro-slideshow--ended" : ""}`}
      aria-label="Video introductorio"
    >
      <div className="intro-slideshow__glow" aria-hidden="true" />

      {SCENES.map((s, i) => (
        <div
          key={s.id}
          className={`intro-slide ${i === scene ? "intro-slide--active" : ""}`}
          aria-hidden={i !== scene}
        >
          <SceneVisual type={s.visual} />
          <p className="intro-slide__eyebrow">{s.eyebrow}</p>
          <h2 className="intro-slide__title">{s.title}</h2>
          <p className="intro-slide__sub">{s.sub}</p>
        </div>
      ))}

      <div className="intro-dots" aria-hidden={isPlaying || isEnded}>
        {SCENES.map((_, i) => (
          <span key={i} className={`intro-dot ${i === scene ? "intro-dot--active" : ""}`} />
        ))}
      </div>

      {(isPlaying || isEnded) && (
        <div className="intro-progress" aria-hidden="true">
          <span className="intro-progress__bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      {isPlaying && (
        <p className="intro-playing-label" aria-live="polite">
          Reproduciendo escena {scene + 1} de {SCENES.length}
        </p>
      )}

      {!isPlaying && !isEnded && (
        <button type="button" className="intro-cta-link" onClick={startVideo}>
          <span className="video-play-prompt-icon">
            <PlayIcon />
          </span>
          <span>Ver el video</span>
        </button>
      )}

      {isPlaying && (
        <button
          type="button"
          className="intro-skip-btn"
          onClick={() => {
            stopPlayback();
            setPlayerState("ended");
            setProgress(100);
            containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        >
          Saltar
        </button>
      )}

      {statusHint && !isPlaying && (
        <p className="intro-status-hint">{statusHint}</p>
      )}

      {isEnded && (
        <div className="intro-video-end">
          <p className="intro-video-end__text">¿Listo para probarlo en vivo?</p>
          <Link href="/demo" className="intro-cta-link intro-cta-link--end">
            <span className="video-play-prompt-icon">
              <PlayIcon />
            </span>
            <span>Entrar a la demo en tiempo real</span>
          </Link>
          <button type="button" className="intro-replay-btn" onClick={startVideo}>
            Ver de nuevo
          </button>
        </div>
      )}
    </div>
  );
}

export function CapabilitiesStrip() {
  const items = [
    "El agente busca y resalta productos en vivo",
    "Navega automáticamente a fichas y carrito",
    "Agrega al carrito por voz con talla",
    "Responde hablado mientras mueves la tienda",
  ];

  return (
    <section className="mt-12 grid gap-4 md:grid-cols-2" aria-label="Capacidades">
      {items.map((text) => (
        <div key={text} className="premium-card text-sm text-slate-300">
          <span className="mr-2 text-[#79d8c4]">→</span>
          {text}
        </div>
      ))}
    </section>
  );
}

export function LandingCta() {
  const startVideo = () => {
    window.dispatchEvent(new Event("lumen:start-intro-video"));
  };

  return (
    <div className="landing-cta-row mt-10">
      <button type="button" className="button button-secondary" onClick={startVideo}>
        Ver el video
      </button>
      <Link href="/demo" className="button button-primary">
        Continuar para ver cómo funciona en tiempo real
      </Link>
    </div>
  );
}

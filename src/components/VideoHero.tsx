"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const SCENES = [
  {
    id: "hook",
    eyebrow: "Lúmen Outfit",
    title: "¿Y si tu tienda entendiera lo que quieres?",
    sub: "Un asistente que navega, recomienda y compra contigo.",
    audioSrc: "/video/narration/hook.mp3",
    visual: "mic" as const,
  },
  {
    id: "contrast",
    eyebrow: "Antes vs ahora",
    title: "Menús y filtros vs. solo pedirlo",
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
    sub: "Escribe al asistente y mira la tienda moverse sola.",
    audioSrc: "/video/narration/cta.mp3",
    visual: "bubble" as const,
  },
] as const;

const BG_MUSIC_SRC = "/video/narration/bg-music.mp3";
const MUSIC_PLAY_VOLUME = 0.55;
const FALLBACK_SCENE_SEC = 6;

type PlayerState = "idle" | "playing" | "paused" | "ended";

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72L19 12 8 5.14z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 5h2v14H7zM20 5v14L9 12z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15 5h2v14h-2zM4 5l11 7L4 19z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" />
    </svg>
  );
}

function SceneVisual({ type }: { type: (typeof SCENES)[number]["visual"] }) {
  if (type === "mic") {
    return (
      <div className="intro-visual intro-visual--mic" aria-hidden="true">
        <span className="intro-mic-ring intro-mic-ring--1" />
        <span className="intro-mic-ring intro-mic-ring--2" />
        <span className="intro-mic-ring intro-mic-ring--3" />
        <span className="intro-mic-icon">✨</span>
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

export function VideoHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const narrationRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const durationsRef = useRef<number[]>(SCENES.map(() => FALLBACK_SCENE_SEC));
  const prefixRef = useRef<number[]>([]);
  const totalRef = useRef<number>(SCENES.length * FALLBACK_SCENE_SEC);
  const playingRef = useRef(false);
  const sceneRef = useRef(0);
  const seekingRef = useRef(false);
  const draggingRef = useRef(false);

  const [sceneIndex, setSceneIndex] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(SCENES.length * FALLBACK_SCENE_SEC);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const recomputeTotals = useCallback(() => {
    const prefix: number[] = [];
    let acc = 0;
    for (const d of durationsRef.current) {
      prefix.push(acc);
      acc += d;
    }
    prefixRef.current = prefix;
    totalRef.current = acc;
    setTotalTime(acc);
  }, []);

  const getNarration = useCallback(() => {
    if (!narrationRef.current) narrationRef.current = new Audio();
    return narrationRef.current;
  }, []);

  const getMusic = useCallback(() => {
    if (!musicRef.current) {
      const m = new Audio(BG_MUSIC_SRC);
      m.loop = true;
      m.preload = "auto";
      musicRef.current = m;
    }
    return musicRef.current;
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const updateProgress = useCallback(() => {
    if (seekingRef.current) return;
    const n = narrationRef.current;
    const prefix = prefixRef.current[sceneRef.current] ?? 0;
    const t = prefix + (n?.currentTime || 0);
    const total = totalRef.current || 1;
    setCurrentTime(Math.min(t, total));
    setProgress(Math.min(100, (t / total) * 100));
  }, []);

  const startRaf = useCallback(() => {
    stopRaf();
    const tick = () => {
      updateProgress();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopRaf, updateProgress]);

  const loadScene = useCallback(
    (i: number, offset: number, autoplay: boolean) => {
      const n = getNarration();
      sceneRef.current = i;
      setSceneIndex(i);

      if (n.dataset.scene !== String(i)) {
        n.src = SCENES[i].audioSrc;
        n.dataset.scene = String(i);
        n.load();
      }

      const applyOffset = () => {
        try {
          const max = Number.isFinite(n.duration) && n.duration > 0 ? n.duration - 0.1 : offset;
          n.currentTime = Math.max(0, Math.min(offset, max));
        } catch {
          /* noop */
        }
        if (autoplay) void n.play().catch(() => {});
      };

      if (n.readyState >= 1) applyOffset();
      else n.addEventListener("loadedmetadata", applyOffset, { once: true });
    },
    [getNarration],
  );

  const endPlayback = useCallback(() => {
    playingRef.current = false;
    stopRaf();
    const music = musicRef.current;
    if (music) {
      music.pause();
    }
    setProgress(100);
    setCurrentTime(totalRef.current);
    setPlayerState("ended");
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [stopRaf]);

  const startFromBeginning = useCallback(() => {
    playingRef.current = true;
    setPlayerState("playing");
    setProgress(0);
    setCurrentTime(0);

    const music = getMusic();
    music.currentTime = 0;
    music.volume = MUSIC_PLAY_VOLUME;
    void music.play().catch(() => {});

    loadScene(0, 0, true);
    startRaf();
  }, [getMusic, loadScene, startRaf]);

  const pause = useCallback(() => {
    playingRef.current = false;
    setPlayerState("paused");
    narrationRef.current?.pause();
    musicRef.current?.pause();
    stopRaf();
  }, [stopRaf]);

  const resume = useCallback(() => {
    playingRef.current = true;
    setPlayerState("playing");
    const music = getMusic();
    music.volume = MUSIC_PLAY_VOLUME;
    void music.play().catch(() => {});
    void narrationRef.current?.play().catch(() => {});
    startRaf();
  }, [getMusic, startRaf]);

  const togglePlay = useCallback(() => {
    if (playerState === "playing") {
      pause();
    } else if (playerState === "paused") {
      resume();
    } else {
      startFromBeginning();
    }
  }, [playerState, pause, resume, startFromBeginning]);

  const commitSeek = useCallback(
    (t: number, resumePlay: boolean) => {
      const total = totalRef.current || 1;
      const clamped = Math.max(0, Math.min(t, total - 0.05));
      const prefix = prefixRef.current;
      let i = prefix.length - 1;
      for (let k = 0; k < prefix.length; k++) {
        const start = prefix[k];
        const end = k + 1 < prefix.length ? prefix[k + 1] : total;
        if (clamped >= start && clamped < end) {
          i = k;
          break;
        }
      }
      const offset = clamped - (prefix[i] ?? 0);

      loadScene(i, offset, resumePlay);
      setCurrentTime(clamped);
      setProgress((clamped / total) * 100);

      if (resumePlay) {
        playingRef.current = true;
        setPlayerState("playing");
        const music = getMusic();
        music.volume = MUSIC_PLAY_VOLUME;
        void music.play().catch(() => {});
        startRaf();
      } else if (playerState === "ended") {
        setPlayerState("paused");
      }
    },
    [loadScene, getMusic, startRaf, playerState],
  );

  const timeFromClientX = useCallback((clientX: number, rect: DOMRect) => {
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return frac * (totalRef.current || 1);
  }, []);

  const onScrubDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      draggingRef.current = true;
      seekingRef.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      const t = timeFromClientX(e.clientX, e.currentTarget.getBoundingClientRect());
      const total = totalRef.current || 1;
      setCurrentTime(t);
      setProgress((t / total) * 100);
    },
    [timeFromClientX],
  );

  const onScrubMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      const t = timeFromClientX(e.clientX, e.currentTarget.getBoundingClientRect());
      const total = totalRef.current || 1;
      setCurrentTime(t);
      setProgress((t / total) * 100);
    },
    [timeFromClientX],
  );

  const onScrubUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const t = timeFromClientX(e.clientX, e.currentTarget.getBoundingClientRect());
      commitSeek(t, playingRef.current);
      const n = narrationRef.current;
      if (n) n.addEventListener("seeked", () => (seekingRef.current = false), { once: true });
      window.setTimeout(() => (seekingRef.current = false), 400);
    },
    [timeFromClientX, commitSeek],
  );

  const goToScene = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(i, SCENES.length - 1));
      commitSeek((prefixRef.current[clamped] ?? 0) + 0.02, playingRef.current);
    },
    [commitSeek],
  );

  const prevScene = useCallback(() => {
    const n = narrationRef.current;
    const withinScene = (n?.currentTime || 0) > 2;
    goToScene(withinScene ? sceneRef.current : sceneRef.current - 1);
  }, [goToScene]);

  const nextScene = useCallback(() => {
    goToScene(sceneRef.current + 1);
  }, [goToScene]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void el.requestFullscreen().catch(() => {});
    }
  }, []);

  const startVideo = useCallback(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    startFromBeginning();
  }, [startFromBeginning]);

  useEffect(() => {
    const n = getNarration();
    n.preload = "auto";

    const onEnded = () => {
      if (!playingRef.current) return;
      const next = sceneRef.current + 1;
      if (next < SCENES.length) loadScene(next, 0, true);
      else endPlayback();
    };
    n.addEventListener("ended", onEnded);

    // Precargar metadatos de duración de cada escena para la barra de progreso
    let cancelled = false;
    Promise.all(
      SCENES.map(
        (s, i) =>
          new Promise<number>((resolve) => {
            const probe = new Audio();
            probe.preload = "metadata";
            probe.src = s.audioSrc;
            probe.addEventListener(
              "loadedmetadata",
              () => resolve(Number.isFinite(probe.duration) ? probe.duration : FALLBACK_SCENE_SEC),
              { once: true },
            );
            probe.addEventListener("error", () => resolve(FALLBACK_SCENE_SEC), { once: true });
            void i;
          }),
      ),
    ).then((durations) => {
      if (cancelled) return;
      durationsRef.current = durations;
      recomputeTotals();
    });

    recomputeTotals();

    getMusic();

    return () => {
      cancelled = true;
      n.removeEventListener("ended", onEnded);
    };
  }, [getNarration, getMusic, loadScene, endPlayback, recomputeTotals]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);

    const onStart = () => startVideo();
    window.addEventListener("lumen:start-intro-video", onStart);

    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("lumen:start-intro-video", onStart);
    };
  }, [startVideo]);

  useEffect(() => {
    return () => {
      stopRaf();
      narrationRef.current?.pause();
      musicRef.current?.pause();
    };
  }, [stopRaf]);

  // Preview animado cuando aún no se reproduce
  useEffect(() => {
    if (playerState !== "idle" || reduceMotion) return;
    const id = window.setInterval(() => {
      setSceneIndex((s) => (s + 1) % SCENES.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [playerState, reduceMotion]);

  const isIdle = playerState === "idle";
  const isPlaying = playerState === "playing";
  const isEnded = playerState === "ended";
  const showControls = !isIdle;

  return (
    <div
      id="intro-video"
      ref={containerRef}
      className={`video-showcase intro-slideshow ${showControls ? "intro-slideshow--active" : ""} ${isEnded ? "intro-slideshow--ended" : ""} ${isFullscreen ? "intro-slideshow--fs" : ""}`}
      aria-label="Video introductorio"
    >
      <div className="intro-slideshow__glow" aria-hidden="true" />

      {SCENES.map((s, i) => (
        <div
          key={s.id}
          className={`intro-slide ${i === sceneIndex ? "intro-slide--active" : ""}`}
          aria-hidden={i !== sceneIndex}
        >
          <SceneVisual type={s.visual} />
          <p className="intro-slide__eyebrow">{s.eyebrow}</p>
          <h2 className="intro-slide__title">{s.title}</h2>
          <p className="intro-slide__sub">{s.sub}</p>
        </div>
      ))}

      {isIdle && (
        <>
          <div className="intro-dots" aria-hidden="true">
            {SCENES.map((_, i) => (
              <span key={i} className={`intro-dot ${i === sceneIndex ? "intro-dot--active" : ""}`} />
            ))}
          </div>
          <button type="button" className="intro-cta-link" onClick={startVideo}>
            <span className="video-play-prompt-icon">
              <PlayIcon />
            </span>
            <span>Ver el video</span>
          </button>
        </>
      )}

      {isEnded && (
        <div className="intro-video-end">
          <p className="intro-video-end__text">¿Te late? Pruébalo tú mismo</p>
          <Link href="/demo" className="intro-demo-cta">
            <span>Dale click para ver la demo</span>
            <span className="intro-demo-cta__arrow">
              <ArrowRightIcon />
            </span>
          </Link>
        </div>
      )}

      {showControls && (
        <div className="intro-controls" role="group" aria-label="Controles del video">
          <button
            type="button"
            className="intro-controls__btn intro-controls__btn--main"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            type="button"
            className="intro-controls__btn"
            onClick={prevScene}
            aria-label="Escena anterior"
          >
            <PrevIcon />
          </button>

          <button
            type="button"
            className="intro-controls__btn"
            onClick={nextScene}
            aria-label="Escena siguiente"
          >
            <NextIcon />
          </button>

          <span className="intro-controls__time">{formatTime(currentTime)}</span>

          <div
            className="intro-scrubber"
            onPointerDown={onScrubDown}
            onPointerMove={onScrubMove}
            onPointerUp={onScrubUp}
            role="slider"
            aria-label="Barra de progreso"
            aria-valuemin={0}
            aria-valuemax={Math.round(totalTime)}
            aria-valuenow={Math.round(currentTime)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") commitSeek(currentTime + 5, playingRef.current);
              if (e.key === "ArrowLeft") commitSeek(currentTime - 5, playingRef.current);
            }}
          >
            <span className="intro-scrubber__fill" style={{ width: `${progress}%` }}>
              <span className="intro-scrubber__thumb" />
            </span>
          </div>

          <span className="intro-controls__time">{formatTime(totalTime)}</span>

          <button
            type="button"
            className="intro-controls__btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
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
    "Agrega al carrito con talla",
    "Responde y mueve la tienda por ti",
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

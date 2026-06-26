"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SLIDES = [
  {
    eyebrow: "Lúmen Outfit",
    title: "¿Y si tu tienda entendiera lo que quieres?",
    sub: "Un asistente de voz que navega, recomienda y compra contigo.",
  },
  {
    eyebrow: "Antes vs ahora",
    title: "Menús y filtros vs. solo hablar",
    sub: '"Busco algo casual para el fin" — y listo.',
  },
  {
    eyebrow: "En vivo",
    title: "El agente resalta y navega por ti",
    sub: "Productos, tallas y carrito sin perder el contexto.",
  },
  {
    eyebrow: "Demo",
    title: "Pruébalo en tiempo real",
    sub: "Habla con el asistente y mira la tienda moverse sola.",
  },
];

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72L19 12 8 5.14z" />
    </svg>
  );
}

export function VideoHero() {
  const [slide, setSlide] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <div className="video-showcase intro-slideshow" aria-label="Presentación del concepto">
      <div className="intro-slideshow__glow" aria-hidden="true" />
      {SLIDES.map((s, i) => (
        <div
          key={s.title}
          className={`intro-slide ${i === slide ? "intro-slide--active" : ""}`}
          aria-hidden={i !== slide}
        >
          <p className="intro-slide__eyebrow">{s.eyebrow}</p>
          <h2 className="intro-slide__title">{s.title}</h2>
          <p className="intro-slide__sub">{s.sub}</p>
        </div>
      ))}
      <div className="intro-dots" aria-hidden="true">
        {SLIDES.map((_, i) => (
          <span key={i} className={`intro-dot ${i === slide ? "intro-dot--active" : ""}`} />
        ))}
      </div>
      <Link href="/demo" className="intro-cta-link">
        <span className="video-play-prompt-icon">
          <PlayIcon />
        </span>
        <span>Ver demo en tiempo real</span>
      </Link>
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
  return (
    <div className="mt-10">
      <Link href="/demo" className="button button-primary">
        Continuar para ver cómo funciona en tiempo real
      </Link>
    </div>
  );
}

"use client";

import { useEffect } from "react";

function setCursor(x: number, y: number) {
  document.documentElement.style.setProperty("--cursor-x", `${x}px`);
  document.documentElement.style.setProperty("--cursor-y", `${y}px`);
}

export function SiteBackground() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setCursor(window.innerWidth * 0.5, window.innerHeight * 0.35);
    if (reducedMotion) return;

    let raf = 0;
    const move = (x: number, y: number) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setCursor(x, y));
    };

    const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) move(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      cancelAnimationFrame(raf);
      root.style.removeProperty("--cursor-x");
      root.style.removeProperty("--cursor-y");
    };
  }, []);

  return (
    <div className="site-bg" aria-hidden="true">
      <div className="site-bg__base" />
      <div className="site-bg__grid" />
      <div className="site-bg__grid-neon" />
      <div className="site-bg__spotlight" />
    </div>
  );
}

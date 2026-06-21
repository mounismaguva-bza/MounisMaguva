"use client";

import { useEffect, useRef } from "react";

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function LaunchGoldDust({ active = true, intensity = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let frameId = 0;
    let running = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const count = Math.floor(55 * intensity);
    const particles = Array.from({ length: count }, () => ({
      x: randomBetween(0, canvas.width),
      y: randomBetween(0, canvas.height),
      size: randomBetween(1, 2.5),
      alpha: randomBetween(0.15, 0.55),
      vx: randomBetween(-0.15, 0.15),
      vy: randomBetween(-0.35, -0.08),
      pulse: randomBetween(0, Math.PI * 2),
      pulseSpeed: randomBetween(0.015, 0.035),
    }));

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        const alpha = p.alpha * (0.65 + Math.sin(p.pulse) * 0.35);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 249, 240, ${alpha})`;
        ctx.fill();
      });

      frameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [active, intensity]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[1]"
      aria-hidden
    />
  );
}

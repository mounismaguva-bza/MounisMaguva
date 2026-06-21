"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#fff9f0", "#fcf5e5", "#d4af37", "#c9a227", "#e5d5c3", "#801818"];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function ConfettiBurst({ active }) {
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

    const particles = Array.from({ length: 90 }, () => ({
      x: randomBetween(0, canvas.width),
      y: randomBetween(-canvas.height * 0.15, -10),
      size: randomBetween(3, 7),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: randomBetween(0, 360),
      rotationSpeed: randomBetween(-3, 3),
      vx: randomBetween(-1.2, 1.2),
      vy: randomBetween(1.2, 3.5),
      wobble: randomBetween(0, Math.PI * 2),
      wobbleSpeed: randomBetween(0.02, 0.06),
      shape: Math.random() > 0.65 ? "petal" : "rect",
    }));

    const drawPetal = (size) => {
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.bezierCurveTo(size / 2, -size / 4, size / 2, size / 4, 0, size / 2);
      ctx.bezierCurveTo(-size / 2, size / 4, -size / 2, -size / 4, 0, -size / 2);
      ctx.fill();
    };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * 0.5;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vy += 0.018;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.82;

        if (p.shape === "petal") {
          drawPetal(p.size);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }

        ctx.restore();
      });

      frameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-30"
      aria-hidden
    />
  );
}

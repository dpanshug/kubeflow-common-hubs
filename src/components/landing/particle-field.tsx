"use client";

import { useEffect, useRef } from "react";

interface Particle {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
}

const PARTICLE_SPACING = 30;
const MOUSE_RADIUS = 130;
const PUSH_FORCE = 0.7;
const RETURN_SPEED = 0.035;
const FRICTION = 0.93;
const BASE_OPACITY = 0.3;
const REVEAL_RADIUS = 160;
const BG_COLOR = "#0A1228";

function createParticles(width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  const cols = Math.ceil(width / PARTICLE_SPACING) + 1;
  const rows = Math.ceil(height / PARTICLE_SPACING) + 1;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * PARTICLE_SPACING;
      const y = row * PARTICLE_SPACING;

      const distFromCenter = Math.sqrt(
        Math.pow((x - width / 2) / (width / 2), 2) +
        Math.pow((y - height / 2) / (height / 2), 2)
      );

      const waveFactor = Math.sin(row * 0.12 + col * 0.05) * 0.2 + 0.8;
      const edgeFade = Math.max(0, 1 - distFromCenter * 0.5);
      const opacity = BASE_OPACITY * edgeFade * waveFactor;

      if (opacity > 0.03) {
        particles.push({
          originX: x, originY: y, x, y,
          vx: 0, vy: 0, opacity,
          size: 1.0 + Math.random() * 0.8,
        });
      }
    }
  }
  return particles;
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  mouse: { x: number; y: number },
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = BG_COLOR;
  ctx.globalAlpha = 0.92;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;

  if (mouse.x > -1000) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, REVEAL_RADIUS);
    g.addColorStop(0, "rgba(0,0,0,0.95)");
    g.addColorStop(0.5, "rgba(0,0,0,0.6)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(mouse.x - REVEAL_RADIUS, mouse.y - REVEAL_RADIUS, REVEAL_RADIUS * 2, REVEAL_RADIUS * 2);
    ctx.restore();
  }

  ctx.globalCompositeOperation = "source-over";

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const dx = mouse.x - p.originX;
    const dy = mouse.y - p.originY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MOUSE_RADIUS) {
      const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
      const angle = Math.atan2(dy, dx);
      p.vx -= Math.cos(angle) * force * PUSH_FORCE;
      p.vy -= Math.sin(angle) * force * PUSH_FORCE;
    }

    p.vx += (p.originX - p.x) * RETURN_SPEED;
    p.vy += (p.originY - p.y) * RETURN_SPEED;
    p.vx *= FRICTION;
    p.vy *= FRICTION;
    p.x += p.vx;
    p.y += p.vy;

    const displacement = Math.sqrt(
      Math.pow(p.x - p.originX, 2) + Math.pow(p.y - p.originY, 2)
    );
    const glowBoost = Math.min(displacement / 15, 1);
    const finalOpacity = p.opacity + glowBoost * 0.5;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size + glowBoost * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = glowBoost > 0.15
      ? `rgba(56, 189, 248, ${finalOpacity})`
      : `rgba(148, 163, 184, ${finalOpacity})`;
    ctx.fill();
  }
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const section = canvas.closest("section");
    if (!section) return;

    let particles: Particle[] = [];
    let dims = { width: 0, height: 0 };
    const mouse = { x: -9999, y: -9999 };
    let rafId = 0;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      dims = { width: rect.width, height: rect.height };
      particles = createParticles(rect.width, rect.height);
    };

    const loop = () => {
      renderFrame(ctx, particles, mouse, dims.width, dims.height);
      rafId = requestAnimationFrame(loop);
    };

    handleResize();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 200);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener("resize", debouncedResize);
    section.addEventListener("mousemove", onMouseMove);
    section.addEventListener("mouseleave", onMouseLeave);

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedResize);
      section.removeEventListener("mousemove", onMouseMove);
      section.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[1]"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}

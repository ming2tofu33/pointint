"use client";

import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 25;
const REPULSION_RADIUS = 120;
const REPULSION_FORCE = 0.8;
const DRIFT_SPEED = 0.15;
const RETURN_SPEED = 0.02;

interface Particle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Skip on touch devices or reduced motion
    const isTouch = !window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isTouch || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Read accent color from CSS variable
    const computedStyle = getComputedStyle(document.documentElement);
    const accentColor = computedStyle.getPropertyValue("--color-accent").trim();

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    }

    function initParticles() {
      if (!canvas) return;
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        return {
          x,
          y,
          homeX: x,
          homeY: y,
          vx: (Math.random() - 0.5) * DRIFT_SPEED,
          vy: (Math.random() - 0.5) * DRIFT_SPEED,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.3 + 0.3,
        };
      });
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particlesRef.current) {
        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPULSION_RADIUS && dist > 0) {
          const force =
            ((REPULSION_RADIUS - dist) / REPULSION_RADIUS) * REPULSION_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Return to home
        p.vx += (p.homeX - p.x) * RETURN_SPEED;
        p.vy += (p.homeY - p.y) * RETURN_SPEED;

        // Damping
        p.vx *= 0.95;
        p.vy *= 0.95;

        p.x += p.vx;
        p.y += p.vy;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

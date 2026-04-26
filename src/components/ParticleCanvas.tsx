import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseR: number;
};

interface ParticleCanvasProps {
  /** Base opacity of particles (0–1). Defaults to 0.55. */
  opacity?: number;
  /** Rough density; particle count scales with canvas area / density. */
  density?: number;
  /** Color of the particles. */
  color?: string;
  className?: string;
}

/**
 * Mouse-reactive particle field. Particles drift slowly and are repelled
 * by the cursor (inverse-square falloff, clamped). Respects
 * prefers-reduced-motion by disabling animation.
 */
export default function ParticleCanvas({
  opacity = 0.55,
  density = 11000,
  color = "#0A192F",
  className,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((width * height) / density);
      particles = Array.from({ length: count }, () => {
        const baseR = 0.8 + Math.random() * 1.8;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: baseR,
          baseR,
        };
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);

      const { x: mx, y: my, active } = mouseRef.current;
      const repelRadius = 120;
      const repelStrength = 0.9;

      for (const p of particles) {
        // gentle drift
        p.x += p.vx;
        p.y += p.vy;

        // cursor repulsion (inverse falloff)
        if (active) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.hypot(dx, dy);
          if (dist < repelRadius && dist > 0.01) {
            const force = (1 - dist / repelRadius) * repelStrength;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
            p.r = p.baseR * (1 + (1 - dist / repelRadius) * 1.5);
          } else {
            p.r += (p.baseR - p.r) * 0.05;
          }
        } else {
          p.r += (p.baseR - p.r) * 0.05;
        }

        // viscosity / friction so the field settles
        p.vx *= 0.94;
        p.vy *= 0.94;

        // wrap edges
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5;
        if (p.y > height + 5) p.y = -5;

        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(step);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    if (!reduced) {
      rafRef.current = requestAnimationFrame(step);
    } else {
      // render once, no animation
      for (const p of particles) {
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [color, density, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

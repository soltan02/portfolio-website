import { useEffect, useRef } from 'react';
import { ACCENT_CYCLE } from '../lib/theme';

interface Props {
  className?: string;
  colors?: readonly string[];
  pointCount?: number;
  opacity?: number;
}

/** Cheap 2D-canvas echo of the hero's node-network motif — sparse dots
 *  connected by nearest-neighbor lines, static (not animated) so it reads
 *  as ambient texture rather than competing with foreground scroll motion.
 *  Deliberately not a second WebGL context; the hero is the only 3D scene. */
export default function DataMotifBackground({
  className = '',
  colors = ACCENT_CYCLE,
  pointCount = 40,
  opacity = 0.35,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const points = Array.from({ length: pointCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
      }));

      const maxDist = Math.min(width, height) * 0.28;
      ctx.lineWidth = 1;
      points.forEach((p, i) => {
        points.slice(i + 1).forEach((q) => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < maxDist) {
            ctx.strokeStyle = colors[i % colors.length];
            ctx.globalAlpha = opacity * 0.5 * (1 - dist / maxDist);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        });
      });

      points.forEach((p, i) => {
        ctx.globalAlpha = opacity;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [colors, pointCount, opacity]);

  return <canvas ref={canvasRef} className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden="true" />;
}

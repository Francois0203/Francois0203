import { useEffect, useRef } from 'react';
import styles from './Field.module.css';

/*
 * The ground. Points drift; wherever the pointer is they pull onto a lattice,
 * light up, and the settled ones join. Noise resolving into order is the
 * subject of the work, so the background states it.
 *
 * Runs every frame, so: capped point count, one reused array, squared
 * distances in the inner loop, and it stops on a hidden tab or motion off.
 * Touch has no pointer, so an attractor walks the field instead.
 */

const SPACING = 74;          // lattice pitch in CSS px
const MAX_POINTS = 220;
const FOCUS = 190;           // radius of the pointer's influence
const JOIN = 96;             // max length of a join between settled points
const DRIFT = 0.16;          // free wander speed
const PULL = 0.055;          // how hard a point is drawn to its lattice home

const Field = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(pointer: coarse)');

    let width = 0;
    let height = 0;
    let dpr = 1;
    let points = [];
    let raf = 0;
    let running = false;

    const palette = { dot: '#fff', dim: '#fff', glow: '#fff' };

    const readPalette = () => {
      const s = getComputedStyle(root);
      palette.dot = s.getPropertyValue('--field-dot').trim() || palette.dot;
      palette.dim = s.getPropertyValue('--field-dot-dim').trim() || palette.dim;
      palette.glow = s.getPropertyValue('--field-glow').trim() || palette.glow;
    };

    /* Not state: a pointer coordinate in state is a render per sample.
       `ease` 1 means the focus point IS the pointer; anything less reads as
       lag. The touch attractor keeps a soft chase, since there the motion is
       the effect rather than a response. */
    const focus = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false, ease: 1 };

    const build = () => {
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      const total = Math.min(cols * rows, MAX_POINTS);
      const step = (cols * rows) / total;

      points = [];
      for (let n = 0; n < total; n += 1) {
        const cell = Math.floor(n * step);
        const hx = (cell % cols) * SPACING + SPACING / 2;
        const hy = Math.floor(cell / cols) * SPACING + SPACING / 2;

        // A private phase each, so the drift never finds a rhythm.
        points.push({
          hx,
          hy,
          x: hx + (Math.random() - 0.5) * SPACING * 1.5,
          y: hy + (Math.random() - 0.5) * SPACING * 1.5,
          vx: (Math.random() - 0.5) * DRIFT,
          vy: (Math.random() - 0.5) * DRIFT,
          phase: Math.random() * Math.PI * 2,
          settle: 0,
        });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);

      focus.x += (focus.tx - focus.x) * focus.ease;
      focus.y += (focus.ty - focus.y) * focus.ease;

      if (focus.active) {
        const glow = ctx.createRadialGradient(focus.x, focus.y, 0, focus.x, focus.y, FOCUS * 1.6);
        glow.addColorStop(0, palette.glow);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(focus.x - FOCUS * 1.6, focus.y - FOCUS * 1.6, FOCUS * 3.2, FOCUS * 3.2);
      }

      const t = time * 0.0004;

      for (let i = 0; i < points.length; i += 1) {
        const p = points[i];
        const dx = focus.x - p.x;
        const dy = focus.y - p.y;
        const d2 = dx * dx + dy * dy;

        // 1 at the pointer, 0 at the edge of its influence.
        const near = d2 < FOCUS * FOCUS ? 1 - Math.sqrt(d2) / FOCUS : 0;
        p.settle += (near - p.settle) * 0.16;

        if (p.settle > 0.01) {
          // Pulled home, harder the closer the pointer is.
          p.x += (p.hx - p.x) * PULL * p.settle;
          p.y += (p.hy - p.y) * PULL * p.settle;
        }

        // Free wander, never far from the point's own cell.
        p.x += (p.vx + Math.sin(t + p.phase) * 0.08) * (1 - p.settle);
        p.y += (p.vy + Math.cos(t * 0.9 + p.phase) * 0.08) * (1 - p.settle);

        if (Math.abs(p.x - p.hx) > SPACING) p.vx *= -1;
        if (Math.abs(p.y - p.hy) > SPACING) p.vy *= -1;
      }

      // Joins, only between points that have both settled. Squared distance,
      // and the inner loop starts at i + 1 so no pair is tested twice.
      ctx.lineWidth = 1;
      for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        if (a.settle < 0.25) continue;

        for (let j = i + 1; j < points.length; j += 1) {
          const b = points[j];
          if (b.settle < 0.25) continue;

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > JOIN * JOIN) continue;

          const strength = (1 - Math.sqrt(d2) / JOIN) * Math.min(a.settle, b.settle);
          ctx.globalAlpha = strength * 0.5;
          ctx.strokeStyle = palette.dot;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (let i = 0; i < points.length; i += 1) {
        const p = points[i];
        const r = 1 + p.settle * 1.6;
        ctx.globalAlpha = 1;
        ctx.fillStyle = p.settle > 0.08 ? palette.dot : palette.dim;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    const still = () => {
      // Motion off is a quiet field, not a blank rectangle.
      focus.active = false;
      focus.x = -9999;
      focus.y = -9999;
      draw(0);
    };

    const frame = (time) => {
      draw(time);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const motionOff = () =>
      reduced.matches || root.dataset.noAnimations === 'true';

    const sync = () => {
      stop();
      if (motionOff()) still();
      else start();
    };

    // Pointer only. The field is fixed, so scrolling changes nothing.

    const onMove = (e) => {
      // Re-entering the window is a jump, not a move. Place, do not chase.
      if (!focus.active) {
        focus.x = e.clientX;
        focus.y = e.clientY;
      }
      focus.tx = e.clientX;
      focus.ty = e.clientY;
      focus.ease = 1;
      focus.active = true;
    };

    const onLeave = () => { focus.active = false; focus.tx = -9999; focus.ty = -9999; };

    // No pointer on touch, so something has to walk the field.
    let walk = 0;
    const wander = () => {
      if (motionOff()) return;
      walk += 0.0022;
      focus.tx = width * (0.5 + 0.34 * Math.sin(walk));
      focus.ty = height * (0.5 + 0.3 * Math.sin(walk * 1.37));
      focus.ease = 0.08;
      focus.active = true;
    };

    let wanderTimer = 0;
    if (coarse.matches) wanderTimer = setInterval(wander, 32);
    else {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
    }

    const onVisibility = () => {
      if (document.hidden) stop();
      else sync();
    };

    const observer = new ResizeObserver(() => { resize(); if (motionOff()) still(); });
    observer.observe(canvas);

    // The only signal that the theme swapped the properties this reads.
    const themeObserver = new MutationObserver(() => { readPalette(); if (motionOff()) still(); });
    themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-no-animations'] });

    readPalette();
    resize();
    sync();

    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', sync);

    return () => {
      stop();
      observer.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reduced.removeEventListener('change', sync);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      if (wanderTimer) clearInterval(wanderTimer);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.field} aria-hidden="true" />;
};

export default Field;

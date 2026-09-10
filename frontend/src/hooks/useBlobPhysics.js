import { useRef, useEffect } from 'react';

/**
 * Shared blob physics engine used by Loading and NotFound pages.
 *
 * blobDefs - array of { r, sx, sy, vx, vy, rotSpeed? }
 * options  - { withRotation, maxSpeed }
 *   withRotation - enables angle integration and adds rotate() to transform
 *   maxSpeed     - velocity cap in px/s (default 20)
 *
 * There was a `glassFrom` option, and a mousemove handler feeding it, which
 * published the cursor position relative to each blob to drive a
 * cursor-reactive specular gradient. Both are gone: the value changed every
 * frame purely because the blob moved, which repainted a full-size radial
 * gradient per blob per frame with the pointer completely still. The highlight
 * is now fixed within each blob. Callers no longer need to attach onMouseMove.
 */
const useBlobPhysics = (blobDefs, { withRotation = false, maxSpeed = 20 } = {}) => {
  const blobRefs   = useRef([]);
  const physicsRef = useRef(null);
  const rafRef     = useRef(null);
  const nudgeTimer = useRef(null);

  useEffect(() => {
    const noAnim =
      document.documentElement.getAttribute('data-no-animations') === 'true' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = vw < 400 ? 0.38 : vw < 600 ? 0.57 : 1.0;

    const blobs = blobDefs.map((def) => {
      const r    = def.r * scale;
      const size = r * 2;
      return {
        x:        Math.max(0, Math.min(vw - size, def.sx * vw)),
        y:        Math.max(0, Math.min(vh - size, def.sy * vh)),
        vx:       def.vx,
        vy:       def.vy,
        r,
        angle:    withRotation ? Math.random() * 360 : 0,
        rotSpeed: withRotation ? (def.rotSpeed ?? 0) : 0,
      };
    });

    // Pin initial positions - prevents flash from 0,0
    blobs.forEach((b, i) => {
      const el = blobRefs.current[i];
      if (!el) return;
      el.style.transform = withRotation
        ? `translate(${b.x}px, ${b.y}px) rotate(${b.angle}deg)`
        : `translate(${b.x}px, ${b.y}px)`;
    });

    if (noAnim) return;

    physicsRef.current = { blobs, vw, vh, lastTime: null };

    const tick = (timestamp) => {
      const state = physicsRef.current;
      if (!state) return;

      if (!state.lastTime) state.lastTime = timestamp;
      const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05);
      state.lastTime = timestamp;

      const { blobs: bs } = state;
      const DAMPING = 0.999;

      // Integrate
      bs.forEach(b => {
        b.x  += b.vx * dt;
        b.y  += b.vy * dt;
        b.vx *= DAMPING;
        b.vy *= DAMPING;
        if (withRotation) b.angle += b.rotSpeed * dt;
      });

      // Soft pair repulsion
      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const a = bs[i], b = bs[j];
          const dx   = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          const min  = (a.r + b.r) * 0.80;
          if (dist < min) {
            const ov = (min - dist) / dist;
            const fx = dx * ov * 0.016, fy = dy * ov * 0.016;
            a.vx -= fx; a.vy -= fy;
            b.vx += fx; b.vy += fy;
          }
        }
      }

      // Soft boundary push + hard clamp
      bs.forEach(b => {
        const size = b.r * 2, zone = b.r * 0.30, push = 0.50;
        if (b.x < zone)                b.vx += push;
        if (b.x > vw - size - zone)    b.vx -= push;
        if (b.y < zone)                b.vy += push;
        if (b.y > vh - size - zone)    b.vy -= push;
        b.x = Math.max(0, Math.min(vw - size, b.x));
        b.y = Math.max(0, Math.min(vh - size, b.y));

        const speed = Math.hypot(b.vx, b.vy);
        if (speed > maxSpeed) { b.vx = (b.vx / speed) * maxSpeed; b.vy = (b.vy / speed) * maxSpeed; }
        if (speed < 2)        { const a = Math.random() * Math.PI * 2; b.vx += Math.cos(a) * 4; b.vy += Math.sin(a) * 4; }
      });

      /*
       * Write to DOM. One transform per blob and nothing else.
       *
       * This used to also write --cursor-x/--cursor-y, the cursor position
       * expressed relative to each blob's own origin, which the glass rules
       * fed into `radial-gradient(... at var(--cursor-x) var(--cursor-y))`.
       * Because the blob's origin moves every frame, that value changed every
       * frame even with the pointer completely still, so three blobs x two
       * pseudo-elements repainted a full-size radial gradient sixty times a
       * second - and the ::after additionally ran mask-composite over the
       * result. The specular highlight is now a fixed position within each
       * blob, which is also better optics: a highlight on a drifting object
       * travels with the object.
       */
      bs.forEach((b, i) => {
        const el = blobRefs.current[i];
        if (!el) return;
        el.style.transform = withRotation
          ? `translate(${b.x}px, ${b.y}px) rotate(${b.angle}deg)`
          : `translate(${b.x}px, ${b.y}px)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const scheduleNudge = () => {
      nudgeTimer.current = setTimeout(() => {
        const bs = physicsRef.current?.blobs;
        if (bs) {
          const count = 2 + Math.floor(Math.random() * 2);
          [...Array(bs.length).keys()]
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .forEach(idx => {
              const a = Math.random() * Math.PI * 2;
              const s = 9 + Math.random() * 13;
              bs[idx].vx += Math.cos(a) * s;
              bs[idx].vy += Math.sin(a) * s;
            });
        }
        scheduleNudge();
      }, 2200 + Math.random() * 3200);
    };
    scheduleNudge();

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(nudgeTimer.current);
      physicsRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { blobRefs };
};

export default useBlobPhysics;

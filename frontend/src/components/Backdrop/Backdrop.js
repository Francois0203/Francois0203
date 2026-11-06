import { useEffect, useRef } from 'react';
import styles from './Backdrop.module.css';

const ORBS = [
  { tone: 'blue', x: 12, y: 8, size: 58 },
  { tone: 'pink', x: 82, y: 6, size: 50 },
  { tone: 'green', x: 90, y: 62, size: 44 },
  { tone: 'orange', x: 6, y: 74, size: 40 },
  { tone: 'yellow', x: 52, y: 96, size: 36 },
];

const SHARDS = [
  { x: 6, y: 24, s: 54, r: 18, tone: 'blue', shape: 'round' },
  { x: 92, y: 30, s: 36, r: -12, tone: 'pink', shape: 'circle' },
  { x: 72, y: 80, s: 60, r: 32, tone: 'green', shape: 'round' },
  { x: 16, y: 88, s: 28, r: 0, tone: 'yellow', shape: 'circle' },
];

const quiet = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.dataset.noAnimations === 'true';

// Still colour behind the glass, with the glow and tap rings on a layer above.
const Backdrop = () => {
  const lightRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const light = lightRef.current;
    const glow = glowRef.current;
    if (!light || !glow) return undefined;
    const fine = window.matchMedia('(pointer: fine)').matches;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;
    const paint = () => { raf = 0; glow.style.transform = `translate3d(${x}px, ${y}px, 0)`; };
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      glow.dataset.on = '';
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const leave = () => { delete glow.dataset.on; };

    // Mouse presses ring at once; touches ring only on a real tap, so starting a scroll leaves no ripple.
    let kind = 'mouse';
    const tap = (e) => {
      if (e.type === 'pointerdown') kind = e.pointerType;
      if (quiet() || e.button > 0 || (e.type === 'click' && e.detail === 0)) return;
      if ((e.type === 'pointerdown') !== (kind === 'mouse')) return;
      if (e.target.closest('input, textarea, select, [data-no-ripple]')) return;
      const ring = document.createElement('span');
      ring.className = styles.ring;
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      light.appendChild(ring);
      ring.addEventListener('animationend', () => ring.remove(), { once: true });
    };

    if (fine) {
      window.addEventListener('pointermove', move, { passive: true });
      document.documentElement.addEventListener('pointerleave', leave);
    }
    window.addEventListener('pointerdown', tap, { passive: true });
    window.addEventListener('click', tap, { passive: true });
    paint();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', tap);
      window.removeEventListener('click', tap);
    };
  }, []);

  return (
    <>
      <div className={styles.backdrop} aria-hidden="true">
        {ORBS.map(o => (
          <span
            key={o.tone}
            className={styles.orb}
            style={{ '--x': `${o.x}%`, '--y': `${o.y}%`, '--size': `${o.size}vmax`, '--c': `var(--c-${o.tone})` }}
          />
        ))}
        <div className={styles.dots} />
        {SHARDS.map((s, i) => (
          <span
            key={i}
            className={styles.shard}
            data-shape={s.shape}
            style={{ '--x': `${s.x}%`, '--y': `${s.y}%`, '--s': `${s.s}px`, '--r': `${s.r}deg`, '--c': `var(--c-${s.tone})` }}
          />
        ))}
        <div className={styles.grain} />
      </div>
      <div ref={lightRef} className={styles.light} aria-hidden="true">
        <span ref={glowRef} className={styles.glow} />
      </div>
    </>
  );
};

export default Backdrop;

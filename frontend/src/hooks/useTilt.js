import { useEffect } from 'react';

const calm = () =>
  window.matchMedia('(pointer: coarse)').matches
  || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.dataset.noAnimations === 'true';

// Tilts an element toward the pointer and exposes the pointer as --mx, --my.
const useTilt = (ref, { max = 6, lift = 0, enabled = true } = {}) => {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || calm()) return undefined;

    let raf = 0;
    let x = 0.5;
    let y = 0.5;

    const paint = () => {
      raf = 0;
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      el.style.setProperty('--rx', `${((0.5 - y) * max * 2).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((x - 0.5) * max * 2).toFixed(2)}deg`);
      el.style.setProperty('--lz', `${lift}px`);
    };

    const move = (e) => {
      const r = el.getBoundingClientRect();
      x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      el.dataset.tilting = '';
      if (!raf) raf = requestAnimationFrame(paint);
    };

    const leave = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      delete el.dataset.tilting;
      ['--rx', '--ry', '--lz'].forEach(p => el.style.setProperty(p, p === '--lz' ? '0px' : '0deg'));
    };

    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [ref, max, lift, enabled]);
};

export default useTilt;

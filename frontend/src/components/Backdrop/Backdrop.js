import { useEffect, useRef } from 'react';
import styles from './Backdrop.module.css';

const quiet = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.dataset.noAnimations === 'true';

// The matte ground, with tap rings on a layer above the page.
const Backdrop = () => {
  const lightRef = useRef(null);

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return undefined;

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

    window.addEventListener('pointerdown', tap, { passive: true });
    window.addEventListener('click', tap, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', tap);
      window.removeEventListener('click', tap);
    };
  }, []);

  return (
    <>
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.grain} />
      </div>
      <div ref={lightRef} className={styles.light} aria-hidden="true" />
    </>
  );
};

export default Backdrop;

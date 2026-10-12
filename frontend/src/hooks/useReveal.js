import { useEffect, useRef, useState } from 'react';

const useReveal = ({
  threshold = 0.12,
  rootMargin = '0px 0px -8% 0px',
  enabled = true,
} = {}) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(!enabled);

  useEffect(() => {
    if (!enabled) { setShown(true); return undefined; }

    const el = ref.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === 'undefined') { setShown(true); return undefined; }

    let obs = null;
    let failsafe = 0;

    const arm = () => {
      obs = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        obs.disconnect();
      }, { threshold, rootMargin });
      obs.observe(el);
      failsafe = setTimeout(() => { setShown(true); obs.disconnect(); }, 2200);
    };

    const gated = document.documentElement.dataset.intro === 'playing';
    if (gated) window.addEventListener('intro:done', arm, { once: true });
    else arm();

    return () => {
      clearTimeout(failsafe);
      obs?.disconnect();
      window.removeEventListener('intro:done', arm);
    };
  }, [enabled, threshold, rootMargin]);

  return [ref, shown];
};

export default useReveal;

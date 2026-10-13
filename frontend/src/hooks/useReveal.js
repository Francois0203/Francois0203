import { useEffect, useState } from 'react';

// Pages already revealed this visit. Coming back to one shows it straight away.
const seen = new Set();
const here = () => (typeof window === 'undefined' ? '' : window.location.pathname);
export const markSeen = (path) => seen.add(path);

// Also works for sections that only appear once data loads.
const useReveal = ({
  threshold = 0.12,
  rootMargin = '0px 0px -8% 0px',
  enabled = true,
} = {}) => {
  const [el, setEl] = useState(null);
  const [shown, setShown] = useState(() => !enabled || seen.has(here()));

  useEffect(() => {
    if (!enabled) { setShown(true); return undefined; }
    if (!el || shown) return undefined;

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
  }, [el, shown, enabled, threshold, rootMargin]);


  return [setEl, shown];
};

export default useReveal;

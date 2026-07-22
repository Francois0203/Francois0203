import { useEffect } from 'react';
import Lenis from 'lenis';

// Single shared instance so navigation code (ScrollToTop) can drive the same
// smooth scroller instead of fighting it with window.scrollTo.
let lenisInstance = null;
export const getLenis = () => lenisInstance;

const prefersReduced = () =>
  document.documentElement.getAttribute('data-no-animations') === 'true' ||
  (typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/**
 * Premium momentum scrolling via Lenis.
 * - Desktop: smooths the wheel for weighty, inertial scrolling.
 * - Touch: left on native scroll (syncTouch off by default) so mobile keeps its
 *   own buttery momentum and never feels laggy or "glitchy".
 * - Disabled entirely when the visitor prefers reduced motion.
 */
export const useMomentumScroll = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (prefersReduced()) return undefined;

    const lenis = new Lenis({
      lerp: 0.075,          // lower = longer, weightier glide (more momentum)
      smoothWheel: true,
      wheelMultiplier: 1.25, // more travel per wheel notch
      touchMultiplier: 1.4,
    });
    lenisInstance = lenis;

    let rafId = 0;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      if (lenisInstance === lenis) lenisInstance = null;
    };
  }, []);
};

export default useMomentumScroll;

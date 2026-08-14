import { useEffect } from 'react';
import Lenis from 'lenis';

// Single shared instance so navigation code (ScrollToTop) can drive the same
// smooth scroller instead of fighting it with window.scrollTo.
let lenisInstance = null;
export const getLenis = () => lenisInstance;

const prefersReduced = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The in-app Motion toggle (Settings cog) sets this on <html>. Momentum
// scrolling is the largest single piece of motion on the site, so someone who
// turns animation off and still gets an inertial scroller has been ignored.
const motionDisabled = () =>
  document.documentElement.getAttribute('data-no-animations') === 'true';

/**
 * Momentum scrolling via Lenis.
 * - Desktop: smooths the wheel for weighty, inertial scrolling.
 * - Touch: left on native scroll (syncTouch off by default) so mobile keeps its
 *   own momentum and never feels laggy.
 * - Off entirely under reduced motion or the in-app Motion toggle, and it
 *   follows both of those live rather than only at mount.
 */
export const useMomentumScroll = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let lenis = null;
    let rafId = 0;
    let resizeObserver = null;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({
        lerp: 0.075,           // lower = longer, weightier glide (more momentum)
        smoothWheel: true,
        wheelMultiplier: 1.25, // more travel per wheel notch
        touchMultiplier: 1.4,
      });
      lenisInstance = lenis;

      const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
      rafId = requestAnimationFrame(raf);

      /*
       * Lenis caches the scrollable height. Every page here fills in after first
       * paint - the portfolio documents, the GitHub project list, an opened
       * README - so the document grows while someone is already scrolling.
       * Against a stale height Lenis clamps to the wrong maximum, which is felt
       * as the scroll hitting an invisible wall partway down the page. Watching
       * the body for size changes and re-measuring is what keeps it honest.
       */
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => lenis?.resize());
        resizeObserver.observe(document.body);
      }
    };

    const stop = () => {
      if (!lenis) return;
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      resizeObserver = null;
      lenis.destroy();
      if (lenisInstance === lenis) lenisInstance = null;
      lenis = null;
    };

    const sync = () => {
      if (prefersReduced() || motionDisabled()) stop();
      else start();
    };

    sync();

    // React to the Motion toggle without needing a reload.
    const attrObserver = new MutationObserver(sync);
    attrObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-no-animations'],
    });

    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    mq?.addEventListener('change', sync);

    return () => {
      attrObserver.disconnect();
      mq?.removeEventListener('change', sync);
      stop();
    };
  }, []);
};

export default useMomentumScroll;

import { useEffect } from 'react';
import Lenis from 'lenis';

// The window-level instance, so navigation code (ScrollToTop) can drive the same
// smooth scroller instead of fighting it with window.scrollTo. Scoped instances
// (see below) deliberately do not register here - there is only ever one page
// scroller, and ScrollToTop must always mean "the page".
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

const FEEL = {
  lerp: 0.075,           // lower = longer, weightier glide (more momentum)
  smoothWheel: true,
  wheelMultiplier: 1.25, // more travel per wheel notch
  touchMultiplier: 1.4,
  /*
   * Hands the wheel back to any element that can scroll itself, instead of
   * hijacking it for the page. Without this, a wheel over a nested scroller -
   * the admin's sidebar tree, the stack trace in ErrorBoundary, a page that
   * only scrolls internally on a short landscape viewport - is swallowed by
   * preventDefault and the inner region simply will not move.
   *
   * The alternative is tagging each one with [data-lenis-prevent] by hand,
   * which only protects the scrollers someone remembered to tag.
   */
  allowNestedScroll: true,
};

/**
 * Momentum scrolling via Lenis.
 *
 * Call with no arguments to smooth the page scroll. Pass refs to smooth a
 * region that scrolls inside itself instead - the admin is laid out as a fixed
 * shell whose <main> owns the scroll, so the window never moves there and a
 * page-level instance would have nothing to do.
 *
 * - Desktop: smooths the wheel for weighty, inertial scrolling.
 * - Touch: left on native scroll (syncTouch off by default) so mobile keeps its
 *   own momentum and never feels laggy.
 * - Off entirely under reduced motion or the in-app Motion toggle, and it
 *   follows both of those live rather than only at mount.
 *
 * @param {object}  [options]
 * @param {React.RefObject<HTMLElement>} [options.wrapperRef] the scrolling box
 * @param {React.RefObject<HTMLElement>} [options.contentRef] the element inside
 *        it that grows with the content. Required alongside wrapperRef: for a
 *        non-window wrapper Lenis measures the wrapper but watches `content`
 *        for resizes, so pointing both at the same node means the height is
 *        never re-measured when the content changes.
 */
export const useMomentumScroll = ({ wrapperRef, contentRef } = {}) => {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const scoped = Boolean(wrapperRef);

    let lenis = null;
    let rafId = 0;
    let resizeObserver = null;

    const start = () => {
      if (lenis) return;

      const wrapper = scoped ? wrapperRef.current : window;
      const content = scoped ? (contentRef?.current ?? wrapperRef.current) : undefined;
      // A scoped target may not be mounted on the first pass. sync() runs again
      // on the observers below, so there is nothing to retry here.
      if (scoped && !wrapper) return;

      lenis = new Lenis({ ...FEEL, wrapper, ...(content ? { content } : {}) });
      if (!scoped) lenisInstance = lenis;

      const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
      rafId = requestAnimationFrame(raf);

      /*
       * Lenis caches the scrollable height. Every page here fills in after first
       * paint - the portfolio documents, the GitHub project list, an opened
       * README - so the document grows while someone is already scrolling.
       * Against a stale height Lenis clamps to the wrong maximum, which is felt
       * as the scroll hitting an invisible wall partway down the page. Watching
       * for size changes and re-measuring is what keeps it honest.
       *
       * Scoped instances get this for free from Lenis's own observer on
       * `content`, so this only covers the page-level case.
       */
      if (!scoped && typeof ResizeObserver !== 'undefined') {
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
  }, [wrapperRef, contentRef]);
};

export default useMomentumScroll;

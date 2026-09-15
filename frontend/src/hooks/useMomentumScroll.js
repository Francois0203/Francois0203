import { useEffect } from 'react';
import Lenis from 'lenis';

// The window-level instance, so navigation code can drive it rather than
// fight it. Scoped instances deliberately do not register here.
let lenisInstance = null;
export const getLenis = () => lenisInstance;

/**
 * Move the page. Through the momentum scroller when one is running, since it
 * owns the position and would overwrite a raw window.scrollTo next frame.
 *
 * @param {number|HTMLElement} target offset, or an element to bring into view.
 * @param {object} [options] `immediate` skips the glide, for a navigation.
 */
export const scrollPageTo = (target, { immediate = false, offset = 0 } = {}) => {
  const lenis = lenisInstance;
  if (lenis) { lenis.scrollTo(target, { immediate, offset, force: true }); return; }

  if (typeof target === 'number') {
    window.scrollTo({ top: target + offset, left: 0, behavior: immediate ? 'instant' : 'smooth' });
  } else if (target) {
    target.scrollIntoView({ block: 'start', behavior: immediate ? 'instant' : 'smooth' });
  }
};

const prefersReduced = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The in-app motion toggle. Someone who turns animation off and still gets
// an inertial scroller has been ignored.
const motionDisabled = () =>
  document.documentElement.getAttribute('data-no-animations') === 'true';

const FEEL = {
  lerp: 0.075,           // lower = longer, weightier glide (more momentum)
  smoothWheel: true,
  wheelMultiplier: 1.25, // more travel per wheel notch
  touchMultiplier: 1.4,
  // Hands the wheel back to anything that scrolls itself. Without it a
  // nested scroller is swallowed by preventDefault and will not move.
  allowNestedScroll: true,
};

/**
 * Momentum scrolling via Lenis, for /admin only: the public site runs on
 * native scroll, because a main thread scroller defeats scroll driven CSS.
 * Off under reduced motion or the in-app motion toggle, followed live.
 *
 * @param {object} [options] `wrapperRef` is the scrolling box and
 *        `contentRef` the element that grows, which Lenis watches for
 *        resizes. One node for both means the height is never re-measured.
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
      // May not be mounted yet. The observers below run sync() again.
      if (scoped && !wrapper) return;

      lenis = new Lenis({ ...FEEL, wrapper, ...(content ? { content } : {}) });
      if (!scoped) lenisInstance = lenis;

      const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
      rafId = requestAnimationFrame(raf);

      /* Lenis caches the scrollable height, and content arrives after first
         paint. Against a stale height it clamps to the wrong maximum, felt
         as an invisible wall partway down. */
      if (!scoped && typeof ResizeObserver !== 'undefined') {
        // One call per frame, or a settling image lurches the position.
        let pending = 0;
        resizeObserver = new ResizeObserver(() => {
          if (pending) return;
          pending = requestAnimationFrame(() => {
            pending = 0;
            lenis?.resize();
          });
        });
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

    // Follow the motion toggle without a reload.
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

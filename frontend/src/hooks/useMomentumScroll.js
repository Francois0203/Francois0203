import { useEffect } from 'react';
import Lenis from 'lenis';

let lenisInstance = null;

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

const motionDisabled = () =>
  document.documentElement.getAttribute('data-no-animations') === 'true';

const FEEL = {
  lerp: 0.075,           // lower = longer, weightier glide (more momentum)
  smoothWheel: true,
  wheelMultiplier: 1.25, // more travel per wheel notch
  touchMultiplier: 1.4,
  allowNestedScroll: true,
};

// The page glides only where a wheel or trackpad drives it. Touch screens keep their own momentum, which is
// already smooth and which a script can only make worse. Weak machines and open dialogs keep plain scrolling.
const wheelDevice = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const weakMachine = () => document.documentElement.dataset.tier === 'low';
const pageLocked = () => document.body.style.overflow === 'hidden';

const useMomentumScroll = ({ wrapperRef, contentRef, feel } = {}) => {
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

      lenis = new Lenis({ ...FEEL, ...feel, wrapper, ...(content ? { content } : {}) });
      if (!scoped) lenisInstance = lenis;

      const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
      rafId = requestAnimationFrame(raf);

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
      else if (!scoped && (!wheelDevice() || weakMachine() || pageLocked())) stop();
      else start();
    };

    sync();

    // Follow the motion toggle without a reload.
    const attrObserver = new MutationObserver(sync);
    attrObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-no-animations', 'data-tier'],
    });

    // A dialog locks the page by hiding the overflow of the body. Scrolling goes back to the browser while it is open.
    const lockObserver = scoped ? null : new MutationObserver(sync);
    lockObserver?.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    const pointer = scoped ? null : window.matchMedia('(hover: hover) and (pointer: fine)');
    pointer?.addEventListener('change', sync);

    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    mq?.addEventListener('change', sync);

    return () => {
      attrObserver.disconnect();
      lockObserver?.disconnect();
      pointer?.removeEventListener('change', sync);
      mq?.removeEventListener('change', sync);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapperRef, contentRef]);
};

export default useMomentumScroll;

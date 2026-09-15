import { useEffect, useRef, useState } from 'react';

/**
 * Fires once when an element first reaches the viewport, then disconnects.
 * Pair with the `[data-rise]` and `.mask` utilities in styles/reveal.css.
 *
 * @param {object}  [options]
 * @param {number}  [options.threshold=0.12] fraction visible before it fires.
 * @param {string}  [options.rootMargin] a negative bottom margin reveals
 *        slightly after an element enters, which reads as deliberate.
 * @param {boolean} [options.enabled=true] false reports shown immediately.
 */
const useReveal = ({
  threshold = 0.12,
  rootMargin = '0px 0px -8% 0px',
  enabled = true,
} = {}) => {
  const ref = useRef(null);
  // When disabled, report shown immediately so content is never left hidden.
  const [shown, setShown] = useState(!enabled);

  useEffect(() => {
    if (!enabled) { setShown(true); return undefined; }

    const el = ref.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === 'undefined') { setShown(true); return undefined; }

    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShown(true);
      obs.disconnect();
    }, { threshold, rootMargin });

    obs.observe(el);

    /* Safety net. An observer can fail to fire for reasons that have nothing
       to do with the reader, and the cost of being wrong is an invisible
       section. After a short wait, show it anyway. */
    const failsafe = setTimeout(() => {
      setShown(true);
      obs.disconnect();
    }, 1600);

    return () => {
      clearTimeout(failsafe);
      obs.disconnect();
    };
  }, [enabled, threshold, rootMargin]);

  return [ref, shown];
};

export default useReveal;

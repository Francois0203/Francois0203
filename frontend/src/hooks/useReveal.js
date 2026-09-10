import { useEffect, useRef, useState } from 'react';

/**
 * Fires once when an element first reaches the viewport.
 *
 * The site had grown three independent copies of this - `useInView` in
 * pages/Home, `useReveal` in components/Roadmap, and the lazy-load observer in
 * components/Site Showcase - each with slightly different thresholds and
 * margins, so a card on one page appeared at a different point in the scroll
 * than the equivalent card on another. One implementation, one set of defaults,
 * one place to change them.
 *
 * Fires once and disconnects: a reveal that replays every time the reader
 * scrolls back up is a distraction, not a flourish.
 *
 * Pair with the `[data-reveal]` utility in styles/Reveal.css, which owns the
 * actual motion, so a page opts in with an attribute rather than writing its
 * own keyframes.
 *
 * @param {object}  [options]
 * @param {number}  [options.threshold=0.12] fraction visible before it fires.
 * @param {string}  [options.rootMargin='0px 0px -8% 0px'] the negative bottom
 *        margin means an element reveals slightly after it technically enters,
 *        which reads as deliberate rather than pre-emptive.
 * @param {boolean} [options.enabled=true] pass false to opt out entirely - the
 *        Roadmap does this when CSS scroll-driven animation is available and
 *        the observer would be redundant.
 * @returns {[React.RefObject<HTMLElement>, boolean]}
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
    return () => obs.disconnect();
  }, [enabled, threshold, rootMargin]);

  return [ref, shown];
};

export default useReveal;

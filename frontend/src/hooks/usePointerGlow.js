import { useCallback, useEffect, useRef } from 'react';
import { motionAllowed } from '../components/Custom Buttons/motion';

/**
 * Cursor-tracked glow position, without the layout thrash.
 *
 * Four components had grown the same implementation independently - the desktop
 * nav capsule, the settings cog, the mobile nav trigger and its link bubbles -
 * and all four had the same three faults:
 *
 *   1. `getBoundingClientRect()` inside a `mousemove` handler. The rect does
 *      not change for the duration of a hover, but reading it forces a
 *      synchronous layout, so the browser had to flush layout on every pointer
 *      sample. At 120Hz that is 120 forced layouts a second, for a glow.
 *   2. `setState` per pointer sample, which schedules a React render per
 *      sample. The desktop nav is fixed and mounted on every public page.
 *   3. The resulting `--glow-x`/`--glow-y` were written as inline custom
 *      properties on an ancestor. Custom properties inherit, so that
 *      invalidated the computed style of every descendant - the pill, the
 *      list, every button, every label - on every sample.
 *
 * This hook measures once on enter, coalesces every subsequent sample into a
 * single rAF, and writes the two values straight to the element it is attached
 * to. No state, no renders, no inherited invalidation beyond the glow layer.
 *
 * `--glow-show` is deliberately NOT managed here: callers gate it on their own
 * state (open/closed, disabled, hovered), which changes at most twice per
 * hover and is therefore fine as React state.
 *
 * @param {React.RefObject<HTMLElement>} [externalRef] pass an existing ref when
 *        the caller already needs one for other purposes (the desktop nav
 *        measures its own capsule for the pill), otherwise use the one returned.
 * @returns {{ref: React.RefObject<HTMLElement>, glowHandlers: object}} spread
 *          `glowHandlers` onto the element and give it `ref` - or wire the three
 *          handlers individually when one of those props is already in use.
 */
const usePointerGlow = (externalRef) => {
  const ownRef = useRef(null);
  const ref = externalRef ?? ownRef;
  const rectRef = useRef(null);
  const rafRef = useRef(0);
  const nextRef = useRef({ x: 50, y: 50 });

  const flush = useCallback(() => {
    rafRef.current = 0;
    const el = ref.current;
    if (!el) return;
    const { x, y } = nextRef.current;
    el.style.setProperty('--glow-x', `${x.toFixed(2)}%`);
    el.style.setProperty('--glow-y', `${y.toFixed(2)}%`);
  }, []);

  // Measured once per hover. A fixed-position control does not move while the
  // pointer is inside it, and re-reading per sample was the whole problem.
  const onPointerEnter = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    rectRef.current = el.getBoundingClientRect();
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!motionAllowed()) return;
    const r = rectRef.current;
    if (!r || r.width === 0 || r.height === 0) return;

    nextRef.current = {
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    };

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(flush);
  }, [flush]);

  const onPointerLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    rectRef.current = null;
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return {
    ref,
    glowHandlers: { onPointerEnter, onPointerMove, onPointerLeave },
  };
};

export default usePointerGlow;

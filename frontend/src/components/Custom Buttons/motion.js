/**
 * Shared gates for the pointer-driven buttons.
 *
 * Both of these were missing before, and each caused a real defect:
 *
 *   - The magnetic and glow buttons attached mousemove handlers and ran a RAF
 *     loop on every device. On a phone a tap synthesises a mouseenter, so the
 *     button would pull toward the touch point and stay there until something
 *     else was tapped.
 *
 *   - Neither respected the site's own Reduce Animations switch. The CSS was
 *     silenced by `[data-no-animations="true"] *`, but the JS kept running -
 *     it writes inline transforms through custom properties, which that rule
 *     cannot reach. A user who asked for less motion still got a button that
 *     followed their cursor.
 */

/** True only for a real, hoverable pointer - excludes touch and stylus. */
export const hasFinePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(hover: hover) and (pointer: fine)').matches === true;

/**
 * Whether pointer-driven motion is allowed right now.
 *
 * Read at interaction time rather than at mount: `data-no-animations` is
 * toggled live from Settings, and the buttons must not need a remount to
 * notice. The DOM attribute is checked first because it is the explicit user
 * choice - useAnimations already seeds it from prefers-reduced-motion, but the
 * media query is kept as a fallback for the frame before that effect runs.
 */
export const motionAllowed = () => {
  if (typeof window === 'undefined') return false;
  if (document.documentElement.dataset.noAnimations === 'true') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  return hasFinePointer();
};

/** Linear interpolation - the smoothing applied to raw cursor positions. */
export const lerp = (a, b, t) => a + (b - a) * t;

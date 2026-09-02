import { useCallback, useEffect, useRef } from 'react';
import { lerp, motionAllowed } from './motion';
import styles from './CursorGlowButton.module.css';

/**
 * A glass button lit by a spotlight that follows the cursor across its surface
 * and around its border.
 *
 * Two things changed from the previous version:
 *
 *   - It no longer re-renders. The old one kept an `isHovered` state purely to
 *     drive an inline `--glow-opacity`, so every hover and unhover cost React a
 *     render of the button and its children. Opacity is now a CSS :hover
 *     concern, and React never re-renders after mount.
 *
 *   - The glow is two gradients instead of five. Three stacked radial
 *     gradients on the surface plus one on the border is four gradients being
 *     recomputed every frame for a difference nobody can see. One tight
 *     spotlight and one soft bloom carry the whole effect.
 */

/** Smoothing per frame. Slightly slacker than the magnetic button - the glow
 *  trailing the cursor is what makes it read as light rather than a cursor. */
const EASE = 0.14;
const EPSILON = 0.3;   // px; the glow is soft, so it can settle coarsely

const CursorGlowButton = ({
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
  ...rest
}) => {
  const buttonRef = useRef(null);
  const rafRef    = useRef(0);
  const current   = useRef({ x: 0, y: 0 });
  const target    = useRef({ x: 0, y: 0 });
  const active    = useRef(false);

  const write = useCallback((x, y) => {
    const btn = buttonRef.current;
    if (!btn) return;
    btn.style.setProperty('--glow-x', `${x.toFixed(1)}px`);
    btn.style.setProperty('--glow-y', `${y.toFixed(1)}px`);
  }, []);

  const tick = useCallback(() => {
    const x = lerp(current.current.x, target.current.x, EASE);
    const y = lerp(current.current.y, target.current.y, EASE);
    const settled =
      Math.abs(x - target.current.x) < EPSILON &&
      Math.abs(y - target.current.y) < EPSILON;

    current.current = settled ? { ...target.current } : { x, y };
    write(current.current.x, current.current.y);

    if (active.current) rafRef.current = requestAnimationFrame(tick);
    else rafRef.current = 0;
  }, [write]);

  const handlePointerEnter = useCallback((e) => {
    if (disabled || !motionAllowed()) return;
    const btn = buttonRef.current;
    if (!btn) return;

    // Seed both positions at the entry point. Without this the glow lerps in
    // from wherever it was left last time - usually the opposite edge - and
    // the first ~150ms of every hover is a light streaking across the button.
    const rect = btn.getBoundingClientRect();
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    current.current = { ...p };
    target.current  = { ...p };
    write(p.x, p.y);

    active.current = true;
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [disabled, tick, write]);

  const handlePointerMove = useCallback((e) => {
    const btn = buttonRef.current;
    if (!btn || !active.current) return;
    const rect = btn.getBoundingClientRect();
    target.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  // The glow fades out via CSS on unhover, so the loop can stop immediately -
  // there is no return journey to animate.
  const handlePointerLeave = useCallback(() => {
    active.current = false;
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <button
      ref={buttonRef}
      type={type}
      className={`${styles.button} ${className}`}
      disabled={disabled}
      onClick={onClick}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...rest}
    >
      <span className={styles.glow} aria-hidden="true" />
      <span className={styles.edge} aria-hidden="true" />
      <span className={styles.content}>{children}</span>
    </button>
  );
};

export default CursorGlowButton;

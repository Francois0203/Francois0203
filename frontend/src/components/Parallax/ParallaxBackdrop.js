import useParallax from '../../hooks/useParallax';
import styles from './ParallaxBackdrop.module.css';

/**
 * The site's backdrop: four fixed layers, four different scroll rates.
 *
 * ── What it replaced ────────────────────────────────────────────────────────
 * Home carried a single `.ambient` div - two radial washes, fixed, painted
 * once and never moved - and every other page carried nothing at all. So three
 * of the four pages had a flat ground, and the one that did not had a wash
 * that was pinned to the viewport and therefore, while scrolling, the one
 * thing on screen that was provably not moving.
 *
 * It is mounted once in the app layout rather than per page, which is what
 * makes the depth continuous: scrolling from the bottom of Home into the
 * footer and on to Bio moves through one backdrop instead of crossing between
 * two unrelated ones.
 *
 * ── The layers, far to near ─────────────────────────────────────────────────
 *   1. `wash`   the two coloured grounds, warm and cool. Slowest, because it
 *               is the horizon - a horizon that moves is a hill.
 *   2. `grid`   a hairline lattice. This is the layer that actually sells the
 *               effect: a wash sliding behind text is ambiguous, whereas
 *               ruled lines passing at a visibly different speed to the
 *               content cannot be read as anything but distance.
 *   3. `orbs`   three soft bloom shapes in the two accent families, between
 *               the lattice and the reader.
 *   4. `motes`  a sparse dot field. Nearest, so fastest, and small enough that
 *               its speed reads as proximity rather than as clutter.
 *
 * The rates are what matter, not their absolute values: depth is the
 * *difference* between two layers, so these are spaced roughly geometrically
 * (0.03, 0.08, 0.05, 0.17) rather than evenly. The orbs deliberately sit
 * slower than the lattice they are in front of - see the stylesheet, where
 * they are also the layer that is scaled rather than tiled.
 *
 * Both repeating layers pass a `period` equal to their tile height, so their
 * drift wraps and never ends. The two that cannot wrap are capped instead, and
 * are the two diffuse ones, where a cap is not perceptible.
 *
 * ── Why each layer is two elements ─────────────────────────────────────────
 * The outer element carries the mask that fades the layer out at the edges of
 * the viewport; the inner plate carries the paint and the transform. They have
 * to be separate for the two wrapping layers: a mask is not periodic, so if it
 * travelled with the pattern then every wrap would step the fade 72px sideways
 * and the "invisible" reset would be visible after all. A static mask over a
 * moving plate has nothing to give away.
 *
 * `aria-hidden` throughout and `pointer-events: none` in the stylesheet: this
 * is decoration with no content in it, and nothing here may ever intercept a
 * click meant for the page.
 */
const ParallaxBackdrop = () => {
  const wash  = useParallax({ mode: 'page', rate: 0.03, max: 320 });
  const grid  = useParallax({ mode: 'page', rate: 0.08, period: 72 });
  const orbs  = useParallax({ mode: 'page', rate: 0.05, max: 420 });
  const motes = useParallax({ mode: 'page', rate: 0.17, period: 26 });

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={`${styles.layer} ${styles.washLayer}`}>
        <div ref={wash} className={`${styles.plate} ${styles.wash}`} />
      </div>
      <div className={`${styles.layer} ${styles.gridLayer}`}>
        <div ref={grid} className={`${styles.plate} ${styles.grid}`} />
      </div>
      <div className={`${styles.layer} ${styles.orbsLayer}`}>
        <div ref={orbs} className={`${styles.plate} ${styles.orbs}`} />
      </div>
      <div className={`${styles.layer} ${styles.motesLayer}`}>
        <div ref={motes} className={`${styles.plate} ${styles.motes}`} />
      </div>
    </div>
  );
};

export default ParallaxBackdrop;

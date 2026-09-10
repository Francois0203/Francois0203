import { useEffect, useRef } from 'react';
import useReveal from '../../hooks/useReveal';
import styles from './StatRow.module.css';

/**
 * Figures that count up when they arrive.
 *
 * ── Why this is JavaScript when almost nothing else here is ──────────────────
 * The rest of the site's motion is CSS, and scroll-driven where it can be. A
 * counter cannot be: CSS can interpolate a registered custom property, but it
 * cannot render that number as text. `counter-reset` with an animated variable
 * is the usual trick and it produces an integer that browsers disagree about
 * rounding. So this runs one rAF loop per mount, which ends as soon as the
 * numbers land and never restarts.
 *
 * The loop writes `textContent` directly rather than setting state, because a
 * state-driven counter is one React render per frame per figure - five figures
 * at 60fps is 300 renders a second to animate some text.
 *
 * ── Honesty ──────────────────────────────────────────────────────────────────
 * Every figure is derived from real data (see buildStats in pages/Home). None
 * of them are decorative. A portfolio claiming to be a data scientist's should
 * not put invented numbers on its front page.
 */

/** Long enough to read as counting, short enough not to be a loading bar. */
const DURATION = 1100;

/* Starts fast and settles, so the last few digits are legible rather than a
 * blur. The same curve as --ease-out, expressed as a function because rAF needs
 * to evaluate it. */
const easeOut = (t) => 1 - (1 - t) ** 3;

const StatRow = ({ stats = [] }) => {
  const [ref, shown] = useReveal({ threshold: 0.3 });
  const valueRefs = useRef([]);

  useEffect(() => {
    if (!shown) return undefined;

    const nodes = valueRefs.current.filter(Boolean);
    if (nodes.length === 0) return undefined;

    // Respect both motion preferences: skip straight to the final figures.
    const still =
      document.documentElement.dataset.noAnimations === 'true' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (still) {
      nodes.forEach((node, i) => { node.textContent = String(stats[i]?.value ?? ''); });
      return undefined;
    }

    let raf = 0;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = easeOut(t);

      nodes.forEach((node, i) => {
        const target = stats[i]?.value ?? 0;
        node.textContent = String(Math.round(target * eased));
      });

      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, stats]);

  if (stats.length === 0) return null;

  return (
    <dl
      ref={ref}
      className={styles.row}
      data-reveal-shown={shown ? '' : undefined}
      style={{ '--reveal-step': '70ms' }}
    >
      {stats.map((stat, i) => (
        <div key={stat.label} className={styles.stat} data-reveal style={{ '--i': i }}>
          <dt className={styles.label}>{stat.label}</dt>
          <dd className={styles.value}>
            {/* Starts at the final figure so a reader with JS disabled, or one
                who arrives after the observer has fired, still sees the number
                rather than a zero. */}
            <span ref={(el) => { valueRefs.current[i] = el; }} className={styles.number}>
              {stat.value}
            </span>
            {stat.suffix && <span className={styles.suffix}>{stat.suffix}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default StatRow;

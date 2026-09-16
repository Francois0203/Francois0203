import { useEffect, useRef } from 'react';
import useReveal from '../../hooks/useReveal';
import styles from './Tally.module.css';

/*
 * The figures, set as oversized outlined numerals that ink in as they count.
 * Every value is derived from real records.
 *
 * The count-up writes textContent from one rAF loop; through state it would be
 * four renders a frame to animate digits.
 */

const DURATION = 1400;
const easeOut = (t) => 1 - (1 - t) ** 4;

const Tally = ({ figures = [] }) => {
  const [ref, shown] = useReveal({ threshold: 0.25 });
  const cells = useRef([]);

  useEffect(() => {
    if (!shown) return undefined;
    const nodes = cells.current.filter(Boolean);
    if (!nodes.length) return undefined;

    const still = document.documentElement.dataset.noAnimations === 'true'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (still) {
      nodes.forEach((n, i) => { n.textContent = String(figures[i]?.value ?? ''); });
      return undefined;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / DURATION);
      const e = easeOut(p);
      nodes.forEach((n, i) => {
        n.textContent = String(Math.round((figures[i]?.value ?? 0) * e));
      });
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, figures]);

  if (!figures.length) return null;

  return (
    <dl
      ref={ref}
      className={styles.tally}
      data-shown={shown ? '' : undefined}
      style={{ '--step': '120ms' }}
    >
      {figures.map((f, i) => (
        <div key={f.label} className={styles.figure} style={{ '--i': i }}>
          <dd className={styles.value}>
            {/* The final figure, so a late arrival sees a number not a zero. */}
            <span ref={(el) => { cells.current[i] = el; }}>{f.value}</span>
          </dd>
          <dt className={styles.label}>{f.label}</dt>
        </div>
      ))}
    </dl>
  );
};

export default Tally;

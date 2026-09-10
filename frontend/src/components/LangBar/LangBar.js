import { useMemo } from 'react';
import useReveal from '../../hooks/useReveal';
import { langColor } from '../../pages/Projects/langColors';
import styles from './LangBar.module.css';

/**
 * The language mix across the repositories, as one stacked bar.
 *
 * ── Why a chart belongs on this page ─────────────────────────────────────────
 * The repositories already state their language one card at a time, which
 * answers "what is this written in" and never answers "what does he actually
 * work in". A single bar answers the second question in one glance, and it is
 * the only honest way to show it: every segment is a count of real repositories,
 * so the widths cannot flatter anything.
 *
 * ── Why it is a segment count, not lines of code ─────────────────────────────
 * GitHub reports bytes per language per repository, which would need one extra
 * API call per repo and would let a single vendored file dominate the chart.
 * Counting repositories by primary language is coarser and much harder to
 * mislead with, and the label says exactly which it is.
 *
 * ── How it animates without costing layout ───────────────────────────────────
 * Each segment's share is its `flex-grow`, so the browser lays the bar out
 * once. The entrance then animates `transform: scaleX` from a left origin,
 * which is composited - animating `width` here would relayout the whole bar on
 * every frame, and there are up to eight segments.
 */

/** Below this share a segment is too thin to read, so the tail is grouped. */
const MIN_SHARE = 0.04;

const LangBar = ({ projects = [], onSelect, active = null }) => {
  const [ref, shown] = useReveal({ threshold: 0.35 });

  const { segments, total } = useMemo(() => {
    const counts = new Map();

    projects.forEach((p) => {
      if (!p.language) return;
      counts.set(p.language, (counts.get(p.language) ?? 0) + 1);
    });

    const sum = [...counts.values()].reduce((a, b) => a + b, 0);
    if (sum === 0) return { segments: [], total: 0 };

    const ranked = [...counts.entries()]
      .map(([name, count]) => ({ name, count, share: count / sum }))
      .sort((a, b) => b.count - a.count);

    // Everything under the readable minimum becomes one "Other" segment, so the
    // bar never renders a 2px sliver nobody can point at.
    const kept = ranked.filter(s => s.share >= MIN_SHARE);
    const rest = ranked.filter(s => s.share < MIN_SHARE);

    if (rest.length > 0) {
      const count = rest.reduce((a, s) => a + s.count, 0);
      kept.push({ name: 'Other', count, share: count / sum, isOther: true });
    }

    return { segments: kept, total: sum };
  }, [projects]);

  if (segments.length === 0) return null;

  return (
    <figure
      ref={ref}
      className={styles.wrap}
      data-reveal-shown={shown ? '' : undefined}
      style={{ '--reveal-step': '60ms' }}
    >
      <figcaption className={styles.caption}>
        Primary language across {total} {total === 1 ? 'repository' : 'repositories'}
      </figcaption>

      <div className={styles.bar}>
        {segments.map((seg, i) => (
          <span
            key={seg.name}
            className={styles.seg}
            data-dim={active && active !== seg.name ? '' : undefined}
            style={{
              '--share': seg.count,
              '--tint': langColor(seg.name),
              '--i': i,
            }}
            /* The bar is described by the legend below it, which carries the
               same figures as text. Announcing both would read every language
               twice. */
            aria-hidden="true"
          />
        ))}
      </div>

      <ul className={styles.legend}>
        {segments.map((seg, i) => {
          const isActive = active === seg.name;
          const pct = Math.round(seg.share * 100);

          /* "Other" is a bucket this component invented, so there is nothing
             coherent to filter the grid down to. It stays a plain readout. */
          if (seg.isOther || !onSelect) {
            return (
              <li key={seg.name} className={styles.item} data-reveal style={{ '--i': i }}>
                <span className={styles.dot} style={{ '--tint': langColor(seg.name) }} aria-hidden="true" />
                {seg.name}
                <span className={styles.pct}>{pct}%</span>
              </li>
            );
          }

          return (
            <li key={seg.name} className={styles.item} data-reveal style={{ '--i': i }}>
              <button
                type="button"
                className={styles.chip}
                aria-pressed={isActive}
                onClick={() => onSelect(isActive ? null : seg.name)}
              >
                <span className={styles.dot} style={{ '--tint': langColor(seg.name) }} aria-hidden="true" />
                {seg.name}
                <span className={styles.pct}>{pct}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </figure>
  );
};

export default LangBar;

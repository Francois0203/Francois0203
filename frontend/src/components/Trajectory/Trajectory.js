import { useCallback, useEffect, useRef, useState } from 'react';
import { MdArrowOutward } from 'react-icons/md';
import styles from './Trajectory.module.css';

/**
 * The career roadmap, drawn as a single measured line rather than a stack of
 * cards on a dashed spine.
 *
 * Three columns: the period, the rail, the entry. The rail carries a hairline
 * track with a lit fill that grows as the section is scrolled, and a head that
 * travels with it; each node ignites as the fill reaches it.
 *
 * Motion is CSS scroll-driven (`view-timeline` / `animation-timeline`), so the
 * scrubbing runs off the main thread with no scroll listener and no rAF loop.
 * Where that is unsupported the fill is simply drawn in full and the entries
 * fade in from an IntersectionObserver, so nothing depends on the new syntax.
 */

const SUPPORTS_SCROLL_TIMELINE =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('animation-timeline: view()');

/** Fallback reveal for browsers without scroll-driven animation. */
const useReveal = (enabled) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(!enabled);

  useEffect(() => {
    if (!enabled) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setShown(true);
        obs.disconnect();
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [enabled]);

  return [ref, shown];
};

/**
 * Publishes the rail's pixel height as --rail-h so the travelling head can be
 * animated with a composited translate instead of `top`. One write per resize,
 * never per frame.
 */
const useRailHeight = (enabled) => {
  const railRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const el = railRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;

    const obs = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      el.style.setProperty('--rail-h', `${Math.round(h)}px`);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [enabled]);

  return railRef;
};

const Trajectory = ({ stops = [], onSelect, emptyText = 'The journey is being written.' }) => {
  // Only pay for the observer when the CSS cannot do the work itself.
  const [ref, shown] = useReveal(!SUPPORTS_SCROLL_TIMELINE);
  const railRef = useRailHeight(SUPPORTS_SCROLL_TIMELINE);

  const handleSelect = useCallback(
    (stop) => () => onSelect?.(stop),
    [onSelect],
  );

  if (stops.length === 0) {
    return <p className={styles.empty}>{emptyText}</p>;
  }

  return (
    <div
      ref={ref}
      className={styles.wrap}
      data-shown={shown ? 'true' : 'false'}
      data-scrubbed={SUPPORTS_SCROLL_TIMELINE ? 'true' : 'false'}
    >
      {/* The rail is a sibling of the list, not a child of it: <ol> may only
          contain <li>, and the fill has to be one continuous element because a
          per-item border would restart at every row. It is pinned to the same
          column the items reserve for it, so the two stay in register. */}
      <div ref={railRef} className={styles.rail} aria-hidden="true">
        <span className={styles.railTrack} />
        <span className={styles.railFill} />
        <span className={styles.railHead} />
      </div>

      <ol className={styles.list}>
        {stops.map((s, i) => {
          const isEdu = s.kind === 'education';
          return (
            <li key={s.id ?? i} className={styles.item} style={{ '--i': i }}>
              <p className={styles.period}>
                <span className={styles.periodText}>{s.period ?? ''}</span>
                <span
                  className={`${styles.kind} ${isEdu ? styles.kindEdu : styles.kindWork}`}
                >
                  {isEdu ? 'Education' : 'Experience'}
                </span>
              </p>

              <span className={styles.nodeCell} aria-hidden="true">
                <span className={styles.tick} />
                <span className={styles.node}>
                  <span className={styles.nodeCore} />
                </span>
              </span>

              <button
                type="button"
                className={styles.entry}
                onClick={handleSelect(s)}
                disabled={!onSelect}
              >
                <span className={styles.entryTitle}>
                  {s.title}
                  <MdArrowOutward className={styles.entryArrow} aria-hidden="true" />
                </span>
                {s.subtitle && <span className={styles.entrySub}>{s.subtitle}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default Trajectory;

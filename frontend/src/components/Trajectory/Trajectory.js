import {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { MdArrowOutward } from 'react-icons/md';
import styles from './Trajectory.module.css';

/**
 * The career roadmap, drawn as a single meandering line rather than a stack of
 * cards on a dashed spine.
 *
 * Three columns: the period, the rail, the entry. The rail carries a curve that
 * weaves between two x positions and passes through every node, drawn with the
 * scroll; each node ignites as the stroke reaches it.
 *
 * ── Why the curve is measured rather than authored ───────────────────────────
 * The nodes sit at row centres, and row heights depend on the content, the
 * font and the viewport. A hand-written path would only line up at one width.
 * So the component measures each node's y once per layout change and generates
 * a Catmull-Rom spline through those points. Measurement happens in a layout
 * effect and on a ResizeObserver, never per frame and never on scroll.
 *
 * ── Motion ───────────────────────────────────────────────────────────────────
 * The stroke is scrubbed by scroll position with CSS scroll-driven animation
 * (view-timeline / animation-timeline), so there is no scroll listener and no
 * rAF loop. Drawing a curve means animating stroke-dashoffset, which is a paint
 * rather than a composite: that is a deliberate trade for the curve, and it is
 * one 2px path, repainted within its own layer. Every other moving part here -
 * nodes, ticks, the travelling head - is transform and opacity only.
 *
 * Where scroll-driven animation is unsupported the curve is simply drawn in
 * full and the rows fade in from a single IntersectionObserver.
 */

const SUPPORTS_SCROLL_TIMELINE =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('animation-timeline: view()');

/** Horizontal travel of the weave, as a fraction of the rail's width. */
const AMPLITUDE = 0.34;

/**
 * Catmull-Rom through the points, converted to cubic beziers. A polyline
 * between alternating x positions would be a zigzag; this is the same set of
 * points read as a curve.
 */
const splinePath = (pts) => {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;

  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)},`
       + ` ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
};

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

const Trajectory = ({ stops = [], onSelect, emptyText = 'The journey is being written.' }) => {
  const [ref, shown] = useReveal(!SUPPORTS_SCROLL_TIMELINE);

  const railRef = useRef(null);
  const listRef = useRef(null);
  const nodeRefs = useRef([]);

  /** { w, h, d, xs } - the rail box, the path, and each node's x. */
  const [geom, setGeom] = useState(null);

  const measure = useCallback(() => {
    const rail = railRef.current;
    const list = listRef.current;
    if (!rail || !list) return;

    const railBox = rail.getBoundingClientRect();
    const w = railBox.width;
    const h = list.getBoundingClientRect().height;
    if (w < 2 || h < 2) return;

    const amp = w * AMPLITUDE;
    const mid = w / 2;

    const pts = [];
    const xs = [];
    nodeRefs.current.slice(0, stops.length).forEach((cell, i) => {
      if (!cell) return;
      // Read against the rail, so the numbers are already in the SVG's own
      // coordinate space and no scroll offset can leak in.
      const box = cell.getBoundingClientRect();
      const y = box.top - railBox.top + box.height / 2;
      const x = mid + (i % 2 === 0 ? -amp : amp);
      pts.push([x, y]);
      xs.push(x);
    });

    if (pts.length === 0) return;

    // Extend a little past the first and last node so the line enters and
    // leaves the section instead of starting and stopping on a dot.
    const head = [pts[0][0], Math.max(0, pts[0][1] - 26)];
    const tail = [pts[pts.length - 1][0], Math.min(h, pts[pts.length - 1][1] + 26)];

    setGeom({ w, h, xs, d: splinePath([head, ...pts, tail]) });
  }, [stops.length]);

  // Layout effect: the path is in place in the same frame the rows are, so
  // there is never a flash of a line in the wrong shape.
  useLayoutEffect(() => {
    measure();
  }, [measure, stops]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') return undefined;

    // One observer on the list covers every reflow that can move a node:
    // viewport width, font loading, and content changing underneath.
    const obs = new ResizeObserver(() => measure());
    obs.observe(list);
    return () => obs.disconnect();
  }, [measure]);

  const handleSelect = useCallback(
    (stop) => () => onSelect?.(stop),
    [onSelect],
  );

  // The head rides the same curve via offset-path, so it stays on the stroke
  // instead of tracking a straight line beside it.
  const headStyle = useMemo(
    () => (geom ? { offsetPath: `path("${geom.d}")` } : undefined),
    [geom],
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
      data-measured={geom ? 'true' : 'false'}
    >
      {/* The rail is a sibling of the list, not a child: <ol> may only contain
          <li>, and the curve has to be one continuous path because a per-row
          segment would restart the stroke at every row. */}
      <div ref={railRef} className={styles.rail} aria-hidden="true">
        {geom && (
          <svg
            className={styles.curve}
            width={geom.w}
            height={geom.h}
            viewBox={`0 0 ${geom.w} ${geom.h}`}
            fill="none"
            aria-hidden="true"
          >
            <path className={styles.curveTrack} d={geom.d} />
            <path className={styles.curveFill} d={geom.d} pathLength="1" />
          </svg>
        )}
        <span className={styles.head} style={headStyle} />
      </div>

      <ol ref={listRef} className={styles.list}>
        {stops.map((s, i) => {
          const isEdu = s.kind === 'education';
          const x = geom?.xs?.[i];
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

              <span
                className={styles.nodeCell}
                ref={(el) => { nodeRefs.current[i] = el; }}
                aria-hidden="true"
              >
                <span
                  className={styles.node}
                  style={x == null ? undefined : { left: `${x}px` }}
                >
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

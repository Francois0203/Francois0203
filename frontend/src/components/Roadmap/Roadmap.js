import {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { MdArrowOutward, MdSchool, MdWork } from 'react-icons/md';
import styles from './Roadmap.module.css';

/**
 * The journey as a route on a map.
 *
 * Waypoints alternate across the width, numbered in the order they happened,
 * and a trail is drawn through them from the first to the present one. The
 * reader travels it by scrolling: the trail draws, each waypoint lights as the
 * trail reaches it, and a traveller rides the line.
 *
 * ── Why the trail is measured, not authored ──────────────────────────────────
 * The waypoints sit wherever their rows put them, and row heights depend on
 * content, font and viewport, so a hand-drawn path would only line up at one
 * width. The component measures each marker after layout and fits a spline
 * through the centres, which is why the trail always passes exactly through
 * the pins. Measuring happens in a layout effect and on a ResizeObserver -
 * never on scroll, never per frame.
 *
 * ── Motion ───────────────────────────────────────────────────────────────────
 * Scrubbed by scroll with CSS scroll-driven animation, so there is no scroll
 * listener and no rAF loop. Drawing a line means animating stroke-dashoffset,
 * which paints rather than composites: a deliberate trade, and it is two thin
 * paths in one layer. Everything else - pins, labels, the traveller - is
 * transform and opacity.
 *
 * Where scroll-driven animation is unsupported the trail is drawn in full and
 * the waypoints fade in from a single IntersectionObserver, which is a
 * complete map rather than a broken one.
 */

const SUPPORTS_SCROLL_TIMELINE =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('animation-timeline: view()');

/**
 * Builds the trail explicitly rather than fitting a spline through the points.
 *
 * A Catmull-Rom fit was the first attempt and it was wrong for this shape. The
 * route now has three collinear points per waypoint (enter above, sit on the
 * pin, leave below), and a spline derives each tangent from the neighbours -
 * which are far away horizontally - so it threw big loops out past every
 * right-hand pin before curving back.
 *
 * The geometry here is a switchback: a straight vertical run through each
 * waypoint, joined by an S-bend whose control points share their endpoint's x.
 * That makes horizontal overshoot impossible - the curve is bounded by the two
 * pins it runs between - while keeping the joins tangent-continuous, so the
 * corners stay smooth.
 */
const buildRoute = (legs) => {
  if (legs.length === 0) return '';

  const first = legs[0];
  let d = `M ${first.x.toFixed(2)} ${first.top.toFixed(2)}`;
  d += ` L ${first.x.toFixed(2)} ${first.bottom.toFixed(2)}`;

  for (let i = 1; i < legs.length; i += 1) {
    const a = legs[i - 1];
    const b = legs[i];
    // Handle length scales with the gap, so a tight row bends tightly and a
    // loose one sweeps. Clamped so it never collapses to a corner or balloons.
    const gap = Math.max(1, b.top - a.bottom);
    const k = Math.min(80, Math.max(18, gap * 0.85));

    d += ` C ${a.x.toFixed(2)} ${(a.bottom + k).toFixed(2)},`
       + ` ${b.x.toFixed(2)} ${(b.top - k).toFixed(2)},`
       + ` ${b.x.toFixed(2)} ${b.top.toFixed(2)}`;
    d += ` L ${b.x.toFixed(2)} ${b.bottom.toFixed(2)}`;
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
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [enabled]);

  return [ref, shown];
};

/* ─── Map furniture ─────────────────────────────────────────────────────────
   Static decoration, drawn once and never animated. It is what separates a
   route on a map from a wavy line beside a list, and it costs nothing to
   render because none of it moves. */

const Graticule = () => (
  <defs>
    <pattern id="rm-grid" width="52" height="52" patternUnits="userSpaceOnUse">
      <path d="M 52 0 L 0 0 0 52" fill="none" stroke="currentColor" strokeWidth="1" />
    </pattern>
    <radialGradient id="rm-vignette" cx="50%" cy="50%" r="72%">
      <stop offset="55%" stopColor="#000" stopOpacity="0" />
      <stop offset="100%" stopColor="#000" stopOpacity="0.10" />
    </radialGradient>
  </defs>
);

const Compass = () => (
  <svg className={styles.compass} viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="26" className={styles.compassRing} />
    <circle cx="32" cy="32" r="20" className={styles.compassRing} />
    {/* Cardinal ticks, then the needle: north filled, south hollow. */}
    {[0, 90, 180, 270].map((a) => (
      <line
        key={a}
        x1="32" y1="4" x2="32" y2="11"
        className={styles.compassTick}
        transform={`rotate(${a} 32 32)`}
      />
    ))}
    <polygon points="32,10 37,32 32,28 27,32" className={styles.compassNorth} />
    <polygon points="32,54 27,32 32,36 37,32" className={styles.compassSouth} />
    <text x="32" y="49" className={styles.compassLabel} textAnchor="middle">N</text>
  </svg>
);

const Roadmap = ({ stops = [], onSelect, emptyText = 'The route is still being drawn.' }) => {
  const [ref, shown] = useReveal(!SUPPORTS_SCROLL_TIMELINE);

  const planeRef = useRef(null);
  const listRef = useRef(null);
  const pinRefs = useRef([]);
  const cardRefs = useRef([]);

  /** { w, h, d } - the plane's box and the fitted trail. */
  const [geom, setGeom] = useState(null);

  const measure = useCallback(() => {
    const plane = planeRef.current;
    const list = listRef.current;
    if (!plane || !list) return;

    const planeBox = plane.getBoundingClientRect();
    const w = planeBox.width;
    const h = planeBox.height;
    if (w < 2 || h < 2) return;

    /*
     * One leg per waypoint: the x of its pin, and the y it is entered and left
     * at. The trail runs straight down each leg and S-bends between them, so
     * the crossing to the opposite side happens in the gap between cards and
     * never over a label. The vertical runs sit in the pin column, which holds
     * no text by construction.
     */
    const CLEARANCE = 10;
    const legs = [];
    const count = Math.min(stops.length, pinRefs.current.length);

    for (let i = 0; i < count; i += 1) {
      const pin = pinRefs.current[i];
      if (!pin) continue;

      // Measured against the plane, so the numbers are already in the SVG's
      // coordinate space and no scroll offset can leak in.
      const pinBox = pin.getBoundingClientRect();
      const x = pinBox.left - planeBox.left + pinBox.width / 2;
      const y = pinBox.top - planeBox.top + pinBox.height / 2;

      const card = cardRefs.current[i];
      const cardBox = card ? card.getBoundingClientRect() : null;
      const cardTop = cardBox ? cardBox.top - planeBox.top : y;
      const cardBottom = cardBox ? cardBox.bottom - planeBox.top : y;

      legs.push({
        x,
        y,
        top: Math.min(y, cardTop - CLEARANCE),
        bottom: Math.max(y, cardBottom + CLEARANCE),
      });
    }

    if (legs.length === 0) return;

    // The trail runs on past the first and last waypoint, so the route reads as
    // arriving from somewhere and continuing, not as starting on a dot.
    const lead = [legs[0].x, Math.max(6, legs[0].top - 26)];
    // Longer than the lead: the end badge sits below the tail rather than on
    // it, so the trail needs room to arrive before the label starts.
    const tail = [legs[legs.length - 1].x, Math.min(h - 6, legs[legs.length - 1].bottom + 40)];

    legs[0].top = lead[1];
    legs[legs.length - 1].bottom = tail[1];

    setGeom({ w, h, d: buildRoute(legs), lead, tail });
  }, [stops.length]);

  useLayoutEffect(() => { measure(); }, [measure, stops]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') return undefined;
    const obs = new ResizeObserver(() => measure());
    obs.observe(list);
    return () => obs.disconnect();
  }, [measure]);

  const handleSelect = useCallback((stop) => () => onSelect?.(stop), [onSelect]);

  // The traveller rides the trail itself, so it stays on the route rather than
  // tracking a straight line beside it.
  const travellerStyle = useMemo(
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
      <div ref={planeRef} className={styles.plane}>
        {/* Everything in here is decoration; the list underneath carries all
            of the actual content. */}
        <svg
          className={styles.paper}
          width={geom?.w ?? 0}
          height={geom?.h ?? 0}
          viewBox={geom ? `0 0 ${geom.w} ${geom.h}` : '0 0 1 1'}
          fill="none"
          aria-hidden="true"
        >
          <Graticule />
          <rect width="100%" height="100%" fill="url(#rm-grid)" className={styles.grid} />

          {/* Contours: three soft closed curves, the way elevation reads on a
              printed map. Fixed shapes scaled to the plane, so they cost one
              paint and never reflow. */}
          {geom && (
            <g className={styles.contours}>
              <ellipse cx={geom.w * 0.22} cy={geom.h * 0.24} rx={geom.w * 0.20} ry={geom.h * 0.11} />
              <ellipse cx={geom.w * 0.22} cy={geom.h * 0.24} rx={geom.w * 0.13} ry={geom.h * 0.07} />
              <ellipse cx={geom.w * 0.79} cy={geom.h * 0.68} rx={geom.w * 0.22} ry={geom.h * 0.12} />
              <ellipse cx={geom.w * 0.79} cy={geom.h * 0.68} rx={geom.w * 0.14} ry={geom.h * 0.075} />
              <ellipse cx={geom.w * 0.79} cy={geom.h * 0.68} rx={geom.w * 0.07} ry={geom.h * 0.035} />
            </g>
          )}

          {geom && (
            <>
              {/* The route not yet travelled: a dashed trail, the way a path is
                  drawn on a map. */}
              <path className={styles.trailTrack} d={geom.d} />
              {/* The route travelled, drawn by the scroll. */}
              <path className={styles.trailDrawn} d={geom.d} pathLength="1" />
            </>
          )}

          <rect width="100%" height="100%" fill="url(#rm-vignette)" />
        </svg>

        <Compass />

        {geom && (
          <>
            <span
              className={`${styles.terminus} ${styles.terminusStart}`}
              style={{ left: `${geom.lead[0]}px`, top: `${geom.lead[1]}px` }}
              aria-hidden="true"
            >
              Start
            </span>
            <span
              className={`${styles.terminus} ${styles.terminusEnd}`}
              style={{ left: `${geom.tail[0]}px`, top: `${geom.tail[1]}px` }}
              aria-hidden="true"
            >
              Here
            </span>
            <span className={styles.traveller} style={travellerStyle} aria-hidden="true" />
          </>
        )}

        <ol ref={listRef} className={styles.list}>
          {stops.map((s, i) => {
            const isEdu = s.kind === 'education';
            const Icon = isEdu ? MdSchool : MdWork;
            // Waypoints alternate across the plane, which is what turns a
            // column of rows into a route with a shape.
            const side = i % 2 === 0 ? 'left' : 'right';

            return (
              <li
                key={s.id ?? i}
                className={styles.stop}
                data-side={side}
                style={{ '--i': i }}
              >
                <span className={styles.pinCell} ref={(el) => { pinRefs.current[i] = el; }}>
                  <span className={styles.pin} aria-hidden="true">
                    <span className={styles.pinHalo} />
                    <span className={styles.pinNo}>{i + 1}</span>
                  </span>
                </span>

                <button
                  type="button"
                  ref={(el) => { cardRefs.current[i] = el; }}
                  className={styles.card}
                  onClick={handleSelect(s)}
                  disabled={!onSelect}
                >
                  <span className={styles.cardMeta}>
                    <Icon className={styles.cardIcon} aria-hidden="true" />
                    <span className={styles.cardKind}>
                      {isEdu ? 'Education' : 'Experience'}
                    </span>
                    {s.period && <span className={styles.cardPeriod}>{s.period}</span>}
                  </span>

                  <span className={styles.cardTitle}>
                    {s.title}
                    <MdArrowOutward className={styles.cardArrow} aria-hidden="true" />
                  </span>

                  {s.subtitle && <span className={styles.cardSub}>{s.subtitle}</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default Roadmap;

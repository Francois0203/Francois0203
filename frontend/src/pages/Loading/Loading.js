import React, { useState, useEffect, useRef } from 'react';

/* Data */
import versesData from '../../data/verses.json';

/* Styling */
import styles from './Loading.module.css';
import '../../styles/Theme.css';

/* ============================================================================
 * LOADING PAGE
 * ============================================================================
 * Premium liquid glass loading screen.
 * Blobs are driven by a JS physics engine:
 *   – slow, continuous random drift
 *   – soft repulsion keeps them from overlapping
 *   – periodic random nudges prevent any repeating pattern
 * CSS handles only visual morphing (border-radius) independently per blob.
 * ============================================================================
 */

const BIBLE_VERSES = versesData.verses;
const DOT_COUNT = 4;

/*
 * Blob definitions
 *  r   – collision radius in px (approximate)
 *  sx  – starting X as fraction of viewport width
 *  sy  – starting Y as fraction of viewport height
 *  vx/vy – initial velocity in px/s
 */
const BLOB_DEFS = [
  { cls: [styles.ambientBlob, styles.ambient1], r: 270, sx: 0.10, sy: 0.12, vx:  13, vy:   8 },
  { cls: [styles.ambientBlob, styles.ambient2], r: 240, sx: 0.65, sy: 0.62, vx: -10, vy:  -7 },
  { cls: [styles.ambientBlob, styles.ambient3], r: 200, sx: 0.46, sy: 0.34, vx:   8, vy: -11 },
  { cls: [styles.glassBlob,   styles.glass1],   r: 170, sx: 0.16, sy: 0.20, vx:  -8, vy:  10 },
  { cls: [styles.glassBlob,   styles.glass2],   r: 185, sx: 0.68, sy: 0.58, vx:  10, vy:  -8 },
  { cls: [styles.glassBlob,   styles.glass3],   r: 135, sx: 0.56, sy: 0.15, vx: -11, vy:   7 },
];

const Loading = ({
  message = 'Loading',
  showVerse = true
}) => {
  const [currentVerse, setCurrentVerse] = useState(0);
  const [verseVisible, setVerseVisible] = useState(true);

  const blobRefs    = useRef([]);
  const physicsRef  = useRef(null);
  const rafRef      = useRef(null);
  const nudgeTimer  = useRef(null);
  /* Global mouse position — updated via onMouseMove on the wrapper */
  const mouseRef    = useRef({ x: -1000, y: -1000 });

  /* ── Verse cycling ── */
  useEffect(() => {
    if (!showVerse) return;
    const interval = setInterval(() => {
      setVerseVisible(false);
      const swap = setTimeout(() => {
        setCurrentVerse(prev => (prev + 1) % BIBLE_VERSES.length);
        setVerseVisible(true);
      }, 500);
      return () => clearTimeout(swap);
    }, 7000);
    return () => clearInterval(interval);
  }, [showVerse]);

  /* ── Blob physics ── */
  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    /* Scale collision radii to match the smaller CSS sizes on mobile */
    const blobScale = vw < 400 ? 0.38 : vw < 600 ? 0.57 : 1.0;

    const blobs = BLOB_DEFS.map((def, i) => {
      const r    = def.r * blobScale;
      const size = r * 2;
      return {
        id: i,
        x:  Math.max(0, Math.min(vw - size, def.sx * vw)),
        y:  Math.max(0, Math.min(vh - size, def.sy * vh)),
        vx: def.vx,
        vy: def.vy,
        r,
      };
    });

    /* Pin initial positions immediately so there is no flash from 0,0 */
    blobs.forEach((b, i) => {
      const el = blobRefs.current[i];
      if (el) el.style.transform = `translate(${b.x}px, ${b.y}px)`;
    });

    physicsRef.current = { blobs, vw, vh, lastTime: null };

    /* ── Animation loop ── */
    const tick = (timestamp) => {
      const state = physicsRef.current;
      if (!state) return;

      if (!state.lastTime) state.lastTime = timestamp;
      const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05); // cap at 50 ms
      state.lastTime = timestamp;

      const { blobs: bs } = state;
      const MAX_SPEED = 20; // px/s — deliberately slow
      const DAMPING   = 0.999;

      /* Step 1 – integrate */
      bs.forEach(b => {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.vx *= DAMPING;
        b.vy *= DAMPING;
      });

      /* Step 2 – soft pair repulsion (prevent blobs overlapping) */
      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const a  = bs[i];
          const b  = bs[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist    = Math.hypot(dx, dy) || 1;
          const minDist = (a.r + b.r) * 0.80; // allow a tiny soft overlap

          if (dist < minDist) {
            const overlap = (minDist - dist) / dist;
            const fx = dx * overlap * 0.016;
            const fy = dy * overlap * 0.016;
            a.vx -= fx;  a.vy -= fy;
            b.vx += fx;  b.vy += fy;
          }
        }
      }

      /* Step 3 – hard boundary: blobs must stay fully within the viewport.
       * A soft push starts when the blob is within 30% of its radius from
       * any edge, then a hard clamp guarantees it never escapes. */
      bs.forEach(b => {
        const size      = b.r * 2;
        const softZone  = b.r * 0.30;
        const pushForce = 0.50;

        if (b.x < softZone)              b.vx += pushForce;
        if (b.x > vw - size - softZone)  b.vx -= pushForce;
        if (b.y < softZone)              b.vy += pushForce;
        if (b.y > vh - size - softZone)  b.vy -= pushForce;

        /* Hard clamp — guarantees no blob ever leaves the viewport */
        b.x = Math.max(0, Math.min(vw - size, b.x));
        b.y = Math.max(0, Math.min(vh - size, b.y));

        /* Speed cap */
        const speed = Math.hypot(b.vx, b.vy);
        if (speed > MAX_SPEED) {
          b.vx = (b.vx / speed) * MAX_SPEED;
          b.vy = (b.vy / speed) * MAX_SPEED;
        }

        /* Minimum drift — so blobs never fully stop */
        if (speed < 2) {
          const angle = Math.random() * Math.PI * 2;
          b.vx += Math.cos(angle) * 4;
          b.vy += Math.sin(angle) * 4;
        }
      });

      /* Step 4 – write positions to DOM (GPU-composited transform only).
       * Glass blobs (i >= 3) also receive the cursor position relative to
       * the blob's own origin, powering the cursor-reactive glow in CSS. */
      const mouse = mouseRef.current;
      bs.forEach((b, i) => {
        const el = blobRefs.current[i];
        if (!el) return;
        el.style.transform = `translate(${b.x}px, ${b.y}px)`;
        if (i >= 3) {
          el.style.setProperty('--cursor-x', `${mouse.x - b.x}px`);
          el.style.setProperty('--cursor-y', `${mouse.y - b.y}px`);
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    /* ── Periodic random nudges — keeps movement feeling non-repeating ── */
    const scheduleNudge = () => {
      nudgeTimer.current = setTimeout(() => {
        const bs = physicsRef.current?.blobs;
        if (bs) {
          /* Pick 2–3 random blobs and give them a random kick */
          const count = 2 + Math.floor(Math.random() * 2);
          [...Array(bs.length).keys()]
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .forEach(idx => {
              const angle    = Math.random() * Math.PI * 2;
              const strength = 9 + Math.random() * 13;
              bs[idx].vx += Math.cos(angle) * strength;
              bs[idx].vy += Math.sin(angle) * strength;
            });
        }
        scheduleNudge();
      }, 2200 + Math.random() * 3200);
    };
    scheduleNudge();

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(nudgeTimer.current);
      physicsRef.current = null;
    };
  }, []);

  return (
    <div
      className={styles.wrapper}
      onMouseMove={e => { mouseRef.current = { x: e.clientX, y: e.clientY }; }}
    >

      {/* ── Blob field ── */}
      <div className={styles.blobField} aria-hidden="true">
        {BLOB_DEFS.map((def, i) => (
          <div
            key={i}
            ref={el => { blobRefs.current[i] = el; }}
            className={def.cls.join(' ')}
          />
        ))}
      </div>

      {/* ── Frosted glass card ── */}
      <div className={styles.glassCard}>

        <p className={styles.message}>{message}</p>

        <div className={styles.dotsRow} role="status" aria-label="Loading">
          {Array.from({ length: DOT_COUNT }).map((_, i) => (
            <span
              key={i}
              className={styles.dot}
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </div>

        {showVerse && (
          <div className={`${styles.verseBlock} ${verseVisible ? styles.verseVisible : styles.verseHidden}`}>
            <div className={styles.verseDivider} />
            <p className={styles.verseText}>
              <span className={styles.quoteMark}>&ldquo;</span>
              {BIBLE_VERSES[currentVerse].verse}
              <span className={styles.quoteMark}>&rdquo;</span>
            </p>
            <cite className={styles.verseRef}>
              — {BIBLE_VERSES[currentVerse].reference}
            </cite>
          </div>
        )}

      </div>
    </div>
  );
};

export default Loading;
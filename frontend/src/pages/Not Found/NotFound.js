import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdHome, MdArrowBack } from 'react-icons/md';

import { GhostButton } from '../../components';
import sayingsData from '../../data/notfound.json';
import styles from './NotFound.module.css';
import '../../styles/Theme.css';

const SAYINGS = sayingsData.sayings;

// ─── BLOB DEFS ───────────────────────────────────────────────────────────────────
// Indices 0–2: ambient glow. Indices 3–5: glass squares (cursor-reactive).
const BLOB_DEFS = [
  { cls: [styles.ambientSquare, styles.ambient1], r: 240, sx: 0.05, sy: 0.05, vx:  10, vy:   6, rotSpeed:  3.5 },
  { cls: [styles.ambientSquare, styles.ambient2], r: 190, sx: 0.70, sy: 0.65, vx:  -8, vy:  -5, rotSpeed: -4.0 },
  { cls: [styles.ambientSquare, styles.ambient3], r: 160, sx: 0.42, sy: 0.72, vx:   6, vy:  -9, rotSpeed:  5.0 },
  { cls: [styles.glassSquare,   styles.square1],  r: 130, sx: 0.12, sy: 0.60, vx:  -7, vy:   8, rotSpeed: -6.0 },
  { cls: [styles.glassSquare,   styles.square2],  r: 150, sx: 0.72, sy: 0.18, vx:   9, vy:  -6, rotSpeed:  7.0 },
  { cls: [styles.glassSquare,   styles.square3],  r: 110, sx: 0.50, sy: 0.48, vx:  -9, vy:   5, rotSpeed: -4.5 },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────────
const NotFound = () => {
  const navigate = useNavigate();
  const [currentSaying, setCurrentSaying] = useState(0);
  const [sayingVisible, setSayingVisible] = useState(true);

  const blobRefs   = useRef([]);
  const physicsRef = useRef(null);
  const rafRef     = useRef(null);
  const nudgeTimer = useRef(null);
  const mouseRef   = useRef({ x: -1000, y: -1000 });

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  // ─── SAYING CYCLING ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setSayingVisible(false);
      const swap = setTimeout(() => {
        setCurrentSaying(prev => (prev + 1) % SAYINGS.length);
        setSayingVisible(true);
      }, 500);
      return () => clearTimeout(swap);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  // ─── BLOB PHYSICS ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    /* Scale radii to match mobile CSS sizes */
    const blobScale = vw < 400 ? 0.38 : vw < 600 ? 0.57 : 1.0;

    const blobs = BLOB_DEFS.map((def) => {
      const r    = def.r * blobScale;
      const size = r * 2;
      return {
        x:        Math.max(0, Math.min(vw - size, def.sx * vw)),
        y:        Math.max(0, Math.min(vh - size, def.sy * vh)),
        vx:       def.vx,
        vy:       def.vy,
        r,
        angle:    Math.random() * 360,
        rotSpeed: def.rotSpeed,
      };
    });

    // Pin positions immediately — prevents flash from 0,0
    blobs.forEach((b, i) => {
      const el = blobRefs.current[i];
      if (el) el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.angle}deg)`;
    });

    physicsRef.current = { blobs, vw, vh, lastTime: null };

    // ─── ANIMATION LOOP ────────────────────────────────────────────────────────────
    const tick = (timestamp) => {
      const state = physicsRef.current;
      if (!state) return;

      if (!state.lastTime) state.lastTime = timestamp;
      const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05);
      state.lastTime = timestamp;

      const { blobs: bs } = state;
      const MAX_SPEED = 18;
      const DAMPING   = 0.999;

      // Step 1 – integrate
      bs.forEach(b => {
        b.x     += b.vx       * dt;
        b.y     += b.vy       * dt;
        b.vx    *= DAMPING;
        b.vy    *= DAMPING;
        b.angle += b.rotSpeed * dt;
      });

      // Step 2 – soft pair repulsion
      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const a = bs[i], b = bs[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist    = Math.hypot(dx, dy) || 1;
          const minDist = (a.r + b.r) * 0.80;
          if (dist < minDist) {
            const overlap = (minDist - dist) / dist;
            const fx = dx * overlap * 0.016;
            const fy = dy * overlap * 0.016;
            a.vx -= fx; a.vy -= fy;
            b.vx += fx; b.vy += fy;
          }
        }
      }

      // Step 3 – soft push + hard clamp to viewport
      bs.forEach(b => {
        const size     = b.r * 2;
        const softZone = b.r * 0.30;
        const push     = 0.50;
        if (b.x < softZone)              b.vx += push;
        if (b.x > vw - size - softZone)  b.vx -= push;
        if (b.y < softZone)              b.vy += push;
        if (b.y > vh - size - softZone)  b.vy -= push;
        b.x = Math.max(0, Math.min(vw - size, b.x));
        b.y = Math.max(0, Math.min(vh - size, b.y));

        const speed = Math.hypot(b.vx, b.vy);
        if (speed > MAX_SPEED) {
          b.vx = (b.vx / speed) * MAX_SPEED;
          b.vy = (b.vy / speed) * MAX_SPEED;
        }
        if (speed < 2) {
          const angle = Math.random() * Math.PI * 2;
          b.vx += Math.cos(angle) * 4;
          b.vy += Math.sin(angle) * 4;
        }
      });

      // Step 4 – write transform + cursor vars to DOM
      const mouse = mouseRef.current;
      bs.forEach((b, i) => {
        const el = blobRefs.current[i];
        if (!el) return;
        el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.angle}deg)`;
        if (i >= 3) {
          el.style.setProperty('--cursor-x', `${mouse.x - b.x}px`);
          el.style.setProperty('--cursor-y', `${mouse.y - b.y}px`);
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // ─── RANDOM NUDGES ────────────────────────────────────────────────────────────
    const scheduleNudge = () => {
      nudgeTimer.current = setTimeout(() => {
        const bs = physicsRef.current?.blobs;
        if (bs) {
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
      className={styles.root}
      onMouseMove={e => { mouseRef.current = { x: e.clientX, y: e.clientY }; }}
    >

      {/* ── Square blob field ── */}
      <div className={styles.blobField} aria-hidden="true">
        {BLOB_DEFS.map((def, i) => (
          <div
            key={i}
            ref={el => { blobRefs.current[i] = el; }}
            className={def.cls.join(' ')}
          />
        ))}
      </div>

      {/* ── Main card ── */}
      <main className={styles.card}>

        {/* Status badge */}
        <div className={styles.statusBadge} aria-label="HTTP Error 404">
          <span className={styles.statusDot} aria-hidden="true" />
          <span>Error 404</span>
        </div>

        {/* 404 display */}
        <div className={styles.codeDisplay} aria-hidden="true">404</div>

        {/* Heading & description */}
        <h1 className={styles.heading}>Page Not Found</h1>
        <p className={styles.subtext}>
          The page you&rsquo;re looking for has gone missing &mdash; not unlike
          a semicolon in production code.
        </p>

        {/* Divider */}
        <div className={styles.divider} aria-hidden="true" />

        {/* Funny saying — cycles every 9 seconds */}
        <div className={`${styles.sayingBlock} ${sayingVisible ? styles.sayingVisible : styles.sayingHidden}`}>
          <p className={styles.sayingText}>
            <span className={styles.quoteMark}>&ldquo;</span>
            {SAYINGS[currentSaying].text}
            <span className={styles.quoteMark}>&rdquo;</span>
          </p>
          <cite className={styles.sayingAttribution}>
            — {SAYINGS[currentSaying].attribution}
          </cite>
        </div>

        {/* Divider */}
        <div className={styles.divider} aria-hidden="true" />

        {/* Action buttons */}
        <div className={styles.actions}>
          <GhostButton onClick={handleGoHome}>
            <MdHome aria-hidden="true" />
            Go Home
          </GhostButton>
          <button type="button" onClick={handleGoBack} className={styles.backButton}>
            <MdArrowBack aria-hidden="true" />
            Go Back
          </button>
        </div>

      </main>
    </div>
  );
};

export default NotFound;

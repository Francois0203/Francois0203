import { useCallback, useEffect, useRef, useState } from 'react';
import useSiteCopy from '../../hooks/useSiteCopy';
import { resolveGroup } from '../../content/copy/resolve';
import { HOME_FIELDS } from '../../content/copy/home';
import styles from './Intro.module.css';

/*
 * The opening. Embers drift in, pull into the mark, hold, then a gust takes
 * them and the site is behind them.
 *
 * The shape comes from drawing the mark into an offscreen canvas and keeping
 * every pixel with ink in it, so it is the real letterforms at the real size.
 *
 * Plays once per load, any input skips it, it never gates the content, and it
 * does not exist under reduced motion.
 */

let playedThisLoad = false;

const MARK = 'FM';

/* The phases, in milliseconds from the first frame. */
const GATHER = 1500;   /* embers drift, then start pulling toward the shape */
const HOLD = 2450;     /* the mark is formed and burning */
const SCATTER = 3350;  /* the gust, and the overlay goes with it */

const SKIP_MS = 300;

const shouldPlay = () => {
  if (typeof window === 'undefined') return false;
  if (playedThisLoad) return false;
  if (document.documentElement.dataset.noAnimations === 'true') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
};

/* `freezeAt` is dev only: Chrome's virtual time budget freezes rAF, so a
   canvas animation can only be screenshot by stepping it by hand. */
const Intro = ({ freezeAt = null }) => {
  const { overrides } = useSiteCopy();
  const t = resolveGroup(HOME_FIELDS, overrides?.home);

  const [play, setPlay] = useState(shouldPlay);
  const [leaving, setLeaving] = useState(false);
  const canvasRef = useRef(null);
  const skipRef = useRef(() => {});
  const timer = useRef(0);

  const finish = useCallback(() => {
    playedThisLoad = true;
    setPlay(false);
  }, []);

  const skip = useCallback(() => {
    setLeaving((already) => {
      if (already) return already;
      clearTimeout(timer.current);
      timer.current = setTimeout(finish, SKIP_MS);
      skipRef.current();
      return true;
    });
  }, [finish]);

  useEffect(() => {
    if (!play) return undefined;
    playedThisLoad = true;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let start = 0;
    let scatterAt = 0;          /* when the gust actually began, so a skip can pull it forward */

    // One flat array, reused. Nothing in the loop allocates.
    let embers = [];

    const palette = { live: '#f2994a', ember: '#e0b552', glow: 'rgba(242,153,74,0.1)' };

    const readPalette = () => {
      const s = getComputedStyle(document.documentElement);
      palette.live = s.getPropertyValue('--live').trim() || palette.live;
      palette.ember = s.getPropertyValue('--ember').trim() || palette.ember;
      palette.glow = s.getPropertyValue('--field-glow').trim() || palette.glow;
    };

    // Every inked pixel of the mark becomes a target.
    const findTargets = () => {
      const size = Math.min(width * 0.42, height * 0.52, 420);
      const off = document.createElement('canvas');
      off.width = Math.max(1, Math.round(width));
      off.height = Math.max(1, Math.round(height));
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (!octx) return [];

      octx.fillStyle = '#fff';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.font = `700 ${Math.round(size)}px 'Bricolage Grotesque Variable', system-ui, sans-serif`;
      octx.fillText(MARK, off.width / 2, off.height / 2);

      const { data } = octx.getImageData(0, 0, off.width, off.height);

      // Coarser on small screens, so a phone runs the same thing with fewer.
      const step = width < 700 ? 6 : 5;
      const found = [];
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (data[(y * off.width + x) * 4 + 3] > 128) found.push(x, y);
        }
      }
      return found;
    };

    const build = () => {
      const targets = findTargets();
      const count = targets.length / 2;
      embers = new Array(count);

      for (let i = 0; i < count; i += 1) {
        const tx = targets[i * 2];
        const ty = targets[i * 2 + 1];

        // Starts off screen, so they arrive from every direction.
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(width, height) * (0.55 + Math.random() * 0.5);

        embers[i] = {
          tx,
          ty,
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          // Private delay and stiffness, or they all land on one frame.
          lag: Math.random() * 0.45,
          stiff: 0.028 + Math.random() * 0.03,
          size: 0.8 + Math.random() * 1.5,
          phase: Math.random() * Math.PI * 2,
          warm: Math.random(),
        };
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    /* The gust. Takes its clock as an argument, because the dev freeze steps a
       simulated one and performance.now() would put it in the past. */
    const blowAway = (at = performance.now()) => {
      if (scatterAt) return;
      scatterAt = at;
      for (let i = 0; i < embers.length; i += 1) {
        const e = embers[i];
        const dx = e.x - width / 2;
        const dy = e.y - height / 2;
        const d = Math.hypot(dx, dy) || 1;
        // Outward, and up.
        e.vx += (dx / d) * (2.2 + Math.random() * 3.4);
        e.vy += (dy / d) * (1.6 + Math.random() * 2.4) - (2.4 + Math.random() * 3.2);
      }
    };

    skipRef.current = blowAway;

    // One frame, with no opinion about what drives it.
    const drawFrame = (now) => {
      if (!start) start = now;
      const t0 = now - start;

      ctx.clearRect(0, 0, width, height);

      // One glow for the whole mark: per-ember shadowBlur is ruinous here.
      const formed = Math.min(1, Math.max(0, (t0 - GATHER * 0.55) / 900));
      if (formed > 0 && !scatterAt) {
        const r = Math.min(width, height) * 0.42;
        const g = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, r);
        g.addColorStop(0, palette.glow);
        g.addColorStop(1, 'transparent');
        ctx.globalAlpha = formed;
        ctx.fillStyle = g;
        ctx.fillRect(width / 2 - r, height / 2 - r, r * 2, r * 2);
        ctx.globalAlpha = 1;
      }

      if (t0 > SCATTER) blowAway(now);

      const scattering = scatterAt > 0;
      const since = scattering ? now - scatterAt : 0;
      const fade = scattering ? Math.max(0, 1 - since / 900) : 1;

      for (let i = 0; i < embers.length; i += 1) {
        const e = embers[i];

        if (scattering) {
          e.vy += 0.045;              /* the gust slows and the embers fall back */
          e.vx *= 0.985;
          e.x += e.vx;
          e.y += e.vy;
        } else {
          // This ember's own share of the gather, so it assembles in a wave.
          const p = (t0 / GATHER - e.lag) / (1 - e.lag);

          if (p > 0) {
            const k = e.stiff * Math.min(1, p * 1.6);
            e.vx += (e.tx - e.x) * k;
            e.vy += (e.ty - e.y) * k;
            e.vx *= 0.86;
            e.vy *= 0.86;
          }

          e.x += e.vx;
          e.y += e.vy;

          // A small idle wander, so the mark breathes.
          if (t0 > GATHER) {
            const s = (t0 - GATHER) * 0.0022;
            e.x += Math.sin(s + e.phase) * 0.22;
            e.y += Math.cos(s * 1.2 + e.phase) * 0.22;
          }
        }

        ctx.globalAlpha = fade;
        ctx.fillStyle = e.warm > 0.55 ? palette.live : palette.ember;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    const frame = (now) => {
      drawFrame(now);
      raf = requestAnimationFrame(frame);
    };

    readPalette();
    resize();

    if (freezeAt !== null) {
      // Step at a fixed 60fps interval so the still is reproducible.
      const base = performance.now();
      for (let k = 0; k * 16.667 <= freezeAt; k += 1) drawFrame(base + k * 16.667);
      return () => {};
    }

    raf = requestAnimationFrame(frame);

    timer.current = setTimeout(finish, SCATTER + 900);

    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    events.forEach(e => window.addEventListener(e, skip, { passive: true }));

    // Nothing behind an opaque screen may scroll.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onResize = () => { if (!scatterAt) resize(); };
    window.addEventListener('resize', onResize);

    // The font may land after the first frame; re-derive when it does.
    document.fonts?.ready.then(() => { if (!scatterAt) build(); }).catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer.current);
      events.forEach(e => window.removeEventListener(e, skip));
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = prevOverflow;
    };
  }, [play, skip, finish, freezeAt]);

  if (!play) return null;

  return (
    <div
      className={[styles.intro, leaving && styles.leaving, freezeAt !== null && styles.frozen]
        .filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.caption}>{t.heroLede}</p>
    </div>
  );
};

export default Intro;

import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP, motionOff, afterIntro } from '../../hooks/gsap';
import Lightbox from '../Lightbox';
import styles from './PhotoTable.module.css';

const TILT = [-7, 5, -3, 6, -5, 3, -6, 4];
const DEPTH = [0.6, -0.4, 1, -0.8, 0.5, -0.6, 0.9, -0.3];
const WIDE = '(min-width: 760px) and (pointer: fine)';

const slotOf = (i, n) => {
  const x = n === 1 ? 50 : 13 + (74 * i) / (n - 1);
  const y = n < 3 ? 50 : i % 2 ? 62 : 38;
  return { x, y, r: TILT[i % TILT.length] };
};

const useWide = () => {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(WIDE).matches);
  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const on = (e) => setWide(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
};

const Print = ({ photo, eager }) => (
  <span className={styles.print}>
    <span className={styles.tape} aria-hidden="true" />
    <span className={styles.image} style={{ '--tint': photo.tint ?? '#ccc' }}>
      <img
        src={photo.thumb || photo.src}
        alt={photo.caption || ''}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable="false"
      />
    </span>
    <span className={styles.label}>
      <span className={styles.caption}>{photo.caption || photo.where || ' '}</span>
      {(photo.caption ? photo.where || photo.when : photo.when) && (
        <span className={styles.meta}>{photo.caption ? [photo.where, photo.when].filter(Boolean).join(' · ') : photo.when}</span>
      )}
    </span>
  </span>
);

const PhotoTable = ({ photos = [], labels = {} }) => {
  const rootRef = useRef(null);
  const cards = useRef([]);
  const prints = useRef([]);
  const zTop = useRef(10);
  const [open, setOpen] = useState(null);
  const wide = useWide();
  const list = photos.slice(0, 7);
  const n = list.length;

  useGSAP(() => {
    if (!wide || !n) return undefined;
    const root = rootRef.current;
    const els = cards.current.slice(0, n).filter(Boolean);
    if (motionOff()) {
      els.forEach((el, i) => gsap.set(el, { rotation: slotOf(i, n).r }));
      return undefined;
    }

    els.forEach((el, i) => gsap.set(el, {
      x: (50 - slotOf(i, n).x) * 4,
      y: window.innerHeight * 0.7,
      rotation: slotOf(i, n).r * 4,
      opacity: 0,
    }));

    let st = null;
    const stop = afterIntro(() => {
      st = ScrollTrigger.create({
        trigger: root,
        start: 'top 72%',
        once: true,
        onEnter: () => gsap.to(els, {
          x: 0,
          y: 0,
          opacity: 1,
          rotation: (i) => slotOf(i, n).r,
          duration: 1.15,
          ease: 'back.out(1.25)',
          stagger: { each: 0.09, from: 'center' },
        }),
      });
    });

    root.querySelectorAll('[data-depth]').forEach((slot) => {
      gsap.to(slot, {
        y: () => Number(slot.dataset.depth) * -70,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    });

    return () => { stop(); st?.kill(); };
  }, { scope: rootRef, dependencies: [wide, n], revertOnUpdate: true });

  const onPointerDown = (i) => (e) => {
    if (!wide || e.button !== 0) return;
    const el = cards.current[i];
    const root = rootRef.current;
    if (!el || !root) return;
    e.preventDefault();
    el.setPointerCapture?.(e.pointerId);
    zTop.current += 1;
    el.parentElement.style.zIndex = String(zTop.current);
    const box = root.getBoundingClientRect();
    const own = el.getBoundingClientRect();
    const base = { x: Number(gsap.getProperty(el, 'x')), y: Number(gsap.getProperty(el, 'y')) };
    const state = {
      sx: e.clientX, sy: e.clientY, base, moved: false,
      lastX: e.clientX, lastT: performance.now(), vx: 0, vy: 0, lastY: e.clientY,
      min: { x: base.x + (box.left - own.left) - own.width * 0.25, y: base.y + (box.top - own.top) - own.height * 0.15 },
      max: { x: base.x + (box.right - own.right) + own.width * 0.25, y: base.y + (box.bottom - own.bottom) + own.height * 0.15 },
    };
    el.dataset.lifted = '';
    gsap.to(el, { scale: 1.06, duration: 0.25, ease: 'power3.out', overwrite: 'auto' });

    const move = (ev) => {
      const dx = ev.clientX - state.sx;
      const dy = ev.clientY - state.sy;
      if (!state.moved && Math.hypot(dx, dy) > 6) state.moved = true;
      if (!state.moved) return;
      const now = performance.now();
      const dt = Math.max(1, now - state.lastT);
      state.vx = (ev.clientX - state.lastX) / dt;
      state.vy = (ev.clientY - state.lastY) / dt;
      state.lastX = ev.clientX;
      state.lastY = ev.clientY;
      state.lastT = now;
      gsap.to(el, {
        x: base.x + dx,
        y: base.y + dy,
        rotation: slotOf(i, n).r * 0.4 + gsap.utils.clamp(-14, 14, state.vx * 9),
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };

    const up = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      delete el.dataset.lifted;
      if (!state.moved) {
        gsap.to(el, { scale: 1, duration: 0.3, ease: 'power3.out' });
        setOpen(i);
        return;
      }
      const cur = { x: Number(gsap.getProperty(el, 'x')), y: Number(gsap.getProperty(el, 'y')) };
      const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
      gsap.to(el, {
        x: clamp(cur.x + state.vx * 160, state.min.x, state.max.x),
        y: clamp(cur.y + state.vy * 160, state.min.y, state.max.y),
        rotation: slotOf(i, n).r + gsap.utils.clamp(-10, 10, state.vx * 12),
        scale: 1,
        duration: 0.9,
        ease: 'expo.out',
        overwrite: 'auto',
      });
    };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  };

  const originOf = useCallback((i) => prints.current[i]?.querySelector('img'), []);

  if (!n) return null;

  return (
    <div ref={rootRef} className={styles.root} data-wide={wide ? '' : undefined} style={{ '--n': n }}>
      {list.map((photo, i) => {
        const slot = slotOf(i, n);
        return (
          <div
            key={photo.id ?? i}
            className={styles.slot}
            data-depth={wide ? DEPTH[i % DEPTH.length] : undefined}
            style={wide ? { left: `${slot.x}%`, top: `${slot.y}%`, zIndex: i + 1 } : { '--r': `${slot.r * 0.5}deg` }}
          >
            <button
              type="button"
              ref={(el) => { cards.current[i] = el; prints.current[i] = el; }}
              className={styles.card}
              onPointerDown={onPointerDown(i)}
              onClick={(e) => { if (!wide) setOpen(i); else if (e.detail === 0) setOpen(i); }}
              aria-label={[photo.caption, photo.where].filter(Boolean).join(', ') || `Photo ${i + 1}`}
            >
              <Print photo={photo} eager={i < 3} />
            </button>
          </div>
        );
      })}

      <Lightbox
        photos={list}
        index={open}
        originOf={originOf}
        onIndex={setOpen}
        onClose={() => setOpen(null)}
        labels={labels}
      />
    </div>
  );
};

export default PhotoTable;

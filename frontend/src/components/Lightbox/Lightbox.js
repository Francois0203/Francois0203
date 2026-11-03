import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap, motionOff } from '../../hooks/gsap';
import styles from './Lightbox.module.css';

const fit = (photo) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = Math.min(vw * 0.92, 1400);
  const maxH = vh * (vw < 720 ? 0.66 : 0.76);
  const ratio = (photo?.w && photo?.h) ? photo.w / photo.h : 4 / 3;
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) { h = maxH; w = h * ratio; }
  return { w: Math.round(w), h: Math.round(h) };
};

// Opens out of the picture that was clicked and folds back into it on close.
const Lightbox = ({ photos = [], index, originOf, onClose, onIndex, labels = {} }) => {
  const open = index != null && photos[index];
  const scrimRef = useRef(null);
  const frameRef = useRef(null);
  const textRef = useRef(null);
  const closeRef = useRef(null);
  const closing = useRef(false);
  const opened = useRef(false);
  const drag = useRef(null);
  const [size, setSize] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const photo = open ? photos[index] : null;

  useLayoutEffect(() => {
    if (!photo) return undefined;
    const update = () => setSize(fit(photo));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [photo]);

  useEffect(() => { setLoaded(false); }, [photo?.src]);

  const flipFrom = (el) => {
    const frame = frameRef.current;
    if (!el || !frame) return null;
    const a = el.getBoundingClientRect();
    const b = frame.getBoundingClientRect();
    if (!a.width || a.bottom < 0 || a.top > window.innerHeight) return null;
    return {
      x: a.left + a.width / 2 - (b.left + b.width / 2),
      y: a.top + a.height / 2 - (b.top + b.height / 2),
      scaleX: a.width / b.width,
      scaleY: a.height / b.height,
    };
  };

  useLayoutEffect(() => {
    if (!open || !size || opened.current) return;
    opened.current = true;
    closing.current = false;
    const still = motionOff();
    const from = still ? null : flipFrom(originOf?.(index));
    const tl = gsap.timeline();
    tl.fromTo(scrimRef.current, { opacity: 0 }, { opacity: 1, duration: still ? 0 : 0.45, ease: 'power2.out' }, 0);
    if (from) {
      tl.fromTo(frameRef.current, { ...from, borderRadius: 18 }, { x: 0, y: 0, scaleX: 1, scaleY: 1, borderRadius: 14, duration: 0.75, ease: 'expo.out' }, 0);
    } else {
      tl.fromTo(frameRef.current, { opacity: 0, scale: still ? 1 : 0.94 }, { opacity: 1, scale: 1, duration: still ? 0 : 0.5, ease: 'expo.out' }, 0);
    }
    tl.fromTo(textRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: still ? 0 : 0.5, ease: 'power3.out' }, still ? 0 : 0.25);
    closeRef.current?.focus({ preventScroll: true });
  });

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const still = motionOff();
    const from = still ? null : flipFrom(originOf?.(index));
    const done = () => { opened.current = false; onClose?.(); };
    const tl = gsap.timeline({ onComplete: done });
    tl.to(textRef.current, { opacity: 0, duration: still ? 0 : 0.15 }, 0);
    if (from) tl.to(frameRef.current, { ...from, borderRadius: 18, duration: 0.55, ease: 'expo.inOut' }, 0);
    else tl.to(frameRef.current, { opacity: 0, scale: 0.94, duration: still ? 0 : 0.3, ease: 'power2.in' }, 0);
    tl.to(scrimRef.current, { opacity: 0, duration: still ? 0 : 0.4, ease: 'power2.inOut' }, still ? 0 : 0.12);
  }, [index, onClose, originOf]);

  const go = useCallback((step) => {
    if (photos.length < 2 || closing.current) return;
    const next = (index + step + photos.length) % photos.length;
    const frame = frameRef.current;
    if (motionOff() || !frame) { onIndex?.(next); return; }
    gsap.to(frame, {
      x: -60 * step, opacity: 0, duration: 0.18, ease: 'power2.in',
      onComplete: () => {
        onIndex?.(next);
        requestAnimationFrame(() => gsap.fromTo(frame, { x: 60 * step, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }));
      },
    });
  }, [index, photos.length, onIndex]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab') {
        const nodes = scrimRef.current?.querySelectorAll('button');
        if (!nodes?.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, go]);

  useEffect(() => () => { opened.current = false; }, []);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, dx: 0, dy: 0, axis: null };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    d.dx = e.clientX - d.x;
    d.dy = e.clientY - d.y;
    if (!d.axis && Math.hypot(d.dx, d.dy) > 8) d.axis = Math.abs(d.dx) > Math.abs(d.dy) ? 'x' : 'y';
    if (d.axis === 'y' && d.dy > 0) {
      const k = Math.min(1, d.dy / 400);
      gsap.set(frameRef.current, { y: d.dy, scale: 1 - k * 0.15 });
      gsap.set(scrimRef.current, { '--scrim': 1 - k * 0.7 });
    } else if (d.axis === 'x') {
      gsap.set(frameRef.current, { x: d.dx * 0.6 });
    }
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.axis === 'y' && d.dy > 110) { close(); return; }
    if (d.axis === 'x' && Math.abs(d.dx) > 60) { go(d.dx < 0 ? 1 : -1); return; }
    gsap.to(frameRef.current, { x: 0, y: 0, scale: 1, duration: 0.5, ease: 'expo.out' });
    gsap.to(scrimRef.current, { '--scrim': 1, duration: 0.4 });
  };

  if (!open || typeof document === 'undefined') return null;

  const meta = [photo.where, photo.when].filter(Boolean).join(' · ');

  return createPortal(
    <div
      ref={scrimRef}
      className={styles.scrim}
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption || meta || 'Photo'}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <button ref={closeRef} type="button" className={styles.close} onClick={close} aria-label={labels.close ?? 'Close photo'}>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>
      </button>

      <div
        ref={frameRef}
        className={styles.frame}
        style={{ width: size?.w, height: size?.h, '--tint': photo.tint ?? '#333' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {photo.thumb && <img className={styles.thumb} src={photo.thumb} alt="" draggable="false" />}
        <img
          key={photo.src}
          className={styles.full}
          data-loaded={loaded ? '' : undefined}
          src={photo.src}
          alt={photo.caption || ''}
          draggable="false"
          onLoad={() => setLoaded(true)}
        />
      </div>

      <div ref={textRef} className={styles.text}>
        {photos.length > 1 && (
          <button type="button" className={styles.nav} onClick={() => go(-1)} aria-label={labels.prev ?? 'Previous photo'}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" /></svg>
          </button>
        )}
        <div className={styles.caption}>
          {photo.caption && <p className={styles.title}>{photo.caption}</p>}
          {meta && <p className={styles.meta}>{meta}</p>}
          {photo.note && <p className={styles.note}>{photo.note}</p>}
          {photos.length > 1 && (
            <p className={styles.count}>{String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</p>
          )}
        </div>
        {photos.length > 1 && (
          <button type="button" className={styles.nav} onClick={() => go(1)} aria-label={labels.next ?? 'Next photo'}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4 6 6-6 6" /></svg>
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Lightbox;

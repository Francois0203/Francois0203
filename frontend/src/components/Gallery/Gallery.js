import { useCallback, useEffect, useRef, useState } from 'react';
import Lightbox from '../Lightbox';
import styles from './Gallery.module.css';

// A loose masonry wall. Each picture fades up as it scrolls in.
const Gallery = ({ photos = [], labels = {} }) => {
  const rootRef = useRef(null);
  const tiles = useRef([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.dataset.in = '';
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.15 });
    root.querySelectorAll('[data-tile]').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [photos.length]);

  const originOf = useCallback((i) => tiles.current[i]?.querySelector('img'), []);

  if (!photos.length) return null;

  return (
    <>
      <ul ref={rootRef} className={styles.wall}>
        {photos.map((p, i) => (
          <li key={p.id ?? i} data-tile style={{ '--d': `${(i % 3) * 80}ms` }}>
            <button
              type="button"
              ref={(el) => { tiles.current[i] = el; }}
              className={styles.tile}
              onClick={() => setOpen(i)}
              aria-label={[p.caption, p.where].filter(Boolean).join(', ') || `Photo ${i + 1}`}
            >
              <span
                className={styles.frame}
                style={{ '--tint': p.tint ?? 'var(--surface-2)', aspectRatio: p.w && p.h ? `${p.w} / ${p.h}` : '4 / 3' }}
              >
                <img src={p.thumb || p.src} alt="" loading="lazy" decoding="async" />
              </span>
              {(p.caption || p.where) && (
                <span className={styles.label}>
                  <span className={styles.caption}>{p.caption || p.where}</span>
                  {p.caption && (p.where || p.when) && (
                    <span className={styles.meta}>{[p.where, p.when].filter(Boolean).join(', ')}</span>
                  )}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <Lightbox
        photos={photos}
        index={open}
        originOf={originOf}
        onIndex={setOpen}
        onClose={() => setOpen(null)}
        labels={labels}
      />
    </>
  );
};

export default Gallery;

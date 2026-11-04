import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './KebabMenu.module.css';

// A small "more" menu. It opens on top of the page so no card can cover it.
const KebabMenu = ({ items = [], ariaLabel = 'More options' }) => {
  const [open, setOpen] = useState(false);
  const [spot, setSpot] = useState(null);
  const wrapRef = useRef(null);
  const menuRef = useRef(null);

  // Pin the menu under its button, flipping up when there is no room below.
  useLayoutEffect(() => {
    if (!open) return undefined;
    const place = () => {
      const r = wrapRef.current?.getBoundingClientRect();
      if (!r) return;
      const h = menuRef.current?.offsetHeight ?? 0;
      const below = r.bottom + 6 + h < window.innerHeight;
      setSpot({ right: window.innerWidth - r.right, top: below ? r.bottom + 6 : r.top - 6 - h, up: !below });
    };
    place();
    const frame = requestAnimationFrame(place);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!items.length) return null;

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <circle cx="10" cy="4" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="10" cy="16" r="1.5" />
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          className={styles.menu}
          role="menu"
          data-up={spot?.up ? '' : undefined}
          style={{ top: spot?.top ?? -9999, right: spot?.right ?? 0 }}
        >
          {items.map(item => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={`${styles.item} ${item.danger ? styles.danger : ''}`}
              onClick={(e) => { e.stopPropagation(); setOpen(false); item.onSelect?.(); }}
            >
              {item.icon && <span className={styles.icon} aria-hidden="true">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
};

export default KebabMenu;

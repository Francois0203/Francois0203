import { useEffect, useRef, useState } from 'react';
import styles from './KebabMenu.module.css';

// A small "more" menu. Closes on outside click, Escape, or a pick.
const KebabMenu = ({ items = [], ariaLabel = 'More options' }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
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

      {open && (
        <div className={styles.menu} role="menu">
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
        </div>
      )}
    </div>
  );
};

export default KebabMenu;

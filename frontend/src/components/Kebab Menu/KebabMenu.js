import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BsThreeDotsVertical } from 'react-icons/bs';
import styles from './KebabMenu.module.css';

/**
 * A three-dots (kebab) menu that feels native on both platforms:
 *   • desktop → a popover anchored under the trigger
 *   • mobile  → a bottom sheet that slides up with a dimmed backdrop
 *
 * Rendered through a portal so it's never clipped by an ancestor's
 * overflow / backdrop-filter containing block.
 *
 * items: [{ label, icon?, onSelect, danger? }]
 */
const KebabMenu = ({ items = [], ariaLabel = 'Options', className = '' }) => {
  const [open, setOpen]     = useState(false);
  const [coords, setCoords] = useState(null);
  const btnRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  const toggle = () => {
    if (open) { close(); return; }
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setCoords({ top: Math.round(r.bottom + 6), right: Math.round(window.innerWidth - r.right) });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey    = (e) => { if (e.key === 'Escape') close(); };
    const onScroll = () => close();
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', close);
    };
  }, [open, close]);

  const handleSelect = (fn) => { close(); fn?.(); };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`${styles.trigger} ${className}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={toggle}
      >
        <BsThreeDotsVertical aria-hidden="true" />
      </button>

      {open && createPortal(
        <div className={styles.overlay} onClick={close}>
          <div
            className={styles.menu}
            style={coords ? { top: coords.top, right: coords.right } : undefined}
            role="menu"
            aria-label={ariaLabel}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.grabber} aria-hidden="true" />
            {items.map((it, i) => (
              <button
                key={i}
                type="button"
                role="menuitem"
                className={`${styles.item} ${it.danger ? styles.itemDanger : ''}`}
                onClick={() => handleSelect(it.onSelect)}
              >
                {it.icon && <span className={styles.itemIcon} aria-hidden="true">{it.icon}</span>}
                <span>{it.label}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default KebabMenu;

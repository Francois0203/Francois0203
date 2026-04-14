import React, { useEffect, useRef, useCallback } from 'react';
import styles from './Modal.module.css';

/* CSS selectors covering all natively focusable elements. */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/* ============================================================================
 * MODAL COMPONENT
 * ============================================================================
 * Liquid-glass modal dialog with full accessibility support.
 *
 * Props:
 *   open     {boolean}          Whether the modal is visible.
 *   onClose  {() => void}       Called when the modal should close.
 *   title    {string}           Optional heading rendered in the header.
 *   children {React.ReactNode}  Modal body content.
 * ============================================================================
 */
const Modal = ({ open, onClose, children, title }) => {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  /* ── Scroll lock & focus management ────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;

    // Remember the element that opened the modal so focus can be restored.
    previousFocusRef.current = document.activeElement;

    // Compensate for scrollbar disappearing so the backdrop doesn't shift.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Move focus into the dialog after it has painted.
    const raf = requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      previousFocusRef.current?.focus();
    };
  }, [open]);

  /* ── Keyboard: Escape to close, Tab to trap focus ─────────────────────── */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll(FOCUSABLE_SELECTORS)
        );

        if (!focusable.length) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last  = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  /* ── Backdrop click ─────────────────────────────────────────────────────── */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  return (
    /* Backdrop — dims and blurs the page behind the modal */
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      {/* Dialog — the glass panel */}
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {/* Close (X) button — only dismiss affordance inside the modal */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6"  x2="6"  y2="18" />
            <line x1="6"  y1="6"  x2="18" y2="18" />
          </svg>
        </button>

        {/* Header (rendered only when a title is provided) */}
        {title && (
          <header className={styles.header}>
            <h2 id="modal-title" className={styles.title}>{title}</h2>
          </header>
        )}

        {/* Body — scrolls independently if content overflows */}
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

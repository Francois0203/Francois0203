import React, { useEffect } from 'react';

/* Styling */
import styles from './Modal.module.css';
import '../../styles/Theme.css';
import '../../styles/Components.css';
import '../../styles/Wrappers.css';

const Modal = ({ open, onClose, children, title }) => {
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open, onClose]);

  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay, not on the content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.content} style={{ position: 'relative' }}>
        <button
          className={styles.closeIcon}
          onClick={onClose}
          title="Close"
          aria-label="Close"
          type="button"
        >
          ×
        </button>
        {title && <div className={styles.modalTitle}>{title}</div>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
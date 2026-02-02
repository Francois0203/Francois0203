import React, { useEffect } from 'react';

/* Styling */
import styles from './Modal.module.css';
import '../../styles/Theme.css';

/* ============================================================================
 * MODAL COMPONENT
 * ============================================================================
 * Professional modal dialog with backdrop overlay
 * Features:
 * - Escape key to close
 * - Click outside to close
 * - Smooth animations
 * - Accessible with proper focus management
 * - Responsive design
 * ============================================================================
 */

const Modal = ({ open, onClose, children, title }) => {
  // ========================================
  // EFFECTS
  // ========================================
  
  // Handle Escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay, not the content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ========================================
  // RENDER
  // ========================================
  
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className={styles.content}>
        {/* Close Button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          type="button"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Modal Header with Title */}
        {title && (
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{title}</h2>
          </div>
        )}

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

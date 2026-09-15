import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';

/* Transient only. Anything to act on belongs inline, next to its cause. */

const ToastContext = createContext(null);

const LIFETIME = 4200;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts(list => list.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, tone = 'info') => {
    const id = nextId.current;
    nextId.current += 1;
    setToasts(list => [...list, { id, message, tone }]);
    setTimeout(() => dismiss(id), LIFETIME);
  }, [dismiss]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div className={styles.dock} role="status" aria-live="polite">
          {toasts.map(t => (
            <div key={t.id} className={styles.toast} data-tone={t.tone}>
              <span className={styles.rule} aria-hidden="true" />
              <p>{t.message}</p>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside a ToastProvider');
  return ctx;
}

export default ToastContext;

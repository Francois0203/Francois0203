import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdInfoOutline, MdCheckCircleOutline, MdWarningAmber, MdErrorOutline } from 'react-icons/md';
import styles from './Toast.module.css';

/*
 * The one place the site shows a toast. Transient only: anything to act on
 * belongs inline, next to its cause.
 *
 *   const { toast } = useToast();
 *   toast.success('Saved');
 *   toast.error('Could not save', { title: 'Skills' });
 */

export const TOAST_TYPES = ['info', 'success', 'warning', 'error'];

const ICONS = {
  info: MdInfoOutline,
  success: MdCheckCircleOutline,
  warning: MdWarningAmber,
  error: MdErrorOutline,
};

// Problems stay up longer: they are the ones people need to read.
const LIFETIME = { info: 4500, success: 4000, warning: 6500, error: 8000 };
const MAX_VISIBLE = 4;
const EXIT_MS = 200;

const ToastContext = createContext(null);

const ToastItem = ({ item, onDone }) => {
  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const remaining = useRef(item.duration);
  const startedAt = useRef(0);

  const close = useCallback(() => setLeaving(true), []);

  useEffect(() => {
    if (leaving) {
      const t = setTimeout(() => onDone(item.id), EXIT_MS);
      return () => clearTimeout(t);
    }
    if (paused || !Number.isFinite(remaining.current)) return undefined;
    startedAt.current = Date.now();
    const t = setTimeout(close, remaining.current);
    return () => {
      clearTimeout(t);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, leaving, close, onDone, item.id]);

  const Icon = ICONS[item.type];
  const urgent = item.type === 'error' || item.type === 'warning';

  return (
    <div
      className={styles.toast}
      data-type={item.type}
      data-leaving={leaving ? '' : undefined}
      role={urgent ? 'alert' : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Icon className={styles.icon} aria-hidden="true" />
      <div className={styles.body}>
        {item.title && <p className={styles.title}>{item.title}</p>}
        <p className={styles.message}>{item.message}</p>
      </div>
      <button type="button" className={styles.close} onClick={close} aria-label="Dismiss notification">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const remove = useCallback((id) => {
    setToasts(list => list.filter(t => t.id !== id));
  }, []);

  const show = useCallback(({ type = 'info', message, title, duration } = {}) => {
    if (!TOAST_TYPES.includes(type)) {
      if (import.meta.env.DEV) console.warn(`toast: unknown type "${type}", showing as info`);
      type = 'info';
    }
    if (!message) return null;
    const id = nextId.current;
    nextId.current += 1;
    setToasts(list => [...list, { id, type, message, title, duration: duration ?? LIFETIME[type] }].slice(-MAX_VISIBLE));
    return id;
  }, []);

  const toast = useMemo(() => {
    const api = (message, options) => show({ ...options, message });
    for (const type of TOAST_TYPES) api[type] = (message, options) => show({ ...options, type, message });
    api.show = show;
    api.dismiss = remove;
    return api;
  }, [show, remove]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <div className={styles.dock} aria-live="polite">
          {toasts.map(t => <ToastItem key={t.id} item={t} onDone={remove} />)}
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

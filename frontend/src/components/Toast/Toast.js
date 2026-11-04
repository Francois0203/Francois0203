import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCopy } from '../../content/copy/store';
import styles from './Toast.module.css';

const TYPES = ['info', 'success', 'warning', 'error', 'loading'];
const LIFETIME = { info: 4500, success: 3800, warning: 6500, error: 8000, loading: Infinity };
const MAX_VISIBLE = 4;
const EXIT_MS = 260;

const Glyph = ({ type }) => {
  if (type === 'loading') return <span className="spinner" />;
  const paths = {
    success: <path d="M6 12.5 10.2 16.5 18 8" />,
    error: <path d="M8 8l8 8M16 8l-8 8" />,
    warning: <><path d="M12 7.5v6" /><path d="M12 16.8v.2" /></>,
    info: <><path d="M12 11v6" /><path d="M12 7.6v.2" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[type]}
    </svg>
  );
};

// Lets code outside React show toasts too: import { toast } from '../components/Toast'.
const listeners = new Set();
let queued = [];
const emit = (cmd) => {
  if (listeners.size === 0) { queued.push(cmd); return; }
  listeners.forEach(fn => fn(cmd));
};
let counter = 0;
const nextId = () => `t${(counter += 1)}`;

const make = (type) => (message, options = {}) => {
  const id = options.id ?? nextId();
  emit({ op: 'show', toast: { ...options, id, type, message } });
  return id;
};

export const toast = Object.assign((message, options) => make('info')(message, options), {
  info: make('info'),
  success: make('success'),
  warning: make('warning'),
  error: make('error'),
  loading: make('loading'),
  update: (id, patch) => emit({ op: 'update', id, patch }),
  dismiss: (id) => emit({ op: 'dismiss', id }),
  // Shows a spinner toast that turns into success or error when the promise settles.
  promise: (promise, { loading = 'Working on it', success = 'Done', error = 'Something went wrong' } = {}) => {
    const id = make('loading')(loading);
    const run = typeof promise === 'function' ? promise() : promise;
    Promise.resolve(run).then(
      (v) => emit({ op: 'update', id, patch: { type: 'success', message: typeof success === 'function' ? success(v) : success } }),
      (e) => emit({ op: 'update', id, patch: { type: 'error', message: typeof error === 'function' ? error(e) : error } }),
    );
    return run;
  },
});

const ToastContext = createContext({ toast });

const ToastItem = ({ item, index, onDone }) => {
  const words = useCopy('a11y');
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [drag, setDrag] = useState(0);
  const start = useRef(null);
  const left = useRef(0);
  const life = item.duration ?? LIFETIME[item.type];

  const close = useCallback(() => setLeaving(true), []);

  useEffect(() => { left.current = life; }, [life, item.type, item.message]);

  useEffect(() => {
    if (leaving) {
      const t = setTimeout(() => onDone(item.id), EXIT_MS);
      return () => clearTimeout(t);
    }
    if (paused || !Number.isFinite(left.current)) return undefined;
    const began = Date.now();
    const t = setTimeout(close, left.current);
    return () => { clearTimeout(t); left.current -= Date.now() - began; };
  }, [paused, leaving, close, onDone, item.id, item.type, item.message]);

  useEffect(() => { if (item.closing) close(); }, [item.closing, close]);

  const down = (e) => {
    if (e.target.closest('button')) return;
    start.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPaused(true);
  };
  const move = (e) => { if (start.current !== null) setDrag(e.clientX - start.current); };
  const up = () => {
    if (start.current === null) return;
    start.current = null;
    if (Math.abs(drag) > 90) close();
    else { setDrag(0); setPaused(false); }
  };

  const urgent = item.type === 'error' || item.type === 'warning';

  return (
    <div
      className={styles.toast}
      data-type={item.type}
      data-leaving={leaving ? '' : undefined}
      data-dragging={start.current !== null ? '' : undefined}
      style={{ '--i': index, '--drag': `${drag}px`, '--fade': 1 - Math.min(1, Math.abs(drag) / 260), '--life': `${Number.isFinite(life) ? life : 0}ms` }}
      role={urgent ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      <span className={styles.orb}><Glyph type={item.type} /></span>
      <div className={styles.body}>
        {item.title && <p className={styles.title}>{item.title}</p>}
        <p className={styles.message}>{item.message}</p>
        {item.action && (
          <button type="button" className={styles.action} onClick={() => { item.action.onClick?.(); close(); }}>
            {item.action.label}
          </button>
        )}
      </div>
      <button type="button" className={styles.close} onClick={close} aria-label={words.dismiss}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" /></svg>
      </button>
      {Number.isFinite(life) && (
        <span key={`${item.type}-${item.message}`} className={styles.timer} data-paused={paused ? '' : undefined} aria-hidden="true" />
      )}
    </div>
  );
};

// Put this once near the top of the app. Then call toast.success('Saved') anywhere.
export function ToastProvider({ children }) {
  const words = useCopy('a11y');
  const [list, setList] = useState([]);

  useEffect(() => {
    const handle = ({ op, toast: t, id, patch }) => {
      if (op === 'show') {
        if (!TYPES.includes(t.type) || !t.message) return;
        setList(prev => [...prev.filter(x => x.id !== t.id), t].slice(-MAX_VISIBLE));
      }
      if (op === 'update') setList(prev => prev.map(x => (x.id === id ? { ...x, ...patch, duration: patch.duration } : x)));
      if (op === 'dismiss') setList(prev => prev.map(x => (id === undefined || x.id === id ? { ...x, closing: true } : x)));
    };
    listeners.add(handle);
    queued.forEach(handle);
    queued = [];
    return () => listeners.delete(handle);
  }, []);

  const remove = useCallback((id) => setList(prev => prev.filter(x => x.id !== id)), []);
  const value = useMemo(() => ({ toast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' && createPortal(
        <section className={styles.dock} aria-live="polite" aria-label={words.notifications}>
          {list.map((t, i) => <ToastItem key={t.id} item={t} index={list.length - 1 - i} onDone={remove} />)}
        </section>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

export default ToastProvider;

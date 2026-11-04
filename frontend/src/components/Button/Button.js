import { forwardRef, useLayoutEffect, useRef } from 'react';
import useAsyncAction from '../../hooks/useAsyncAction';
import { useCopy } from '../../content/copy/store';
import styles from './Button.module.css';

const Check = () => (
  <svg className={styles.check} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
    <path d="M5 12.5 10 17.5 19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Cross = () => (
  <svg className={styles.cross} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
    <path d="M7 7l10 10M17 7 7 17" strokeLinecap="round" />
  </svg>
);

const Arrow = () => (
  <svg className={styles.arrow} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Leaves a ring where the button was pressed.
const ripple = (e) => {
  const el = e.currentTarget;
  if (document.documentElement.dataset.noAnimations === 'true') return;
  const r = el.getBoundingClientRect();
  const dot = document.createElement('span');
  dot.className = styles.ripple;
  dot.style.left = `${e.clientX - r.left}px`;
  dot.style.top = `${e.clientY - r.top}px`;
  el.appendChild(dot);
  dot.addEventListener('animationend', () => dot.remove(), { once: true });
};

const noop = () => {};

// Give it an async action and it shows its own spinner, tick or shake.
const Button = forwardRef(({
  as: Tag = 'button',
  variant = 'glass',
  tone,
  size = 'md',
  full = false,
  arrow = false,
  icon = null,
  status: statusProp,
  action,
  morph = true,
  className = '',
  children,
  onPointerDown,
  onClick,
  disabled,
  ...rest
}, outerRef) => {
  const words = useCopy('a11y');
  const auto = useAsyncAction(action ?? noop);
  const status = statusProp ?? auto.status;
  const own = useRef(null);
  const width = useRef(0);
  const setRef = (node) => {
    own.current = node;
    if (typeof outerRef === 'function') outerRef(node);
    else if (outerRef) outerRef.current = node;
  };

  // Shrinks into a circle while busy, then grows back to its own width.
  useLayoutEffect(() => {
    const el = own.current;
    if (!el || !morph) return undefined;
    if (status === 'idle') {
      if (!width.current) return undefined;
      const natural = (() => { el.style.width = ''; const w = el.offsetWidth; el.style.width = `${el.offsetHeight}px`; return w; })();
      void el.offsetWidth;
      el.style.width = `${natural}px`;
      const done = () => { el.style.width = ''; width.current = 0; };
      const t = setTimeout(done, 450);
      return () => clearTimeout(t);
    }
    if (!width.current) {
      width.current = el.offsetWidth;
      el.style.width = `${width.current}px`;
      void el.offsetWidth;
    }
    el.style.width = `${el.offsetHeight}px`;
    return undefined;
  }, [status, morph]);

  const busy = status !== 'idle';
  const isButton = Tag === 'button';

  return (
    <Tag
      ref={setRef}
      className={[styles.btn, styles[variant], styles[size], full && styles.full, className].filter(Boolean).join(' ')}
      data-tone={tone}
      data-status={busy ? status : undefined}
      aria-busy={status === 'loading' || undefined}
      disabled={isButton ? disabled || status === 'loading' : undefined}
      aria-disabled={!isButton && disabled ? true : undefined}
      onPointerDown={(e) => { ripple(e); onPointerDown?.(e); }}
      onClick={action ? (e) => { onClick?.(e); auto.run(e); } : onClick}
      {...(isButton && !rest.type ? { type: 'button' } : null)}
      {...rest}
    >
      <span className={styles.face}>
        {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
        <span className={styles.label}>{children}</span>
        {arrow && <Arrow />}
      </span>
      <span className={styles.state} aria-hidden="true">
        {status === 'loading' && <span className="spinner" />}
        {status === 'success' && <Check />}
        {status === 'error' && <Cross />}
      </span>
      {busy && <span className="sr-only" role="status">{{ loading: words.working, success: words.done, error: words.failed }[status]}</span>}
    </Tag>
  );
});

Button.displayName = 'Button';

export default Button;

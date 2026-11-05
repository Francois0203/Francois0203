import { useEffect, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

const STORAGE_KEY = 'userSessionInfo';
const THEME_FIELD = 'prefersColorScheme';
// Set only when the visitor presses the theme button. Without it, the device decides.
const CHOSEN_FIELD = 'themeChosen';

const readInfo = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const deviceTheme = () =>
  (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const getInitialTheme = () => {
  const info = readInfo();
  if (info[CHOSEN_FIELD] && (info[THEME_FIELD] === 'dark' || info[THEME_FIELD] === 'light')) {
    return info[THEME_FIELD];
  }
  return deviceTheme();
};

// The theme lives outside React, so a switch re-renders only the switch, not the whole site.
let current = typeof window === 'undefined' ? 'light' : getInitialTheme();
const listeners = new Set();
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const read = () => current;

const apply = (next) => {
  current = next;
  document.documentElement.setAttribute('data-theme', next);
  listeners.forEach(fn => fn());
};

const SPREAD_MS = 750;
const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';
let switching = false;

// The new theme grows out of the origin as one circle. Nothing else is added to the transition:
// a second snapshot or a page-wide style rule is what made earlier versions stutter.
const spread = (swap, origin) => {
  const root = document.documentElement;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const x = origin?.x ?? w - 40;
  const y = origin?.y ?? 40;
  const r = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));

  switching = true;
  const transition = document.startViewTransition(() => {
    // Colours swap at once instead of easing. The flag stays until the new state is captured.
    root.dataset.themeSwap = '';
    swap();
  });
  const unflag = () => { delete root.dataset.themeSwap; };

  transition.ready.then(() => {
    unflag();
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: SPREAD_MS, easing: EASE, pseudoElement: '::view-transition-new(root)' },
    );
  }).catch(() => {});

  transition.finished.finally(() => { unflag(); switching = false; });
};

const setTheme = (next) => {
  if (next !== current) apply(next);
};

// origin is the point the new theme spreads from, usually the switch that was pressed.
const toggleTheme = (origin) => {
  const next = current === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readInfo(), [THEME_FIELD]: next, [CHOSEN_FIELD]: true }));
  } catch {
    // Storage unavailable: the theme still changes for this visit.
  }
  const root = document.documentElement;
  const swap = () => flushSync(() => apply(next));
  const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || root.dataset.noAnimations === 'true';
  if (!document.startViewTransition || calm || switching) { swap(); return; }
  spread(swap, origin);
};

// Once, at the top of the app: applies the theme and follows the device until the visitor picks one.
export const useThemeSetup = () => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', current);
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const onChange = (e) => {
      if (!readInfo()[CHOSEN_FIELD]) setTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
};

// For the components that show the theme. Only these re-render when it changes.
export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, read, read);
  return { theme, toggleTheme, setTheme };
};

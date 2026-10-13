import { useState, useEffect } from 'react';

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

export const useTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Follow the device while the visitor has not picked a theme themselves.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const onChange = (e) => {
      if (!readInfo()[CHOSEN_FIELD]) setTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readInfo(), [THEME_FIELD]: next, [CHOSEN_FIELD]: true }));
    } catch {
      // Storage unavailable: the theme still changes for this visit.
    }
    setTheme(next);
  };

  return { theme, toggleTheme, setTheme };
};

import { useState, useEffect } from 'react';

/* ============================================================================
 * THEME HOOK
 * ============================================================================
 * Reads theme from localStorage (userSessionInfo.prefersColorScheme).
 * Falls back to the OS preference if no stored value exists.
 * Applies data-theme attribute to <html> and persists the choice.
 * ============================================================================
 */

const STORAGE_KEY = 'userSessionInfo';
const THEME_FIELD = 'prefersColorScheme';

export const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed[THEME_FIELD] === 'dark' || parsed[THEME_FIELD] === 'light') {
        return parsed[THEME_FIELD];
      }
    }
  } catch {
    // corrupted storage — fall through to system preference
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  /* Apply theme to DOM and persist */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const info = stored ? JSON.parse(stored) : {};
      info[THEME_FIELD] = theme;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch {
      // storage unavailable — DOM attribute is still updated
    }
  }, [theme]);

  /* Mirror OS preference changes when user has no stored preference */
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;

    const handleChange = (e) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const info = stored ? JSON.parse(stored) : {};
        // Only auto-switch if the user has never explicitly chosen
        if (!info[THEME_FIELD]) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      } catch {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme, setTheme };
};

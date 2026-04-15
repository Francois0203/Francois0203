import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import styles from './ThemeSwitch.module.css';

// ─── COMPONENT ────────────────────────────────────────────────────────────────
// Glassmorphism light/dark toggle. Sliding thumb carries the active mode icon.
// Light: thumb (sun) left, moon right. Dark: thumb (moon) right, sun left.

const ThemeSwitch = ({ theme, toggleTheme }) => {
  const isDark = theme === 'dark';

  // Space / Enter activate like a native button
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`${styles.track} ${isDark ? styles.checked : ''}`}
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
    >
      <span className={`${styles.bgIcon} ${styles.bgIconLeft}`} aria-hidden="true">
        <FaSun />
      </span>
      <span className={`${styles.bgIcon} ${styles.bgIconRight}`} aria-hidden="true">
        <FaMoon />
      </span>
      <span className={styles.thumb} aria-hidden="true">
        <span className={styles.thumbIcon}>
          {isDark ? <FaMoon /> : <FaSun />}
        </span>
      </span>
    </button>
  );
};

export default ThemeSwitch;
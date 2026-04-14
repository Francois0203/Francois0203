import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import styles from './ThemeSwitch.module.css';

/* ============================================================================
 * THEME SWITCH COMPONENT
 * ============================================================================
 * Premium glassmorphism toggle for switching between light and dark themes.
 *
 * Light mode → thumb (sun) on the left,  moon icon shown in the right track area.
 * Dark mode  → thumb (moon) on the right, sun icon shown in the left track area.
 *
 * Props:
 *   theme        {string}    'light' | 'dark'
 *   toggleTheme  {function}  Callback to toggle the theme
 * ============================================================================
 */

const ThemeSwitch = ({ theme, toggleTheme }) => {
  const isDark = theme === 'dark';

  /* Allow Space / Enter to activate like a native button */
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
      {/* Background icon: sun — fades in on the left when dark mode is active */}
      <span className={`${styles.bgIcon} ${styles.bgIconLeft}`} aria-hidden="true">
        <FaSun />
      </span>

      {/* Background icon: moon — fades in on the right when light mode is active */}
      <span className={`${styles.bgIcon} ${styles.bgIconRight}`} aria-hidden="true">
        <FaMoon />
      </span>

      {/* Sliding thumb — shows the icon for the current active mode */}
      <span className={styles.thumb} aria-hidden="true">
        <span className={styles.thumbIcon}>
          {isDark ? <FaMoon /> : <FaSun />}
        </span>
      </span>
    </button>
  );
};

export default ThemeSwitch;
import React, { useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

/* Styling */
import styles from './ThemeSwitch.module.css';
import '../../styles/Theme.css';

/* ============================================================================
 * THEME SWITCH COMPONENT
 * ============================================================================
 * Toggle button for switching between light and dark themes
 * Features animated icon transitions
 * ============================================================================
 */

const ThemeSwitch = ({ theme, toggleTheme }) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [isPressed, setIsPressed] = useState(false);

  // ========================================
  // EVENT HANDLERS
  // ========================================
  const handlePointerDown = () => setIsPressed(true);
  const handlePointerUp = () => setIsPressed(false);

  // ========================================
  // RENDER
  // ========================================
  return (
    <button
      className={`${styles.themeSwitch} ${isPressed ? styles.pressed : ''}`}
      onClick={toggleTheme}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      aria-label="Toggle theme"
      type="button"
    >
      <span className={styles.icon} aria-hidden="true">
        {theme === 'dark' ? <FaSun /> : <FaMoon />}
      </span>
    </button>
  );
};

export default ThemeSwitch;